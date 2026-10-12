// FEATURED PROJECTS and 3D BLENDER sections.
import { h, $, reveal } from "../utils.js";
import { bind, bindText, bindList, label } from "../i18n.js";
import { createVideo } from "../youtube.js";

const tagList = tags => h("div", { class: "tags" }, (tags || []).map(t => bindText(h("span", { class: "tag" }), t)));
const explore = url => bind(h("a", { class: "btn-explore", href: url || "#" }), el => { el.textContent = label("explore"); });
// store / download buttons under the video; data: "stores": { "googlePlay", "appStore", "apk" } — empty = hidden
const STORES = [["googlePlay", "store_google_play", "googleplay"], ["appStore", "store_app_store", "appstore"], ["apk", "store_apk", "android"]];
function storeButtons(stores = {}) {
  const items = STORES.filter(([k]) => /^https?:\/\//i.test(String(stores[k] || "").trim()));
  if (!items.length) return null;
  return h("div", { class: "stores" }, items.map(([k, key, icon]) =>
    h("a", { class: `btn-store store-${k}`, href: stores[k].trim(), target: "_blank", rel: "noopener", ...(k === "apk" ? { download: "" } : {}) },
      h("img", { src: `assets/icons/${icon}.svg`, alt: "" }),
      h("span", { class: "store-text" },
        bind(h("small"), el => { el.textContent = label(`${key}_hint`); }),
        bind(h("b"), el => { el.textContent = label(key); })))));
}
const heading = key => bind(h("h4", { class: key === "responsibilities" ? "accent" : "" }), el => { el.textContent = label(key); });

export function renderFeatured(projects) {
  const list = $("#featuredList");
  projects.forEach((p, i) => {
    const portrait = p.video?.orientation === "portrait";
    const panel = h("div", { class: "panel" },
      heading("description"),
      bindList(h("ul", { class: "list" }), p.description),
      heading("responsibilities"),
      bindList(h("ul", { class: "list dim" }), p.responsibilities),
    );
    list.append(reveal(h("article", { class: `project${i % 2 ? " reverse" : ""}${portrait ? " portrait" : ""}` },
      h("div", { class: "project-media" },
        h("div", { class: "project-head" },
          bindText(h("h3"), p.title),
          bindText(h("p"), p.tagline)),
        createVideo(p.video),
        storeButtons(p.stores)),
      h("div", { class: "project-info" },
        tagList(p.tags),
        h("div", { class: "panel-wrap" }, panel, explore(p.exploreUrl))),
    )));
  });
}

export function renderBlender(items) {
  const list = $("#blenderList");
  items.forEach(b => {
    const portrait = b.video?.orientation === "portrait";
    list.append(reveal(h("article", { class: `blender-item${portrait ? " portrait" : ""}` },
      b.title ? bindText(h("h3"), b.title) : null,
      createVideo(b.video),
      tagList(b.tags),
      bindText(h("p", { class: "blender-desc" }), b.description),
      h("div", { class: "cta" }, explore(b.exploreUrl)),
    )));
  });
}
