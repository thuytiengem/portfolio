// Building blocks of the project detail page. Every block returns null when its data is empty, so callers
// can pass the result straight to h() (which skips null) — no empty boxes, no "undefined".
import { h } from "../utils.js";
import { tr, label, bind, bindText } from "../i18n.js";
import { setRich } from "../richtext.js";
import { has } from "./model.js";

// ---------- text ----------
/** <tag> with rich text from a data value; null when empty */
export const txt = (tag, value, cls) => has(value) ? bindText(h(tag, { class: cls }), value) : null;
/** UI label (i18n key) that follows the language */
export const lbl = (tag, key, cls, vars) => bind(h(tag, { class: cls }), el => setRich(el, label(key, vars)));

/** Paragraph OR bullet list, decided per language: a string → <p>, an array → <ul class="list">. */
export function rich(value, cls = "") {
  if (!has(value)) return null;
  return bind(h("div", { class: `pd-rich ${cls}` }), el => {
    const v = tr(value);
    el.replaceChildren(Array.isArray(v)
      ? h("ul", { class: "list" }, v.filter(has).map(t => setRich(h("li"), tr(t))))
      : setRich(h("p"), v));
  });
}
/** rich text right now (call inside a bind() render); an array is joined with line breaks */
export const richNow = (tag, v, cls) => has(v) ? setRich(h(tag, { class: cls }), Array.isArray(tr(v)) ? tr(v).map(tr).join("<br>") : tr(v)) : null;

/** A list field that may be [item, item] or { en: [...], vi: [...] } → current-language array */
export const itemsOf = v => { const a = Array.isArray(v) ? v : tr(v); return (Array.isArray(a) ? a : [a]).filter(has); };

/** h() wrapper that returns null when none of the children exist */
export const wrap = (cls, ...kids) => { const k = kids.flat().filter(Boolean); return k.length ? h("div", { class: cls }, k) : null; };
export const num = i => String(i).padStart(2, "0");

// ---------- header ----------
export const logoImg = m => m.logo ? h("img", { class: "pd-logo", src: m.logo, alt: "", width: 512, height: 512 }) : null;
export const coverLayer = m => m.cover ? h("div", { class: "pd-cover", "aria-hidden": "true", style: { backgroundImage: `url("${m.cover}")` } }) : null;
export const tagList = tags => tags.length ? h("div", { class: "tags" }, tags.map(t => bindText(h("span", { class: "tag" }), t))) : null;
export const backLink = () => Object.assign(lbl("a", "pd_back", "pd-back"), { href: "index.html#featured" });

/** "Studio · 2023 – 2024" — the separator travels with the part after it, so a wrapped line never ends with a lone "·" */
export function metaLine(m) {
  const parts = [m.studio, m.period].filter(has);
  if (!parts.length) return null;
  return bind(h("p", { class: "pd-meta" }), el => el.replaceChildren(...parts.map((p, i) =>
    h("span", { class: "meta-part" }, i ? h("span", { class: "sep" }, "·") : null, setRich(h("span"), tr(p))))));
}

/** members: a number → "{n} members" template; a string → as written */
function membersValue(el, members) {
  const v = tr(members);
  if (typeof v !== "number") return setRich(el, String(v));
  const [before, after = ""] = label("pd_members", { n: "\u0000" }).split("\u0000");
  el.textContent = `${before}${v}${after}`.trim();
}

/** HUD stats: downloads → team → genre; only the filled ones */
export function hudStats(m) {
  const items = [];
  if (has(m.downloads)) items.push(["downloads", "pd_downloads", el => setRich(el, String(tr(m.downloads)))]);
  if (has(m.members)) items.push(["team", "pd_team", el => membersValue(el, m.members)]);
  if (has(m.genre)) items.push(["genre", "pd_genre", el => setRich(el, String(tr(m.genre)))]);
  if (!items.length) return null;
  return h("div", { class: "hud-stats" }, items.map(([id, key, value]) =>
    h("div", { class: `stat stat-${id}` }, bind(h("b"), value), lbl("small", key))));
}

// ---------- sections ----------
/** numbered section: "01 MY ROLES ───" heading + body */
export function section(id, key, n, body) {
  return h("section", { class: "pd-sec hud-sec", id },
    h("div", { class: "container" }, h("header", { class: "pd-h" }, h("span", { class: "pd-h-num" }, num(n)), lbl("h2", key))),
    h("div", { class: "container" }, body));
}
