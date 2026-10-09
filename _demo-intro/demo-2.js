// Demo 2 · POWER SURGE — the circuit lines (electric-fx) power on first, the glass fades in behind,
// energy overloads (glitch slices, brightness), then a white-out and the glass explodes in 3D; a few small
// pieces stop mid-air. Idle: every piece (shards + particles) gets occasional "signal error" glitches.
export default async function play({ K, refs, P, alive }) {
  const { rand } = K;
  const sc = K.buildStage(refs.stage);
  const { group, intact, electric } = sc;

  // 0.00 circuit flickers on in the dark
  intact.style.opacity = 0;
  electric.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0.1 }, { opacity: 0.8 }, { opacity: 0 }, { opacity: 1 }],
    { duration: 520, easing: "steps(1)", fill: "both" });
  await K.wait(450); if (!alive()) return;

  // 0.45 glass fades in behind the lines
  intact.animate([{ opacity: 0, filter: "blur(10px)" }, { opacity: 1, filter: "none" }], { duration: 500, fill: "forwards" });
  await K.wait(350); if (!alive()) return;

  // 0.80 overload: glitch slices, brighter and brighter
  electric.animate([{ filter: "drop-shadow(0 0 4px #7ff3ff) brightness(1)" }, { filter: "drop-shadow(0 0 18px #7ff3ff) drop-shadow(0 0 40px #3ef2ff) brightness(2.2)" }],
    { duration: 1000, easing: "ease-in", fill: "forwards" });
  const sl = K.slices(sc, 7);
  sl.els.forEach(s => s.animate(
    Array.from({ length: 8 }, (_, i) => ({ transform: `translateX(${i === 7 ? 0 : rand(-1, 1) * (6 + i * 4)}px)`, opacity: i % 3 === 1 ? 0.4 : 1 })),
    { duration: 1000, easing: "steps(8)", fill: "both" }));
  K.shake(group, { dur: 1000 / K.tempo, maxPx: 6, maxRot: 0.4 });
  await K.wait(1000); if (!alive()) return;
  sl.cleanup();

  // 1.80 white-out + 3D explosion
  K.flash(refs.flash, 1, 450);
  K.shockwave(refs.ring, 40, 900);
  group.style.visibility = "hidden";
  sc.shardsBox.hidden = false;
  sc.glow.animate([{ opacity: 0 }, { opacity: 0.8 }], { duration: 800, fill: "forwards" });
  sc.shards.forEach(s => {
    const h = sc.home(s, 0.8);
    s.img.animate([
      { transform: `translate(${h.x}px, ${h.y}px) rotateY(0deg)`, filter: "brightness(3)" },
      { transform: `translate3d(${s.dir.x * 60}px, ${s.dir.y * 60}px, ${rand(60, 160)}px) rotateX(${rand(-50, 50)}deg) rotateY(${rand(-60, 60)}deg)`, filter: "brightness(1.4)", offset: 0.45 },
      { transform: "none", filter: "none" },
    ], { duration: 1300, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" });
  });
  const c = sc.toHero(K.C0.x, K.C0.y);
  // a small burst of small pieces only; they brake to a stop and stay on screen with signal errors
  P.emit({ ...c, spread: 40, count: 24, names: K.PIXELS, speed: [350, 1100], grav: 0, drag: 3.2, spin: 2, scale: [0.3, 0.65], persist: true, glitch: 0.22 });
  // once settled: the big shards tremble and get the same error glitch
  setTimeout(() => { if (alive()) { K.tremble(sc); K.errorGlitch(sc, P); } }, 1300 / K.tempo);

  await K.wait(450); if (!alive()) return;
  await K.glitchTitle(refs.title);
  if (!alive()) return;
  await K.showTexts(refs);
}
