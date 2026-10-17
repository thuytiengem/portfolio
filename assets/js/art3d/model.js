// 3D Artwork page — Database/Art3D/data.json → normalized model. Every field is optional; empty items are dropped here
// so the renderer never draws an empty box.
//
//   { "intro": rich,
//     "projects": [ { "id": "blossom-fairy", "name": rich, "text": rich | [rich…], "tools"?: [rich…], "cover"?: "file.jpg",
//                     "final": { "videos": [ { "youtube": "id | url", "orientation"?: "landscape|portrait", "caption"?: rich } ],
//                                "images": [ "01.jpg" | { "src": "01.jpg", "caption": rich } ] },
//                     "steps": [ { "title": rich, "text": rich | [rich…], "images": [ … ], "video"?: { "youtube", "orientation", "caption" } } ] } ] }
//
// Images = file names inside Database/Art3D/images/<project id>/ (steps use the same folder); full URLs pass through.
// YouTube: a plain id or any youtube.com / youtu.be / shorts / embed / live URL; a /shorts/ URL is portrait unless said otherwise.
import { resolvePath } from "../utils.js";
import { has } from "../project/model.js";
import { slug } from "../art2d/model.js";

export { has, slug };

const isUrl = s => /^(https?:)?\/\/|^data:/i.test(s);

/** "LhaYfT7kzbg" | "https://youtu.be/…" | ".../watch?v=…" | ".../shorts/…" | ".../embed/…" | ".../live/…" → { id, shorts } (id "" = invalid) */
export function youtubeId(value) {
  const s = String(value || "").trim();
  if (/^[\w-]{11}$/.test(s)) return { id: s, shorts: false };
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    if (!/(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)$/i.test(u.hostname)) return { id: "", shorts: false };
    const parts = u.pathname.split("/").filter(Boolean);
    const id = u.hostname.endsWith("youtu.be") ? parts[0]
      : u.searchParams.get("v") || (["shorts", "embed", "live", "v"].includes(parts[0]) ? parts[1] : "");
    return /^[\w-]{11}$/.test(id || "") ? { id, shorts: parts[0] === "shorts" } : { id: "", shorts: false };
  } catch { return { id: "", shorts: false }; }
}

/** { youtube, orientation?, caption? } (or just the id / URL) → { youtube: id, orientation, caption } | null (invalid → dropped) */
export function videoOf(v) {
  if (typeof v === "string") v = { youtube: v };
  const { id, shorts } = youtubeId(v?.youtube);
  if (!id) return null;
  const orientation = v.orientation === "portrait" || v.orientation === "landscape" ? v.orientation : shorts ? "portrait" : "landscape";
  return { youtube: id, orientation, caption: v.caption };
}

function imageList(list, dir) {
  return (Array.isArray(list) ? list : [])
    .map(im => typeof im === "string" ? { src: im } : im)
    .filter(im => typeof im?.src === "string" && has(im.src))
    .map(im => {
      const src = im.src.trim();
      return { ...im, src: isUrl(src) ? src : dir + src.split("/").map(encodeURIComponent).join("/") };
    });
}

/** raw data.json + its folder ("Database/Art3D/") → { intro, projects: [...], totals: { projects, videos, images } } */
export function normalize(raw, base) {
  const used = new Set();
  const projects = (Array.isArray(raw?.projects) ? raw.projects : []).map((p, i) => {
    const folder = typeof p?.id === "string" ? p.id.trim() : "";
    const dir = resolvePath(base, folder ? `images/${encodeURIComponent(folder)}/` : "images/");
    let id = slug(folder) || `project-${i + 1}`;          // unique DOM id / anchor even for duplicates
    while (used.has(id)) id += "-x";
    used.add(id);
    const videos = (Array.isArray(p?.final?.videos) ? p.final.videos : []).map(videoOf).filter(Boolean);
    const images = imageList(p?.final?.images, dir);
    const steps = (Array.isArray(p?.steps) ? p.steps : [])
      .map(st => ({ title: st?.title, text: st?.text, images: imageList(st?.images, dir), video: videoOf(st?.video) }))
      .filter(st => has(st.title) || has(st.text) || st.images.length || st.video);
    const tools = (Array.isArray(p?.tools) ? p.tools : []).filter(has);
    const all = [...images, ...steps.flatMap(st => st.images)];
    // cover: stored for later layouts (the current page does not show it)
    const cover = has(p?.cover) ? imageList([p.cover], dir)[0].src : all[0]?.src || "";
    return {
      id, folder, name: has(p?.name) ? p.name : folder, text: p?.text, tools,
      final: { videos, images }, steps, cover,
      count: { images: all.length, videos: videos.length + steps.filter(st => st.video).length, steps: steps.length },
    };
  }).filter(p => has(p.name) || has(p.text) || p.final.videos.length || p.count.images || p.steps.length);
  const sum = k => projects.reduce((n, p) => n + p.count[k], 0);
  return { intro: raw?.intro, projects, totals: { projects: projects.length, images: sum("images"), videos: sum("videos") } };
}
