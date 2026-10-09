// Language state. Any text value in the config/data can be a plain string
// or { "en": ..., "vi": ... }; tr() picks the current language (falls back to English).
import { $, $$, h } from "./utils.js";

const STORAGE_KEY = "portfolio-lang";
const state = { lang: "en", fallback: "en", dict: {}, languages: {} };
const bindings = [];
const listeners = [];

const isEmpty = v => v == null || v === "" || (Array.isArray(v) && v.length === 0);

export function tr(value) {
  if (value == null) return "";
  if (typeof value !== "object" || Array.isArray(value)) return value;
  const v = value[state.lang];
  return isEmpty(v) ? (value[state.fallback] ?? Object.values(value).find(x => !isEmpty(x)) ?? "") : v;
}

/** UI label from web-config.json → i18n.<lang>.<key> */
export function label(key, vars = {}) {
  const raw = state.dict[state.lang]?.[key] ?? state.dict[state.fallback]?.[key] ?? key;
  return raw.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

export const currentLang = () => state.lang;

/** Registers a render function that re-runs on language change. */
export function bind(el, render) {
  bindings.push({ el, render });
  render(el);
  return el;
}
export const bindText = (el, value) => bind(el, e => { e.textContent = tr(value); });
export const bindList = (ul, value) => bind(ul, e => {
  const items = tr(value);
  e.replaceChildren(...(Array.isArray(items) ? items : [items]).filter(Boolean).map(t => h("li", {}, t)));
});
export const onLangChange = fn => listeners.push(fn);

function applyStatic() {
  // labels may contain <br> — they come from the site owner's own web-config.json
  $$("[data-i18n]").forEach(el => { el.innerHTML = label(el.dataset.i18n); });
}

export function setLang(lang) {
  if (!state.languages[lang]) return;
  state.lang = lang;
  try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
  document.documentElement.lang = lang;
  applyStatic();
  bindings.forEach(b => b.render(b.el));
  listeners.forEach(fn => fn(lang));
}

export function initI18n(config) {
  state.dict = config.i18n || {};
  state.languages = config.site?.languages || { en: "English" };
  state.fallback = config.site?.defaultLang || "en";
  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch {}
  state.lang = state.languages[saved] ? saved : state.fallback;
  document.documentElement.lang = state.lang;
  applyStatic();
  initDropdown();
}

function initDropdown() {
  const root = $("#lang");
  const btn = $(".lang-btn", root), menu = $(".lang-menu", root), labelEl = $(".lang-label", root);
  menu.replaceChildren(...Object.entries(state.languages).map(([code, name]) =>
    h("li", { role: "option", "data-lang": code, tabindex: 0 }, name)));
  const sync = () => {
    labelEl.textContent = state.languages[state.lang];
    $$("li", menu).forEach(li => li.setAttribute("aria-selected", li.dataset.lang === state.lang));
  };
  const close = () => { root.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); };
  btn.addEventListener("click", e => {
    e.stopPropagation();
    btn.setAttribute("aria-expanded", root.classList.toggle("open"));
  });
  menu.addEventListener("click", e => {
    const li = e.target.closest("li");
    if (li) { setLang(li.dataset.lang); close(); }
  });
  menu.addEventListener("keydown", e => {
    if (e.key === "Enter" && e.target.dataset.lang) { setLang(e.target.dataset.lang); close(); }
  });
  document.addEventListener("click", close);
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  onLangChange(sync);
  sync();
}
