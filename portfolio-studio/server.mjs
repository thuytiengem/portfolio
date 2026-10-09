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

const PORT = Number(process.env.PORT) || 4100;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG = path.join(ROOT, "web-config.json");
const DB = path.join(ROOT, "Database");
const KINDS = { projects: path.join(DB, "Projects"), blender: path.join(DB, "Blender") };
const ARTWORKS = path.join(DB, "Artworks");
const UPLOAD_DIRS = { artworks: path.join(ARTWORKS, "images"), assets: path.join(ROOT, "assets", "images") };
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
