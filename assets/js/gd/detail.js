// Graphic Design — detail view (graphic-design.html?id=<id>): HUD banner with "GRAPHIC DESIGN 01 / 05", title,
// client · year, text, TOOLS chips, step / image chips and the cover framed on the right (never cropped, click → lightbox),
// then the PROCESS steps on the cyan rail of art2d.css (text + filmstrip + lightbox each), then previous / all / next.
import { h, $$, reveal } from "../utils.js";
import { tr, bind, label } from "../i18n.js";
import { setRich } from "../richtext.js";
import { lbl, rich, num } from "../project/parts.js";
import { filmstrip } from "../project/gallery.js";
import { openLightbox } from "../project/lightbox.js";
import { listHref, projectHref, stepId } from "./model.js";
import { title, imagesCount, stepsCount, metaLine, scrollToStep } from "./parts.js";

const corners = () => ["c1", "c2", "c3", "c4"].map(c => h("i", { class: c, "aria-hidden": "true" }));

function hero(p, index, total) {
  const all = p.all, at = all.findIndex(im => im.src === p.cover);
  const cover = p.cover ? h("button", {
    class: "gd-cover", type: "button",
    onclick: () => at >= 0 ? openLightbox(all, at) : openLightbox([{ src: p.cover }]),
  }, h("img", { src: p.cover, alt: "", decoding: "async", fetchpriority: "high" }), corners()) : null;
  if (cover) bind(cover, el => el.setAttribute("aria-label", label("gd_open_images", { n: all.length || 1 })));
  const chips = [stepsCount(p.count.steps, "pb-chip"), imagesCount(p.count.images, "pb-chip")].filter(Boolean);
  return h("header", { class: "pb gd-pb" },
    h("div", { class: "container" },
      Object.assign(lbl("a", "gd_back_list", "pb-back"), { href: listHref(p.id) }),
      h("div", { class: `hud-frame pb-row gd-hero${cover ? "" : " no-cover"}` },
        h("div", { class: "pb-text gd-text" },
          h("p", { class: "gd-kicker" }, lbl("span", "gd_page_title"), h("span", { class: "gd-of" }, `${num(index + 1)} / ${num(total)}`)),
          title("h1", p.name, "pb-title gd-title"),
          metaLine(p, "gd-meta gd-meta-lg"),
          rich(p.text, "pb-intro"),
          p.tools.length ? h("div", { class: "a3-tools" }, lbl("span", "gd_tools", "a3-kicker"),
            h("div", { class: "a3-tool-list" }, p.tools.map(t => bind(h("span", { class: "a3-tool" }), el => setRich(el, tr(t)))))) : null,
          chips.length ? h("div", { class: "pb-chips" }, chips) : null),
        cover,
        corners())));
}

function stepRow(st, i) {
  return h("li", { class: "a2-step", id: stepId(i) },
    h("div", { class: "a2-step-n", "aria-hidden": "true" }, num(i + 1)),
    h("div", { class: "a2-step-body" },
      h("div", { class: "a2-step-head" },
        lbl("span", "gd_step", "a2-step-kicker", { n: i + 1 }),
        title("h3", st.title, "a2-step-title"),
        imagesCount(st.images.length, "pd-count")),
      rich(st.text, "stage-text"),
      filmstrip(st.images)));
}

/** ← previous · all projects · next → (at the ends: only the side that exists) */
function pager(list, index) {
  const side = (p, key, cls) => p ? h("a", { class: `gd-pg ${cls}`, href: projectHref(p.id) },
    p.cover ? h("img", { src: p.cover, alt: "", loading: "lazy", decoding: "async" }) : h("span", { class: "gd-pg-ph", "aria-hidden": "true" }),
    h("span", { class: "gd-pg-txt" }, lbl("small", key), title("b", p.name, "gd-pg-name"))) : h("span", { class: `gd-pg-void ${cls}` });
  return h("nav", { class: "container gd-pager" },
    side(list[index - 1], "gd_prev_project", "prev"),
    Object.assign(lbl("a", "gd_all_projects", "gd-pg-all"), { href: listHref(list[index].id) }),
    side(list[index + 1], "gd_next_project", "next"));
}

export function renderDetail(model, p, index, main) {
  main.replaceChildren(...[
    hero(p, index, model.projects.length),
    p.steps.length ? h("section", { class: "pd-sec gd-process" },
      h("div", { class: "container" },
        h("div", { class: "a3-kick" }, lbl("span", "gd_process"), h("i", { "aria-hidden": "true" })),
        h("ol", { class: "a2-steps" }, p.steps.map(stepRow)))) : null,
    model.projects.length > 1 ? pager(model.projects, index) : null].filter(Boolean));
  $$(".gd-hero, .gd-process .a3-kick, .gd-process .a2-step, .gd-pager", main).forEach(reveal);
  scrollToStep("a2-step");   // ?id=…#step-2 → that step
}
