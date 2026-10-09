// Intro runner: builds the glass scene + particles, sets the texts and plays timeline.js.
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
  const scene = buildStage(el.stage);
  const P = createParticles(el.fx, sprites);

  // idle effects only run while the hero is on screen
  let heroVisible = true;
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; P.setActive(heroVisible); }).observe(el.hero);
  const active = () => heroVisible;
  const still = reducedMotion();

  let settled = false, finished = false;
  const ctx = {
    el, scene, P,
    /** shards tremble + idle "signal error" glitches */
    settle() {
      if (settled || still) return;
      settled = true;
      tremble(scene);
      errorGlitch(scene, P, { active });
    },
    done() {
      if (finished) return;
      finished = true;
      if (!still) idleGlitch(el.title, { active });
      onDone?.();
    },
  };

  // ?nointro (used by the Studio preview) opens directly on the final state
  if (!INTRO_ENABLED || still || new URLSearchParams(location.search).has("nointro")) {
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
    const fn = STEPS[s.step];
    if (!fn) { console.warn(`Intro: unknown step "${s.step}"`); continue; }
    const result = fn(ctx, s);
    if (s.await) await result;
  }
  ctx.done();
}
