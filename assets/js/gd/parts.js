// Small building blocks of the Graphic Design page (list + detail). Every block returns null when its data is empty,
// so callers can pass the result straight to h().
import { h } from "../utils.js";
import { tr, label, bind } from "../i18n.js";
import { setRich } from "../richtext.js";
import { lbl } from "../project/parts.js";
import { titleFont } from "../page-banner.js";
import { has, listHref } from "./model.js";

/** title from a data value; switches to the fallback font when Qualy can't draw it (Vietnamese) */
export const title = (tag, value, cls) => has(value) ? bind(h(tag, { class: cls }), el => titleFont(setRich(el, tr(value)))) : null;

/** "{n} images" / "{n} image"-style count that follows the language; null for 0 */
const countText = (n, many, one, cls) => n ? bind(h("span", { class: cls }), el => { el.textContent = label(n === 1 ? one : many, { n }); }) : null;
export const imagesCount = (n, cls) => countText(n, "pd_images", "pd_image", cls);
export const stepsCount = (n, cls) => countText(n, "gd_steps", "gd_step_one", cls);

/** "Personal project · 2025" (client, year — only the filled ones) */
export function metaLine(p, cls = "gd-meta") {
  const parts = [p.client, p.year].filter(has);
  if (!parts.length) return null;
  return bind(h("p", { class: cls }), el => el.replaceChildren(...parts.map((v, i) =>
    h("span", {}, i ? h("span", { class: "gd-sep", "aria-hidden": "true" }, "·") : null, setRich(h("span"), String(tr(v)))))));
}

/** unknown ?id= → "This project does not exist" + link back to the list */
export const notFound = () => h("div", { class: "container gd-missing" },
  lbl("p", "gd_not_found"), Object.assign(lbl("a", "gd_back_list", "pb-back"), { href: listHref() }));

/** after "← All design projects": bring the card of the project you came from into view (#gd-<id>) */
export function focusCardFromHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  const card = id.startsWith("gd-") && document.getElementById(id);
  if (!card) return;
  document.fonts.ready.then(() => requestAnimationFrame(() => {
    card.scrollIntoView({ block: "center" });
    card.focus({ preventScroll: true });
  }));
}

/** ?id=…#step-2 → that step, once the page (fonts + eager images above it) has its final height */
export function scrollToStep(cls) {
  const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (!el?.classList.contains(cls)) return;
  const go = () => document.fonts.ready.then(() => requestAnimationFrame(() => el.scrollIntoView({ block: "start" })));
  document.readyState === "complete" ? go() : addEventListener("load", go, { once: true });
}
