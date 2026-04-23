/* Orbital carousel — drag + spring-snap using native pointer events + GSAP.
   Plain <script defer> — no ES module, no CDN import. Runs after gsap.js
   dispatches `orbital:ready` exposing window.__orbital. */

(function () {
  "use strict";

  const STEP_RAD = (Math.PI * 2) / 7;
  const RESUME_DELAY_MS = 3000;
  const DRAG_THRESHOLD_PX = 5;
  const PX_PER_STEP = 140;

  function radiansPerPixel() {
    return STEP_RAD / PX_PER_STEP;
  }

  function wireUp(orbital) {
    const stage = orbital.stage;
    if (!stage || typeof gsap === "undefined") return;

    const mq = window.matchMedia("(max-width: 768px)");
    let dragging = false;
    let moved = false;
    let startX = 0;
    let lastX = 0;
    let lastT = 0;
    let startRotation = 0;
    let velocity = 0;
    let activeTween = null;
    let resumeTimer = null;
    let activePointerId = null;

    function cancelPending() {
      if (activeTween) { activeTween.kill(); activeTween = null; }
      if (resumeTimer) { clearTimeout(resumeTimer); resumeTimer = null; }
    }

    function scheduleResume() {
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        orbital.resumeAuto();
        resumeTimer = null;
      }, RESUME_DELAY_MS);
    }

    function onStart(e) {
      if (mq.matches || orbital.isMobile()) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;

      cancelPending();
      orbital.pauseAuto();

      dragging = true;
      moved = false;
      activePointerId = e.pointerId;
      startX = lastX = e.clientX;
      lastT = performance.now();
      startRotation = orbital.getRotation();
      velocity = 0;

      try { stage.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
      stage.classList.add("is-dragging");
    }

    function onMove(e) {
      if (!dragging || e.pointerId !== activePointerId) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > DRAG_THRESHOLD_PX) moved = true;

      orbital.setRotation(startRotation + dx * radiansPerPixel());

      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) {
        const frameRad = (e.clientX - lastX) * radiansPerPixel();
        velocity = (frameRad / dt) * 1000;
      }
      lastX = e.clientX;
      lastT = now;
    }

    function onEnd(e) {
      if (!dragging) return;
      if (e && e.pointerId !== activePointerId) return;

      dragging = false;
      activePointerId = null;
      stage.classList.remove("is-dragging");
      try { if (e) stage.releasePointerCapture(e.pointerId); } catch (err) { /* noop */ }

      if (!moved) {
        scheduleResume();
        return;
      }

      const current = orbital.getRotation();
      const projected = current + velocity * 0.28;
      const snapTarget = Math.round(projected / STEP_RAD) * STEP_RAD;

      const state = { rot: current };
      activeTween = gsap.to(state, {
        rot: snapTarget,
        duration: 0.9,
        ease: "elastic.out(1, 0.55)",
        onUpdate: () => orbital.setRotation(state.rot),
        onComplete: () => {
          activeTween = null;
          scheduleResume();
        }
      });
    }

    stage.addEventListener("click", (e) => {
      if (moved) {
        e.stopPropagation();
        e.preventDefault();
        moved = false;
      }
    }, true);

    stage.addEventListener("pointerdown",   onStart);
    stage.addEventListener("pointermove",   onMove);
    stage.addEventListener("pointerup",     onEnd);
    stage.addEventListener("pointercancel", onEnd);
    stage.addEventListener("pointerleave",  (e) => { if (dragging) onEnd(e); });
  }

  function ready(cb) {
    if (window.__orbital) return cb(window.__orbital);
    window.addEventListener("orbital:ready", () => cb(window.__orbital), { once: true });
  }

  ready(wireUp);
})();
