// 2D Artwork page layout (owner's pick: variant 1 "Progression" + the variant 2 page banner). Each section = a numbered
// HUD heading ("01 CHARACTER DESIGN · 7 images ───"), its text and a filmstrip (+ lightbox); steps = numbered sub-rows on
// a vertical cyan rail, each with its own text + filmstrip. A sticky chip bar jumps between sections (scroll-spy highlight).
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

function stepRow(st, i) {
  return h("li", { class: "a2-step" },
    h("div", { class: "a2-step-n", "aria-hidden": "true" }, num(i + 1)),
    h("div", { class: "a2-step-body" },
      h("div", { class: "a2-step-head" },
        lbl("span", "a2_step", "a2-step-kicker", { n: i + 1 }),
        title("h3", st.title, "a2-step-title"),
        count(st.images.length)),
      rich(st.text, "stage-text"),
      filmstrip(st.images)));
}

function section(s, n) {
  return h("section", { class: "pd-sec a2-sec", id: s.id },
    h("div", { class: "container" },
      h("header", { class: "pd-h" }, h("span", { class: "pd-h-num" }, num(n)), title("h2", s.name), count(s.count))),
    h("div", { class: "container a2-body" },
      rich(s.text, "stage-text a2-text"),
      filmstrip(s.images),
      s.steps.length ? h("ol", { class: "a2-steps" }, s.steps.map(stepRow)) : null));
}

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

/** sticky chip bar "01 Character Design 7" + scroll-spy (art3d.html too: its own aria label key + chip tail) */
const countTail = s => s.count ? h("span", { class: "a2-chip-c" }, s.count) : null;
export function jumpBar(sections, { aria = "a2_jump", tail = countTail } = {}) {
  const chips = sections.map((s, i) => h("a", { class: "a2-chip", href: `#${s.id}`, "data-id": s.id },
    h("span", { class: "a2-chip-n" }, num(i + 1)),
    has(s.name) ? bind(h("span", { class: "a2-chip-name" }), el => setRich(el, tr(s.name))) : null,
    tail(s)));
  const track = h("div", { class: "a2-jump-track" }, chips);
  const bar = bind(h("nav", { class: "a2-jump" }, h("div", { class: "container" }, track)), el => el.setAttribute("aria-label", label(aria)));

  chips.forEach(c => c.addEventListener("click", e => {
    if (!document.getElementById(c.dataset.id)) return;
    e.preventDefault();
    jumpTo(c.dataset.id);
    history.replaceState(null, "", `#${c.dataset.id}`);
  }));

  // highlight the section crossing the upper third of the screen; keep its chip visible in the (phone) track
  const setOn = id => chips.forEach(c => {
    const on = c.dataset.id === id;
    if (on && !c.classList.contains("on") && track.scrollWidth > track.clientWidth)
      track.scrollTo({ left: c.offsetLeft - (track.clientWidth - c.offsetWidth) / 2, behavior: reducedMotion() ? "auto" : "smooth" });
    c.classList.toggle("on", on);
    on ? c.setAttribute("aria-current", "true") : c.removeAttribute("aria-current");
  });
  const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) setOn(e.target.id); }),
    { rootMargin: "-35% 0px -60% 0px" });
  requestAnimationFrame(() => sections.forEach(s => { const el = document.getElementById(s.id); if (el) io.observe(el); }));
  return bar;
}

/** banner ("← Home", 2D ARTWORK, intro, "5 sections" / "29 artworks") + jump bar + sections (or "No artworks yet.") */
export function renderArt2D(model, main) {
  const secs = model.sections, total = model.total;
  const banner = pageBanner({
    back: { key: "a2_back", href: "index.html" }, title: "a2_page_title", intro: model.intro,
    chips: secs.length ? [{ key: "a2_sections_count", n: secs.length }, { key: total === 1 ? "a2_count_one" : "a2_count", n: total }] : [],
  });
  main.replaceChildren(...[
    banner,
    secs.length > 1 ? jumpBar(secs) : null,
    ...secs.map((s, i) => section(s, i + 1)),
    secs.length ? null : h("div", { class: "container" }, lbl("p", "a2_empty", "a2-empty"))].filter(Boolean));
  $$(".a2-sec", main).forEach(reveal);
}
