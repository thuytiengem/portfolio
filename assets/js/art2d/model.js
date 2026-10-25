// 2D Artwork page — Database/Art2D/data.json → normalized model. Every field is optional; empty items are dropped here
// so the renderer never draws an empty box.
//
//   { "intro": rich,
//     "sections": [ { "id": "fanart", "name": rich, "text": rich | [rich…], "cover"?: "file.jpg",
//                     "homeOther"?: true (one of the 3 cards of the home page "Other 2D Projects"),
//                     "images": [ "01.jpg" | { "src": "01.jpg", "caption": rich, "home"?: true, "title"?: rich } ],
//                     "steps"?: [ { "title": rich, "text": rich | [rich…], "images": [ … ] } ] } ] }
//
// Images = file names inside Database/Art2D/images/<section id>/ (steps use the same folder); full URLs pass through.
// An image with "home": true is also a slide of the home page Personal Artworks carousel ("title" = its big title there,
// "caption" = the line under it).
import { resolvePath } from "../utils.js";
import { has } from "../project/model.js";

export { has };

const isUrl = s => /^(https?:)?\/\/|^data:/i.test(s);
/** "a-z 0-9 -" slug (also the anchor of the section: art2d.html#fanart) */
export const slug = s => String(s || "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");

function imageList(list, dir) {
  return (Array.isArray(list) ? list : [])
    .map(im => typeof im === "string" ? { src: im } : im)
    .filter(im => typeof im?.src === "string" && has(im.src))
    .map(im => {
      const src = im.src.trim();
      return { ...im, src: isUrl(src) ? src : dir + src.split("/").map(encodeURIComponent).join("/") };
    });
}

/** raw data.json + its folder ("Database/Art2D/") → { intro, sections: [{ id, name, text, images, steps, all, count, cover }], total } */
export function normalize(raw, base) {
  const used = new Set();
  const sections = (Array.isArray(raw?.sections) ? raw.sections : []).map((s, i) => {
    const folder = typeof s?.id === "string" ? s.id.trim() : "";
    const dir = resolvePath(base, folder ? `images/${encodeURIComponent(folder)}/` : "images/");
    // unique DOM id even when two sections share (or miss) an id
    let id = slug(folder) || `section-${i + 1}`;
    while (used.has(id)) id += "-x";
    used.add(id);
    const images = imageList(s?.images, dir);
    const steps = (Array.isArray(s?.steps) ? s.steps : [])
      .map(st => ({ title: st?.title, text: st?.text, images: imageList(st?.images, dir) }))
      .filter(st => has(st.title) || has(st.text) || st.images.length);
    const all = [...images, ...steps.flatMap(st => st.images)];   // count: section images, then step images
    const cover = has(s?.cover) ? imageList([s.cover], dir)[0].src : all[0]?.src || "";
    return { id, folder, name: has(s?.name) ? s.name : folder, text: s?.text, images, steps, all, count: all.length, cover, homeOther: s?.homeOther === true };
  }).filter(s => has(s.name) || has(s.text) || s.count || s.steps.length);
  return { intro: raw?.intro, sections, total: sections.reduce((n, s) => n + s.count, 0) };
}
