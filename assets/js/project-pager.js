// "Previous project · All projects · Next project" bar at the end of a project page (project.html, graphic-design.html?id=…).
// Styles: assets/css/project-pager.css. Every text follows the language (bind).
//
//   projectPager({ prev: { href, name, image, contain? }, next: …, all: "games.html#game-x",
//                  keys: { prev: "pd_prev_project", next: "pd_next_project", all: "pd_all_projects" } })
// prev / next missing (first / last project) → that side stays empty. contain = image shown whole (a logo), not cropped.
import { h } from "./utils.js";
import { tr, label, bind } from "./i18n.js";
import { setRich } from "./richtext.js";
import { titleFont } from "./page-banner.js";

const lbl = (tag, key, cls) => bind(h(tag, { class: cls }), el => setRich(el, label(key)));

function side(p, key, cls) {
  if (!p) return h("span", { class: `pp-void ${cls}` });
  return h("a", { class: `pp ${cls}`, href: p.href },
    p.image ? h("img", { class: p.contain ? "contain" : null, src: p.image, alt: "", loading: "lazy", decoding: "async" })
      : h("span", { class: "pp-ph", "aria-hidden": "true" }),
    h("span", { class: "pp-txt" }, lbl("small", key),
      p.name ? bind(h("b", { class: "pp-name" }), el => titleFont(setRich(el, tr(p.name)))) : null));
}

export const projectPager = ({ prev, next, all, keys }) => h("nav", { class: "container project-pager" },
  side(prev, keys.prev, "prev"),
  Object.assign(lbl("a", keys.all, "pp-all"), { href: all }),
  side(next, keys.next, "next"));

/** after "All projects": bring the card of the project you came from into view (#<prefix><id>) */
export function focusCardFromHash(prefix) {
  const id = decodeURIComponent(location.hash.slice(1));
  const card = id.startsWith(prefix) && document.getElementById(id);
  if (!card) return;
  document.fonts.ready.then(() => requestAnimationFrame(() => {
    card.scrollIntoView({ block: "center" });
    card.focus({ preventScroll: true });
  }));
}
