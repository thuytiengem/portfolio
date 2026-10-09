// Step library used by timeline.js. Each step gets (ctx, options) and may return a Promise.
// To add a new effect: write it in ./effects/, then register a step here and use it in timeline.js.
import { shake } from "./effects/shake.js";
import { C0, PIXELS, rand, slices, flash, shockwave } from "./effects/glass.js";
import { sleep } from "../utils.js";

export const STEPS = {
  powerOn: ({ scene }) => {
    scene.intact.style.opacity = 0;
    scene.electric.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0.1 }, { opacity: 0.8 }, { opacity: 0 }, { opacity: 1 }],
      { duration: 520, easing: "steps(1)", fill: "both" });
  },

  glassIn: ({ scene }) => scene.intact.animate([{ opacity: 0, filter: "blur(10px)" }, { opacity: 1, filter: "none" }], { duration: 500, fill: "forwards" }),

  overload: async ({ scene }, o) => {
    const dur = o.dur ?? 1000;
    scene.electric.animate([{ filter: "drop-shadow(0 0 4px #7ff3ff) brightness(1)" }, { filter: "drop-shadow(0 0 18px #7ff3ff) drop-shadow(0 0 40px #3ef2ff) brightness(2.2)" }],
      { duration: dur, easing: "ease-in", fill: "forwards" });
    const sl = slices(scene, 7);
    sl.els.forEach(s => s.animate(
      Array.from({ length: 8 }, (_, i) => ({ transform: `translateX(${i === 7 ? 0 : rand(-1, 1) * (6 + i * 4)}px)`, opacity: i % 3 === 1 ? 0.4 : 1 })),
      { duration: dur, easing: "steps(8)", fill: "both" }));
    shake(scene.group, { dur, maxPx: 6, maxRot: 0.4 });
    await sleep(dur);
    sl.cleanup();
  },

  explode: (c, o) => {
    const { scene, el, P } = c;
    flash(el.flash);
    shockwave(el.ring);
    scene.group.style.visibility = "hidden";
    scene.shardsBox.hidden = false;
    scene.glow.animate([{ opacity: 0 }, { opacity: 0.8 }], { duration: 800, fill: "forwards" });
    scene.shards.forEach(s => {
      const h = scene.home(s, 0.8);
      s.img.animate([
        { transform: `translate(${h.x}px, ${h.y}px) rotateY(0deg)`, filter: "brightness(3)" },
        { transform: `translate3d(${s.dir.x * 60}px, ${s.dir.y * 60}px, ${rand(60, 160)}px) rotateX(${rand(-50, 50)}deg) rotateY(${rand(-60, 60)}deg)`, filter: "brightness(1.4)", offset: 0.45 },
        { transform: "none", filter: "none" },
      ], { duration: o.settle ?? 1300, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" });
    });
    // a small burst of small pieces only; they brake to a stop and stay on screen with signal errors
    const p = scene.toHero(C0.x, C0.y);
    P.emit({ ...p, spread: 40, count: o.particles ?? 24, names: PIXELS, speed: [350, 1100], grav: 0, drag: 3.2, spin: 2, scale: [0.3, 0.65], persist: true, glitch: 0.22 });
    // once settled: the big shards tremble and get the same error glitch
    setTimeout(c.settle, o.settle ?? 1300);
  },

  titleIn: c => c.el.title.classList.add("in", "striped"),

  titleClean: c => c.el.title.classList.remove("striped"),

  brandIn: c => c.el.brand.classList.add("show"),

  quoteIn: c => c.el.quote.classList.add("show"),

  reveal: c => c.done(),
};
