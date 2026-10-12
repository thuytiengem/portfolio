// Image-based UI frames with Unity-style 9-slice scaling (CSS border-image).
// Each frame lives in assets/ui/<name>/ : frame.png + frame.json — replace the PNG (and adjust the
// slice in the Studio → "Giao diện") and the site picks it up; no code change needed.
//
// frame.json
//   slice   : { left, top, right, bottom }   px on the image; corners keep their size, edges/center stretch
//   scale   : on-screen px per image px for the borders (0.5 for art drawn at 2x)
//   mobileScale (optional) : scale used on screens ≤ 760px wide, for frames whose corners are too wide for a phone
//   edges   : "stretch" | "repeat" | "round" | "space"   how edges + center fill the gaps (Unity: Sliced / Tiled)
//   fill    : draw the center slice (false = hollow frame)
//   padding : { left, top, right, bottom }   CSS px between the frame edge and the content
//   version : changes on every save (cache-busting for the image)

export const UI_DIR = "assets/ui/";

// frame name → elements that wear it
export const FRAMES = {
  "description-frame": ".panel",
  "explore-button": ".btn-explore",
  "text-frame": ".hero-quote",
  "store-button": ".btn-store",
};

const SIDES = ["top", "right", "bottom", "left"];
const num = v => (Number.isFinite(+v) ? Math.max(0, +v) : 0);

/** CSS for one frame: the image sits on a ::before layer, so the element keeps its own padding/content. */
export function frameCSS(selector, cfg, imageUrl) {
  const s = cfg.slice || {}, p = cfg.padding || {}, k = num(cfg.scale ?? 1) || 1;
  const slice = SIDES.map(side => num(s[side])).join(" ");
  const widths = f => SIDES.map(side => `${+(num(s[side]) * f).toFixed(2)}px`).join(" ");
  const width = widths(k);
  const edges = ["stretch", "repeat", "round", "space"].includes(cfg.edges) ? cfg.edges : "stretch";
  const pad = SIDES.map(side => `${num(p[side])}px`).join(" ");
  // :where() = zero specificity, so an element that is already absolute/fixed keeps its positioning
  return `:where(${selector}) { position: relative; }
${selector} { isolation: isolate; padding: ${pad}; }
${selector}::before {
  content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none;
  border: solid transparent; border-width: ${width};
  border-image: url("${imageUrl}") ${slice}${cfg.fill === false ? "" : " fill"} / ${width} / 0 ${edges};
}${cfg.mobileScale > 0 ? `
@media (max-width: 760px) { ${selector}::before { border-width: ${widths(+cfg.mobileScale)}; border-image-width: ${widths(+cfg.mobileScale)}; } }` : ""}`;
}

export const frameImageUrl = (name, cfg) => `${UI_DIR}${name}/${cfg.image || "frame.png"}${cfg.version ? `?v=${cfg.version}` : ""}`;

/** Loads every frame.json and injects one <style> with all frames (missing frames are skipped). */
export async function loadFrames() {
  const css = await Promise.all(Object.entries(FRAMES).map(async ([name, selector]) => {
    try {
      const res = await fetch(`${UI_DIR}${name}/frame.json`, { cache: "no-cache" });
      if (!res.ok) throw new Error(res.status);
      const cfg = await res.json();
      return frameCSS(selector, cfg, frameImageUrl(name, cfg));
    } catch (e) { console.warn(`UI frame "${name}":`, e); return ""; }
  }));
  const style = document.getElementById("ui-frames") || document.head.appendChild(Object.assign(document.createElement("style"), { id: "ui-frames" }));
  style.textContent = css.join("\n");
}
