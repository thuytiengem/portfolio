// Demo 5 · GLITCH CUT — digital take: the glass appears with RGB split and scanlines, the signal
// tears into sliding slices, then a hard "cut": shards stutter between whole/broken frames and snap.
export default async function play({ K, refs, P, alive }) {
  const { rand } = K;
  const sc = K.buildStage(refs.stage);
  const { group, electric } = sc;
  const RGB = (px) => `drop-shadow(${-px}px 0 #ff2bd6) drop-shadow(${px}px 0 #3ef2ff)`;

  refs.scan.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: "forwards" });

  // 0.00 signal acquires: steps of RGB split
  group.animate([
    { opacity: 0, filter: RGB(14), transform: "translateX(-20px) skewX(-8deg)" },
    { opacity: 1, filter: RGB(8), transform: "translateX(14px)" },
    { opacity: 0.3, filter: RGB(4), transform: "none" },
    { opacity: 1, filter: RGB(2), transform: "translateX(-4px)" },
    { opacity: 1, filter: RGB(1), transform: "none" },
  ], { duration: 450, easing: "steps(1)", fill: "both" });
  electric.animate([{ opacity: 0 }, { opacity: 0.9 }], { duration: 300, delay: 250, easing: "steps(3)", fill: "both" });
  await K.wait(600); if (!alive()) return;

  // 0.60 signal tears: slices slide, pixel streaks
  const sl = K.slices(sc, 10);
  sl.els.forEach((s, i) => s.animate(
    Array.from({ length: 10 }, (_, k) => ({ transform: `translateX(${k === 9 ? 0 : (Math.random() < 0.5 ? 0 : rand(-1, 1) * (10 + k * 6))}px)`,
      filter: Math.random() < 0.3 ? RGB(6) : "none" })),
    { duration: 700, easing: "steps(10)", fill: "both" }));
  const stopStreaks = P.stream(700, 120, () => {
    const p = sc.toHero(rand(K.INTACT.x, K.INTACT.x + K.INTACT.w), rand(K.INTACT.y, K.INTACT.y + K.INTACT.h));
    const right = Math.random() < 0.5;
    return { ...p, names: K.PIXELS, angle: right ? [0, 0] : [Math.PI, Math.PI], speed: [400, 1200], grav: 0, drag: 5, scale: [0.3, 0.7], life: [0.25, 0.45], blend: "lighter" };
  });
  await K.wait(700); if (!alive()) return;
  stopStreaks(); sl.cleanup();

  // 1.30 HARD CUT: stutter between whole and broken, then snap
  K.flash(refs.flash, 0.6, 120);
  group.style.visibility = "hidden";
  sc.shardsBox.hidden = false;
  const f = sc.f;
  sc.shards.forEach(s => {
    const h = sc.home(s, 0.8);
    const at = k => `translate(${h.x * k + s.dir.x * rand(-6, 6) * f}px, ${h.y * k}px)`;
    s.img.animate([
      { transform: at(1), filter: RGB(8) },
      { transform: at(0.2), filter: RGB(5) },
      { transform: at(0.8), filter: RGB(10) },
      { transform: at(0), filter: RGB(3) },
      { transform: at(0.4), filter: RGB(6) },
      { transform: "none", filter: RGB(2) },
      { transform: "none", filter: "none" },
    ], { duration: 480, easing: "steps(1)", fill: "both" });
  });
  const c = sc.toHero(K.C0.x, K.C0.y);
  for (let row = -4; row <= 4; row++) {           // pixel bursts in horizontal bands
    P.emit({ x: c.x, y: c.y + row * 28 * f, spreadX: 40, spreadY: 4, count: 16, names: K.PIXELS,
      angle: Math.random() < 0.5 ? [-0.08, 0.08] : [Math.PI - 0.08, Math.PI + 0.08], speed: [500, 1600], grav: 0, drag: 2.5, scale: [0.3, 0.8], life: [0.5, 1], blend: "lighter" });
  }
  P.emit({ ...c, spread: 40, count: 45, names: K.CHIPS, speed: [300, 1100], grav: 1200, scale: [0.5, 1.2], spin: 10, life: [0.9, 1.6] });
  sc.glow.animate([{ opacity: 0 }, { opacity: 0.8 }], { duration: 500, easing: "steps(4)", fill: "forwards" });
  setTimeout(() => alive() && K.tremble(sc), 500 / K.tempo);

  await K.wait(300); if (!alive()) return;
  refs.scan.animate([{ opacity: 1 }, { opacity: 0.25 }], { duration: 800, fill: "forwards" });
  await K.glitchTitle(refs.title);
  if (!alive()) return;
  await K.showTexts(refs);
}
