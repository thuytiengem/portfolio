// Portfolio dropdown in the topbar (index.html, project.html, games.html, art2d.html, art3d.html): turns the "Portfolio" nav link into a menu
// button with a panel of sub-links (2 × 2 grid). The nav markup stays as it is; call
//   initPortfolioMenu($('#nav a[data-i18n="nav_portfolio"]'), { current })   AFTER initI18n() and BEFORE initMenu() (topbar.js).
//
// Desktop: opens on hover AND click (click pins it open / closes it), Esc / outside click / tabbing away close it,
//   Enter / Space / ↓ on "Portfolio" open it and move the focus into the panel, arrow keys move between the items.
// Phone (≤ 900px, burger menu): "Portfolio" becomes an accordion inside the menu (tap toggles, no hover).
// The link keeps its href (no-JS fallback) and its place in #nav, so the home page section highlight still works.
// Items without href (or soon: true) are shown as "Soon" and do nothing. Labels: i18n pm_* in web-config.json.
import { h } from "./utils.js";
import { label, bind } from "./i18n.js";
import { setRich } from "./richtext.js";

// 24×24 line icons (stroke = currentColor)
const ICONS = {
  games: '<path d="M7 9v4M5 11h4M15.5 10.5h.01M18 12.5h.01"/><path d="M8 6h8a5 5 0 0 1 4.9 6l-.8 4.2a2.4 2.4 0 0 1-4.3 1L14 15h-4l-1.8 2.2a2.4 2.4 0 0 1-4.3-1L3.1 12A5 5 0 0 1 8 6z"/>',
  cube: '<path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7z"/><path d="M3.5 7 12 11.5 20.5 7M12 11.5v10"/>',
  brush: '<path d="M14.5 4.5 19.5 9.5 11 18l-5-5z"/><path d="M6 13l-2.6 2.6a2.3 2.3 0 0 0 0 3.2l1.8 1.8a2.3 2.3 0 0 0 3.2 0L11 18"/><path d="M16.5 2.5l5 5"/>',
  pen: '<path d="M12 3 4.5 13l3 3.5h9l3-3.5z"/><path d="M12 3v7.5"/><circle cx="12" cy="12" r="1.6"/><path d="M8 20.5h8"/>',
};

/** menu items: key / hint = i18n keys; no href (or soon) → "Soon" */
export const ITEMS = [
  { key: "pm_games", hint: "pm_games_hint", icon: "games", href: "games.html" },
  { key: "pm_3d", hint: "pm_3d_hint", icon: "cube", href: "art3d.html" },
  { key: "pm_2d", hint: "pm_2d_hint", icon: "brush", href: "art2d.html" },
  { key: "pm_graphic", hint: "pm_graphic_hint", icon: "pen", soon: true },
];

const svg = (inner, cls) => { const s = document.createElementNS("http://www.w3.org/2000/svg", "svg"); s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("class", cls); s.setAttribute("aria-hidden", "true"); s.innerHTML = inner; return s; };
const text = (tag, key, cls) => bind(h(tag, { class: cls }), el => setRich(el, label(key)));

/** current: key of the item of this page (highlighted, aria-current) */
export function initPortfolioMenu(trigger, { items = ITEMS, current } = {}) {
  if (!trigger) return null;
  const desktop = matchMedia("(min-width: 901px)");
  const canHover = matchMedia("(hover: hover) and (pointer: fine)");

  // label moves into a span (i18n rewrites only that), chevron next to it
  const name = h("span", { class: "pm-name" }, trigger.textContent);
  if (trigger.dataset.i18n) { name.dataset.i18n = trigger.dataset.i18n; trigger.removeAttribute("data-i18n"); }
  trigger.replaceChildren(name, svg('<path d="M6 9l6 6 6-6"/>', "pm-chev"));
  trigger.classList.add("pm-trigger");
  const panelId = "pmPanel";
  trigger.setAttribute("aria-haspopup", "true");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", panelId);

  const links = items.map(it => {
    const soon = it.soon || !it.href, here = current && it.key === current;
    const a = h("a", {
      class: `pm-item${soon ? " is-soon" : ""}${here ? " is-current" : ""}`,
      href: soon ? "#" : it.href, "aria-disabled": soon ? "true" : null, "aria-current": here ? "page" : null,
    },
      h("span", { class: "pm-ico" }, svg(ICONS[it.icon] || ICONS.games, "")),
      h("span", { class: "pm-txt" }, text("b", it.key), it.hint ? text("small", it.hint) : null),
      soon ? text("span", "pm_soon", "pm-soon") : null);
    // "Soon": nothing happens (registered before initMenu → the phone menu stays open too)
    if (soon) a.addEventListener("click", e => { e.preventDefault(); e.stopImmediatePropagation(); });
    return a;
  });
  const grid = h("div", { class: "pm-grid", role: "group" }, links);
  bind(grid, el => el.setAttribute("aria-label", label("pm_label")));
  const panel = h("div", { class: "pm-panel", id: panelId }, h("div", { class: "pm-inner" }, grid));

  const root = h("div", { class: "pm" });
  trigger.replaceWith(root);
  root.append(trigger, panel);

  let open = false, pinned = false, timer = 0;
  const set = (on, { pin = pinned, focus = false } = {}) => {
    clearTimeout(timer);
    open = on; pinned = on && pin;
    root.classList.toggle("open", on);
    trigger.setAttribute("aria-expanded", on);
    if (on && focus) links[0]?.focus({ preventScroll: true });
  };
  const close = (refocus = false) => { if (!open) return; set(false); if (refocus) trigger.focus(); };

  // click / tap on "Portfolio": captured on the wrapper so topbar.js does not close the phone menu
  root.addEventListener("click", e => {
    if (!trigger.contains(e.target)) return;
    e.preventDefault(); e.stopPropagation();
    document.getElementById("lang")?.classList.remove("open");
    if (!desktop.matches) return set(!open);
    // desktop: a hover-opened panel gets pinned by the click; a pinned one closes
    if (open && pinned) return close();
    set(true, { pin: true, focus: e.detail === 0 });   // keyboard Enter (detail 0) moves the focus into the panel
  }, true);

  // hover (desktop mouse only); a short delay so the pointer can travel to the panel
  root.addEventListener("pointerenter", e => { if (e.pointerType === "mouse" && desktop.matches && canHover.matches) set(true); });
  root.addEventListener("pointerleave", e => {
    if (e.pointerType !== "mouse" || !desktop.matches || pinned) return;
    clearTimeout(timer); timer = setTimeout(() => close(), 220);
  });

  // keyboard
  trigger.addEventListener("keydown", e => {
    if (e.key === " " || e.key === "ArrowDown") { e.preventDefault(); set(true, { pin: true, focus: true }); }
  });
  panel.addEventListener("keydown", e => {
    const at = links.indexOf(document.activeElement);
    const cols = 2; // the grid is 2 × 2 on every screen
    const move = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key];
    if (move != null && at >= 0) {
      e.preventDefault();
      if (move === -cols && at < cols) return trigger.focus();
      links[Math.max(0, Math.min(links.length - 1, at + move))].focus();
    } else if (e.key === "Home" || e.key === "End") { e.preventDefault(); links[e.key === "Home" ? 0 : links.length - 1].focus(); }
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && open) close(root.contains(document.activeElement)); });
  document.addEventListener("click", e => { if (open && !root.contains(e.target)) close(); });
  root.addEventListener("focusout", e => { if (desktop.matches && open && !root.contains(e.relatedTarget)) close(); });
  // phone ↔ desktop: start closed
  desktop.addEventListener("change", () => close());

  return { open: () => set(true, { pin: true }), close, root };
}
