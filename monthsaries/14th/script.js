/* ==========================================================================
   CONFIGURATION
   Edit the arrays below to change images, music, chapters, without touching
   anything else in this file.
   ========================================================================== */

// Ten gallery images — updated to the renamed photo files for this monthsary.
const galleryImages = [
    { src: "images/photo1.jpg", caption: "Photograph 1" },
    { src: "images/photo2.jpg", caption: "Photograph 2" },
    { src: "images/photo3.jpg", caption: "Photograph 3" },
    { src: "images/photo4.jpg", caption: "Photograph 4" },
    { src: "images/photo5.jpg", caption: "Photograph 5" },
    { src: "images/photo6.jpg", caption: "Photograph 6" },
    { src: "images/photo7.jpg", caption: "Photograph 7" },
    { src: "images/photo8.jpg", caption: "Photograph 8" },
    { src: "images/photo9.jpg", caption: "Photograph 9" },
    { src: "images/photo10.jpg", caption: "Photograph 10" }
];

// Background music. Point this at your own file if you replace it —
// the audio stays in the project root, no extra folder needed.
const MUSIC_SRC = "music.mp3";

// 14 chapters — each chapter has a title and a short description.
const CHAPTERS_CONFIG = [
    { title: "You", description: "You" },
    { title: "Are", description: "Will" },
    { title: "My", description: "Always" },
    { title: "One", description: "Be" },
    { title: "And", description: "The" },
    { title: "Only", description: "Reason" },
    { title: "Loving", description: "Why" },
    { title: "Bubbi", description: "I" },
    { title: "Chachie", description: "Am" },
    { title: "Keep", description: "Constantly" },
    { title: "That", description: "Improving" },
    { title: "Smile", description: "Each" },
    { title: "Everyday", description: "Single" },
    { title: "I'm here for you", description: "Day." }
];

const chapterImages = Array.from({ length: CHAPTERS_CONFIG.length }, (_, i) => {
    const num = i + 1;
    return {
        src: `images/${num}.jpg`,
        caption: `Chapter ${num}`
    };
});

/* ==========================================================================
   NAVIGATION
   ========================================================================== */
const navBurger = document.getElementById("navBurger");
const mobileMenu = document.getElementById("mobileMenu");

function toggleMobileMenu(forceClose) {
    const open = forceClose ? false : !mobileMenu.classList.contains("open");
    mobileMenu.classList.toggle("open", open);
    navBurger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
}
navBurger.addEventListener("click", () => toggleMobileMenu());
document.querySelectorAll("[data-close]").forEach(el => {
    el.addEventListener("click", () => toggleMobileMenu(true));
});

// smooth scroll for in-page nav links
document.querySelectorAll('[data-scroll], .hero-scroll').forEach(el => {
    el.addEventListener("click", (e) => {
        const href = el.getAttribute("href");
        if (!href || !href.startsWith("#")) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top: y, behavior: "smooth" });
    });
});
document.querySelector(".hero-scroll")?.addEventListener("click", () => {
    const target = document.getElementById("the14th");
    if (target) window.scrollTo({ top: target.offsetTop - 70, behavior: "smooth" });
});

/* ==========================================================================
   MUSIC
   ========================================================================== */
const bgMusic = document.getElementById("bgMusic");
bgMusic.src = MUSIC_SRC;

const musicToggle = document.getElementById("musicToggle");
const musicToggleMobile = document.getElementById("musicToggleMobile");
const musicIcon = document.getElementById("musicIcon");
let isPlaying = false;

function setMusicState(playing) {
    isPlaying = playing;
    musicIcon.textContent = playing ? "❚❚" : "▶";
    musicToggle.setAttribute("aria-pressed", String(playing));
    musicToggle.querySelector(".nav-link-text").textContent = playing ? "Pause" : "Music";
    if (musicToggleMobile) musicToggleMobile.textContent = playing ? "❚❚ Pause" : "▶ Music";
}

async function toggleMusic() {
    try {
        if (isPlaying) {
            bgMusic.pause();
            setMusicState(false);
        } else {
            await bgMusic.play();
            setMusicState(true);
        }
    } catch (err) {
        // Autoplay or playback was blocked by the browser — fail quietly.
        setMusicState(false);
    }
}
musicToggle.addEventListener("click", toggleMusic);
musicToggleMobile?.addEventListener("click", toggleMusic);

/* ==========================================================================
   GSAP SETUP
   ========================================================================== */
gsap.registerPlugin(ScrollTrigger);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ==========================================================================
   PRELOADER + HERO ANIMATION
   ========================================================================== */
window.addEventListener("load", () => {
    const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => document.getElementById("preloader").style.pointerEvents = "none"
    });

    tl.to(".preloader-num", { opacity: 0, scale: 1.3, duration: .5, delay: .2 })
      .to("#preloader", { yPercent: -100, duration: .8, ease: "power4.inOut" }, "-=.15")
      .from(".hero-frame", { opacity: 0, duration: .8 }, "-=.6")
      .from(".hero-eyebrow", { opacity: 0, y: 14, duration: .6 }, "-=.5")
      .from(".hero-title-row .hero-num, .hero-title-row .hero-num-suffix", {
          yPercent: 110, opacity: 0, duration: .9, stagger: .08
      }, "-=.4")
      .from(".hero-title-row-2", { yPercent: 110, opacity: 0, duration: .9 }, "-=.6")
      .from(".hero-names", { opacity: 0, y: 12, duration: .6 }, "-=.4")
      .from(".hero-sub", { opacity: 0, y: 12, duration: .6 }, "-=.35")
      .from(".hero-line-1", { scaleY: 0, duration: 1, transformOrigin: "top" }, "-=.7")
      .from(".hero-line-2", { scaleX: 0, duration: 1, transformOrigin: "left" }, "-=.9")
      .from(".hero-scroll", { opacity: 0, duration: .6 }, "-=.3");
});

/* ==========================================================================
   SCROLLTRIGGER — generic reveals
   ========================================================================== */
gsap.utils.toArray('[data-anim="reveal"]').forEach((el) => {
    gsap.from(el, {
        opacity: 0,
        y: 36,
        duration: .9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" }
    });
});

// section headers
gsap.utils.toArray(".section-head").forEach((el) => {
    gsap.from(el, {
        opacity: 0,
        y: 30,
        duration: .9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" }
    });
});

// the 14th
gsap.from(".s14-giant", {
    opacity: 0,
    scale: .85,
    duration: 1.1,
    ease: "power3.out",
    scrollTrigger: { trigger: ".the-14th", start: "top 70%" }
});
gsap.from(".s14-left > *", {
    opacity: 0, y: 24, stagger: .1, duration: .8, ease: "power3.out",
    scrollTrigger: { trigger: ".s14-left", start: "top 80%" }
});

// chapters
gsap.from(".chapter-card", {
    opacity: 0, y: 24, duration: .7, stagger: .04, ease: "power2.out",
    scrollTrigger: { trigger: ".chapters-grid", start: "top 85%" }
});

// finale
gsap.utils.toArray('.finale [data-anim="fade"]').forEach((el, i) => {
    gsap.from(el, {
        opacity: 0, y: 20, duration: .9, ease: "power3.out",
        scrollTrigger: { trigger: ".finale", start: "top 60%" },
        delay: i * .12
    });
});

/* ==========================================================================
   PARALLAX
   ========================================================================== */
if (!prefersReducedMotion) {
    gsap.to(".hero-glow", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
    gsap.to(".hero-content", {
        yPercent: -12,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
    gsap.to(".s14-giant", {
        yPercent: -14,
        ease: "none",
        scrollTrigger: { trigger: ".the-14th", start: "top bottom", end: "bottom top", scrub: true }
    });
}

/* ==========================================================================
   GALLERY
   ========================================================================== */
const galleryGrid = document.getElementById("galleryGrid");

galleryImages.forEach((item, i) => {
    const num = String(i + 1).padStart(2, "0");
    const fig = document.createElement("figure");
    fig.className = "gallery-item";
    fig.setAttribute("data-index", i);
    fig.setAttribute("tabindex", "0");
    fig.setAttribute("role", "button");
    fig.setAttribute("aria-label", `Open photograph ${num}`);
    fig.innerHTML = `
        <img src="${item.src}" alt="${item.caption}" loading="lazy">
        <figcaption class="gallery-caption">
            <span class="gallery-num">${num}</span>
            <span class="gallery-tag">${item.caption}</span>
        </figcaption>
    `;
    galleryGrid.appendChild(fig);
});

gsap.utils.toArray(".gallery-item").forEach((el, i) => {
    gsap.from(el, {
        opacity: 0,
        y: 50,
        duration: .9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
    });
    if (!prefersReducedMotion) {
        gsap.to(el.querySelector("img"), {
            yPercent: (i % 2 === 0) ? -6 : 6,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true }
        });
    }
});

/* ==========================================================================
   CHAPTERS — render
   ========================================================================== */
const chaptersGrid = document.getElementById("chaptersGrid");
CHAPTERS_CONFIG.forEach((chapter, i) => {
    const num = String(i + 1).padStart(2, "0");
    const chapterImage = chapterImages[i] || chapterImages[chapterImages.length - 1];
    const card = document.createElement("div");
    card.className = "chapter-card";
    card.setAttribute("data-num", num);
    card.innerHTML = `
        <img class="chapter-image" src="${chapterImage.src}" alt="${chapterImage.caption}" loading="lazy">
        <span class="chapter-num">${num}</span>
        <span class="chapter-label">${chapter.title}</span>
        <span class="chapter-description">${chapter.description}</span>
    `;
    chaptersGrid.appendChild(card);
});

/* ==========================================================================
   CHAPTERS — pinned horizontal filmstrip (desktop only; mobile scrolls natively)
   ========================================================================== */
function initChaptersPin() {
    const pin = document.getElementById("chaptersPin");
    const track = chaptersGrid;
    if (!pin || !track) return;

    const isDesktop = window.innerWidth > 900;
    if (!isDesktop || prefersReducedMotion) {
        pin.style.height = "auto";
        gsap.set(track, { x: 0 });
        return;
    }

    const scrollDistance = () => Math.max(track.scrollWidth - window.innerWidth + 40, 0);

    const trigger = ScrollTrigger.create({
        trigger: pin,
        start: "top top+=84",
        end: () => "+=" + scrollDistance(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        animation: gsap.to(track, { x: () => -scrollDistance(), ease: "none" })
    });

    return trigger;
}
window.addEventListener("load", initChaptersPin);

/* ==========================================================================
   LIGHTBOX
   ========================================================================== */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");

function openLightbox(index) {
    const item = galleryImages[index];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.caption;
    lightboxCaption.textContent = `${String(index + 1).padStart(2, "0")} — ${item.caption}`;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}
function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}
galleryGrid.addEventListener("click", (e) => {
    const item = e.target.closest(".gallery-item");
    if (item) openLightbox(Number(item.dataset.index));
});
galleryGrid.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const item = e.target.closest(".gallery-item");
    if (item) { e.preventDefault(); openLightbox(Number(item.dataset.index)); }
});
lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

/* ==========================================================================
   INTERACTIONS — magnifying navbar
   ========================================================================== */
const navLinksEl = document.getElementById("navLinks");
const navLinkItems = Array.from(navLinksEl.querySelectorAll(".nav-link"));

if (!prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
    navLinkItems.forEach((link) => {
        link.addEventListener("mouseenter", () => {
            navLinkItems.forEach((other) => {
                if (other === link) {
                    gsap.to(other, { scale: 1.16, duration: .45, ease: "power3.out" });
                } else {
                    const distIndex = Math.abs(navLinkItems.indexOf(other) - navLinkItems.indexOf(link));
                    const target = distIndex === 1 ? 1.05 : 1;
                    gsap.to(other, { scale: target, duration: .45, ease: "power3.out" });
                }
            });
        });
    });
    navLinksEl.addEventListener("mouseleave", () => {
        gsap.to(navLinkItems, { scale: 1, duration: .5, ease: "power3.out" });
    });
} else {
    // touch-friendly fallback: brief tap emphasis instead of hover magnification
    navLinkItems.forEach((link) => {
        link.addEventListener("touchstart", () => {
            gsap.fromTo(link, { scale: 1 }, { scale: 1.08, duration: .2, yoyo: true, repeat: 1, ease: "power2.out" });
        }, { passive: true });
    });
}

/* ==========================================================================
   JOURNEY PROGRESS RAIL
   ========================================================================== */
const progressFill = document.getElementById("progressFill");
if (progressFill) {
    gsap.to(progressFill, {
        height: "100%",
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: true }
    });
}

/* ==========================================================================
   GALLERY — custom cursor (desktop, hover-capable only)
   ========================================================================== */
const cursorDot = document.getElementById("cursorDot");
if (cursorDot && !prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
    let cx = 0, cy = 0, dx = 0, dy = 0;
    window.addEventListener("mousemove", (e) => { cx = e.clientX; cy = e.clientY; });
    gsap.ticker.add(() => {
        dx += (cx - dx) * .18;
        dy += (cy - dy) * .18;
        gsap.set(cursorDot, { x: dx, y: dy });
    });
    galleryGrid.addEventListener("mouseenter", () => {
        document.body.classList.add("gallery-hovering");
    }, true);
    galleryGrid.addEventListener("mouseover", (e) => {
        if (e.target.closest(".gallery-item")) cursorDot.classList.add("active");
    });
    galleryGrid.addEventListener("mouseout", (e) => {
        if (e.target.closest(".gallery-item") && !e.relatedTarget?.closest(".gallery-item")) {
            cursorDot.classList.remove("active");
        }
    });
    galleryGrid.addEventListener("mouseleave", () => {
        cursorDot.classList.remove("active");
        document.body.classList.remove("gallery-hovering");
    });
}

/* ==========================================================================
   NAVBAR — background solidify on scroll
   ========================================================================== */
const navbarEl = document.getElementById("navbar");
ScrollTrigger.create({
    start: "top -60",
    end: 99999,
    toggleClass: { targets: navbarEl, className: "is-scrolled" }
});

/* ==========================================================================
   RESIZE / SETTLE — keep pinned and scrubbed distances accurate
   ========================================================================== */
window.addEventListener("load", () => setTimeout(() => ScrollTrigger.refresh(), 400));
let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
});
