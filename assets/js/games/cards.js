// Video Games page — poster card (owner's pick, variant 1 of 3): illustration on top with the logo overlapping its
// lower edge, title, genre · team · downloads row, role tags, 3-line description, "View project →".
// The whole card is one <a> to project.html?id=<folder>. Empty fields render nothing.
import { h } from "../utils.js";
import { tr, label, bind, bindText } from "../i18n.js";
import { setRich, stripRich } from "../richtext.js";
import { has } from "../project/model.js";
import { blurb } from "./model.js";

const lbl = (tag, key) => bind(h(tag), el => setRich(el, label(key)));

/** members: a number → "{n} members" template; a string → as written (same rule as the project page) */
function membersText(members) {
  const v = tr(members);
  return typeof v === "number" ? label("pd_members", { n: v }) : String(v);
}

/** initials for the generated placeholder ("Grow a Garden" → "GG") */
const initials = c => stripRich(tr(c.title)).split(/[\s:|\-–]+/).filter(w => /^[\p{L}\d]/u.test(w) && !/^(a|an|the|of|and)$/i.test(w))
  .slice(0, 2).map(w => w[0].toUpperCase()).join("") || "?";

/** illustration; no image at all → a HUD "no signal" placeholder with the game's initials */
function media(c) {
  return h("div", { class: "gc-media" }, c.image
    ? h("img", { class: `gc-img kind-${c.imageKind}`, src: c.image, alt: "", loading: "lazy", decoding: "async" })
    : h("div", { class: "gc-ph", "aria-hidden": "true" }, h("span", {}, initials(c))));
}
const logo = c => c.logo ? h("img", { class: "gc-logo", src: c.logo, alt: "", loading: "lazy" }) : null;
const title = c => has(c.title) ? bindText(h("h2", { class: "gc-title" }), c.title) : null;
const desc = c => has(blurb(c)) ? bind(h("p", { class: "gc-desc" }), el => setRich(el, blurb(c))) : null;

/** role tags: the first `max` + a "+k" tag (the rest in its tooltip) */
function tags(c, max) {
  if (!c.tags.length) return null;
  const more = c.tags.length - max;
  return h("div", { class: "tags gc-tags" }, c.tags.slice(0, more > 0 ? max : undefined).map(t => bindText(h("span", { class: "tag" }), t)),
    more > 0 ? h("span", { class: "tag gc-more", title: c.tags.slice(max).map(t => stripRich(tr(t))).join(", ") }, `+${more}`) : null);
}

/** GENRE Casual │ TEAM 7 members │ DOWNLOADS 70M+ (only the filled ones) */
function stats(c) {
  const defs = {
    genre: ["pd_genre", () => tr(c.genre)],
    members: ["pd_team", () => membersText(c.members)],
    downloads: ["pd_downloads", () => tr(c.downloads)],
  };
  const items = Object.keys(defs).filter(k => c[k] != null).map(k => {
    const [key, value] = defs[k];
    return h("div", { class: `gc-stat stat-${k}` }, lbl("small", key), bind(h("b"), el => setRich(el, String(value()))));
  });
  return items.length ? h("div", { class: "gc-stats" }, items) : null;
}

const view = () => h("span", { class: "gc-view" }, lbl("span", "games_view"), h("i", { "aria-hidden": "true" }));
const corners = () => ["c1", "c2", "c3", "c4"].map(k => h("i", { class: `gc-corner ${k}`, "aria-hidden": "true" }));

export const gameCard = (c, i) => h("a", { class: "gcard", href: c.href },
  h("div", { class: "gc-top" }, media(c), h("span", { class: "gc-idx" }, String(i + 1).padStart(2, "0")), corners(), logo(c)),
  h("div", { class: "gc-body" + (c.logo ? " has-logo" : "") },
    title(c), stats(c), tags(c, 4), desc(c), view()));
