// Cracks + shattering the hero image into radial shards that stay and tremble slowly.

const SVG_NS = "http://www.w3.org/2000/svg";
const rand = (a, b) => a + Math.random() * (b - a);

/** cracks radiating from the center; svg viewBox is 0 0 160 90 */
export function drawCracks(svg, count = 12) {
  svg.innerHTML = "";
  for (let i = 0; i < count; i++) {
    let d = "M80 45";
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.3;
    for (let s = 1; s <= 4; s++) {
      const x = 80 + Math.cos(a + rand(-0.2, 0.2)) * s * 22;
      const y = 45 + Math.sin(a + rand(-0.2, 0.2)) * s * 13;
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    const p = document.createElementNS(SVG_NS, "path");
    p.setAttribute("d", d);
    p.setAttribute("pathLength", "1");
    p.style.animationDelay = `${Math.random() * 60}ms`;
    svg.appendChild(p);
  }
  svg.classList.remove("on");
  void svg.getBoundingClientRect();
  svg.classList.add("on");
}

/**
 * @param art      .hero-art container
 * @param img      .hero-art-img (hidden after the break)
 * @param cracks   crack svg (cleared)
 * @param instant  skip the burst animation (reduced motion)
 * @param tremble  { px: [min,max], sec: [min,max] } — how much / how slow the shards tremble
 */
export function shatter({ art, img, cracks, instant = false, tremble = { px: [0.4, 1.3], sec: [1.8, 3.4] } }) {
  const cx = 50, cy = 50;
  const angles = [];
  for (let a = Math.random() * 0.4; a < Math.PI * 2; a += rand(0.38, 0.78)) angles.push(a);
  const rings = [0, 14, 32, 58, 160];
  const R = rings.map((r, i) => angles.map(() => i === 0 ? 0 : r * rand(0.8, 1.2)));
  const pt = (ri, ai) => {
    const k = ai % angles.length, a = angles[k];
    return [cx + Math.cos(a) * R[ri][k], cy + Math.sin(a) * R[ri][k]];
  };
  const bg = img.style.backgroundImage;
  const frag = document.createDocumentFragment();
  const j = () => `${((Math.random() < 0.5 ? -1 : 1) * rand(...tremble.px)).toFixed(2)}px`;

  for (let ri = 0; ri < rings.length - 1; ri++) {
    for (let ai = 0; ai < angles.length; ai++) {
      const pts = [pt(ri, ai), pt(ri, ai + 1), pt(ri + 1, ai + 1), pt(ri + 1, ai)];
      const mx = pts.reduce((s, p) => s + p[0], 0) / 4 - cx;
      const my = pts.reduce((s, p) => s + p[1], 0) / 4 - cy;
      const len = Math.hypot(mx, my) || 1;

      const wrap = document.createElement("div");
      wrap.className = "shard-wrap";
      wrap.style.setProperty("--ja", j());
      wrap.style.setProperty("--jb", j());
      wrap.style.setProperty("--jr", `${rand(-0.35, 0.35).toFixed(2)}deg`);
      wrap.style.setProperty("--td", `${rand(...tremble.sec).toFixed(2)}s`);
      wrap.style.setProperty("--tdl", `${(-Math.random() * 3).toFixed(2)}s`);

      const sh = document.createElement("div");
      sh.className = "shard";
      sh.style.backgroundImage = bg;
      sh.style.clipPath = `polygon(${pts.map(p => `${p[0]}% ${p[1]}%`).join(",")})`;
      wrap.appendChild(sh);
      frag.appendChild(wrap);

      const dist = 10 + ri * 16 + Math.random() * 20;
      const end = {
        transform: `translate3d(${mx / len * dist}px, ${my / len * dist}px, ${Math.random() * 50}px) rotateZ(${rand(-9, 9)}deg) rotateX(${rand(-15, 15)}deg)`,
        opacity: 0.94 - ri * 0.08, filter: "brightness(1)",
      };
      if (instant) Object.assign(sh.style, end);
      else sh.animate([{ transform: "none", opacity: 1, filter: "brightness(2.2)" }, end],
        { duration: 520, easing: "cubic-bezier(.05,.9,.2,1)", fill: "forwards" });
    }
  }
  img.style.visibility = "hidden";
  cracks.classList.remove("on");
  cracks.innerHTML = "";
  art.appendChild(frag);
  art.classList.add("broken");
}

export function flash(el, peak = 0.85, dur = 220) {
  el.animate([{ opacity: peak }, { opacity: 0 }], { duration: dur, easing: "ease-out", fill: "forwards" });
}
