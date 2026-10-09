// Small DOM / data helpers shared by every module.

/** h("div", { class: "x", onclick }, child, "text") → element */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat()) if (c != null && c !== false) el.append(c instanceof Node ? c : String(c));
  return el;
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export async function loadJSON(url) {
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}

/** Loads Database/<kind>/index.json and every <folder>/data.json, keeping index order. */
export async function loadCollection(kind) {
  const base = `Database/${kind}/`;
  let names = [];
  try { names = await loadJSON(`${base}index.json`); } catch (e) { console.warn(e); return []; }
  const items = await Promise.all(names.map(async name => {
    try { return { ...(await loadJSON(`${base}${name}/data.json`)), _base: `${base}${name}/` }; }
    catch (e) { console.warn(e); return null; }
  }));
  return items.filter(Boolean);
}

/** Relative file paths inside a data folder → page-relative URL; full URLs pass through. */
export function resolvePath(base, path) {
  if (!path) return "";
  return /^(https?:)?\/\/|^data:|^\//.test(path) ? path : base + path;
}

/** Adds the "in" class when an element scrolls into view (CSS .reveal). */
const revealer = "IntersectionObserver" in window
  ? new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); revealer.unobserve(e.target); }
    }), { threshold: 0.15 })
  : null;
export function reveal(el) {
  el.classList.add("reveal");
  revealer ? revealer.observe(el) : el.classList.add("in");
  return el;
}
