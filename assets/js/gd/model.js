// Graphic Design page — ONE data source for the list (cards) and the project detail view.
// Database/GraphicDesign/data.json → normalized model. Every field is optional; empty items are dropped here so the
// renderers never draw an empty box. Same shape as Art2D / Art3D (one data.json, id = image folder) so the Studio reuses
// its generic PAGES / pg* code.
//
//   { "intro": rich | [rich…],
//     "projects": [ { "id": "gem-brand-identity",                 ← folder images/<id>/ + URL ?id=<id>
//                     "name": rich,                               ← card title + detail title + tab title
//                     "text": rich | [rich…],                     ← card description (3 lines) + detail intro
//                     "cover"?: "logo-final.jpg",                 ← card image + detail hero + pager (fallback: first step image)
//                     "client"?: rich, "year"?: "2025", "tools"?: [rich…],
//                     "steps": [ { "title": rich, "text": rich | [rich…],
//                                  "images": [ "01.jpg" | { "src": "01.jpg", "caption": rich } ] } ] } ] }
//
// Images = file names inside Database/GraphicDesign/images/<project id>/ (every step uses that folder); full URLs pass through.
import { resolvePath } from "../utils.js";
import { has } from "../project/model.js";
import { slug } from "../art2d/model.js";

export { has };

export const BASE = "Database/GraphicDesign/";
export const PAGE = "graphic-design.html";

const isUrl = s => /^(https?:)?\/\/|^data:/i.test(s);

function imageList(list, dir) {
  return (Array.isArray(list) ? list : [])
    .map(im => typeof im === "string" ? { src: im } : im)
    .filter(im => typeof im?.src === "string" && has(im.src))
    .map(im => {
      const src = im.src.trim();
      return { ...im, src: isUrl(src) ? src : dir + src.split("/").map(encodeURIComponent).join("/") };
    });
}

/** raw data.json + its folder ("Database/GraphicDesign/") → { intro, projects: [...], totals: { projects, images } } */
export function normalize(raw, base = BASE) {
  const used = new Set();
  const projects = (Array.isArray(raw?.projects) ? raw.projects : []).map((p, i) => {
    const folder = typeof p?.id === "string" ? p.id.trim() : "";
    const dir = resolvePath(base, folder ? `images/${encodeURIComponent(folder)}/` : "images/");
    let id = slug(folder) || `project-${i + 1}`;            // unique id (URL ?id= and DOM) even for duplicates
    while (used.has(id)) id += "-x";
    used.add(id);
    const steps = (Array.isArray(p?.steps) ? p.steps : [])
      .map(st => ({ title: st?.title, text: st?.text, images: imageList(st?.images, dir) }))
      .filter(st => has(st.title) || has(st.text) || st.images.length);
    const all = steps.flatMap(st => st.images);
    const cover = has(p?.cover) ? imageList([p.cover], dir)[0]?.src || "" : all[0]?.src || "";
    return {
      id, folder, name: has(p?.name) ? p.name : folder, text: p?.text, cover,
      client: has(p?.client) ? p.client : null, year: has(p?.year) ? p.year : null,
      tools: (Array.isArray(p?.tools) ? p.tools : []).filter(has),
      steps, all, count: { steps: steps.length, images: all.length },
    };
  }).filter(p => has(p.name) || has(p.text) || p.steps.length);
  return {
    intro: raw?.intro, projects,
    totals: { projects: projects.length, images: projects.reduce((n, p) => n + p.count.images, 0) },
  };
}

/** URLs: list = graphic-design.html (#gd-<id> = back to that card), detail = graphic-design.html?id=<id> (#step-n = a step) */
export const listHref = id => id ? `${PAGE}#gd-${id}` : PAGE;
export const projectHref = id => `${PAGE}?id=${encodeURIComponent(id)}`;
export const stepId = i => `step-${i + 1}`;
