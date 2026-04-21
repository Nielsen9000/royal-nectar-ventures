/* Royal Nectar Ventures — GSAP animation layer.
   Plain-JS module, loads after the HTML. Assumes gsap + ScrollTrigger
   are globals from the CDN scripts. */

(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function boot() {
    if (typeof gsap === "undefined") return;
    if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

    const PRODUCTS = [
      { name: "Buccaneer White Rum",   type: "White Rum",       tagline: "Clean. Bold. Legendary.",       color: "#0066FF" },
      { name: "Buccaneer Dark Rum",    type: "Dark Rum",        tagline: "Deep. Rich. Unapologetic.",     color: "#FF5500" },
      { name: "QE Premium Vodka",      type: "Premium Vodka",   tagline: "Pure. Sharp. Premium.",         color: "#E8000D" },
      { name: "Georgievski Orange",    type: "Flavoured Vodka", tagline: "Bright. Zesty. Alive.",         color: "#FFD600" },
      { name: "Georgievski Cranberry", type: "Flavoured Vodka", tagline: "Bold. Fruity. Fearless.",       color: "#FF0080" },
      { name: "Georgievski Lime",      type: "Flavoured Vodka", tagline: "Fresh. Sharp. Electric.",       color: "#00CC44" },
      { name: "Pink Mystique Gin",     type: "London Dry Gin",  tagline: "Mysterious. Botanical. Royal.", color: "#8800FF" }
    ];

    initProgress();
    initNavEntrance();
    initNavScrollState();
    initMobileMenu();
    initHero(PRODUCTS);
    initStory();
    initOrbital();
    initProductsHeader();
    initProducts();
    initContact();
    initFooter();
    initSmoothAnchors();
  }

  function initProgress() {
    if (reduced) return;
    gsap.to(".progress > span", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.documentElement,
        start: 0,
        end: () => document.documentElement.scrollHeight - window.innerHeight,
        scrub: 0.15
      }
    });
  }

  function initNavEntrance() {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".nav__brand", { y: -24, autoAlpha: 0, duration: 0.9 })
      .from(".nav__links > a, .nav__toggle", {
        y: -18, autoAlpha: 0, duration: 0.7, stagger: 0.08
      }, "-=0.55");
  }

  function initNavScrollState() {
    ScrollTrigger.create({
      trigger: ".hero",
      start: "bottom 85%",
      onEnter:     () => document.body.classList.add("is-scrolled"),
      onLeaveBack: () => document.body.classList.remove("is-scrolled")
    });
  }

  function initMobileMenu() {
    const toggle = document.querySelector(".nav__toggle");
    const overlay = document.getElementById("menu-overlay");
    if (!toggle || !overlay) return;

    const setOpen = (open) => {
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      overlay.setAttribute("aria-hidden", String(!open));
    };

    toggle.addEventListener("click", () => {
      setOpen(!document.body.classList.contains("menu-open"));
    });

    document.querySelectorAll("[data-menu-link]").forEach((a) =>
      a.addEventListener("click", () => setOpen(false))
    );

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) setOpen(false);
    });
  }

  function initHero(PRODUCTS) {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    const bottles = Array.from(document.querySelectorAll(".hero__bottle"));
    const dots    = Array.from(document.querySelectorAll(".hero__dot"));
    const titleEl   = document.getElementById("heroTitle");
    const eyebrowEl = document.getElementById("heroEyebrow");
    const taglineEl = document.getElementById("heroTagline");

    let idx = 0;
    let timer = null;
    let paused = false;
    let firstRun = true;
    const DURATION = 2.6;
    const FIRST_DURATION = 1.1;

    bottles.forEach((b, i) => gsap.set(b, { autoAlpha: i === 0 ? 1 : 0, scale: i === 0 ? 1 : 0.6 }));
    gsap.set(hero, { backgroundColor: PRODUCTS[0].color });

    const entrance = gsap.timeline({ defaults: { ease: "power3.out" } });
    entrance
      .from(".hero__marker",      { y: 18, autoAlpha: 0, duration: 0.7, delay: 0.1 })
      .from(".hero__eyebrow",     { y: 20, autoAlpha: 0, duration: 0.6 }, "-=0.4")
      .from(".hero__title",       { y: 36, autoAlpha: 0, duration: 0.85, ease: "back.out(1.4)" }, "-=0.45")
      .from(".hero__tagline",     { y: 20, autoAlpha: 0, duration: 0.6 }, "-=0.6")
      .from(".hero__actions > *", { y: 16, autoAlpha: 0, duration: 0.5, stagger: 0.08 }, "-=0.5")
      .from(".hero__dots > *",    { y: 12, autoAlpha: 0, duration: 0.4, stagger: 0.05 }, "-=0.35")
      .from(".hero__bottle.is-active img", { y: 80, scale: 0.8, autoAlpha: 0, duration: 1.1, ease: "back.out(1.5)" }, "-=0.9")
      .from(".hero__kente",       { scaleY: 0, transformOrigin: "50% 0%", duration: 1, stagger: 0.08 }, "-=1")
      .from(".hero__marquee",     { y: 24, autoAlpha: 0, duration: 0.6 }, "-=0.4");

    function show(target) {
      if (target === idx) return;
      const prev = idx;
      idx = target;
      const p = PRODUCTS[target];

      gsap.to(hero, { backgroundColor: p.color, duration: 0.9, ease: "power2.inOut" });

      gsap.to(bottles[prev], {
        autoAlpha: 0, scale: 0.6, duration: 0.55, ease: "power2.in",
        onComplete: () => bottles[prev].classList.remove("is-active")
      });
      bottles[target].classList.add("is-active");
      gsap.fromTo(
        bottles[target],
        { autoAlpha: 0, scale: 0.6, y: 40 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.9, ease: "back.out(1.4)" }
      );

      const tl = gsap.timeline();
      tl.to([eyebrowEl, titleEl, taglineEl], {
          autoAlpha: 0, y: -16, duration: 0.28, stagger: 0.04, ease: "power2.in"
        })
        .add(() => {
          eyebrowEl.textContent = p.type;
          titleEl.textContent   = p.name;
          taglineEl.textContent = p.tagline;
        })
        .set([eyebrowEl, titleEl, taglineEl], { y: 26 })
        .to([eyebrowEl, titleEl, taglineEl], {
          autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.07, ease: "back.out(1.5)"
        });

      dots.forEach((d, i) => {
        d.classList.toggle("is-active", i === target);
        d.setAttribute("aria-selected", String(i === target));
      });
    }

    function clearTimer() {
      if (timer) { timer.kill(); timer = null; }
    }

    function queueNext() {
      clearTimer();
      if (paused) return;
      const delay = firstRun ? FIRST_DURATION : DURATION;
      firstRun = false;
      timer = gsap.delayedCall(delay, () => {
        show((idx + 1) % PRODUCTS.length);
        queueNext();
      });
    }

    function pauseRotation() { paused = true; clearTimer(); }
    function resumeRotation() { paused = false; queueNext(); }

    dots.forEach((d, i) => {
      d.addEventListener("click", () => {
        show(i);
        queueNext();
      });
    });

    const dotsEl = hero.querySelector(".hero__dots");
    if (dotsEl) {
      dotsEl.addEventListener("mouseenter", pauseRotation);
      dotsEl.addEventListener("mouseleave", resumeRotation);
    }
    document.addEventListener("visibilitychange", () => {
      document.hidden ? pauseRotation() : resumeRotation();
    });

    const SWIPE_THRESHOLD = 40;
    let startX = 0, startY = 0, tracking = false;

    function onStart(x, y) {
      tracking = true;
      startX = x;
      startY = y;
      pauseRotation();
    }

    function onEnd(x, y) {
      if (!tracking) return;
      tracking = false;
      const dx = x - startX;
      const dy = y - startY;
      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        const dir = dx < 0 ? 1 : -1;
        show((idx + dir + PRODUCTS.length) % PRODUCTS.length);
      }
      resumeRotation();
    }

    hero.addEventListener("touchstart", (e) => {
      const t = e.changedTouches[0];
      onStart(t.clientX, t.clientY);
    }, { passive: true });

    hero.addEventListener("touchend", (e) => {
      const t = e.changedTouches[0];
      onEnd(t.clientX, t.clientY);
    });

    hero.addEventListener("touchcancel", () => {
      tracking = false;
      resumeRotation();
    });

    hero.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      onStart(e.clientX, e.clientY);
    });

    window.addEventListener("mouseup", (e) => {
      if (!tracking) return;
      onEnd(e.clientX, e.clientY);
    });

    queueNext();
  }

  function initStory() {
    const story = document.querySelector(".story");
    if (!story) return;

    const words = gsap.utils.toArray(".story__headline .word > span");
    gsap.set(words, { yPercent: 110 });

    gsap.to(words, {
      yPercent: 0,
      duration: 0.9,
      stagger: 0.07,
      ease: "back.out(1.4)",
      scrollTrigger: {
        trigger: ".story__headline",
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    });

    gsap.from(".story__lede", {
      scrollTrigger: { trigger: ".story__lede", start: "top 85%", toggleActions: "play none none reverse" },
      y: 30, autoAlpha: 0, duration: 0.7, ease: "power3.out"
    });
    gsap.from(".story__facts li", {
      scrollTrigger: { trigger: ".story__facts", start: "top 88%", toggleActions: "play none none reverse" },
      y: 30, autoAlpha: 0, duration: 0.6, stagger: 0.08, ease: "power3.out"
    });
    gsap.from(".story__body", {
      scrollTrigger: { trigger: ".story__body", start: "top 88%", toggleActions: "play none none reverse" },
      y: 30, autoAlpha: 0, duration: 0.6, ease: "power3.out"
    });
  }

  function initOrbital() {
    const section = document.querySelector(".orbital");
    if (!section) return;

    const stage   = section.querySelector(".orbital__stage");
    const bottles = Array.from(section.querySelectorAll(".orbital__bottle"));
    if (!stage || !bottles.length) return;

    const mq = window.matchMedia("(max-width: 768px)");
    let mobile = mq.matches;
    let hoverIdx = -1;
    let hoverBoost = 0;
    let hoverTween = null;
    let rotation = 0;
    let lastT = null;
    let RX = 320;
    let RY = 60;
    const SPEED = 0.00018;
    const HOVER_SCALE = 1.4;
    const baseAngles = bottles.map((_, i) => (i / bottles.length) * Math.PI * 2);

    function setHover(i) {
      if (hoverIdx === i) return;
      hoverIdx = i;
      if (hoverTween) hoverTween.kill();
      const target = i >= 0 ? 1 : 0;
      hoverTween = gsap.to({ v: hoverBoost }, {
        v: target,
        duration: 0.32,
        ease: "power2.out",
        onUpdate: function () { hoverBoost = this.targets()[0].v; }
      });
    }

    function computeRadii() {
      const w = stage.clientWidth || 800;
      const h = stage.clientHeight || 560;
      const bottleW = bottles[0].offsetWidth || 160;
      RX = Math.max(140, Math.min(w * 0.42, (w - bottleW) / 2 - 10));
      RY = Math.max(18, h * 0.06);
    }

    function clearInline() {
      bottles.forEach((b) => {
        b.style.transform = "";
        b.style.opacity = "";
        b.style.zIndex = "";
      });
    }

    function renderBottle(i, theta) {
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      const x = RX * s;
      const y = -RY * c;
      const orbScale = 0.9 + 0.3 * c;
      const orbOpacity = 0.675 + 0.325 * c;
      const z = Math.round((c + 1) * 50);
      const el = bottles[i];
      const boost = i === hoverIdx ? hoverBoost : 0;
      const scale = orbScale + (HOVER_SCALE - orbScale) * boost;
      const opacity = orbOpacity + (1 - orbOpacity) * boost;
      el.style.transform = "translate(-50%, -50%) translate(" + x.toFixed(2) + "px, " + y.toFixed(2) + "px) scale(" + scale.toFixed(3) + ")";
      el.style.opacity = opacity.toFixed(3);
      el.style.zIndex = i === hoverIdx ? "1000" : String(z);
    }

    function tick(time) {
      if (mobile) return;
      const t = time * 1000;
      if (lastT === null) lastT = t;
      const dt = t - lastT;
      lastT = t;
      if (hoverIdx < 0 && hoverBoost < 0.01 && !reduced) rotation += dt * SPEED;
      for (let i = 0; i < bottles.length; i++) {
        renderBottle(i, baseAngles[i] + rotation);
      }
    }

    computeRadii();
    gsap.ticker.add(tick);
    window.addEventListener("load", computeRadii);

    bottles.forEach((b, i) => {
      b.addEventListener("mouseenter", () => {
        setHover(i);
        b.classList.add("is-hover");
      });
      b.addEventListener("mouseleave", () => {
        if (hoverIdx === i) setHover(-1);
        b.classList.remove("is-hover");
      });
      b.addEventListener("focus", () => {
        setHover(i);
        b.classList.add("is-hover");
      });
      b.addEventListener("blur", () => {
        if (hoverIdx === i) setHover(-1);
        b.classList.remove("is-hover");
      });

      b.addEventListener("click", (e) => {
        e.preventDefault();
        const href = b.dataset.target;
        if (!href) return;
        const target = document.querySelector(href);
        if (!target) return;
        const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 72;
        const y = target.getBoundingClientRect().top + window.pageYOffset - navH + 2;
        window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
      });
    });

    function handleResize() {
      const wasMobile = mobile;
      mobile = mq.matches;
      if (mobile && !wasMobile) {
        clearInline();
      } else if (!mobile) {
        computeRadii();
      }
    }
    window.addEventListener("resize", handleResize);
    if (mq.addEventListener) mq.addEventListener("change", handleResize);
    else if (mq.addListener) mq.addListener(handleResize);

    if (mobile) clearInline();

    gsap.from(".orbital__title", {
      scrollTrigger: { trigger: section, start: "top 78%" },
      y: 36,
      autoAlpha: 0,
      duration: 0.9,
      ease: "power3.out"
    });
    gsap.from(".orbital__stage", {
      scrollTrigger: { trigger: section, start: "top 70%" },
      autoAlpha: 0,
      duration: 0.9,
      ease: "power2.out"
    });
  }

  function initProductsHeader() {
    gsap.from(".products__head > *", {
      scrollTrigger: { trigger: ".products__head", start: "top 80%" },
      y: 32,
      autoAlpha: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: "power3.out"
    });
  }

  function initProducts() {
    const sections = gsap.utils.toArray(".product");

    sections.forEach((section, sectionIndex) => {
      const bottle    = section.querySelector(".product__bottle");
      const adinkra   = section.querySelector(".product__adinkra");
      const textItems = section.querySelectorAll(".product__text > *");
      const isEven = (sectionIndex % 2) === 1;

      if (!reduced) {
        gsap.fromTo(bottle,
          { y: 120, scale: 0.88, rotate: isEven ? 4 : -4 },
          {
            y: -120, scale: 1.06, rotate: isEven ? -4 : 4,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true }
          }
        );

        gsap.fromTo(adinkra,
          { rotate: isEven ? -60 : 60, scale: 0.9 },
          {
            rotate: isEven ? 60 : -60, scale: 1.05,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true }
          }
        );
      }

      gsap.from(textItems, {
        scrollTrigger: { trigger: section, start: "top 72%", toggleActions: "play none none reverse" },
        y: 38,
        autoAlpha: 0,
        duration: 0.85,
        stagger: 0.07,
        ease: "back.out(1.4)"
      });

      gsap.from(section.querySelectorAll(".product__spec > div"), {
        scrollTrigger: { trigger: section, start: "top 60%", toggleActions: "play none none reverse" },
        y: 20,
        autoAlpha: 0,
        duration: 0.55,
        stagger: 0.06,
        ease: "power3.out"
      });

      gsap.from(section.querySelector(".product__kente"), {
        scrollTrigger: { trigger: section, start: "top 85%" },
        scaleX: 0,
        transformOrigin: "0% 50%",
        duration: 1,
        ease: "power2.out"
      });
    });
  }

  function initContact() {
    gsap.from(".contact__inner > *", {
      scrollTrigger: { trigger: ".contact", start: "top 75%" },
      y: 34,
      autoAlpha: 0,
      duration: 0.85,
      stagger: 0.08,
      ease: "power3.out"
    });
  }

  function initFooter() {
    gsap.from(".footer__inner > *", {
      scrollTrigger: { trigger: ".footer", start: "top 85%" },
      y: 24,
      autoAlpha: 0,
      duration: 0.7,
      stagger: 0.06,
      ease: "power3.out"
    });
    gsap.from(".footer__kente", {
      scrollTrigger: { trigger: ".footer", start: "top 85%" },
      scaleX: 0,
      transformOrigin: "50% 50%",
      duration: 1,
      ease: "power2.out"
    });
  }

  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      const href = a.getAttribute("href");
      if (!href || href === "#" || href.length < 2) return;
      a.addEventListener("click", (e) => {
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 72;
        const y = target.getBoundingClientRect().top + window.pageYOffset - navH + 2;
        window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
