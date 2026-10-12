// Entry point: loads web-config.json + Database/, renders every section, then plays the intro.
import { $, $$, loadJSON, loadCollection, reveal } from "./utils.js";
import { initI18n, tr, onLangChange } from "./i18n.js";
import { createRain } from "./rain-bg.js";
import { stripRich } from "./richtext.js";
import { loadFrames } from "./ui-frames.js";
import { runIntro } from "./intro/index.js";
import { renderFeatured, renderBlender } from "./sections/projects.js";
import { renderArtworks } from "./sections/artworks.js";
import { renderAbout, renderContact } from "./sections/about.js";

async function main() {
  // image frames (assets/ui/) load alongside the config so panels/buttons are styled before they show
  const [config] = await Promise.all([loadJSON("web-config.json"), loadFrames()]);
  initI18n(config);

  const setTitle = () => { document.title = stripRich(tr(config.site?.pageTitle)) || document.title; };
  setTitle();
  onLangChange(setTitle);

  $("#brand").textContent = config.profile?.name || "";
  const links = config.links || {};
  $("#otherExplore").href = links.otherProjects || "#";
  $("#artworksExplore").href = links.artworks || "#";
  $("#aboutExplore").href = links.about || "#";

  // background letter rain — only runs while the hero is not covering the screen
  const rain = createRain($("#rain"), { word: config.background?.rainWord || "thuytiengem" });
  new IntersectionObserver(([e]) => (e.intersectionRatio > 0.98 ? rain.pause() : rain.resume()),
    { threshold: [0.98, 1] }).observe($("#home"));

  // content
  const [projects, blender, artworks] = await Promise.all([
    loadCollection("Projects"),
    loadCollection("Blender"),
    loadJSON("Database/Artworks/index.json").catch(() => []),
  ]);
  renderFeatured(projects);
  renderBlender(blender);
  if (!blender.length) $("#blender").hidden = true;
  renderArtworks(artworks);
  renderAbout(config);
  renderContact(config);
  $$("main .reveal:not(.in)").forEach(reveal);
  initNav();
  // sections are rendered after load, so jump to a #hash once they exist
  if (location.hash.length > 1) document.querySelector(location.hash)?.scrollIntoView({ behavior: "instant" });

  const replayIntro = await runIntro(config, () => {
    $("#topbar").classList.add("show");
    document.documentElement.classList.remove("intro-lock");
  });
  // Home link + logo: the intro starts right away while the page scrolls back to the top (the topbar stays)
  $$('#brand, #nav a[href="#home"]').forEach(a => a.addEventListener("click", e => {
    e.preventDefault();
    history.replaceState(null, "", location.pathname + location.search);
    replayIntro();
    scrollTo({ top: 0, behavior: "smooth" });
  }));
}

function initNav() {
  const bar = $("#topbar"), btn = $("#menuBtn");
  const setOpen = open => { bar.classList.toggle("menu-open", open); btn.setAttribute("aria-expanded", open); };
  btn.addEventListener("click", e => { e.stopPropagation(); setOpen(!bar.classList.contains("menu-open")); });
  $$("#nav a").forEach(a => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("click", e => { if (!bar.contains(e.target)) setOpen(false); });

  // highlight the nav item of the section in view
  const map = { home: "#home", featured: "#featured", blender: "#featured", artworks: "#featured", about: "#about", contact: "#contact" };
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const href = map[e.target.id];
    $$("#nav a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === href));
  }), { rootMargin: "-45% 0px -50% 0px" });
  Object.keys(map).forEach(id => { const s = document.getElementById(id); if (s) io.observe(s); });
}

main().catch(err => {
  console.error(err);
  document.documentElement.classList.remove("intro-lock");
  $("#topbar").classList.add("show");
});
