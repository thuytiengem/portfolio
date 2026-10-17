// 3D Artwork page layout (owner's pick: variant 1 "Progression") — same rhythm as the 2D Artwork page: banner, sticky
// jump chips (▶ = the project has a final video), one numbered section per 3D project. Each section: counts line, tools
// + text, FINAL RESULT (framed videos, final-image filmstrip; a portrait / Shorts video sits beside the text), then
// PROCESS steps on the cyan rail of art2d.css, each with its text, optional video and filmstrip.
import { h, $$, reveal } from "../utils.js";
import { tr, bind, label } from "../i18n.js";
import { setRich } from "../richtext.js";
import { lbl, rich, num } from "../project/parts.js";
import { filmstrip } from "../project/gallery.js";
import { framedVideo } from "../youtube.js";
import { pageBanner, titleFont } from "../page-banner.js";
import { jumpBar } from "../art2d/render.js";
import { has } from "./model.js";

/** title from a data value; switches to the fallback font when Qualy can't draw it (Vietnamese) */
const title = (tag, value, cls) => has(value) ? bind(h(tag, { class: cls }), el => titleFont(setRich(el, tr(value)))) : null;

/** "{n} images" / "{n} image" (follows the language); null for 0 */
const countText = (n, many, one) => n ? bind(h("span", { class: "a3-count" }), el => { el.textContent = label(n === 1 ? one : many, { n }); }) : null;
const imagesCount = n => countText(n, "pd_images", "pd_image");

/** "3 steps · 9 images · 2 videos" (only the non-zero ones) */
function countsLine(p) {
  const parts = [countText(p.count.steps, "a3_steps", "a3_step_one"), imagesCount(p.count.images),
    countText(p.count.videos, "a3_videos", "a3_video_one")].filter(Boolean);
  return parts.length ? h("p", { class: "a3-counts" }, parts) : null;
}

/** TOOLS  [Blender] [Substance Painter] */
const toolsRow = tools => tools.length ? h("div", { class: "a3-tools" },
  lbl("span", "a3_tools", "a3-kicker"),
  h("div", { class: "a3-tool-list" }, tools.map(t => bind(h("span", { class: "a3-tool" }), el => setRich(el, tr(t)))))) : null;

/** small uppercase kicker with a cyan line: "FINAL RESULT ───" */
const kicker = key => h("div", { class: "a3-kick" }, lbl("span", key), h("i", { "aria-hidden": "true" }));

/** one framed YouTube video (cyan HUD corners, autoplay muted in view) + optional caption */
function videoFigure(v, cls = "") {
  if (!v) return null;
  return h("figure", { class: `a3-video ${v.orientation === "portrait" ? "is-portrait" : "is-landscape"} ${cls}` },
    framedVideo(v),
    has(v.caption) ? bind(h("figcaption", { class: "a3-cap" }), el => setRich(el, tr(v.caption))) : null);
}
const videoRow = list => list.length ? h("div", { class: `a3-videos n${Math.min(list.length, 2)}` }, list.map(v => videoFigure(v))) : null;

function stepRow(st, i) {
  return h("li", { class: "a2-step" },
    h("div", { class: "a2-step-n", "aria-hidden": "true" }, num(i + 1)),
    h("div", { class: "a2-step-body" },
      h("div", { class: "a2-step-head" },
        lbl("span", "a3_step", "a2-step-kicker", { n: i + 1 }),
        title("h3", st.title, "a2-step-title"),
        imagesCount(st.images.length)),
      rich(st.text, "stage-text"),
      videoFigure(st.video, "a3-step-video"),
      filmstrip(st.images)));
}

/** FINAL RESULT: portrait videos beside the text (+ stills), landscape ones full width, then the final images */
function finalBlock(p, about) {
  const { videos, images } = p.final;
  if (!videos.length && !images.length) return about;
  const port = videos.filter(v => v.orientation === "portrait"), land = videos.filter(v => v.orientation === "landscape");
  const strip = filmstrip(images);
  if (port.length) {
    return h("div", { class: "a3-final" },
      kicker("a3_final"),
      h("div", { class: "a3-split" },
        h("div", { class: "a3-split-media" }, port.map(v => videoFigure(v))),
        h("div", { class: "a3-split-text" }, about, strip)),
      videoRow(land));
  }
  // no video: the final renders are the hero (bigger filmstrip)
  return h("div", { class: `a3-final${videos.length ? "" : " stills"}` }, about, kicker("a3_final"), videoRow(land), strip);
}

function section(p, n) {
  const about = (p.tools.length || has(p.text)) ? h("div", { class: "a3-about" }, toolsRow(p.tools), rich(p.text, "stage-text")) : null;
  return h("section", { class: "pd-sec a2-sec a3-sec", id: p.id },
    h("div", { class: "container" },
      h("header", { class: "pd-h" }, h("span", { class: "pd-h-num" }, num(n)), title("h2", p.name)),
      countsLine(p)),
    h("div", { class: "container a3-body" },
      finalBlock(p, about),
      p.steps.length ? h("div", { class: "a3-process" },
        kicker("a3_process"),
        h("ol", { class: "a2-steps" }, p.steps.map(stepRow))) : null));
}

const playMark = p => p.final.videos.length ? h("span", { class: "a3-chip-play", "aria-hidden": "true" }) : null;

/** banner ("← Home", 3D ARTWORK, intro, projects / videos / images) + jump bar + projects (or "No 3D projects yet.") */
export function renderArt3D(model, main) {
  const list = model.projects, t = model.totals;
  const chips = list.length ? [
    { key: t.projects === 1 ? "a3_count_one" : "a3_count", n: t.projects },
    t.videos ? { key: t.videos === 1 ? "a3_video_one" : "a3_videos", n: t.videos } : null,
    t.images ? { key: t.images === 1 ? "pd_image" : "pd_images", n: t.images } : null] : [];
  main.replaceChildren(...[
    pageBanner({ back: { key: "a3_back", href: "index.html" }, title: "a3_page_title", intro: model.intro, chips }),
    list.length > 1 ? jumpBar(list, { aria: "a3_jump", tail: playMark }) : null,
    ...list.map((p, i) => section(p, i + 1)),
    list.length ? null : h("div", { class: "container" }, lbl("p", "a3_empty", "a2-empty"))].filter(Boolean));
  // reveal piece by piece: a whole project section is taller than the screen (its threshold would never be reached)
  $$(".a3-sec > .container:first-child, .a3-final, .a3-about, .a3-process > .a3-kick, .a3-process .a2-step", main)
    .filter((el, _, all) => !all.some(o => o !== el && o.contains(el)))
    .forEach(reveal);
}
