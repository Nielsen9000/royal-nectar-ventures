/* Royal Nectar Ventures — GSAP animation layer.
   Plain-JS module, loads after the HTML. Assumes gsap + ScrollTrigger
   are globals from the CDN scripts.

   All scroll-triggered entrance animations follow a single spec:
     base entrance  → y:40, opacity:0 → 0.9s power3.out, stagger 0.12
     headings       → per-line reveal, 1s power4.out, stagger 0.1
     images/videos  → opacity:0 scale:0.96 → 1.1s power2.out
     buttons        → y:20, opacity:0 → 0.6s (last in section stagger)
     stats          → count-up, 1.5s power2.out
   Every ScrollTrigger: start:'top 80%', once:true, toggleActions:'play none none none'.
   Mobile (<=768px): translateY halved, duration × 0.8. prefers-reduced-motion respected.
*/

(function () {
  "use strict";

  const reduced  = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = () => window.matchMedia("(max-width: 768px)").matches;

  // Spec-defined scaling.
  const dy    = (n) => reduced ? 0 : (isMobile() ? n * 0.5 : n);
  const ddur  = (n) => reduced ? 0.001 : (isMobile() ? n * 0.8 : n);

  // Fixed tokens.
  const Y_BASE        = 40;
  const Y_BUTTON      = 20;
  const DUR_BASE      = 0.9;
  const DUR_HEADING   = 1.0;
  const DUR_IMAGE     = 1.1;
  const DUR_BUTTON    = 0.6;
  const DUR_COUNT     = 1.5;
  const STAGGER       = 0.12;
  const STAGGER_LINES = 0.1;
  const EASE_BASE     = "power3.out";
  const EASE_HEADING  = "power4.out";
  const EASE_IMAGE    = "power2.out";

  // One canonical ScrollTrigger config for every entrance trigger.
  const ST = (trigger, extras) => Object.assign({
    trigger: trigger,
    start: "top 80%",
    once: true,
    toggleActions: "play none none none"
  }, extras || {});

  function asArray(x) {
    if (!x) return [];
    if (x instanceof Element) return [x];
    if (x instanceof NodeList || Array.isArray(x)) return Array.from(x).filter(Boolean);
    if (typeof x === "string") return Array.from(document.querySelectorAll(x));
    return [];
  }

  function prep(targets) {
    const els = asArray(targets);
    els.forEach((el) => { if (el && el.style) el.style.willChange = "transform, opacity"; });
    return els;
  }

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
    initNavTheme();
    initMobileMenu();
    initHero(PRODUCTS);
    initJerrys();
    initStory();
    initOrbital();
    initTetra();
    initProductsHeader();
    initProducts();
    initContact();
    initCollectionHero();
    initPremium();
    initContactCta();
    initFooter();
    initCounters();
    initSmoothAnchors();

    // Recompute trigger positions once late-loading images settle.
    const refresh = () => {
      if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    };
    if (document.readyState === "complete") refresh();
    else window.addEventListener("load", refresh);
    Array.from(document.images).forEach((img) => {
      if (!img.complete) img.addEventListener("load", refresh, { once: true });
    });
  }

  /* ---------- core entrance animators ----------
     Use fromTo() with explicit target values so the pre-anim CSS gate
     (body:not(.anim-ready) … { opacity: 0 }) cannot become the captured
     "to" state and leave elements stuck at opacity 0. */

  function animateEntrance(targets, trigger, opts) {
    if (reduced) return null;
    const els = prep(targets);
    if (!els.length) return null;
    const o = opts || {};
    return gsap.fromTo(els,
      { y: dy(Y_BASE), autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: ddur(DUR_BASE),
        ease: EASE_BASE,
        stagger: o.stagger != null ? o.stagger : STAGGER,
        scrollTrigger: ST(trigger || els[0])
      }
    );
  }

  function animateImage(targets, trigger, opts) {
    if (reduced) return null;
    const els = prep(targets);
    if (!els.length) return null;
    const o = opts || {};
    return gsap.fromTo(els,
      { autoAlpha: 0, scale: 0.96, transformOrigin: "50% 50%" },
      {
        autoAlpha: 1,
        scale: 1,
        duration: ddur(DUR_IMAGE),
        ease: EASE_IMAGE,
        stagger: o.stagger != null ? o.stagger : 0,
        scrollTrigger: ST(trigger || els[0])
      }
    );
  }

  function animateButton(targets, trigger, opts) {
    if (reduced) return null;
    const els = prep(targets);
    if (!els.length) return null;
    const o = opts || {};
    return gsap.fromTo(els,
      { y: dy(Y_BUTTON), autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: ddur(DUR_BUTTON),
        ease: EASE_BASE,
        stagger: o.stagger != null ? o.stagger : STAGGER,
        scrollTrigger: ST(trigger || els[0])
      }
    );
  }

  function animateHeading(heading, trigger) {
    if (reduced || !heading) return null;
    const lines = splitHeadingLines(heading);
    if (!lines.length) {
      return animateEntrance(heading, trigger || heading);
    }
    const tl = gsap.timeline({ scrollTrigger: ST(trigger || heading) });
    lines.forEach((words, i) => {
      tl.fromTo(words,
        { yPercent: 100, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: ddur(DUR_HEADING), ease: EASE_HEADING },
        i * STAGGER_LINES
      );
    });
    return tl;
  }

  /* ---------- heading line-splitter ---------- */

  // Wraps every word inside a heading with <span class="split-word"><span class="split-word__inner">word</span></span>
  // then groups inner spans by their measured top-offset to form lines. Preserves inline elements (e.g. <em>).
  function splitHeadingLines(heading) {
    if (heading.__splitLines) return heading.__splitLines;

    const textNodes = [];
    (function walk(node) {
      for (let i = 0; i < node.childNodes.length; i++) {
        const c = node.childNodes[i];
        if (c.nodeType === 3 && c.nodeValue.trim()) textNodes.push(c);
        else if (c.nodeType === 1) walk(c);
      }
    })(heading);

    const wordInners = [];
    textNodes.forEach((tn) => {
      const parts = tn.nodeValue.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach((p) => {
        if (!p) return;
        if (/^\s+$/.test(p)) {
          frag.appendChild(document.createTextNode(" "));
          return;
        }
        const outer = document.createElement("span");
        outer.className = "split-word";
        const inner = document.createElement("span");
        inner.className = "split-word__inner";
        inner.textContent = p;
        outer.appendChild(inner);
        frag.appendChild(outer);
        wordInners.push(inner);
      });
      tn.parentNode.replaceChild(frag, tn);
    });

    if (!wordInners.length) return [];

    // Group inner spans by offsetTop of their outer wrapper → one line per group.
    const lines = [];
    let lastTop = null;
    let current = null;
    wordInners.forEach((w) => {
      const top = w.parentNode.offsetTop;
      if (lastTop === null || Math.abs(top - lastTop) > 2) {
        current = [];
        lines.push(current);
        lastTop = top;
      }
      current.push(w);
      w.style.willChange = "transform, opacity";
    });

    heading.__splitLines = lines;
    return lines;
  }

  /* ---------- page chrome ---------- */

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
    if (reduced) return;
    const tl = gsap.timeline({ defaults: { ease: EASE_BASE } });
    tl.from(prep(".nav__brand"), { y: dy(24), autoAlpha: 0, duration: ddur(DUR_BASE) })
      .from(prep(".nav__links > a, .nav__toggle"), {
        y: dy(18), autoAlpha: 0, duration: ddur(DUR_BUTTON), stagger: 0.08
      }, "-=0.55");
  }

  function initNavScrollState() {
    const trigger = document.querySelector(".hero") || document.querySelector(".collection-hero");
    if (!trigger) return;
    ScrollTrigger.create({
      trigger: trigger,
      start: "bottom 85%",
      onEnter:     () => document.body.classList.add("is-scrolled"),
      onLeaveBack: () => document.body.classList.remove("is-scrolled")
    });
  }

  function initNavTheme() {
    const lightSections = Array.from(document.querySelectorAll('[data-nav-theme="light"]'));
    if (!lightSections.length) return;

    const nav = document.querySelector(".nav");
    const navH = nav ? nav.getBoundingClientRect().height : 80;
    const probe = navH + 4;
    let lastLight = null;

    function update() {
      let overLight = false;
      for (let i = 0; i < lightSections.length; i++) {
        const r = lightSections[i].getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) { overLight = true; break; }
      }
      if (overLight !== lastLight) {
        document.body.classList.toggle("is-nav-light", overLight);
        lastLight = overLight;
      }
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  function initMobileMenu() {
    const toggle  = document.querySelector(".nav__toggle");
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

  /* ---------- hero (interactive carousel; non-scroll) ---------- */

  function initHero(PRODUCTS) {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    const bottles   = Array.from(document.querySelectorAll(".hero__bottle"));
    const dots      = Array.from(document.querySelectorAll(".hero__dot"));
    const titleEl   = document.getElementById("heroTitle");
    const eyebrowEl = document.getElementById("heroEyebrow");
    const taglineEl = document.getElementById("heroTagline");

    let idx = 0;
    let timer = null;
    let paused = false;
    let firstRun = true;
    const DURATION = 4.2;
    const FIRST_DURATION = 2.6;

    bottles.forEach((b, i) => gsap.set(b, { autoAlpha: i === 0 ? 1 : 0, scale: (isMobile() || reduced) ? 1 : (i === 0 ? 1 : 0.6) }));
    gsap.set(hero, { backgroundColor: PRODUCTS[0].color });

    // Hero entrance + carousel motion are intentionally NOT scroll-triggered —
    // they run on first paint and on click/auto-rotation. Keep the original
    // dramatic carousel feel (scale 0.6, back.out, y:80); the user's scroll
    // spec governs below-the-fold sections.
    const mobile = isMobile();
    const hd    = (n) => reduced ? 0 : (mobile ? n * 0.4 : n);
    const hdur  = (n) => reduced ? 0.001 : (mobile ? n * 0.8 : n);
    const hez   = (full) => (mobile || reduced) ? "power2.out" : full;

    if (!reduced) {
      const entrance = gsap.timeline({ defaults: { ease: hez("power3.out") } });
      entrance
        .from(".hero__marker",      { y: hd(18), autoAlpha: 0, duration: hdur(0.7), delay: 0.1 })
        .from(".hero__eyebrow",     { y: hd(20), autoAlpha: 0, duration: hdur(0.6) }, "-=0.4")
        .from(".hero__title",       { y: hd(36), autoAlpha: 0, duration: hdur(0.85), ease: hez("back.out(1.4)") }, "-=0.45")
        .from(".hero__tagline",     { y: hd(20), autoAlpha: 0, duration: hdur(0.6) }, "-=0.6")
        .from(".hero__actions > *", { y: hd(16), autoAlpha: 0, duration: hdur(0.5), stagger: 0.08 }, "-=0.5")
        .from(".hero__dots > *",    { y: hd(12), autoAlpha: 0, duration: hdur(0.4), stagger: 0.05 }, "-=0.35")
        .from(".hero__bottle.is-active img",
          mobile
            ? { y: hd(80), autoAlpha: 0, duration: hdur(1.1), ease: hez("back.out(1.5)") }
            : { y: 80, scale: 0.8, autoAlpha: 0, duration: 1.1, ease: "back.out(1.5)" },
          "-=0.9")
        .from(".hero__kente",
          mobile
            ? { autoAlpha: 0, duration: hdur(1), stagger: 0.08 }
            : { scaleY: 0, autoAlpha: 0, transformOrigin: "50% 0%", duration: 1, stagger: 0.08 },
          "-=1")
        .from(".hero__marquee",     { y: hd(24), autoAlpha: 0, duration: hdur(0.6) }, "-=0.4");
    }

    function show(target) {
      if (target === idx) return;
      const prev = idx;
      idx = target;
      const p = PRODUCTS[target];

      if (reduced) {
        gsap.set(hero, { backgroundColor: p.color });
        gsap.set(bottles[prev], { autoAlpha: 0 });
        bottles[prev].classList.remove("is-active");
        bottles[target].classList.add("is-active");
        gsap.set(bottles[target], { autoAlpha: 1, scale: 1, y: 0 });
        eyebrowEl.textContent = p.type;
        titleEl.textContent   = p.name;
        taglineEl.textContent = p.tagline;
      } else {
        gsap.to(hero, { backgroundColor: p.color, duration: hdur(0.9), ease: "power2.inOut" });

        const outVars = { autoAlpha: 0, duration: hdur(0.55), ease: "power2.in",
          onComplete: () => bottles[prev].classList.remove("is-active") };
        if (!mobile) outVars.scale = 0.6;
        gsap.to(bottles[prev], outVars);

        bottles[target].classList.add("is-active");
        const fromVars = mobile ? { autoAlpha: 0, y: hd(40) } : { autoAlpha: 0, scale: 0.6, y: 40 };
        const toVars   = mobile
          ? { autoAlpha: 1, y: 0, duration: hdur(0.9), ease: hez("back.out(1.4)") }
          : { autoAlpha: 1, scale: 1, y: 0, duration: 0.9, ease: "back.out(1.4)" };
        gsap.fromTo(bottles[target], fromVars, toVars);

        const tl = gsap.timeline();
        tl.to([eyebrowEl, titleEl, taglineEl], {
            autoAlpha: 0, y: hd(-16), duration: hdur(0.28), stagger: 0.04, ease: "power2.in"
          })
          .add(() => {
            eyebrowEl.textContent = p.type;
            titleEl.textContent   = p.name;
            taglineEl.textContent = p.tagline;
          })
          .set([eyebrowEl, titleEl, taglineEl], { y: hd(26) })
          .to([eyebrowEl, titleEl, taglineEl], {
            autoAlpha: 1, y: 0, duration: hdur(0.55), stagger: 0.07, ease: hez("back.out(1.5)")
          });
      }

      dots.forEach((d, i) => {
        d.classList.toggle("is-active", i === target);
        d.setAttribute("aria-selected", String(i === target));
      });
    }

    function clearTimer() { if (timer) { timer.kill(); timer = null; } }

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

    function pauseRotation()  { paused = true; clearTimer(); }
    function resumeRotation() { paused = false; queueNext(); }

    dots.forEach((d, i) => {
      d.addEventListener("click", () => { show(i); queueNext(); });
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

    function onStart(x, y) { tracking = true; startX = x; startY = y; pauseRotation(); }
    function onEnd(x, y) {
      if (!tracking) return;
      tracking = false;
      const dx = x - startX, dyv = y - startY;
      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dyv)) {
        const dir = dx < 0 ? 1 : -1;
        show((idx + dir + PRODUCTS.length) % PRODUCTS.length);
      }
      resumeRotation();
    }

    hero.addEventListener("touchstart", (e) => { const t = e.changedTouches[0]; onStart(t.clientX, t.clientY); }, { passive: true });
    hero.addEventListener("touchend",   (e) => { const t = e.changedTouches[0]; onEnd(t.clientX, t.clientY); });
    hero.addEventListener("touchcancel", () => { tracking = false; resumeRotation(); });
    hero.addEventListener("mousedown",  (e) => { if (e.button !== 0) return; onStart(e.clientX, e.clientY); });
    window.addEventListener("mouseup",  (e) => { if (!tracking) return; onEnd(e.clientX, e.clientY); });

    queueNext();
  }

  /* ---------- section entrance animations ---------- */

  function initJerrys() {
    const section = document.querySelector(".jerrys");
    if (!section || reduced) return;

    const heading = section.querySelector(".jerrys__title");
    const eyebrow = section.querySelector(".jerrys__eyebrow");
    const sub     = section.querySelector(".jerrys__sub");
    const body    = section.querySelector(".jerrys__body");
    const awards  = section.querySelectorAll(".jerrys__award");
    const cta     = section.querySelector(".jerrys__cta");
    const media   = section.querySelector(".jerrys__media");

    animateEntrance([eyebrow], section);
    animateHeading(heading, section);
    animateEntrance([sub, body, ...Array.from(awards)].filter(Boolean), section);
    animateImage(media, section);
    animateButton(cta, section);
  }

  function initStory() {
    const story = document.querySelector(".story");
    if (!story || reduced) return;

    // Pre-existing DOM: <span class="word"><span>w</span></span> — one "word" per line for this heading.
    // Group words into lines via measured top-offset, then animate per line per spec.
    const words = Array.from(story.querySelectorAll(".story__headline .word > span"));
    if (!words.length) return;
    words.forEach((w) => { w.style.willChange = "transform, opacity"; });

    const lines = [];
    let lastTop = null, current = null;
    words.forEach((w) => {
      const top = w.parentNode.offsetTop;
      if (lastTop === null || Math.abs(top - lastTop) > 2) {
        current = [];
        lines.push(current);
        lastTop = top;
      }
      current.push(w);
    });

    gsap.set(words, { yPercent: 100, autoAlpha: 0 });

    const tl = gsap.timeline({ scrollTrigger: ST(".story__headline") });
    lines.forEach((lineWords, i) => {
      tl.to(lineWords, {
        yPercent: 0,
        autoAlpha: 1,
        duration: ddur(DUR_HEADING),
        ease: EASE_HEADING
      }, i * STAGGER_LINES);
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
    let autoPaused = false;
    let lastT = null;
    let RX = 320, RY = 60;
    const SPEED = 0.00018;
    const HOVER_SCALE = 1.4;
    const baseAngles = bottles.map((_, i) => (i / bottles.length) * Math.PI * 2);

    function setHover(i) {
      if (hoverIdx === i) return;
      hoverIdx = i;
      if (hoverTween) hoverTween.kill();
      const target = i >= 0 ? 1 : 0;
      hoverTween = gsap.to({ v: hoverBoost }, {
        v: target, duration: 0.32, ease: "power2.out",
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
      if (!autoPaused && hoverIdx < 0 && hoverBoost < 0.01 && !reduced) rotation += dt * SPEED;
      for (let i = 0; i < bottles.length; i++) {
        renderBottle(i, baseAngles[i] + rotation);
      }
    }

    computeRadii();
    gsap.ticker.add(tick);
    window.addEventListener("load", computeRadii);

    bottles.forEach((b, i) => {
      b.addEventListener("mouseenter", () => { setHover(i); b.classList.add("is-hover"); });
      b.addEventListener("mouseleave", () => { if (hoverIdx === i) setHover(-1); b.classList.remove("is-hover"); });
      b.addEventListener("focus",      () => { setHover(i); b.classList.add("is-hover"); });
      b.addEventListener("blur",       () => { if (hoverIdx === i) setHover(-1); b.classList.remove("is-hover"); });
      b.addEventListener("click", (e) => {
        e.preventDefault();
        const href = b.dataset.target;
        if (!href) return;
        if (href.startsWith("#")) {
          const target = document.querySelector(href);
          if (!target) return;
          const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 72;
          const y = target.getBoundingClientRect().top + window.pageYOffset - navH + 2;
          window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
        } else {
          window.location.href = href;
        }
      });
    });

    function handleResize() {
      const wasMobile = mobile;
      mobile = mq.matches;
      if (mobile && !wasMobile) clearInline();
      else if (!mobile) computeRadii();
    }
    window.addEventListener("resize", handleResize);
    if (mq.addEventListener) mq.addEventListener("change", handleResize);
    else if (mq.addListener) mq.addListener(handleResize);

    if (mobile) clearInline();

    window.__orbital = {
      pauseAuto:   () => { autoPaused = true; },
      resumeAuto:  () => { autoPaused = false; lastT = null; },
      getRotation: () => rotation,
      setRotation: (r) => { rotation = r; },
      bottleCount: bottles.length,
      stage:       stage,
      isMobile:    () => mobile
    };
    window.dispatchEvent(new CustomEvent("orbital:ready"));

    if (reduced) {
      gsap.set(".orbital__title", { autoAlpha: 1, y: 0 });
      gsap.set(".orbital__stage", { autoAlpha: 1 });
    } else {
      animateHeading(section.querySelector(".orbital__title"), section);
      animateImage(stage, section);
    }
  }

  function initTetra() {
    const section = document.querySelector(".tetra");
    if (!section || reduced) return;

    const heroImg = section.querySelector(".tetra__hero img");
    const eyebrow = section.querySelector(".tetra__eyebrow");
    const title   = section.querySelector(".tetra__title");
    const sub     = section.querySelector(".tetra__sub");
    const cards   = section.querySelectorAll(".tetra-card");

    animateImage(heroImg, section.querySelector(".tetra__hero"));
    animateEntrance([eyebrow], section.querySelector(".tetra__head"));
    animateHeading(title, section.querySelector(".tetra__head"));
    animateEntrance([sub], section.querySelector(".tetra__head"));
    animateImage(cards, section.querySelector(".tetra__grid"), { stagger: STAGGER });
  }

  function initProductsHeader() {
    const head = document.querySelector(".products__head");
    if (!head || reduced) return;
    const eyebrow = head.querySelector(".products__eyebrow");
    const title   = head.querySelector(".products__title");
    const sub     = head.querySelector(".products__sub");
    animateEntrance([eyebrow], head);
    animateHeading(title, head);
    animateEntrance([sub], head);
  }

  function initProducts() {
    if (reduced) return;
    const sections = gsap.utils.toArray(".product");

    sections.forEach((section) => {
      const bottle   = section.querySelector(".product__bottle");
      const name     = section.querySelector(".product__text h2, .product__text h3, .product__name");
      const textKids = Array.from(section.querySelectorAll(".product__text > *"));
      const copy     = textKids.filter((el) => el !== name && !el.matches("a.btn, .btn"));
      const cta      = section.querySelector(".product__text a.btn, .product__text .btn");

      animateImage(bottle, section);
      if (name) animateHeading(name, section);
      animateEntrance(copy, section);
      if (cta) animateButton(cta, section);
    });
  }

  function initContact() {
    const section = document.querySelector(".contact");
    if (!section || reduced) return;
    const eyebrow  = section.querySelector(".contact__eyebrow");
    const headline = section.querySelector(".contact__headline");
    const body     = section.querySelector(".contact__body");
    const grid     = section.querySelector(".contact__grid");
    const mail     = section.querySelector(".contact__mail");

    animateEntrance([eyebrow], section);
    animateHeading(headline, section);
    animateEntrance([body, grid].filter(Boolean), section);
    animateButton(mail, section);
  }

  function initCollectionHero() {
    const hero = document.querySelector(".collection-hero");
    if (!hero || reduced) return;

    const eyebrow = hero.querySelector(".collection-hero__eyebrow");
    const title   = hero.querySelector(".collection-hero__title");
    const sub     = hero.querySelector(".collection-hero__sub");
    const kente   = hero.querySelectorAll(".collection-hero__kente");

    prep([eyebrow, sub, ...Array.from(kente)].filter(Boolean));

    const tl = gsap.timeline({ defaults: { ease: EASE_BASE } });
    if (eyebrow) {
      tl.fromTo(eyebrow,
        { y: dy(Y_BASE), autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: ddur(DUR_BASE), delay: 0.1 });
    }

    // Heading line-split, stitched into the entrance timeline.
    const lines = title ? splitHeadingLines(title) : [];
    if (lines.length) {
      lines.forEach((words, i) => {
        tl.fromTo(words,
          { yPercent: 100, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: ddur(DUR_HEADING), ease: EASE_HEADING },
          `-=${i === 0 ? 0.5 : Math.max(0, ddur(DUR_HEADING) - STAGGER_LINES)}`);
      });
    } else if (title) {
      tl.fromTo(title,
        { y: dy(Y_BASE), autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: ddur(DUR_HEADING), ease: EASE_HEADING },
        "-=0.5");
    }

    if (sub) {
      tl.fromTo(sub,
        { y: dy(Y_BASE), autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: ddur(DUR_BASE) },
        "-=0.5");
    }
    if (kente.length) {
      tl.fromTo(kente,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: ddur(DUR_IMAGE), ease: EASE_IMAGE, stagger: 0.08 },
        "-=0.8");
    }
  }

  function initPremium() {
    const section = document.querySelector(".premium");
    if (!section || reduced) return;

    const eyebrow = section.querySelector(".premium__eyebrow");
    const title   = section.querySelector(".premium__title");
    const sub     = section.querySelector(".premium__sub");
    const cards   = section.querySelectorAll(".premium-card");

    animateEntrance([eyebrow], section.querySelector(".premium__head"));
    animateHeading(title, section.querySelector(".premium__head"));
    animateEntrance([sub], section.querySelector(".premium__head"));
    animateImage(cards, section.querySelector(".premium__grid"), { stagger: STAGGER });
  }

  function initContactCta() {
    const section = document.querySelector(".contact-cta");
    if (!section || reduced) return;

    const eyebrow = section.querySelector(".contact-cta__eyebrow");
    const title   = section.querySelector(".contact-cta__title");
    const sub     = section.querySelector(".contact-cta__sub");
    const actions = section.querySelectorAll(".contact-cta__actions a, .contact-cta__actions .btn");

    animateEntrance([eyebrow], section);
    animateHeading(title, section);
    animateEntrance([sub], section);
    if (actions.length) animateButton(actions, section);
  }

  function initFooter() {
    const footer = document.querySelector(".footer");
    if (!footer || reduced) return;

    const logo    = footer.querySelector(".footer__logo");
    const tag     = footer.querySelector(".footer__tag");
    const cols    = footer.querySelectorAll(".footer__col");
    const smalls  = footer.querySelectorAll(".footer__small, .footer__copy");
    const kente   = footer.querySelector(".footer__kente");

    animateImage(logo, footer);
    animateEntrance([tag, ...Array.from(cols), ...Array.from(smalls)].filter(Boolean), footer);
    if (kente) {
      prep(kente);
      gsap.fromTo(kente,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: ddur(DUR_IMAGE),
          ease: EASE_IMAGE,
          scrollTrigger: ST(footer)
        }
      );
    }
  }

  /* ---------- count-up stat numbers ---------- */

  function initCounters() {
    if (reduced) return;
    const els = document.querySelectorAll("[data-count]");
    els.forEach((el) => {
      const target = parseFloat(el.dataset.count);
      if (Number.isNaN(target)) return;
      const suffix = el.dataset.suffix || "";
      const prefix = el.dataset.prefix || "";
      const obj = { v: 0 };
      el.textContent = prefix + "0" + suffix;
      gsap.to(obj, {
        v: target,
        duration: ddur(DUR_COUNT),
        ease: EASE_IMAGE,
        onUpdate: () => {
          el.textContent = prefix + Math.round(obj.v).toLocaleString() + suffix;
        },
        scrollTrigger: ST(el)
      });
    });
  }

  /* ---------- anchors ---------- */

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

  /* ---------- loader ---------- */

  function trackLoaderProgress() {
    const fill = document.getElementById("loaderFill");
    if (!fill) return;
    const imgs = Array.from(document.images).filter((img) => img.loading !== "lazy");
    const total = Math.max(imgs.length, 1);
    let loaded = 0;
    const bump = () => {
      loaded += 1;
      fill.style.width = Math.min(100, Math.round((loaded / total) * 100)) + "%";
    };
    imgs.forEach((img) => {
      if (img.complete) { bump(); return; }
      img.addEventListener("load",  bump, { once: true });
      img.addEventListener("error", bump, { once: true });
    });
  }

  function revealLoader() {
    const fill = document.getElementById("loaderFill");
    if (fill) fill.style.width = "100%";
    const loader = document.getElementById("loader");
    if (!loader) return;
    loader.classList.add("is-done");
    setTimeout(() => { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 700);
  }

  let started = false;
  function start() {
    if (started) return;
    started = true;
    try { boot(); } catch (err) { console.error("[rnv] boot failed", err); }
    document.body.classList.add("anim-ready");
    if (typeof ScrollTrigger !== "undefined") {
      try { ScrollTrigger.refresh(); } catch (err) { /* noop */ }
    }
    revealLoader();
  }

  function go() {
    trackLoaderProgress();
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    setTimeout(start, 2000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", go);
  } else {
    go();
  }
})();
