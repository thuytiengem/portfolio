// Project detail layout ("HUD", picked by the owner): header info in a sci-fi .panel + video with corner brackets,
// big HUD stats, then numbered sections — My Roles (numbered cards), Product Progression (vertical stages, each with
// a horizontal filmstrip + lightbox), Challenges & Solutions (split cards), What I learned (checklist).
// Sections with no data are skipped and the numbering (01, 02 …) only counts the rendered ones.
import { h } from "../utils.js";
import { bind } from "../i18n.js";
import { createVideo } from "../youtube.js";
import { storeButtons } from "../stores.js";
import { has } from "./model.js";
import { filmstrip } from "./gallery.js";
import {
  txt, lbl, rich, richNow, itemsOf, wrap, num, logoImg, coverLayer, tagList, backLink, metaLine, hudStats, section,
} from "./parts.js";

/** learned item → { title, text } (an item is a string, { en, vi } or { title, text }) */
const learnedItem = x => x && typeof x === "object" && ("title" in x || "text" in x) ? x : { title: "", text: x };

const problemSolution = c => [
  has(c.problem) ? h("div", { class: "ps ps-problem" }, lbl("span", "pd_problem", "ps-kicker"), rich(c.problem)) : null,
  has(c.solution) ? h("div", { class: "ps ps-solution" }, lbl("span", "pd_solution", "ps-kicker"), rich(c.solution)) : null,
];

function header(m) {
  const video = has(m.video?.youtube) ? createVideo(m.video) : null;
  const info = wrap("panel hud-info",
    wrap("pd-app", logoImg(m), wrap("pd-app-text", txt("h1", m.title, "pd-title"), metaLine(m))),
    tagList(m.tags),
    storeButtons(m.stores));
  const frame = video ? h("div", { class: "hud-frame" }, video, ["c1", "c2", "c3", "c4"].map(c => h("i", { class: c }))) : null;
  return h("header", { class: "pd-head hud-head" }, coverLayer(m),
    h("div", { class: "container" },
      backLink(),
      wrap(`hud-top${video ? "" : " no-video"}${info ? "" : " no-info"}`, info, frame),
      hudStats(m)));
}

const bodies = {
  roles: m => m.roles.length ? h("div", { class: "role-cards" }, m.roles.map((r, i) =>
    h("article", { class: "role-card" }, h("span", { class: "role-idx" }, num(i + 1)), txt("h3", r.title), rich(r.text)))) : null,

  progression: m => m.progression.length ? h("div", { class: "stages-v" }, m.progression.map((s, i) =>
    h("article", { class: "stage-v", id: s.id ? `step-${s.id}` : null },
      h("div", { class: "stage-v-head" }, h("span", { class: "stage-v-n" }, num(i + 1)), txt("h3", s.name),
        s.images.length ? lbl("span", s.images.length === 1 ? "pd_image" : "pd_images", "pd-count", { n: s.images.length }) : null),
      rich(s.text, "stage-text"),
      filmstrip(s.images)))) : null,

  challenges: m => m.challenges.length ? h("div", { class: "split-cards" }, m.challenges.map((c, i) =>
    h("article", { class: "split-card" }, h("span", { class: "split-n" }, num(i + 1)), problemSolution(c), h("span", { class: "split-node", "aria-hidden": "true" })))) : null,

  // the list itself may differ per language → re-rendered on language change
  learned: m => has(m.learned) ? bind(h("div", { class: "checklist" }), el => el.replaceChildren(...itemsOf(m.learned).map(learnedItem).map(x =>
    h("div", { class: "check-item" }, h("span", { class: "check-box", "aria-hidden": "true" }), h("div", {}, richNow("h3", x.title), richNow("p", x.text)))))) : null,
};

const SECTIONS = [["roles", "pd_roles"], ["progression", "pd_progression"], ["challenges", "pd_challenges"], ["learned", "pd_learned"]];

export function renderProject(m, main) {
  let n = 0;
  main.replaceChildren(header(m), ...SECTIONS.map(([id, key]) => {
    const body = bodies[id](m);
    return body ? section(id, key, ++n, body) : null;
  }).filter(Boolean));
}

export function renderNotFound(main) {
  main.replaceChildren(h("div", { class: "container pd-missing" },
    h("p", { class: "pd-missing-code", "aria-hidden": "true" }, "404"),
    lbl("h1", "pd_not_found", "pd-missing-title"),
    lbl("p", "pd_not_found_text", "pd-missing-text"),
    backLink()));
}
