// Entry point of games.html ("Video Games"): every project in Database/Projects (featured or not) as a poster card
// → project.html?id=<folder>. Topbar (+ Portfolio dropdown), letter rain, cursor, image frames, EN/VI and the
// contact footer work like project.html.
import { $, loadJSON, reveal } from "../utils.js";
import { initI18n, tr, label, onLangChange } from "../i18n.js";
import { createRain } from "../rain-bg.js";
import { stripRich } from "../richtext.js";
import { loadFrames } from "../ui-frames.js";
import { initCursor } from "../cursor.js";
import { skipNextIntro } from "../intro/skip.js";
import { initMenu, setBrand } from "../topbar.js";
import { initPortfolioMenu } from "../portfolio-menu.js";
import { renderContact } from "../sections/about.js";
import { pageBanner } from "../page-banner.js";
import { loadGames } from "./model.js";
import { gameCard } from "./cards.js";

async function main() {
  initCursor();
  // like project.html: going back home (← Home, Portfolio / About links, browser Back) skips the intro, Home / logo play it
  skipNextIntro(true);
  $("#brand").addEventListener("click", () => skipNextIntro(false));   // only the logo replays the intro, Home does not

  const [config, games] = await Promise.all([loadJSON("web-config.json"), loadGames(), loadFrames()]);
  initI18n(config);
  // Portfolio dropdown: after initI18n (labels), before initMenu (phone menu)
  initPortfolioMenu($('#nav a[data-i18n="nav_portfolio"]'), { current: "pm_games" });

  const setTitle = () => { document.title = [label("games_page_title"), stripRich(tr(config.site?.pageTitle))].filter(Boolean).join(" · "); };
  setTitle();
  onLangChange(setTitle);

  setBrand(config);
  createRain($("#rain"), { word: config.background?.rainWord || "thuytiengem" });

  // banner: "← Home", VIDEO GAMES, intro (label games_intro, hidden when empty), "5 projects"
  $("#gamesBanner").replaceWith(pageBanner({
    back: { key: "games_back", href: "index.html" }, title: "games_page_title", intro: { key: "games_intro" },
    chips: [{ key: games.length === 1 ? "games_count_one" : "games_count", n: games.length }],
  }));

  $("#gamesGrid").append(...games.map((c, i) => {
    const el = gameCard(c, i);
    el.style.setProperty("--d", `${(i % 3) * 90}ms`);   // staggered entrance along each row
    return reveal(el);
  }));
  $("#gamesEmpty").hidden = games.length > 0;

  renderContact(config);
  initMenu();
}

main().catch(err => console.error(err));
