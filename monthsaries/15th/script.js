(() => {
  "use strict";
  gsap.registerPlugin(ScrollTrigger);

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const loader = $("#loader");

  /* ---------- music ---------- */
  const audio = $("#bgm"), mBtn = $("#music"), mLabel = $("#musicLabel");
  const bars = $$("i", mBtn);
  function setMusic(on) {
    mBtn.setAttribute("aria-pressed", String(on));
    mBtn.setAttribute("aria-label", on ? "Pause background music" : "Play background music");
    mLabel.textContent = on ? "Playing" : "Music";
    bars.forEach((b, i) => {
      b.classList.toggle("animate-bars", on && !reduce);
      b.style.animationDelay = `${-0.3 * i}s`;
    });
  }
  mBtn.addEventListener("click", () => {
    if (audio.paused) audio.play().then(() => setMusic(true)).catch(() => setMusic(false));
    else { audio.pause(); setMusic(false); }
  });

  /* ---------- builders: polaroid wall + reel ---------- */
  const wall = [["images/01.jpg", "ꨄ︎", -4], ["images/02.jpg", "ꨄ︎", 3], ["images/04.jpg", "ꨄ︎", -2], ["images/05.jpg", "ꨄ︎", 4], ["images/08.jpg", "ꨄ︎", -3], ["images/07.jpg", "ꨄ︎", 2]];
  $("#wallGrid").innerHTML = wall.map(([k, c, r], i) => `<figure class="pol relative bg-cream text-ink p-2.5 md:p-3 pb-3 shadow-[0_20px_50px_rgba(0,0,0,.5)] ${i % 3 === 1 ? "md:mt-14" : ""}" style="transform:rotate(${r}deg)">
    <div class="zoom aspect-square overflow-hidden bg-glow" tabindex="0" role="button" aria-label="View photo larger"><img src="${k}" alt="" loading="lazy" class="w-full h-full object-cover"></div>
    <figcaption class="pt-3 pb-1 text-center font-serif italic text-lg md:text-xl text-ink/70">${c}</figcaption></figure>`).join("");

  const reelKeys = [["images/01.jpg", "images/14.jpg", "images/02.jpg", "images/16.jpg", "images/04.jpg", "images/19.jpg", "images/05.jpg", "images/15.jpg", "images/09.jpg"], ["images/08.jpg", "images/10.jpg", "images/07.jpg", "images/18.jpg", "images/11.jpg", "images/13.jpg", "images/12.jpg", "images/17.jpg", "images/03.jpg"]];
  $$(".reel-row").forEach((row, ri) => {
    const set = reelKeys[ri].map(k => `<div class="shrink-0 mr-6 w-48 md:w-72 aspect-[3/4] overflow-hidden border border-line"><img src="${k}" alt="" loading="lazy" class="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-700"></div>`).join("");
    row.innerHTML = set + set;
    row.style.animationDuration = row.dataset.dur + "s";
    row.setAttribute("aria-hidden", "true");
  });

  /* ---------- lightbox (click / Enter / Space on any .zoom photo) ---------- */
  const lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap"), lbClose = $("#lbClose");
  let lastFocus = null;
  function openLb(box) {
    const img = $("img", box);
    if (!img) return;
    const cap = box.parentElement.querySelector("figcaption");
    lastFocus = box;
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = cap ? cap.textContent.replace(/\s+/g, " ").trim() : "";
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
    box.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(box); }
    });
  });
  lbClose.addEventListener("click", closeLb);
  lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
  addEventListener("keydown", e => { if (e.key === "Escape" && !lb.classList.contains("hidden")) closeLb(); });

  /* ---------- fifteen reasons ---------- */
  const reasons = [
    "I'll be the one who stays and proves to you, that trusting is safe.",
    "The journeys we will encounter is inevitable.",
    "I'll be the reason you'll smile every single day.",
    "I'll sing to you everytime you want to sleep.",
    "You can always depennd on me, everytime you feel down.",
    "I'll be your knight in shining armour.",
    "I keep my promises.",
    "I'll never fail to make you feel the love you deserve.",
    "I'll help you throughout the things you always need help with.",
    "Tell me you love me, because that's all that I want to hear.",
    "I'll create memorable songs that storytells our journey.",
    "I'll give you what you want, I'll always figure out a way.",
    "Provide you food when you're hungry.",
    "Give you massages when you're tired and sore.",
    "I'll stay, not because I promised, but because I love you and I'll settle with you until the very end of forever."
  ];
  const rText = $("#reasonText"), rCount = $("#reasonCount"), rBtn = $("#reasonBtn"), rDots = $("#reasonDots");
  let order = [], shown = 0;
  reasons.forEach(() => {
    const d = document.createElement("i");
    d.className = "block w-1.5 h-1.5 rounded-full bg-line transition-colors duration-500";
    rDots.appendChild(d);
  });
  function setReason(text) {
    if (reduce) { rText.textContent = text; return; }
    gsap.to(rText, { autoAlpha: 0, y: -10, duration: 0.2, onComplete: () => {
      rText.textContent = text;
      gsap.fromTo(rText, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" });
    } });
  }
  rBtn.addEventListener("click", () => {
    if (shown === reasons.length) {
      shown = 0;
      $$("i", rDots).forEach(d => d.classList.replace("bg-rose", "bg-line"));
      rCount.textContent = "0 / 15";
      rBtn.textContent = "Give me a reason";
      setReason("Press the button. Every reason is true.");
      return;
    }
    if (!order.length) order = gsap.utils.shuffle(reasons.map((_, i) => i));
    setReason(reasons[order.pop()]);
    shown++;
    rCount.textContent = `${shown} / 15`;
    rDots.children[shown - 1].classList.replace("bg-line", "bg-rose");
    if (shown === reasons.length) rBtn.textContent = "Start again";
    else rBtn.textContent = "Another one";
  });

  /* ---------- open when: accordion envelopes ---------- */
  $$(".env").forEach(btn => btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    $$(".env").forEach(b => b.setAttribute("aria-expanded", "false"));
    btn.setAttribute("aria-expanded", String(!open));
    if (!open) setTimeout(() => ScrollTrigger.refresh(), 700);
  }));

  /* ---------- tap to send love ---------- */
  const tapBtn = $("#tapBtn"), tapCount = $("#tapCount"), tapNote = $("#tapNote"), layer = $("#heartLayer");
  let taps = 0;
  tapBtn.addEventListener("click", () => {
    taps++;
    tapCount.textContent = taps;
    if (taps === 15) tapNote.textContent = "hearts sent. Fifteen, like our months.";
    else if (taps === 1) tapNote.textContent = taps === 1 ? "heart sent" : "hearts sent";
    else if (taps === 2) tapNote.textContent = "hearts sent";
    if (reduce) return;
    const s = layer.getBoundingClientRect(), b = tapBtn.getBoundingClientRect();
    for (let i = 0; i < 8; i++) {
      const h = document.createElement("span");
      h.textContent = "♥";
      h.className = "absolute text-rose";
      h.style.cssText = `left:${b.left - s.left + b.width / 2}px;top:${b.top - s.top + b.height / 2}px;font-size:${gsap.utils.random(14, 34)}px`;
      layer.appendChild(h);
      gsap.to(h, { x: gsap.utils.random(-160, 160), y: gsap.utils.random(-340, -160), rotation: gsap.utils.random(-50, 50), autoAlpha: 0,
        duration: gsap.utils.random(1.4, 2.2), ease: "power2.out", onComplete: () => h.remove() });
    }
  });

  /* ---------- reduced motion: everything visible, no effects ---------- */
  if (reduce) {
    loader.remove();
    $$("[data-count]").forEach(el => (el.textContent = el.dataset.count));
    $("#promises").classList.add("md:h-auto", "md:py-24");
    return;
  }

  /* ---------- progress bar ---------- */
  gsap.to("#bar", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

  /* ---------- petals ---------- */
  const petalBox = $("#petals");
  for (let i = 0; i < 18; i++) {
    const p = document.createElement("span");
    const s = gsap.utils.random(8, 18);
    p.className = "absolute block bg-rose/40";
    p.style.cssText = `width:${s}px;height:${s * 1.4}px;border-radius:80% 0 80% 0;left:${gsap.utils.random(0, 100)}%;top:-5%`;
    petalBox.appendChild(p);
    gsap.to(p, { y: () => innerHeight * 1.15, x: `+=${gsap.utils.random(-120, 120)}`, rotation: gsap.utils.random(-360, 360),
      duration: gsap.utils.random(9, 18), delay: gsap.utils.random(0, 12), ease: "none", repeat: -1 });
    gsap.to(p, { opacity: 0.15, duration: gsap.utils.random(1.5, 3), yoyo: true, repeat: -1, ease: "sine.inOut" });
  }

  /* ---------- cursor glow ---------- */
  const glow = $("#glowCursor");
  if (matchMedia("(pointer: fine)").matches) {
    const gx = gsap.quickTo(glow, "x", { duration: 0.8, ease: "power3.out" });
    const gy = gsap.quickTo(glow, "y", { duration: 0.8, ease: "power3.out" });
    addEventListener("mousemove", e => { gx(e.clientX); gy(e.clientY); glow.style.opacity = 1; });
    document.addEventListener("mouseleave", () => (glow.style.opacity = 0));
    // magnetic return button
    const back = $("#back");
    back.addEventListener("mousemove", e => {
      const r = back.getBoundingClientRect();
      gsap.to(back, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4 });
    });
    back.addEventListener("mouseleave", () => gsap.to(back, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,.4)" }));
  }

  /* ---------- loader + hero intro ---------- */
  function heroIntro() {
    gsap.set(".draw", { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .to(".draw", { strokeDashoffset: 0, duration: 2.2, stagger: 0.2, ease: "power2.inOut" }, 0)
      .from(".hero-in", { autoAlpha: 0, y: 24, duration: 0.9, stagger: 0.18 }, 0.1)
      .from(".hero-char", { autoAlpha: 0, y: 120, rotate: 6, duration: 1.2, stagger: 0.12 }, 0.35);
  }
  const count = { v: 0 }, num = $("#loaderNum");
  gsap.timeline({ onComplete: () => { loader.remove(); heroIntro(); } })
    .to(count, { v: 15, duration: 1.4, ease: "power2.inOut", onUpdate: () => (num.textContent = String(Math.round(count.v)).padStart(2, "0")) })
    .to(num, { scale: 1.3, autoAlpha: 0, duration: 0.5, ease: "power2.in" })
    .to(loader, { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "-=0.2");

  /* ---------- parallax: data-speed on any element ---------- */
  $$("[data-speed]").forEach(el => {
    const sp = parseFloat(el.dataset.speed);
    gsap.to(el, { yPercent: sp * 100, ease: "none",
      scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true } });
  });

  // hero content drifts and fades as you leave
  gsap.to("#heroContent", { yPercent: 18, autoAlpha: 0.1, ease: "none",
    scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });

  /* ---------- letter: word-by-word scrubbed reveal ---------- */
  const lt = $("#letterText");
  lt.innerHTML = lt.textContent.trim().split(/\s+/).map(w => `<span class="lw inline-block">${w}</span>`).join(" ");
  gsap.fromTo(".lw", { opacity: 0.12, y: 8 }, { opacity: 1, y: 0, stagger: 0.05, ease: "none",
    scrollTrigger: { trigger: lt, start: "top 80%", end: "bottom 45%", scrub: true } });

  /* ---------- stats count-up ---------- */
  $$("[data-count]").forEach(el => {
    const o = { v: 0 }, end = +el.dataset.count;
    gsap.to(o, { v: end, duration: 2, ease: "power2.out", onUpdate: () => (el.textContent = Math.round(o.v)),
      scrollTrigger: { trigger: el, start: "top 85%", once: true } });
  });
  gsap.from(".stat", { autoAlpha: 0, y: 40, duration: 1, stagger: 0.2, ease: "power3.out",
    scrollTrigger: { trigger: ".stat", start: "top 85%" } });

  /* ---------- gallery + duo: reveal + inner image parallax ---------- */
  $$(".reveal, .reveal-duo").forEach(fig => {
    const box = $("div", fig);
    gsap.from(fig, { autoAlpha: 0, y: 60, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: fig, start: "top 88%" } });
    gsap.fromTo(box, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.3, ease: "power4.inOut",
      scrollTrigger: { trigger: fig, start: "top 88%" } });
    const img = $("[data-img]", fig);
    if (img) gsap.to(img, { yPercent: 8, ease: "none", scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* ---------- photobooth: strip settles upright, captions follow ---------- */
  gsap.fromTo(".booth-strip", { rotate: -7, y: 40 }, { rotate: -2, y: 0, ease: "none",
    scrollTrigger: { trigger: "#booth", start: "top 80%", end: "center center", scrub: true } });
  $$(".booth-line").forEach(li => gsap.from(li, { autoAlpha: 0, x: 40, duration: 1, ease: "power3.out",
    scrollTrigger: { trigger: li, start: "top 85%" } }));

  /* ---------- duo: dotted line draws down between the two portraits ---------- */
  gsap.from(".duo-line", { attr: { y2: "0%" }, ease: "none",
    scrollTrigger: { trigger: "#duo", start: "top 70%", end: "bottom 60%", scrub: true } });

  /* ---------- reasons + open-when entrance ---------- */
  gsap.from("#reasons > *:not(button)", { autoAlpha: 0, y: 40, duration: 1, stagger: 0.12, ease: "power3.out",
    scrollTrigger: { trigger: "#reasons", start: "top 70%" } });
  gsap.from("#openwhen .env", { autoAlpha: 0, y: 30, duration: 0.9, stagger: 0.15, ease: "power3.out",
    scrollTrigger: { trigger: "#openwhen", start: "top 65%" } });

  /* ---------- kinetic words: rows slide in opposite directions with scroll ---------- */
  const kr = $$(".k-row");
  gsap.fromTo(kr[0], { xPercent: 0 }, { xPercent: -35, ease: "none", scrollTrigger: { trigger: "#kinetic", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.fromTo(kr[1], { xPercent: -35 }, { xPercent: 0, ease: "none", scrollTrigger: { trigger: "#kinetic", start: "top bottom", end: "bottom top", scrub: true } });

  /* ---------- scramble heading ---------- */
  $$("[data-scramble]").forEach(el => {
    const t = el.dataset.scramble, chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ♥", o = { p: 0 };
    el.setAttribute("aria-label", t);
    el.textContent = t.replace(/\S/g, "·");
    ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => gsap.to(o, { p: 1, duration: 1.4, ease: "none",
      onUpdate: () => { const n = Math.floor(o.p * t.length); el.textContent = t.slice(0, n) + [...t.slice(n)].map(ch => ch === " " ? " " : chars[Math.random() * chars.length | 0]).join(""); },
      onComplete: () => (el.textContent = t) }) });
  });

  /* ---------- typewriter note ---------- */
  const tw = $("#typeText"), twFull = tw.textContent.trim(), twO = { n: 0 };
  $("#typeWrap").style.minHeight = $("#typeWrap").offsetHeight + "px";
  tw.textContent = "";
  ScrollTrigger.create({ trigger: "#typeWrap", start: "top 80%", once: true, onEnter: () => gsap.to(twO, { n: twFull.length, duration: twFull.length * 0.035, ease: "none",
    onUpdate: () => (tw.textContent = twFull.slice(0, Math.round(twO.n))) }) });

  /* ---------- chat: bubbles arrive one by one with a typing status ---------- */
  const bubs = $$(".bub"), chatStatus = $("#chatStatus");
  gsap.set(bubs, { autoAlpha: 0, y: 16, scale: 0.9 });
  const chatTl = gsap.timeline({ paused: true });
  bubs.forEach(b => chatTl.call(() => (chatStatus.textContent = "typing…")).to({}, { duration: 0.8 })
    .call(() => (chatStatus.textContent = "online · always")).to(b, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.7)" }));
  ScrollTrigger.create({ trigger: "#chatBody", start: "top 75%", once: true, onEnter: () => chatTl.play() });

  /* ---------- polaroid wall: scatter in, straighten on hover ---------- */
  gsap.from(".pol", { autoAlpha: 0, y: 90, rotation: () => gsap.utils.random(-22, 22), duration: 1.1, stagger: 0.12, ease: "power3.out",
    scrollTrigger: { trigger: "#wallGrid", start: "top 80%" } });
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) $$(".pol").forEach(p => {
    const r = gsap.getProperty(p, "rotation");
    p.addEventListener("mouseenter", () => gsap.to(p, { rotation: 0, y: -12, scale: 1.05, zIndex: 5, duration: 0.4, ease: "power2.out", overwrite: "auto" }));
    p.addEventListener("mouseleave", () => gsap.to(p, { rotation: r, y: 0, scale: 1, zIndex: 0, duration: 0.5, ease: "power2.out", overwrite: "auto" }));
  });

  /* ---------- reel + tap section entrance ---------- */
  gsap.from(".reel-row", { autoAlpha: 0, y: 40, duration: 1, stagger: 0.2, ease: "power3.out", scrollTrigger: { trigger: "#reel", start: "top 80%" } });
  gsap.from("#tap > *:not(#heartLayer):not(button)", { autoAlpha: 0, y: 40, duration: 1, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: "#tap", start: "top 70%" } });

  /* ---------- promises: pinned horizontal scroll (desktop only) ---------- */
  gsap.matchMedia().add("(min-width: 768px)", () => {
    const track = $("#track");
    const dist = () => track.scrollWidth - innerWidth + 80;
    gsap.to(track, { x: () => -dist(), ease: "none",
      scrollTrigger: { trigger: "#promises", start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1, invalidateOnRefresh: true } });
    gsap.from(".promise", { rotate: 3, y: 40, autoAlpha: 0, stagger: 0.12, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: "#promises", start: "top 70%" } });
  });

  /* ---------- finale ---------- */
  gsap.from(".fin", { autoAlpha: 0, y: 40, duration: 1.1, stagger: 0.18, ease: "power3.out",
    scrollTrigger: { trigger: "#finale", start: "top 60%" } });

  const rf = () => ScrollTrigger.refresh();
  addEventListener("load", () => { setTimeout(rf, 300); setTimeout(rf, 1500); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(rf, 100));
})();