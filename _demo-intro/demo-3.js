// Demo 3 · SLOW-MO FREEZE — one impact at the center, the glass bursts fast then decelerates
// into a frozen, floating 3D arrangement; debris hangs in zero gravity; shards follow the mouse (parallax).
export default async function play({ K, refs, P, alive }) {
  const { rand } = K;
  const sc = K.buildStage(refs.stage);
  const { group, electric } = sc;

  // 0.00 calm fade in
  group.animate([{ opacity: 0, transform: "scale(1.04)" }, { opacity: 1, transform: "scale(1)" }],
    { duration: 700, easing: "ease-out", fill: "both" });
  electric.animate([{ opacity: 0 }, { opacity: 0.7 }], { duration: 700, delay: 200, fill: "both" });
  await K.wait(850); if (!alive()) return;

  // 0.85 impact: bright point + shock ring + instant cracks
  K.flash(refs.flash, 0.35, 180);
  K.shockwave(refs.ring, 22, 600);
  K.drawCracks(sc.cracks, 16);
  K.shake(group, { dur: 160 / K.tempo, maxPx: 8 });
  await K.wait(180); if (!alive()) return;

  // 1.03 burst → slow-motion freeze
  group.style.visibility = "hidden";
  sc.shardsBox.hidden = false;
  refs.stage.animate([{ transform: "translate(-50%,-50%) scale(1)" }, { transform: "translate(-50%,-50%) scale(1.05)" }],
    { duration: 3200, easing: "cubic-bezier(.1,.6,.3,1)", fill: "forwards" });
  sc.glow.animate([{ opacity: 0 }, { opacity: 0.9 }], { duration: 1200, fill: "forwards" });
  sc.shards.forEach(s => {
    const h = sc.home(s, 0.8);
    s.img.animate([
      { transform: `translate(${h.x}px, ${h.y}px)`, filter: "brightness(1.8)" },
      { transform: `translate3d(${s.dir.x * 14}px, ${s.dir.y * 14}px, ${s.depth * 90}px) rotateX(${rand(-14, 14)}deg) rotateY(${rand(-18, 18)}deg) rotate(${rand(-4, 4)}deg)`, filter: "none" },
    ], { duration: 2600, easing: "cubic-bezier(.02,.9,.08,1)", fill: "both" });
  });
  const c = sc.toHero(K.C0.x, K.C0.y);
  P.emit({ ...c, spread: 30, count: 60, names: K.CHIPS, speed: [500, 1400], grav: 0, drag: 3.2, scale: [0.4, 1.2], spin: 3, life: [3.5, 5] });
  P.emit({ ...c, spread: 20, count: 80, names: K.PIXELS, speed: [400, 1300], grav: 0, drag: 3.6, scale: [0.25, 0.7], life: [3, 5], blend: "lighter" });
  // floating dust forever
  P.stream(Infinity, 6, () => {
    const p = sc.toHero(rand(0, K.W0), rand(0, K.H0));
    return { ...p, names: Math.random() < 0.4 ? K.CHIPS : K.PIXELS, speed: [5, 25], grav: -6, drag: 0, scale: [0.2, 0.55], spin: 0.6, life: [4, 7], fadeIn: 0.3, alpha: 0.8 };
  });

  // mouse parallax (deeper shards move more)
  const onMove = e => {
    const mx = e.clientX / innerWidth - 0.5, my = e.clientY / innerHeight - 0.5;
    sc.shards.forEach(s => { s.wrap.style.translate = `${mx * 30 * s.depth}px ${my * 20 * s.depth}px`; });
  };
  window.removeEventListener("pointermove", window.__par);
  window.__par = onMove;
  window.addEventListener("pointermove", onMove);
  setTimeout(() => alive() && K.tremble(sc, [0.3, 1], [2.4, 4]), 2600 / K.tempo);

  await K.wait(500); if (!alive()) return;
  await K.glitchTitle(refs.title);
  if (!alive()) return;
  await K.showTexts(refs, 350);
}
