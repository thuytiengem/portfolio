// Intro runner: builds the context (elements, fx canvas, texts) and plays timeline.js.
import { INTRO_ENABLED, TIMELINE } from "./timeline.js";
import { STEPS } from "./steps.js";
import { createFxCanvas, createSampler } from "./effects/fx-canvas.js";
import { shatter } from "./effects/shatter.js";
import { startIdleGlitch } from "./effects/title.js";
import { $, sleep, reducedMotion } from "../utils.js";
import { tr, bindText } from "../i18n.js";

/**
 * @param config  web-config.json (uses config.intro)
 * @param onDone  called once the intro is finished (show topbar, unlock scroll…)
 */
export async function runIntro(config, onDone) {
  const intro = config.intro || {};
  const el = {
    hero: $("#home"),
    art: $("#heroArt"), artImg: $("#heroArtImg"), cracks: $("#heroCracks"),
    hud: $("#heroHud"), flash: $("#heroFlash"),
    brand: $("#heroBrand"), title: $("#heroTitle"),
    quote: $("#heroQuote"), quoteText: $("#heroQuoteText"),
  };
  const heroImage = intro.heroImage || "assets/images/hero.jpg";
  el.artImg.style.backgroundImage = `url("${heroImage}")`;
  el.title.textContent = intro.title || "PORTFOLIO";
  el.title.dataset.text = el.title.textContent;

  const fx = createFxCanvas($("#heroFx"));
  let finished = false;
  const ctx = {
    el, fx,
    sample: createSampler(heroImage),
    text: { brand: intro.brand || "", quote: () => tr(intro.quote) },
    artRect() {
      const a = el.art.getBoundingClientRect(), h = el.hero.getBoundingClientRect();
      return { x: a.left - h.left, y: a.top - h.top, w: a.width, h: a.height };
    },
    artCenter() { const r = ctx.artRect(); return { x: r.x + r.w / 2, y: r.y + r.h / 2 }; },
    done() {
      if (finished) return;
      finished = true;
      // final texts follow the language dropdown from now on
      bindText(el.quoteText, intro.quote);
      el.brand.textContent = ctx.text.brand;
      startIdleGlitch(el.title, fx);
      onDone?.();
    },
  };

  await Promise.all([document.fonts?.ready, preload(heroImage)]);

  // ?nointro (used by the Studio preview) opens directly on the final state
  if (!INTRO_ENABLED || reducedMotion() || new URLSearchParams(location.search).has("nointro")) {
    el.art.classList.add("on");
    shatter({ art: el.art, img: el.artImg, cracks: el.cracks, instant: true });
    el.title.classList.add("in");
    el.quote.classList.add("in");
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

function preload(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = img.onerror = resolve;
    img.src = src;
  });
}
