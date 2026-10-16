// Topbar shared by index.html, project.html and games.html: phone menu (hamburger) open / close.
import { $, $$ } from "./utils.js";

export function initMenu() {
  const bar = $("#topbar"), btn = $("#menuBtn");
  const setOpen = open => { bar.classList.toggle("menu-open", open); btn.setAttribute("aria-expanded", open); };
  btn.addEventListener("click", e => { e.stopPropagation(); setOpen(!bar.classList.contains("menu-open")); });
  $$("#nav a").forEach(a => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("click", e => { if (!bar.contains(e.target)) setOpen(false); });
}
