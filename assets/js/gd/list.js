// Graphic Design — list view (graphic-design.html): page banner + the Video Games poster cards (games/cards.js
// gameCard + games.css) fed from the same project records as the detail view. Tools = the tag row, "client · year"
// under the title, card → graphic-design.html?id=<id>.
import { h, reveal } from "../utils.js";
import { bind } from "../i18n.js";
import { lbl } from "../project/parts.js";
import { pageBanner, titleFont } from "../page-banner.js";
import { gameCard } from "../games/cards.js";
import { projectHref } from "./model.js";
import { metaLine, focusCardFromHash } from "./parts.js";

/** project record → the Video Games card model (same look, no game stats / logo) */
const toCard = p => ({
  href: projectHref(p.id), title: p.name, description: p.text, tags: p.tools,
  genre: null, members: null, downloads: null, logo: "", image: p.cover, imageKind: "cover",
});

function card(p, i) {
  const el = gameCard(toCard(p), i);
  el.id = `gd-${p.id}`;                                   // "← All design projects" comes back to this card
  const t = el.querySelector(".gc-title");
  if (t) bind(t, titleFont);                              // Vietnamese names Qualy can't draw → Montserrat
  const meta = metaLine(p, "gd-meta gc-meta");
  if (meta) (t || el.querySelector(".gc-body").firstChild)?.after(meta);
  el.style.setProperty("--d", `${(i % 3) * 90}ms`);       // staggered entrance along each row
  return reveal(el);
}

/** banner ("← Home", GRAPHIC DESIGN, intro, projects / images) + poster grid (or "No projects yet.") */
export function renderList(model, main) {
  const t = model.totals;
  main.replaceChildren(
    pageBanner({
      back: { key: "gd_back", href: "index.html" }, title: "gd_page_title", intro: model.intro,
      chips: t.projects ? [
        { key: t.projects === 1 ? "gd_count_one" : "gd_count", n: t.projects },
        t.images ? { key: t.images === 1 ? "pd_image" : "pd_images", n: t.images } : null] : [],
    }),
    h("div", { class: "container" }, t.projects
      ? h("div", { class: "gp-grid" }, model.projects.map(card))
      : lbl("p", "gd_empty", "gp-empty")));
  focusCardFromHash();
}
