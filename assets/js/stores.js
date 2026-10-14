// Store / download buttons (Google Play · App Store · APK) — used under the home-page videos and on project.html.
// Data: "stores": { "googlePlay", "appStore", "apk" } in a project's data.json; empty / non-http values are hidden.
import { h } from "./utils.js";
import { bind, label } from "./i18n.js";

const STORES = [["googlePlay", "store_google_play", "googleplay"], ["appStore", "store_app_store", "appstore"], ["apk", "store_apk", "android"]];

/** → <div class="stores"> with the filled buttons, or null when there is none */
export function storeButtons(stores, cls = "stores") {
  const items = STORES.filter(([k]) => /^https?:\/\//i.test(String(stores?.[k] || "").trim()));
  if (!items.length) return null;
  return h("div", { class: cls }, items.map(([k, key, icon]) =>
    h("a", { class: `btn-store store-${k}`, href: stores[k].trim(), target: "_blank", rel: "noopener", ...(k === "apk" ? { download: "" } : {}) },
      h("img", { src: `assets/icons/${icon}.svg`, alt: "" }),
      h("span", { class: "store-text" },
        bind(h("small"), el => { el.textContent = label(`${key}_hint`); }),
        bind(h("b"), el => { el.textContent = label(key); })))));
}
