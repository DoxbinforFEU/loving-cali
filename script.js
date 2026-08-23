/* =========================================================================
   MIKHAIL × CALI — 13TH – 24TH
   Archive hub behaviour. Vanilla JS + GSAP/ScrollTrigger (free plugins only).
   ========================================================================= */

(function () {
  "use strict";

  /* -----------------------------------------------------------------------
     00 — SINGLE SOURCE OF TRUTH
     ---------------------------------------------------------------------- */
  const monthsaries = [
    { number: "13TH", title: "THIRTEENTH", url: "./monthsaries/13th/" },
    { number: "14TH", title: "FOURTEENTH", url: "./monthsaries/14th/" },
    { number: "15TH", title: "FIFTEENTH", url: "./monthsaries/15th/" },
    { number: "16TH", title: "SIXTEENTH", url: "./monthsaries/16th/" },
    { number: "17TH", title: "SEVENTEENTH", url: "./monthsaries/17th/" },
    { number: "18TH", title: "EIGHTEENTH", url: "./monthsaries/18th/" },
    { number: "19TH", title: "NINETEENTH", url: "./monthsaries/19th/" },
    { number: "20TH", title: "TWENTIETH", url: "./monthsaries/20th/" },
    { number: "21ST", title: "TWENTY-FIRST", url: "./monthsaries/21st/" },
    { number: "22ND", title: "TWENTY-SECOND", url: "./monthsaries/22nd/" },
    { number: "23RD", title: "TWENTY-THIRD", url: "./monthsaries/23rd/" },
    { number: "Second Anniversary", title: "TWENTY-FOURTH", url: "./monthsaries/24th/" },
  ];

  const HAS_GSAP = typeof window.gsap !== "undefined";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;

  // Failsafe: whatever else happens, the loader must never stay on screen
  // blocking clicks for more than ~2.5s (covers a script error interrupting
  // the normal init chain below).
  const loaderFailsafe = setTimeout(() => {
    const loader = document.querySelector("[data-loader]");
    if (loader) loader.setAttribute("hidden", "");
  }, 2500);

  if (HAS_GSAP && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }
  if (prefersReducedMotion) {
    document.documentElement.classList.add("js-reduced-motion");
  }

  /* -----------------------------------------------------------------------
     Small text-splitting utility (no SplitText — free plugins only)

     Splits into per-character spans for a stagger reveal, while keeping
     each word glued together (so lines can only break BETWEEN words, never
     inside a number) and preserving any inline markup (e.g. <em>) already
     present so its styling still applies to the resulting characters.
     ---------------------------------------------------------------------- */
  function appendWordSpans(parent, text) {
    const words = text.split(" ");
    words.forEach((word, wi) => {
      if (word.length) {
        const wordSpan = document.createElement("span");
        wordSpan.className = "hero__word";
        word.split("").forEach((ch) => {
          const charSpan = document.createElement("span");
          charSpan.className = "hero__char";
          charSpan.textContent = ch;
          wordSpan.appendChild(charSpan);
        });
        parent.appendChild(wordSpan);
      }
      if (wi < words.length - 1) parent.appendChild(document.createTextNode(" "));
    });
  }

  function splitChars(el) {
    const fullText = el.textContent;
    el.setAttribute("aria-label", fullText);
    const nodes = Array.from(el.childNodes);
    el.textContent = "";
    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        appendWordSpans(el, node.textContent);
      } else {
        const wrapper = document.createElement(node.nodeName.toLowerCase());
        if (node.className) wrapper.className = node.className;
        appendWordSpans(wrapper, node.textContent);
        el.appendChild(wrapper);
      }
    });
    return el.querySelectorAll(".hero__char");
  }

  /* -----------------------------------------------------------------------
     01 — LOADER
     ---------------------------------------------------------------------- */
  function initLoader(onComplete) {
    const loader = document.querySelector("[data-loader]");
    if (!loader) return onComplete();

    const alreadyVisited = sessionStorage.getItem("archiveVisited") === "true";
    const shouldSkip = prefersReducedMotion || alreadyVisited || !HAS_GSAP;

    const finish = () => {
      clearTimeout(loaderFailsafe);
      sessionStorage.setItem("archiveVisited", "true");
      loader.setAttribute("hidden", "");
      onComplete();
    };

    if (shouldSkip) {
      finish();
      return;
    }

    const bar = loader.querySelector("[data-loader-bar]");
    const tl = gsap.timeline({ onComplete: () => {
      gsap.to(loader, {
        autoAlpha: 0,
        duration: 0.4,
        ease: "power1.out",
        onComplete: finish,
      });
    }});

    tl.set(bar, { width: "0%" });
    tl.to(bar, { width: "100%", duration: 1.3, ease: "power2.inOut" });
    // Hard cap: never let the loader exceed ~2s total.
    tl.duration(Math.min(tl.duration(), 1.6));
  }

  /* -----------------------------------------------------------------------
     02 — HERO ANIMATIONS
     ---------------------------------------------------------------------- */
  function initHeroAnimations() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) return;

    const eyebrow = hero.querySelector(".hero__eyebrow");
    const names = hero.querySelector(".hero__names");
    const rangeEl = hero.querySelector(".hero__range");
    const sub = hero.querySelector(".hero__sub");
    const vertical = hero.querySelector(".hero__vertical");
    const bleed = hero.querySelector(".hero__bleed");

    if (!HAS_GSAP) return;

    const chars = rangeEl ? splitChars(rangeEl) : [];

    if (prefersReducedMotion) {
      gsap.set([eyebrow, names, sub, vertical, bleed], { autoAlpha: 1 });
      gsap.set(chars, { autoAlpha: 1 });
      return;
    }

    gsap.set([eyebrow, names, sub, vertical], { autoAlpha: 0, y: 16 });
    gsap.set(chars, { autoAlpha: 0, y: 40 });
    gsap.set(bleed, { autoAlpha: 0 });

    const tl = gsap.timeline({ delay: 0.1, defaults: { ease: "power3.out" } });
    tl.to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.6 })
      .to(names, { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.4")
      .to(chars, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.02 }, "-=0.35")
      .to(sub, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.3")
      .to(vertical, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.5")
      .to(bleed, { autoAlpha: 1, duration: 1 }, "-=0.6");
  }

  /* -----------------------------------------------------------------------
     03 — CARD GRID (generated from the single source of truth)
     ---------------------------------------------------------------------- */
  function initCardGrid() {
    const grid = document.querySelector("[data-archive-grid]");
    if (!grid) return;

    const frag = document.createDocumentFragment();

    monthsaries.forEach((m, i) => {
      const card = document.createElement("a");
      card.className = "archive-card";
      card.href = m.url;
      card.setAttribute("data-card-index", String(i));
      card.setAttribute(
        "aria-label",
        `${m.title} monthsary — chapter ${String(i + 1).padStart(2, "0")} of 12`
      );

      const corner = document.createElement("span");
      corner.className = "archive-card__corner";
      corner.setAttribute("aria-hidden", "true");

      const imgWrap = document.createElement("span");
      imgWrap.className = "archive-card__img-wrap";
      const img = document.createElement("img");
      img.src = `./assets/images/${m.url.split("/").filter(Boolean).pop()}.svg`;
      img.alt = "";
      img.width = 800;
      img.height = 1000;
      img.loading = i === 0 ? "eager" : "lazy";
      if (i === 0) img.setAttribute("fetchpriority", "high");
      imgWrap.appendChild(img);

      const body = document.createElement("span");
      body.className = "archive-card__body";

      const number = document.createElement("span");
      number.className = "archive-card__number";
      number.textContent = m.number;

      const text = document.createElement("span");
      text.className = "archive-card__text";
      const label = document.createElement("span");
      label.className = "archive-card__label";
      label.textContent = `MEMORIES ${String(i + 1).padStart(2, "0")} / 12`;
      const title = document.createElement("span");
      title.className = "archive-card__title";
      title.textContent = m.title + " MONTH";
      text.appendChild(label);
      text.appendChild(title);

      body.appendChild(number);
      body.appendChild(text);

      card.appendChild(imgWrap);
      card.appendChild(corner);
      card.appendChild(body);

      frag.appendChild(card);
    });

    grid.appendChild(frag);
  }

  /* -----------------------------------------------------------------------
     04 — CARD HOVER (desktop only)
     ---------------------------------------------------------------------- */
  function initCardHover() {
    if (!HAS_GSAP) return;

    gsap.matchMedia().add("(hover: hover) and (pointer: fine)", () => {
      const cards = gsap.utils.toArray(".archive-card");
      cards.forEach((card) => {
        const number = card.querySelector(".archive-card__number");
        const text = card.querySelector(".archive-card__text");
        const enter = () => {
          gsap.to(card, { y: -6, scale: 1.015, duration: 0.45, ease: "power2.out" });
          gsap.to([number, text], { y: -3, duration: 0.45, ease: "power2.out" });
        };
        const leave = () => {
          gsap.to(card, { y: 0, scale: 1, duration: 0.45, ease: "power2.out" });
          gsap.to([number, text], { y: 0, duration: 0.45, ease: "power2.out" });
        };
        card.addEventListener("mouseenter", enter);
        card.addEventListener("mouseleave", leave);
      });

      return () => {
        cards.forEach((card) => gsap.set(card, { clearProps: "transform" }));
      };
    });
  }

  /* -----------------------------------------------------------------------
     05 — CARD TRANSITION (click -> sweep -> navigate)
     ---------------------------------------------------------------------- */
  function initCardTransition() {
    const sweep = document.querySelector("[data-sweep]");
    const sweepNum = sweep ? sweep.querySelector("[data-sweep-num]") : null;

    document.addEventListener("click", (e) => {
      const card = e.target.closest(".archive-card");
      if (!card) return;

      // New tab / modified click: let the browser handle it natively.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;

      // No GSAP or no sweep element available: fall back to plain navigation.
      if (!HAS_GSAP || !sweep) return;

      e.preventDefault();
      const href = card.getAttribute("href");
      const number = card.querySelector(".archive-card__number");
      const numberText = number ? number.textContent : "";

      const others = gsap.utils.toArray(".archive-card").filter((c) => c !== card);

      if (prefersReducedMotion) {
        window.location.href = href;
        return;
      }

      if (sweepNum) sweepNum.textContent = numberText;

      const tl = gsap.timeline({
        onComplete: () => { window.location.href = href; },
      });

      tl.to(card, { scale: 1.03, duration: 0.18, ease: "power2.out" }, 0)
        .to(others, { autoAlpha: 0.25, duration: 0.22, ease: "power2.out" }, 0)
        .set(sweep, { autoAlpha: 1 }, 0.1)
        .fromTo(sweep, { yPercent: 101 }, { yPercent: 0, duration: 0.42, ease: "power3.inOut" }, 0.1)
        .fromTo(sweepNum, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.28, ease: "power2.out" }, 0.32);
    });
  }

  /* -----------------------------------------------------------------------
     06 — SCROLL ANIMATIONS
     ---------------------------------------------------------------------- */
  function initScrollAnimations() {
    if (!HAS_GSAP || !window.ScrollTrigger) return;

    // Contour drift — background only, very slow, always on (cheap, 2 elements).
    gsap.utils.toArray("[data-contour]").forEach((svg, i) => {
      if (prefersReducedMotion) return;
      gsap.to(svg, {
        x: i % 2 === 0 ? 18 : -18,
        y: 12,
        duration: 14,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    });

    gsap.matchMedia().add(
      {
        isDesktop: "(min-width: 769px)",
        isMobile: "(max-width: 768px)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { isMobile, reduced } = context.conditions;

        // Card entrance — staggered by viewport batch, not the whole page at once.
        ScrollTrigger.batch(".archive-card", {
          start: "top 88%",
          onEnter: (batch) => {
            if (reduced) {
              gsap.set(batch, { autoAlpha: 1 });
              return;
            }
            gsap.fromTo(
              batch,
              { autoAlpha: 0, y: 36 },
              { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08 }
            );
          },
          once: true,
        });

        // Subtle image parallax on desktop only.
        if (!isMobile && !reduced) {
          gsap.utils.toArray(".archive-card__img-wrap img").forEach((img) => {
            gsap.to(img, {
              yPercent: 8,
              ease: "none",
              scrollTrigger: {
                trigger: img.closest(".archive-card"),
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
              },
            });
          });
        }

        // Archive progress indicator.
        const progress = document.querySelector("[data-progress]");
        const grid = document.querySelector("[data-archive-grid]");
        if (progress && grid) {
          ScrollTrigger.create({
            trigger: grid,
            start: "top 80%",
            end: "bottom 20%",
            onUpdate: (self) => {
              const idx = Math.min(11, Math.floor(self.progress * 12));
              progress.textContent = `${String(idx + 1).padStart(2, "0")} / 12`;
            },
          });
        }
      }
    );
  }

  /* -----------------------------------------------------------------------
     07 — CUSTOM CURSOR
     ---------------------------------------------------------------------- */
  function initCursor() {
    if (!HAS_GSAP || !isFinePointer || prefersReducedMotion) return;

    const cursor = document.querySelector("[data-cursor]");
    if (!cursor) return;

    const quickX = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3.out" });
    const quickY = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3.out" });

    window.addEventListener("mousemove", (e) => {
      quickX(e.clientX);
      quickY(e.clientY);
      cursor.classList.add("cursor--active");
    });

    document.addEventListener("mouseleave", () => cursor.classList.remove("cursor--active"));

    document.querySelectorAll(".archive-card").forEach((card) => {
      card.addEventListener("mouseenter", () => {
        cursor.classList.add("cursor--card");
        cursor.textContent = "ENTER";
        gsap.to(cursor, { scale: 1.4, duration: 0.3, ease: "power2.out" });
      });
      card.addEventListener("mouseleave", () => {
        cursor.classList.remove("cursor--card");
        cursor.textContent = "";
        gsap.to(cursor, { scale: 1, duration: 0.3, ease: "power2.out" });
      });
    });
  }

  /* -----------------------------------------------------------------------
     08 — NAVIGATION (solid background once past the hero)
     ---------------------------------------------------------------------- */
  function initNavigation() {
    const nav = document.querySelector("[data-nav]");
    const hero = document.querySelector("[data-hero]");
    if (!nav || !hero) return;

    if (HAS_GSAP && window.ScrollTrigger) {
      ScrollTrigger.create({
        trigger: hero,
        start: "bottom top",
        onEnter: () => nav.classList.add("site-nav--solid"),
        onLeaveBack: () => nav.classList.remove("site-nav--solid"),
      });
    } else {
      window.addEventListener("scroll", () => {
        nav.classList.toggle("site-nav--solid", window.scrollY > hero.offsetHeight - 80);
      });
    }
  }

  /* -----------------------------------------------------------------------
     08.5 — BACKGROUND MUSIC (autoplay + nav player button)

     Browsers block *unmuted* autoplay outright on a fresh visit — there is
     no way around that from script.js, no matter how the play() call is
     structured. Muted autoplay, however, is always permitted, so we start
     the track muted immediately on load (it reports as truly "playing"
     right away) and unmute automatically on the very first interaction
     with the page — not just a click on the button, but any pointer
     move, key press, touch, or scroll — so audible sound kicks in almost
     instantly rather than waiting on a deliberate click.
     ---------------------------------------------------------------------- */
  function initBackgroundAudio() {
    const audio = document.querySelector("[data-bg-audio]");
    const toggle = document.querySelector("[data-audio-toggle]");
    const label = document.querySelector("[data-audio-label]");
    if (!audio) return;

    audio.loop = true;
    audio.volume = 1;
    audio.muted = true; // required for guaranteed autoplay; lifted on first interaction

    // Once the user has explicitly hit pause, autoplay/resume/unmute logic
    // backs off entirely and leaves the choice to them.
    let userPaused = false;

    function setUIPlaying(isPlaying) {
      if (!toggle) return;
      const audible = isPlaying && !audio.muted;
      toggle.classList.toggle("is-playing", audible);
      toggle.setAttribute("aria-pressed", String(isPlaying));
      toggle.setAttribute("aria-label", isPlaying ? (audible ? "Pause background music" : "Unmute background music") : "Play background music");
      if (label) label.textContent = isPlaying ? (audible ? "Playing" : "Muted") : "Music";
    }

    const tryPlay = () => {
      if (userPaused || !audio.paused) return;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setUIPlaying(true))
          .catch(() => {
            // Even muted autoplay can be blocked in rare cases (e.g. data-saver
            // mode) — will retry on first user gesture below.
          });
      }
    };

    const unmute = () => {
      if (userPaused) return;
      audio.muted = false;
      setUIPlaying(!audio.paused);
    };

    // Fires on the very first interaction of any kind, anywhere on the
    // page: pointer movement, click, key, touch, or scroll.
    const onFirstGesture = () => {
      if (audio.paused) tryPlay();
      unmute();
      removeGestureListeners();
    };
    const gestureEvents = ["pointerdown", "pointermove", "keydown", "touchstart", "wheel", "scroll"];

    function removeGestureListeners() {
      gestureEvents.forEach((evt) =>
        window.removeEventListener(evt, onFirstGesture)
      );
    }

    gestureEvents.forEach((evt) =>
      window.addEventListener(evt, onFirstGesture, { passive: true })
    );

    tryPlay();

    // If the tab was backgrounded and the browser paused it, resume
    // quietly when it becomes visible again (unless the user paused it
    // themselves).
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && audio.paused && !userPaused) {
        tryPlay();
      }
    });

    // Visible play/pause control. Clicking it also counts as the
    // interaction that unmutes, so a paused/muted track both plays and
    // becomes audible in one tap.
    if (toggle) {
      toggle.addEventListener("click", () => {
        removeGestureListeners();
        if (audio.paused) {
          userPaused = false;
          audio.muted = false;
          audio.play().then(() => setUIPlaying(true)).catch(() => {});
        } else if (audio.muted) {
          audio.muted = false;
          setUIPlaying(true);
        } else {
          userPaused = true;
          audio.pause();
          setUIPlaying(false);
        }
      });
    }

    audio.addEventListener("play", () => setUIPlaying(true));
    audio.addEventListener("pause", () => setUIPlaying(false));
  }

  /* -----------------------------------------------------------------------
     09 — RESPONSIVE HANDLING
     ---------------------------------------------------------------------- */
  function initResponsiveHandling() {
    if (!HAS_GSAP || !window.ScrollTrigger) return;
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
    });
  }

  /* -----------------------------------------------------------------------
     ENTRY POINT
     ---------------------------------------------------------------------- */
  function boot() {
    initCardGrid();
    initCardHover();
    initCardTransition();
    initCursor();
    initNavigation();
    initBackgroundAudio();
    initResponsiveHandling();
    initScrollAnimations();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initLoader(() => {
      initHeroAnimations();
      boot();
      if (HAS_GSAP && window.ScrollTrigger) {
        window.requestAnimationFrame(() => ScrollTrigger.refresh());
      }
    });
  });
})();
