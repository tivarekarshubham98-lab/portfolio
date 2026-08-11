const nav = document.querySelector("[data-nav]");
const toggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const sections = [...document.querySelectorAll("main section[id], header[id]")];
const revealItems = document.querySelectorAll(".reveal");

if (toggle && nav) {
    toggle.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
        toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            nav.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Open navigation");
        });
    });
}

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.16,
    rootMargin: "0px 0px -40px 0px"
});

revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 45, 240)}ms`;
    revealObserver.observe(item);
});

const setActiveLink = () => {
    const currentY = window.scrollY + 120;
    let activeId = "top";

    sections.forEach((section) => {
        if (section.offsetTop <= currentY) {
            activeId = section.id;
        }
    });

    navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
    });
};

window.addEventListener("scroll", setActiveLink, { passive: true });
setActiveLink();

document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const button = form.querySelector("button");
        if (!button) return;

        const originalHtml = button.dataset.originalHtml || button.innerHTML;
        button.dataset.originalHtml = originalHtml;
        const originalText = button.textContent.trim();
        button.disabled = true;
        button.textContent = originalText.includes("Send") ? "Message Sent" : "Subscribed";

        window.setTimeout(() => {
            button.disabled = false;
            button.innerHTML = originalHtml;
        }, 1800);
    });
});

(() => {
    const modal = document.getElementById("cv-modal");
    const backdrop = document.getElementById("cv-backdrop");
    const preview = modal.querySelector("[data-cv-preview]");
    const trigger = document.querySelector("[data-cv-trigger]");
    const reviewBtn = modal.querySelector("[data-cv-review]");
    const closeBtn = modal.querySelector("[data-cv-close]");
    const downloadBtn = modal.querySelector("[data-cv-download]");

    const FOCUSABLE = "button, [href], [tabindex]:not([tabindex=\"-1\"]), iframe";
    let lastFocused = null;
    let expanded = false;

    const lockScroll = () => {
        document.documentElement.classList.add("cv-locked");
        document.body.classList.add("cv-locked");
    };

    const unlockScroll = () => {
        document.documentElement.classList.remove("cv-locked");
        document.body.classList.remove("cv-locked");
    };

    const openStrip = () => {
        if (modal.classList.contains("is-open")) return;
        lastFocused = document.activeElement;
        lockScroll();
        modal.classList.add("is-open");
        backdrop.classList.add("is-open");
        const focusTarget = modal.querySelector(FOCUSABLE);
        if (focusTarget) focusTarget.focus();
    };

    const expand = () => {
        if (expanded) return;
        expanded = true;
        modal.setAttribute("aria-modal", "true");
        modal.classList.add("is-expanded");
        closeBtn.focus();
    };

    const collapse = () => {
        expanded = false;
        modal.setAttribute("aria-modal", "false");
        modal.classList.remove("is-expanded");
    };

    const close = () => {
        if (!modal.classList.contains("is-open")) return;
        if (expanded) collapse();
        modal.classList.remove("is-open");
        backdrop.classList.remove("is-open");
        window.setTimeout(unlockScroll, 40);
        window.setTimeout(() => {
            if (lastFocused && document.contains(lastFocused)) {
                lastFocused.focus();
            }
            lastFocused = null;
        }, 80);
    };

    const downloadCV = () => {
        const anchor = document.createElement("a");
        anchor.href = "cv.pdf";
        anchor.download = "Shubham_Tivarekar_CV.pdf";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    };

    trigger.addEventListener("click", openStrip);
    reviewBtn.addEventListener("click", expand);
    closeBtn.addEventListener("click", close);
    downloadBtn.addEventListener("click", downloadCV);
    backdrop.addEventListener("click", close);

    document.addEventListener("keydown", (event) => {
        if (!modal.classList.contains("is-open")) return;

        if (event.key === "Escape") {
            event.preventDefault();
            close();
            return;
        }

        if (event.key === "Tab") {
            const focusables = [...modal.querySelectorAll(FOCUSABLE)]
                .filter((el) => !el.disabled && el.offsetParent !== null)
                .filter((el) => modal.classList.contains("is-expanded") || !preview.contains(el));
            if (!focusables.length) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });
})();
