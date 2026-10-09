// Step library used by timeline.js. Each step gets (ctx, options) and may return a Promise.
// To add a new effect: write it in ./effects/, then register a step here and use it in timeline.js.
import { hudIn, hudOut } from "./effects/hud.js";
import { shake } from "./effects/shake.js";
import { drawCracks, shatter, flash } from "./effects/shatter.js";
import { typeText } from "./effects/title.js";

export const STEPS = {
  noise: (c, o) => c.fx.noise(o.dur, o.amount),

  showArt: c => c.el.art.classList.add("on"),

  hudIn: c => hudIn(c.el.hud),

  hudOut: c => hudOut(c.el.hud),

  shake: (c, o) => shake(c.el.artImg, {
    dur: o.dur, maxPx: o.maxPx,
    onFrame: env => c.fx.dust(c.artRect(), env * (o.dust ?? 1)),
  }),

  cracks: c => drawCracks(c.el.cracks),

  shatter: (c, o) => {
    shatter({ art: c.el.art, img: c.el.artImg, cracks: c.el.cracks });
    c.fx.debris(c.artRect(), c.sample, { chips: o.chips, sparks: o.sparks });
    flash(c.el.flash);
  },

  warp: (c, o) => c.fx.warp(o.dur, c.artCenter().x, c.artCenter().y),

  titleIn: c => c.el.title.classList.add("in", "striped"),

  titleClean: c => c.el.title.classList.remove("striped"),

  typeBrand: (c, o) => typeText(c.el.brand, c.text.brand, o.speed),

  quoteOpen: c => c.el.quote.classList.add("in"),

  typeQuote: (c, o) => typeText(c.el.quoteText, c.text.quote(), o.speed, { keepCaret: true }),

  reveal: c => c.done(),
};
