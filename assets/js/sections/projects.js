// FEATURED PROJECTS and 3D BLENDER sections.
import { h, $, reveal } from "../utils.js";
import { tr, bind, bindText, bindList, label } from "../i18n.js";
import { setRich } from "../richtext.js";
import { titleFont } from "../page-banner.js";
import { framedVideo } from "../youtube.js";
import { storeButtons } from "../stores.js";
import { has } from "../project/model.js";
import { rich } from "../project/parts.js";

const tagList = tags => h("div", { class: "tags" }, (tags || []).map(t => bindText(h("span", { class: "tag" }), t)));
const explore = url => bind(h("a", { class: "btn-explore", href: url || "#" }), el => { el.textContent = label("explore"); });
// Featured "Explore": exploreUrl when set, otherwise the project detail page (folder name from _base = "Database/Projects/<folder>/")
const detailUrl = p => p.exploreUrl || `project.html?id=${encodeURIComponent((p._base || "").split("/").filter(Boolean).pop() || "")}`;
const heading = key => bind(h("h4", { class: key === "responsibilities" ? "accent" : "" }), el => { el.textContent = label(key); });

/** home page Featured Projects: every project unless its data.json says "featured": false (games.html lists all) */
export const isFeatured = p => p.featured !== false;

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

/** home page 3D Blender = the 3D Artwork projects (Database/Art3D, art3d/model.js) marked "home": true that have a
 *  final video: name, first final video, role tags (none → tools), text; Explore → that project on art3d.html */
export function renderBlender(projects) {
  const list = $("#blenderList");
  projects.filter(p => p.home && p.final.videos.length).forEach(p => {
    const video = p.final.videos[0], portrait = video.orientation === "portrait";
    list.append(reveal(h("article", { class: `blender-item${portrait ? " portrait" : ""}` },
      has(p.name) ? bind(h("h3"), el => titleFont(setRich(el, tr(p.name)))) : null,
      framedVideo(video),
      tagList(p.tags.length ? p.tags : p.tools),
      rich(p.text, "blender-desc"),
      h("div", { class: "cta" }, explore(`art3d.html#${encodeURIComponent(p.id)}`)),
    )));
  });
  $("#blender").hidden = !list.children.length;
}
