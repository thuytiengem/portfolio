// Sprite particles on the hero canvas (particle-* textures) + flickering "error" noise blocks.

const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[(Math.random() * arr.length) | 0];

export function createParticles(canvas, sprites) {
  const g = canvas.getContext("2d");
  let W = 0, H = 0, parts = [], raf = 0, last = 0, blocks = [], on = true;
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
  new ResizeObserver(() => { size(); kick(); }).observe(canvas); size();

  function loop(t) {
    const dt = Math.min((t - (last || t)) / 1000, 0.05);
    last = t;
    g.clearRect(0, 0, W, H);
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
      let a = (k > 0.65 ? 1 - (k - 0.65) / 0.35 : 1) * p.alpha;
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
      g.globalCompositeOperation = "source-over";
      g.globalAlpha = a;
      draw(p.img, gx);
    }
    g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    if (on && (parts.length || blocks.length)) raf = requestAnimationFrame(loop); else { raf = 0; last = 0; }
  }
  const kick = () => { if (on && !raf) raf = requestAnimationFrame(loop); };

  /** o: { x, y, spread, count, names, speed:[a,b], angle:[a,b], grav, drag, life:[a,b], scale:[a,b], spin, alpha,
   *       persist: stay on screen forever, glitch: average glitches per second } */
  function emit(o) {
    for (let i = 0; i < (o.count ?? 1); i++) {
      const a = rand(...(o.angle || [0, Math.PI * 2])), sp = rand(...(o.speed || [100, 400]));
      const sx = o.spread ?? 0;
      parts.push({
        img: sprites[pick(o.names)], x: o.x + rand(-sx, sx), y: o.y + rand(-sx, sx),
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, grav: o.grav ?? 900, drag: o.drag ?? 0.6,
        rot: rand(0, 6.28), vr: rand(-(o.spin ?? 8), o.spin ?? 8), s: rand(...(o.scale || [0.6, 1.2])),
        life: o.persist ? Infinity : rand(...(o.life || [0.8, 1.6])), age: 0, alpha: o.alpha ?? 1,
        persist: !!o.persist, glitch: o.glitch || 0, gl: 0, gdx: 0,
      });
    }
    kick();
  }
  /** flickering error blocks over an area for dur ms */
  function noise(area, dur = 200, n = 6) { blocks.push({ ...area, left: dur / 1000, n }); kick(); }
  /** false stops drawing (hero off screen); persistent particles resume where they were */
  function setActive(v) { on = v; kick(); }
  return { emit, noise, setActive };
}
