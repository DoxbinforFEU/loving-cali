(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";

  const stub = document.querySelector(".stub");
  const els = {
    contourPaths: document.querySelectorAll(".stub__contour path"),
    eyebrow: document.querySelector(".stub__eyebrow"),
    number: document.querySelector(".stub__number"),
    title: document.querySelector(".stub__title"),
    returnLink: document.querySelector(".stub__return"),
    scrollcue: document.querySelector(".stub__scrollcue"),
    scrollcueLine: document.querySelector(".stub__scrollcue-line"),
    frames: Array.from(document.querySelectorAll(".frame")),
    counter: document.querySelector(".frame-counter"),
    counterCurrent: document.querySelector(".frame-counter__current"),
    closingInner: document.querySelector(".closing__inner"),
  };

  // ---------- static fallback (no GSAP / reduced motion) ----------
  function applyStaticState() {
    const revealTargets = [
      els.eyebrow, els.number, els.title, els.returnLink,
      ...els.frames,
      els.closingInner,
    ].filter(Boolean);
    revealTargets.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    if (els.scrollcue) els.scrollcue.style.display = "none";
  }

  const motionReady = hasGSAP && !reduceMotion;

  if (!motionReady) {
    applyStaticState();
  } else {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ---------- hero entrance ----------
  function heroEntrance() {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (els.contourPaths.length) {
      els.contourPaths.forEach((path) => {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      });
      tl.to(els.contourPaths, {
        strokeDashoffset: 0,
        duration: 1.8,
        ease: "power2.inOut",
        stagger: 0.15,
      }, 0);
    }

    gsap.set(
      [els.eyebrow, els.number, els.title, els.returnLink].filter(Boolean),
      { opacity: 0, y: 22 }
    );

    if (els.eyebrow) tl.to(els.eyebrow, { opacity: 1, y: 0, duration: 0.7 }, 0.15);
    if (els.number) tl.to(els.number, { opacity: 1, y: 0, duration: 0.95 }, 0.32);
    if (els.title) tl.to(els.title, { opacity: 1, y: 0, duration: 0.7 }, 0.62);
    if (els.returnLink) tl.to(els.returnLink, { opacity: 1, y: 0, duration: 0.6 }, 0.85);

    if (els.scrollcue) {
      gsap.set(els.scrollcue, { opacity: 0 });
      tl.to(els.scrollcue, { opacity: 1, duration: 0.8 }, 1.05);
      gsap.fromTo(
        els.scrollcueLine,
        { scaleY: 0.3, transformOrigin: "top" },
        { scaleY: 1, duration: 1.4, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.3 }
      );
    }

    return tl;
  }

  // ---------- hero exit / scroll cue hide ----------
  function heroScrollCueFade() {
    if (!els.scrollcue || !stub) return;
    gsap.to(els.scrollcue, {
      opacity: 0,
      scrollTrigger: {
        trigger: stub,
        start: "top top",
        end: "70% top",
        scrub: true,
      },
    });
  }

  // ---------- subtle hero parallax on contour lines ----------
  function heroParallax() {
    if (!stub || !els.contourPaths.length) return;
    gsap.to(els.contourPaths, {
      y: -40,
      scrollTrigger: {
        trigger: stub,
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });
  }

  // ---------- gallery frame reveal ----------
  function galleryReveal() {
    els.frames.forEach((frame, i) => {
      gsap.to(frame, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: frame,
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      });

      const img = frame.querySelector("img");
      if (img) {
        gsap.fromTo(
          img,
          { scale: 1.14 },
          {
            scale: 1.06,
            ease: "none",
            scrollTrigger: {
              trigger: frame,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          }
        );
      }
    });
  }

  // ---------- frame counter (signature scroll-linked element) ----------
  function frameCounter() {
    if (!els.counter || !els.frames.length) return;

    gsap.to(els.counter, {
      opacity: 1,
      scrollTrigger: {
        trigger: ".archive",
        start: "top 60%",
        end: "bottom 40%",
        toggleActions: "play none none reverse",
      },
    });

    els.frames
      .filter((f) => f.dataset.frame)
      .forEach((frame) => {
        ScrollTrigger.create({
          trigger: frame,
          start: "top center",
          end: "bottom center",
          onEnter: () => updateCounter(frame.dataset.frame),
          onEnterBack: () => updateCounter(frame.dataset.frame),
        });
      });
  }

  function updateCounter(value) {
    if (!els.counterCurrent) return;
    if (els.counterCurrent.textContent === value) return;
    gsap.fromTo(
      els.counterCurrent,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
    );
    els.counterCurrent.textContent = value;
  }

  // ---------- closing beat ----------
  function closingReveal() {
    if (!els.closingInner) return;
    gsap.to(els.closingInner, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: els.closingInner,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });
  }

  // ---------- init ----------
  function init() {
    if (motionReady) {
      heroEntrance();
      heroScrollCueFade();
      heroParallax();
      galleryReveal();
      frameCounter();
      closingReveal();

      let resizeTimer;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
      }, { passive: true });
    } else if (els.counter) {
      // no motion: frame counter still visible, just not scroll-linked
      els.counter.style.opacity = "1";
    }

    initPlayer();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // =========================================================
  // Music player
  // =========================================================
  //
  // No audio files were supplied with this project, so the player is wired
  // to local relative paths under an "audio/" folder that doesn't exist
  // yet. Drop your own MP3s in an "audio" folder next to this file and
  // update the PLAYLIST array below (title, artist, src) to match. Nothing
  // here calls out to an external/CDN audio source.
  const PLAYLIST = [
    { title: "— add your track title —", artist: "Mikhail × Cali", src: "audio/track-01.mp3" },
    { title: "— add your track title —", artist: "Mikhail × Cali", src: "audio/track-02.mp3" },
    { title: "— add your track title —", artist: "Mikhail × Cali", src: "audio/track-03.mp3" },
  ];

  function initPlayer() {
    const player = document.getElementById("player");
    if (!player) return;

    const toggle = document.getElementById("playerToggle");
    const panel = document.getElementById("playerPanel");
    const toggleTrack = document.getElementById("playerToggleTrack");
    const audio = document.getElementById("audioEl");
    const playBtn = document.getElementById("playBtn");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const seek = document.getElementById("seek");
    const timeCurrent = document.getElementById("timeCurrent");
    const timeTotal = document.getElementById("timeTotal");
    const volume = document.getElementById("volume");
    const muteBtn = document.getElementById("muteBtn");
    const nowTitle = document.getElementById("nowTitle");
    const nowArtist = document.getElementById("nowArtist");
    const playlistEl = document.getElementById("playlist");

    const iconPlay = playBtn.querySelector(".icon-play");
    const iconPause = playBtn.querySelector(".icon-pause");
    const iconVol = muteBtn.querySelector(".icon-vol");
    const iconMute = muteBtn.querySelector(".icon-mute");

    let currentIndex = 0;
    let isSeeking = false;

    // ---- build playlist ----
    PLAYLIST.forEach((track, i) => {
      const item = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "player__track";
      btn.setAttribute("aria-current", i === 0 ? "true" : "false");
      btn.innerHTML = `
        <span class="player__track-index">${String(i + 1).padStart(2, "0")}</span>
        <span class="player__track-name">${track.title}</span>
        <span class="player__track-dot" aria-hidden="true"></span>
      `;
      btn.addEventListener("click", () => loadTrack(i, true));
      item.appendChild(btn);
      playlistEl.appendChild(item);
    });

    function trackButtons() {
      return Array.from(playlistEl.querySelectorAll(".player__track"));
    }

    function formatTime(sec) {
      if (!isFinite(sec) || sec < 0) return "0:00";
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60).toString().padStart(2, "0");
      return `${m}:${s}`;
    }

    function loadTrack(index, autoplay) {
      currentIndex = (index + PLAYLIST.length) % PLAYLIST.length;
      const track = PLAYLIST[currentIndex];

      audio.src = track.src;
      nowTitle.textContent = track.title;
      nowArtist.textContent = track.artist;
      toggleTrack.textContent = track.title;
      seek.value = 0;
      timeCurrent.textContent = "0:00";
      timeTotal.textContent = "0:00";

      trackButtons().forEach((btn, i) => {
        btn.setAttribute("aria-current", i === currentIndex ? "true" : "false");
      });

      if (autoplay) {
        audio.play().catch(() => {
          // playback blocked (no file present, or autoplay policy) — stay paused
          setPlayingState(false);
        });
      }
    }

    function setPlayingState(playing) {
      player.dataset.playing = playing ? "true" : "false";
      iconPlay.hidden = playing;
      iconPause.hidden = !playing;
      playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
    }

    function togglePlay() {
      if (!audio.src) loadTrack(currentIndex, false);
      if (audio.paused) {
        audio.play().then(() => setPlayingState(true)).catch(() => setPlayingState(false));
      } else {
        audio.pause();
        setPlayingState(false);
      }
    }

    function expandPanel() {
      const expanded = player.dataset.state === "expanded";
      const next = !expanded;
      player.dataset.state = next ? "expanded" : "collapsed";
      toggle.setAttribute("aria-expanded", String(next));

      if (motionReady) {
        if (next) {
          const targetHeight = panel.scrollHeight;
          gsap.fromTo(panel, { height: 0, opacity: 0 }, {
            height: targetHeight, opacity: 1, duration: 0.5, ease: "power3.out",
            onComplete: () => { panel.style.height = "auto"; },
          });
        } else {
          gsap.to(panel, {
            height: 0, opacity: 0, duration: 0.35, ease: "power2.inOut",
          });
        }
      } else {
        panel.style.height = next ? "auto" : "0";
        panel.style.opacity = next ? "1" : "0";
      }
    }

    // ---- events ----
    toggle.addEventListener("click", expandPanel);
    playBtn.addEventListener("click", togglePlay);
    prevBtn.addEventListener("click", () => loadTrack(currentIndex - 1, true));
    nextBtn.addEventListener("click", () => loadTrack(currentIndex + 1, true));

    audio.addEventListener("play", () => setPlayingState(true));
    audio.addEventListener("pause", () => setPlayingState(false));
    audio.addEventListener("ended", () => loadTrack(currentIndex + 1, true));

    audio.addEventListener("loadedmetadata", () => {
      timeTotal.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      if (isSeeking) return;
      timeCurrent.textContent = formatTime(audio.currentTime);
      if (audio.duration) {
        seek.value = Math.round((audio.currentTime / audio.duration) * 1000);
      }
    });

    seek.addEventListener("input", () => { isSeeking = true; });
    seek.addEventListener("change", () => {
      if (audio.duration) {
        audio.currentTime = (Number(seek.value) / 1000) * audio.duration;
      }
      isSeeking = false;
    });

    volume.addEventListener("input", () => {
      audio.volume = Number(volume.value);
      audio.muted = audio.volume === 0;
      iconVol.hidden = audio.muted;
      iconMute.hidden = !audio.muted;
    });

    muteBtn.addEventListener("click", () => {
      audio.muted = !audio.muted;
      iconVol.hidden = audio.muted;
      iconMute.hidden = !audio.muted;
    });

    audio.volume = Number(volume.value);
    loadTrack(0, false);
  }
})();