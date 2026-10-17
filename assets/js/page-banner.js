// Page header banner shared by the portfolio sub-pages (games.html, art2d.html, art3d.html): "← Home" link, then a HUD panel with
// cyan corner brackets (.hud-frame) holding the big title, an intro line and count chips ("5 SECTIONS", "29 ARTWORKS").
// Styles: assets/css/page-banner.css. Every text follows the language (bind).
//
//   pageBanner({ back: { key: "games_back", href: "index.html" }, title: "games_page_title",
//                intro: { key: "games_intro" } | <data value>, chips: [{ key: "games_count", n: 5 }] })
import { h } from "./utils.js";
import { tr, label, bind } from "./i18n.js";
import { setRich } from "./richtext.js";

const has = v => v != null && (Array.isArray(v) ? v.some(has) : typeof v === "object" ? Object.values(v).some(has) : String(v).trim() !== "");

// Qualy (title font) has no glyph for ă ơ ư ĩ ũ and most stacked Vietnamese marks (ả ạ ầ ế …); the browser would mix in
// a fallback font letter by letter. A title containing one of them is drawn in Montserrat instead (.alt-font, base.css),
// so English titles and Vietnamese ones Qualy can draw keep the title font.
const QUALY_MISSING = /[ĂăĨĩŨũƠơƯừ-ͯẠ-ỹ]/;
/** call after every text change of a title element (inside its bind render) */
export function titleFont(el) {
  el.classList.toggle("alt-font", QUALY_MISSING.test(el.textContent));
  return el;
}

/** intro: { key } = UI label, otherwise a data value (string → paragraph, list → bullets) */
function introBlock(intro) {
  if (!intro) return null;
  if (intro.key) return bind(h("p", { class: "pb-intro" }), el => { setRich(el, label(intro.key)); el.hidden = !el.textContent.trim(); });
  if (!has(intro)) return null;
  return bind(h("div", { class: "pb-intro" }), el => {
    const v = tr(intro);
    el.replaceChildren(Array.isArray(v)
      ? h("ul", { class: "list" }, v.filter(has).map(t => setRich(h("li"), tr(t))))
      : setRich(h("p"), v));
  });
}

export function pageBanner({ back, title, intro, chips = [] }) {
  const list = chips.filter(c => c && c.key);
  return h("header", { class: "pb" },
    h("div", { class: "container" },
      back ? bind(h("a", { class: "pb-back", href: back.href || "index.html" }), el => setRich(el, label(back.key))) : null,
      h("div", { class: "hud-frame pb-row" },
        h("div", { class: "pb-text" },
          bind(h("h1", { class: "pb-title" }), el => titleFont(setRich(el, label(title)))),
          introBlock(intro)),
        list.length ? h("div", { class: "pb-chips" },
          list.map(c => bind(h("span", { class: "pb-chip" }), el => setRich(el, label(c.key, { n: c.n }))))) : null,
        ["c1", "c2", "c3", "c4"].map(c => h("i", { class: c, "aria-hidden": "true" })))));
}
