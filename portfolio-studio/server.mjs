#!/usr/bin/env node
/* ══════════════════════════════════════════
   Portfolio Studio — local server (no dependencies)
   Run:  node portfolio-studio/server.mjs   → http://localhost:4100/portfolio-studio/
   Serves the whole site (for live preview) and a small API that reads/writes
   web-config.json and Database/. Listens on 127.0.0.1 only.
   ══════════════════════════════════════════ */
import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";

const PORT = Number(process.env.PORT) || 4100;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG = path.join(ROOT, "web-config.json");
const DB = path.join(ROOT, "Database");
const KINDS = { projects: path.join(DB, "Projects"), blender: path.join(DB, "Blender") };
const ARTWORKS = path.join(DB, "Artworks");
const ART2D = path.join(DB, "Art2D");          // 2D Artwork page: data.json + images/<section id>/
const ART3D = path.join(DB, "Art3D");          // 3D Artwork page: data.json + images/<project id>/
// pages made of one data.json listing items whose id = image folder (images/<id>/); rename = API route of a folder rename
const PAGES = {
  art2d: { dir: ART2D, list: "sections", rename: "rename-section" },
  art3d: { dir: ART3D, list: "projects", rename: "rename-project" },
};
const UPLOAD_DIRS = { artworks: path.join(ARTWORKS, "images"), assets: path.join(ROOT, "assets", "images") };
const UI = path.join(ROOT, "assets", "ui");     // 9-slice UI frames: assets/ui/<name>/frame.png + frame.json
const ID_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;
const NAME_RE = /^[a-z0-9][a-z0-9._-]{0,119}$/i;
const IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const MAX_UPLOAD = 25 * 1024 * 1024;
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".gif": "image/gif", ".ico": "image/x-icon", ".ttf": "font/ttf", ".woff": "font/woff", ".woff2": "font/woff2",
  ".mp4": "video/mp4", ".webm": "video/webm",
};

class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }

function safeJoin(base, rel) {
  const p = path.resolve(base, "." + path.sep + String(rel || ""));
  if (p !== base && !p.startsWith(base + path.sep)) throw new HttpError(400, "Invalid path");
  return p;
}
const checkId = id => { if (!ID_RE.test(id || "")) throw new HttpError(400, "Tên thư mục chỉ gồm chữ thường, số và dấu gạch ngang"); return id; };
const kindDir = k => { if (!KINDS[k]) throw new HttpError(404, "Unknown collection"); return KINDS[k]; };
const exists = p => fsp.access(p).then(() => true, () => false);
const writeJSON = (p, v) => fsp.writeFile(p, JSON.stringify(v, null, 2) + "\n");
const readJSONFile = async (p, fallback) => {
  try { return JSON.parse(await fsp.readFile(p, "utf8")); }
  catch (e) { if (e.code === "ENOENT") return fallback; throw new HttpError(500, `${path.relative(ROOT, p)} is not valid JSON: ${e.message}`); }
};

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on("data", c => { size += c.length; if (size > limit) { reject(new HttpError(413, "File quá lớn")); req.destroy(); } else chunks.push(c); });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
async function readBodyJSON(req) {
  try { return JSON.parse((await readBody(req, 5 * 1024 * 1024)).toString("utf8") || "{}"); }
  catch (e) { throw e instanceof HttpError ? e : new HttpError(400, "Invalid JSON body"); }
}
function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

async function readCollection(kind) {
  const dir = kindDir(kind);
  const order = await readJSONFile(path.join(dir, "index.json"), []);
  const dirs = (await fsp.readdir(dir, { withFileTypes: true }).catch(() => []))
    .filter(d => d.isDirectory() && !d.name.startsWith(".")).map(d => d.name);
  const items = {}, broken = {};
  for (const id of new Set([...order, ...dirs])) {
    if (!ID_RE.test(id) || !(await exists(path.join(dir, id)))) continue;
    try { items[id] = JSON.parse(await fsp.readFile(path.join(dir, id, "data.json"), "utf8")); }
    catch (e) { broken[id] = e.code === "ENOENT" ? "thiếu data.json" : "data.json lỗi: " + e.message; }
  }
  return { order: Array.isArray(order) ? order : [], items, broken };
}

// ── project images (detail page): images/ (logo, cover) and images/product-progression/<step id>/ ──
const PROJ_IMG_DIR_RE = /^images(?:\/product-progression\/[a-z0-9][a-z0-9-]{0,79})?$/;
function projImgDir(itemDir, url) {
  const rel = String(url.searchParams.get("dir") || "");
  if (!PROJ_IMG_DIR_RE.test(rel)) throw new HttpError(400, "Thư mục ảnh không hợp lệ");
  return safeJoin(itemDir, rel);
}
const imgName = n => { if (!NAME_RE.test(n || "") || !IMG_EXT.has(path.extname(n).toLowerCase())) throw new HttpError(400, "Tên file chỉ gồm chữ không dấu, số, . _ - và là ảnh jpg / png / webp / gif"); return n; };
async function listImages(dir) {
  const ents = await fsp.readdir(dir, { withFileTypes: true }).catch(e => { if (e.code === "ENOENT") return null; throw e; });
  if (!ents) return { exists: false, files: [] };
  const files = [];
  for (const d of ents) {
    if (!d.isFile() || d.name.startsWith(".") || !IMG_EXT.has(path.extname(d.name).toLowerCase())) continue;
    const st = await fsp.stat(path.join(dir, d.name));
    files.push({ name: d.name, size: st.size, ok: NAME_RE.test(d.name) });   // ok=false: name the site / API can't use safely
  }
  files.sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }));
  return { exists: true, files };
}
// "shot.png" → "shot-2.png", "shot-3.png"… until free
async function freeName(dir, name) {
  const ext = path.extname(name), base = name.slice(0, -ext.length);
  for (let i = 1, n = name; i < 1000; n = `${base}-${++i}${ext}`) if (!(await exists(path.join(dir, n)))) return n;
  throw new HttpError(409, "Không tìm được tên file trống");
}
// image folder API shared by the project detail page and the 2D / 3D Artwork pages:
//   <sub> = "images"   GET list · POST upload (?name=, overwrite=1) · DELETE (?name=) in the folder dirOf(url) picks
//   <sub> = rename     POST { from, to } renames the sub-folder <from> of renameBase (a step / section / project id changed)
async function imageApi(req, res, url, sub, { dirOf, rename, renameBase }) {
  const m = req.method;
  if (sub === "images") {
    const dir = dirOf(url);
    if (m === "GET") return send(res, 200, await listImages(dir));
    if (m === "POST") {
      let name = imgName(url.searchParams.get("name"));
      const buf = await readBody(req, MAX_UPLOAD);
      if (!buf.length) throw new HttpError(400, "File rỗng");
      await fsp.mkdir(dir, { recursive: true });
      if (url.searchParams.get("overwrite") !== "1") name = await freeName(dir, name);
      await fsp.writeFile(safeJoin(dir, name), buf);
      return send(res, 201, { name, size: buf.length });
    }
    if (m === "DELETE") {
      const file = safeJoin(dir, imgName(url.searchParams.get("name")));
      if (!(await exists(file))) return send(res, 200, { deleted: false });
      await fsp.rm(file);
      return send(res, 200, { deleted: true });
    }
  }
  // rename the image folder of a progression step / 2D section / 3D project (its id changed)
  if (sub === rename && m === "POST") {
    const { from, to } = await readBodyJSON(req);
    checkId(from); checkId(to);
    const base = renameBase;
    if (from === to || !(await exists(path.join(base, from)))) return send(res, 200, { renamed: false });
    if (await exists(path.join(base, to))) throw new HttpError(409, `Thư mục ảnh "${to}" đã tồn tại`);
    await fsp.rename(path.join(base, from), path.join(base, to));
    return send(res, 200, { renamed: true });
  }
  throw new HttpError(404, "Unknown API route");
}
// project detail page: images/ (logo, cover) and images/product-progression/<step id>/
const projectImages = (req, res, url, itemDir, sub) => imageApi(req, res, url, sub, {
  dirOf: u => projImgDir(itemDir, u), rename: "rename-step", renameBase: path.join(itemDir, "images", "product-progression") });
// 2D / 3D Artwork pages (PAGES): PUT data.json · images/<item id>/ (?dir=<item id>) list, upload, delete · rename an item folder
async function pageApi(req, res, url, P, parts) {
  if (parts.length === 1 && req.method === "PUT") {
    const { data } = await readBodyJSON(req);
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new HttpError(400, "data must be an object");
    if (data[P.list] !== undefined && !Array.isArray(data[P.list])) throw new HttpError(400, `${P.list} must be a list`);
    await fsp.mkdir(P.dir, { recursive: true });
    await writeJSON(path.join(P.dir, "data.json"), data);
    return send(res, 200, { ok: true });
  }
  if (parts.length === 2) return imageApi(req, res, url, parts[1], {
    dirOf: u => safeJoin(path.join(P.dir, "images"), checkId(String(u.searchParams.get("dir") || ""))),
    rename: P.rename, renameBase: path.join(P.dir, "images") });
  throw new HttpError(404, "Unknown API route");
}

// ── UI frames (assets/ui/<name>/frame.json) ──
const EDGES = ["stretch", "repeat", "round", "space"];
const SIDES = ["left", "top", "right", "bottom"];
const FRAME_IMG_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);
async function frameDir(name) {
  const dir = path.join(UI, checkId(name));
  if (!(await exists(path.join(dir, "frame.json")))) throw new HttpError(404, `Không có khung "${name}"`);
  return dir;
}
async function listFrames() {
  const dirs = (await fsp.readdir(UI, { withFileTypes: true }).catch(() => []))
    .filter(d => d.isDirectory() && ID_RE.test(d.name)).map(d => d.name).sort();
  const out = [];
  for (const name of dirs) {
    const config = await readJSONFile(path.join(UI, name, "frame.json"), null);
    if (config) out.push({ name, config });
  }
  return out;
}
function checkFrameConfig(c) {
  if (!c || typeof c !== "object" || Array.isArray(c)) throw new HttpError(400, "Config must be an object");
  const sides = (o, what) => {
    if (!o || typeof o !== "object") throw new HttpError(400, `Thiếu ${what}`);
    return Object.fromEntries(SIDES.map(k => {
      const v = o[k];
      if (typeof v !== "number" || !Number.isFinite(v) || v < 0) throw new HttpError(400, `${what}.${k} phải là số ≥ 0`);
      return [k, v];
    }));
  };
  const image = String(c.image || "");
  if (!NAME_RE.test(image) || !FRAME_IMG_EXT.has(path.extname(image).toLowerCase())) throw new HttpError(400, "Tên ảnh phải là file png / jpg / webp");
  if (typeof c.scale !== "number" || !Number.isFinite(c.scale) || c.scale <= 0) throw new HttpError(400, "scale phải > 0");
  if (!EDGES.includes(c.edges)) throw new HttpError(400, `edges phải là ${EDGES.join(" / ")}`);
  if (typeof c.fill !== "boolean") throw new HttpError(400, "fill phải là true / false");
  // keep unknown fields, normalize the known ones
  return { ...c, image, slice: sides(c.slice, "slice"), scale: c.scale, edges: c.edges, fill: c.fill,
    padding: sides(c.padding, "padding"), version: Number.isFinite(c.version) ? c.version : Date.now() };
}

// ── git (commit & push from the Studio) ──
// Only these paths ever reach git; the client sends a view key (or "all"), never a path.
const GIT_SCOPES = {
  settings: ["web-config.json"], experience: ["web-config.json"], texts: ["web-config.json"],
  projects: ["Database/Projects"], blender: ["Database/Blender"], artworks: ["Database/Artworks"], art2d: ["Database/Art2D"], art3d: ["Database/Art3D"], ui: ["assets/ui"],
};
const GIT_PATHS = new Set(Object.values(GIT_SCOPES).flat());
const GIT_ENV = { ...process.env, GIT_TERMINAL_PROMPT: "0", GCM_INTERACTIVE: "never", LC_ALL: "C" };
let gitBusy = false;
function git(args, timeout = 20000) {
  return new Promise(resolve => {
    execFile("git", args, { cwd: ROOT, env: GIT_ENV, timeout, windowsHide: true, maxBuffer: 16 * 1024 * 1024 }, (err, stdout, stderr) =>
      resolve({ ok: !err, code: err ? (err.killed ? "timeout" : err.code) : 0, out: String(stdout), err: String(stderr || err?.message || "").trim() }));
  });
}
const gitFail = (r, what) => new HttpError(500, `${what}: ${r.code === "timeout" ? "quá thời gian chờ" : r.err.split("\n").filter(Boolean).slice(-3).join(" · ") || "lỗi git"}`);
// "all" → null (whole repo); otherwise a list of whitelisted paths
function gitPathsOf(list) {
  if (list.length === 1 && list[0] === "all") return null;
  if (!list.length || list.some(p => !GIT_PATHS.has(p))) throw new HttpError(400, "Đường dẫn không được phép");
  return [...new Set(list)];
}
async function gitStatus(paths) {
  const r = await git(["status", "--porcelain=v1", "-z", "--untracked-files=all", "--", ...(paths || ["."])]);
  if (!r.ok) throw gitFail(r, "git status lỗi");
  const files = [], parts = r.out.split("\0");
  for (let i = 0; i < parts.length; i++) {
    const e = parts[i]; if (e.length < 4) continue;
    const status = e.slice(0, 2);
    files.push({ status: status.trim() || status, path: e.slice(3) });
    if (/[RC]/.test(status)) i++;                     // rename/copy: next entry is the old path
  }
  return files;
}
async function gitBranch() {
  const b = await git(["rev-parse", "--abbrev-ref", "HEAD"]);
  const branch = b.ok ? b.out.trim() : "";
  const up = await git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
  let ahead = null;
  if (up.ok) { const c = await git(["rev-list", "--count", "@{u}..HEAD"]); if (c.ok) ahead = Number(c.out.trim()) || 0; }
  return { branch, upstream: up.ok ? up.out.trim() : null, ahead };
}
async function gitPush() {
  const r = await git(["push"], 90000);
  return r.ok ? { pushed: true } : { pushed: false, pushError: gitFail(r, "git push lỗi").message.replace(/^git push lỗi: /, "") };
}
async function withGitLock(fn) {
  if (gitBusy) throw new HttpError(409, "Đang chạy một lệnh git khác — thử lại sau");
  gitBusy = true;
  try { return await fn(); } finally { gitBusy = false; }
}
async function gitCommit({ scope, message, push = true }) {
  const msg = String(message ?? "").trim();
  if (!msg) throw new HttpError(400, "Cần nhập nội dung commit");
  if (msg.length > 200) throw new HttpError(400, "Nội dung commit tối đa 200 ký tự");
  if (/[\x00-\x1f\x7f]/.test(msg)) throw new HttpError(400, "Nội dung commit chỉ được 1 dòng");
  if (scope !== "all" && !GIT_SCOPES[scope]) throw new HttpError(400, "Phạm vi commit không hợp lệ");
  const paths = scope === "all" ? null : GIT_SCOPES[scope];
  return withGitLock(async () => {
    const add = await git(paths ? ["add", "-A", "--", ...paths] : ["add", "-A"]);
    if (!add.ok) throw gitFail(add, "git add lỗi");
    const staged = await git(["diff", "--cached", "--name-only", "-z", ...(paths ? ["--", ...paths] : [])]);
    if (!staged.ok) throw gitFail(staged, "git diff lỗi");
    const files = staged.out.split("\0").filter(Boolean);
    if (!files.length) throw new HttpError(400, "Không có gì để commit");
    // with a pathspec git commits only those paths — anything else already staged stays staged
    const c = await git(paths ? ["commit", "-m", msg, "--", ...paths] : ["commit", "-m", msg], 60000);
    if (!c.ok) throw gitFail(c, "git commit lỗi");
    const h = await git(["rev-parse", "--short", "HEAD"]);
    const out = { commit: h.out.trim(), files: files.length };
    console.log(new Date().toLocaleTimeString(), "git commit", out.commit, `(${scope}, ${files.length} file)`, JSON.stringify(msg));
    if (!push) return out;
    const p = await gitPush();
    console.log(new Date().toLocaleTimeString(), p.pushed ? "git push ok" : `git push failed: ${p.pushError}`);
    return { ...out, ...p };
  });
}

// ── API ──
async function api(req, res, url) {
  const parts = url.pathname.split("/").filter(Boolean).slice(1); // drop "api"
  const m = req.method;
  // Writes must come from the Studio page (custom header can't be sent cross-site without CORS, which we never allow).
  if (m !== "GET" && req.headers["x-studio"] !== "1") throw new HttpError(403, "Forbidden");

  if (parts[0] === "state" && m === "GET") {
    return send(res, 200, {
      config: await readJSONFile(CONFIG, {}),
      projects: await readCollection("projects"),
      blender: await readCollection("blender"),
      artworks: await readJSONFile(path.join(ARTWORKS, "index.json"), []),
      art2d: await readJSONFile(path.join(ART2D, "data.json"), {}),
      art3d: await readJSONFile(path.join(ART3D, "data.json"), {}),
    });
  }

  if (parts[0] === "config" && m === "PUT") {
    const { config } = await readBodyJSON(req);
    if (!config || typeof config !== "object" || Array.isArray(config)) throw new HttpError(400, "Config must be an object");
    await writeJSON(CONFIG, config);
    return send(res, 200, { ok: true });
  }

  if (parts[0] === "order" && parts.length === 2 && m === "PUT") {
    const dir = kindDir(parts[1]);
    const { order } = await readBodyJSON(req);
    if (!Array.isArray(order) || new Set(order).size !== order.length) throw new HttpError(400, "Order must be a list of unique folder names");
    for (const id of order) if (!(await exists(path.join(dir, checkId(id), "data.json")))) throw new HttpError(400, `Unknown item "${id}"`);
    await writeJSON(path.join(dir, "index.json"), order);
    return send(res, 200, { order });
  }

  if (KINDS[parts[0]]) {
    const dir = kindDir(parts[0]);
    const indexFile = path.join(dir, "index.json");
    if (parts.length === 1 && m === "POST") {
      const { id, data } = await readBodyJSON(req);
      checkId(id);
      if (!data || typeof data !== "object") throw new HttpError(400, "Missing data");
      if (await exists(path.join(dir, id))) throw new HttpError(409, `Thư mục "${id}" đã tồn tại`);
      await fsp.mkdir(path.join(dir, id), { recursive: true });
      await writeJSON(path.join(dir, id, "data.json"), data);
      const order = await readJSONFile(indexFile, []); order.push(id); await writeJSON(indexFile, order);
      return send(res, 201, { id });
    }
    if (parts.length === 2) {
      const id = checkId(parts[1]), itemDir = path.join(dir, id);
      if (!(await exists(itemDir))) throw new HttpError(404, "Not found");
      if (m === "PUT") {
        const { data, newId } = await readBodyJSON(req);
        if (!data || typeof data !== "object") throw new HttpError(400, "Missing data");
        let target = id;
        if (newId && newId !== id) {
          checkId(newId);
          if (await exists(path.join(dir, newId))) throw new HttpError(409, `Thư mục "${newId}" đã tồn tại`);
          await fsp.rename(itemDir, path.join(dir, newId));
          await writeJSON(indexFile, (await readJSONFile(indexFile, [])).map(x => x === id ? newId : x));
          target = newId;
        }
        await writeJSON(path.join(dir, target, "data.json"), data);
        return send(res, 200, { id: target });
      }
      if (m === "DELETE") {
        await fsp.rm(itemDir, { recursive: true, force: true });
        await writeJSON(indexFile, (await readJSONFile(indexFile, [])).filter(x => x !== id));
        return send(res, 200, { deleted: id });
      }
    }
    if (parts.length === 3 && parts[0] === "projects") {
      const itemDir = path.join(dir, checkId(parts[1]));
      if (!(await exists(path.join(itemDir, "data.json")))) throw new HttpError(404, "Not found");
      return projectImages(req, res, url, itemDir, parts[2]);
    }
  }

  if (parts[0] === "artworks" && m === "PUT") {
    const { items, remove = [] } = await readBodyJSON(req);
    if (!Array.isArray(items)) throw new HttpError(400, "items must be a list");
    await writeJSON(path.join(ARTWORKS, "index.json"), items);
    const used = new Set(items.map(x => x.src));
    for (const rel of remove) {               // delete image files of removed artworks (only inside images/)
      if (used.has(rel) || !String(rel).startsWith("images/")) continue;
      await fsp.rm(safeJoin(ARTWORKS, rel), { force: true });
    }
    return send(res, 200, { ok: true });
  }

  // 2D / 3D Artwork pages: /api/art2d…, /api/art3d…
  if (Object.hasOwn(PAGES, parts[0])) return pageApi(req, res, url, PAGES[parts[0]], parts);

  if (parts[0] === "ui") {
    if (parts.length === 1 && m === "GET") return send(res, 200, await listFrames());
    if (parts.length === 2 && m === "PUT") {
      const dir = await frameDir(parts[1]);
      const config = checkFrameConfig((await readBodyJSON(req)).config);
      await writeJSON(path.join(dir, "frame.json"), config);
      return send(res, 200, { config });
    }
    // replace the frame image in place (same file name → the site picks it up; the client bumps "version")
    if (parts.length === 3 && parts[2] === "image" && m === "POST") {
      const dir = await frameDir(parts[1]), name = url.searchParams.get("name") || "frame.png";
      if (!NAME_RE.test(name) || !FRAME_IMG_EXT.has(path.extname(name).toLowerCase())) throw new HttpError(400, "Chỉ nhận ảnh png / jpg / webp");
      const buf = await readBody(req, MAX_UPLOAD);
      if (!buf.length) throw new HttpError(400, "File rỗng");
      await fsp.writeFile(safeJoin(dir, name), buf);
      return send(res, 201, { path: `assets/ui/${parts[1]}/${name}`, size: buf.length });
    }
  }

  if (parts[0] === "git") {
    if (parts[1] === "status" && m === "GET") {
      const paths = gitPathsOf(String(url.searchParams.get("paths") || "").split(",").map(s => s.trim()).filter(Boolean));
      const [files, info] = await Promise.all([gitStatus(paths), gitBranch()]);
      return send(res, 200, { ...info, files });
    }
    if (parts[1] === "commit" && m === "POST") return send(res, 200, await gitCommit(await readBodyJSON(req)));
    // push commits that are still local (e.g. after a failed push)
    if (parts[1] === "push" && m === "POST") {
      const r = await withGitLock(gitPush);
      console.log(new Date().toLocaleTimeString(), r.pushed ? "git push ok" : `git push failed: ${r.pushError}`);
      return send(res, 200, r);
    }
  }

  if (parts[0] === "upload" && m === "POST") {
    const target = url.searchParams.get("target"), name = url.searchParams.get("name") || "";
    const dir = UPLOAD_DIRS[target];
    if (!dir) throw new HttpError(400, "Unknown upload target");
    if (!NAME_RE.test(name) || !IMG_EXT.has(path.extname(name).toLowerCase())) throw new HttpError(400, "Chỉ nhận ảnh jpg / png / webp / gif");
    const buf = await readBody(req, MAX_UPLOAD);
    await fsp.mkdir(dir, { recursive: true });
    await fsp.writeFile(safeJoin(dir, name), buf);
    const rel = target === "artworks" ? `images/${name}` : `assets/images/${name}`;
    return send(res, 201, { path: rel, size: buf.length });
  }

  throw new HttpError(404, "Unknown API route");
}

// ── static files (site + studio) ──
async function serveStatic(req, res, url) {
  if (url.pathname.split("/").some(s => s.startsWith("."))) throw new HttpError(404, "Not found");
  let file = safeJoin(ROOT, decodeURIComponent(url.pathname));
  let st = await fsp.stat(file).catch(() => null);
  if (st && st.isDirectory()) {
    if (!url.pathname.endsWith("/")) { res.writeHead(301, { Location: url.pathname + "/" + url.search }); return res.end(); }
    file = path.join(file, "index.html"); st = await fsp.stat(file).catch(() => null);
  }
  if (!st) return send(res, 404, "Not found", "text/plain; charset=utf-8");
  res.writeHead(200, { "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream", "Content-Length": st.size, "Cache-Control": "no-store" });
  if (req.method === "HEAD") return res.end();
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    // Block DNS-rebinding: only answer requests addressed to this machine.
    const host = String(req.headers.host || "").replace(/:\d+$/, "");
    if (!["localhost", "127.0.0.1", "[::1]"].includes(host)) throw new HttpError(403, "Forbidden host");
    const url = new URL(req.url, "http://localhost");
    if (url.pathname.startsWith("/api/")) {
      await api(req, res, url);
      if (req.method !== "GET") console.log(new Date().toLocaleTimeString(), req.method, url.pathname + url.search);
    } else {
      await serveStatic(req, res, url);
    }
  } catch (e) {
    const status = e.status || 500;
    if (status === 500) console.error(e);
    if (!res.headersSent) send(res, status, { error: e.message || "Server error" });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("\n  Portfolio Studio");
  console.log(`  → Studio:  http://localhost:${PORT}/portfolio-studio/`);
  console.log(`  → Site:    http://localhost:${PORT}/\n`);
});
server.on("error", e => {
  console.error(e.code === "EADDRINUSE" ? `Port ${PORT} đang bận — chạy: PORT=4101 node portfolio-studio/server.mjs` : e);
  process.exit(1);
});
