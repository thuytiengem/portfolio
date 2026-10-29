// Entry point of project.html?id=<folder>: loads web-config.json + Database/Projects/<folder>/data.json and renders
// the detail page (render.js). Topbar, letter rain, cursor, image frames, EN/VI and the contact footer work like the
// home page. Missing / unknown id → "project not found" with a link back.
import { $, $$, loadJSON, reveal } from "../utils.js";
import { initI18n, tr, label, onLangChange } from "../i18n.js";
import { createRain } from "../rain-bg.js";
import { stripRich } from "../richtext.js";
import { loadFrames } from "../ui-frames.js";
import { initCursor } from "../cursor.js";
import { skipNextIntro } from "../intro/skip.js";
import { initMenu, setBrand } from "../topbar.js";
import { initPortfolioMenu } from "../portfolio-menu.js";
import { renderContact } from "../sections/about.js";
import { normalize } from "./model.js";
import { renderProject, renderNotFound } from "./render.js";

// a folder name only (no "/", no "..")
const validId = id => !!id && /^[^/\\]+$/.test(id) && id !== "." && id !== "..";

async function loadProject(id) {
  if (!validId(id)) return null;
  const base = `Database/Projects/${encodeURIComponent(id)}/`;
  try { return normalize(await loadJSON(`${base}data.json`), base); }
  catch (e) { console.warn(e); return null; }
}

async function main() {
  initCursor();
  // going back to the home page (Back to projects, Portfolio/About links, browser Back) opens it without the intro;
  // Home / logo still play it, like they do on the home page
  skipNextIntro(true);
  $("#brand").addEventListener("click", () => skipNextIntro(false));   // only the logo replays the intro, Home does not
  const id = new URLSearchParams(location.search).get("id")?.trim();
  const [config, project] = await Promise.all([loadJSON("web-config.json"), loadProject(id), loadFrames()]);
  initI18n(config);
  // Portfolio dropdown: after initI18n (labels), before initMenu (phone menu)
  initPortfolioMenu($('#nav a[data-i18n="nav_portfolio"]'));

  const site = () => stripRich(tr(config.site?.pageTitle));
  const setTitle = () => {
    const head = project ? stripRich(tr(project.title)) : label("pd_not_found");
    document.title = [head, site()].filter(Boolean).join(" · ");
  };
  setTitle();
  onLangChange(setTitle);

  setBrand(config);
  createRain($("#rain"), { word: config.background?.rainWord || "thuytiengem" });

  const main = $("#project");
  if (project) renderProject(project, main); else renderNotFound(main);
  $$(".pd-sec", main).forEach(reveal);

  renderContact(config);
  initMenu();
}

main().catch(err => {
  console.error(err);
  renderNotFound($("#project"));
});
