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

    /* ---------- CV MODAL (PDF.js Canvas) ---------- */
    (() => {
        const modal = document.getElementById("cv-modal");
        const backdrop = document.getElementById("cv-backdrop");
        const preview = modal.querySelector("[data-cv-preview]");
        const cvLoading = modal.querySelector(".cv-loading");
        const cvError = modal.querySelector(".cv-error");
        const stage = modal.querySelector(".cv-stage");
        const trigger = document.querySelector("[data-cv-trigger]");
        const reviewBtn = modal.querySelector("[data-cv-review]");
        const closeBtn = modal.querySelector("[data-cv-close]");
        const downloadBtn = modal.querySelector("[data-cv-download]");

        const FOCUSABLE = "button, [href], [tabindex]:not([tabindex=\"-1\"])";
        let lastFocused = null;
        let expanded = false;
        let isRendering = false;
        let currentPdf = null;
        let renderTasks = [];
        let renderSerial = 0;

        const CV_PDF_URL = "images/Shubham_Tivarekar_Resume.pdf";
        const PDFJS_WORKER_URL = "images/pdf.worker.min.js";

        const showLoading = () => {
            if (cvLoading) {
                cvLoading.classList.remove("is-hidden");
                cvLoading.style.display = "";
            }
            if (cvError) {
                cvError.classList.remove("is-visible");
                cvError.style.display = "none";
            }
        };

        const showError = () => {
            if (cvLoading) {
                cvLoading.classList.add("is-hidden");
                cvLoading.style.display = "none";
            }
            if (cvError) {
                cvError.classList.add("is-visible");
                cvError.style.display = "";
            }
        };

        const showPreview = () => {
            if (cvLoading) {
                cvLoading.classList.add("is-hidden");
                cvLoading.style.display = "none";
            }
            if (cvError) {
                cvError.classList.remove("is-visible");
                cvError.style.display = "none";
            }
        };

        const clearPreviousRender = () => {
            renderSerial += 1;

            renderTasks.forEach((task) => {
                if (task && typeof task.cancel === "function") {
                    try { task.cancel(); } catch (_) {}
                }
            });
            renderTasks = [];

            if (stage) {
                stage.querySelectorAll("canvas.cv-page").forEach((canvas) => canvas.remove());
            }

            if (currentPdf) {
                try { currentPdf.destroy(); } catch (_) {}
                currentPdf = null;
            }

            isRendering = false;
        };

        const getStageWidth = () => {
            if (!stage) return 0;
            const styles = window.getComputedStyle(stage);
            const paddingX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
            return Math.max(0, Math.floor(stage.clientWidth - paddingX));
        };

        const base64ToUint8Array = (base64) => {
            const binary = window.atob(base64);
            const bytes = new Uint8Array(binary.length);

            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }

            return bytes;
        };

        const loadPdfData = async (pdfUrl) => {
            try {
                const response = await fetch(pdfUrl, { cache: "no-store" });
                if (!response.ok) {
                    throw new Error(`PDF request failed with status ${response.status}`);
                }
                return new Uint8Array(await response.arrayBuffer());
            } catch (fetchError) {
                if (typeof window.CV_PDF_BASE64 === "string" && window.CV_PDF_BASE64) {
                    console.warn("PDF URL fetch failed, using embedded PDF data:", fetchError);
                    return base64ToUint8Array(window.CV_PDF_BASE64);
                }

                throw fetchError;
            }
        };

        const renderCV = (pdfUrl = CV_PDF_URL) => {
            if (isRendering || !stage) return Promise.resolve();

            clearPreviousRender();
            const activeRenderSerial = renderSerial;
            isRendering = true;
            showLoading();

            return (async () => {
                try {
                    if (typeof window.pdfjsLib === "undefined") {
                        throw new Error("PDF.js library not available");
                    }

                    const pdfjsLib = window.pdfjsLib;
                    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;

                    const pdfData = await loadPdfData(pdfUrl);
                    const getPdfDocument = async (useWorker) => {
                        if (useWorker) {
                            pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
                        }

                        const loadingTask = pdfjsLib.getDocument({
                            data: pdfData.slice(),
                            disableAutoFetch: true,
                            disableStream: true,
                            disableWorker: !useWorker
                        });
                        return loadingTask.promise;
                    };

                    try {
                        currentPdf = await getPdfDocument(true);
                    } catch (workerError) {
                        console.warn("PDF worker failed, retrying without worker:", workerError);
                        currentPdf = await getPdfDocument(false);
                    }

                    const availableWidth = getStageWidth();
                    if (!availableWidth) {
                        throw new Error("CV stage has zero width");
                    }

                    const outputScale = Math.min(window.devicePixelRatio || 1, 2);
                    const numPages = currentPdf.numPages;
                    const fragment = document.createDocumentFragment();

                    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                        const page = await currentPdf.getPage(pageNum);
                        const unscaled = page.getViewport({ scale: 1 });

                        const scale = availableWidth / unscaled.width;
                        const viewport = page.getViewport({ scale });

                        const canvas = document.createElement("canvas");
                        canvas.className = "cv-page";
                        canvas.setAttribute("aria-hidden", "true");

                        canvas.width = Math.floor(viewport.width * outputScale);
                        canvas.height = Math.floor(viewport.height * outputScale);
                        canvas.style.width = Math.floor(viewport.width) + "px";
                        canvas.style.height = Math.floor(viewport.height) + "px";
                        canvas.style.display = "block";
                        canvas.style.margin = "0 auto";

                        if (pageNum < numPages) {
                            canvas.style.marginBottom = "16px";
                        }

                        const context = canvas.getContext("2d");
                        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

                        const renderTask = page.render({
                            canvasContext: context,
                            viewport: viewport,
                            transform: transform
                        });

                        renderTasks.push(renderTask);
                        await renderTask.promise;

                        if (activeRenderSerial !== renderSerial) return;
                        fragment.appendChild(canvas);
                    }

                    if (activeRenderSerial !== renderSerial) return;
                    stage.insertBefore(fragment, cvLoading || cvError || null);
                    stage.scrollTop = 0;
                    showPreview();

                } catch (err) {
                    if (activeRenderSerial !== renderSerial) return;
                    console.error("PDF render error:", err);
                    showError();
                } finally {
                    if (activeRenderSerial === renderSerial) {
                        isRendering = false;
                    }
                }
            })();
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

            // Render PDF after expand animation
            window.setTimeout(() => {
                renderCV();
            }, 600);

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

            // Clear PDF canvases when modal closes
            clearPreviousRender();

            window.setTimeout(unlockScroll, 40);
            window.setTimeout(() => {
                if (lastFocused && document.contains(lastFocused)) {
                    lastFocused.focus();
                }
                lastFocused = null;
            }, 80);
        };

        const downloadCV = async (event) => {
            if (event) event.preventDefault();

            const pdfData = await loadPdfData(CV_PDF_URL);
            const pdfBlob = new Blob([pdfData], { type: "application/pdf" });
            const downloadUrl = URL.createObjectURL(pdfBlob);
            const anchor = document.createElement("a");
            anchor.href = downloadUrl;
            anchor.download = "Shubham_Tivarekar_Resume.pdf";
            anchor.style.display = "none";
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);

            if (!downloadBtn.classList.contains("is-success")) {
                downloadBtn.classList.add("is-success");
                window.setTimeout(() => {
                    downloadBtn.classList.remove("is-success");
                }, 2800);
            }
        };

        // Event listeners
        if (trigger) trigger.addEventListener("click", openStrip);
        if (reviewBtn) reviewBtn.addEventListener("click", expand);
        if (closeBtn) closeBtn.addEventListener("click", close);
        if (downloadBtn) downloadBtn.addEventListener("click", downloadCV);
        if (backdrop) backdrop.addEventListener("click", close);

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

    /* ---------- BOOT ---------- */
    initPageLoader();
    initSmoothScroll();
    initScrollReveal();
    initParallax();
    initActiveNavigation();
})();
