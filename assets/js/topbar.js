// Topbar shared by index.html, project.html and games.html: phone menu (hamburger) open / close.
import { $, $$, h } from "./utils.js";

/** topbar brand: logo (assets/images/GEM-03.png) + the owner's name from web-config.json */
export function setBrand(config) {
  $("#brand").replaceChildren(
    h("img", { class: "brand-logo", src: "assets/images/GEM-03.png", alt: "", width: 40, height: 40 }),
    h("span", { class: "brand-name" }, config.profile?.name || ""));
}

export function initMenu() {
  const bar = $("#topbar"), btn = $("#menuBtn");
  const setOpen = open => { bar.classList.toggle("menu-open", open); btn.setAttribute("aria-expanded", open); };
  btn.addEventListener("click", e => { e.stopPropagation(); setOpen(!bar.classList.contains("menu-open")); });
  $$("#nav a").forEach(a => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("click", e => { if (!bar.contains(e.target)) setOpen(false); });
}
