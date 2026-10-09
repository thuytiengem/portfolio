// Portfolio Studio — UI. Talks to portfolio-studio/server.mjs; every write sends the X-Studio header.

const SOCIALS = [
  ["whatsapp", "WhatsApp", "https://wa.me/84…"], ["instagram", "Instagram", "https://instagram.com/…"],
  ["linkedin", "LinkedIn", "https://linkedin.com/in/…"], ["bluesky", "Bluesky", "https://bsky.app/profile/…"],
  ["x", "X", "https://x.com/…"], ["behance", "Behance", "https://behance.net/…"], ["youtube", "YouTube", "https://youtube.com/@…"],
  ["itchio", "itch.io", "https://….itch.io"], ["discord", "Discord", "https://discord.gg/…"],
];
const KINDS = {
  projects: { title: "Featured Projects", noun: "dự án", dir: "Projects", section: "#featured" },
  blender: { title: "3D Blender", noun: "video", dir: "Blender", section: "#blender" },
};
// short explanations for the UI text keys in web-config.json → i18n
const KEY_HINTS = {
  nav_home: "Menu: Home", nav_portfolio: "Menu: Portfolio", nav_about: "Menu: About me", nav_contact: "Menu: Contact",
  featured_title: "Tiêu đề section dự án", blender_title: "Tiêu đề section Blender", artworks_title: "Tiêu đề section artworks", about_title: "Tiêu đề section About",
  description: "Nhãn khung mô tả", responsibilities: "Nhãn khung trách nhiệm", explore: "Chữ trên nút Explore",
  other_title: "Tiêu đề khối dự án khác", other_text: "Mô tả khối dự án khác (<br> = xuống dòng)",
  profile_suffix: "Chữ sau tên ở About", photo: "Chữ khi chưa có ảnh", experience_title: "Tiêu đề kinh nghiệm",
  talk_title: "Tiêu đề footer", talk_text: "Đoạn giới thiệu footer (<br> = xuống dòng)", my_email: "Nhãn email", my_phone: "Nhãn số điện thoại",
  form_name: "Nhãn ô tên", form_email: "Nhãn ô email", form_message: "Nhãn ô lời nhắn", form_send: "Chữ nút gửi form",
  mail_subject: "Tiêu đề mail ({name}, {email})", mail_body: "Nội dung mail ({message}, {name}, {email})", copyright: "Dòng bản quyền",
};

// ══════════════ helpers ══════════════
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clone = o => JSON.parse(JSON.stringify(o ?? null));
const slug = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
const L = v => v && typeof v === "object" && !Array.isArray(v) ? { en: v.en ?? "", vi: v.vi ?? "" } : { en: v ?? "", vi: "" };
const parseYT = v => {
  v = String(v || "").trim();
  const m = v.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/);
  return m ? m[1] : /^[\w-]{11}$/.test(v) ? v : "";
};
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
async function upload(target, name, blob) {
  const r = await fetch(`/api/upload?target=${target}&name=${encodeURIComponent(name)}`, { method: "POST", headers: { "X-Studio": "1" }, body: blob });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "Upload thất bại");
  return j;
}
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
function confirmDlg(title, html, yes = "Xoá") {
  return new Promise(resolve => {
    $("dlgT").textContent = title; $("dlgB").innerHTML = html; $("dlgYes").textContent = yes;
    $("dlg").hidden = false; $("dlgNo").focus();
    const done = v => { $("dlg").hidden = true; $("dlgYes").onclick = $("dlgNo").onclick = null; resolve(v); };
    $("dlgYes").onclick = () => done(true); $("dlgNo").onclick = () => done(false);
  });
}

// ══════════════ state ══════════════
const S = { config: {}, projects: null, blender: null, artworks: [] };
let CFG = null;   // shared draft for the 3 config views: { d, saved }
let ED = null;    // collection item editor: { kind, id, orig, d, folder, saved }
let ART = null;   // artworks draft: { d, saved, removed }
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
function itemToDraft(kind, o = {}) {
  return {
    title: o.title || "",
    tagline: L(o.tagline),
    tags: (o.tags || []).map(t => typeof t === "object" ? (t.en || t.vi || "") : String(t)),
    video: { youtube: o.video?.youtube || "", orientation: o.video?.orientation === "portrait" ? "portrait" : "landscape" },
    description: kind === "projects" ? pairs(o.description) : L(o.description),
    responsibilities: pairs(o.responsibilities),
    exploreUrl: o.exploreUrl || "",
  };
}
function draftToItem(kind, d, orig = {}) {
  const s = v => (String(v ?? "").trim() || undefined);
  const l = x => (x.en.trim() || x.vi.trim() ? { en: x.en.trim(), vi: x.vi.trim() } : undefined);
  const list = rows => { const u = unpairs(rows); return u.en.length || u.vi.length ? u : undefined; };
  const known = kind === "projects" ? {
    title: d.title.trim(), tagline: l(d.tagline), tags: d.tags.length ? d.tags : undefined,
    video: s(d.video.youtube) ? { youtube: d.video.youtube.trim(), orientation: d.video.orientation } : undefined,
    description: list(d.description), responsibilities: list(d.responsibilities), exploreUrl: d.exploreUrl.trim(),
  } : {
    title: s(d.title), tags: d.tags.length ? d.tags : undefined,
    video: s(d.video.youtube) ? { youtube: d.video.youtube.trim(), orientation: d.video.orientation } : undefined,
    description: l(d.description), exploreUrl: d.exploreUrl.trim(),
  };
  const out = {};
  Object.entries(known).forEach(([k, v]) => { if (v !== undefined) out[k] = v; });
  Object.keys(orig).forEach(k => { if (!(k in known)) out[k] = orig[k]; });   // keep fields the Studio doesn't know
  return out;
}
const edSnap = () => JSON.stringify([draftToItem(ED.kind, ED.d, ED.orig), ED.folder]);
const edDirty = () => ED && edSnap() !== ED.saved;

// ---- artworks ----
const artToDraft = list => (list || []).map(a => ({ src: a.src || "", title: L(a.title), desc: L(a.desc) }));
const artSnap = () => JSON.stringify(ART.d);
const artDirty = () => ART && artSnap() !== ART.saved;
function resetArt() { ART = { d: artToDraft(S.artworks), removed: new Set() }; ART.saved = artSnap(); }

const anyDirty = () => cfgDirty() || edDirty() || artDirty();
function updateDirty() {
  const d = VIEW === "artworks" ? artDirty() : ED ? edDirty() : cfgDirty();
  const el = $("dirtyFlag"); if (el) el.hidden = !d;
  const b = $("saveBtn"); if (b) b.disabled = !d;
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
function bullets(path, label) {
  const rows = val(path) || [];
  return `<div class="f"><span class="lbl">${label} <code>EN | VI — mỗi dòng là một gạch đầu dòng</code></span>
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
function itemHead(listPath, i, n, label) {
  return `<div class="item-h"><b>${label}</b>
    <button class="icon-btn" type="button" data-act="mvItem" data-path="${listPath}" data-i="${i}" data-d="-1" ${i ? "" : "disabled"} title="Lên">↑</button>
    <button class="icon-btn" type="button" data-act="mvItem" data-path="${listPath}" data-i="${i}" data-d="1" ${i < n - 1 ? "" : "disabled"} title="Xuống">↓</button>
    <button class="icon-btn del" type="button" data-act="rmItem" data-path="${listPath}" data-i="${i}" title="Xoá">✕</button></div>`;
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
    sec("Intro", `
      ${imgPick("intro.heroImage", "Ảnh hero (tấm kính bị vỡ ở intro)", { name: "hero.jpg", hint: "Ảnh được ghi đè ngay vào <code>assets/images/hero.jpg</code> khi chọn." })}
      <div class="grid2">${inp("intro.brand", "Dòng chữ nhỏ phía trên", { key: "intro.brand" })}${inp("intro.title", "Tiêu đề lớn", { key: "intro.title" })}</div>
      ${bi("intro.quote", "Câu chào dưới tiêu đề", { area: true, key: "intro.quote" })}`) +
    sec("Hồ sơ (About me)", `
      ${imgPick("profile.photo", "Ảnh chân dung", { name: "profile.jpg", max: 1400, square: true, hint: "Để trống thì hiện khung PHOTO." })}
      <div class="grid3">${inp("profile.name", "Họ tên (topbar + About)")}${inp("profile.email", "Email (nhận mail từ form)", { type: "email" })}${inp("profile.phone", "Số điện thoại")}</div>
      ${bi("profile.role", "Chức danh trong khung profile")}
      ${bullets("profile.summary", "Nội dung khung profile")}`) +
    sec("Mạng xã hội", SOCIALS.map(([k, name, ph]) => `<div class="social${CFG.d.social[k] ? "" : " empty"}">
        <span class="ico"><img src="../assets/icons/${k}.svg" alt=""></span><b>${name}</b>
        <input type="url" data-path="social.${k}" value="${esc(CFG.d.social[k])}" placeholder="${ph}"></div>`).join(""), "để trống = không hiện trên trang") +
    sec("Liên kết nút Explore", `<div class="grid3">
      ${inp("links.otherProjects", "Khối “Other game projects”", { ph: "#" })}${inp("links.artworks", "Section Artworks", { ph: "#" })}${inp("links.about", "Section About", { ph: "#" })}</div>
      <span class="hint">Nút Explore của từng dự án / video Blender chỉnh trong trang của mục đó.</span>`) +
    sec("Khác", `<div class="grid2">
      ${inp("background.rainWord", "Chữ của hiệu ứng mưa chữ", { key: "background.rainWord" })}
      <div class="f"><label>Ngôn ngữ mặc định</label>${seg("site.defaultLang", [["en", "English"], ["vi", "Tiếng Việt"]])}</div></div>
      ${bi("site.pageTitle", "Tiêu đề tab trình duyệt")}`);
}

function viewExperience() {
  draftOf = () => CFG.d;
  const list = CFG.d.experience;
  return saveBar("Kinh nghiệm làm việc", "Timeline trong section About me.") +
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
      <div class="k"><code>${esc(k)}</code><span>${esc(KEY_HINTS[k] || "")}</span></div>
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
    return `<li class="prow${broken ? " broken" : ""}" data-id="${id}"${listed ? ' draggable="true"' : ""}>
      ${listed ? `<span class="handle" title="Kéo để sắp xếp">⠿</span><span class="num">${String(i + 1).padStart(2, "0")}</span>` : "<span></span><span></span>"}
      <div class="thumb">${yt ? `<img src="${ytThumb(yt)}" alt="">` : "—"}</div>
      <div class="t"><b>${esc(broken ? id : p.title || "(không tiêu đề)")}</b><span>${esc(broken || `Database/${K.dir}/${id}`)}</span></div>
      <div class="badges">${yt ? `<span class="bdg c">▶ YouTube${p.video.orientation === "portrait" ? " · dọc" : ""}</span>` : `<span class="bdg r">chưa có video</span>`}
        ${(p?.tags || []).length ? `<span class="bdg">${p.tags.length} tag</span>` : ""}</div>
      <div class="row-acts">
        ${listed ? "" : `<button class="btn ghost sm" type="button" data-act="addIndex" data-id="${id}">Thêm vào danh sách</button>`}
        ${broken ? "" : `<a class="btn ghost sm" href="#/${kind}/edit/${id}">Sửa</a>`}
        <button class="icon-btn del" type="button" data-act="delItem" data-id="${id}" title="Xoá">🗑</button></div></li>`;
  };
  return `<div class="ph"><div><h1>${K.title} <span style="color:var(--dim);font-size:.6em">(${ids.length})</span></h1>
      <p>Kéo <b>⠿</b> để đổi thứ tự hiển thị — thứ tự được lưu ngay vào <code>Database/${K.dir}/index.json</code>.</p></div>
      <div class="acts"><a class="btn pri" href="#/${kind}/new">+ Thêm ${K.noun}</a></div></div>
    ${ids.length ? `<ul class="plist" id="plist">${ids.map((id, i) => row(id, i, true)).join("")}</ul>` : `<div class="empty">Chưa có ${K.noun} nào.</div>`}
    ${orphans.length ? `<h3 style="margin:24px 0 10px;color:var(--gold);font-size:.9rem">Thư mục chưa có trong index.json (không hiện trên trang)</h3><ul class="plist">${orphans.map(id => row(id, -1, false)).join("")}</ul>` : ""}`;
}

function viewItemEditor() {
  draftOf = () => ED.d;
  const kind = ED.kind, K = KINDS[kind], d = ED.d;
  const yt = parseYT(d.video.youtube);
  const common = `
    ${chips("tags", "Tag vai trò", "Kéo để đổi thứ tự.")}
    <div class="f"><span class="lbl">Video YouTube</span><div class="yt">
      <div style="display:grid;gap:8px"><input type="text" data-path="video.youtube" data-yt value="${esc(d.video.youtube)}" placeholder="Dán link YouTube / Shorts hoặc ID">
        <div style="display:flex;gap:10px;align-items:center">${seg("video.orientation", [["landscape", "Ngang 16:9"], ["portrait", "Dọc 9:16 (Shorts)"]])}
        <span class="hint">Video dọc sẽ tự đổi bố cục.</span></div></div>
      <div class="ytp" id="ytp" style="${yt ? `background-image:url('${ytThumb(yt)}')` : ""}">${yt ? "" : "chưa có video"}</div></div></div>`;
  const fields = kind === "projects" ? `
      ${inp("title", "Tên dự án *")}
      ${bi("tagline", "Dòng mô tả ngắn dưới tên")}
      ${common}
      ${bullets("description", "Description")}
      ${bullets("responsibilities", "Responsibilities")}` : `
      ${inp("title", "Tiêu đề (không bắt buộc)", { hint: "Để trống như bản thiết kế." })}
      ${common}
      ${bi("description", "Đoạn mô tả dưới video", { area: true, rows: 3 })}`;
  return `<div class="ph"><div><h1>${ED.id ? "Sửa" : "Thêm"} ${K.noun}</h1><p><a class="lnk" href="#/${kind}">← ${K.title}</a></p></div></div>
    <div class="savebar"><div></div><div style="display:flex;gap:10px;align-items:center"><span class="dirty" id="dirtyFlag" hidden>● Chưa lưu</span>
      <a class="btn ghost" href="#/${kind}">Huỷ</a><button class="btn pri" id="saveBtn" type="button" data-act="save" ${ED.id ? "disabled" : ""}>Lưu</button></div></div>
    ${sec("Nội dung", fields)}
    ${sec("Khác", `<div class="grid2">
      <div class="f"><label>Tên thư mục <code>Database/${K.dir}/…</code></label><input type="text" data-path="@folder" value="${esc(ED.folder)}" placeholder="vd: fashion-star">
        <span class="hint">Chữ thường, số, dấu gạch ngang. Tự tạo từ tên nếu để trống.</span><span class="err" id="folderErr"></span></div>
      ${inp("exploreUrl", "Link nút Explore", { ph: "# (để sau)" })}</div>`)}`;
}

function viewArtworks() {
  draftOf = () => ART.d;
  const list = ART.d;
  return saveBar("Personal Artworks", "Ảnh trong carousel. Ảnh mới được nén thành JPG (tối đa 2400px) và lưu vào <code>Database/Artworks/images/</code>.",
    `<button class="btn ghost" type="button" data-act="addArt">+ Thêm ảnh</button>`) +
    `<div class="agrid">${list.map((a, i) => `<div class="acard">
      <div class="img" style="background-image:url('${esc(`/Database/Artworks/${a.src}`)}')"><span>${String(i + 1).padStart(2, "0")}</span></div>
      ${itemHead("@art", i, list.length, esc(a.title.en || a.title.vi || a.src.split("/").pop()))}
      <div class="body">${bi(`${i}.title`, "Tiêu đề")}${bi(`${i}.desc`, "Mô tả", { area: true })}
        <button class="btn ghost sm" type="button" data-act="replaceArt" data-i="${i}">Đổi ảnh…</button></div></div>`).join("")}
      <div class="drop" id="drop" data-act="addArt">Kéo thả ảnh vào đây<br>hoặc bấm để chọn (chọn được nhiều ảnh)</div></div>`;
}

// ══════════════ render + routing ══════════════
function render() {
  const y = scrollY;
  const h = location.hash || "#/settings";
  let m;
  ED = ED && h.startsWith(`#/${ED.kind}/`) ? ED : null;
  if ((m = h.match(/^#\/(projects|blender)\/edit\/([a-z0-9-]+)/)) || (m = h.match(/^#\/(projects|blender)\/(new)$/))) {
    const [, kind, id] = m;
    if (!ED || ED.kind !== kind || (ED.id || "new") !== id) openEditor(kind, id === "new" ? null : id);
    if (!ED) return;
    VIEW = kind;
    $("app").innerHTML = viewItemEditor();
  } else if ((m = h.match(/^#\/(projects|blender)$/))) {
    VIEW = m[1]; $("app").innerHTML = viewCollection(VIEW); bindListDnD(VIEW);
  } else if (h === "#/artworks") {
    VIEW = "artworks"; if (!ART) resetArt(); $("app").innerHTML = viewArtworks(); bindDrop();
  } else if (h === "#/experience") { VIEW = "experience"; $("app").innerHTML = viewExperience(); }
  else if (h === "#/texts") { VIEW = "texts"; $("app").innerHTML = viewTexts(); bindFilter(); }
  else { VIEW = "settings"; $("app").innerHTML = viewSettings(); }
  document.querySelectorAll(".side a").forEach(a => a.classList.toggle("on", a.dataset.view === VIEW));
  bindChips();
  updateDirty();
  scrollTo(0, y);
  syncPreview();
}
function openEditor(kind, id) {
  const C = S[kind];
  if (id && !C.items[id]) { toast(`Không tìm thấy "${id}"`, "err"); location.hash = `#/${kind}`; return; }
  const orig = id ? C.items[id] : {};
  ED = { kind, id, orig, d: itemToDraft(kind, orig), folder: id || "" };
  ED.saved = edSnap();
}
let lastHash = location.hash;
addEventListener("hashchange", () => {
  const leavingEditor = ED && !location.hash.startsWith(`#/${ED.kind}/`);
  const leavingArt = VIEW === "artworks" && location.hash !== "#/artworks";
  const leavingCfg = ["settings", "experience", "texts"].includes(VIEW) && !/^#\/(settings|experience|texts)?$/.test(location.hash);
  if (((leavingEditor && edDirty()) || (leavingArt && artDirty()) || (leavingCfg && cfgDirty())) && !confirm("Bạn có thay đổi chưa lưu. Rời trang?")) {
    history.replaceState(null, "", lastHash); return;
  }
  if (leavingEditor) ED = null;
  if (leavingArt) resetArt();
  if (leavingCfg) resetCfg();
  lastHash = location.hash;
  render();
  scrollTo(0, 0);
});
addEventListener("beforeunload", e => { if (anyDirty()) { e.preventDefault(); e.returnValue = ""; } });

// ══════════════ events ══════════════
$("app").addEventListener("input", e => {
  const el = e.target, p = el.dataset.path;
  if (!p) return;
  if (p === "@folder") { ED.folder = el.value.trim(); $("folderErr").textContent = ED.folder && !/^[a-z0-9][a-z0-9-]{0,79}$/.test(ED.folder) ? "Tên không hợp lệ" : ""; }
  else setPath(draftOf(), p, el.value);
  if (el.dataset.yt !== undefined) {
    const id = parseYT(el.value), box = $("ytp");
    box.style.backgroundImage = id ? `url('${ytThumb(id)}')` : ""; box.textContent = id ? "" : (el.value ? "link không hợp lệ" : "chưa có video");
  }
  if (p.startsWith("social.")) el.closest(".social").classList.toggle("empty", !el.value.trim());
  if (el.tagName === "TEXTAREA" && el.closest(".ktable")) autoGrow(el);
  updateDirty();
});
$("app").addEventListener("change", e => {
  // normalize a pasted YouTube link to its id
  if (e.target.dataset.yt !== undefined) { const id = parseYT(e.target.value); if (id) { e.target.value = id; setPath(draftOf(), "video.youtube", id); updateDirty(); } }
});

const listAt = p => p === "@art" ? ART.d : getPath(draftOf(), p);
const ACTS = {
  async save() { try { await doSave(); } catch (e) { toast(e.message, "err"); } },
  revert() {
    if (VIEW === "artworks") resetArt(); else resetCfg();
    render(); toast("Đã hoàn tác");
  },
  seg(el) { setPath(draftOf(), el.dataset.path, el.dataset.v); render(); },
  addRow(el) { listAt(el.dataset.path).push({ en: "", vi: "" }); render(); },
  rmItem(el) { const arr = listAt(el.dataset.path), i = +el.dataset.i; if (el.dataset.path === "@art") ART.removed.add(arr[i].src); arr.splice(i, 1); render(); },
  mvItem(el) {
    const arr = listAt(el.dataset.path), i = +el.dataset.i, j = i + +el.dataset.d;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]]; render();
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
  addArt() { pickFiles("image/*", true).then(addArtFiles); },
  async replaceArt(el) {
    const [file] = await pickFiles(); if (!file) return;
    const i = +el.dataset.i;
    const src = await uploadArt(file); if (!src) return;
    ART.removed.add(ART.d[i].src); ART.d[i].src = src; render();
  },
  async addIndex(el) { const C = S[VIEW]; await saveOrder(VIEW, [...C.order, el.dataset.id]); },
  async delItem(el) {
    const id = el.dataset.id, K = KINDS[VIEW], p = S[VIEW].items[id];
    const ok = await confirmDlg(`Xoá ${K.noun}?`, `<p>Sẽ xoá vĩnh viễn thư mục <code>Database/${K.dir}/${esc(id)}/</code> và gỡ khỏi <code>index.json</code>.</p>
      <p><b>${esc(p?.title || id)}</b></p><p class="hint">Nếu đã commit trước đó, vẫn khôi phục được bằng git.</p>`);
    if (!ok) return;
    try { await api("DELETE", `/api/${VIEW}/${id}`); await load(); render(); reloadPreview(); toast("Đã xoá"); } catch (e) { toast(e.message, "err"); }
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
  if (VIEW === "artworks") {
    await api("PUT", "/api/artworks", { items: ART.d.map(a => ({ src: a.src, title: a.title, desc: a.desc })), remove: [...ART.removed] });
    S.artworks = clone(ART.d); resetArt();
  } else if (ED) {
    const kind = ED.kind;
    if (kind === "projects" && !ED.d.title.trim()) throw new Error("Cần nhập tên dự án");
    const folder = ED.folder || slug(ED.d.title) || `${kind}-${Date.now().toString(36)}`;
    if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(folder)) throw new Error("Tên thư mục không hợp lệ");
    const data = draftToItem(kind, ED.d, ED.orig);
    const r = ED.id ? await api("PUT", `/api/${kind}/${ED.id}`, { data, newId: folder })
                    : await api("POST", `/api/${kind}`, { id: folder, data });
    await load();
    ED = null;
    toast("Đã lưu");
    location.hash = `#/${kind}/edit/${r.id}`;
    if (location.hash === lastHash) render();
    reloadPreview();
    return;
  } else {
    await api("PUT", "/api/config", { config: draftToCfg(CFG.d) });
    S.config = draftToCfg(CFG.d); resetCfg();
  }
  render(); reloadPreview(); toast("Đã lưu");
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
  try { await api("PUT", `/api/order/${kind}`, { order }); S[kind].order = order; render(); reloadPreview(); toast("Đã lưu thứ tự"); }
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

// ---- artworks upload ----
async function uploadArt(file) {
  try {
    const blob = await compress(file, 2400);
    const base = slug(file.name.replace(/\.[^.]+$/, "")) || "artwork";
    return (await upload("artworks", `${base}-${Date.now().toString(36)}.jpg`, blob)).path;
  } catch (e) { toast(e.message, "err"); return ""; }
}
async function addArtFiles(files) {
  files = files.filter(f => f.type.startsWith("image/"));
  if (!files.length) return;
  toast(`Đang tải ${files.length} ảnh…`);
  for (const f of files) {
    const src = await uploadArt(f);
    if (src) ART.d.push({ src, title: { en: "", vi: "" }, desc: { en: "", vi: "" } });
  }
  render(); toast("Đã thêm ảnh — điền tiêu đề / mô tả rồi bấm Lưu");
}
function bindDrop() {
  const d = $("drop"); if (!d) return;
  ["dragenter", "dragover"].forEach(t => d.addEventListener(t, e => { e.preventDefault(); d.classList.add("over"); }));
  ["dragleave", "drop"].forEach(t => d.addEventListener(t, () => d.classList.remove("over")));
  d.addEventListener("drop", e => { e.preventDefault(); addArtFiles([...e.dataTransfer.files]); });
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
const PV_SECTION = { settings: "", experience: "#about", texts: "", projects: "#featured", blender: "#blender", artworks: "#artworks" };
let pvOn = false, pvSection = null;
function reloadPreview() { if (pvOn) $("pvFrame").src = `/?nointro&t=${Date.now()}${PV_SECTION[VIEW] ?? ""}`; }
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
load().then(() => { resetCfg(); resetArt(); render(); }).catch(() => {
  $("srv").classList.add("off");
  $("srv").lastElementChild.textContent = "offline";
  $("app").innerHTML = `<div class="empty"><h3 style="color:var(--bright);margin-bottom:8px">Chưa chạy server Studio</h3>
    Mở terminal tại thư mục dự án và chạy:<br><br><code style="font-size:.95rem">node portfolio-studio/server.mjs</code><br><br>
    rồi mở <code>http://localhost:4100/portfolio-studio/</code></div>`;
});
