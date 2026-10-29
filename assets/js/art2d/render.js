// 2D Artwork page layout (owner's pick of 2 demos, "Tab scroll"): page banner, a sticky bar of tabs (Personal Artworks + the
// other 2D categories) and ONE tab at a time below it = HUD heading + text, then its projects stacked as numbered HUD panels —
// each project = text + filmstrip (+ lightbox).
import { h, $$, reveal, reducedMotion } from "../utils.js";
import { tr, bind, label } from "../i18n.js";
import { setRich } from "../richtext.js";
import { lbl, rich, num } from "../project/parts.js";
import { filmstrip } from "../project/gallery.js";
import { pageBanner, titleFont } from "../page-banner.js";
import { has } from "./model.js";

/** title from a data value; switches to the fallback font when Qualy can't draw it (Vietnamese) */
const title = (tag, value, cls) => has(value) ? bind(h(tag, { class: cls }), el => titleFont(setRich(el, tr(value)))) : null;
/** "7 images" chip (follows the language) */
const count = n => n ? bind(h("span", { class: "pd-count" }), el => { el.textContent = label(n === 1 ? "pd_image" : "pd_images", { n }); }) : null;
const projCount = n => bind(h("span", { class: "pd-count" }), el => { el.textContent = label(n === 1 ? "a2_project_one" : "a2_projects", { n }); });

// ---------- jump to a section ----------
// The heading lands just under the topbar + sticky chip bar. Layout position (offsetTop) ignores the .reveal slide-in
// transform; lazy images above (a single-image filmstrip sizes itself when loaded) can still move the target, so the
// position is checked again when the scroll ends.
const pageY = el => { let y = 0; for (let e = el; e; e = e.offsetParent) y += e.offsetTop; return y; };
export function jumpTo(id, smooth = true) {
  const sec = document.getElementById(id);
  if (!sec) return;
  const head = sec.querySelector(".pd-h") || sec, bar = document.querySelector(".a2-jump");
  const topbar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--topbar-h")) || 60;
  const y = () => Math.max(0, pageY(head) - topbar - (bar ? bar.offsetHeight : 0) - 24);
  scrollTo({ top: y(), behavior: smooth && !reducedMotion() ? "smooth" : "auto" });
  addEventListener("scrollend", () => { if (Math.abs(scrollY - y()) > 4) scrollTo({ top: y(), behavior: "auto" }); }, { once: true });
}

/** chip "01 Character Design 7" */
const countTail = s => s.count ? h("span", { class: "a2-chip-c" }, s.count) : null;
const chip = (s, i, tail) => h("a", { class: "a2-chip", href: `#${s.id}`, "data-id": s.id },
  h("span", { class: "a2-chip-n" }, num(i + 1)),
  has(s.name) ? bind(h("span", { class: "a2-chip-name" }), el => setRich(el, tr(s.name))) : null,
  tail(s));
const chipBar = (chips, aria) => bind(h("nav", { class: "a2-jump" }, h("div", { class: "container" }, h("div", { class: "a2-jump-track" }, chips))),
  el => el.setAttribute("aria-label", label(aria)));
/** mark one chip as current; keep it visible in the (phone) track */
function setOn(chips, id) {
  const track = chips[0]?.parentElement;
  chips.forEach(c => {
    const on = c.dataset.id === id;
    if (on && !c.classList.contains("on") && track.scrollWidth > track.clientWidth)
      track.scrollTo({ left: c.offsetLeft - (track.clientWidth - c.offsetWidth) / 2, behavior: reducedMotion() ? "auto" : "smooth" });
    c.classList.toggle("on", on);
    on ? c.setAttribute("aria-current", "true") : c.removeAttribute("aria-current");
  });
}

/** sticky chip bar + scroll-spy (art3d.html too: its own aria label key + chip tail) */
export function jumpBar(sections, { aria = "a2_jump", tail = countTail } = {}) {
  const chips = sections.map((s, i) => chip(s, i, tail));
  chips.forEach(c => c.addEventListener("click", e => {
    if (!document.getElementById(c.dataset.id)) return;
    e.preventDefault();
    jumpTo(c.dataset.id);
    history.replaceState(null, "", `#${c.dataset.id}`);
  }));
  // highlight the section crossing the upper third of the screen
  const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) setOn(chips, e.target.id); }),
    { rootMargin: "-35% 0px -60% 0px" });
  requestAnimationFrame(() => sections.forEach(s => { const el = document.getElementById(s.id); if (el) io.observe(el); }));
  return chipBar(chips, aria);
}

/** banner ("← Home", 2D ARTWORK, intro, "4 tabs" / "15 projects" / "38 artworks") */
const banner = model => pageBanner({
  back: { key: "a2_back", href: "index.html" }, title: "a2_page_title", intro: model.intro,
  chips: model.total.projects ? [{ key: "a2_tabs", n: model.categories.length },
    { key: model.total.projects === 1 ? "a2_project_one" : "a2_projects", n: model.total.projects },
    { key: model.total.images === 1 ? "a2_count_one" : "a2_count", n: model.total.images }] : [],
});
const empty = () => h("div", { class: "container" }, lbl("p", "a2_empty", "a2-empty"));
const tabTail = c => h("span", { class: "a2-chip-c" }, c.projects.length);

// ---------- one tab: heading + its projects ----------
function projectBlock(p, i) {
  return h("article", { class: "a2-proj", id: p.id },
    h("header", { class: "a2-proj-h" },
      h("span", { class: "a2-proj-n" }, num(i + 1)), title("h3", p.name, "a2-proj-title"), count(p.count)),
    h("div", { class: "a2-body" }, rich(p.text, "stage-text a2-text"), filmstrip(p.images)));
}
function tabSection(c) {
  return h("section", { class: "pd-sec a2-sec a2-cat", id: c.id },
    h("div", { class: "container" },
      h("header", { class: "pd-h" }, title("h2", c.name), projCount(c.projects.length)),
      rich(c.text, "stage-text a2-text a2-cat-text")),
    h("div", { class: "container a2-projs" }, c.projects.map(projectBlock)));
}
/** banner + tab bar + the chosen tab; the bar switches the tab below it (#<tab id>), #<project id> = its tab scrolled to
 *  that project, nothing = the first tab. Returns open(id) = go to a tab / project from the page #hash. */
export function renderArt2D(model, main) {
  const cats = model.categories;
  const chips = cats.map((c, i) => chip(c, i, tabTail));
  const view = h("div", { class: "a2-view" });
  main.replaceChildren(...[banner(model), cats.length ? chipBar(chips, "a2_jump") : null, view, model.total.projects ? null : empty()].filter(Boolean));
  let shown = null;
  const show = (id, scroll) => {
    const p = model.projects.find(x => x.id === id), c = p ? cats.find(x => x.id === p.category) : cats.find(x => x.id === id) || cats[0];
    if (!c) return;
    if (c !== shown) {
      shown = c;
      setOn(chips, c.id);
      view.replaceChildren(tabSection(c));
      // slide-in per heading / project panel, never on the whole tab: a tall tab opened in its middle (#project) stays under
      // the reveal threshold (15 % of it on screen) and would keep everything invisible
      $$(".a2-sec > .container:first-child, .a2-proj", view).forEach(reveal);
    }
    if (scroll) jumpTo(p ? p.id : c.id, !p);
  };
  addEventListener("hashchange", () => show(decodeURIComponent(location.hash.slice(1)), true));
  show(decodeURIComponent(location.hash.slice(1)), false);
  return id => { if (id) show(id, true); };
}
