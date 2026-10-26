// 2D Artwork page — Database/Art2D/data.json → normalized model. Every field is optional; empty items are dropped here
// so the renderer never draws an empty box.
//
//   { "intro": rich,
//     "categories": [ { "id": "personal-artworks", "name": rich, "text": rich | [rich…] } ],   ← the tabs, in order
//     "projects": [ { "id": "cast-spell", "category": "personal-artworks", "name": rich, "text": rich | [rich…],
//                     "cover"?: "file.jpg", "images": [ "01.jpg" | { "src": "01.jpg", "caption": rich } ],
//                     "steps"?: [ { "title": rich, "text": rich | [rich…], "images": [ … ] } ] } ] }
//
// The FIRST category is Personal Artworks: its projects are also the slides of the home page carousel (cover, name, text).
// The next 3 are the home page "Other 2D Projects" cards. Projects follow their category in list order; a project whose
// category does not exist is not shown.
// Images = file names inside Database/Art2D/images/<project id>/ (steps use the same folder); full URLs pass through.
import { resolvePath } from "../utils.js";
import { has } from "../project/model.js";

export { has };

const isUrl = s => /^(https?:)?\/\/|^data:/i.test(s);
/** "a-z 0-9 -" slug (also the anchor of a tab / project: art2d.html#fanart) */
export const slug = s => String(s || "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
const arr = v => (Array.isArray(v) ? v : []);

function imageList(list, dir) {
  return arr(list)
    .map(im => typeof im === "string" ? { src: im } : im)
    .filter(im => typeof im?.src === "string" && has(im.src))
    .map(im => {
      const src = im.src.trim();
      return { ...im, src: isUrl(src) ? src : dir + src.split("/").map(encodeURIComponent).join("/") };
    });
}

/** raw data.json + its folder ("Database/Art2D/") →
 *  { intro, categories: [{ id, name, text, projects, images, cover }], projects, total: { projects, images } }
 *  project = { id, folder, category, name, text, images, steps, all, count, cover } */
export function normalize(raw, base) {
  const used = new Set();
  // unique DOM id / anchor (tabs and projects share one namespace)
  const uniq = (v, fallback) => { let id = slug(v) || fallback; while (used.has(id)) id += "-x"; used.add(id); return id; };
  const cats = arr(raw?.categories).map((c, i) => ({ key: typeof c?.id === "string" ? c.id.trim() : "", id: uniq(c?.id, `tab-${i + 1}`),
    name: has(c?.name) ? c.name : c?.id, text: c?.text, projects: [] }));
  const projects = arr(raw?.projects).map((p, i) => {
    const folder = typeof p?.id === "string" ? p.id.trim() : "";
    const dir = resolvePath(base, folder ? `images/${encodeURIComponent(folder)}/` : "images/");
    const images = imageList(p?.images, dir);
    const steps = arr(p?.steps)
      .map(st => ({ title: st?.title, text: st?.text, images: imageList(st?.images, dir) }))
      .filter(st => has(st.title) || has(st.text) || st.images.length);
    const all = [...images, ...steps.flatMap(st => st.images)];   // count: project images, then step images
    const cover = has(p?.cover) ? imageList([p.cover], dir)[0].src : all[0]?.src || "";
    const cat = cats.find(c => c.key && c.key === String(p?.category ?? "").trim());
    return { id: uniq(folder, `project-${i + 1}`), folder, cat, name: has(p?.name) ? p.name : folder, text: p?.text,
      images, steps, all, count: all.length, cover };
  }).filter(p => p.cat && (has(p.name) || has(p.text) || p.count || p.steps.length));
  projects.forEach(p => { p.cat.projects.push(p); p.category = p.cat.id; delete p.cat; });
  const categories = cats.filter(c => c.projects.length || has(c.name)).map(({ key, ...c }) => ({
    ...c, images: c.projects.reduce((n, p) => n + p.count, 0), cover: c.projects.find(p => p.cover)?.cover || "",
  }));
  return { intro: raw?.intro, categories, projects, total: { projects: projects.length, images: projects.reduce((n, p) => n + p.count, 0) } };
}
