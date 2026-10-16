// Video Games page — Database/Projects (every folder in index.json, featured or not) → card models.
// Every field is optional; cards.js skips what is missing.
//   "thumbnail": "images/thumbnail.jpg"   card image (relative to the project folder or https://…)
//                                         fallback: thumbnail → cover → YouTube thumbnail → logo → generated placeholder
//   "featured": false                     keeps the project off the home page (sections/projects.js); listed here anyway
import { loadCollection, resolvePath } from "../utils.js";
import { tr } from "../i18n.js";
import { has } from "../project/model.js";

/** folder name from _base ("Database/Projects/<folder>/") */
export const folderOf = p => (p._base || "").split("/").filter(Boolean).pop() || "";

/** raw data.json (+ _base) → card model */
export function toCard(raw) {
  const path = p => resolvePath(raw._base, String(p).trim());
  const yt = has(raw.video?.youtube) ? raw.video.youtube.trim() : "";
  const logo = has(raw.logo) ? path(raw.logo) : "";
  const [image, imageKind] =
    has(raw.thumbnail) ? [path(raw.thumbnail), "thumbnail"]
    : has(raw.cover) ? [path(raw.cover), "cover"]
    : yt ? [`https://i.ytimg.com/vi/${encodeURIComponent(yt)}/hqdefault.jpg`, "youtube"]
    : logo ? [logo, "logo"] : ["", ""];
  const id = folderOf(raw);
  return {
    id,
    href: `project.html?id=${encodeURIComponent(id)}&from=games`,   // → the project page's back link returns to games.html
    title: raw.title,
    tagline: raw.tagline,
    description: raw.description,
    tags: (raw.tags || []).filter(has),
    genre: has(raw.genre) ? raw.genre : null,
    members: has(raw.members) ? raw.members : null,
    downloads: has(raw.downloads) ? raw.downloads : null,
    logo, image, imageKind,
  };
}

/** card text: first item of the description (string or list, per language) → tagline */
export function blurb(c) {
  const d = tr(c.description);
  const first = Array.isArray(d) ? d.map(tr).find(has) : d;
  return has(first) ? first : has(c.tagline) ? tr(c.tagline) : "";
}

export async function loadGames() {
  return (await loadCollection("Projects")).map(toCard);
}
