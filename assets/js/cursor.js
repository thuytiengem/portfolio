// Custom mouse cursor "Laser comet": a sharp glowing comet tail (violet → magenta → white core) follows
// the pointer; hovering clickable things makes it bigger/brighter, clicking fires 8 laser beams + a lens flare.
// Picked by the owner from 10 demos. Engine (generic plumbing) + the one design, no dependencies.
//
// Behaviour rules: mouse devices only (touch keeps its normal behaviour); the system cursor is hidden only via
// html.fx-cursor added here; text fields keep the I-beam; prefers-reduced-motion → the head follows but no
// tail / particles; hidden over iframes (YouTube) until the next move; cleared + loop stopped on mouseleave /
// blur / hidden tab, and when idle. CSS rules: base.css "Custom cursor".
//
//   initCursor() → { destroy() } | null

const CLICKABLE = 'a,button,[role="button"],label,select,summary,.clickable,[data-open],[data-lb],.btn-explore,.btn-store,.carousel-item,.lang-btn,.lang-menu li,.carousel-dots button';
const TEXT = 'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]),textarea,[contenteditable=""],[contenteditable="true"]';
const IDLE_FRAMES = 360;           // ~6 s of stillness → last frame stays, loop stops

const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];

// Offscreen sprite drawn once and reused every frame (no per-frame gradients).
function makeSprite(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = Math.ceil(w); c.height = Math.ceil(h);
  draw(c.getContext("2d"), c.width, c.height);
  return c;
}
// Soft round glow: colour at the centre fading to transparent. Draw with kit.blit().
const glowCache = new Map();
function glowSprite(color, size = 64, core = 0) {
  const key = color + size + core;
  if (!glowCache.has(key)) glowCache.set(key, makeSprite(size, size, (g, w) => {
    const grad = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    grad.addColorStop(0, color);
    if (core) grad.addColorStop(core, color);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad; g.fillRect(0, 0, w, w);
  }));
  return glowCache.get(key);
}

function createCursor(design, opts = {}) {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return null;
  const o = Object.assign({ clickable: CLICKABLE, density: 1, id: "cursorfx", htmlClass: "fx-cursor" }, opts);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const cv = document.createElement("canvas");
  cv.id = o.id; cv.setAttribute("aria-hidden", "true");
  document.body.appendChild(cv);
  const ctx = cv.getContext("2d");

  // ---- particle pool (preallocated, swap-remove, overwrite when full) ----
  const pool = [];
  let count = 0, overwrite = 0, maxParts = 260;
  function spawn(kind, x, y, vx = 0, vy = 0, max = 40, size = 2) {
    let p;
    if (count < maxParts) {
      p = pool[count] || (pool[count] = {});
      count++;
    } else { p = pool[overwrite]; overwrite = (overwrite + 1) % maxParts; }
    p.kind = kind; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.max = max; p.size = size;
    p.life = 0; p.delay = 0; p.drag = 0.94; p.g = 0; p.rot = Math.random() * TAU; p.vr = 0;
    p.c = 0; p.a = 0; p.b = 0; p.cc = 0; p.d = 0; p.e = 0; p.f = 0; p.pts = null;
    return p;
  }

  // ---- shared state handed to the design ----
  const s = {
    x: 0, y: 0, seen: false,
    h: 0, hover: false,        // h = eased hover 0→1
    p: 1, down: false,         // p = press scale (0.6 on click → eases back to 1)
    text: 0, onText: false,    // eased 0→1 over text fields (head dims, I-beam shows)
    t: 0,                      // animation clock in frames (frozen when reduced)
    spd: 0, ang: 0,            // eased pointer speed (px/event) and last move direction
    idle: 0,                   // frames since the last move
  };
  const kit = {
    ctx, s, reduced, W: 0, H: 0, density: o.density,
    spawn, rand, pick, TAU, makeSprite, glowSprite,
    // draw a sprite centred at x,y with diameter d
    blit(img, x, y, d, alpha = 1) { if (alpha <= 0) return; ctx.globalAlpha = alpha; ctx.drawImage(img, x - d / 2, y - d / 2, d, d); },
    get count() { return count; },
  };

  const d = design(kit);
  maxParts = d.maxParts || 260;

  let dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    kit.W = window.innerWidth; kit.H = window.innerHeight;
    cv.width = kit.W * dpr; cv.height = kit.H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!running && s.seen) wake();
  }

  let running = false, raf = 0;
  function wake() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
  function stop() { running = false; cancelAnimationFrame(raf); }
  function hide() {
    s.seen = false; count = 0; overwrite = 0; d.reset && d.reset();
    stop(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, kit.W, kit.H);
  }

  function frame() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, kit.W, kit.H);
    if (!reduced) s.t++;
    s.idle++;
    const k = reduced ? 1 : 0.18;
    s.h += ((s.hover ? 1 : 0) - s.h) * k;
    s.p += (1 - s.p) * (reduced ? 1 : 0.15);
    s.text += ((s.onText ? 1 : 0) - s.text) * (reduced ? 1 : 0.2);
    s.spd *= 0.9;
    d.frame && d.frame(s);

    // particles
    if (count) {
      ctx.globalCompositeOperation = d.blend || "lighter";
      for (let i = 0; i < count; i++) {
        const p = pool[i];
        if (p.delay > 0) { p.delay--; continue; }
        if (++p.life >= p.max) {           // swap-remove
          pool[i] = pool[--count]; pool[count] = p; i--;
          if (overwrite >= count) overwrite = 0;
          continue;
        }
        p.vx *= p.drag; p.vy *= p.drag; p.vy += p.g;
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        d.drawPart(ctx, p, 1 - p.life / p.max);
      }
    }

    // head (exact pointer position — never smoothed)
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    ctx.save();
    d.head(ctx, s, 1 - s.text * 0.65);
    ctx.restore();

    const settled = Math.abs((s.hover ? 1 : 0) - s.h) < 0.01 && Math.abs(1 - s.p) < 0.01 && Math.abs((s.onText ? 1 : 0) - s.text) < 0.01;
    const idleLimit = reduced ? 2 : IDLE_FRAMES;
    if (!s.seen || document.hidden) { hide(); return; }
    if (s.idle > idleLimit && settled && !count && !(d.busy && d.busy())) { running = false; return; }
    raf = requestAnimationFrame(frame);
  }

  // ---- events ----
  function onMove(e) {
    if (e.pointerType !== "mouse") return;
    if (e.target.tagName === "IFRAME") { if (s.seen) hide(); return; }   // edge of an embed: stay hidden
    const x = e.clientX, y = e.clientY, dx = x - s.x, dy = y - s.y;
    const dist = Math.hypot(dx, dy);
    s.x = x; s.y = y; s.idle = 0;
    if (!s.seen) { s.seen = true; wake(); return; }  // first move (or back from an iframe): no jump-trail
    wake();
    if (dist > 0.5) { s.ang = Math.atan2(dy, dx); s.spd = Math.max(s.spd, Math.min(dist, 60)); }
    if (!reduced && d.move) d.move(x, y, dx, dy, dist);
  }
  function onDown(e) {
    if (e.pointerType !== "mouse") return;
    s.down = true; s.p = 0.6; s.idle = 0; s.x = e.clientX; s.y = e.clientY; s.seen = true;
    wake();
    if (!reduced && d.burst) d.burst(e.clientX, e.clientY);
  }
  function onUp(e) { if (e.pointerType === "mouse") s.down = false; }
  function onOver(e) {
    const t = e.target;
    if (t.tagName === "IFRAME") { hide(); return; }   // embedded players show their own cursor
    s.hover = !!(t.closest && t.closest(o.clickable));
    s.onText = !!(t.closest && t.closest(TEXT));
    if (s.seen) { s.idle = 0; wake(); }
  }
  function onVis() { if (document.hidden) hide(); }

  const root = document.documentElement;
  addEventListener("resize", resize);
  addEventListener("pointermove", onMove, { passive: true });
  addEventListener("pointerdown", onDown, { passive: true });
  addEventListener("pointerup", onUp, { passive: true });
  document.addEventListener("pointerover", onOver, { passive: true });
  root.addEventListener("mouseleave", hide);
  addEventListener("blur", hide);
  document.addEventListener("visibilitychange", onVis);
  resize();
  root.classList.add(o.htmlClass);
  // optional start position (e.g. when switching designs live) so the head shows before the next move
  if (o.at) { s.x = o.at.x; s.y = o.at.y; s.seen = true; wake(); }

  return {
    canvas: cv,
    destroy() {
      stop();
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerover", onOver);
      root.removeEventListener("mouseleave", hide);
      removeEventListener("blur", hide);
      document.removeEventListener("visibilitychange", onVis);
      cv.remove();
      root.classList.remove(o.htmlClass);
    },
  };
}

// ---------------- design ----------------
const C = {
  lilac: "#d38cff", soft: "#c9a2ff", violet: "#9b5cff", deep: "#6b3fae",
  mag: "#ff2bd6", cyan: "#3ef2ff", white: "#f4ecff",
};

/* ───────────── 8. Laser comet ───────────── */
function laser(kit) {
  const N = 40, LIFE = 24;
  const P = new Float32Array(N * 3);          // ring buffer of x, y, age
  let head = 0, len = 0;
  const glow = kit.glowSprite("rgba(255,120,240,.7)", 64);
  const flare = kit.glowSprite("rgba(200,150,255,.9)", 128);
  function push(x, y) { head = (head + 1) % N; P[head * 3] = x; P[head * 3 + 1] = y; P[head * 3 + 2] = 0; if (len < N) len++; }
  const PASSES = [[3.2, 0.2, C.violet], [1.6, 0.6, C.mag], [0.55, 1, "#fff"]];
  return {
    maxParts: 200,
    reset() { len = 0; },
    frame(s) {
      for (let i = 0; i < len; i++) P[((head - i + N) % N) * 3 + 2]++;
      while (len && P[((head - len + 1 + N) % N) * 3 + 2] > LIFE) len--;
      push(s.x, s.y);
    },
    busy() {                                   // still a visible tail?
      for (let i = 1; i < len; i++) { const j = ((head - i + N) % N) * 3; if (Math.abs(P[j] - kit.s.x) + Math.abs(P[j + 1] - kit.s.y) > 0.5) return true; }
      return false;
    },
    move(x, y, dx, dy, dist) {
      if (Math.random() < Math.min(0.7, dist / 30)) {
        const a = Math.atan2(dy, dx) + (Math.random() < 0.5 ? 1 : -1) * rand(1.2, 1.9), sp = rand(0.6, 1.6);
        const p = kit.spawn(0, x, y, Math.cos(a) * sp, Math.sin(a) * sp, rand(16, 28), rand(1, 1.8)); p.drag = 0.92;
      }
    },
    burst(x, y) {
      const p = kit.spawn(2, x, y, 0, 0, 16, 1); p.drag = 1;
      for (let i = 0; i < 8; i++) {
        const q = kit.spawn(1, x, y, 0, 0, rand(22, 30), rand(80, 130));
        q.drag = 1; q.rot = i / 8 * TAU + rand(-0.12, 0.12); q.c = i % 2;
      }
    },
    drawPart(ctx, p, lf) {
      if (p.kind === 0) { ctx.globalAlpha = lf; ctx.fillStyle = C.mag; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill(); return; }
      if (p.kind === 2) {                     // lens-flare cross
        kit.blit(flare, p.x, p.y, 110, lf);
        ctx.globalAlpha = lf; ctx.fillStyle = "#fff";
        const w = 70 * (1.3 - lf * 0.3); ctx.fillRect(p.x - w, p.y - 0.75, w * 2, 1.5); ctx.fillRect(p.x - 0.75, p.y - w * 0.4, 1.5, w * 0.8);
        return;
      }
      const q = 1 - lf, d1 = p.size * (1 - (1 - q) * (1 - q)), d0 = d1 * 0.45 * (1 + q);   // beam shoots out, tail catches up
      const c = Math.cos(p.rot), s = Math.sin(p.rot);
      for (let k = 0; k < 3; k++) {
        const [w, a, col] = PASSES[k];
        ctx.globalAlpha = a * Math.min(1, lf * 1.6); ctx.strokeStyle = k === 1 && p.c ? C.cyan : col; ctx.lineWidth = w * 2;
        ctx.beginPath(); ctx.moveTo(p.x + c * d0, p.y + s * d0); ctx.lineTo(p.x + c * d1, p.y + s * d1); ctx.stroke();
      }
    },
    head(ctx, s, A) {
      const h = s.h, x = s.x, y = s.y, W = 6.5 + h * 3.5;
      // tapered comet tail, three additive passes (glow → colour → white core); none when reduced motion
      ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round";
      for (let k = 0; k < (kit.reduced ? 0 : 3); k++) {
        const [w, a, col] = PASSES[k];
        ctx.strokeStyle = k === 1 && h > 0.5 ? C.cyan : col;
        for (let i = len - 1; i > 0; i--) {
          const j0 = ((head - i + N) % N) * 3, j1 = ((head - i + 1 + N) % N) * 3;
          const f = 1 - P[j0 + 2] / LIFE; if (f <= 0) continue;
          ctx.globalAlpha = a * f * A; ctx.lineWidth = Math.max(0.5, w * W * f);
          ctx.beginPath(); ctx.moveTo(P[j0], P[j0 + 1]); ctx.lineTo(P[j1], P[j1 + 1]); ctx.stroke();
        }
      }
      // tip: glow + 4-point flare, slowly pulsing / turning when idle
      kit.blit(glow, x, y, (30 + h * 20) * s.p, (0.7 + h * 0.3) * A);
      const L = (9 + h * 8 + Math.sin(s.t * 0.09) * 2) * s.p, rot = s.t * 0.01;
      ctx.globalAlpha = A; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) { const a = rot + i * TAU / 4; ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); }
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x, y, 2.2 * s.p, 0, TAU); ctx.fill();
    },
  };
}

export const initCursor = () => createCursor(laser);
