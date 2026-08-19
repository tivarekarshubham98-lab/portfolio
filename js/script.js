(() => {
    "use strict";

    const root = document.documentElement;
    const prefersReducedMotion = () =>
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    root.classList.add("is-animating");

    const nav = document.querySelector("[data-nav]");
    const toggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelectorAll(".nav-links a");

    /* ---------- NAV TOGGLE ---------- */
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

    /* ---------- PAGE LOADER ---------- */
    const initPageLoader = () => {
        const preloader = document.querySelector("[data-preloader]");
        const heroReveals = [...document.querySelectorAll(".hero .reveal")];

        const revealHero = () => {
            heroReveals.forEach((el) => {
                el.classList.add("is-visible");
                window.setTimeout(() => el.classList.add("is-done"), 1300);
            });
        };

        if (prefersReducedMotion()) {
            if (preloader) preloader.remove();
            root.classList.remove("is-loading");
            root.classList.add("is-loaded");
            revealHero();
            return;
        }

        root.classList.add("is-loading");

        if (!preloader) {
            root.classList.add("is-loaded");
            revealHero();
            return;
        }

        const start = performance.now();
        requestAnimationFrame(() => preloader.classList.add("is-active"));
        let finished = false;

        const finish = () => {
            if (finished) return;
            const wait = Math.max(0, 800 - (performance.now() - start));
            window.setTimeout(() => {
                finished = true;
                preloader.classList.add("is-hidden");
                root.classList.remove("is-loading");
                root.classList.add("is-loaded");
                revealHero();
                window.setTimeout(() => preloader.remove(), 700);
            }, wait);
        };

        if (document.readyState === "complete") {
            window.setTimeout(finish, 300);
        } else {
            window.addEventListener("load", finish, { once: true });
        }
        window.setTimeout(finish, 2500);
    };

    /* ---------- SMOOTH SCROLL ---------- */
    const initSmoothScroll = () => {
        const cvStage = document.querySelector(".cv-stage");
        if (cvStage) cvStage.setAttribute("data-lenis-prevent", "");

        const headerOffset = () => {
            const header = document.querySelector(".site-header");
            return (header ? header.offsetHeight : 74) + 16;
        };

        const scrollToTarget = (hash) => {
            if (hash === "#top") {
                if (typeof window.lenis !== "undefined" && !prefersReducedMotion()) {
                    window.lenis.scrollTo(0, { duration: 1.15 });
                } else {
                    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
                }
                return;
            }

            const target = document.querySelector(hash);
            if (!target) return;

            if (typeof window.lenis !== "undefined" && !prefersReducedMotion()) {
                const y = Math.round(target.getBoundingClientRect().top + window.scrollY) - headerOffset();
                window.lenis.scrollTo(y, { duration: 1.15 });
            } else if (target.scrollIntoView) {
                target.scrollIntoView({
                    behavior: prefersReducedMotion() ? "auto" : "smooth",
                    block: "start"
                });
            }
        };

        document.addEventListener("click", (event) => {
            const link = event.target.closest('a[href^="#"]');
            if (!link) return;
            const hash = link.getAttribute("href");
            if (hash.length < 2) return;
            event.preventDefault();
            scrollToTarget(hash);
            if (history.replaceState) history.replaceState(null, "", hash);
        });

        window.addEventListener("hashchange", () => {
            scrollToTarget(window.location.hash);
        });

        if (typeof window.Lenis === "undefined" || prefersReducedMotion()) return;

        const lenis = new window.Lenis({
            lerp: 0.09,
            wheelMultiplier: 1,
            smoothWheel: true
        });
        window.lenis = lenis;

        const raf = (time) => {
            lenis.raf(time);
            requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
    };

    /* ---------- SCROLL REVEAL ---------- */
    const initScrollReveal = () => {
        const items = [...document.querySelectorAll(".reveal")]
            .filter((el) => !el.closest(".hero"));

        if (!("IntersectionObserver" in window)) {
            items.forEach((el) => el.classList.add("is-visible", "is-done"));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                el.classList.add("is-visible");
                window.setTimeout(() => el.classList.add("is-done"), 1200);
                observer.unobserve(el);
            });
        }, {
            threshold: 0.15,
            rootMargin: "0px 0px -8% 0px"
        });

        items.forEach((el) => observer.observe(el));
    };

    /* ---------- SUBTLE PARALLAX ---------- */
    const initParallax = () => {
        const visual = document.querySelector(".hero-visual");
        const hero = document.querySelector(".hero");
        if (!visual || !hero) return;
        if (prefersReducedMotion()) return;
        if (window.matchMedia("(max-width: 768px)").matches) return;
        if (!("translate" in visual.style)) return;

        let ticking = false;

        const update = () => {
            ticking = false;
            const rect = hero.getBoundingClientRect();
            const progress = Math.min(Math.max(rect.bottom / window.innerHeight, 0), 1);
            const y = Math.round((progress - 1) * 18);
            visual.style.translate = `0 ${y}px`;
        };

        window.addEventListener("scroll", () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        }, { passive: true });

        update();
    };

    /* ---------- ACTIVE NAVIGATION ---------- */
    const initActiveNavigation = () => {
        const sections = [...document.querySelectorAll("main section[id], header[id], footer[id]")];

        const setActiveLink = () => {
            const atBottom =
                window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

            const currentY = window.scrollY + 120;
            let activeId = "top";

            sections.forEach((section) => {
                if (section.offsetTop <= currentY) activeId = section.id;
            });

            if (atBottom) activeId = sections[sections.length - 1].id;

            navLinks.forEach((link) => {
                link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
            });
        };

        let ticking = false;

        window.addEventListener("scroll", () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(() => {
                    ticking = false;
                    setActiveLink();
                });
            }
        }, { passive: true });

        setActiveLink();
    };

    /* ---------- FORMS ---------- */
    const contactForm = document.querySelector("[data-contact-form]");

    if (contactForm) {
        const submitButton = contactForm.querySelector(".contact-submit");
        const statusText = contactForm.querySelector(".contact-submit-status");
        const note = contactForm.querySelector("[data-contact-note]");
        let resetTimer;

        const setFormState = (state, message = "") => {
            if (!submitButton) return;
            window.clearTimeout(resetTimer);
            submitButton.classList.remove("is-sending", "is-sent", "is-error");
            if (note) {
                note.textContent = message;
                note.classList.toggle("is-visible", Boolean(message));
                note.classList.toggle("is-error", state === "error");
            }

            if (state === "sending") {
                submitButton.disabled = true;
                submitButton.classList.add("is-sending");
                if (statusText) statusText.textContent = "Sending...";
                return;
            }

            if (state === "sent") {
                submitButton.disabled = true;
                submitButton.classList.add("is-sent");
                if (statusText) statusText.textContent = "Enquiry sent";
                resetTimer = window.setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.classList.remove("is-sent");
                    if (note) note.classList.remove("is-visible");
                }, 3200);
                return;
            }

            if (state === "error") {
                submitButton.disabled = false;
                submitButton.classList.add("is-error");
                if (statusText) statusText.textContent = "Try again";
                resetTimer = window.setTimeout(() => {
                    submitButton.classList.remove("is-error");
                    if (note) note.classList.remove("is-visible", "is-error");
                }, 3600);
                return;
            }

            submitButton.disabled = false;
        };

        contactForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (!contactForm.reportValidity()) return;

            setFormState("sending");

            try {
                const formData = new FormData(contactForm);
                const payload = Object.fromEntries(formData.entries());
                const visitorEmail = payload.email || "";
                const senderName = payload.company || payload.name || "Portfolio Visitor";
                payload._replyto = visitorEmail;
                payload._subject = `New Job Enquiry - ${senderName}`;
                delete payload.email;
                const response = await fetch(contactForm.action, {
                    method: "POST",
                    body: JSON.stringify(payload),
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json"
                    }
                });

                if (!response.ok) throw new Error("Message could not be sent.");

                contactForm.reset();
                setFormState("sent", "Thanks! Your enquiry has been sent successfully.");
            } catch (error) {
                setFormState("error", "Message failed to send. Please try again or email me directly.");
            }
        });
    }

    /* ---------- PROJECTS VIEW ALL ---------- */
    const initProjectsViewAll = () => {
        const grid = document.querySelector(".project-grid");
        const link = document.querySelector('#projects .section-heading a.text-link[href="#projects"]');
        const refresh = document.querySelector("#projects .project-refresh");
        if (!grid || !link) return;

        const extras = [...grid.querySelectorAll(".project-card.project-extra")];
        const KEY = "portfolio-projects-view-all";

        const revealExtras = () => {
            extras.forEach((card) => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        card.classList.add("is-visible");
                        window.setTimeout(() => card.classList.add("is-done"), 1600);
                    });
                });
            });
        };

        const expand = () => {
            try {
                localStorage.setItem(KEY, "1");
            } catch (err) { /* ignore */ }
            grid.classList.add("is-expanded");
            link.style.display = "none";
            if (refresh) refresh.style.display = "inline-flex";
            revealExtras();
        };

        const collapse = () => {
            try {
                localStorage.removeItem(KEY);
            } catch (err) { /* ignore */ }
            grid.classList.add("is-collapsing");
            grid.style.rowGap = "0px";
            extras.forEach((card) => {
                card.classList.remove("is-visible", "is-done");
                card.classList.add("is-collapsing");
            });
            window.setTimeout(() => {
                grid.classList.remove("is-expanded", "is-collapsing");
                grid.style.rowGap = "";
                link.style.display = "";
                if (refresh) refresh.style.display = "none";
                extras.forEach((card) => card.classList.remove("is-collapsing"));
            }, 850);
        };

        link.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            expand();
        });

        if (refresh) {
            refresh.addEventListener("click", () => {
                collapse();
            });
        }

        try {
            if (localStorage.getItem(KEY) === "1") {
                grid.classList.add("is-expanded");
                link.style.display = "none";
                extras.forEach((card) => card.classList.add("is-done", "is-visible"));
                if (refresh) refresh.style.display = "inline-flex";
                return;
            }
        } catch (err) { /* ignore */ }
    };

    /* ---------- CV MODAL ---------- */
    (() => {
        const modal = document.getElementById("cv-modal");
        const backdrop = document.getElementById("cv-backdrop");
        const preview = modal.querySelector("[data-cv-preview]");
        const cvContainer = modal.querySelector("[data-cv-preview-container]");
        const cvLoading = modal.querySelector(".cv-loading");
        const cvError = modal.querySelector(".cv-error");
        const trigger = document.querySelector("[data-cv-trigger]");
        const reviewBtn = modal.querySelector("[data-cv-review]");
        const closeBtn = modal.querySelector("[data-cv-close]");
        const downloadBtn = modal.querySelector("[data-cv-download]");

        const FOCUSABLE = "button, [href], [tabindex]:not([tabindex=\"-1\"]), iframe";
        let lastFocused = null;
        let expanded = false;
        let cvRendered = false;
        let cvRenderPromise = null;

        const renderCV = () => {
            if (cvRendered || !cvContainer) return Promise.resolve();
            if (cvRenderPromise) return cvRenderPromise;

            cvRenderPromise = (async () => {
                try {
                    const loadScript = (src) =>
                        new Promise((resolve, reject) => {
                            const s = document.createElement("script");
                            s.src = src;
                            s.onload = resolve;
                            s.onerror = () => reject(new Error(`Failed to load ${src}`));
                            document.head.appendChild(s);
                        });

                    if (typeof window.pdfjsLib === "undefined") {
                        await loadScript("js/pdf.min.js");
                    }
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "js/pdf.worker.min.js";

                    const pdfData = window.CV_PDF_BASE64
                        ? Uint8Array.from(atob(window.CV_PDF_BASE64), (c) => c.charCodeAt(0))
                        : "cv.pdf";
                    const pdf = await window.pdfjsLib.getDocument({ data: pdfData }).promise;
                    const maxWidth = Math.min(cvContainer.clientWidth || 900, 900);
                    const dpr = window.devicePixelRatio || 1;

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const base = page.getViewport({ scale: 1 });
                        const scale = Math.max((maxWidth / base.width) * dpr, 1.5);
                        const viewport = page.getViewport({ scale });
                        const canvas = document.createElement("canvas");
                        canvas.className = "cv-page";
                        canvas.width = Math.floor(viewport.width);
                        canvas.height = Math.floor(viewport.height);
                        canvas.setAttribute("aria-hidden", "true");
                        cvContainer.appendChild(canvas);
                        const context = canvas.getContext("2d");
                        await page.render({ canvasContext: context, viewport }).promise;
                    }

                    cvRendered = true;
                    if (cvLoading) cvLoading.classList.add("is-hidden");
                } catch (err) {
                    if (cvLoading) cvLoading.classList.add("is-hidden");
                    if (cvError) cvError.classList.add("is-visible");
                }
            })();

            return cvRenderPromise;
        };

        const lockScroll = () => {
            document.documentElement.classList.add("cv-locked");
            document.body.classList.add("cv-locked");
            if (window.lenis) window.lenis.stop();
        };

        const unlockScroll = () => {
            document.documentElement.classList.remove("cv-locked");
            document.body.classList.remove("cv-locked");
            if (window.lenis) window.lenis.start();
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
            renderCV();
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

            if (!downloadBtn.classList.contains("is-success")) {
                downloadBtn.classList.add("is-success");
                window.setTimeout(() => {
                    downloadBtn.classList.remove("is-success");
                }, 2800);
            }
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

    /* ---------- LOCATION AUTO-FILL (OPENSTREETMAP NOMINATIM) ---------- */
    const initLocationAutofill = () => {
        const locationInput = document.getElementById("location");
        if (!locationInput) return;

        let list = null;
        let debounceTimer = null;
        let controller = null;
        let selectedIndex = -1;
        let items = [];

        const showList = () => {
            if (!list) {
                list = document.createElement("ul");
                list.className = "location-suggest";
                list.setAttribute("role", "listbox");
                locationInput.insertAdjacentElement("afterend", list);
            }
            list.classList.add("is-open");
        };

        const hideList = () => {
            if (list) {
                list.classList.remove("is-open");
                list.innerHTML = "";
            }
            selectedIndex = -1;
            items = [];
        };

        const choose = (index) => {
            const item = items[index];
            if (!item) return;
            locationInput.value = item.display_name;
            hideList();
            locationInput.focus();
        };

        const renderItems = () => {
            if (!list) return;
            list.innerHTML = "";
            items.forEach((item, i) => {
                const li = document.createElement("li");
                li.setAttribute("role", "option");
                li.setAttribute("aria-selected", String(i === selectedIndex));
                li.textContent = item.display_name;
                li.addEventListener("click", () => choose(i));
                if (i === selectedIndex) li.classList.add("is-active");
                list.appendChild(li);
            });
        };

        const fetchSuggestions = async (query) => {
            if (controller) controller.abort();
            controller = new AbortController();

            const url = `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(query)}`;
            try {
                const response = await fetch(url, {
                    headers: { "Accept-Language": "en" },
                    signal: controller.signal,
                });
                if (!response.ok) throw new Error("Request failed");
                const data = await response.json();
                items = data.map((d) => ({
                    display_name: d.display_name.replace(/, /g, ", "),
                }));
                renderItems();
                showList();
                if (!items.length) hideList();
            } catch (error) {
                if (error.name !== "AbortError") hideList();
            }
        };

        locationInput.addEventListener("input", () => {
            const value = locationInput.value.trim();
            clearTimeout(debounceTimer);
            if (value.length < 3) {
                hideList();
                return;
            }
            debounceTimer = setTimeout(() => fetchSuggestions(value), 350);
        });

        locationInput.addEventListener("keydown", (event) => {
            if (!list || !list.classList.contains("is-open") || !items.length) return;

            if (event.key === "ArrowDown") {
                event.preventDefault();
                selectedIndex = (selectedIndex + 1) % items.length;
                renderItems();
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                renderItems();
            } else if (event.key === "Enter") {
                if (selectedIndex >= 0) {
                    event.preventDefault();
                    choose(selectedIndex);
                }
            } else if (event.key === "Escape") {
                hideList();
            }
        });

        locationInput.addEventListener("blur", () => {
            window.setTimeout(hideList, 150);
        });
    };

    /* ---------- BOOT ---------- */
    initPageLoader();
    initSmoothScroll();
    initScrollReveal();
    initParallax();
    initActiveNavigation();
    initProjectsViewAll();
    initLocationAutofill();
})();
