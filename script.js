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
