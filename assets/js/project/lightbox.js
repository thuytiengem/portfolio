// Full-screen image viewer: arrows / ← → keys / swipe, thumbnail strip, caption, Esc or backdrop to close.
// One shared dialog, built on first use. Images: [{ src, caption? }] (caption = rich text or { en, vi }).
import { h, $$ } from "../utils.js";
import { tr, label } from "../i18n.js";
import { setRich } from "../richtext.js";
import { has } from "./model.js";

let lb = null;

function build() {
  const img = h("img", { class: "lb-img", alt: "" });
  const cap = h("p", { class: "lb-cap" });
  const count = h("span", { class: "lb-count" });
  const strip = h("div", { class: "lb-strip" });
  const btn = (cls, onclick, icon) => h("button", { class: cls, type: "button", onclick }, h("span", { "aria-hidden": "true" }, icon));
  const close = btn("lb-close", () => hide(), "×");
  const prev = btn("lb-arrow prev", () => show(lb.i - 1), "");
  const next = btn("lb-arrow next", () => show(lb.i + 1), "");
  const stage = h("figure", { class: "lb-stage" }, img, cap);
  const root = h("div", { class: "lb", role: "dialog", "aria-modal": "true", hidden: true },
    h("div", { class: "lb-backdrop", onclick: () => hide() }), stage, close, prev, next, count, strip);
  document.body.append(root);
  lb = { root, img, cap, count, strip, close, prev, next, images: [], i: 0, back: null };

  root.addEventListener("keydown", e => {
    if (e.key === "Escape") { e.preventDefault(); hide(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); show(lb.i - 1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); show(lb.i + 1); }
    else if (e.key === "Tab") { // keep focus inside the dialog
      const f = [close, prev, next, ...$$("button", strip)].filter(b => !b.hidden && b.offsetParent);
      const at = f.indexOf(document.activeElement);
      if (e.shiftKey && at <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && at === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  // swipe on touch screens
  let x0 = null;
  stage.addEventListener("pointerdown", e => { x0 = e.clientX; });
  stage.addEventListener("pointerup", e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) show(lb.i + (dx < 0 ? 1 : -1)); });
}

function show(i) {
  const n = lb.images.length;
  lb.i = (i + n) % n;
  const it = lb.images[lb.i];
  lb.img.classList.remove("in"); void lb.img.offsetWidth;
  lb.img.src = it.src; lb.img.classList.add("in");
  const c = tr(it.caption);
  setRich(lb.cap, has(c) ? c : ""); lb.cap.hidden = !has(c);
  lb.count.textContent = `${lb.i + 1} / ${n}`;
  $$("button", lb.strip).forEach((b, k) => { b.classList.toggle("on", k === lb.i); if (k === lb.i) b.scrollIntoView({ block: "nearest", inline: "center" }); });
  [lb.images[lb.i + 1], lb.images[lb.i - 1]].forEach(x => { if (x) new Image().src = x.src; }); // preload neighbours
}

export function openLightbox(images, i = 0) {
  if (!lb) build();
  lb.images = images; lb.back = document.activeElement;
  const many = images.length > 1;
  lb.prev.hidden = lb.next.hidden = lb.count.hidden = lb.strip.hidden = !many;
  lb.strip.replaceChildren(...(many ? images.map((im, k) => h("button", { type: "button", "aria-label": `${k + 1}`, onclick: () => show(k) }, h("img", { src: im.src, alt: "", loading: "lazy" }))) : []));
  lb.close.setAttribute("aria-label", label("pd_close"));
  lb.prev.setAttribute("aria-label", label("pd_prev"));
  lb.next.setAttribute("aria-label", label("pd_next"));
  lb.root.hidden = false;
  document.documentElement.classList.add("lb-open");
  requestAnimationFrame(() => lb.root.classList.add("open"));
  show(i);
  lb.close.focus();
}

function hide() {
  if (!lb || lb.root.hidden) return;
  lb.root.classList.remove("open");
  lb.root.hidden = true;
  document.documentElement.classList.remove("lb-open");
  lb.back?.focus?.();
}
