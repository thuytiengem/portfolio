// Glass scene built from assets/images/intro-texture/*: intact glass + circuit lines, 14 shards that sit
// where they are in glass-broken-demo.png, plus the idle tremble and "signal error" glitches.

export const TEX = "assets/images/intro-texture/";
export const W0 = 1110, H0 = 644;                         // glass-broken-demo.png size = stage coordinates
export const C0 = { x: W0 / 2, y: H0 / 2 };
const INTACT = { x: 88, y: 64, w: 933, h: 515 };          // glass-demo.png placed in stage coordinates
// where each shard sits in glass-broken-demo.png (found by template matching)
const LAYOUT = {
  "glass-1": { x: 676, y: 62, w: 436, h: 250, s: 0.98 }, "glass-2": { x: 578, y: 280, w: 419, h: 258, s: 1 },
  "glass-3": { x: 636, y: 422, w: 426, h: 212, s: 0.98 }, "glass-4": { x: 506, y: 352, w: 212, h: 244, s: 0.88 },
  "glass-5": { x: 364, y: 378, w: 132, h: 245, s: 0.93 }, "glass-6": { x: 38, y: 398, w: 404, h: 245, s: 1 },
  "glass-7": { x: 68, y: 166, w: 417, h: 412, s: 0.98 }, "glass-8": { x: 2, y: 24, w: 424, h: 198, s: 0.98 },
  "glass-9": { x: 260, y: 60, w: 243, h: 179, s: 0.98 }, "glass-10": { x: 392, y: 28, w: 118, h: 195, s: 0.93 },
  "glass-11": { x: 498, y: 62, w: 89, h: 196, s: 0.97 }, "glass-12": { x: 964, y: 122, w: 49, h: 160, s: 0.87 },
  "glass-13": { x: 612, y: 0, w: 159, h: 150, s: 1 }, "glass-14": { x: 532, y: 48, w: 475, h: 239, s: 1.02 },
};
export const PIXELS = ["particle-1", "particle-2", "particle-3", "particle-4", "particle-5"];

export const rand = (a, b) => a + Math.random() * (b - a);

/** loads every texture; resolves to { name: HTMLImageElement } (particles draw from it) */
export function preloadTextures() {
  const names = ["glass-demo", "electric-fx", ...Object.keys(LAYOUT), ...PIXELS];
  return Promise.all(names.map(n => new Promise(res => {
    const img = new Image(); img.onload = img.onerror = () => res(img); img.src = `${TEX}${n}.png`;
  }))).then(imgs => Object.fromEntries(names.map((n, i) => [n, imgs[i]])));
}

const pct = (v, total) => `${(v / total) * 100}%`;
const box = (el, b) => Object.assign(el.style, { left: pct(b.x, W0), top: pct(b.y, H0), width: pct(b.w, W0), height: pct(b.h, H0) });

export function buildStage(stage) {
  stage.innerHTML = "";
  const glow = Object.assign(document.createElement("div"), { className: "glow" });
  const group = Object.assign(document.createElement("div"), { className: "group" });
  box(group, INTACT);
  group.innerHTML = `<img class="intact" src="${TEX}glass-demo.png" alt="">
    <img class="electric" src="${TEX}electric-fx.png" alt="">`;
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
    return { name, wrap, img, cx, cy, dir: { x: (cx - C0.x) / len, y: (cy - C0.y) / len } };
  });
  stage.append(glow, group, shardsBox);
  return {
    stage, glow, group, shardsBox, shards,
    intact: group.querySelector(".intact"), electric: group.querySelector(".electric"),
    /** offset (px) that moves a shard back to where it was in the intact glass */
    home(s, k = 0.8) { const f = stage.clientWidth / W0; return { x: (C0.x + (s.cx - C0.x) * k - s.cx) * f, y: (C0.y + (s.cy - C0.y) * k - s.cy) * f }; },
    /** stage point → hero px */
    toHero(x, y) {
      const r = stage.getBoundingClientRect(), h = stage.parentElement.getBoundingClientRect(), f = r.width / W0;
      return { x: r.left - h.left + x * f, y: r.top - h.top + y * f };
    },
  };
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
 * rate = average errors per second per shard; active() = false pauses it (hero off screen).
 */
export function errorGlitch(scene, P, { rate = 0.07, burstEvery = [4, 7], active = () => true } = {}) {
  const RGB = px => `drop-shadow(${-px}px 0 #ff2bd6) drop-shadow(${px}px 0 #3ef2ff)`;
  const fail = s => {
    if (s.busy) return;
    s.busy = true;
    const dur = rand(140, 320), steps = 6;
    s.wrap.animate(Array.from({ length: steps + 1 }, (_, i) => i === steps ? { filter: "none", opacity: 1 } : {
      filter: `${RGB(rand(2, 8).toFixed(1))} brightness(${rand(0.9, 1.6).toFixed(2)}) hue-rotate(${rand(-30, 30) | 0}deg)`,
      opacity: Math.random() < 0.25 ? rand(0.2, 0.6) : 1,
    }), { duration: dur, easing: "steps(1)" });
    // torn bands: copies of the shard clipped to thin strips, shifted sideways
    const bands = Array.from({ length: (Math.random() * 3 + 1) | 0 }, () => {
      const top = rand(0, 90), hgt = rand(4, 16);
      const b = s.img.cloneNode();
      Object.assign(b.style, { position: "absolute", left: 0, top: 0, clipPath: `inset(${top}% 0 ${Math.max(0, 100 - top - hgt)}% 0)` });
      s.wrap.appendChild(b);
      b.animate(Array.from({ length: steps }, () => ({ transform: `translateX(${rand(-1, 1) * rand(6, 22)}px)`, opacity: Math.random() < 0.3 ? 0 : 1 })),
        { duration: dur, easing: "steps(1)", fill: "both" });
      return b;
    });
    const r = s.wrap.getBoundingClientRect(), hr = scene.stage.parentElement.getBoundingClientRect();
    P?.noise({ x: r.left - hr.left, y: r.top - hr.top, w: r.width, h: r.height }, dur, 4);
    setTimeout(() => { bands.forEach(b => b.remove()); s.busy = false; }, dur);
  };
  let nextBurst = performance.now() + rand(...burstEvery) * 1000;
  const timer = setInterval(() => {
    if (document.hidden || !active()) return;
    scene.shards.forEach(s => { if (Math.random() < rate * 0.1) fail(s); });
    if (performance.now() > nextBurst) {           // a bigger error: several shards at once
      nextBurst = performance.now() + rand(...burstEvery) * 1000;
      [...scene.shards].sort(() => Math.random() - 0.5).slice(0, rand(3, 6) | 0).forEach((s, i) => setTimeout(() => fail(s), i * 40));
    }
  }, 100);
  return () => clearInterval(timer);
}

export function flash(el, peak = 1, dur = 450) {
  return el.animate([{ opacity: peak }, { opacity: 0 }], { duration: dur, easing: "ease-out", fill: "forwards" });
}
export function shockwave(ring, scale = 40, dur = 900) {
  return ring.animate([{ transform: "scale(.2)", opacity: 1 }, { transform: `scale(${scale})`, opacity: 0 }],
    { duration: dur, easing: "cubic-bezier(.1,.7,.3,1)", fill: "forwards" });
}
