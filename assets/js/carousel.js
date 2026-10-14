// Looping 3D coverflow: drag / swipe with momentum + auto snap, arrows, keyboard,
// trackpad horizontal scroll, autoplay. Calls onChange(index) when the centered item changes.
import { h } from "./utils.js";

export function createCarousel(stage, { images, onChange, autoplayMs = 4500 }) {
  const n = images.length;
  let pos = 0, current = -1, W = 0, anim = 0;
  const wrap = i => ((i % n) + n) % n;
  const offset = i => wrap(i - pos + n / 2) - n / 2;   // signed shortest distance on the loop

  const items = images.map((src, i) => {
    const el = h("div", { class: "carousel-item", style: { backgroundImage: `url("${src}")` }, role: "img" });
    el.addEventListener("click", () => { if (!moved) goTo(pos + offset(i)); });
    stage.appendChild(el);
    return el;
  });

  function measure() {
    W = Math.min(window.innerWidth * (window.innerWidth < 700 ? 0.72 : 0.36), 560);
    stage.style.setProperty("--w", `${W}px`);
    render();
  }

  function render() {
    const step = W * 0.92;
    items.forEach((el, i) => {
      const d = offset(i), a = Math.abs(d), s = Math.sign(d);
      const x = a <= 1 ? d * step : s * (step + (a - 1) * W * 0.38);
      const rot = -Math.max(-1, Math.min(1, d)) * 48;
      const z = -Math.min(a, 2.5) * 160;
      el.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${rot}deg)`;
      el.style.opacity = a > 2.4 ? 0 : a > 1.6 ? 1 - (a - 1.6) / 0.8 : 1;
      el.style.zIndex = 100 - Math.round(a * 10);
      el.style.filter = a > 0.5 ? `brightness(${1 - Math.min(a, 2) * 0.12})` : "";
      el.classList.toggle("active", a < 0.5);
    });
  }

  function setCurrent(i) {
    if (i === current) return;
    current = i;
    onChange?.(i);
  }

  // every move (arrow, key, drag, wheel, autoplay) stops autoplay; it is re-armed only once the snap has
  // finished, so an autoplay step can never start in the middle of another animation
  let animating = false;
  function animateTo(target, dur = 650) {
    cancelAnimationFrame(anim);
    stopAuto();
    animating = true;
    target = Math.round(target);
    const from = pos, t0 = performance.now();
    setCurrent(wrap(target));
    const tick = now => {
      const t = Math.min(1, (now - t0) / dur);
      pos = from + (target - from) * (1 - Math.pow(1 - t, 4));
      render();
      if (t < 1) anim = requestAnimationFrame(tick);
      else { pos = wrap(target); render(); animating = false; scheduleAuto(); }
    };
    anim = requestAnimationFrame(tick);
  }
  const goTo = target => animateTo(target);
  const next = () => goTo(Math.round(pos) + 1);
  const prev = () => goTo(Math.round(pos) - 1);

  stage.querySelector(".next")?.addEventListener("click", e => { e.stopPropagation(); next(); });
  stage.querySelector(".prev")?.addEventListener("click", e => { e.stopPropagation(); prev(); });

  // ---- drag / swipe ----
  let dragging = false, moved = false, startX = 0, startPos = 0, lastX = 0, lastT = 0, vel = 0;
  stage.addEventListener("pointerdown", e => {
    if (e.target.closest(".carousel-arrow")) return;
    dragging = true; moved = false;
    cancelAnimationFrame(anim); animating = false; stopAuto();
    startX = lastX = e.clientX; startPos = pos; lastT = performance.now(); vel = 0;
    stage.setPointerCapture(e.pointerId);
    stage.classList.add("dragging");
  });
  stage.addEventListener("pointermove", e => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 5) moved = true;
    pos = startPos - dx / (W * 0.92);
    const now = performance.now();
    vel = (e.clientX - lastX) / Math.max(1, now - lastT);
    lastX = e.clientX; lastT = now;
    render();
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove("dragging");
    if (!moved) { scheduleAuto(); return; }
    const fling = -vel * 260 / (W * 0.92);        // momentum, in items
    goTo(pos + Math.max(-3, Math.min(3, fling)));
  };
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  // ---- trackpad horizontal scroll ----
  let wheelTimer = 0;
  stage.addEventListener("wheel", e => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    cancelAnimationFrame(anim); animating = false; stopAuto();
    pos += e.deltaX / (W * 1.5);
    render();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => goTo(pos), 120);
  }, { passive: false });

  stage.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });

  // ---- autoplay: one step per cooldown, counted from the end of the last snap ----
  // (skipped while hovered, dragged, animating or off-screen — then it simply waits another cooldown)
  let autoTimer = 0, hover = false, visible = false;
  function stopAuto() { clearTimeout(autoTimer); autoTimer = 0; }
  function scheduleAuto() {
    stopAuto();
    if (autoplayMs > 0 && n > 1) autoTimer = setTimeout(() => {
      if (!dragging && !hover && !animating && visible && !document.hidden) next(); else scheduleAuto();
    }, autoplayMs);
  }
  stage.addEventListener("pointerenter", () => hover = true);
  stage.addEventListener("pointerleave", () => hover = false);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.3 }).observe(stage);

  window.addEventListener("resize", measure);
  measure();
  setCurrent(0);
  scheduleAuto();

  return { goTo: i => goTo(pos + offset(i)), next, prev };
}
