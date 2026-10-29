// Entry point of graphic-design.html ("Graphic Design", owner's pick: variant 1 "Poster grid + rail"). One page, two views
// from ONE data file (Database/GraphicDesign/data.json):
//   graphic-design.html            → list of poster cards (list.js)
//   graphic-design.html?id=<id>    → that project's detail (detail.js; #step-n deep-links a step; unknown id → not found)
// Topbar (+ Portfolio dropdown, "Graphic Design" current), letter rain, cursor, image frames, EN/VI and the contact footer
// work like art3d.html; going back home skips the intro, Home / logo play it.
import { $, loadJSON } from "../utils.js";
import { initI18n, tr, label, onLangChange } from "../i18n.js";
import { createRain } from "../rain-bg.js";
import { stripRich } from "../richtext.js";
import { loadFrames } from "../ui-frames.js";
import { initCursor } from "../cursor.js";
import { skipNextIntro } from "../intro/skip.js";
import { initMenu, setBrand } from "../topbar.js";
import { initPortfolioMenu } from "../portfolio-menu.js";
import { renderContact } from "../sections/about.js";
import { BASE, normalize } from "./model.js";
import { notFound } from "./parts.js";
import { renderList } from "./list.js";
import { renderDetail } from "./detail.js";

async function main() {
  initCursor();
  // like art3d.html: going back home (← Home, Portfolio / About links, browser Back) skips the intro, Home / logo play it
  skipNextIntro(true);
  $("#brand").addEventListener("click", () => skipNextIntro(false));   // only the logo replays the intro, Home does not

  const [config, raw] = await Promise.all([
    loadJSON("web-config.json"), loadJSON(`${BASE}data.json`).catch(e => { console.warn(e); return {}; }), loadFrames()]);
  initI18n(config);
  // Portfolio dropdown: after initI18n (labels), before initMenu (phone menu)
  initPortfolioMenu($('#nav a[data-i18n="nav_portfolio"]'), { current: "pm_graphic" });

  const model = normalize(raw, BASE);
  const want = new URLSearchParams(location.search).get("id");
  const index = want ? model.projects.findIndex(p => p.id === want) : -1;
  const project = index >= 0 ? model.projects[index] : null;

  // tab title: list "Graphic Design · <site>", detail "<project> · Graphic Design · <site>" (follows the language)
  const setTitle = () => {
    document.title = [project ? stripRich(tr(project.name)) : "", stripRich(label("gd_page_title")), stripRich(tr(config.site?.pageTitle))]
      .filter(Boolean).join(" · ");
  };
  setTitle();
  onLangChange(setTitle);

  setBrand(config);
  createRain($("#rain"), { word: config.background?.rainWord || "thuytiengem" });

  const main = $("#gd");
  if (project) renderDetail(model, project, index, main);
  else if (want) main.replaceChildren(notFound());
  else renderList(model, main);

  renderContact(config);
  initMenu();
}

main().catch(err => console.error(err));
