(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ---------- starfield ---------- */
  const starBox = $("#stars");
  if (starBox) {
    for (let i = 0; i < 60; i++) {
      const s = document.createElement("span");
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      s.style.opacity = (Math.random() * 0.5 + 0.1).toFixed(2);
      starBox.appendChild(s);
    }
  }

  /* ---------- preloader ---------- */
  const loader = $("#loader");
  function heroIntro() {
    if (!hasGSAP || reduce) return;
    gsap.from(".hero-in", { autoAlpha: 0, y: 22, duration: .8, stagger: .15, ease: "power3.out" });
    gsap.from(".hero-char", { autoAlpha: 0, y: 100, rotate: 6, duration: 1.15, stagger: .13, delay: .15, ease: "power3.out" });
  }
  if (loader) {
    if (reduce || !hasGSAP) {
      loader.remove();
    } else {
      const num = $("#loaderNum"), o = { v: 0 };
      gsap.timeline({ onComplete: () => { loader.remove(); heroIntro(); } })
        .to(o, { v: 16, duration: 1.1, ease: "power2.inOut", onUpdate: () => num.textContent = String(Math.round(o.v)).padStart(2, "0") })
        .to(num, { scale: 1.25, autoAlpha: 0, duration: .4, ease: "power2.in" })
        .to(loader, { yPercent: -100, duration: .8, ease: "power4.inOut" }, "-=.15");
    }
  }
  if (reduce || !hasGSAP) heroIntro();

  /* ---------- nav solidify on scroll ---------- */
  const navBg = $("#navBg");
  if (navBg && hasGSAP) {
    ScrollTrigger.create({
      start: "top -80",
      end: 99999,
      onEnter: () => gsap.to(navBg, { autoAlpha: 1, duration: .3 }),
      onLeaveBack: () => gsap.to(navBg, { autoAlpha: 0, duration: .3 })
    });
  }

  /* ---------- cursor dot (desktop, fine pointer only) ---------- */
  const cursor = $("#cursorDot");
  if (cursor && matchMedia("(hover: hover) and (pointer: fine)").matches && !reduce) {
    let cx = 0, cy = 0, dx = 0, dy = 0;
    addEventListener("mousemove", e => { cx = e.clientX; cy = e.clientY; cursor.classList.add("cursor--active"); });
    const tick = () => {
      dx += (cx - dx) * .2; dy += (cy - dy) * .2;
      cursor.style.transform = `translate(${dx}px, ${dy}px)`;
      requestAnimationFrame(tick);
    };
    tick();
    $$(".zoom, a, button").forEach(el => {
      el.addEventListener("mouseenter", () => cursor.classList.add("cursor--grow"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("cursor--grow"));
    });
  }

  /* ---------- music ---------- */
  const audio = $("#bgm"), mBtn = $("#music"), mLabel = $("#musicLabel");
  const bars = mBtn ? $$("i", mBtn) : [];
  function setMusic(on) {
    mBtn.setAttribute("aria-pressed", String(on));
    mBtn.setAttribute("aria-label", on ? "Pause background music" : "Play background music");
    mLabel.textContent = on ? "Playing" : "Music";
    bars.forEach((b, i) => {
      b.style.animation = on && !reduce ? `bars .9s ease-in-out ${-0.3 * i}s infinite` : "none";
      if (!on) b.style.height = "4px";
    });
  }
  if (mBtn) {
    mBtn.addEventListener("click", () => {
      if (audio.paused) audio.play().then(() => setMusic(true)).catch(() => setMusic(false));
      else { audio.pause(); setMusic(false); }
    });
  }

  /* ---------- lightbox ---------- */
  const lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap"), lbClose = $("#lbClose");
  let lastFocus = null;
  function openLb(box) {
    const img = $("img", box);
    if (!img) return;
    const cap = box.closest("figure")?.querySelector("figcaption");
    lastFocus = box;
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = cap ? cap.textContent.trim() : "";
    lb.classList.remove("hidden");
    lb.classList.add("flex");
    document.documentElement.style.overflow = "hidden";
    lbClose.focus();
  }
  function closeLb() {
    lb.classList.add("hidden");
    lb.classList.remove("flex");
    document.documentElement.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  $$(".zoom").forEach(box => {
    box.addEventListener("click", () => openLb(box));
    box.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(box); } });
  });
  if (lbClose) lbClose.addEventListener("click", closeLb);
  if (lb) lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
  addEventListener("keydown", e => { if (e.key === "Escape" && lb && !lb.classList.contains("hidden")) closeLb(); });

  /* ---------- reduced-motion static fallback ---------- */
  if (reduce || !hasGSAP) {
    $$(".reveal, .reveal-mask, .fin, .call-card, .cake-t").forEach(el => { el.style.opacity = 1; el.style.transform = "none"; });
  }

  if (hasGSAP && !reduce) {
    /* ---------- generic scroll reveals ---------- */
    $$(".reveal").forEach(el => {
      gsap.from(el, { autoAlpha: 0, y: 36, duration: .9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
    });
    $$(".reveal-mask > *").forEach(el => {
      gsap.from(el, { autoAlpha: 0, y: 30, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } });
    });
    gsap.from(".fin", { autoAlpha: 0, y: 40, duration: 1, stagger: .18, ease: "power3.out", scrollTrigger: { trigger: "#finale", start: "top 60%" } });

    /* ---------- layered parallax (any [data-parallax]) ---------- */
    $$("[data-parallax]").forEach(el => {
      const speed = parseFloat(el.dataset.parallax);
      gsap.to(el, { yPercent: speed, ease: "none",
        scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true } });
    });

    /* ---------- pinned horizontal timeline ---------- */
    const tlPin = $("#tlPin"), tlTrack = $("#tlTrack");
    if (tlPin && tlTrack) {
      const dist = () => Math.max(tlTrack.scrollWidth - innerWidth, 0);
      ScrollTrigger.create({
        trigger: tlPin,
        start: "top top+=80",
        end: () => "+=" + dist(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        animation: gsap.to(tlTrack, { x: () => -dist(), ease: "none" })
      });
      $$(".tl-panel img", tlTrack).forEach(img => {
        gsap.to(img, { yPercent: 10, ease: "none",
          scrollTrigger: { trigger: tlPin, containerAnimation: ScrollTrigger.getAll().find(t => t.trigger === tlPin)?.animation, start: "left right", end: "right left", scrub: true } });
      });
    }

    /* ---------- call cards: staggered directional entrance ---------- */
    $$(".call-card").forEach(card => {
      const dir = card.dataset.dir;
      const from = dir === "left" ? { x: -70, y: 10 } : dir === "right" ? { x: 70, y: 10 } : { x: 0, y: -60 };
      gsap.from(card, { ...from, autoAlpha: 0, rotate: dir === "up" ? 0 : (dir === "left" ? -4 : 4), duration: 1,
        ease: "power3.out", scrollTrigger: { trigger: "#callStack", start: "top 80%" } });
    });

    /* ---------- cake: iris opens as you scroll, pinned ---------- */
    if ($("#cake")) {
      gsap.set(".cake-t", { autoAlpha: 0, y: 30 });
      gsap.timeline({ scrollTrigger: { trigger: "#cake", start: "top top", end: "+=110%", pin: true, scrub: 1 } })
        .fromTo("#cakeImg", { clipPath: "circle(5% at 50% 50%)", scale: 1.35 }, { clipPath: "circle(78% at 50% 50%)", scale: 1, ease: "none", duration: 3 })
        .to(".cake-t", { autoAlpha: 1, y: 0, duration: 1 });
    }

    /* ---------- scroll progress + hero numerals dissolve ---------- */
    gsap.to("#prog", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });
    gsap.to("#heroNum", { scale: 1.5, autoAlpha: 0, yPercent: -12, ease: "none",
      scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });

    /* ---------- call frames drift at different speeds (layered depth) ---------- */
    $$(".call-card .zoom").forEach((z, i) => gsap.to(z, { y: [-40, 80, -90][i] || 0, ease: "none",
      scrollTrigger: { trigger: "#callStack", start: "top bottom", end: "bottom top", scrub: true } }));

    /* ---------- magnetic finale button ---------- */
    const finBack = $("#finaleBack");
    if (finBack && matchMedia("(hover: hover)").matches) {
      finBack.addEventListener("mousemove", e => {
        const r = finBack.getBoundingClientRect();
        gsap.to(finBack, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, background: "#E7B8C2", duration: .3 });
      });
      finBack.addEventListener("mouseleave", () => gsap.to(finBack, { x: 0, y: 0, background: "#F2ECE2", duration: .6, ease: "elastic.out(1,.4)" }));
    }
  }

  /* ---------- read-along: words light up with scroll ---------- */
  function scrubWords(sel) {
    const el = $(sel); if (!el) return;
    el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="sw">${w}</span>`).join(" ");
    if (!hasGSAP || reduce) return;
    gsap.fromTo($$(".sw", el), { opacity: .13 }, { opacity: 1, stagger: .12, ease: "none",
      scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 50%", scrub: true } });
  }
  scrubWords("#dedText"); scrubWords("#letterText");

  /* =========================================================
     PEONY BOUQUET
     ========================================================= */
  const wrap = $("#bouquetWrap");
  if (wrap) {
    const flowers = [
      { size: 92,  stem: 120, rot: -16, bend: 10 },
      { size: 120, stem: 150, rot: -7,  bend: 5  },
      { size: 150, stem: 180, rot: 0,   bend: 0  },
      { size: 134, stem: 160, rot: 6,   bend: -4 },
      { size: 108, stem: 135, rot: 13,  bend: -9 },
      { size: 86,  stem: 110, rot: -22, bend: 14 },
      { size: 86,  stem: 110, rot: 22,  bend: -14 }
    ];

    function buildPeony(size, hue) {
      const flower = document.createElement("div");
      flower.className = "bouquet-flower";
      flower.style.width = size + "px";
      flower.style.height = size + "px";

      const head = document.createElement("div");
      head.className = "peony-head";
      head.style.width = size + "px";
      head.style.height = size + "px";

      const outerColor = `linear-gradient(to top, hsl(${340 + hue},38%,38%), hsl(${340 + hue},58%,76%) 85%)`;

      for (let i = 0; i < 10; i++) {
        const p = document.createElement("span");
        p.className = "petal petal--outer";
        p.style.background = outerColor;
        p.style.transform = `translate(-50%,-50%) rotate(${(360 / 10) * i}deg) translateY(-26%)`;
        head.appendChild(p);
      }
      for (let i = 0; i < 9; i++) {
        const p = document.createElement("span");
        p.className = "petal petal--inner";
        p.style.transform = `translate(-50%,-50%) rotate(${(360 / 9) * i + 18}deg) translateY(-18%)`;
        head.appendChild(p);
      }
      const center = document.createElement("span");
      center.className = "peony-center";
      head.appendChild(center);
      flower.appendChild(head);
      return flower;
    }

    flowers.forEach((f, i) => {
      const column = document.createElement("div");
      column.style.position = "relative";
      column.style.marginLeft = i === 0 ? "0" : "-14px";
      column.style.marginRight = i === flowers.length - 1 ? "0" : "-14px";
      column.style.zIndex = String(20 + i);

      const flower = buildPeony(f.size, i * 6 - 18);
      flower.style.setProperty("--rot", f.rot + "deg");
      flower.style.transform = `rotate(${f.rot}deg)`;
      if (!reduce) { flower.classList.add("bouquet-sway"); flower.style.animationDelay = (i * 0.25) + "s"; }

      const stemUpper = document.createElement("div");
      stemUpper.className = "bouquet-stem-upper";
      stemUpper.style.height = (f.stem * 0.55) + "px";
      stemUpper.style.top = "100%";
      stemUpper.style.transform = `translateX(-50%) rotate(${f.bend}deg)`;

      const stemLower = document.createElement("div");
      stemLower.className = "bouquet-stem-lower";
      stemLower.style.height = (f.stem * 0.5) + "px";
      stemLower.style.top = `calc(100% + ${f.stem * 0.5}px)`;
      stemLower.style.transform = `translateX(-50%) rotate(${-f.bend * 0.4}deg)`;

      const leaf = document.createElement("div");
      leaf.className = "bouquet-leaf";
      leaf.style.top = `calc(100% + ${f.stem * 0.3}px)`;
      leaf.style.left = "50%";
      leaf.style.transform = `translateX(-10%) rotate(${i % 2 === 0 ? -30 : 30}deg)`;

      flower.appendChild(stemUpper);
      flower.appendChild(stemLower);
      flower.appendChild(leaf);
      column.appendChild(flower);
      column.style.marginBottom = "150px";
      wrap.appendChild(column);
    });

    const ribbon = document.createElement("div");
    ribbon.className = "ribbon";
    const knot = document.createElement("span");
    knot.className = "ribbon-knot";
    ribbon.appendChild(knot);
    $("#bouquetStage").appendChild(ribbon);

    if (hasGSAP) {
      gsap.set(".bouquet-flower", { scale: reduce ? 1 : .15, autoAlpha: reduce ? 1 : 0, transformOrigin: "bottom center" });
      gsap.set(".ribbon", { autoAlpha: reduce ? 1 : 0, y: reduce ? 0 : 24 });
      if (!reduce) {
        ScrollTrigger.create({
          trigger: "#bouquetStage",
          start: "top 80%",
          once: true,
          onEnter: () => {
            gsap.to(".bouquet-flower", { scale: 1, autoAlpha: 1, duration: 1, stagger: .16, ease: "back.out(1.5)" });
            gsap.to(".ribbon", { autoAlpha: 1, y: 0, duration: .6, delay: .9, ease: "power2.out" });
          }
        });
      }
    }
  }

  /* ---------- falling petals ---------- */
  const petalBox = $("#petals");
  if (petalBox && !reduce) {
    for (let i = 0; i < 18; i++) {
      const p = document.createElement("span");
      const s = 8 + Math.random() * 10;
      p.className = "falling-petal";
      p.style.width = s + "px";
      p.style.height = (s * 1.4) + "px";
      p.style.left = Math.random() * 100 + "%";
      p.style.animationDuration = (9 + Math.random() * 9) + "s";
      p.style.animationDelay = (Math.random() * 10) + "s";
      petalBox.appendChild(p);
    }
  }

  /* ---------- poems ---------- */
  const poems = [
    { title: "I. Sumugal ka ng sampung minuto", body: "Ikaw ang nakapagbigay ng rason\nkung bakit nagpapatuloy ako sa buhay ko\nbilang isang matatag na mamamayan,\nat bilang isang taong puno ng pagmamahal." },
    { title: "II. Alaala", body: "Hindi kalang basta-bastang memorya,\nisa kang tao na kasama ko sa istoryang ito.\nTa-tagal tayo hanggang dulohan.\nWalang sisihan ito, ikaw ang hanap-hanap, ng puso ko." },
    { title: "III. Munting bulaklak, galing saakin.", body: "Mahal mo ako, o hindi mo ako mahal.\n ang bawat bugso ng mga tao\nkada bumubunot ng petalya galing sa bulaklak.\n Ma-suwerte ako sapagkat, alam ko na bawat bunot mo,\nlahat ng sagot ay palaging ikaw ang mahal ko" }
  ];

  const poemTitle = $("#poemTitle"), poemBody = $("#poemBody"), dotsBox = $("#poemDots");
  const prevBtn = $("#poemPrev"), nextBtn = $("#poemNext");
  let pIndex = 0;

  function renderPoem(i, animate) {
    const p = poems[i];
    const show = () => {
      poemTitle.textContent = p.title;
      poemBody.innerHTML = p.body.split("\n").join("<br>");
      $$("span", dotsBox).forEach((d, di) => d.classList.toggle("bg-rose", di === i));
    };
    if (hasGSAP && animate && !reduce) {
      gsap.to([poemTitle, poemBody], { autoAlpha: 0, y: -8, duration: .25, onComplete: () => {
        show();
        gsap.fromTo([poemTitle, poemBody], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .5, ease: "power3.out" });
      } });
    } else { show(); }
  }

  if (poemTitle && poemBody) {
    poems.forEach((_, i) => {
      const d = document.createElement("span");
      d.className = "block w-1.5 h-1.5 rounded-full " + (i === 0 ? "bg-rose" : "bg-line");
      dotsBox.appendChild(d);
    });
    renderPoem(0, false);
    nextBtn?.addEventListener("click", () => { pIndex = (pIndex + 1) % poems.length; renderPoem(pIndex, true); });
    prevBtn?.addEventListener("click", () => { pIndex = (pIndex - 1 + poems.length) % poems.length; renderPoem(pIndex, true); });
  }

  /* ---------- resize settle ---------- */
  if (hasGSAP) {
    addEventListener("load", () => { setTimeout(() => ScrollTrigger.refresh(), 300); setTimeout(() => ScrollTrigger.refresh(), 1200); });
    let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => ScrollTrigger.refresh(), 250); });
  }
})();