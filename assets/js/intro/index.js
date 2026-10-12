// Intro runner: builds the glass scene + particles, sets the texts and plays timeline.js.
// Returns replay(): plays the intro again from a fresh scene (used by the Home link / logo).
import { INTRO_ENABLED, TIMELINE } from "./timeline.js";
import { STEPS } from "./steps.js";
import { preloadTextures, buildStage, tremble, errorGlitch } from "./effects/glass.js";
import { createParticles } from "./effects/particles.js";
import { idleGlitch } from "./effects/title.js";
import { $, sleep, reducedMotion } from "../utils.js";
import { bindText } from "../i18n.js";

/**
 * @param config  web-config.json (uses config.intro)
 * @param onDone  called once the intro is finished (show topbar, unlock scroll…)
 * @returns replay() — restarts the intro (no-op with reduced motion / INTRO_ENABLED = false)
 */
export async function runIntro(config, onDone) {
  const intro = config.intro || {};
  const el = {
    hero: $("#home"), stage: $("#heroStage"), ring: $("#heroRing"), fx: $("#heroFx"), flash: $("#heroFlash"),
    brand: $("#heroBrand"), title: $("#heroTitle"), quote: $("#heroQuote"), quoteText: $("#heroQuoteText"),
  };
  el.title.textContent = intro.title || "PORTFOLIO";
  el.title.dataset.text = el.title.textContent;
  el.brand.textContent = intro.brand || "";
  bindText(el.quoteText, intro.quote);

  const [, sprites] = await Promise.all([document.fonts?.ready, preloadTextures()]);
  const P = createParticles(el.fx, sprites);

  // idle effects only run while the hero is on screen
  let heroVisible = true;
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; P.setActive(heroVisible); }).observe(el.hero);
  const active = () => heroVisible;
  const still = reducedMotion();

  let run = 0, stops = [];
  /** one play of the intro; a newer play makes the older one stop at its next step */
  async function play(instant) {
    const id = ++run, alive = () => id === run;
    stops.forEach(stop => stop()); stops = [];
    P.clear();
    [el.ring, el.flash, el.title].forEach(e => e.getAnimations().forEach(a => a.cancel()));
    el.title.classList.remove("in", "striped");
    el.brand.classList.remove("show");
    el.quote.classList.remove("show");
    const scene = buildStage(el.stage);

    let settled = false, finished = false;
    const ctx = {
      el, scene, P,
      /** shards tremble + idle "signal error" glitches */
      settle() {
        if (settled || still || !alive()) return;
        settled = true;
        tremble(scene);
        stops.push(errorGlitch(scene, P, { active }));
      },
      done() {
        if (finished || !alive()) return;
        finished = true;
        if (!still) stops.push(idleGlitch(el.title, { active }));
        onDone?.();
      },
    };

    // ?nointro (used by the Studio preview) opens directly on the final state
    if (instant) {
      scene.group.style.visibility = "hidden";
      scene.shardsBox.hidden = false;
      scene.glow.style.opacity = 0.8;
      el.title.classList.add("in");
      el.brand.classList.add("show");
      el.quote.classList.add("show");
      ctx.settle();
      ctx.done();
      return;
    }

    for (const s of TIMELINE) {
      if (s.wait) await sleep(s.wait);
      if (!alive()) return;
      const fn = STEPS[s.step];
      if (!fn) { console.warn(`Intro: unknown step "${s.step}"`); continue; }
      const result = fn(ctx, s);
      if (s.await) await result;
      if (!alive()) return;
    }
    ctx.done();
  }

  const canPlay = INTRO_ENABLED && !still;
  await play(!canPlay || new URLSearchParams(location.search).has("nointro"));
  return () => { if (canPlay) play(false); };
}
