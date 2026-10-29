// Entry point of art2d.html ("2D Artwork"): loads web-config.json + Database/Art2D/data.json and renders the page
// (render.js). Topbar (+ Portfolio dropdown), letter rain, cursor, image frames, EN/VI and the contact footer work like
// games.html; going back home skips the intro, Home / logo play it.
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
import { normalize } from "./model.js";
import { renderArt2D } from "./render.js";

const BASE = "Database/Art2D/";

async function main() {
  initCursor();
  // like games.html: going back home (← Home, Portfolio / About links, browser Back) skips the intro, Home / logo play it
  skipNextIntro(true);
  $("#brand").addEventListener("click", () => skipNextIntro(false));   // only the logo replays the intro, Home does not

  const [config, raw] = await Promise.all([
    loadJSON("web-config.json"), loadJSON(`${BASE}data.json`).catch(e => { console.warn(e); return {}; }), loadFrames()]);
  initI18n(config);
  // Portfolio dropdown: after initI18n (labels), before initMenu (phone menu)
  initPortfolioMenu($('#nav a[data-i18n="nav_portfolio"]'), { current: "pm_2d" });

  const setTitle = () => { document.title = [stripRich(label("a2_page_title")), stripRich(tr(config.site?.pageTitle))].filter(Boolean).join(" · "); };
  setTitle();
  onLangChange(setTitle);

  setBrand(config);
  createRain($("#rain"), { word: config.background?.rainWord || "thuytiengem" });

  const open = renderArt2D(normalize(raw, BASE), $("#art2d"));
  renderContact(config);
  initMenu();

  // opened with #tab / #project → go there once the layout (and the fonts) exist
  const id = decodeURIComponent(location.hash.slice(1));
  if (id) document.fonts.ready.then(() => requestAnimationFrame(() => open(id)));
}

main().catch(err => console.error(err));
