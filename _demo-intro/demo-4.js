// Demo 4 · ASSEMBLE — reverse take: the shards fly in from all around and lock into the broken
// formation one by one (spark on each landing), energy streams inward, then the circuit lights up behind.
export default async function play({ K, refs, P, alive }) {
  const { rand } = K;
  const sc = K.buildStage(refs.stage);
  const { group, intact, electric } = sc;
  intact.style.display = "none";
  electric.style.opacity = 0;
  sc.shardsBox.hidden = false;

  // energy streaming toward the center
  const c = sc.toHero(K.C0.x, K.C0.y);
  const stopIn = P.stream(1700, 70, () => {
    const a = rand(0, Math.PI * 2), r = rand(500, 900);
    return { x: c.x + Math.cos(a) * r, y: c.y + Math.sin(a) * r * 0.6, angle: [a + Math.PI, a + Math.PI], speed: [500, 800],
             grav: 0, drag: 0, names: K.PIXELS, scale: [0.25, 0.6], life: [0.7, 0.9], blend: "lighter", fadeIn: 0.3 };
  });

  // 0.00 shards fly in, staggered (far ones first)
  const f = sc.f;
  const order = [...sc.shards].sort((a, b) => b.dist - a.dist);
  order.forEach((s, i) => {
    const far = rand(700, 1100);
    const delay = 150 + i * 75;
    s.img.animate([
      { transform: `translate3d(${s.dir.x * far}px, ${s.dir.y * far * 0.7}px, ${rand(-200, 300)}px) rotate(${rand(-200, 200)}deg) rotateX(${rand(-80, 80)}deg)`, opacity: 0 },
      { opacity: 1, offset: 0.3 },
      { transform: "none", opacity: 1 },
    ], { duration: 800, delay, easing: "cubic-bezier(.2,1.25,.4,1)", fill: "both" });
    // spark where it lands
    setTimeout(() => {
      if (!alive()) return;
      const p = sc.toHero(s.cx, s.cy);
      P.emit({ ...p, spread: 14 * f, count: 10, names: K.PIXELS, speed: [80, 300], grav: 300, drag: 2, scale: [0.25, 0.6], life: [0.3, 0.6], blend: "lighter" });
      P.emit({ ...p, count: 2, names: K.CHIPS, speed: [80, 220], grav: 900, scale: [0.4, 0.8], life: [0.6, 1] });
    }, (delay + 620) / K.tempo);
  });
  await K.wait(150 + order.length * 75 + 650); if (!alive()) return;
  stopIn();

  // 1.85 locked: pulse + circuit lights up behind the shards
  K.flash(refs.flash, 0.5, 260);
  K.shockwave(refs.ring, 34, 800);
  sc.glow.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, fill: "forwards" });
  group.style.zIndex = 0;
  electric.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0.2 }, { opacity: 0.9 }, { opacity: 0.55 }],
    { duration: 700, easing: "steps(1)", fill: "forwards" });
  K.tremble(sc);

  await K.wait(120); if (!alive()) return;
  await K.glitchTitle(refs.title);
  if (!alive()) return;
  await K.showTexts(refs);
}
