// Shared toolkit for the 5 intro demos: page skeleton, glass scene built from the textures,
// a sprite particle system, and small helpers. Each demo only writes its own timeline.
import { shake } from "../assets/js/intro/effects/shake.js";
import { drawCracks } from "../assets/js/intro/effects/shatter.js";
export { shake, drawCracks };

export const TEX = "../assets/images/intro-texture/";
export const W0 = 1110, H0 = 644;                         // glass-broken-demo.png size = stage coordinates
export const C0 = { x: W0 / 2, y: H0 / 2 };
export const INTACT = { x: 88, y: 64, w: 933, h: 515 };   // glass-demo.png placed in stage coordinates
// where each shard sits in glass-broken-demo.png (found by template matching)
export const LAYOUT = {
  "glass-1": { x: 676, y: 62, w: 436, h: 250, s: 0.98 }, "glass-2": { x: 578, y: 280, w: 419, h: 258, s: 1 },
  "glass-3": { x: 636, y: 422, w: 426, h: 212, s: 0.98 }, "glass-4": { x: 506, y: 352, w: 212, h: 244, s: 0.88 },
  "glass-5": { x: 364, y: 378, w: 132, h: 245, s: 0.93 }, "glass-6": { x: 38, y: 398, w: 404, h: 245, s: 1 },
  "glass-7": { x: 68, y: 166, w: 417, h: 412, s: 0.98 }, "glass-8": { x: 2, y: 24, w: 424, h: 198, s: 0.98 },
  "glass-9": { x: 260, y: 60, w: 243, h: 179, s: 0.98 }, "glass-10": { x: 392, y: 28, w: 118, h: 195, s: 0.93 },
  "glass-11": { x: 498, y: 62, w: 89, h: 196, s: 0.97 }, "glass-12": { x: 964, y: 122, w: 49, h: 160, s: 0.87 },
  "glass-13": { x: 612, y: 0, w: 159, h: 150, s: 1 }, "glass-14": { x: 532, y: 48, w: 475, h: 239, s: 1.02 },
};
export const CHIPS = ["glass-15", "glass-16", "glass-17", "glass-18", "glass-19", "glass-20"];
export const PIXELS = ["particle-1", "particle-2", "particle-3", "particle-4", "particle-5"];

export const rand = (a, b) => a + Math.random() * (b - a);
export const pick = arr => arr[(Math.random() * arr.length) | 0];

// ---------------- tempo (slow-motion toggle in the demo panel) ----------------
export let tempo = 1;
export const wait = ms => new Promise(r => setTimeout(r, ms / tempo));
(function syncTempo() {
  document.getAnimations().forEach(a => { if (a.playbackRate !== tempo) a.playbackRate = tempo; });
  requestAnimationFrame(syncTempo);
})();

// ---------------- page skeleton ----------------
export function skeleton({ index, name, note }) {
  document.body.insertAdjacentHTML("afterbegin", `
    <header class="topbar" id="topbar">
      <a class="brand" href="#">TRAN THI THUY TIEN</a>
      <nav class="nav"><a href="#">Home</a><a href="#">Portfolio</a><a href="#">About me</a><a href="#">Contact</a></nav>
      <div class="lang"><button class="lang-btn" type="button"><span>English</span>
        <svg width="18" height="18" viewBox="0 0 24 24"><path d="M5 9l7 7 7-7" stroke="#fff" stroke-width="3" fill="none"/></svg></button></div>
    </header>
    <section class="hero" id="hero">
      <div class="stage" id="stage"></div>
      <div class="ring" id="ring"></div>
      <div class="scanlines" id="scan"></div>
      <canvas class="fx" id="fx"></canvas>
      <div class="hero-titles">
        <div class="hero-brand" id="brand">THUYTIENGEM</div>
        <h1 class="glitch" id="title" data-text="PORTFOLIO">PORTFOLIO</h1>
      </div>
      <div class="hero-quote" id="quote"><span>“Hi, I’m Tran Thi Thuy Tien (Thuytiengem). Welcome to my Portfolio~~ Let’s take a look !!”</span></div>
      <div class="hero-flash" id="flash"></div>
    </section>
    <div class="demo-name"><b>Demo ${index} · ${name}</b><br>${note}</div>
    <div class="demo-panel">
      ${[1, 2, 3, 4, 5].map(i => `<a href="demo-${i}.html"${i === index ? ' class="on"' : ""}>${i}</a>`).join("")}
      <button id="replay">↻ Replay</button>
      <select id="tempo"><option value="1">1×</option><option value="0.35">0.35× slow-mo</option></select>
    </div>`);
  const $ = id => document.getElementById(id);
  const refs = { hero: $("hero"), stage: $("stage"), ring: $("ring"), scan: $("scan"), fx: $("fx"), brand: $("brand"),
                 title: $("title"), quote: $("quote"), flash: $("flash"), topbar: $("topbar") };
  $("tempo").onchange = e => { tempo = +e.target.value; };
  return refs;
}

// ---------------- textures ----------------
const cache = {};
export function preload() {
  const names = ["glass-demo", "electric-fx", ...Object.keys(LAYOUT), ...CHIPS, ...PIXELS];
  return Promise.all(names.map(n => cache[n] || (cache[n] = new Promise(res => {
    const img = new Image(); img.onload = () => res(img); img.onerror = () => res(img); img.src = `${TEX}${n}.png`;
  })))).then(imgs => Object.fromEntries(names.map((n, i) => [n, imgs[i]])));
}

// ---------------- glass scene ----------------
const pct = (v, total) => `${(v / total) * 100}%`;
const box = (el, b) => Object.assign(el.style, { left: pct(b.x, W0), top: pct(b.y, H0), width: pct(b.w, W0), height: pct(b.h, H0) });

let errorTimer = 0;
export function buildStage(stage) {
  clearInterval(errorTimer);
  stage.innerHTML = "";
  stage.getAnimations({ subtree: true }).forEach(a => a.cancel());
  stage.style.transform = "";
  const glow = Object.assign(document.createElement("div"), { className: "glow" });
  const group = Object.assign(document.createElement("div"), { className: "group" });
  box(group, INTACT);
  group.innerHTML = `<img class="intact" src="${TEX}glass-demo.png" alt="">
    <img class="electric" src="${TEX}electric-fx.png" alt="">
    <svg class="cracks" viewBox="0 0 160 90" preserveAspectRatio="none"></svg>`;
  const shardsBox = Object.assign(document.createElement("div"), { className: "shards" });
  shardsBox.hidden = true;
  const shards = Object.entries(LAYOUT).map(([name, L]) => {
    const wrap = document.createElement("div");
    wrap.className = "shard-wrap";
    box(wrap, { x: L.x, y: L.y, w: L.w * L.s, h: L.h * L.s });
    const img = new Image();
    img.className = "shard"; img.src = `${TEX}${name}.png`; img.alt = "";
    wrap.appendChild(img);
    shardsBox.appendChild(wrap);
    const cx = L.x + (L.w * L.s) / 2, cy = L.y + (L.h * L.s) / 2;
    const len = Math.hypot(cx - C0.x, cy - C0.y) || 1;
    return { name, wrap, img, cx, cy, dir: { x: (cx - C0.x) / len, y: (cy - C0.y) / len }, dist: len, depth: rand(0.3, 1) };
  });
  stage.append(glow, group, shardsBox);
  return {
    stage, glow, group, shardsBox, shards,
    intact: group.querySelector(".intact"), electric: group.querySelector(".electric"), cracks: group.querySelector(".cracks"),
    /** px per stage unit */
    get f() { return stage.clientWidth / W0; },
    /** offset (px) that moves a shard back to where it was in the intact glass */
    home(s, k = 0.8) { const f = this.f; return { x: (C0.x + (s.cx - C0.x) * k - s.cx) * f, y: (C0.y + (s.cy - C0.y) * k - s.cy) * f }; },
    /** stage point → hero canvas px */
    toHero(x, y) {
      const r = stage.getBoundingClientRect(), h = stage.parentElement.getBoundingClientRect(), f = r.width / W0;
      return { x: r.left - h.left + x * f, y: r.top - h.top + y * f };
    },
  };
}

/** shards keep trembling slowly once the break is over */
export function tremble(scene, px = [0.4, 1.3], sec = [2, 3.6]) {
  const j = () => `${((Math.random() < 0.5 ? -1 : 1) * rand(...px)).toFixed(2)}px`;
  scene.shards.forEach(s => {
    s.wrap.style.setProperty("--ja", j()); s.wrap.style.setProperty("--jb", j());
    s.wrap.style.setProperty("--jr", `${rand(-0.35, 0.35).toFixed(2)}deg`);
    s.wrap.style.setProperty("--td", `${rand(...sec).toFixed(2)}s`);
    s.wrap.style.setProperty("--tdl", `${(-Math.random() * 3).toFixed(2)}s`);
    s.wrap.classList.add("tremble");
  });
}

/**
 * Idle "signal error" on the big shards: now and then a shard gets an RGB split, its horizontal
 * bands tear sideways, it flickers, and error blocks flash over it. Sometimes several fail together.
 * rate = average errors per second per shard.
 */
export function errorGlitch(scene, P, { rate = 0.07, burstEvery = [4, 7] } = {}) {
  clearInterval(errorTimer);
  const RGB = px => `drop-shadow(${-px}px 0 #ff2bd6) drop-shadow(${px}px 0 #3ef2ff)`;
  const fail = s => {
    if (s.busy) return;
    s.busy = true;
    const dur = rand(140, 320);
    const steps = 6;
    s.wrap.animate(Array.from({ length: steps + 1 }, (_, i) => i === steps ? { filter: "none", opacity: 1 } : {
      filter: `${RGB(rand(2, 8).toFixed(1))} brightness(${rand(0.9, 1.6).toFixed(2)}) hue-rotate(${rand(-30, 30) | 0}deg)`,
      opacity: Math.random() < 0.25 ? rand(0.2, 0.6) : 1,
    }), { duration: dur, easing: "steps(1)" });
    // torn bands: copies of the shard clipped to thin strips, shifted sideways
    const bands = Array.from({ length: (Math.random() * 3 + 1) | 0 }, () => {
      const top = rand(0, 90), hgt = rand(4, 16);
      const b = s.img.cloneNode();
      b.getAnimations?.().forEach(a => a.cancel());
      Object.assign(b.style, { position: "absolute", left: 0, top: 0, clipPath: `inset(${top}% 0 ${Math.max(0, 100 - top - hgt)}% 0)` });
      s.wrap.appendChild(b);
      b.animate(Array.from({ length: steps }, () => ({ transform: `translateX(${rand(-1, 1) * rand(6, 22)}px)`, opacity: Math.random() < 0.3 ? 0 : 1 })),
        { duration: dur, easing: "steps(1)", fill: "both" });
      return b;
    });
    const r = s.wrap.getBoundingClientRect(), hr = scene.stage.parentElement.getBoundingClientRect();
    P?.noise({ x: r.left - hr.left, y: r.top - hr.top, w: r.width, h: r.height }, dur, 4);
    setTimeout(() => { bands.forEach(b => b.remove()); s.busy = false; }, dur / tempo);
  };
  let nextBurst = performance.now() + rand(...burstEvery) * 1000;
  errorTimer = setInterval(() => {
    if (document.hidden) return;
    scene.shards.forEach(s => { if (Math.random() < rate * 0.1 * tempo) fail(s); });
    if (performance.now() > nextBurst) {           // a bigger error: several shards at once
      nextBurst = performance.now() + rand(...burstEvery) * 1000 / tempo;
      [...scene.shards].sort(() => Math.random() - 0.5).slice(0, (rand(3, 6)) | 0).forEach((s, i) => setTimeout(() => fail(s), i * 40));
    }
  }, 100);
}

// ---------------- sprite particles ----------------
export function createParticles(canvas, sprites) {
  const g = canvas.getContext("2d");
  let W = 0, H = 0, parts = [], raf = 0, last = 0, emitters = [], blocks = [];
  // magenta / cyan copies of each sprite for the RGB-split "signal error" look
  const tints = new Map();
  const tinted = (img, color) => {
    const key = img.src + color;
    if (!tints.has(key)) {
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      const t = c.getContext("2d");
      t.drawImage(img, 0, 0);
      t.globalCompositeOperation = "source-in";
      t.fillStyle = color; t.fillRect(0, 0, c.width, c.height);
      tints.set(key, c);
    }
    return tints.get(key);
  };
  const size = () => { const d = Math.min(devicePixelRatio || 1, 2); W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * d; canvas.height = H * d; g.setTransform(d, 0, 0, d, 0, 0); };
  new ResizeObserver(size).observe(canvas); size();

  function loop(t) {
    const dt = Math.min((t - (last || t)) / 1000, 0.05) * tempo;
    last = t;
    g.clearRect(0, 0, W, H);
    emitters = emitters.filter(e => (e.left -= dt) > 0 || e.forever);
    emitters.forEach(e => { e.acc += e.rate * dt; while (e.acc >= 1) { e.acc--; emit({ ...e.opts(), count: 1 }); } });
    // error noise blocks
    blocks = blocks.filter(b => (b.left -= dt) > 0);
    for (const b of blocks) {
      if (Math.random() < 0.35) continue;
      for (let i = 0; i < b.n; i++) {
        g.globalAlpha = rand(0.2, 0.7);
        g.fillStyle = pick(["#ff2bd6", "#3ef2ff", "#ffffff", "#9b5cff"]);
        g.fillRect(b.x + Math.random() * b.w, b.y + Math.random() * b.h, rand(6, 60), rand(1, 5));
      }
    }
    parts = parts.filter(p => (p.age += dt) < p.life);
    for (const p of parts) {
      const dr = Math.max(0, 1 - p.drag * dt);
      p.vx *= dr; p.vy = p.vy * dr + p.grav * dt; p.vr *= dr;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      const k = p.age / p.life;                       // persistent particles: life = Infinity → k = 0
      let a = (k < p.fadeIn ? k / p.fadeIn : k > 0.65 ? 1 - (k - 0.65) / 0.35 : 1) * p.alpha;
      if (p.persist && p.age < 0.3) a *= p.age / 0.3;
      if (a <= 0) continue;
      // occasional "signal error": RGB split, sideways jumps, flicker — for a few frames
      let gx = 0, split = 0;
      if (p.glitch) {
        if (p.gl > 0) p.gl -= dt;
        else if (Math.random() < p.glitch * dt) { p.gl = rand(0.1, 0.28); p.gdx = rand(3, 10) * (Math.random() < 0.5 ? -1 : 1); }
        if (p.gl > 0) {
          if (Math.random() < 0.25) continue;                 // dropped frame
          gx = Math.random() < 0.5 ? p.gdx : 0;
          split = rand(2, 6);
          a *= rand(0.5, 1);
        }
      }
      const w = p.img.width * p.s, h = p.img.height * p.s;
      const draw = (img, dx) => { g.save(); g.translate(p.x + dx, p.y); g.rotate(p.rot); g.drawImage(img, -w / 2, -h / 2, w, h); g.restore(); };
      if (split) {
        g.globalCompositeOperation = "lighter";
        g.globalAlpha = a * 0.8;
        draw(tinted(p.img, "#ff2bd6"), gx - split);
        draw(tinted(p.img, "#3ef2ff"), gx + split);
      }
      g.globalCompositeOperation = p.blend;
      g.globalAlpha = a;
      draw(p.img, gx);
    }
    g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    if (parts.length || emitters.length || blocks.length) raf = requestAnimationFrame(loop); else { raf = 0; last = 0; }
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

  /** o: { x, y, spread, count, names, speed:[a,b], angle:[a,b], grav, drag, life:[a,b], scale:[a,b], spin, blend, alpha, fadeIn,
   *       persist: stay on screen forever, glitch: average glitches per second } */
  function emit(o) {
    for (let i = 0; i < (o.count ?? 1); i++) {
      const a = rand(...(o.angle || [0, Math.PI * 2])), sp = rand(...(o.speed || [100, 400]));
      const sx = o.spreadX ?? o.spread ?? 0, sy = o.spreadY ?? o.spread ?? 0;
      parts.push({
        img: sprites[pick(o.names)], x: o.x + rand(-sx, sx), y: o.y + rand(-sy, sy),
        vx: Math.cos(a) * sp + (o.vx || 0), vy: Math.sin(a) * sp + (o.vy || 0), grav: o.grav ?? 900, drag: o.drag ?? 0.6,
        rot: rand(0, 6.28), vr: rand(-(o.spin ?? 8), o.spin ?? 8), s: rand(...(o.scale || [0.6, 1.2])),
        life: o.persist ? Infinity : rand(...(o.life || [0.8, 1.6])), age: 0, alpha: o.alpha ?? 1, blend: o.blend || "source-over",
        fadeIn: o.fadeIn ?? 0, persist: !!o.persist, glitch: o.glitch || 0, gl: 0, gdx: 0,
      });
    }
    kick();
  }
  /** continuous emitter: rate per second for dur ms (dur = Infinity → forever); opts() returns emit options */
  function stream(dur, rate, opts) {
    const e = { left: dur / 1000, rate, opts, acc: 0, forever: dur === Infinity };
    emitters.push(e); kick();
    return () => { emitters = emitters.filter(x => x !== e); };
  }
  /** flickering error blocks over an area for dur ms */
  function noise(area, dur = 200, n = 6) { blocks.push({ ...area, left: dur / 1000, n }); kick(); }
  return { emit, stream, noise, clear() { parts = []; emitters = []; blocks = []; } };
}

// ---------------- common bits ----------------
export function flash(el, peak = 0.85, dur = 240) {
  return el.animate([{ opacity: peak }, { opacity: 0 }], { duration: dur, easing: "ease-out", fill: "forwards" });
}
export function shockwave(ring, scale = 30, dur = 700) {
  return ring.animate([{ transform: "scale(.2)", opacity: 1 }, { transform: `scale(${scale})`, opacity: 0 }],
    { duration: dur, easing: "cubic-bezier(.1,.7,.3,1)", fill: "forwards" });
}
export function glitchTitle(title, cleanAfter = 420) {
  title.classList.add("in", "striped");
  return wait(cleanAfter).then(() => title.classList.remove("striped"));
}
/** brand + quote fade in, then the topbar */
export async function showTexts(refs, gap = 250) {
  refs.brand.classList.add("show");
  await wait(gap);
  refs.quote.classList.add("show");
  await wait(gap * 2);
  refs.topbar.classList.add("show");
}
export function idleGlitch(title) {
  return setInterval(() => {
    if (!title.classList.contains("in")) return;
    title.classList.remove("burst"); void title.offsetWidth; title.classList.add("burst");
  }, 4500);
}

/** standard runner: replay button + reset of texts */
export function run(refs, play) {
  let idle = 0, ver = 0;
  const reset = () => {
    clearInterval(idle);
    ["show"].forEach(c => [refs.brand, refs.quote, refs.topbar].forEach(e => e.classList.remove(c)));
    refs.title.classList.remove("in", "striped", "burst");
    refs.scan.getAnimations().forEach(a => a.cancel()); refs.scan.style.opacity = "";
    refs.ring.getAnimations().forEach(a => a.cancel());
  };
  const start = async () => {
    const v = ++ver;
    reset();
    await play(() => v === ver);
    if (v === ver) idle = idleGlitch(refs.title);
  };
  document.getElementById("replay").onclick = start;
  Promise.all([document.fonts.ready, preload()]).then(start);
}

/** horizontal slices of the intact glass (for glitch displacement); removed with cleanup() */
export function slices(scene, n = 8) {
  const els = Array.from({ length: n }, (_, i) => {
    const s = document.createElement("div");
    s.className = "slice";
    s.style.backgroundImage = `url("${TEX}glass-demo.png")`;
    s.style.clipPath = `inset(${(i / n) * 100}% 0 ${100 - ((i + 1) / n) * 100}% 0)`;
    scene.group.appendChild(s);
    return s;
  });
  return { els, cleanup: () => els.forEach(e => e.remove()) };
}
