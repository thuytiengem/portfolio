// Demo 1 · IMPACT SHATTER — glass powers on, shakes harder and harder, cracks, then bursts
// outward (with overshoot) into the broken layout; glass chips + pixels fly out with gravity.
export default async function play({ K, refs, P, alive }) {
  const { rand } = K;
  const sc = K.buildStage(refs.stage);
  const { group, electric } = sc;

  // 0.00 glass flickers in, circuit lines draw outward from the ring
  group.animate([{ opacity: 0, filter: "brightness(3) blur(6px)" }, { opacity: 1, filter: "none" }],
    { duration: 350, easing: "steps(5)", fill: "both" });
  electric.animate([
    { opacity: 0, clipPath: "circle(0% at 36% 52%)" },
    { opacity: 1, clipPath: "circle(25% at 36% 52%)", offset: 0.35 },
    { opacity: 0.5, offset: 0.5 },
    { opacity: 1, clipPath: "circle(120% at 36% 52%)" },
  ], { duration: 900, delay: 150, easing: "ease-out", fill: "both" });
  await K.wait(450); if (!alive()) return;

  // 0.45 organic shake, dust + tiny chips falling off
  await K.shake(group, {
    dur: 1050 / K.tempo, maxPx: 12,
    onFrame: env => {
      if (Math.random() > env * 0.9) return;
      const p = sc.toHero(K.INTACT.x + rand(0.15, 0.85) * K.INTACT.w, K.INTACT.y + rand(0.2, 0.8) * K.INTACT.h);
      P.emit({ ...p, names: Math.random() < 0.5 ? K.CHIPS : K.PIXELS, speed: [10, 60], angle: [-Math.PI, 0], grav: 700, scale: [0.25, 0.5], life: [0.5, 0.9] });
    },
  });
  if (!alive()) return;

  // 1.50 cracks
  K.drawCracks(sc.cracks);
  await K.wait(160); if (!alive()) return;

  // 1.66 BREAK
  K.flash(refs.flash);
  K.shockwave(refs.ring);
  group.style.visibility = "hidden";
  sc.shardsBox.hidden = false;
  sc.glow.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, fill: "forwards" });
  const f = sc.f;
  sc.shards.forEach(s => {
    const h = sc.home(s, 0.8);
    s.img.animate([
      { transform: `translate(${h.x}px, ${h.y}px)`, filter: "brightness(2.2)" },
      { transform: `translate(${s.dir.x * 34 * f}px, ${s.dir.y * 34 * f}px) rotate(${rand(-6, 6)}deg)`, filter: "brightness(1.2)", offset: 0.5 },
      { transform: "none", filter: "none" },
    ], { duration: 900, easing: "cubic-bezier(.15,.85,.25,1)", fill: "both" });
  });
  const c = sc.toHero(K.C0.x, K.C0.y);
  P.emit({ ...c, spread: 40, count: 70, names: K.CHIPS, speed: [300, 1300], grav: 1400, scale: [0.5, 1.3], spin: 12, life: [1, 1.8] });
  P.emit({ ...c, spread: 30, count: 90, names: K.PIXELS, speed: [400, 1500], grav: 600, drag: 1.2, scale: [0.3, 0.8], life: [0.6, 1.3], blend: "lighter" });
  setTimeout(() => alive() && K.tremble(sc), 900 / K.tempo);

  await K.wait(200); if (!alive()) return;
  await K.glitchTitle(refs.title);
  if (!alive()) return;
  await K.showTexts(refs);
}
