// Canvas overlay for the intro: block noise, warp streaks and a small particle system
// (dust while shaking, debris chips + sparks when the image breaks).
// Coordinates are CSS pixels relative to the canvas (the hero section).

const NOISE_COLORS = ["#ff2bd6", "#3ef2ff", "#ffffff", "#9b5cff", "#d38cff"];
const rand = (a, b) => a + Math.random() * (b - a);
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;   // ~[-1, 1], centered

export function createFxCanvas(canvas) {
  const g = canvas.getContext("2d");
  let W = 0, H = 0, raf = 0, last = 0;
  let effects = [];      // time-boxed draw functions
  let parts = [];        // particles

  function size() {
    const r = canvas.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = W * d; canvas.height = H * d;
    g.setTransform(d, 0, 0, d, 0, 0);
  }
  new ResizeObserver(size).observe(canvas);
  size();

  function loop(t) {
    const dt = Math.min((t - (last || t)) / 1000, 0.05);
    last = t;
    g.clearRect(0, 0, W, H);
    effects = effects.filter(e => t - e.t0 < e.dur);
    for (const e of effects) e.draw((t - e.t0) / e.dur);
    stepParticles(dt);
    if (effects.length || parts.length) raf = requestAnimationFrame(loop);
    else { raf = 0; last = 0; g.clearRect(0, 0, W, H); }
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  const add = (dur, draw) => { effects.push({ t0: performance.now(), dur, draw }); kick(); };

  // ---------------- particles ----------------
  function stepParticles(dt) {
    parts = parts.filter(p => (p.age += dt) < p.life);
    for (const p of parts) {
      p.vx *= 1 - p.drag * dt;
      p.vy = p.vy * (1 - p.drag * dt) + p.grav * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      const k = p.age / p.life;
      const a = k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4;
      g.globalAlpha = a * p.alpha;
      if (p.kind === "chip") {
        g.save();
        g.translate(p.x, p.y); g.rotate(p.rot);
        g.fillStyle = p.color;
        g.beginPath();
        g.moveTo(p.pts[0] * p.size, p.pts[1] * p.size);
        g.lineTo(p.pts[2] * p.size, p.pts[3] * p.size);
        g.lineTo(p.pts[4] * p.size, p.pts[5] * p.size);
        g.closePath(); g.fill();
        if (p.edge) { g.strokeStyle = "rgba(255,240,255,.7)"; g.lineWidth = 0.8; g.stroke(); }
        g.restore();
      } else {
        g.globalCompositeOperation = "lighter";
        g.fillStyle = p.color;
        g.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        g.globalCompositeOperation = "source-over";
      }
    }
    g.globalAlpha = 1;
  }
  const triangle = () => {
    const a = rand(0, Math.PI * 2);
    return [0, 1, 2].flatMap(i => {
      const ang = a + i * 2.1 + rand(-0.5, 0.5), r = rand(0.45, 1);
      return [Math.cos(ang) * r, Math.sin(ang) * r];
    });
  };

  return {
    /** digital block noise (datamosh) */
    noise(dur = 300, amount = 1, area) {
      add(dur, p => {
        if (Math.random() < 0.3) return;       // flicker
        const a = area || { x: 0, y: 0, w: W, h: H };
        const n = Math.round((14 + Math.random() * 20) * amount * (1 - p * 0.6));
        for (let i = 0; i < n; i++) {
          g.globalAlpha = rand(0.15, 0.65);
          g.fillStyle = NOISE_COLORS[(Math.random() * NOISE_COLORS.length) | 0];
          g.fillRect(a.x + Math.random() * a.w, a.y + Math.random() * a.h,
            10 + Math.random() * (Math.random() < 0.2 ? 360 : 90), 2 + Math.random() * (Math.random() < 0.3 ? 26 : 6));
        }
        g.globalAlpha = 1;
      });
    },

    /** light-speed streaks bursting from (cx, cy) */
    warp(dur = 520, cx = W / 2, cy = H * 0.47) {
      const lines = Array.from({ length: 260 }, () => ({
        a: Math.random() * Math.PI * 2, r: Math.random() * 120, v: rand(0.6, 2.2), w: rand(1, 4),
        c: Math.random() < 0.7 ? "255,255,255" : (Math.random() < 0.5 ? "211,140,255" : "62,242,255"),
      }));
      add(dur, p => {
        const R = Math.hypot(W, H) * 0.6;
        g.globalCompositeOperation = "lighter";
        for (const l of lines) {
          const r1 = l.r + R * l.v * p * p * 1.4, r2 = r1 + R * 0.25 * l.v * (1 - p * 0.5);
          const x1 = cx + Math.cos(l.a) * r1, y1 = cy + Math.sin(l.a) * r1;
          const x2 = cx + Math.cos(l.a) * r2, y2 = cy + Math.sin(l.a) * r2;
          const gr = g.createLinearGradient(x1, y1, x2, y2);
          gr.addColorStop(0, `rgba(${l.c},0)`);
          gr.addColorStop(1, `rgba(${l.c},${0.9 * (1 - p)})`);
          g.strokeStyle = gr; g.lineWidth = l.w;
          g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
        }
        g.globalCompositeOperation = "source-over";
      });
    },

    /** fine dust falling off the image while it shakes; call every frame with intensity 0..1 */
    dust(rect, intensity = 0) {
      const n = Math.random() < intensity * 3 ? Math.ceil(intensity * 4) : 0;
      for (let i = 0; i < n; i++) {
        parts.push({
          kind: Math.random() < 0.7 ? "chip" : "spark", pts: triangle(),
          x: rect.x + rect.w * (0.5 + gauss() * 0.45), y: rect.y + rect.h * (0.5 + gauss() * 0.45),
          vx: rand(-40, 40), vy: rand(-60, 20), grav: 900, drag: 0.5,
          rot: rand(0, 6), vr: rand(-8, 8), size: rand(1.2, 3.6), alpha: 0.9,
          color: Math.random() < 0.5 ? "#f0dcff" : "#b98cff", age: 0, life: rand(0.5, 0.9),
        });
      }
      kick();
    },

    /** the break: textured chips flying out + bright sparks.
        sample(u, v) returns a CSS color of the hero image at (u, v) in 0..1 */
    debris(rect, sample, { chips = 170, sparks = 90 } = {}) {
      const cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2;
      for (let i = 0; i < chips; i++) {
        const u = 0.5 + gauss() * 0.42, v = 0.5 + gauss() * 0.42;
        const x = rect.x + rect.w * u, y = rect.y + rect.h * v;
        const dx = x - cx, dy = y - cy, len = Math.hypot(dx, dy) || 1;
        const sp = rand(300, 1300) * (0.5 + Math.random());
        parts.push({
          kind: "chip", pts: triangle(), edge: Math.random() < 0.35,
          x, y, vx: dx / len * sp + rand(-120, 120), vy: dy / len * sp * 0.75 - rand(80, 320),
          grav: 1500, drag: 0.6, rot: rand(0, 6), vr: rand(-14, 14),
          size: Math.random() < 0.15 ? rand(14, 26) : rand(4, 13), alpha: 1,
          color: sample ? sample(u, v) : "#c48cff", age: 0, life: rand(0.9, 1.9),
        });
      }
      for (let i = 0; i < sparks; i++) {
        const a = Math.random() * Math.PI * 2, sp = rand(500, 1700);
        parts.push({
          kind: "spark", x: cx + gauss() * rect.w * 0.15, y: cy + gauss() * rect.h * 0.15,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.7, grav: 500, drag: 1.4,
          rot: 0, vr: 0, size: rand(2, 6), alpha: 1,
          color: ["#ffffff", "#e9c8ff", "#5affe6", "#ff7ae6"][(Math.random() * 4) | 0], age: 0, life: rand(0.4, 1.1),
        });
      }
      kick();
    },

    clear() { effects = []; parts = []; },
  };
}

/** Builds a color sampler for an image URL (used to texture the debris). */
export function createSampler(url) {
  let data = null;
  const img = new Image();
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = 96; c.height = 54;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0, c.width, c.height);
    try { data = g.getImageData(0, 0, c.width, c.height).data; } catch { data = null; }
  };
  img.src = url;
  return (u, v) => {
    if (!data) return "#c48cff";
    const x = Math.max(0, Math.min(95, (u * 96) | 0)), y = Math.max(0, Math.min(53, (v * 54) | 0));
    const i = (y * 96 + x) * 4, k = 1.25;       // a bit brighter than the source: fresh broken edges
    return `rgb(${Math.min(255, data[i] * k)},${Math.min(255, data[i + 1] * k)},${Math.min(255, data[i + 2] * k)})`;
  };
}
