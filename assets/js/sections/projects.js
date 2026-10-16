// FEATURED PROJECTS and 3D BLENDER sections.
import { h, $, reveal } from "../utils.js";
import { bind, bindText, bindList, label } from "../i18n.js";
import { framedVideo } from "../youtube.js";
import { storeButtons } from "../stores.js";

const tagList = tags => h("div", { class: "tags" }, (tags || []).map(t => bindText(h("span", { class: "tag" }), t)));
const explore = url => bind(h("a", { class: "btn-explore", href: url || "#" }), el => { el.textContent = label("explore"); });
// Featured "Explore": exploreUrl when set, otherwise the project detail page (folder name from _base = "Database/Projects/<folder>/")
const detailUrl = p => p.exploreUrl || `project.html?id=${encodeURIComponent((p._base || "").split("/").filter(Boolean).pop() || "")}`;
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
        framedVideo(p.video),
        storeButtons(p.stores)),
      h("div", { class: "project-info" },
        tagList(p.tags),
        h("div", { class: "panel-wrap" }, panel, explore(detailUrl(p)))),
    )));
  });
}

export function renderBlender(items) {
  const list = $("#blenderList");
  items.forEach(b => {
    const portrait = b.video?.orientation === "portrait";
    list.append(reveal(h("article", { class: `blender-item${portrait ? " portrait" : ""}` },
      b.title ? bindText(h("h3"), b.title) : null,
      framedVideo(b.video),
      tagList(b.tags),
      bindText(h("p", { class: "blender-desc" }), b.description),
      h("div", { class: "cta" }, explore(b.exploreUrl)),
    )));
  });
}
