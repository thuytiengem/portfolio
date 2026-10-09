// Full-screen "letter rain": each drop is the word falling as a whole (head = last letter),
// moving continuously, wrapped in a soft teardrop-shaped glow.
export function createRain(canvas, opts = {}) {
  const o = Object.assign({
    word: "thuytiengem",
    fontSize: 18,
    speed: 1,
    density: 0.35,      // share of columns that have a falling drop
  }, opts);

  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, dpr = 1, cols = 0, drops = [], last = 0, raf = 0;
  const colW = () => o.fontSize * 2.2;

  // ---- pre-rendered sprites (soft shapes drawn once, reused every frame) ----
  function makeSprite(w, h, draw) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    // blur via shadow offset trick: works in every browser, unlike ctx.filter
    g.shadowColor = "#fff";
    g.shadowBlur = 14;
    g.shadowOffsetX = w * 4;
    g.translate(-w * 4, 0);
    draw(g, w, h);
    return c;
  }
  // teardrop: thin tail on top, round belly at the bottom (around the head letter)
  const tear = makeSprite(80, 400, (g, w, h) => {
    const cx = w / 2, r = 16, by = h - r - 18;
    const grad = g.createLinearGradient(0, 10, 0, h);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(0.55, "rgba(0,0,0,.35)");
    grad.addColorStop(1, "rgba(0,0,0,1)");
    g.shadowColor = "rgb(125,105,255)";
    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(cx, 12);
    g.bezierCurveTo(cx + 2, h * 0.45, cx + r, by - r * 2.2, cx + r, by);
    g.arc(cx, by, r, 0, Math.PI);
    g.bezierCurveTo(cx - r, by - r * 2.2, cx - 2, h * 0.45, cx, 12);
    g.fill();
  });
  const bloom = makeSprite(96, 96, (g, w, h) => {
    const grad = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2 - 14);
    grad.addColorStop(0, "rgba(0,0,0,1)");
    grad.addColorStop(0.3, "rgba(0,0,0,.6)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.shadowColor = "rgb(175,185,255)";
    g.fillStyle = grad;
    g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 14, 0, Math.PI * 2); g.fill();
  });

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(W / colW());
    syncDrops();
  }

  function newDrop(initial) {
    const used = new Set(drops.map(d => d.col));
    let col = Math.floor(Math.random() * cols), tries = 0;
    while (used.has(col) && tries++ < 20) col = Math.floor(Math.random() * cols);
    const depth = 0.65 + Math.random() * 0.5;          // smaller = further away = slower + dimmer
    const size = o.fontSize * depth;
    return {
      col, depth, size,
      y: initial ? Math.random() * (H + size * 14) : -Math.random() * H * 0.5,
      v: (40 + Math.random() * 50) * depth,
    };
  }

  function syncDrops() {
    const want = Math.max(1, Math.round(cols * o.density));
    while (drops.length < want) drops.push(newDrop(true));
    drops.length = want;
  }

  function frame(t) {
    const dt = Math.min((t - (last || t)) / 1000, 0.05);
    last = t;
    ctx.clearRect(0, 0, W, H);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const cw = colW(), word = o.word, len = word.length;

    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      d.y += d.v * o.speed * dt;
      const x = d.col * cw + cw / 2;
      const lh = d.size * 1.25;
      const span = len * lh;
      const fade = 0.55 + 0.45 * (d.depth - 0.65) / 0.5;   // depth dimming

      // glow behind: teardrop + bloom at the head
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = fade * 0.75;
      const tw = d.size * 2.8;
      ctx.drawImage(tear, x - tw / 2, d.y - span - lh * 0.4, tw, span + lh * 1.6);
      const bw = d.size * 4.2;
      ctx.drawImage(bloom, x - bw / 2, d.y - bw / 2, bw, bw);
      ctx.globalCompositeOperation = "source-over";

      // letters ride with the drop -> perfectly smooth motion
      ctx.font = `${d.size}px Ebrima, "Segoe UI", sans-serif`;
      for (let k = len - 1; k >= 0; k--) {
        const y = d.y - k * lh;
        if (y < -lh || y > H + lh) continue;
        const ch = word[len - 1 - k];
        if (k === 0) {
          ctx.globalAlpha = fade;
          ctx.fillStyle = "#f6f8ff";
        } else {
          ctx.globalAlpha = Math.pow(1 - k / len, 1.5) * fade;
          const m = 1 - k / len;
          ctx.fillStyle = `rgb(${150 + 70 * m},${130 + 90 * m},255)`;
        }
        ctx.fillText(ch, x, y);
      }
      ctx.globalAlpha = 1;

      if (d.y - span > H) drops[i] = newDrop(false);
    }
    raf = requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  resize();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) o.speed *= 0.25;
  raf = requestAnimationFrame(frame);

  return {
    set(next) { Object.assign(o, next); syncDrops(); },
    // pause while nothing shows it (e.g. the opaque hero fills the screen)
    pause() { cancelAnimationFrame(raf); raf = 0; },
    resume() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } },
  };
}
