// Project detail page — data.json → normalized model. Every field is optional; empty items are dropped here
// so the renderers never draw an empty box. Field list: README.md / PROJECT-PAGE.md.
import { resolvePath } from "../utils.js";

/** true when a value (string, number, array, { en, vi }) has something to show */
export function has(v) {
  if (v == null || v === false) return false;
  if (typeof v === "number") return true;
  if (typeof v === "string") return v.trim() !== "";
  if (Array.isArray(v)) return v.some(has);
  if (typeof v === "object") return Object.values(v).some(has);
  return false;
}

const isUrl = s => /^(https?:)?\/\//i.test(s);

/** progression image → URL: a file name inside <project>/images/product-progression/<step id>/ (full URLs pass through) */
function stepImage(base, id, src) {
  src = src.trim();
  if (isUrl(src)) return src;
  const dir = id ? `images/product-progression/${encodeURIComponent(id)}/` : "";
  return base + dir + src.split("/").map(encodeURIComponent).join("/");
}

/** raw data.json + its folder ("Database/Projects/<id>/") → model for render.js */
export function normalize(raw, base) {
  const m = { ...raw };
  const path = p => resolvePath(base, String(p).trim());
  m.logo = has(raw.logo) ? path(raw.logo) : "";
  // cover → YouTube thumbnail → logo (shown blurred, so any picture works)
  m.cover = has(raw.cover) ? path(raw.cover)
    : has(raw.video?.youtube) ? `https://i.ytimg.com/vi/${encodeURIComponent(raw.video.youtube.trim())}/hqdefault.jpg` : m.logo;
  m.tags = (raw.tags || []).filter(has);
  m.roles = (Array.isArray(raw.roles) ? raw.roles : []).filter(r => has(r?.title) || has(r?.text));
  // no "roles" yet → the home-page "responsibilities" list becomes one untitled role
  if (!m.roles.length && has(raw.responsibilities)) m.roles = [{ title: "", text: raw.responsibilities }];
  m.progression = (Array.isArray(raw.progression) ? raw.progression : []).map(s => {
    const id = typeof s?.id === "string" ? s.id.trim() : "";
    return {
      id, name: has(s?.name) ? s.name : id, text: s?.text,
      images: (Array.isArray(s?.images) ? s.images : []).map(im => typeof im === "string" ? { src: im } : im)
        .filter(im => typeof im?.src === "string" && has(im.src)).map(im => ({ ...im, src: stepImage(base, id, im.src) })),
    };
  }).filter(s => has(s.name) || has(s.text) || s.images.length);
  m.challenges = (Array.isArray(raw.challenges) ? raw.challenges : []).filter(c => has(c?.problem) || has(c?.solution));
  // [item…] or { en: [...], vi: [...] }; item = rich text | { en, vi } | { title, text }
  m.learned = Array.isArray(raw.learned) ? raw.learned.filter(has) : has(raw.learned) ? raw.learned : [];
  return m;
}
