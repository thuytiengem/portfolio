// Organic pre-break shake: small tremors that come and go, then a crescendo.
// Motion comes from layered sine "noise" (not keyframes), so it never looks looped.

const bump = (p, center, width) => Math.exp(-(((p - center) / width) ** 2));
const smoothstep = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);

function noise1D(seed) {
  const f = [0.07, 0.13, 0.23].map(x => x * (0.8 + Math.random() * 0.4));
  const ph = [0, 0, 0].map(() => Math.random() * 100 + seed);
  return t => (Math.sin(t * f[0] + ph[0]) * 0.5 + Math.sin(t * f[1] + ph[1]) * 0.3 + Math.sin(t * f[2] + ph[2]) * 0.2);
}

/**
 * @param el        element to shake (the hero image)
 * @param dur       total time (ms)
 * @param maxPx     max offset at the peak
 * @param maxRot    max rotation (deg)
 * @param onFrame   called with the current intensity 0..1 (drives dust particles)
 */
export function shake(el, { dur = 1000, maxPx = 11, maxRot = 1.1, onFrame } = {}) {
  const nx = noise1D(1), ny = noise1D(7), nr = noise1D(13);
  const t0 = performance.now();
  let prev = t0, tt = 0;
  return new Promise(resolve => {
    function frame(now) {
      const t = now - t0, p = Math.min(1, t / dur);
      // two warning tremors, then it builds up to the break
      const env = Math.min(1, 0.05 + 0.3 * bump(p, 0.12, 0.07) + 0.45 * bump(p, 0.36, 0.08) + smoothstep((p - 0.45) / 0.55) ** 1.6);
      // faster vibration as the intensity grows (phase is integrated, so no jumps)
      tt += (now - prev) * (1 + env * 1.6);
      prev = now;
      const x = nx(tt) * maxPx * env, y = ny(tt) * maxPx * 0.7 * env, r = nr(tt) * maxRot * env;
      const split = (env * 9).toFixed(1);
      el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${r.toFixed(3)}deg) scale(${1 + env * 0.015})`;
      el.style.filter = env > 0.2
        ? `drop-shadow(-${split}px 0 #ff2bd6aa) drop-shadow(${split}px 0 #3ef2ffaa) brightness(${1 + env ** 3 * 0.7})`
        : "";
      onFrame?.(env);
      if (p < 1) requestAnimationFrame(frame); else resolve();
    }
    requestAnimationFrame(frame);
  });
}
