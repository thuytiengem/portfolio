// PORTFOLIO title glitches.

const rand = (a, b) => a + Math.random() * (b - a);

/**
 * Idle "signal error" on the title (same look as errorGlitch() on the shards): RGB split, flicker,
 * a small jolt and torn horizontal bands; random gaps, sometimes a double hit.
 * active() = false pauses it (hero off screen). Returns a stop function.
 */
export function idleGlitch(title, { every = [2, 5.5], active = () => true } = {}) {
  let timer = 0;
  const fail = () => {
    if (document.hidden || !active() || !title.classList.contains("in")) return;
    const dur = rand(160, 380), steps = 6, px = () => rand(3, 12).toFixed(1);
    title.animate(Array.from({ length: steps + 1 }, (_, i) => i === steps ? { filter: "none", opacity: 1, transform: "none" } : {
      filter: `drop-shadow(${-px()}px 0 #ff2bd6) drop-shadow(${px()}px 0 #3ef2ff) brightness(${rand(0.9, 1.7).toFixed(2)}) hue-rotate(${rand(-30, 30) | 0}deg)`,
      opacity: Math.random() < 0.25 ? rand(0.25, 0.6) : 1,
      transform: `translateX(${rand(-6, 6).toFixed(1)}px) skewX(${Math.random() < 0.3 ? rand(-12, 12) | 0 : 0}deg)`,
    }), { duration: dur, easing: "steps(1)" });
    // torn bands: copies of the word clipped to thin strips, shifted sideways
    const bands = Array.from({ length: rand(2, 5) | 0 }, () => {
      const top = rand(0, 88), hgt = rand(4, 14);
      const b = document.createElement("span");
      b.className = "glitch-band"; b.setAttribute("aria-hidden", "true");
      b.textContent = title.dataset.text || title.textContent;
      b.style.clipPath = `inset(${top}% 0 ${Math.max(0, 100 - top - hgt)}% 0)`;
      title.appendChild(b);
      b.animate(Array.from({ length: steps }, () => ({ transform: `translateX(${rand(-1, 1) * rand(10, 48)}px)`, opacity: Math.random() < 0.3 ? 0 : 1 })),
        { duration: dur, easing: "steps(1)", fill: "both" });
      return b;
    });
    setTimeout(() => bands.forEach(b => b.remove()), dur);
  };
  const next = () => {
    timer = setTimeout(() => {
      fail();
      if (Math.random() < 0.3) setTimeout(fail, rand(420, 700));   // double hit
      next();
    }, rand(...every) * 1000);
  };
  next();
  return () => clearTimeout(timer);
}
