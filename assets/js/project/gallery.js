// Filmstrip gallery for one progression stage: one horizontal row of thumbnails (natural widths) with
// arrow buttons when it overflows; click a thumbnail → lightbox. Works with 1 … many images.
import { h, $$, reducedMotion } from "../utils.js";
import { label } from "../i18n.js";
import { openLightbox } from "./lightbox.js";

const thumb = (images, i) => h("button", { class: "g-item", type: "button", onclick: () => openLightbox(images, i) },
  h("img", { src: images[i].src, alt: "", loading: "lazy", decoding: "async" }));

export function filmstrip(images) {
  if (!images?.length) return null;
  const n = images.length;
  const track = h("div", { class: "fs-track", tabindex: 0 }, images.map((_, i) => thumb(images, i)));
  const arrow = dir => h("button", { class: `fs-arrow ${dir < 0 ? "prev" : "next"}`, type: "button", "aria-label": label(dir < 0 ? "pd_prev" : "pd_next"),
    onclick: () => track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: reducedMotion() ? "auto" : "smooth" }) }, h("span", { "aria-hidden": "true" }));
  const prev = arrow(-1), next = arrow(1);
  const root = h("div", { class: "gallery g-filmstrip", "data-count": n > 6 ? "many" : n }, track, prev, next);
  const sync = () => {
    const max = track.scrollWidth - track.clientWidth - 2;
    root.classList.toggle("overflow", max > 0);
    prev.disabled = track.scrollLeft <= 2; next.disabled = track.scrollLeft >= max;
  };
  track.addEventListener("scroll", sync, { passive: true });
  new ResizeObserver(sync).observe(track);
  $$("img", track).forEach(im => im.addEventListener("load", sync));
  return root;
}
