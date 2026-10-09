// HUD reticle: a light dot that opens into rotating rings + crosshair, then blows out.

const ring = (r, w, dash, color, spin, reverse, opacity = 1) =>
  `<g class="ring"><circle class="spin${reverse ? " r" : ""}" style="--s:${spin}s" r="${r}" stroke="${color}"
     stroke-width="${w}" stroke-dasharray="${dash}" opacity="${opacity}"/></g>`;

export function buildHud(svg) {
  svg.innerHTML = `
    <g class="core"><circle r="5" fill="#fff" style="filter:drop-shadow(0 0 6px #fff) drop-shadow(0 0 14px #d38cff)"/></g>
    ${ring(16, 2, "18 6 4 6", "#ffffff", 2.2, false)}
    ${ring(28, 7, "40 18 10 26", "#ff2bd6", 3.2, true, 0.85)}
    ${ring(40, 1, "2 3", "#3ef2ff", 6, false, 0.9)}
    ${ring(52, 3, "70 30 12 40", "#d38cff", 4, false)}
    ${ring(66, 1.2, "160 60 20 120", "#ffffff", 7, true, 0.8)}
    ${ring(82, 5, "8 10", "#9b5cff", 9, false, 0.45)}
    <g class="cross">
      <line x1="-130" y1="0" x2="-20" y2="0" stroke="#fff" stroke-width="1" opacity=".8"/>
      <line x1="20" y1="0" x2="130" y2="0" stroke="#fff" stroke-width="1" opacity=".8"/>
      <line x1="0" y1="-120" x2="0" y2="-20" stroke="#fff" stroke-width="1" opacity=".8"/>
      <line x1="0" y1="20" x2="0" y2="120" stroke="#fff" stroke-width="1" opacity=".8"/>
      <path d="M-44 -30 h-10 v60 h10 M44 -30 h10 v60 h-10" stroke="#ff2bd6" stroke-width="2"/>
    </g>`;
}

export function hudIn(svg) {
  buildHud(svg);
  svg.querySelector(".core").animate(
    [{ transform: "scale(0)" }, { transform: "scale(1.6)" }, { transform: "scale(.6)" }],
    { duration: 220, easing: "ease-out", fill: "forwards" });
  svg.querySelectorAll(".ring").forEach((r, i) => r.animate(
    [{ transform: "scale(0)", opacity: 0 }, { transform: "scale(1.15)", opacity: 1, offset: 0.7 }, { transform: "scale(1)", opacity: 1 }],
    { duration: 380, delay: 120 + i * 35, easing: "cubic-bezier(.2,.9,.3,1.3)", fill: "both" }));
  svg.querySelector(".cross").animate(
    [{ transform: "scale(2.2)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }],
    { duration: 300, delay: 420, easing: "cubic-bezier(.2,.9,.3,1)", fill: "both" });
}

export function hudOut(svg) {
  return svg.animate(
    [{ transform: "translate(-50%,-50%) scale(1)", opacity: 1 }, { transform: "translate(-50%,-50%) scale(3.2)", opacity: 0 }],
    { duration: 420, easing: "cubic-bezier(.5,0,.8,.4)", fill: "forwards" }).finished.then(() => { svg.innerHTML = ""; });
}
