// Glitch title + typing helpers.

/** Types text into el with a blinking caret. Stops early if isAlive() turns false. */
export async function typeText(el, text, speed = 30, { keepCaret = false, isAlive = () => true } = {}) {
  el.innerHTML = '<span class="t"></span><span class="caret"></span>';
  const out = el.firstChild;
  for (const ch of text) {
    if (!isAlive()) break;
    out.textContent += ch;
    await new Promise(r => setTimeout(r, speed));
  }
  out.textContent = text;
  if (!keepCaret) el.querySelector(".caret")?.remove();
}

/** Re-triggers the slice glitch on the title every few seconds (plus a little block noise). */
export function startIdleGlitch(title, fx, every = 4500) {
  return setInterval(() => {
    if (document.hidden || !title.classList.contains("in")) return;
    title.classList.remove("burst");
    void title.offsetWidth;
    title.classList.add("burst");
    const r = title.getBoundingClientRect(), host = title.closest(".hero").getBoundingClientRect();
    fx?.noise(160, 0.35, { x: r.left - host.left, y: r.top - host.top, w: r.width, h: r.height });
  }, every);
}
