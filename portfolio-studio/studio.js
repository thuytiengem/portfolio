// Portfolio Studio — UI. Talks to portfolio-studio/server.mjs; every write sends the X-Studio header.

const SOCIALS = [
  ["artstation", "ArtStation", "https://www.artstation.com/…"], ["patreon", "Patreon", "https://www.patreon.com/…"],
  ["deviantart", "DeviantArt", "https://www.deviantart.com/…"], ["instagram", "Instagram", "https://instagram.com/…"],
  ["facebook", "Facebook", "https://www.facebook.com/…"], ["x", "X (Twitter)", "https://x.com/…"],
  ["tiktok", "TikTok", "https://www.tiktok.com/@…"], ["reddit", "Reddit", "https://www.reddit.com/user/…"],
  ["linkedin", "LinkedIn", "https://linkedin.com/in/…"], ["behance", "Behance", "https://behance.net/…"],
  ["youtube", "YouTube", "https://youtube.com/@…"], ["bluesky", "Bluesky", "https://bsky.app/profile/…"],
  ["itchio", "itch.io", "https://….itch.io"], ["discord", "Discord", "https://discord.gg/…"], ["whatsapp", "WhatsApp", "https://wa.me/84…"],
];
// store / download buttons of a featured project (data.json → "stores"); empty = button hidden on the site
const STORES = [
  ["googlePlay", "Google Play", "Play", "https://play.google.com/store/apps/details?id=…"],
  ["appStore", "App Store", "iOS", "https://apps.apple.com/app/…"],
  ["apk", "File APK", "APK", "https://… .apk", "Link tải trực tiếp file .apk, ví dụ Google Drive / GitHub Releases."],
];
const badUrl = v => !!String(v ?? "").trim() && !/^https?:\/\//i.test(String(v).trim());
const KINDS = {
  projects: { title: "Dự án game", noun: "dự án", dir: "Projects", section: "#featured" },
};
// short explanations for the UI text keys in web-config.json → i18n
const KEY_HINTS = {
  nav_home: "Menu: Home", nav_portfolio: "Menu: Portfolio", nav_about: "Menu: About me", nav_contact: "Menu: Contact",
  featured_title: "Tiêu đề section dự án", blender_title: "Tiêu đề section Blender", artworks_title: "Tiêu đề section 2D Artwork",
  artworks_other: "2D Artwork trang chủ: tiêu đề phần 02 (3 thẻ mục)", about_title: "Tiêu đề section About",
  description: "Nhãn khung mô tả", responsibilities: "Nhãn khung trách nhiệm", explore: "Chữ trên nút Explore",
  other_title: "Tiêu đề khối dự án khác", other_text: "Mô tả khối dự án khác (<br> = xuống dòng)",
  profile_suffix: "Chữ sau tên ở About", photo: "Chữ khi chưa có ảnh", experience_title: "Tiêu đề kinh nghiệm",
  talk_title: "Tiêu đề footer", talk_text: "Đoạn giới thiệu footer (<br> = xuống dòng)", my_email: "Nhãn email", my_phone: "Nhãn số điện thoại",
  form_name: "Nhãn ô tên", form_email: "Nhãn ô email", form_message: "Nhãn ô lời nhắn", form_send: "Chữ nút gửi form",
  mail_subject: "Tiêu đề mail ({name}, {email})", mail_body: "Nội dung mail ({message}, {name}, {email})", copyright: "Dòng bản quyền",
  pm_label: "Menu Portfolio: tên nhóm (trình đọc màn hình)", pm_soon: "Menu Portfolio: nhãn “Sắp có”",
  pm_games: "Menu Portfolio: mục Video Games", pm_games_hint: "Menu Portfolio: dòng nhỏ dưới Video Games",
  pm_3d: "Menu Portfolio: mục 3D Artwork", pm_3d_hint: "Menu Portfolio: dòng nhỏ dưới 3D Artwork",
  pm_2d: "Menu Portfolio: mục 2D Artwork", pm_2d_hint: "Menu Portfolio: dòng nhỏ dưới 2D Artwork",
  pm_graphic: "Menu Portfolio: mục Graphic Design", pm_graphic_hint: "Menu Portfolio: dòng nhỏ dưới Graphic Design",
  games_page_title: "Trang Video Games: tên trang (tab trình duyệt)", games_back: "Trang Video Games: link về trang chủ",
  games_count: "Trang Video Games: số dự án ({n})", games_count_one: "Trang Video Games: số dự án khi chỉ có 1 ({n})",
  games_view: "Trang Video Games: chữ “Xem dự án” trên thẻ", games_empty: "Trang Video Games: khi chưa có dự án nào",
  games_intro: "Trang Video Games: câu giới thiệu trong banner đầu trang (để trống = ẩn)",
  a2_page_title: "Trang 2D Artwork: tiêu đề lớn trong banner + tên tab", a2_back: "Trang 2D Artwork: link về trang chủ",
  a2_jump: "Trang 2D Artwork: tên thanh tab (cho trình đọc màn hình)", a2_step: "Trang 2D Artwork: nhãn nhỏ trên tên bước ({n} = số thứ tự)",
  a2_count: "Trang 2D Artwork: số tranh trong banner ({n})", a2_count_one: "Trang 2D Artwork: số tranh khi chỉ có 1 ({n})",
  a2_tabs: "Trang 2D Artwork: số tab trong banner ({n})",
  a2_projects: "Số dự án ({n}) — banner + tab trang 2D + thẻ Other 2D Projects trang chủ", a2_project_one: "Số dự án khi chỉ có 1 ({n})",
  a2_empty: "Trang 2D Artwork: khi chưa có tranh nào",
  a3_page_title: "Trang 3D Artwork: tiêu đề lớn trong banner + tên tab", a3_back: "Trang 3D Artwork: link về trang chủ",
  a3_jump: "Trang 3D Artwork: tên thanh chọn dự án (cho trình đọc màn hình)", a3_step: "Trang 3D Artwork: nhãn nhỏ trên tên bước ({n} = số thứ tự)",
  a3_count: "Trang 3D Artwork: số dự án trong banner ({n})", a3_count_one: "Trang 3D Artwork: số dự án khi chỉ có 1 ({n})",
  a3_videos: "Trang 3D Artwork: số video ({n}) — banner + dòng đếm của dự án", a3_video_one: "Trang 3D Artwork: số video khi chỉ có 1 ({n})",
  a3_steps: "Trang 3D Artwork: số bước của dự án ({n})", a3_step_one: "Trang 3D Artwork: số bước khi chỉ có 1 ({n})",
  a3_final: "Trang 3D Artwork: nhãn phần thành phẩm (video + ảnh cuối)", a3_process: "Trang 3D Artwork: nhãn phần quá trình thực hiện (các bước)",
  a3_tools: "Trang 3D Artwork: nhãn trước danh sách công cụ", a3_empty: "Trang 3D Artwork: khi chưa có dự án nào",
  gd_page_title: "Trang Graphic Design: tiêu đề lớn trong banner + tên tab (+ nhãn nhỏ “GRAPHIC DESIGN 01 / 05” ở trang chi tiết)",
  gd_back: "Trang Graphic Design: link về trang chủ (trang danh sách)", gd_back_list: "Trang Graphic Design: link từ trang chi tiết về danh sách",
  gd_count: "Trang Graphic Design: số dự án trong banner ({n})", gd_count_one: "Trang Graphic Design: số dự án khi chỉ có 1 ({n})",
  gd_empty: "Trang Graphic Design: khi chưa có dự án nào", gd_not_found: "Trang Graphic Design: link ?id= sai (dự án không tồn tại)",
  gd_step: "Trang Graphic Design: nhãn nhỏ trên tên bước ({n} = số thứ tự)", gd_steps: "Trang Graphic Design: số bước trong banner chi tiết ({n})",
  gd_step_one: "Trang Graphic Design: số bước khi chỉ có 1 ({n})", gd_process: "Trang Graphic Design: nhãn phần quá trình thực hiện (các bước)",
  gd_tools: "Trang Graphic Design: nhãn trước danh sách công cụ", gd_open_images: "Trang Graphic Design: ảnh bìa — mô tả nút xem ảnh to (trình đọc màn hình, {n} = số hình)",
  gd_prev_project: "Trang Graphic Design: nút dự án trước (cuối trang chi tiết)", gd_next_project: "Trang Graphic Design: nút dự án tiếp",
  gd_all_projects: "Trang Graphic Design: nút về danh sách (giữa 2 nút trước / tiếp)",
};

// ══════════════ helpers ══════════════
const $ = id => document.getElementById(id);
// "(H)" after a field label = its value is also shown on the home page
const HM = ` <span class="hm" title="Hiện ở trang chủ (Home)">(H)</span>`;
// UI text keys shown on the home page (topbar, sections, footer); the rest belong to the sub-pages
const isHomeKey = k => !/^(pd|games|a2|a3|gd)_/.test(k) || k === "a2_projects" || k === "a2_project_one";
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clone = o => JSON.parse(JSON.stringify(o ?? null));
const slug = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
const L = v => v && typeof v === "object" && !Array.isArray(v) ? { en: v.en ?? "", vi: v.vi ?? "" } : { en: v ?? "", vi: "" };
const parseYT = v => {
  v = String(v || "").trim();
  const m = v.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/);
  return m ? m[1] : /^[\w-]{11}$/.test(v) ? v : "";
};
// 3D Artwork videos: same rules as the site (assets/js/art3d/model.js → youtubeId): an id, or a watch / youtu.be / shorts /
// embed / live link on a YouTube host → { id, shorts } (id "" = invalid)
function ytInfo(value) {
  const s = String(value || "").trim(), none = { id: "", shorts: false };
  if (/^[\w-]{11}$/.test(s)) return { id: s, shorts: false };
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    if (!/(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)$/i.test(u.hostname)) return none;
    const parts = u.pathname.split("/").filter(Boolean);
    const id = u.hostname.endsWith("youtu.be") ? parts[0]
      : u.searchParams.get("v") || (["shorts", "embed", "live", "v"].includes(parts[0]) ? parts[1] : "");
    return /^[\w-]{11}$/.test(id || "") ? { id, shorts: parts[0] === "shorts" } : none;
  } catch { return none; }
}
// {en:[…], vi:[…]} → [{en, vi}] rows ;  rows → {en:[…], vi:[…]}
function pairs(v) {
  const arr = x => Array.isArray(x) ? x : x ? [x] : [];
  const obj = v && typeof v === "object" && !Array.isArray(v);
  const en = obj ? arr(v.en) : arr(v), vi = obj ? arr(v.vi) : [];
  return Array.from({ length: Math.max(en.length, vi.length) }, (_, i) => ({ en: en[i] || "", vi: vi[i] || "" }));
}
function unpairs(rows) {
  const r = rows.filter(b => (b.en || "").trim() || (b.vi || "").trim());
  const col = k => {
    const c = r.map(b => (b[k] || "").trim());
    while (c.length && !c[c.length - 1]) c.pop();         // no padding rows at the end
    return c;
  };
  return { en: col("en"), vi: col("vi") };
}
const getPath = (o, p) => p.split(".").reduce((x, k) => x?.[k], o);
function setPath(o, p, v) {
  const ks = p.split("."), last = ks.pop();
  const t = ks.reduce((x, k) => (x[k] ??= {}), o);
  t[last] = v;
}

let toastT;
function toast(msg, kind = "ok") {
  const el = $("toast"); el.textContent = msg; el.className = `toast show ${kind}`;
  clearTimeout(toastT); toastT = setTimeout(() => { el.className = "toast"; }, kind === "err" ? 5000 : 2400);
}
async function api(method, url, body) {
  const r = await fetch(url, { method, headers: { "X-Studio": "1", "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
  return j;
}
async function postFile(url, blob) {
  const r = await fetch(url, { method: "POST", headers: { "X-Studio": "1" }, body: blob });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "Upload thất bại");
  return j;
}
const upload = (target, name, blob) => postFile(`/api/upload?target=${target}&name=${encodeURIComponent(name)}`, blob);
// resize + re-encode in the browser → JPG
async function compress(file, max = 2400, quality = 0.88) {
  if (file.type === "image/gif") return file;
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  const g = c.getContext("2d"); g.fillStyle = "#000"; g.fillRect(0, 0, c.width, c.height);
  g.drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise(r => c.toBlob(r, "image/jpeg", quality));
}
function pickFiles(accept = "image/*", multiple = false) {
  return new Promise(resolve => {
    const i = Object.assign(document.createElement("input"), { type: "file", accept, multiple });
    i.onchange = () => resolve([...i.files]);
    i.click();
  });
}
function confirmDlg(title, html, yes = "Xoá", kind = "danger") {
  return new Promise(resolve => {
    $("dlgT").textContent = title; $("dlgB").innerHTML = html; $("dlgYes").textContent = yes; $("dlgYes").className = `btn ${kind}`;
    $("dlg").hidden = false; $("dlgNo").focus();
    const done = v => { $("dlg").hidden = true; $("dlgYes").onclick = $("dlgNo").onclick = null; resolve(v); };
    $("dlgYes").onclick = () => done(true); $("dlgNo").onclick = () => done(false);
  });
}

// ══════════════ state ══════════════
const S = { config: {}, projects: null, art2d: {}, art3d: {}, graphic: {} };
let CFG = null;   // shared draft for the 3 config views: { d, saved }
let ED = null;    // collection item editor: { kind, id, orig, d, folder, saved }
let UIF = null;   // UI frames: [{ name, d, saved, w, h, bust, zoom }] (loaded on first visit of #/ui)
let VIEW = "";

async function load() {
  const r = await fetch("/api/state");
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  Object.assign(S, await r.json());
  $("srv").classList.remove("off");
}

// ---- config draft <-> web-config.json ----
function cfgToDraft(c) {
  const d = clone(c) || {};
  d.site ??= {};
  d.site.pageTitle = L(d.site.pageTitle);
  d.site.defaultLang ||= "en";
  d.site.languages ||= { en: "English", vi: "Tiếng Việt" };
  d.intro ??= {}; d.intro.quote = L(d.intro.quote);
  d.background ??= {};
  d.profile ??= {}; d.profile.role = L(d.profile.role); d.profile.summary = pairs(d.profile.summary);
  d.social = Object.fromEntries(SOCIALS.map(([k]) => [k, d.social?.[k] || ""]));
  d.experience = (d.experience || []).map(x => ({ ...x, role: L(x.role), company: x.company ?? "", period: x.period ?? "", points: pairs(x.points) }));
  d.links ??= {}; ["otherProjects", "artworks", "about"].forEach(k => { d.links[k] ??= ""; });
  d.i18n ??= {}; d.i18n.en ??= {}; d.i18n.vi ??= {};
  return d;
}
function draftToCfg(d) {
  const c = clone(d);
  c.profile.summary = unpairs(d.profile.summary);
  c.experience = d.experience.map(x => ({ ...x, points: unpairs(x.points) }));
  return c;
}
const cfgSnap = () => JSON.stringify(draftToCfg(CFG.d));
const cfgDirty = () => CFG && cfgSnap() !== CFG.saved;
function resetCfg() { CFG = { d: cfgToDraft(S.config) }; CFG.saved = cfgSnap(); }

// ---- collection item draft <-> data.json ----
const ID_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;   // folder names + progression step ids (same rule as server.mjs)
const isObj = v => !!v && typeof v === "object" && !Array.isArray(v);
// fields of a nested object the Studio doesn't edit (kept as-is on save)
const rest = (o, known) => (isObj(o) ? Object.fromEntries(Object.entries(o).filter(([k]) => !known.includes(k))) : {});
const blankL = () => ({ en: "", vi: "" });
// detail-page lists (project data.json → roles / progression / challenges / learned); "_" keys are Studio-only
const roleDraft = (r = {}) => ({ title: L(r.title), text: pairs(r.text), _x: rest(r, ["title", "text"]) });
const stepImgDraft = im => (isObj(im) ? { src: String(im.src || ""), caption: L(im.caption), _x: rest(im, ["src", "caption"]) } : { src: String(im || ""), caption: blankL(), _x: {} });
const stepDraft = (p = {}) => ({
  id: String(p.id || ""), name: L(p.name), text: pairs(p.text), images: (Array.isArray(p.images) ? p.images : []).map(stepImgDraft).filter(im => im.src),
  _x: rest(p, ["id", "name", "text", "images"]),
  _folder: p.id && ID_RE.test(p.id) ? p.id : null,   // folder of its images on disk (renamed on save when the id changes)
  _auto: !p.id,                                      // id still follows the EN name
  _files: null,                                      // file names found by the last folder scan (null = not scanned)
});
const challengeDraft = (c = {}) => ({ problem: L(c.problem), solution: L(c.solution), _x: rest(c, ["problem", "solution"]) });
const learnedDraft = x => (isObj(x) && ("title" in x || "text" in x)
  ? { title: L(x.title), text: L(x.text), _x: rest(x, ["title", "text"]) }
  : { title: blankL(), text: L(x), _x: {} });
function itemToDraft(kind, o = {}) {
  const arr = v => (Array.isArray(v) ? v : []);
  return {
    title: o.title || "",
    tagline: L(o.tagline),
    tags: (o.tags || []).map(t => typeof t === "object" ? (t.en || t.vi || "") : String(t)),
    video: { youtube: o.video?.youtube || "", orientation: o.video?.orientation === "portrait" ? "portrait" : "landscape" },
    description: kind === "projects" ? pairs(o.description) : L(o.description),
    responsibilities: pairs(o.responsibilities),
    exploreUrl: o.exploreUrl || "",
    ...(kind === "projects" ? {
      stores: Object.fromEntries(STORES.map(([k]) => [k, typeof o.stores?.[k] === "string" ? o.stores[k] : ""])),
      featured: o.featured !== false, thumbnail: typeof o.thumbnail === "string" ? o.thumbnail : "",
      logo: typeof o.logo === "string" ? o.logo : "", cover: typeof o.cover === "string" ? o.cover : "",
      studio: L(o.studio), period: L(o.period), genre: L(o.genre),
      downloads: String(o.downloads ?? ""), members: String(o.members ?? ""),
      roles: arr(o.roles).map(roleDraft), progression: arr(o.progression).map(stepDraft),
      challenges: arr(o.challenges).map(challengeDraft), learned: arr(o.learned).map(learnedDraft),
    } : {}),
  };
}
// draft → data.json values (undefined = key left out). Detail-page / 2D fields: plain string when there is no (different)
// Vietnamese text, arrays only when filled; unknown keys of an item (_x) are written back after the known ones.
const outL = x => { const en = x.en.trim(), vi = x.vi.trim(); return !en && !vi ? undefined : vi && vi !== en ? { en, vi } : en; };
const outMany = a => (a.length ? a : undefined);
const outObj = (o, x) => { const r = {}; Object.entries(o).forEach(([k, v]) => { if (v !== undefined) r[k] = v; }); return { ...r, ...x }; };
// image of a list: "file.jpg", or { src, caption } when it has a caption (or unknown keys)
const imgOut = im => { const c = outL(im.caption); return c || Object.keys(im._x).length ? outObj({ src: im.src, caption: c }, im._x) : im.src; };
// existing key order first (unknown fields kept as-is), then new fields in the order of `known`
function mergeKeys(orig, known) {
  const out = {};
  [...Object.keys(orig), ...Object.keys(known)].forEach(k => {
    if (k in out) return;
    const v = k in known ? known[k] : orig[k];
    if (v !== undefined) out[k] = v;
  });
  return out;
}
function draftToItem(kind, d, orig = {}) {
  const s = v => (String(v ?? "").trim() || undefined);
  const l = x => (x.en.trim() || x.vi.trim() ? { en: x.en.trim(), vi: x.vi.trim() } : undefined);
  const list = rows => { const u = unpairs(rows); return u.en.length || u.vi.length ? u : undefined; };
  const lt = outL, many = outMany, obj = outObj;
  const lines = rows => { const u = unpairs(rows); return !u.en.length && !u.vi.length ? undefined : u.vi.length ? u : u.en; };
  const known = kind === "projects" ? {
    title: d.title.trim(), tagline: l(d.tagline), tags: d.tags.length ? d.tags : undefined,
    video: s(d.video.youtube) ? { youtube: d.video.youtube.trim(), orientation: d.video.orientation } : undefined,
    description: list(d.description), responsibilities: list(d.responsibilities), exploreUrl: d.exploreUrl.trim(),
    stores: (st => (Object.keys(st).length ? st : undefined))(Object.fromEntries(STORES.map(([k]) => [k, s(d.stores[k])]).filter(([, v]) => v))),
    featured: d.featured ? undefined : false, thumbnail: s(d.thumbnail),   // featured: only "false" is written
    logo: s(d.logo), cover: s(d.cover), studio: lt(d.studio), period: lt(d.period), downloads: s(d.downloads),
    members: (m => (m && /^\d+$/.test(m) ? Number(m) : m || undefined))(d.members.trim()), genre: lt(d.genre),
    roles: many(d.roles.map(r => obj({ title: lt(r.title), text: lines(r.text) }, r._x)).filter(r => Object.keys(r).length)),
    progression: many(d.progression.map(p => obj({
      id: p.id.trim(), name: lt(p.name), text: lines(p.text),
      images: many(p.images.map(imgOut)),
    }, p._x))),
    challenges: many(d.challenges.map(c => obj({ problem: lt(c.problem), solution: lt(c.solution) }, c._x)).filter(c => Object.keys(c).length)),
    learned: many(d.learned.map(x => { const t = lt(x.title), b = lt(x.text); return t || Object.keys(x._x).length ? obj({ title: t, text: b }, x._x) : b; }).filter(Boolean)),
  } : {
    title: s(d.title), tags: d.tags.length ? d.tags : undefined,
    video: s(d.video.youtube) ? { youtube: d.video.youtube.trim(), orientation: d.video.orientation } : undefined,
    description: l(d.description), exploreUrl: d.exploreUrl.trim(),
  };
  return mergeKeys(orig, known);
}
const edSnap = () => JSON.stringify([draftToItem(ED.kind, ED.d, ED.orig), ED.folder]);
const edDirty = () => ED && edSnap() !== ED.saved;

// ---- UI frames (assets/ui/<name>/frame.json) ----
const UI_LABELS = { "description-frame": "Khung mô tả (Description)", "explore-button": "Nút Explore", "text-frame": "Khung câu chào (Quote)" };
const EDGE_OPTS = [["stretch", "Kéo giãn (Sliced)"], ["repeat", "Lặp (Tiled)"], ["round", "Lặp vừa khít (Round)"], ["space", "Lặp có khoảng cách (Space)"]];
const SIDE_LBL = [["left", "Trái"], ["top", "Trên"], ["right", "Phải"], ["bottom", "Dưới"]];
let frameLib = null;   // assets/js/ui-frames.js (same CSS as the site), imported on demand
function uiToDraft(c = {}) {
  const n = v => (Number.isFinite(+v) && +v >= 0 ? +v : 0);
  const sides = o => Object.fromEntries(SIDE_LBL.map(([k]) => [k, n(o?.[k])]));
  return { ...clone(c), image: c.image || "frame.png", slice: sides(c.slice), scale: +c.scale > 0 ? +c.scale : 1,
    edges: EDGE_OPTS.some(([k]) => k === c.edges) ? c.edges : "stretch", fill: c.fill !== false, padding: sides(c.padding), version: c.version ?? 0 };
}
const uiSnap = f => JSON.stringify(f.d);
const uiDirty = () => !!UIF && UIF.some(f => uiSnap(f) !== f.saved);
function resetUI() { UIF?.forEach(f => { f.d = JSON.parse(f.saved); }); }
const uiImg = f => "/" + frameLib.frameImageUrl(f.name, { ...f.d, version: f.bust });
const imgSize = src => new Promise(resolve => {
  const im = new Image();
  im.onload = () => resolve([im.naturalWidth, im.naturalHeight]); im.onerror = () => resolve([0, 0]);
  im.src = src;
});
async function loadUI() {
  const [list, lib] = await Promise.all([api("GET", "/api/ui"), frameLib || import("/assets/js/ui-frames.js")]);
  frameLib = lib;
  UIF = list.map(({ name, config }) => { const d = uiToDraft(config); return { name, d, saved: JSON.stringify(d), bust: Date.now(), zoom: "fit" }; });
  await Promise.all(UIF.map(async f => { [f.w, f.h] = await imgSize(uiImg(f)); }));
}

const anyDirty = () => cfgDirty() || edDirty() || anyPgDirty() || uiDirty();
function updateDirty() {
  const d = PAGES[VIEW] ? pgDirty(PG()) : VIEW === "ui" ? uiDirty() : ED ? edDirty() : cfgDirty();
  const el = $("dirtyFlag"); if (el) el.hidden = !d;
  const b = $("saveBtn"); if (b) b.disabled = !d;
  gitSync();
}

// ══════════════ field builders (bound to the current draft) ══════════════
let draftOf = () => CFG.d;
const val = p => getPath(draftOf(), p);

function inp(path, label, o = {}) {
  return `<div class="f">${label ? `<label>${label}${o.key ? ` <code>${o.key}</code>` : ""}</label>` : ""}
    <input type="${o.type || "text"}" data-path="${path}" value="${esc(val(path))}"${o.ph ? ` placeholder="${esc(o.ph)}"` : ""}>
    ${o.hint ? `<span class="hint">${o.hint}</span>` : ""}</div>`;
}
function bi(path, label, o = {}) {
  const v = val(path) || { en: "", vi: "" };
  const tag = lg => o.area
    ? `<textarea data-path="${path}.${lg}" rows="${o.rows || 2}">${esc(v[lg])}</textarea>`
    : `<input type="text" data-path="${path}.${lg}" value="${esc(v[lg])}">`;
  return `<div class="f">${label ? `<label>${label}${o.key ? ` <code>${o.key}</code>` : ""}</label>` : ""}
    <div class="bi"><div data-l="EN">${tag("en")}</div><div data-l="VI">${tag("vi")}</div></div>
    ${o.hint ? `<span class="hint">${o.hint}</span>` : ""}</div>`;
}
function bullets(path, label, note = "mỗi dòng là một gạch đầu dòng") {
  const rows = val(path) || [];
  return `<div class="f"><span class="lbl">${label} <code>EN | VI — ${note}</code></span>
    <div class="bullets">${rows.map((b, j) => `<div class="bullet">
      <input type="text" data-path="${path}.${j}.en" value="${esc(b.en)}" placeholder="EN">
      <input type="text" data-path="${path}.${j}.vi" value="${esc(b.vi)}" placeholder="VI">
      <button class="icon-btn del" type="button" data-act="rmItem" data-path="${path}" data-i="${j}" title="Xoá dòng">✕</button></div>`).join("")}</div>
    <button class="btn ghost sm add" type="button" data-act="addRow" data-path="${path}">+ Dòng</button></div>`;
}
function chips(path, label, hint) {
  const tags = val(path) || [];
  return `<div class="f"><span class="lbl">${label}</span>
    <div class="chips" data-chips="${path}">${tags.map((t, i) =>
      `<span class="chip" draggable="true" data-i="${i}">${esc(t)}<button type="button" data-act="rmItem" data-path="${path}" data-i="${i}" aria-label="Xoá">✕</button></span>`).join("")}
      <input type="text" data-chip-input="${path}" placeholder="Gõ rồi Enter để thêm…"></div>
    ${hint ? `<span class="hint">${hint}</span>` : ""}</div>`;
}
function seg(path, opts) {
  const v = val(path);
  return `<div class="seg">${opts.map(([k, t]) => `<button type="button" data-act="seg" data-path="${path}" data-v="${k}" class="${v === k ? "on" : ""}">${t}</button>`).join("")}</div>`;
}
function itemHead(listPath, i, n, label, rmAct = "rmItem", tag = "div", [lo, hi] = [0, n - 1]) {
  return `<${tag} class="item-h"><b>${label}</b>
    <button class="icon-btn" type="button" data-act="mvItem" data-path="${listPath}" data-i="${i}" data-d="-1" ${i > lo ? "" : "disabled"} title="Lên">↑</button>
    <button class="icon-btn" type="button" data-act="mvItem" data-path="${listPath}" data-i="${i}" data-d="1" ${i < hi ? "" : "disabled"} title="Xuống">↓</button>
    <button class="icon-btn del" type="button" data-act="${rmAct}" data-path="${listPath}" data-i="${i}" title="Xoá">✕</button></${tag}>`;
}
const sec = (title, body, note = "") => `<section class="sec"><h2>${title}${note ? `<small>${note}</small>` : ""}</h2><div class="sec-b">${body}</div></section>`;
const imgURL = p => (p ? `/${p.replace(/^\//, "")}?v=${Date.now()}` : "");
function imgPick(path, label, { name, max = 2400, square = false, hint = "" }) {
  const p = val(path);
  return `<div class="f"><span class="lbl">${label}</span><div class="imgpick">
    <div class="ph-img${square ? " sq" : ""}" style="${p ? `background-image:url('${esc(imgURL(p))}')` : ""}">${p ? "" : "chưa có ảnh"}</div>
    <div class="acts"><button class="btn ghost sm" type="button" data-act="pickImg" data-path="${path}" data-name="${name}" data-max="${max}">Chọn ảnh…</button>
    ${p ? `<button class="btn ghost sm" type="button" data-act="clearImg" data-path="${path}">Bỏ ảnh</button>` : ""}
    <span class="hint">${p ? `<code>${esc(p)}</code><br>` : ""}${hint}</span></div></div></div>`;
}
function saveBar(title, sub, extra = "") {
  return `<div class="ph"><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ""}</div></div>
    <div class="savebar"><div class="acts" style="display:flex;gap:8px;align-items:center">${extra}</div>
    <div style="display:flex;gap:10px;align-items:center"><span class="dirty" id="dirtyFlag" hidden>● Chưa lưu</span>
    <button class="btn ghost" type="button" data-act="revert">Hoàn tác</button>
    <button class="btn pri" id="saveBtn" type="button" data-act="save" disabled>Lưu</button></div></div>`;
}

// ══════════════ views ══════════════
function viewSettings() {
  draftOf = () => CFG.d;
  return saveBar("Intro & Hồ sơ", "Nội dung chung lưu trong <code>web-config.json</code>.") +
    sec(`Intro${HM}`, `
      <div class="grid2">${inp("intro.brand", "Dòng chữ nhỏ phía trên", { key: "intro.brand" })}${inp("intro.title", "Tiêu đề lớn", { key: "intro.title" })}</div>
      ${bi("intro.quote", "Câu chào dưới tiêu đề", { area: true, key: "intro.quote" })}`) +
    sec(`Hồ sơ (About me)${HM}`, `
      ${imgPick("profile.photo", "Ảnh chân dung", { name: "profile.jpg", max: 1400, square: true, hint: "Để trống thì hiện khung PHOTO." })}
      <div class="grid3">${inp("profile.name", "Họ tên (topbar + About)")}${inp("profile.email", "Email (nhận mail từ form)", { type: "email" })}${inp("profile.phone", "Số điện thoại")}</div>
      ${bi("profile.role", "Chức danh trong khung profile")}
      ${bullets("profile.summary", "Nội dung khung profile")}`) +
    sec(`Mạng xã hội${HM}`, SOCIALS.map(([k, name, ph]) => `<div class="social${CFG.d.social[k] ? "" : " empty"}">
        <span class="ico"><img src="../assets/icons/${k}.svg" alt=""></span><b>${name}</b>
        <input type="url" data-path="social.${k}" value="${esc(CFG.d.social[k])}" placeholder="${ph}"></div>`).join(""), "để trống = không hiện trên trang") +
    sec(`Liên kết nút Explore${HM}`, `<div class="grid3">
      ${inp("links.otherProjects", "Khối “Other game projects”", { ph: "games.html", hint: "Để trống hoặc # = trang Video Games." })}${inp("links.artworks", "Khối “Other 2D Projects”", { ph: "art2d.html", hint: "Để trống hoặc # = tab thứ 2 của trang 2D Artwork (thẻ đầu tiên của khối)." })}${inp("links.about", "Section About", { ph: "#" })}</div>
      <span class="hint">Nút Explore của từng dự án chỉnh trong trang của dự án. Explore của 3D Blender / Personal Artworks tự mở đúng dự án / mục trên trang 3D / 2D Artwork.</span>`) +
    sec("Khác", `<div class="grid2">
      ${inp("background.rainWord", `Chữ của hiệu ứng mưa chữ${HM}`, { key: "background.rainWord" })}
      <div class="f"><label>Ngôn ngữ mặc định</label>${seg("site.defaultLang", [["en", "English"], ["vi", "Tiếng Việt"]])}</div></div>
      ${bi("site.pageTitle", `Tiêu đề tab trình duyệt${HM}`)}`);
}

function viewExperience() {
  draftOf = () => CFG.d;
  const list = CFG.d.experience;
  return saveBar(`Kinh nghiệm làm việc${HM}`, "Timeline trong section About me.") +
    `<div style="display:grid;gap:12px">${list.map((x, i) => `<div class="item">${itemHead("experience", i, list.length, `#${i + 1} · ${esc(x.role.en || x.role.vi || "Vị trí mới")}`)}
      ${bi(`experience.${i}.role`, "Vị trí")}
      <div class="grid2">${inp(`experience.${i}.company`, "Công ty")}${inp(`experience.${i}.period`, "Thời gian", { ph: "4/2024 - 10/2026" })}</div>
      ${bullets(`experience.${i}.points`, "Mô tả")}</div>`).join("") || `<div class="empty">Chưa có mục nào.</div>`}</div>
    <button class="btn ghost" style="margin-top:12px" type="button" data-act="addExp">+ Thêm kinh nghiệm</button>`;
}

function viewTexts() {
  draftOf = () => CFG.d;
  const keys = [...new Set([...Object.keys(CFG.d.i18n.en), ...Object.keys(CFG.d.i18n.vi)])];
  return saveBar("Văn bản giao diện", "Các chữ cố định trên trang (menu, tiêu đề section, nhãn form…). Có thể dùng <code>&lt;br&gt;</code> để xuống dòng.",
    `<input type="text" id="kFilter" placeholder="Lọc…" style="width:220px">`) +
    `<div class="sec"><div class="sec-b ktable" id="ktable">${keys.map(k => `<div class="krow" data-key="${esc(k)}">
      <div class="k"><code>${esc(k)}</code><span>${esc(KEY_HINTS[k] || "")}${isHomeKey(k) ? HM : ""}</span></div>
      <textarea rows="1" data-path="i18n.en.${k}" placeholder="EN">${esc(CFG.d.i18n.en[k] ?? "")}</textarea>
      <textarea rows="1" data-path="i18n.vi.${k}" placeholder="VI">${esc(CFG.d.i18n.vi[k] ?? "")}</textarea></div>`).join("")}</div></div>`;
}

// ---- collections ----
const ytThumb = id => id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : "";
function viewCollection(kind) {
  const C = S[kind], K = KINDS[kind];
  const ids = C.order.filter(id => C.items[id] || C.broken[id]);
  const orphans = [...Object.keys(C.items), ...Object.keys(C.broken)].filter(id => !C.order.includes(id));
  const row = (id, i, listed) => {
    const p = C.items[id], broken = C.broken[id];
    const yt = p?.video?.youtube;
    const thumb = kind === "projects" && typeof p?.thumbnail === "string" && p.thumbnail.trim()
      ? (/^https?:\/\//.test(p.thumbnail) ? p.thumbnail : `/Database/${K.dir}/${id}/${p.thumbnail.trim()}`) : ytThumb(yt);
    return `<li class="prow${broken ? " broken" : ""}" data-id="${id}"${listed ? ' draggable="true"' : ""}>
      ${listed ? `<span class="handle" title="Kéo để sắp xếp">⠿</span><span class="num">${String(i + 1).padStart(2, "0")}</span>` : "<span></span><span></span>"}
      <div class="thumb">${thumb ? `<img src="${esc(thumb)}" alt="">` : "—"}</div>
      <div class="t"><b>${esc(broken ? id : p.title || "(không tiêu đề)")}</b><span>${esc(broken || `Database/${K.dir}/${id}`)}</span></div>
      <div class="badges">${kind === "projects" && p?.featured === false ? `<span class="bdg y" title="featured: false — chỉ hiện ở trang Video Games">Ẩn ở trang chủ</span>` : ""}
        ${yt ? `<span class="bdg c">▶ YouTube${p.video.orientation === "portrait" ? " · dọc" : ""}</span>` : `<span class="bdg r">chưa có video</span>`}
        ${(p?.tags || []).length ? `<span class="bdg">${p.tags.length} tag</span>` : ""}
        ${(st => st.length ? `<span class="bdg g" title="Link tải game">⤓ ${st.join(" · ")}</span>` : "")(kind === "projects" ? STORES.filter(([k]) => String(p?.stores?.[k] ?? "").trim()).map(([, , short]) => short) : [])}
        ${kind === "projects" && p?.progression?.length ? `<span class="bdg" title="Trang chi tiết: quá trình sản xuất">◇ ${p.progression.length} bước</span>` : ""}</div>
      <div class="row-acts">
        ${listed ? "" : `<button class="btn ghost sm" type="button" data-act="addIndex" data-id="${id}">Thêm vào danh sách</button>`}
        ${broken ? "" : `<a class="btn ghost sm" href="#/${kind}/edit/${id}">Sửa</a>`}
        <button class="icon-btn del" type="button" data-act="delItem" data-id="${id}" title="Xoá">🗑</button></div></li>`;
  };
  return `<div class="ph"><div><h1>${K.title} <span style="color:var(--dim);font-size:.6em">(${ids.length})</span></h1>
      <p>Kéo <b>⠿</b> để đổi thứ tự hiển thị — thứ tự được lưu ngay vào <code>Database/${K.dir}/index.json</code>.${kind === "projects"
        ? `<br>Tất cả dự án hiện ở trang <b>Video Games</b> (<code>games.html</code>); dự án “Ẩn ở trang chủ” không hiện trong Featured Projects.` : ""}</p></div>
      <div class="acts"><a class="btn pri" href="#/${kind}/new">+ Thêm ${K.noun}</a></div></div>
    ${ids.length ? `<ul class="plist" id="plist">${ids.map((id, i) => row(id, i, true)).join("")}</ul>` : `<div class="empty">Chưa có ${K.noun} nào.</div>`}
    ${orphans.length ? `<h3 style="margin:24px 0 10px;color:var(--gold);font-size:.9rem">Thư mục chưa có trong index.json (không hiện trên trang)</h3><ul class="plist">${orphans.map(id => row(id, -1, false)).join("")}</ul>` : ""}`;
}

function viewItemEditor() {
  draftOf = () => ED.d;
  const kind = ED.kind, K = KINDS[kind], d = ED.d;
  const yt = parseYT(d.video.youtube);
  const common = `
    ${chips("tags", `Tag vai trò${HM}`, "Kéo để đổi thứ tự.")}
    <div class="f"><span class="lbl">Video YouTube${HM}</span><div class="yt">
      <div style="display:grid;gap:8px"><input type="text" data-path="video.youtube" data-yt value="${esc(d.video.youtube)}" placeholder="Dán link YouTube / Shorts hoặc ID">
        <div style="display:flex;gap:10px;align-items:center">${seg("video.orientation", [["landscape", "Ngang 16:9"], ["portrait", "Dọc 9:16 (Shorts)"]])}
        <span class="hint">Video dọc sẽ tự đổi bố cục.</span></div></div>
      <div class="ytp" id="ytp" style="${yt ? `background-image:url('${ytThumb(yt)}')` : ""}">${yt ? "" : "chưa có video"}</div></div></div>`;
  const fields = kind === "projects" ? `
      ${inp("title", `Tên dự án *${HM}`)}
      ${bi("tagline", `Dòng mô tả ngắn dưới tên${HM}`)}
      ${common}
      ${bullets("description", `Description${HM}`)}
      ${bullets("responsibilities", `Responsibilities${HM}`)}` : `
      ${inp("title", "Tiêu đề (không bắt buộc)", { hint: "Để trống như bản thiết kế." })}
      ${common}
      ${bi("description", "Đoạn mô tả dưới video", { area: true, rows: 3 })}`;
  const detailLink = kind === "projects" && ED.id
    ? `<div class="acts"><a class="btn ghost sm" href="/project.html?id=${encodeURIComponent(ED.id)}" target="_blank" rel="noopener" title="Mở trang chi tiết đã lưu">Xem trang chi tiết ↗</a></div>` : "";
  return `<div class="ph"><div><h1>${ED.id ? "Sửa" : "Thêm"} ${K.noun}</h1><p><a class="lnk" href="#/${kind}">← ${K.title}</a></p></div>${detailLink}</div>
    <div class="savebar"><div></div><div style="display:flex;gap:10px;align-items:center"><span class="dirty" id="dirtyFlag" hidden>● Chưa lưu</span>
      <a class="btn ghost" href="#/${kind}">Huỷ</a><button class="btn pri" id="saveBtn" type="button" data-act="save" ${ED.id ? "disabled" : ""}>Lưu</button></div></div>
    ${sec("Nội dung", fields)}
    ${kind === "projects" ? sec("Trang chủ &amp; trang Video Games", `<div class="grid2" style="align-items:start">
      <div class="f"><span class="lbl">Trang chủ</span>
        <label class="sl-chk"><input type="checkbox" data-path="featured"${d.featured ? " checked" : ""}> Hiện ở trang chủ (Featured)${HM}</label>
        <span class="hint">Bỏ chọn thì dự án không hiện ở mục Featured Projects trang chủ (ghi <code>"featured": false</code>) — vẫn hiện ở trang Video Games.</span></div>
      ${projImg("thumbnail", "Ảnh thẻ (thumbnail)", { hint: "Lưu thành <code>images/thumbnail.jpg</code>. Dùng cho thẻ ở trang Video Games; để trống thì dùng ảnh nền header / ảnh YouTube." })}</div>`) : ""}
    ${kind === "projects" ? sec(`Link tải game${HM}`, `<div class="grid3" style="align-items:start">${STORES.map(([k, label, , ph, hint]) => `<div class="f"><label>${label}</label>
        <input type="url" data-path="stores.${k}" data-store value="${esc(d.stores[k])}" placeholder="${esc(ph)}"${badUrl(d.stores[k]) ? ' class="bad"' : ""}>
        ${hint ? `<span class="hint">${hint}</span>` : ""}</div>`).join("")}</div>
      <span class="hint">Để trống thì nút đó bị ẩn trên web. Link phải bắt đầu bằng <code>http://</code> hoặc <code>https://</code>.</span>`, "các nút dưới video") : ""}
    ${kind === "projects" ? detailSections() : ""}
    ${sec("Khác", `<div class="grid2">
      <div class="f"><label>Tên thư mục <code>Database/${K.dir}/…</code></label><input type="text" data-path="@folder" value="${esc(ED.folder)}" placeholder="vd: fashion-star">
        <span class="hint">Chữ thường, số, dấu gạch ngang. Tự tạo từ tên nếu để trống.</span><span class="err" id="folderErr"></span></div>
      ${inp("exploreUrl", `Link nút Explore${HM}`, { ph: "# (để sau)" })}</div>`)}`;
}

// ---- project detail page (project.html?id=<folder>): extra fields of a featured project ----
const RT_HINT = `Hỗ trợ thẻ rich text (<code>&lt;b&gt;</code>, <code>&lt;color=#hex&gt;</code>, <code>&lt;br&gt;</code>… — xem <code>RICHTEXT.md</code>).`;
const PROG_DIR = "images/product-progression";
const projFile = rel => `/Database/Projects/${ED.id}/${rel.split("/").map(encodeURIComponent).join("/")}?v=${ED.bust}`;
const stepFolder = st => st._folder || st.id.trim();
// collapsible section (open state kept across re-renders)
function csec(key, title, body, note = "") {
  const open = ED.open[key] ?? true;
  return `<details class="sec csec" data-sec="${key}"${open ? " open" : ""}><summary><h2>${title}${note ? `<small>${note}</small>` : ""}</h2></summary><div class="sec-b">${body}</div></details>`;
}
// logo / cover: stored in the project folder as images/<key>.<ext>
function projImg(key, label, { hint = "", logo = false } = {}) {
  const p = ED.d[key];
  return `<div class="f"><span class="lbl">${label}</span><div class="imgpick">
    <div class="ph-img${logo ? " sq ck" : ""}${logo ? " contain" : ""}" style="${p && ED.id ? `background-image:url('${esc(projFile(p))}')` : ""}">${p ? "" : "chưa có ảnh"}</div>
    <div class="acts"><button class="btn ghost sm" type="button" data-act="pdImg" data-key="${key}" ${ED.id ? "" : "disabled"}>Chọn ảnh…</button>
    ${p ? `<button class="btn ghost sm" type="button" data-act="clearImg" data-path="${key}">Bỏ ảnh</button>` : ""}
    <span class="hint">${p ? `<code>${esc(p)}</code><br>` : ""}${ED.id ? hint : "Lưu dự án trước rồi mới tải ảnh lên."}</span></div></div></div>`;
}
// id of a list item (progression step / 2D section) = its image folder: slug, unique in the list ("" = filled on save)
function idErr(list, i, what) {
  const id = list[i].id.trim();
  if (!id) return "";
  if (!ID_RE.test(id)) return "Chỉ dùng chữ thường không dấu, số và dấu gạch ngang (a-z 0-9 -)";
  if (list.some((o, j) => j !== i && o.id.trim() === id)) return `Trùng id với ${what} khác`;
  return "";
}
function uniqSlug(list, base, i, fallback) {
  const s = slug(base).slice(0, 60).replace(/-$/, "") || fallback;
  let n = s, k = 2;
  while (list.some((o, j) => j !== i && o.id.trim() === n)) n = `${s}-${k++}`;
  return n;
}
const stepIdErr = i => idErr(ED.d.progression, i, "bước");
const stepSlug = (base, i) => uniqSlug(ED.d.progression, base, i, "step");
function stepPathHTML(i) {
  const st = ED.d.progression[i], f = stepFolder(st), id = st.id.trim();
  return `<code>Database/Projects/${esc(ED.id || ED.folder || "&lt;thư mục dự án&gt;")}/${PROG_DIR}/${f ? esc(f) : "&lt;id&gt;"}/</code>` +
    (st._folder && id && id !== st._folder ? ` <span class="warn">→ đổi tên thành <code>${esc(id)}/</code> khi Lưu</span>` : "");
}
// the images of a progression step (folder images/product-progression/<step id>/ of the project)
function projStepGroup(i) {
  const st = ED.d.progression[i], ed = ED;
  return {
    key: `p${i}`, path: `progression.${i}.images`, list: st.images, label: "Ảnh của bước",
    folder: () => stepFolder(st), files: () => st._files, setFiles: x => { st._files = x; }, used: () => new Set(st.images.map(im => im.src)),
    url: (f, name) => projFile(`${PROG_DIR}/${f}/${name}`), enabled: !!ed.id, off: "Lưu dự án trước<br>rồi mới tải ảnh",
    where: () => stepPathHTML(i), ready: () => stepReady(i), dirName: f => `${PROG_DIR}/${f}/`,
    api: f => `/api/projects/${ed.id}/images?${stepDirQ(f)}`,
    done: f => { st._folder = f; st._auto = false; ed.bust = Date.now(); },
    del: (f, name) => ed.delFiles.push({ folder: f, name }), alive: () => ED === ed,
  };
}

// ══════════════ image lists (project progression steps · 2D Artwork sections / steps) ══════════════
// A "group" = one images list of the draft whose files live in one folder on disk, rebuilt on every render:
//   key · path (data-path of the list) · list · label · folder() → folder name ("" = none yet) · files() → names found by
//   the last folder scan (null = not scanned) · setFiles(set) · used() → names used by every list sharing the folder ·
//   url(folder, name) · enabled / off (drop-zone text when disabled) · where() → folder path HTML · ready() → the folder to
//   write into, or "" after a toast saying why · dirName(folder) · api(folder) → ".../images?dir=…" · done(folder) after an
//   upload / scan · del(folder, name) → delete that file on save · alive() → the draft is still the open one ·
//   badge(im) → extra tile badge · hint → help line under the grid (default IMG_HINT)
const IMG_GROUPS = new Map();
const IMG_HINT = `<span class="hint">Ảnh JPG được nén ≤ 2400px; PNG có nền trong suốt giữ nguyên PNG. Có thể tự chép ảnh vào thư mục trên rồi bấm <b>Quét thư mục</b>
      (thêm ảnh mới theo tên file, đánh dấu ảnh bị thiếu). Kéo ảnh để đổi thứ tự; chú thích để trống thì không hiện.</span>`;
function imgGroup(g) {
  IMG_GROUPS.set(g.key, g);
  const n = g.list.length, folder = g.folder(), files = g.files();
  const tiles = g.list.map((im, j) => {
    const miss = files && !files.has(im.src), p = `${g.path}.${j}`;
    const url = g.enabled && folder ? g.url(folder, im.src) : "";
    return `<div class="pimg${miss ? " miss" : ""}" data-j="${j}">
      <div class="pimg-t" draggable="true" title="Kéo để đổi thứ tự" style="${url && !miss ? `background-image:url('${esc(url)}')` : ""}">
        <span class="n">${String(j + 1).padStart(2, "0")}</span>${miss ? `<span class="bdg r">thiếu file</span>` : g.badge?.(im) || ""}</div>
      <div class="pimg-h"><span class="pimg-name" title="${esc(im.src)}">${esc(im.src)}</span>
        <button class="icon-btn" type="button" data-act="mvItem" data-path="${g.path}" data-i="${j}" data-d="-1" ${j ? "" : "disabled"} title="Lên trước">←</button>
        <button class="icon-btn" type="button" data-act="mvItem" data-path="${g.path}" data-i="${j}" data-d="1" ${j < n - 1 ? "" : "disabled"} title="Ra sau">→</button>
        <button class="icon-btn del" type="button" data-act="rmImg" data-g="${g.key}" data-j="${j}" title="Gỡ ảnh">✕</button></div>
      <input type="text" data-path="${p}.caption.en" value="${esc(im.caption.en)}" placeholder="Chú thích EN (không bắt buộc)">
      <input type="text" data-path="${p}.caption.vi" value="${esc(im.caption.vi)}" placeholder="Chú thích VI">
    </div>`;
  }).join("");
  const missing = files ? g.list.filter(im => !files.has(im.src)).length : 0, dis = g.enabled ? "" : "disabled";
  return `<div class="f"><span class="lbl">${g.label} <code>${n} ảnh${missing ? ` · <span class="bad">${missing} thiếu file</span>` : ""}</code></span>
    <div class="pimg-bar"><button class="btn ghost sm" type="button" data-act="imgUpload" data-g="${g.key}" ${dis}>⤒ Tải ảnh lên</button>
      <button class="btn ghost sm" type="button" data-act="imgScan" data-g="${g.key}" ${dis}>⟳ Quét thư mục</button>
      ${missing ? `<button class="btn danger sm" type="button" data-act="imgDropMissing" data-g="${g.key}">Gỡ ${missing} ảnh thiếu file</button>` : ""}
      <span class="hint" data-img-path="${g.key}">${g.where()}</span></div>
    <div class="pimgs" data-imgs="${g.key}">${tiles}<div class="pimg-drop" data-act="imgUpload" data-g="${g.key}">${g.enabled ? "Kéo thả ảnh vào đây<br>hoặc bấm để chọn" : g.off}</div></div>
    ${g.hint ?? IMG_HINT}</div>`;
}
function detailSections() {
  const d = ED.d, cnt = (a, w) => (a.length ? `${a.length} ${w}` : "trống");
  const roles = d.roles.map((r, i) => `<div class="item">${itemHead("roles", i, d.roles.length, `#${i + 1} · ${esc(r.title.en || r.title.vi || "Vai trò mới")}`)}
      ${bi(`roles.${i}.title`, "Tên vai trò")}
      ${bullets(`roles.${i}.text`, "Công việc")}</div>`).join("");
  const steps = d.progression.map((st, i) => { const err = stepIdErr(i); return `<div class="item step">${itemHead("progression", i, d.progression.length, `#${i + 1} · ${esc(st.name.en || st.name.vi || "Bước mới")}`, "rmStep")}
      <div class="step-top">${bi(`progression.${i}.name`, "Tên bước (hiện trên web)")}
        <div class="f"><label>Id bước <code>= tên thư mục ảnh</code></label>
          <input type="text" data-path="progression.${i}.id" data-step-id="${i}" value="${esc(st.id)}" placeholder="tự tạo từ tên EN"${err ? ' class="bad"' : ""}>
          <span class="err" data-step-err="${i}">${err}</span></div></div>
      ${bullets(`progression.${i}.text`, "Nội dung")}
      ${imgGroup(projStepGroup(i))}</div>`; }).join("");
  const chall = d.challenges.map((c, i) => `<div class="item">${itemHead("challenges", i, d.challenges.length, `#${i + 1} · ${esc((c.problem.en || c.problem.vi || "Thử thách mới").slice(0, 60))}`)}
      ${bi(`challenges.${i}.problem`, "Thử thách (Problem)", { area: true, rows: 2 })}
      ${bi(`challenges.${i}.solution`, "Giải pháp (Solution)", { area: true, rows: 3 })}</div>`).join("");
  const learned = d.learned.map((x, i) => `<div class="item">${itemHead("learned", i, d.learned.length, `#${i + 1} · ${esc((x.title.en || x.title.vi || x.text.en || x.text.vi || "Bài học mới").slice(0, 60))}`)}
      ${bi(`learned.${i}.title`, "Tiêu đề (không bắt buộc)")}
      ${bi(`learned.${i}.text`, "Nội dung", { area: true, rows: 2 })}</div>`).join("");
  const list = (html, act, label, empty) => `${html ? `<div class="items">${html}</div>` : `<div class="empty sm">${empty}</div>`}
      <button class="btn ghost sm add" type="button" data-act="${act}">${label}</button>`;
  return `<div class="pd-h"><h3>Trang chi tiết dự án</h3><span class="hint">Các mục dưới đây hiện ở trang <code>project.html?id=${esc(ED.id || "…")}</code> (bấm Explore).
      Mục nào để trống thì không hiện. ${RT_HINT}</span></div>` +
    csec("info", "Trang chi tiết — Thông tin chung", `
      <div class="grid2">${projImg("logo", "Logo game", { logo: true, hint: "Lưu thành <code>images/logo.png</code> (giữ nền trong suốt)." })}
        ${projImg("cover", "Ảnh nền header", { hint: "Hiện mờ phía sau header. Để trống thì dùng ảnh thumbnail YouTube." })}</div>
      <div class="grid2">${bi("studio", "Studio / công ty")}${bi("period", "Thời gian", { hint: "vd: 2023 – 2024" })}</div>
      <div class="grid2">${bi("genre", "Thể loại", { hint: "vd: Casual simulation" })}
        <div class="grid2 tight">${inp("downloads", "Lượt tải", { ph: "70M+" })}${inp("members", "Số thành viên", { ph: "6", hint: "Số người trong team." })}</div></div>`) +
    csec("roles", "Vai trò (My Roles)", list(roles, "addRole", "+ Thêm vai trò", "Chưa có vai trò nào — web sẽ dùng mục Responsibilities ở trên.") +
      `<span class="hint">Để trống thì web dùng mục <b>Responsibilities</b>. Mỗi dòng “Công việc” là một gạch đầu dòng.</span>`, cnt(d.roles, "vai trò")) +
    csec("progression", "Quá trình sản xuất (Product Progression)", list(steps, "addStep", "+ Thêm bước", "Chưa có bước nào.") +
      `<span class="hint">Mỗi bước có một thư mục ảnh riêng <code>${PROG_DIR}/&lt;id&gt;/</code> trong thư mục dự án. Đổi id của bước đã có ảnh thì thư mục được đổi tên theo khi bấm Lưu.</span>`, cnt(d.progression, "bước")) +
    csec("challenges", "Thử thách &amp; Giải pháp", list(chall, "addChallenge", "+ Thêm thử thách", "Chưa có mục nào."), cnt(d.challenges, "mục")) +
    csec("learned", "Bài học (What I learned)", list(learned, "addLearned", "+ Thêm bài học", "Chưa có bài học nào.") +
      `<span class="hint">Có tiêu đề thì hiện dạng tiêu đề + đoạn văn; không có thì chỉ là một dòng.</span>`, cnt(d.learned, "mục"));
}

// ---- 2D / 3D Artwork + Graphic Design pages (art2d.html / art3d.html / graphic-design.html ← Database/Art2D|Art3D|GraphicDesign/data.json) ----
// Both pages = one data.json listing items (2D sections / 3D projects) whose id = image folder images/<id>/ (steps use the
// same folder). P = page descriptor (PAGES[VIEW]); its draft PS[view] = { orig, d: { intro, <list>: [...] }, saved, open,
// bust, delFiles, checked }. Item drafts share: id, name, cover, steps (3D / GD), _x (unknown keys), _folder (image folder on disk,
// renamed on save when the id changes), _auto (id still follows the EN name), _files (names found by the last folder
// scan, shared by the item's lists), _k (Studio-only key of a new item: open / closed state before it has a folder).
const PARA = "1 dòng = đoạn văn, nhiều dòng = gạch đầu dòng";
let PGK = 0;
const PS = {};   // page drafts by view key (null = re-read on the next visit)
const PAGES = {
  art2d: { view: "art2d", title: "2D Artwork", dir: "Database/Art2D", api: "/api/art2d", rename: "rename-project", list: "projects",
    noun: "dự án", Noun: "Dự án", fallback: "project", toDraft: raw => a2Draft(raw),
    toData: (d, orig) => a2ToData(d, orig), item: () => a2ProjDraft(), used: p => a2Used(p), html: () => viewArt2D(),
    check: d => a2Check(d) },
  art3d: { view: "art3d", title: "3D Artwork", dir: "Database/Art3D", api: "/api/art3d", rename: "rename-project", list: "projects",
    noun: "dự án", Noun: "Dự án", fallback: "project", toDraft: raw => ({ intro: introL(raw.intro), projects: arr(raw.projects).map(a3ProjDraft) }),
    toData: (d, orig) => a3ToData(d, orig), item: () => a3ProjDraft(), step: () => a3StepDraft(), used: p => a3Used(p), html: () => viewArt3D(),
    check: d => a3CheckVideos(d) },
  graphic: { view: "graphic", title: "Graphic Design", dir: "Database/GraphicDesign", api: "/api/graphic", rename: "rename-project", list: "projects",
    noun: "dự án", Noun: "Dự án", fallback: "project", anchor: "graphic-design.html?id=…",
    toDraft: raw => ({ intro: introL(raw.intro), projects: arr(raw.projects).map(gdProjDraft) }),
    toData: (d, orig) => gdToData(d, orig), item: () => gdProjDraft(), step: () => a2StepDraft(), used: p => gdUsed(p), html: () => viewGraphic() },
};
const PG = () => PAGES[VIEW];
const arr = v => (Array.isArray(v) ? v : []);
const introL = v => { const o = L(v), j = x => (Array.isArray(x) ? x.join("<br>") : String(x ?? "")); return { en: j(o.en), vi: j(o.vi) }; };
const imgsDraft = list => arr(list).map(stepImgDraft).filter(im => im.src);
// fields every item draft shares (see above)
const pgItemBase = s => ({
  id: String(s.id || ""), name: L(s.name), text: pairs(s.text), cover: typeof s.cover === "string" ? s.cover : "",
  _folder: s.id && ID_RE.test(s.id) ? s.id : null, _auto: !s.id, _files: null, _k: ++PGK,
});
const pgFolder = s => s._folder || s.id.trim();
const pgKey = s => s._folder || `k${s._k}`;
const pgItems = P => PS[P.view].d[P.list];
// text: 1 line → paragraph (string), several lines → bullet list (array); per language
function para(rows) {
  const u = unpairs(rows), one = a => (a.length > 1 ? a : a[0]);
  const en = one(u.en), vi = one(u.vi);
  if (en === undefined && vi === undefined) return undefined;
  return vi !== undefined && JSON.stringify(vi) !== JSON.stringify(en) ? { en: en ?? "", vi } : en;
}
const imgsOut = list => outMany(list.map(imgOut));
// cover: only an image of the item (or a URL)
const coverOut = (s, used) => { const c = s.cover.trim(); return c && (used.has(c) || /^https?:\/\//i.test(c)) ? c : undefined; };

const pgSnap = P => JSON.stringify(P.toData(PS[P.view].d, PS[P.view].orig));
const pgDirty = P => !!PS[P.view] && pgSnap(P) !== PS[P.view].saved;
const anyPgDirty = () => Object.values(PAGES).some(pgDirty);
function resetPg(P) {
  const raw = isObj(S[P.view]) ? S[P.view] : {};
  PS[P.view] = { orig: raw, d: P.toDraft(raw), open: PS[P.view]?.open || {}, bust: Date.now(), delFiles: [], checked: false };
  PS[P.view].saved = pgSnap(P);
}
// quietly look into each item folder once → flag list entries whose file is missing
async function pgCheckFiles(P, st) {
  let changed = false;
  await Promise.all(st.d[P.list].map(async s => {
    const f = pgFolder(s); if (!ID_RE.test(f)) return;
    try {
      const r = await api("GET", `${P.api}/images?dir=${encodeURIComponent(f)}`);
      s._files = new Set(r.files.filter(x => x.ok).map(x => x.name));
      if ([...P.used(s)].some(nm => !s._files.has(nm))) changed = true;
    } catch { /* older server.mjs without these routes */ }
  }));
  if (changed && PS[P.view] === st && VIEW === P.view) render();
}
const pgIdErr = (P, i) => idErr(pgItems(P), i, P.noun);
const pgSlug = (P, base, i) => uniqSlug(pgItems(P), base, i, P.fallback);
function pgPathHTML(P, i) {
  const s = pgItems(P)[i], f = pgFolder(s), id = s.id.trim();
  return `<code>${P.dir}/images/${f ? esc(f) : "&lt;id&gt;"}/</code>` +
    (s._folder && id && id !== s._folder ? ` <span class="warn">→ đổi tên thành <code>${esc(id)}/</code> khi Lưu</span>` : "");
}
// refresh the id error + folder paths of one item without re-rendering (keeps focus)
function pgIdSync(P, i) {
  const err = pgIdErr(P, i), e = document.querySelector(`[data-pg-err="${i}"]`);
  if (e) e.textContent = err;
  document.querySelector(`[data-pg-id="${i}"]`)?.classList.toggle("bad", !!err);
  document.querySelectorAll(`[data-img-path="s${i}"], [data-img-path^="s${i}."]`).forEach(p => { p.innerHTML = pgPathHTML(P, i); });
}
// the item needs a valid id (= folder name) before files can go into its folder
function pgReady(P, i) {
  const s = pgItems(P)[i];
  if (s._folder) return s._folder;
  if (!s.id.trim()) { toast(`Nhập id cho ${P.noun} trước (id = tên thư mục ảnh)`, "err"); return ""; }
  const err = pgIdErr(P, i); if (err) { toast(`Id ${P.noun}: ${err}`, "err"); return ""; }
  return s.id.trim();
}
// one images list of item i (all lists of an item share its folder): o = { key, path, list, label, hint? }
function pgGroup(P, i, o) {
  const st = PS[P.view], s = pgItems(P)[i];
  return {
    ...o, folder: () => pgFolder(s), files: () => s._files, setFiles: x => { s._files = x; }, used: () => P.used(s),
    url: (f, name) => `/${P.dir}/images/${encodeURIComponent(f)}/${encodeURIComponent(name)}?v=${st.bust}`,
    enabled: true, off: "", where: () => pgPathHTML(P, i), ready: () => pgReady(P, i),
    dirName: f => `images/${f}/`, api: f => `${P.api}/images?dir=${encodeURIComponent(f)}`,
    done: f => { s._folder = f; s._auto = false; st.bust = Date.now(); },
    del: (f, name) => st.delFiles.push({ folder: f, name }), alive: () => PS[P.view] === st,
    badge: im => (s.cover === im.src ? `<span class="bdg y">ảnh bìa</span>` : ""),
  };
}
const STEP_IMG_HINT = `<span class="hint">Ảnh của bước nằm chung thư mục. Quét thư mục ở đây chỉ thêm các file chưa có trong danh sách nào.</span>`;
// name EN/VI + id (= image folder = anchor)
function pgNameId(P, i, nameLabel) {
  const s = pgItems(P)[i], err = pgIdErr(P, i);
  return `<div class="step-top">${bi(`${P.list}.${i}.name`, nameLabel)}
    <div class="f"><label>Id ${P.noun} <code>= tên thư mục ảnh · ${P.anchor || `${P.view}.html#id`}</code></label>
      <input type="text" data-path="${P.list}.${i}.id" data-pg-id="${i}" value="${esc(s.id)}" placeholder="tự tạo từ tên EN"${err ? ' class="bad"' : ""}>
      <span class="err" data-pg-err="${i}">${err}</span></div></div>`;
}
function pgCover(P, i, hint) {
  const s = pgItems(P)[i], used = [...P.used(s)], cover = s.cover.trim();
  const opts = [`<option value="">— Ảnh đầu tiên (mặc định) —</option>`,
    ...used.map(nm => `<option value="${esc(nm)}"${nm === cover ? " selected" : ""}>${esc(nm)}</option>`),
    cover && !used.includes(cover) ? `<option value="${esc(cover)}" selected>${esc(cover)} (không có trong ${P.noun} — sẽ bị bỏ khi Lưu)</option>` : ""].join("");
  return `<div class="f"><label>Ảnh bìa${P.view === "art2d" ? HM : ""} <code>cover · tuỳ chọn</code></label><select data-path="${P.list}.${i}.cover" data-rerender>${opts}</select>
    <span class="hint">${hint}</span></div>`;
}
// steps of item i: body(st, k) = the fields of one step
function pgSteps(P, i, body, label, empty) {
  const s = pgItems(P)[i];
  const steps = s.steps.map((st, k) => `<div class="item step">${itemHead(`${P.list}.${i}.steps`, k, s.steps.length, `Bước ${k + 1} · ${esc(st.title.en || st.title.vi || "Bước mới")}`, "pgRmStep")}
      ${body(st, k)}</div>`).join("");
  return `<div class="f"><span class="lbl">${label}</span>
    ${steps ? `<div class="items">${steps}</div>` : `<div class="empty sm">${empty}</div>`}
    <button class="btn ghost sm add" type="button" data-act="pgAddStep" data-i="${i}">+ Thêm bước</button></div>`;
}
// collapsible item card
function pgCard(P, i, counts, body, bounds) {
  const s = pgItems(P)[i], n = pgItems(P).length, open = PS[P.view].open[pgKey(s)] ?? n <= 2;
  const title = `${String(i + 1).padStart(2, "0")} · ${esc(s.name.en || s.name.vi || s.id || `${P.Noun} mới`)}`;
  return `<details class="item a2s" data-sec="${esc(pgKey(s))}"${open ? " open" : ""}>
    ${itemHead(P.list, i, n, `${title} <small>${counts}${pgFolder(s) ? ` · ${esc(pgFolder(s))}/` : ""}</small>`, "pgRm", "summary", bounds)}
    <div class="a2s-b">${body}</div></details>`;
}
// before writing data.json: fill empty ids, delete files the owner chose to delete, rename folders whose id changed
async function pgSave(P) {
  const st = PS[P.view], list = pgItems(P);
  list.forEach((s, i) => { if (!s.id.trim()) s.id = pgSlug(P, s.name.en || s.name.vi || `${P.fallback}-${i + 1}`, i); });
  list.forEach((s, i) => { const err = pgIdErr(P, i); if (err) throw new Error(`${P.Noun} #${i + 1} (${s.id}): ${err}`); });
  P.check?.(st.d);
  const ren = list.filter(s => s._folder && s._folder !== s.id.trim());
  const folders = new Set(list.map(s => s._folder).filter(Boolean));
  const cross = ren.find(s => folders.has(s.id.trim()));
  if (cross) throw new Error(`Id "${cross.id}" đang là thư mục ảnh của ${P.noun} khác — đổi id lần lượt từng ${P.noun} (Lưu sau mỗi lần)`);
  if (ren.length && !(await confirmDlg("Đổi tên thư mục ảnh?", `<p>Id ${P.noun} đã đổi nên thư mục ảnh sẽ được đổi tên theo:</p>
      <ul class="gitp-files">${ren.map(s => `<li><code>${esc(s._folder)}/</code> → <code>${esc(s.id)}/</code></li>`).join("")}</ul>
      <p class="hint">Trong <code>${P.dir}/images/</code></p>`, "Đổi tên & Lưu", "pri"))) return false;
  for (const f of st.delFiles) {
    if (list.some(s => pgFolder(s) === f.folder && P.used(s).has(f.name))) continue;   // added back
    await api("DELETE", `${P.api}/images?dir=${encodeURIComponent(f.folder)}&name=${encodeURIComponent(f.name)}`);
  }
  st.delFiles = [];
  for (const s of ren) {
    await api("POST", `${P.api}/${P.rename}`, { from: s._folder, to: s.id.trim() });
    st.open[s.id.trim()] = st.open[s._folder];
    s._folder = s.id.trim();
  }
  const data = P.toData(st.d, st.orig);
  await api("PUT", P.api, { data });
  S[P.view] = data; resetPg(P);
  return true;
}
const pgIntro = (P, where) => sec("Giới thiệu", bi("intro", `Đoạn giới thiệu trong banner, dưới tiêu đề ${where}`, { area: true, rows: 3, hint: RT_HINT }));
function pgList(P, cards, hint) {
  const n = pgItems(P).length;
  return `<div class="pd-h"><h3>Các ${P.noun} <span style="color:var(--dim);font-size:.8em">(${n})</span></h3><span class="hint">${hint}</span></div>
    ${cards ? `<div class="items">${cards}</div>` : `<div class="empty sm">Chưa có ${P.noun} nào.</div>`}
    <button class="btn ghost add" style="margin-top:12px" type="button" data-act="pgAdd">+ Thêm ${P.noun}</button>`;
}

// ---- 2D Artwork (art2d.html): tabs (categories) → projects → cover + images (no steps) ----
// Tab 1 = Personal Artworks: its projects are the home page carousel (cover, name, first paragraph of the text);
// tabs 2–4 = the home page "Other 2D Projects" cards. A project points to its tab by the tab's draft key (_k), so a tab
// id can be renamed freely; the projects list stays grouped by tab (tab order, then their own order).
const a2StepDraft = (st = {}) => ({ title: L(st.title), text: pairs(st.text), images: imgsDraft(st.images), _x: rest(st, ["title", "text", "images"]) });
const a2CatDraft = (c = {}) => ({ id: String(c.id || ""), name: L(c.name), text: pairs(c.text), _x: rest(c, ["id", "name", "text"]), _k: String(++PGK) });
const a2ProjDraft = (p = {}, cats = []) => ({
  ...pgItemBase(p), images: imgsDraft(p.images), showCover: p.showCover !== false,
  cat: cats.find(c => c.id && c.id === String(p.category ?? "").trim())?._k || "", _catRaw: String(p.category ?? ""),
  _x: rest(p, ["id", "category", "name", "text", "cover", "showCover", "images", "steps"]),   // old "steps" are dropped
});
function a2Draft(raw) {
  const categories = arr(raw.categories).map(a2CatDraft);
  return a2Sort({ intro: introL(raw.intro), categories, projects: arr(raw.projects).map(p => a2ProjDraft(p, categories)) });
}
const a2CatIdx = (d, p) => { const i = d.categories.findIndex(c => c._k === p.cat); return i < 0 ? 1e6 : i; };
function a2Sort(d) {
  const order = new Map(d.projects.map((p, i) => [p, i]));
  d.projects.sort((a, b) => a2CatIdx(d, a) - a2CatIdx(d, b) || order.get(a) - order.get(b));
  return d;
}
const a2Used = p => new Set(p.images.map(im => im.src));
function a2ToData(d, orig = {}) {
  const categories = d.categories.map(c => outObj({ id: c.id.trim() || undefined, name: outL(c.name), text: para(c.text) }, c._x));
  const projects = d.projects.map(p => outObj({
    id: p.id.trim() || undefined, category: d.categories.find(c => c._k === p.cat)?.id.trim() || p._catRaw.trim() || undefined,
    name: outL(p.name), text: para(p.text), cover: coverOut(p, a2Used(p)),
    showCover: p.showCover ? undefined : false,   // only "false" is written
    images: imgsOut(p.images),
  }, p._x));
  return mergeKeys(orig, { intro: outL(d.intro), categories: outMany(categories), projects: outMany(projects) });
}
// tab ids: filled from the name when empty; a-z 0-9 -, unique, never the id of a project (same #anchor namespace)
function a2Check(d) {
  d.categories.forEach((c, i) => { if (!c.id.trim()) c.id = uniqSlug(d.categories, c.name.en || c.name.vi || `tab-${i + 1}`, i, "tab"); });
  d.categories.forEach((c, i) => {
    const err = idErr(d.categories, i, "tab");
    if (err) throw new Error(`Tab ${i + 1} (${c.id}): ${err}`);
    if (d.projects.some(p => p.id.trim() === c.id.trim())) throw new Error(`Id tab “${c.id}” trùng id một dự án — đổi một trong hai`);
  });
  const lost = d.projects.find(p => !d.categories.some(c => c._k === p.cat));
  if (lost) throw new Error(`Dự án “${lost.name.en || lost.name.vi || lost.id}” chưa chọn tab`);
}
// link to the saved page at a tab / project (#id); hidden until the item has an id
const a2Open = (id, text) => (id.trim() ? `<a class="btn ghost sm a2-open" href="/art2d.html#${encodeURIComponent(id.trim())}" target="_blank" rel="noopener" title="Mở trang đã lưu">${text}</a>` : "");
const a2Role = i => (i === 0 ? `carousel “Personal Artworks” trang chủ${HM}` : i <= 3 ? `thẻ ${i} của “Other 2D Projects” trang chủ${HM}` : "chỉ hiện ở trang 2D (trang chủ có 3 thẻ)");
function a2Tab(c, i, d) {
  const n = d.projects.filter(p => p.cat === c._k).length, err = c.id.trim() ? idErr(d.categories, i, "tab") : "";
  return `<div class="item">${itemHead("categories", i, d.categories.length, `Tab ${i + 1} · ${esc(c.name.en || c.name.vi || "Tab mới")} <small>${a2Role(i)} · ${n} dự án</small>`, "a2RmCat")}
    <div class="step-top">${bi(`categories.${i}.name`, `Tên tab (thanh tab + tiêu đề)${i <= 3 ? HM : ""}`)}
      <div class="f"><label>Id tab <code>art2d.html#id</code></label>
        <input type="text" data-path="categories.${i}.id" data-a2-cat="${i}" value="${esc(c.id)}" placeholder="tự tạo từ tên EN khi Lưu"${err ? ' class="bad"' : ""}>
        <span class="err">${err}</span>${a2Open(c.id, "Xem tab trên web ↗")}</div></div>
    ${bullets(`categories.${i}.text`, "Giới thiệu tab", PARA)}</div>`;
}
function a2Project(p, i, d, [lo, hi]) {
  const P = PAGES.art2d, home = a2CatIdx(d, p) === 0, H = home ? HM : "";
  const opts = d.categories.map((c, j) => `<option value="${c._k}"${c._k === p.cat ? " selected" : ""}>Tab ${j + 1} · ${esc(c.name.en || c.name.vi || c.id || "Tab mới")}</option>`).join("");
  return pgCard(P, i, `${a2Used(p).size} ảnh${p.showCover ? "" : " · ẩn ảnh bìa"}${home ? " · carousel trang chủ" : ""}`, `
      ${pgNameId(P, i, `Tên dự án${H}`)}
      ${a2Open(pgFolder(p), "Xem dự án trên web ↗")}
      <div class="f"><label>Tab</label><select data-path="projects.${i}.cat" data-rerender>${p.cat ? "" : `<option value="" selected>— chọn tab —</option>`}${opts}</select>
        <span class="hint">Đổi tab thì dự án chuyển xuống cuối tab đó.</span></div>
      ${bullets(`projects.${i}.text`, `Nội dung${H}`, home ? `${PARA} · dòng đầu = dòng mô tả trong carousel trang chủ` : PARA)}
      ${pgCover(P, i, home ? "Ảnh của dự án trong carousel trang chủ. Để mặc định thì là ảnh đầu tiên."
        : "Ảnh của thẻ dự án; dự án đầu tiên của tab còn cho ảnh thẻ tab ở “Other 2D Projects” trang chủ. Để mặc định thì là ảnh đầu tiên.")}
      <div class="f"><label class="sl-chk"><input type="checkbox" data-path="projects.${i}.showCover" data-rerender${p.showCover ? " checked" : ""}> Hiện ảnh bìa trong trang chi tiết (art2d.html)</label>
        <span class="hint">Bỏ chọn thì ảnh bìa không có trong dải ảnh của dự án ở trang 2D (ghi <code>"showCover": false</code>) — vẫn dùng ở trang chủ.</span></div>
      ${imgGroup(pgGroup(P, i, { key: `s${i}`, path: `projects.${i}.images`, list: p.images, label: "Ảnh của dự án" }))}`, [lo, hi]);
}
function viewArt2D() {
  const P = PAGES.art2d, d = a2Sort(PS.art2d.d);
  draftOf = () => PS.art2d.d;
  // projects grouped by tab (indexes = positions in d.projects); ↑ ↓ move inside the tab
  const groups = [...d.categories.map(c => ({ c, list: [] })), { c: null, list: [] }];
  d.projects.forEach((p, i) => (groups.find(g => g.c && g.c._k === p.cat) || groups.at(-1)).list.push(i));
  const group = ({ c, list }) => {
    const j = d.categories.indexOf(c), bounds = [list[0], list.at(-1)];
    if (!c && !list.length) return "";
    return `<div class="a2-group"><h3 class="a2-group-h">${c ? `Tab ${j + 1} · ${esc(c.name.en || c.name.vi || c.id || "Tab mới")} <small>${a2Role(j)}</small>`
        : `<span class="err">Chưa chọn tab — không hiện trên web</span>`}</h3>
      ${list.length ? `<div class="items">${list.map(i => a2Project(d.projects[i], i, d, bounds)).join("")}</div>` : `<div class="empty sm">Tab này chưa có dự án.</div>`}
      ${c ? `<button class="btn ghost sm add" type="button" data-act="a2AddProj" data-k="${c._k}">+ Thêm dự án vào tab này</button>` : ""}</div>`;
  };
  return saveBar("2D Artwork", `Trang <code>art2d.html</code> (menu Portfolio → 2D Artwork) <b>và</b> section 2D ARTWORK ở trang chủ. Lưu trong
      <code>${P.dir}/data.json</code>, ảnh của mỗi dự án trong <code>${P.dir}/images/&lt;id dự án&gt;/</code>.<br>
      Trên trang: banner → thanh tab → <b>chỉ tab đang chọn</b>: tiêu đề “TÊN TAB · n dự án” (không số), giới thiệu tab, rồi các dự án của tab xếp dọc
      (số thứ tự, tên, nội dung, dải ảnh). Link <code>art2d.html#&lt;id tab&gt;</code> mở tab đó,
      <code>art2d.html#&lt;id dự án&gt;</code> mở tab của dự án và cuộn tới dự án.`,
      `<a class="btn ghost sm" href="/art2d.html" target="_blank" rel="noopener">Xem trang ↗</a>`) +
    pgIntro(P, "2D ARTWORK") +
    sec(`Các tab <span style="color:var(--dim);font-size:.8em">(${d.categories.length})</span>`, `<span class="hint">Thanh tab của trang 2D, theo thứ tự dưới đây (↑ ↓ để đổi).
      <b>Tab 1</b> = Personal Artworks: các dự án của nó là carousel trang chủ (ảnh bìa, tên, dòng đầu của nội dung).
      <b>Tab 2–4</b> = 3 thẻ “Other 2D Projects” trang chủ (tên tab, ảnh của dự án đầu tiên, số dự án). Xoá tab được khi tab đã trống.</span>
      <div class="items">${d.categories.map((c, i) => a2Tab(c, i, d)).join("")}</div>
      <button class="btn ghost sm add" type="button" data-act="a2AddCat">+ Thêm tab</button>`) +
    `<div class="pd-h"><h3>Các dự án <span style="color:var(--dim);font-size:.8em">(${d.projects.length})</span></h3><span class="hint">Mỗi dự án thuộc một tab:
      tên, nội dung, ảnh bìa, ảnh. Dự án trống hẳn thì không hiện. Nội dung: 1 dòng = đoạn văn, nhiều dòng = gạch đầu dòng. ${RT_HINT}</span></div>
    ${groups.map(group).join("")}`;
}

// ---- 3D Artwork (art3d.html): projects → tools, final result (videos + images), steps (images + 1 video) ----
const YT_BAD = "Link YouTube không hợp lệ — dán link youtube.com / youtu.be / Shorts hoặc id 11 ký tự";
// a video draft keeps what was typed until it is a valid link, then the 11-char id; /shorts/ → portrait
function a3VideoDraft(v = {}) {
  if (typeof v === "string") v = { youtube: v };
  if (!isObj(v)) v = {};
  const raw = String(v.youtube ?? "").trim(), { id, shorts } = ytInfo(raw);
  return {
    youtube: id || raw, caption: L(v.caption), _x: rest(v, ["youtube", "orientation", "caption"]),
    orientation: v.orientation === "portrait" || v.orientation === "landscape" ? v.orientation : shorts ? "portrait" : "landscape",
  };
}
const a3VideoOut = v => {
  const raw = v.youtube.trim(); if (!raw) return undefined;
  return outObj({ youtube: ytInfo(raw).id || raw, orientation: v.orientation, caption: outL(v.caption) }, v._x);
};
const a3StepDraft = (st = {}) => ({
  title: L(st.title), text: pairs(st.text), images: imgsDraft(st.images), video: a3VideoDraft(st.video),
  _x: rest(st, ["title", "text", "images", "video"]),
});
const chipList = v => arr(v).map(t => String(isObj(t) ? t.en || t.vi || "" : t ?? "").trim()).filter(Boolean);
const a3ProjDraft = (p = {}) => ({
  ...pgItemBase(p), home: p.home === true, tags: chipList(p.tags),
  tools: chipList(p.tools),
  final: { videos: arr(p.final?.videos).map(a3VideoDraft), images: imgsDraft(p.final?.images), _x: rest(p.final, ["videos", "images"]) },
  steps: arr(p.steps).map(a3StepDraft),
  _x: rest(p, ["id", "name", "home", "tags", "tools", "text", "cover", "final", "steps"]),
});
const a3Used = p => new Set([...p.final.images, ...p.steps.flatMap(st => st.images)].map(im => im.src));
function a3ToData(d, orig = {}) {
  const projects = d.projects.map(p => {
    const fin = outObj({ videos: outMany(p.final.videos.map(a3VideoOut).filter(Boolean)), images: imgsOut(p.final.images) }, p.final._x);
    return outObj({
      id: p.id.trim() || undefined, name: outL(p.name), home: p.home || undefined, tags: outMany(p.tags), tools: outMany(p.tools),
      text: para(p.text), cover: coverOut(p, a3Used(p)),
      final: Object.keys(fin).length ? fin : undefined,
      steps: outMany(p.steps.map(st => outObj({ title: outL(st.title), text: para(st.text), images: imgsOut(st.images), video: a3VideoOut(st.video) }, st._x))
        .filter(o => Object.keys(o).length)),
    }, p._x);
  });
  return mergeKeys(orig, { intro: outL(d.intro), projects: outMany(projects) });
}
// save refuses links that are not YouTube (the site would drop them silently)
function a3CheckVideos(d) {
  d.projects.forEach((p, i) => {
    const where = `Dự án #${i + 1} (${p.name.en || p.name.vi || p.id})`;
    p.final.videos.forEach((v, j) => { if (v.youtube.trim() && !ytInfo(v.youtube).id) throw new Error(`${where}, video ${j + 1}: ${YT_BAD}`); });
    p.steps.forEach((st, k) => { if (st.video.youtube.trim() && !ytInfo(st.video.youtube).id) throw new Error(`${where}, bước ${k + 1}: ${YT_BAD}`); });
  });
}
const ytHQ = id => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
// one video: link / id input (live thumbnail + error), Ngang / Dọc, caption EN / VI
function a3Video(path, v, head = "") {
  const { id } = ytInfo(v.youtube), bad = !!v.youtube.trim() && !id, port = v.orientation === "portrait";
  return `<div class="v3">${head}<div class="yt">
    <div style="display:grid;gap:8px;min-width:0">
      <input type="text" data-path="${path}.youtube" data-yt3="${path}" value="${esc(v.youtube)}" placeholder="Dán link YouTube / Shorts hoặc ID"${bad ? ' class="bad"' : ""}>
      <span class="err" data-yt3-err="${path}">${bad ? YT_BAD : ""}</span>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">${seg(`${path}.orientation`, [["landscape", "Ngang 16:9"], ["portrait", "Dọc 9:16 (Shorts)"]])}
        <span class="hint">Link <code>/shorts/</code> tự chọn Dọc. Video dọc nằm cạnh phần chữ.</span></div>
      ${bi(`${path}.caption`, "Chú thích (không bắt buộc)")}</div>
    <div class="ytp${port ? " portrait" : ""}${bad ? " bad" : ""}" data-yt3-prev="${path}" style="${id ? `background-image:url('${ytHQ(id)}')` : ""}">${id ? "" : bad ? "link không hợp lệ" : "chưa có video"}</div>
  </div></div>`;
}
// live preview while typing (no re-render → keeps focus); a /shorts/ link switches the video to portrait
function a3YtSync(el) {
  const path = el.dataset.yt3, { id, shorts } = ytInfo(el.value), bad = !!el.value.trim() && !id;
  const box = document.querySelector(`[data-yt3-prev="${path}"]`), err = document.querySelector(`[data-yt3-err="${path}"]`);
  el.classList.toggle("bad", bad);
  if (err) err.textContent = bad ? YT_BAD : "";
  const v = getPath(draftOf(), path);
  if (shorts && v.orientation !== "portrait") {
    v.orientation = "portrait";
    document.querySelectorAll(`[data-act="seg"][data-path="${path}.orientation"]`).forEach(b => b.classList.toggle("on", b.dataset.v === "portrait"));
  }
  if (!box) return;
  box.style.backgroundImage = id ? `url('${ytHQ(id)}')` : "";
  box.textContent = id ? "" : bad ? "link không hợp lệ" : "chưa có video";
  box.classList.toggle("bad", bad); box.classList.toggle("portrait", v.orientation === "portrait");
}
function a3Project(p, i) {
  const P = PAGES.art3d, nv = p.final.videos.length + p.steps.filter(st => st.video.youtube.trim()).length;
  const videos = p.final.videos.map((v, j) => `<div class="item">${a3Video(`projects.${i}.final.videos.${j}`, v,
    itemHead(`projects.${i}.final.videos`, j, p.final.videos.length, `Video ${j + 1}${v.orientation === "portrait" ? " · dọc" : ""}`))}</div>`).join("");
  const homeHint = p.home && !p.final.videos.some(v => ytInfo(v.youtube).id)
    ? `<span class="err">Chưa có video thành phẩm — trang chủ chỉ hiện dự án có video.</span>`
    : `<span class="hint">Hiện ở section <b>3D BLENDER</b> trang chủ: tên, video thành phẩm đầu tiên, tag vai trò (trống thì dùng công cụ), nội dung; Explore mở dự án này.</span>`;
  return pgCard(P, i, `${a3Used(p).size} ảnh · ${nv} video${p.steps.length ? ` · ${p.steps.length} bước` : ""}${p.home ? " · trang chủ" : ""}`, `
      ${pgNameId(P, i, `Tên dự án (tiêu đề trên web)${HM}`)}
      <div class="f"><span class="lbl">Trang chủ</span>
        <label class="sl-chk"><input type="checkbox" data-path="projects.${i}.home" data-rerender${p.home ? " checked" : ""}> Hiện ở trang chủ (3D Blender)${HM}</label>${homeHint}</div>
      ${chips(`projects.${i}.tags`, `Tag vai trò${HM} <code>tags · tuỳ chọn, chỉ hiện ở trang chủ</code>`, "Gõ vai trò (3D Modeling, VFX…) rồi Enter. Kéo để đổi thứ tự.")}
      ${chips(`projects.${i}.tools`, "Công cụ <code>tools · tuỳ chọn</code>", "Gõ tên (Blender, Substance Painter…) rồi Enter. Kéo để đổi thứ tự.")}
      ${bullets(`projects.${i}.text`, `Nội dung${HM}`, PARA)}
      ${pgCover(P, i, "Ảnh đại diện của dự án (lưu sẵn cho các kiểu hiển thị sau; trang hiện tại chưa dùng). Để mặc định thì là ảnh đầu tiên.")}
      <div class="sub3"><h4>Thành phẩm <small>final result — video lớn trong khung HUD, rồi dải ảnh</small></h4>
        <div class="f"><span class="lbl">Video${HM} <code>${p.final.videos.length} video · video đầu tiên hiện ở trang chủ</code></span>
          ${videos ? `<div class="items">${videos}</div>` : `<div class="empty sm">Chưa có video — dự án chỉ có ảnh (ảnh thành phẩm hiện to hơn).</div>`}
          <button class="btn ghost sm add" type="button" data-act="a3AddVideo" data-i="${i}">+ Thêm video</button></div>
        ${imgGroup(pgGroup(P, i, { key: `s${i}`, path: `projects.${i}.final.images`, list: p.final.images, label: "Ảnh thành phẩm" }))}</div>
      <div class="sub3"><h4>Quá trình thực hiện <small>process — các bước trên đường dọc cyan</small></h4>
      ${pgSteps(P, i, (st, k) => `${bi(`projects.${i}.steps.${k}.title`, "Tên bước")}
        ${bullets(`projects.${i}.steps.${k}.text`, "Nội dung", PARA)}
        ${imgGroup(pgGroup(P, i, { key: `s${i}.${k}`, path: `projects.${i}.steps.${k}.images`, list: st.images, label: "Ảnh của bước", hint: STEP_IMG_HINT }))}
        ${a3Video(`projects.${i}.steps.${k}.video`, st.video, `<span class="lbl">Video của bước <code>tuỳ chọn — để trống = không có</code></span>`)}`,
        `Các bước <code>tuỳ chọn — mỗi bước có chữ, dải ảnh và 1 video riêng</code>`, "Chưa có bước nào.")}</div>`);
}
function viewArt3D() {
  const P = PAGES.art3d, d = PS.art3d.d;
  draftOf = () => PS.art3d.d;
  return saveBar("3D Artwork", `Trang <code>art3d.html</code> (menu Portfolio → 3D Artwork) <b>và</b> section 3D BLENDER ở trang chủ (các dự án bật “Hiện ở trang chủ”). Lưu trong
      <code>${P.dir}/data.json</code>, ảnh của mỗi dự án trong <code>${P.dir}/images/&lt;id dự án&gt;/</code>.`,
      `<a class="btn ghost sm" href="/art3d.html" target="_blank" rel="noopener">Xem trang ↗</a>`) +
    pgIntro(P, "3D ARTWORK") +
    pgList(P, d.projects.map(a3Project).join(""), `Mỗi dự án = một phần “01 TÊN DỰ ÁN” trên trang: công cụ + chữ → <b>Thành phẩm</b> (video, ảnh) →
      <b>Quá trình thực hiện</b> (các bước). Theo thứ tự dưới đây (↑ ↓ để đổi); dự án trống hẳn thì không hiện. Nội dung: 1 dòng = đoạn văn,
      nhiều dòng = gạch đầu dòng. ${RT_HINT}`);
}

// ---- Graphic Design (graphic-design.html list + ?id=<id> detail): projects → client, year, tools, cover, steps (images) ----
const gdProjDraft = (p = {}) => ({
  ...pgItemBase(p), client: L(p.client), year: String(p.year ?? ""),
  tools: arr(p.tools).map(t => String(isObj(t) ? t.en || t.vi || "" : t ?? "").trim()).filter(Boolean),
  steps: arr(p.steps).map(a2StepDraft),
  _x: rest(p, ["id", "name", "text", "cover", "client", "year", "tools", "steps"]),
});
const gdUsed = p => new Set(p.steps.flatMap(st => st.images).map(im => im.src));
function gdToData(d, orig = {}) {
  const projects = d.projects.map(p => outObj({
    id: p.id.trim() || undefined, name: outL(p.name), text: para(p.text), cover: coverOut(p, gdUsed(p)),
    client: outL(p.client), year: p.year.trim() || undefined, tools: outMany(p.tools),
    steps: outMany(p.steps.map(st => outObj({ title: outL(st.title), text: para(st.text), images: imgsOut(st.images) }, st._x)).filter(o => Object.keys(o).length)),
  }, p._x));
  return mergeKeys(orig, { intro: outL(d.intro), projects: outMany(projects) });
}
function gdProject(p, i) {
  const P = PAGES.graphic, id = pgFolder(p);
  return pgCard(P, i, `${gdUsed(p).size} ảnh · ${p.steps.length} bước`, `
      ${pgNameId(P, i, "Tên dự án (tên thẻ + tiêu đề trang chi tiết)")}
      <div class="grid2" style="align-items:start">${bi(`projects.${i}.client`, "Khách hàng <code>client · tuỳ chọn</code>", { hint: "vd: Dự án cá nhân, tên công ty. Hiện thành dòng “khách hàng · năm”." })}
        ${inp(`projects.${i}.year`, "Năm <code>year · tuỳ chọn</code>", { ph: "2025" })}</div>
      ${chips(`projects.${i}.tools`, "Công cụ <code>tools · tuỳ chọn</code>", "Gõ tên (Illustrator, Photoshop, Figma…) rồi Enter. Kéo để đổi thứ tự. Hiện thành hàng tag trên thẻ và chip CÔNG CỤ ở trang chi tiết.")}
      ${bullets(`projects.${i}.text`, "Mô tả", `${PARA} · thẻ hiện tối đa 3 dòng (danh sách → dòng đầu)`)}
      ${pgCover(P, i, "Ảnh của thẻ ở trang danh sách + ảnh lớn (không bị cắt) ở trang chi tiết + nút dự án trước / tiếp. Để mặc định thì là ảnh đầu tiên của các bước.")}
      <div class="sub3"><h4>Quá trình thực hiện <small>process — các bước trên đường dọc cyan ở trang chi tiết${id ? ` · <code>graphic-design.html?id=${esc(id)}#step-1</code>` : ""}</small></h4>
      ${pgSteps(P, i, (st, k) => `${bi(`projects.${i}.steps.${k}.title`, "Tên bước")}
        ${bullets(`projects.${i}.steps.${k}.text`, "Nội dung", PARA)}
        ${imgGroup(pgGroup(P, i, { key: `s${i}.${k}`, path: `projects.${i}.steps.${k}.images`, list: st.images, label: "Ảnh của bước", hint: k ? STEP_IMG_HINT : undefined }))}`,
        `Các bước <code>mỗi bước có tên, chữ và dải ảnh riêng (bấm để xem to)</code>`, "Chưa có bước nào — trang chi tiết chỉ có phần đầu.")}</div>`);
}
function viewGraphic() {
  const P = PAGES.graphic, d = PS.graphic.d;
  draftOf = () => PS.graphic.d;
  return saveBar("Graphic Design", `Trang <code>graphic-design.html</code> (menu Portfolio → Graphic Design): danh sách thẻ, bấm thẻ → trang chi tiết
      <code>graphic-design.html?id=&lt;id&gt;</code> — cả hai lấy từ cùng một dữ liệu. Lưu trong <code>${P.dir}/data.json</code>, ảnh của mỗi dự án
      (mọi bước) trong <code>${P.dir}/images/&lt;id dự án&gt;/</code>.`,
      `<a class="btn ghost sm" href="/graphic-design.html" target="_blank" rel="noopener">Xem trang ↗</a>`) +
    pgIntro(P, "GRAPHIC DESIGN") +
    pgList(P, d.projects.map(gdProject).join(""), `Mỗi dự án = một thẻ ở trang danh sách (theo thứ tự dưới đây, ↑ ↓ để đổi) và một trang chi tiết:
      tên, khách hàng · năm, mô tả, công cụ, ảnh bìa → <b>Quá trình thực hiện</b> (các bước) → dự án trước / tiếp. Dự án trống hẳn thì không hiện.
      Mô tả / nội dung: 1 dòng = đoạn văn, nhiều dòng = gạch đầu dòng. ${RT_HINT}`);
}

// ---- UI frames: Unity-style sprite editor (9-slice) ----
const ZOOMS = [["fit", "Vừa khung"], ["1", "1x"], ["2", "2x"], ["4", "4x"]];
function viewUI() {
  return saveBar("Giao diện", "Khung ảnh 9-slice trong <code>assets/ui/&lt;tên&gt;/</code> (<code>frame.png</code> + <code>frame.json</code>). Thay ảnh rồi chỉnh đường cắt — trang web tự cập nhật.") +
    `<p class="hint ui-help">4 góc giữ nguyên kích thước, các cạnh giãn theo 1 chiều, phần giữa giãn cả 2 chiều — giống Sprite Border trong Unity.
      Kéo các đường <b style="color:var(--green)">xanh lá</b> trên ảnh hoặc nhập số.</p>` +
    (UIF.length ? UIF.map(uiCard).join("") : `<div class="empty">Chưa có khung nào trong <code>assets/ui/</code>.</div>`);
}
function uiCard(f) {
  const d = f.d, n = f.name, k = (key, attrs = "") => `data-ui="${n}" data-uik="${key}" ${attrs}`;
  const num = (key, label, o = "") => `<label class="sl-n"><span>${label}</span><input type="number" ${k(key, o)}></label>`;
  const stageW = f.zoom === "fit" ? `min(100%, ${f.w * 8}px, ${Math.round(380 * f.w / (f.h || 1))}px)` : `${f.w * +f.zoom}px`;
  const editor = f.w ? `<div class="sl-view"><div class="sl-stage${+f.zoom > 1 ? " px" : ""}" style="width:${stageW};aspect-ratio:${f.w} / ${f.h}">
      <img src="${esc(uiImg(f))}" alt="" draggable="false">
      <div class="sl-grid">${["góc", "cạnh", "góc", "cạnh", "giữa", "cạnh", "góc", "cạnh", "góc"].map((t, i) => `<span class="r${i}">${t}</span>`).join("")}</div>
      ${SIDE_LBL.map(([s]) => `<div class="sl-g ${s === "left" || s === "right" ? "v" : "h"}" data-side="${s}" title="Kéo để chỉnh"><i></i></div>`).join("")}
    </div></div>` : `<div class="empty">Không đọc được ảnh <code>assets/ui/${n}/${esc(d.image)}</code> — bấm “Thay ảnh…”.</div>`;
  const quote = (L(S.config.intro?.quote).en || "Hi, welcome to my Portfolio~~").replace(/<[^>]*>/g, "");
  const sample = n === "text-frame"
    ? [[420, 56], [600, 64], [820, 72]].map(([w, h]) => `<div class="fr fr-line" style="width:${w}px;height:${h}px"><span class="fr-c">${esc(quote)}</span></div>`).join("")
    : /button|btn/.test(n)
    ? [[150, 48], [190, 58], [260, 64]].map(([w, h]) => `<div class="fr fr-btn" style="width:${w}px;height:${h}px"><span class="fr-c">EXPLORE</span></div>`).join("")
    : [[300, 190], [420, 240], [560, 300]].map(([w, h]) => `<div class="fr fr-panel" style="width:${w}px;height:${h}px"><div class="fr-c">
        <h4>Description</h4><ul><li>Lorem ipsum dolor sit amet</li><li>Consectetur adipiscing elit, sed do eiusmod</li></ul></div></div>`).join("");
  return sec(`${esc(UI_LABELS[n] || n)}`, `<div class="sl" data-ui="${n}">
      <div class="sl-tools"><div class="seg">${ZOOMS.map(([z, t]) => `<button type="button" data-act="uiZoom" data-ui="${n}" data-z="${z}" class="${f.zoom === z ? "on" : ""}">${t}</button>`).join("")}</div>
        <span class="hint">Ảnh: <b>${f.w ? `${f.w} × ${f.h} px` : "—"}</b></span>
        <button class="btn ghost sm" type="button" data-act="uiImage" data-ui="${n}" style="margin-left:auto">Thay ảnh…</button></div>
      ${editor}
      <div class="sl-form">
        <div class="f"><span class="lbl">Vùng cắt <code>px trên ảnh</code></span><div class="sl-4">${SIDE_LBL.map(([s, t]) => num(`slice.${s}`, t, 'min="0" step="1"')).join("")}</div></div>
        <div class="f"><span class="lbl">Padding nội dung <code>px CSS</code></span><div class="sl-4">${SIDE_LBL.map(([s, t]) => num(`padding.${s}`, t, 'min="0" step="1"')).join("")}</div>
          <span class="hint">Khoảng cách từ mép khung tới nội dung (khung nét đứt trong phần xem thử).</span></div>
        <div class="grid3">
          <div class="f"><label>Tỉ lệ hiển thị <code>scale</code></label><input type="number" ${k("scale", 'min="0.05" step="0.05"')}>
            <span class="hint">Số px trên màn hình cho mỗi px ảnh — 0.5 nếu ảnh vẽ ở 2x.</span></div>
          <div class="f"><label>Cạnh &amp; phần giữa</label><select ${k("edges")}>${EDGE_OPTS.map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select></div>
          <div class="f"><label>&nbsp;</label><label class="sl-chk"><input type="checkbox" ${k("fill")}> Vẽ phần giữa</label></div>
        </div>
      </div>
      <div class="f"><span class="lbl">Xem thử <code>kéo góc dưới-phải của mỗi ô để đổi kích thước</code></span>
        <div class="sl-pv" id="uipv-${n}"><style id="uicss-${n}"></style>${sample}</div></div>
    </div>`, `<code>assets/ui/${n}/</code>`);
}
// push the draft of one frame into its editor: guides, shaded regions, inputs (except the one being typed in), live preview
function uiSync(f, except) {
  const root = document.querySelector(`.sl[data-ui="${f.name}"]`); if (!root) return;
  const s = f.d.slice, pc = (v, n) => `${(v / (n || 1) * 100).toFixed(4)}%`;
  const stage = root.querySelector(".sl-stage");
  if (stage) {
    const pos = { left: s.left, right: f.w - s.right, top: s.top, bottom: f.h - s.bottom };
    root.querySelectorAll(".sl-g").forEach(g => {
      const side = g.dataset.side, v = side === "left" || side === "right";
      g.style[v ? "left" : "top"] = pc(pos[side], v ? f.w : f.h);
      g.firstElementChild.textContent = `${{ left: "L", right: "R", top: "T", bottom: "B" }[side]} ${s[side]}`;
    });
    const grid = root.querySelector(".sl-grid");
    grid.style.gridTemplateColumns = `${pc(s.left, f.w)} 1fr ${pc(s.right, f.w)}`;
    grid.style.gridTemplateRows = `${pc(s.top, f.h)} 1fr ${pc(s.bottom, f.h)}`;
  }
  root.querySelectorAll("[data-uik]").forEach(el => {
    if (el === except) return;
    const v = getPath(f.d, el.dataset.uik);
    if (el.type === "checkbox") el.checked = v; else el.value = v;
  });
  $(`uicss-${f.name}`).textContent = frameLib.frameCSS(`#uipv-${f.name} .fr`, f.d, uiImg(f));
  updateDirty();
}
// keep the slice inside the image: each side ≤ size, opposite sides never cross
function clampSlice(f) {
  const s = f.d.slice, r = v => Math.max(0, Math.round(v));
  if (!f.w) return false;
  const before = JSON.stringify(s);
  s.left = Math.min(r(s.left), f.w); s.right = Math.min(r(s.right), f.w - s.left);
  s.top = Math.min(r(s.top), f.h); s.bottom = Math.min(r(s.bottom), f.h - s.top);
  return before !== JSON.stringify(s);
}
const uiFrame = name => UIF.find(f => f.name === name);
function uiInput(el, commit) {
  const f = uiFrame(el.dataset.ui), key = el.dataset.uik; if (!f) return;
  if (key === "fill") f.d.fill = el.checked;
  else if (key === "edges") f.d.edges = el.value;
  else {
    const v = parseFloat(el.value);
    if (key === "scale") { if (v > 0) f.d.scale = v; }
    else if (Number.isFinite(v)) {
      setPath(f.d, key, Math.max(0, Math.round(v)));
      if (key.startsWith("slice.")) {               // the edited side gives way to the opposite one
        const side = key.split(".")[1], opp = { left: "right", right: "left", top: "bottom", bottom: "top" }[side];
        const size = side === "left" || side === "right" ? f.w : f.h;
        if (size) f.d.slice[side] = Math.min(f.d.slice[side], size - f.d.slice[opp]);
      }
    }
  }
  uiSync(f, commit ? null : el);
}
// drag the green guides (mouse + touch through pointer events)
function bindUI() {
  UIF.forEach(f => {
    const root = document.querySelector(`.sl[data-ui="${f.name}"]`), stage = root?.querySelector(".sl-stage");
    if (stage) {
      if (f.zoom === "fit" && stage.clientWidth > f.w * 1.05) stage.classList.add("px");   // enlarged → crisp pixels
      stage.querySelectorAll(".sl-g").forEach(g => {
        const side = g.dataset.side;
        g.addEventListener("pointerdown", e => {
          e.preventDefault(); g.setPointerCapture(e.pointerId); g.classList.add("drag");
          const move = ev => {
            const b = stage.getBoundingClientRect(), s = f.d.slice;
            const x = Math.round((ev.clientX - b.left) / b.width * f.w), y = Math.round((ev.clientY - b.top) / b.height * f.h);
            const lim = (v, max) => Math.max(0, Math.min(v, max));
            if (side === "left") s.left = lim(x, f.w - s.right);
            else if (side === "right") s.right = lim(f.w - x, f.w - s.left);
            else if (side === "top") s.top = lim(y, f.h - s.bottom);
            else s.bottom = lim(f.h - y, f.h - s.top);
            uiSync(f);
          };
          const up = () => { g.classList.remove("drag"); g.removeEventListener("pointermove", move); g.removeEventListener("pointerup", up); g.removeEventListener("pointercancel", up); };
          g.addEventListener("pointermove", move); g.addEventListener("pointerup", up); g.addEventListener("pointercancel", up);
        });
      });
    }
    uiSync(f);
  });
}
// replace frame.png in place (same file name), then bump "version" in frame.json so browsers drop the cached image
async function replaceFrameImage(f) {
  const [file] = await pickFiles("image/png,image/jpeg,image/webp"); if (!file) return;
  try {
    const ext = f.d.image.split(".").pop().toLowerCase(), mime = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp" }[ext];
    const bmp = await createImageBitmap(file);
    let blob = file;
    if (file.type !== mime) {                         // keep the file name → re-encode to its format
      const c = document.createElement("canvas"); c.width = bmp.width; c.height = bmp.height;
      c.getContext("2d").drawImage(bmp, 0, 0);
      blob = await new Promise(r => c.toBlob(r, mime, 0.95));
    }
    await postFile(`/api/ui/${f.name}/image?name=${encodeURIComponent(f.d.image)}`, blob);
    const r = await api("PUT", `/api/ui/${f.name}`, { config: { ...JSON.parse(f.saved), version: Date.now() } });
    f.saved = JSON.stringify(uiToDraft(r.config)); f.d.version = r.config.version;
    f.bust = r.config.version; f.w = bmp.width; f.h = bmp.height;
    const clamped = clampSlice(f);
    render(); reloadPreview(); gitRefresh();
    toast(clamped ? "Ảnh mới nhỏ hơn vùng cắt cũ — đã thu các đường cắt vào trong ảnh, kiểm tra rồi bấm Lưu" : `Đã thay ảnh (${f.w} × ${f.h} px)`, clamped ? "err" : "ok");
  } catch (e) { toast(e.message, "err"); }
}

// ══════════════ commit & push panel (bottom of every view) ══════════════
// paths must match GIT_SCOPES in server.mjs (the server only receives the view key)
const GIT_SCOPES = {
  settings: [["web-config.json"], "Update profile"], experience: [["web-config.json"], "Update work experience"],
  texts: [["web-config.json"], "Update UI texts"], projects: [["Database/Projects"], "Update projects"],
  art2d: [["Database/Art2D"], "Update 2D artwork"], art3d: [["Database/Art3D"], "Update 3D artwork"],
  graphic: [["Database/GraphicDesign"], "Update graphic design"], ui: [["assets/ui"], "Update UI frames"],
};
const GIT = { view: "", all: false, msg: {}, files: null, ahead: null, branch: "", error: "", busy: "", seq: 0 };
const gitPaths = () => (GIT.all ? null : GIT_SCOPES[VIEW]?.[0]);
const gitMsg = () => GIT.msg[GIT.all ? "@all" : VIEW] ?? (GIT.all ? "Update site" : GIT_SCOPES[VIEW]?.[1] || "Update");
function gitCmd(push) {
  const p = gitPaths(), m = `"${gitMsg().trim().replace(/["\\$`]/g, "\\$&")}"`;
  return (p ? `git add ${p.join(" ")} && git commit -m ${m} -- ${p.join(" ")}` : `git add -A && git commit -m ${m}`) + (push ? " && git push" : "");
}
function gitPanel() {
  if (!GIT_SCOPES[VIEW]) return "";
  return `<section class="gitp" id="gitp">
    <div class="gitp-l"><b>Xong thì commit để đăng lên web</b><span class="gitp-st" id="gitSt"></span></div>
    <div class="gitp-r"><code class="gitp-cmd" id="gitCmd" title="Lệnh sẽ chạy"></code>
      <button class="btn ghost" type="button" data-act="gitCopy">Copy</button>
      <button class="btn pri" type="button" id="gitBtn" data-act="gitCommit">Commit &amp; Push</button></div>
    <div class="gitp-o"><label class="gitp-msg"><span>Nội dung commit</span><input type="text" id="gitMsg" maxlength="200" value="${esc(gitMsg())}"></label>
      <label class="sl-chk"><input type="checkbox" id="gitAll" ${GIT.all ? "checked" : ""}> Commit tất cả thay đổi <code>git add -A</code></label></div>
  </section>`;
}
// update the panel in place (keeps focus in the message input)
function gitSync() {
  if (!$("gitp")) return;
  const dirty = anyDirty(), n = GIT.files?.length ?? 0, ahead = GIT.ahead || 0;
  $("gitCmd").textContent = gitCmd(false);
  const st = $("gitSt"), b = $("gitBtn");
  let text, cls = "";
  if (dirty) { text = "Còn thay đổi chưa lưu — bấm Lưu trước"; cls = "warn"; }
  else if (GIT.error) { text = GIT.error; cls = "bad"; }
  else if (GIT.files === null) text = "Đang kiểm tra…";
  else if (n) text = `${n} file thay đổi chưa commit${GIT.all ? " (cả repo)" : ""}`;
  else text = "Không có thay đổi chưa commit.";
  if (!dirty && !GIT.error && ahead) text += ` · ${ahead} commit chưa push`;
  st.textContent = text; st.className = `gitp-st ${cls}`;
  const pushOnly = !n && ahead > 0;
  b.textContent = GIT.busy || (pushOnly ? "Push" : "Commit & Push");
  b.disabled = !!GIT.busy || dirty || !!GIT.error || GIT.files === null || (!n && !pushOnly);
}
async function gitRefresh() {
  if (!GIT_SCOPES[VIEW]) return;
  const seq = ++GIT.seq, p = gitPaths();
  GIT.view = VIEW; GIT.files = null; GIT.error = ""; gitSync();
  try {
    const r = await api("GET", `/api/git/status?paths=${encodeURIComponent(p ? p.join(",") : "all")}`);
    if (seq !== GIT.seq) return;
    Object.assign(GIT, { files: r.files, ahead: r.ahead, branch: r.branch });
  } catch (e) {
    if (seq !== GIT.seq) return;
    // an older server.mjs (started before the git routes existed) answers "Unknown API route"
    GIT.error = /Unknown API route/i.test(e.message)
      ? "Server Studio đang chạy bản cũ — tắt (Ctrl+C) rồi chạy lại node portfolio-studio/server.mjs"
      : `Không đọc được git: ${e.message}`;
  }
  gitSync();
}
const fileList = files => `<ul class="gitp-files">${files.slice(0, 40).map(f => `<li><code>${esc(f.status)}</code>${esc(f.path)}</li>`).join("")}
  ${files.length > 40 ? `<li class="hint">… và ${files.length - 40} file khác</li>` : ""}</ul>`;
async function gitCommitPush() {
  const files = GIT.files || [], msg = gitMsg().trim(), scope = GIT.all ? "all" : VIEW;
  const pushOnly = !files.length && GIT.ahead > 0;
  if (!pushOnly && !msg) return toast("Cần nhập nội dung commit", "err");
  const ok = await confirmDlg(pushOnly ? "Push lên GitHub?" : "Commit & push?", pushOnly
    ? `<p>Đẩy <b>${GIT.ahead}</b> commit đang nằm trên máy lên GitHub (nhánh <code>${esc(GIT.branch)}</code>).</p>`
    : `<p>Commit <b>${files.length}</b> file với nội dung <b>“${esc(msg)}”</b> rồi đẩy lên GitHub (nhánh <code>${esc(GIT.branch)}</code>):</p>${fileList(files)}`,
    pushOnly ? "Push" : "Commit & Push", "pri");
  if (!ok) return;
  const step = t => { GIT.busy = t; gitSync(); };
  try {
    let hash = "", r;
    if (!pushOnly) {
      step("Đang commit…");
      hash = (await api("POST", "/api/git/commit", { scope, message: msg, push: false })).commit;
    }
    step("Đang push…");
    r = await api("POST", "/api/git/push").catch(e => ({ pushed: false, pushError: e.message }));
    if (r.pushed) toast(`${hash ? `Đã commit ${hash} · ` : ""}Đã đẩy lên GitHub`);
    else toast(hash ? `Đã commit ${hash} nhưng push lỗi: ${r.pushError}` : `Push lỗi: ${r.pushError}`, "err");
  } catch (e) { toast(e.message, "err"); }
  GIT.busy = ""; gitRefresh();
}
$("app").addEventListener("input", e => {
  if (e.target.id === "gitMsg") { GIT.msg[GIT.all ? "@all" : VIEW] = e.target.value; gitSync(); }
});
addEventListener("focus", () => { if (!GIT.busy) gitRefresh(); });   // pick up files edited by hand outside the Studio
$("app").addEventListener("change", e => {
  if (e.target.id === "gitAll") { GIT.all = e.target.checked; $("gitMsg").value = gitMsg(); gitRefresh(); }
});

// ══════════════ render + routing ══════════════
function render() {
  const y = scrollY;
  IMG_GROUPS.clear();
  const h = location.hash || "#/settings";
  let m;
  ED = ED && h.startsWith(`#/${ED.kind}/`) ? ED : null;
  if ((m = h.match(/^#\/(projects)\/edit\/([a-z0-9-]+)/)) || (m = h.match(/^#\/(projects)\/(new)$/))) {
    const [, kind, id] = m;
    if (!ED || ED.kind !== kind || (ED.id || "new") !== id) openEditor(kind, id === "new" ? null : id);
    if (!ED) return;
    VIEW = kind;
    $("app").innerHTML = viewItemEditor();
    if (kind === "projects") bindImgs();
  } else if ((m = h.match(/^#\/(projects)$/))) {
    VIEW = m[1]; $("app").innerHTML = viewCollection(VIEW); bindListDnD(VIEW);
  } else if (h === "#/blender" || h === "#/artworks") {
    location.replace(h === "#/blender" ? "#/art3d" : "#/art2d");   // old views: now part of 3D / 2D Artwork
    return;
  } else if ((m = h.match(/^#\/(\w+)$/)) && PAGES[m[1]]) {
    VIEW = m[1]; const P = PG();
    if (!PS[VIEW]) resetPg(P);
    $("app").innerHTML = P.html(); bindImgs();
    if (!PS[VIEW].checked) { PS[VIEW].checked = true; pgCheckFiles(P, PS[VIEW]); }
  } else if (h === "#/ui") {
    VIEW = "ui";
    if (UIF) { $("app").innerHTML = viewUI(); bindUI(); }
    else {
      $("app").innerHTML = `<div class="loading">Đang tải khung giao diện…</div>`;
      loadUI().then(() => { if (VIEW === "ui") render(); }, e => { $("app").innerHTML = `<div class="empty">Không tải được khung giao diện: ${esc(e.message)}</div>`; });
    }
  } else if (h === "#/experience") { VIEW = "experience"; $("app").innerHTML = viewExperience(); }
  else if (h === "#/texts") { VIEW = "texts"; $("app").innerHTML = viewTexts(); bindFilter(); }
  else { VIEW = "settings"; $("app").innerHTML = viewSettings(); }
  $("app").insertAdjacentHTML("beforeend", gitPanel());
  document.querySelectorAll(".side a").forEach(a => a.classList.toggle("on", a.dataset.view === VIEW));
  bindChips();
  if (GIT.view !== VIEW) gitRefresh();
  updateDirty();
  scrollTo(0, y);
  syncPreview();
}
function openEditor(kind, id) {
  const C = S[kind];
  if (id && !C.items[id]) { toast(`Không tìm thấy "${id}"`, "err"); location.hash = `#/${kind}`; return; }
  const orig = id ? C.items[id] : {};
  // open: collapsed state of the detail sections · bust: image cache-busting · delFiles: step images to delete on save
  ED = { kind, id, orig, d: itemToDraft(kind, orig), folder: id || "", open: {}, bust: Date.now(), delFiles: [] };
  ED.saved = edSnap();
  if (kind === "projects" && id) checkStepFiles(ED);
}
// quietly look into each step folder once → flag list entries whose file is missing
async function checkStepFiles(ed) {
  let changed = false;
  await Promise.all(ed.d.progression.map(async st => {
    const f = stepFolder(st); if (!ID_RE.test(f)) return;
    try {
      const r = await api("GET", `/api/projects/${ed.id}/images?dir=${encodeURIComponent(`${PROG_DIR}/${f}`)}`);
      st._files = new Set(r.files.filter(x => x.ok).map(x => x.name));
      if (st.images.some(im => !st._files.has(im.src))) changed = true;
    } catch { /* older server.mjs without the images route */ }
  }));
  if (changed && ED === ed) render();
}
let lastHash = location.hash;
addEventListener("hashchange", () => {
  const leavingEditor = ED && !location.hash.startsWith(`#/${ED.kind}/`);
  const leavingCfg = ["settings", "experience", "texts"].includes(VIEW) && !/^#\/(settings|experience|texts)?$/.test(location.hash);
  const leavingUI = VIEW === "ui" && location.hash !== "#/ui";
  const leavingPg = !!PAGES[VIEW] && location.hash !== `#/${VIEW}`;
  if (((leavingEditor && edDirty()) || (leavingPg && pgDirty(PG())) || (leavingCfg && cfgDirty()) || (leavingUI && uiDirty())) && !confirm("Bạn có thay đổi chưa lưu. Rời trang?")) {
    history.replaceState(null, "", lastHash); return;
  }
  if (leavingEditor) ED = null;
  if (leavingPg) PS[VIEW] = null;                  // re-read (and re-checked) on the next visit
  if (leavingCfg) resetCfg();
  if (leavingUI) UIF = null;                       // re-read from disk on the next visit
  lastHash = location.hash;
  render();
  scrollTo(0, 0);
});
// detail sections (<details>): remember which ones are collapsed; "toggle" does not bubble → capture
$("app").addEventListener("toggle", e => {
  const k = e.target.dataset?.sec, open = PAGES[VIEW] ? PS[VIEW]?.open : ED?.open;
  if (k && open) open[k] = e.target.open;
}, true);
// a file dropped outside a drop zone must not open in the tab (would lose unsaved edits)
["dragover", "drop"].forEach(t => addEventListener(t, e => { if (e.dataTransfer?.types.includes("Files")) e.preventDefault(); }));
addEventListener("beforeunload", e => { if (anyDirty()) { e.preventDefault(); e.returnValue = ""; } });

// ══════════════ events ══════════════
$("app").addEventListener("input", e => {
  const el = e.target, p = el.dataset.path;
  if (el.dataset.uik) return uiInput(el);
  if (!p) return;
  if (p === "@folder") { ED.folder = el.value.trim(); $("folderErr").textContent = ED.folder && !/^[a-z0-9][a-z0-9-]{0,79}$/.test(ED.folder) ? "Tên không hợp lệ" : ""; }
  else setPath(draftOf(), p, el.type === "checkbox" ? el.checked : el.value);
  if (el.dataset.yt !== undefined) {
    const id = parseYT(el.value), box = $("ytp");
    box.style.backgroundImage = id ? `url('${ytThumb(id)}')` : ""; box.textContent = id ? "" : (el.value ? "link không hợp lệ" : "chưa có video");
  }
  if (el.dataset.store !== undefined) el.classList.toggle("bad", badUrl(el.value));
  // progression step id: follows the EN name until edited by hand (only for steps without an image folder yet)
  let m;
  if (el.dataset.stepId !== undefined) { ED.d.progression[+el.dataset.stepId]._auto = false; stepIdSync(+el.dataset.stepId); }
  else if ((m = p.match(/^progression\.(\d+)\.name\.en$/)) && ED) {
    const i = +m[1], st = ED.d.progression[i];
    if (st._auto && !st._folder) {
      st.id = el.value.trim() ? stepSlug(el.value, i) : "";
      const idEl = document.querySelector(`[data-step-id="${i}"]`); if (idEl) idEl.value = st.id;
      stepIdSync(i);
    }
  }
  // 2D section / 3D project id: follows the EN name until edited by hand (only for items without an image folder yet)
  const P = PG();
  if (el.dataset.pgId !== undefined) { pgItems(P)[+el.dataset.pgId]._auto = false; pgIdSync(P, +el.dataset.pgId); }
  else if (P && (m = p.match(/^(\w+)\.(\d+)\.name\.en$/)) && m[1] === P.list) {
    const i = +m[2], s = pgItems(P)[i];
    if (s._auto && !s._folder) {
      s.id = el.value.trim() ? pgSlug(P, el.value, i) : "";
      const idEl = document.querySelector(`[data-pg-id="${i}"]`); if (idEl) idEl.value = s.id;
      pgIdSync(P, i);
    }
  }
  if (el.dataset.yt3 !== undefined) a3YtSync(el);
  if (p.startsWith("social.")) el.closest(".social").classList.toggle("empty", !el.value.trim());
  if (el.tagName === "TEXTAREA" && el.closest(".ktable")) autoGrow(el);
  updateDirty();
});
$("app").addEventListener("change", e => {
  if (e.target.dataset.uik) return uiInput(e.target, true);
  // tidy a typed step id ("Concept Art" → "concept-art")
  if (e.target.dataset.stepId !== undefined) {
    const i = +e.target.dataset.stepId, st = ED.d.progression[i], v = e.target.value.trim() ? slug(e.target.value) : "";
    if (v !== st.id) { st.id = v; e.target.value = v; stepIdSync(i); updateDirty(); }
  }
  if (e.target.dataset.pgId !== undefined) {
    const P = PG(), i = +e.target.dataset.pgId, sc = pgItems(P)[i], v = e.target.value.trim() ? slug(e.target.value) : "";
    if (v !== sc.id) { sc.id = v; e.target.value = v; pgIdSync(P, i); updateDirty(); }
  }
  // 3D video: a pasted link becomes its id
  if (e.target.dataset.yt3 !== undefined) {
    const { id } = ytInfo(e.target.value), path = `${e.target.dataset.yt3}.youtube`;
    if (id && id !== e.target.value) { e.target.value = id; setPath(draftOf(), path, id); updateDirty(); }
  }
  // 2D project moved to another tab → it becomes the last project of that tab
  const mc = VIEW === "art2d" && e.target.dataset.path?.match(/^projects\.(\d+)\.cat$/);
  if (mc) { const list = PS.art2d.d.projects; list.push(...list.splice(+mc[1], 1)); }
  if (e.target.dataset.rerender !== undefined) render();
  // normalize a pasted YouTube link to its id
  if (e.target.dataset.yt !== undefined) { const id = parseYT(e.target.value); if (id) { e.target.value = id; setPath(draftOf(), "video.youtube", id); updateDirty(); } }
});

const listAt = p => getPath(draftOf(), p);
const ACTS = {
  async save() { try { await doSave(); } catch (e) { toast(e.message, "err"); } },
  revert() {
    if (PAGES[VIEW]) { resetPg(PG()); pgCheckFiles(PG(), PS[VIEW]); } else if (VIEW === "ui") resetUI(); else resetCfg();
    render(); toast("Đã hoàn tác");
  },
  seg(el) { setPath(draftOf(), el.dataset.path, el.dataset.v); render(); },
  addRow(el) { listAt(el.dataset.path).push({ en: "", vi: "" }); render(); },
  rmItem(el) { listAt(el.dataset.path).splice(+el.dataset.i, 1); render(); },
  mvItem(el) {
    const arr = listAt(el.dataset.path), i = +el.dataset.i, j = i + +el.dataset.d;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]]; render();
  },
  uiZoom(el) { uiFrame(el.dataset.ui).zoom = el.dataset.z; render(); },
  uiImage(el) { replaceFrameImage(uiFrame(el.dataset.ui)); },
  gitCommit() { gitCommitPush(); },
  async gitCopy() {
    try { await navigator.clipboard.writeText(gitCmd(true)); toast("Đã copy"); } catch { toast("Không copy được — chọn lệnh và copy tay", "err"); }
  },
  addExp() { CFG.d.experience.push({ role: { en: "", vi: "" }, company: "", period: "", points: [{ en: "", vi: "" }] }); render(); },
  async pickImg(el) {
    const [file] = await pickFiles(); if (!file) return;
    try {
      const blob = await compress(file, +el.dataset.max);
      const r = await upload("assets", el.dataset.name, blob);
      setPath(draftOf(), el.dataset.path, r.path); render(); toast("Đã tải ảnh lên — bấm Lưu để cập nhật cấu hình");
    } catch (e) { toast(e.message, "err"); }
  },
  clearImg(el) { setPath(draftOf(), el.dataset.path, ""); render(); },
  // ---- project detail page ----
  async pdImg(el) {
    const key = el.dataset.key, [file] = await pickFiles(); if (!file || !ED?.id) return;
    try {
      const { blob, ext } = await prepImg(file, key === "logo" ? 1024 : key === "thumbnail" ? 1600 : 2400);
      const r = await postFile(`/api/projects/${ED.id}/images?dir=images&name=${key}.${ext}&overwrite=1`, blob);
      ED.d[key] = `images/${r.name}`; ED.bust = Date.now(); render(); gitRefresh();
      toast("Đã tải ảnh lên — bấm Lưu để ghi vào data.json");
    } catch (e) { toast(e.message, "err"); }
  },
  addRole() { ED.d.roles.push(roleDraft()); ED.open.roles = true; render(); },
  addStep() { ED.d.progression.push(stepDraft()); ED.open.progression = true; render(); },
  addChallenge() { ED.d.challenges.push(challengeDraft()); ED.open.challenges = true; render(); },
  addLearned() { ED.d.learned.push(learnedDraft("")); ED.open.learned = true; render(); },
  async rmStep(el) {
    const i = +el.dataset.i, st = ED.d.progression[i];
    if (st.images.length || st._folder) {
      const ok = await confirmDlg("Xoá bước này?", `<p>Xoá bước <b>${esc(st.name.en || st.name.vi || st.id || `#${i + 1}`)}</b> khỏi trang chi tiết.</p>
        <p class="hint">Thư mục ảnh <code>${PROG_DIR}/${esc(stepFolder(st))}/</code> vẫn được giữ trên ổ đĩa (xoá tay nếu không cần).</p>`, "Xoá bước");
      if (!ok) return;
    }
    ED.d.progression.splice(i, 1); render();
  },
  // ---- image lists (imgGroup) ----
  imgUpload(el) { const g = IMG_GROUPS.get(el.dataset.g); if (g) pickFiles("image/*", true).then(files => uploadImgs(g, files)); },
  imgScan(el) { const g = IMG_GROUPS.get(el.dataset.g); if (g) scanImgs(g); },
  imgDropMissing(el) {
    const g = IMG_GROUPS.get(el.dataset.g), files = g?.files(); if (!files) return;
    g.list.splice(0, g.list.length, ...g.list.filter(im => files.has(im.src))); render();
  },
  async rmImg(el) {
    const g = IMG_GROUPS.get(el.dataset.g), j = +el.dataset.j, im = g?.list[j]; if (!im) return;
    const files = g.files(), folder = g.folder(), miss = files && !files.has(im.src);
    if (!miss && g.enabled && folder) {
      const ok = await confirmDlg("Gỡ ảnh khỏi danh sách?", `<p>Gỡ <code>${esc(im.src)}</code> khỏi danh sách ảnh.</p>
        <label class="sl-chk"><input type="checkbox" id="dlgDelFile"> Xoá luôn file trên ổ đĩa (khi bấm Lưu)</label>
        <p class="hint">Mặc định giữ file trong thư mục — bấm “Quét thư mục” để thêm lại.</p>`, "Gỡ ảnh");
      if (!ok) return;
      if ($("dlgDelFile").checked) g.del(folder, im.src);
    }
    g.list.splice(j, 1); render();
  },
  // ---- 2D / 3D Artwork ----
  a2AddCat() { PS.art2d.d.categories.push(a2CatDraft()); render(); },
  a2RmCat(el) {
    const d = PS.art2d.d, c = d.categories[+el.dataset.i];
    if (d.projects.some(p => p.cat === c._k)) return toast("Tab còn dự án — chuyển dự án sang tab khác hoặc xoá chúng trước", "err");
    d.categories.splice(+el.dataset.i, 1); render();
  },
  a2AddProj(el) { const s = a2ProjDraft(); s.cat = el.dataset.k; PS.art2d.d.projects.push(s); PS.art2d.open[pgKey(s)] = true; render(); },
  pgAdd() { const P = PG(), s = P.item(); pgItems(P).push(s); PS[VIEW].open[pgKey(s)] = true; render(); },
  async pgRm(el) {
    const P = PG(), i = +el.dataset.i, s = pgItems(P)[i], n = P.used(s).size;
    const ok = await confirmDlg(`Xoá ${P.noun} này?`, `<p>Xoá ${P.noun} <b>${esc(s.name.en || s.name.vi || s.id || `#${i + 1}`)}</b>${n ? ` (${n} ảnh${s.steps?.length ? `, ${s.steps.length} bước` : ""})` : ""} khỏi trang ${P.title}.</p>
      ${pgFolder(s) ? `<p class="hint">Thư mục ảnh <code>${P.dir}/images/${esc(pgFolder(s))}/</code> vẫn được giữ trên ổ đĩa (xoá tay nếu không cần).</p>` : ""}`, `Xoá ${P.noun}`);
    if (!ok) return;
    pgItems(P).splice(i, 1); render();
  },
  pgAddStep(el) { const P = PG(), s = pgItems(P)[+el.dataset.i]; s.steps.push(P.step()); PS[VIEW].open[pgKey(s)] = true; render(); },
  async pgRmStep(el) {
    const steps = listAt(el.dataset.path), k = +el.dataset.i, st = steps[k];
    if (st.images.length && !(await confirmDlg("Xoá bước này?", `<p>Xoá bước <b>${esc(st.title.en || st.title.vi || `#${k + 1}`)}</b> (${st.images.length} ảnh).</p>
      <p class="hint">File ảnh vẫn nằm trong thư mục — bấm “Quét thư mục” để thêm lại.</p>`, "Xoá bước"))) return;
    steps.splice(k, 1); render();
  },
  a3AddVideo(el) { pgItems(PAGES.art3d)[+el.dataset.i].final.videos.push(a3VideoDraft()); render(); },
  async addIndex(el) { const C = S[VIEW]; await saveOrder(VIEW, [...C.order, el.dataset.id]); },
  async delItem(el) {
    const id = el.dataset.id, K = KINDS[VIEW], p = S[VIEW].items[id];
    const ok = await confirmDlg(`Xoá ${K.noun}?`, `<p>Sẽ xoá vĩnh viễn thư mục <code>Database/${K.dir}/${esc(id)}/</code> và gỡ khỏi <code>index.json</code>.</p>
      <p><b>${esc(p?.title || id)}</b></p><p class="hint">Nếu đã commit trước đó, vẫn khôi phục được bằng git.</p>`);
    if (!ok) return;
    try { await api("DELETE", `/api/${VIEW}/${id}`); await load(); render(); reloadPreview(); toast("Đã xoá"); gitRefresh(); } catch (e) { toast(e.message, "err"); }
  },
};
$("app").addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (el && ACTS[el.dataset.act]) { e.preventDefault(); ACTS[el.dataset.act](el); }
});
document.addEventListener("keydown", e => {
  if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); if (!$("saveBtn")?.disabled) ACTS.save(); }
});

async function doSave() {
  if (PAGES[VIEW]) {
    const P = PG();
    if (!(await pgSave(P))) return;
    PS[VIEW].checked = true; pgCheckFiles(P, PS[VIEW]);
  } else if (VIEW === "ui") {
    for (const f of UIF.filter(x => uiSnap(x) !== x.saved)) {
      const r = await api("PUT", `/api/ui/${f.name}`, { config: { ...f.d, version: Date.now() } });
      f.d = uiToDraft(r.config); f.saved = uiSnap(f);
    }
  } else if (ED) {
    const kind = ED.kind;
    if (kind === "projects" && !ED.d.title.trim()) throw new Error("Cần nhập tên dự án");
    const badStore = kind === "projects" && STORES.find(([k]) => badUrl(ED.d.stores[k]));
    if (badStore) throw new Error(`Link ${badStore[1]} phải bắt đầu bằng http:// hoặc https://`);
    const folder = ED.folder || slug(ED.d.title) || `${kind}-${Date.now().toString(36)}`;
    if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(folder)) throw new Error("Tên thư mục không hợp lệ");
    if (kind === "projects" && !(await prepSteps())) return;
    const data = draftToItem(kind, ED.d, ED.orig);
    const r = ED.id ? await api("PUT", `/api/${kind}/${ED.id}`, { data, newId: folder })
                    : await api("POST", `/api/${kind}`, { id: folder, data });
    await load();
    ED = null;
    toast("Đã lưu"); gitRefresh();
    location.hash = `#/${kind}/edit/${r.id}`;
    if (location.hash === lastHash) render();
    reloadPreview();
    return;
  } else {
    await api("PUT", "/api/config", { config: draftToCfg(CFG.d) });
    S.config = draftToCfg(CFG.d); resetCfg();
  }
  render(); reloadPreview(); toast("Đã lưu"); gitRefresh();
}

// ---- tags (chips): Enter to add, drag to reorder ----
function bindChips() {
  document.querySelectorAll("[data-chip-input]").forEach(inpEl => {
    inpEl.addEventListener("keydown", e => {
      if (e.key !== "Enter" && e.key !== ",") return;
      e.preventDefault();
      const v = inpEl.value.trim(); if (!v) return;
      getPath(draftOf(), inpEl.dataset.chipInput).push(v);
      render();
      document.querySelector(`[data-chip-input="${inpEl.dataset.chipInput}"]`)?.focus();
    });
  });
  document.querySelectorAll("[data-chips]").forEach(box => {
    let from = -1;
    box.addEventListener("dragstart", e => { const c = e.target.closest(".chip"); if (c) { from = +c.dataset.i; c.classList.add("drag"); } });
    box.addEventListener("dragover", e => { if (from >= 0) e.preventDefault(); });
    box.addEventListener("drop", e => {
      e.preventDefault();
      const c = e.target.closest(".chip"); if (!c || from < 0) return;
      const arr = getPath(draftOf(), box.dataset.chips), [x] = arr.splice(from, 1);
      arr.splice(+c.dataset.i, 0, x); from = -1; render();
    });
  });
}

// ---- collection order (drag & drop) ----
async function saveOrder(kind, order) {
  try { await api("PUT", `/api/order/${kind}`, { order }); S[kind].order = order; render(); reloadPreview(); toast("Đã lưu thứ tự"); gitRefresh(); }
  catch (e) { toast(e.message, "err"); }
}
function bindListDnD(kind) {
  const list = $("plist"); if (!list) return;
  let dragId = null;
  list.addEventListener("dragstart", e => { const r = e.target.closest(".prow"); if (!r) return; dragId = r.dataset.id; r.classList.add("drag"); });
  list.addEventListener("dragend", e => e.target.closest(".prow")?.classList.remove("drag"));
  list.addEventListener("dragover", e => {
    const r = e.target.closest(".prow"); if (!r || !dragId) return;
    e.preventDefault(); list.querySelectorAll(".over").forEach(x => x.classList.remove("over")); r.classList.add("over");
  });
  list.addEventListener("drop", e => {
    e.preventDefault();
    const r = e.target.closest(".prow"), C = S[kind]; if (!r || !dragId || r.dataset.id === dragId) return;
    const order = C.order.filter(x => x !== dragId);
    order.splice(order.indexOf(r.dataset.id) + (C.order.indexOf(dragId) < C.order.indexOf(r.dataset.id) ? 1 : 0), 0, dragId);
    dragId = null; saveOrder(kind, order);
  });
}

// ---- project detail: progression step images ----
// resize to ≤ max px; PNG / WebP with real transparency stay PNG, everything else → JPG
async function prepImg(file, max = 2400) {
  if (file.type === "image/gif") return { blob: file, ext: "gif" };
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  const g = c.getContext("2d", { willReadFrequently: true });
  g.drawImage(bmp, 0, 0, c.width, c.height);
  let alpha = false;
  if (/png|webp/.test(file.type)) {
    const px = g.getImageData(0, 0, c.width, c.height).data;
    for (let i = 3; i < px.length; i += 4) if (px[i] < 255) { alpha = true; break; }
  }
  if (alpha) return { blob: await new Promise(r => c.toBlob(r, "image/png")), ext: "png" };
  g.globalCompositeOperation = "destination-over"; g.fillStyle = "#000"; g.fillRect(0, 0, c.width, c.height);
  return { blob: await new Promise(r => c.toBlob(r, "image/jpeg", 0.88)), ext: "jpg" };
}
const stepDirQ = f => `dir=${encodeURIComponent(`${PROG_DIR}/${f}`)}`;
// refresh the id error + folder path of one step without re-rendering (keeps focus)
function stepIdSync(i) {
  const err = stepIdErr(i), e = document.querySelector(`[data-step-err="${i}"]`), p = document.querySelector(`[data-img-path="p${i}"]`);
  if (e) e.textContent = err;
  document.querySelector(`[data-step-id="${i}"]`)?.classList.toggle("bad", !!err);
  if (p) p.innerHTML = stepPathHTML(i);
}
// the step needs a valid id (= folder name) before files can go into its folder
function stepReady(i) {
  const st = ED.d.progression[i];
  if (!ED.id) { toast("Lưu dự án trước rồi mới tải ảnh lên", "err"); return ""; }
  if (st._folder) return st._folder;
  if (!st.id.trim()) { toast("Nhập id cho bước trước (id = tên thư mục ảnh)", "err"); return ""; }
  const err = stepIdErr(i); if (err) { toast(`Id bước: ${err}`, "err"); return ""; }
  return st.id.trim();
}
// upload into the group's folder (resized, PNG transparency kept), append to its list
async function uploadImgs(g, files) {
  files = files.filter(f => f.type.startsWith("image/"));
  const folder = files.length && g.ready(); if (!folder) return;
  let n = 0;
  for (const f of files) {
    toast(`Đang tải ảnh ${n + 1}/${files.length}…`);
    try {
      const { blob, ext } = await prepImg(f);
      const base = slug(f.name.replace(/\.[^.]+$/, "")).slice(0, 80) || "image";
      const r = await postFile(`${g.api(folder)}&name=${base}.${ext}`, blob);
      g.list.push(stepImgDraft(r.name)); g.files()?.add(r.name); n++;
    } catch (e) { toast(`${f.name}: ${e.message}`, "err"); break; }
  }
  if (n) g.done(folder);
  if (g.alive()) render();
  gitRefresh();
  if (n === files.length) toast(`Đã tải ${n} ảnh vào ${g.dirName(folder)} — bấm Lưu để ghi danh sách vào data.json`);
}
// add files found in the folder that no list of that folder uses yet (sorted by name) + flag list entries whose file is gone
async function scanImgs(g) {
  const folder = g.ready(); if (!folder) return;
  try {
    const r = await api("GET", g.api(folder));
    if (!r.exists) {
      g.setFiles(new Set()); render();
      return toast(`Chưa có thư mục ${g.dirName(folder)} — tạo thư mục đó, chép ảnh vào rồi quét lại`, "err");
    }
    const ok = r.files.filter(f => f.ok).map(f => f.name), bad = r.files.filter(f => !f.ok).map(f => f.name);
    const used = g.used(), add = ok.filter(nm => !used.has(nm));
    add.forEach(nm => g.list.push(stepImgDraft(nm)));
    g.setFiles(new Set(ok)); g.done(folder);
    const files = g.files(), miss = g.list.filter(im => !files.has(im.src)).length;
    render();
    const msg = [add.length ? `Thêm ${add.length} ảnh mới` : "Không có ảnh mới", miss ? `${miss} ảnh thiếu file` : "",
      bad.length ? `bỏ qua ${bad.length} file có tên không hợp lệ (${bad.slice(0, 3).join(", ")}${bad.length > 3 ? "…" : ""}) — đổi tên thành chữ không dấu, số, - _ rồi quét lại` : ""].filter(Boolean).join(" · ");
    toast(msg, miss || bad.length ? "err" : "ok");
  } catch (e) { toast(e.message, "err"); }
}
// drag tiles to reorder inside one list; drop files from the computer to upload
function bindImgs() {
  document.querySelectorAll("[data-imgs]").forEach(box => {
    const g = IMG_GROUPS.get(box.dataset.imgs); let from = -1;
    if (!g) return;
    box.addEventListener("dragstart", e => { const t = e.target.closest(".pimg"); if (t) { from = +t.dataset.j; t.classList.add("drag"); e.dataTransfer.effectAllowed = "move"; } });
    box.addEventListener("dragend", e => { from = -1; e.target.closest(".pimg")?.classList.remove("drag"); box.classList.remove("over"); });
    box.addEventListener("dragover", e => {
      if (from < 0 && !e.dataTransfer.types.includes("Files")) return;
      e.preventDefault(); box.classList.add("over");
    });
    box.addEventListener("dragleave", e => { if (!box.contains(e.relatedTarget)) box.classList.remove("over"); });
    box.addEventListener("drop", e => {
      e.preventDefault(); box.classList.remove("over");
      if (from < 0) { if (e.dataTransfer.files.length) uploadImgs(g, [...e.dataTransfer.files]); return; }
      const arr = g.list, t = e.target.closest(".pimg");
      const to = t ? +t.dataset.j : arr.length - 1, [x] = arr.splice(from, 1);
      arr.splice(to, 0, x); from = -1; render();
    });
  });
}
// before writing data.json: fill empty step ids, delete files the owner chose to delete, rename step folders whose id changed
async function prepSteps() {
  const steps = ED.d.progression;
  steps.forEach((st, i) => { if (!st.id.trim()) st.id = stepSlug(st.name.en || st.name.vi || `step-${i + 1}`, i); });
  steps.forEach((st, i) => { const err = stepIdErr(i); if (err) throw new Error(`Bước #${i + 1} (${st.id}): ${err}`); });
  if (!ED.id) return true;
  const ren = steps.filter(st => st._folder && st._folder !== st.id.trim());
  const folders = new Set(steps.map(st => st._folder).filter(Boolean));
  const cross = ren.find(st => folders.has(st.id.trim()));
  if (cross) throw new Error(`Id "${cross.id}" đang là thư mục ảnh của bước khác — đổi id lần lượt từng bước (Lưu sau mỗi lần)`);
  if (ren.length && !(await confirmDlg("Đổi tên thư mục ảnh?", `<p>Id bước đã đổi nên thư mục ảnh sẽ được đổi tên theo:</p>
      <ul class="gitp-files">${ren.map(st => `<li><code>${esc(st._folder)}/</code> → <code>${esc(st.id)}/</code></li>`).join("")}</ul>
      <p class="hint">Trong <code>Database/Projects/${esc(ED.id)}/${PROG_DIR}/</code></p>`, "Đổi tên & Lưu", "pri"))) return false;
  for (const f of ED.delFiles) {
    if (steps.some(st => stepFolder(st) === f.folder && st.images.some(im => im.src === f.name))) continue;   // added back
    await api("DELETE", `/api/projects/${ED.id}/images?${stepDirQ(f.folder)}&name=${encodeURIComponent(f.name)}`);
  }
  ED.delFiles = [];
  for (const st of ren) {
    await api("POST", `/api/projects/${ED.id}/rename-step`, { from: st._folder, to: st.id.trim() });
    st._folder = st.id.trim();
  }
  return true;
}

// ---- texts filter / autogrow ----
function autoGrow(t) { t.style.height = "auto"; t.style.height = `${t.scrollHeight + 2}px`; }
function bindFilter() {
  document.querySelectorAll(".ktable textarea").forEach(autoGrow);
  $("kFilter").addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll(".krow").forEach(r => { r.hidden = q && !r.textContent.toLowerCase().includes(q) && ![...r.querySelectorAll("textarea")].some(t => t.value.toLowerCase().includes(q)); });
  });
}

// ══════════════ preview ══════════════
// home page section (#id) or another page (*.html) shown in the preview
const PV_SECTION = { settings: "", experience: "#about", texts: "", projects: "#featured", art2d: "art2d.html", art3d: "art3d.html", graphic: "graphic-design.html", ui: "#featured" };
let pvOn = false, pvSection = null;
function reloadPreview() {
  if (!pvOn) return;
  const s = PV_SECTION[VIEW] ?? "";
  $("pvFrame").src = s.endsWith(".html") ? `/${s}?t=${Date.now()}` : `/?nointro&t=${Date.now()}${s}`;
}
function syncPreview() { if (pvOn && pvSection !== PV_SECTION[VIEW]) { pvSection = PV_SECTION[VIEW]; reloadPreview(); } }
$("pvToggle").addEventListener("click", () => {
  pvOn = !pvOn;
  $("preview").hidden = !pvOn;
  $("layout").classList.toggle("pv", pvOn);
  $("pvToggle").textContent = pvOn ? "Đóng xem trước ◂" : "Xem trước ▸";
  pvSection = null; syncPreview();
});
$("pvReload").addEventListener("click", reloadPreview);
$("pvSize").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  $("pvSize").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
  $("pvFrame").style.width = b.dataset.w ? `${b.dataset.w}px` : "100%";
});

// ══════════════ boot ══════════════
load().then(() => { resetCfg(); render(); }).catch(() => {
  $("srv").classList.add("off");
  $("srv").lastElementChild.textContent = "offline";
  $("app").innerHTML = `<div class="empty"><h3 style="color:var(--bright);margin-bottom:8px">Chưa chạy server Studio</h3>
    Mở terminal tại thư mục dự án và chạy:<br><br><code style="font-size:.95rem">node portfolio-studio/server.mjs</code><br><br>
    rồi mở <code>http://localhost:4100/portfolio-studio/</code></div>`;
});
