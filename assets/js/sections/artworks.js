// PERSONAL ARTWORKS: carousel + blurred background that cross-fades (dissolve + zoom).
import { h, $, resolvePath } from "../utils.js";
import { tr, onLangChange } from "../i18n.js";
import { createCarousel } from "../carousel.js";
import { setRich } from "../richtext.js";

const BASE = "Database/Artworks/";

export function renderArtworks(artworks) {
  const section = $("#artworks");
  if (!artworks.length) { section.hidden = true; return; }

  const srcs = artworks.map(a => resolvePath(BASE, a.src));
  const bg = $("#artworksBg");
  const caption = $("#artworksCaption");
  const dots = $("#carouselDots");
  let layer = null, current = 0;

  const dotEls = artworks.map((_, i) => {
    const d = h("button", { type: "button", "aria-label": `${i + 1}` });
    d.addEventListener("click", () => carousel.goTo(i));
    dots.append(d);
    return d;
  });

  function setCaption(i) {
    setRich(caption.querySelector("h3"), tr(artworks[i].title));
    setRich(caption.querySelector("p"), tr(artworks[i].desc));
  }

  function swapBackground(src) {
    const old = layer;
    layer = h("div", { class: "artworks-bg-layer", style: { backgroundImage: `url("${src}")` } });
    bg.append(layer);
    if (!old) return;
    const opts = { duration: 1100, easing: "cubic-bezier(.4,0,.2,1)", fill: "both" };
    layer.animate([
      { opacity: 0, transform: "scale(1.3)", filter: "blur(22px) brightness(.9) saturate(1.8) hue-rotate(-25deg)" },
      { opacity: 1, transform: "scale(1.08)", filter: "blur(7px) brightness(.42) saturate(1.15)" },
    ], opts);
    old.animate([{ opacity: 1, transform: "scale(1.08)" }, { opacity: 0, transform: "scale(1)" }], opts)
      .finished.then(() => old.remove());
  }

  const carousel = createCarousel($("#carousel"), {
    images: srcs,
    onChange(i) {
      current = i;
      dotEls.forEach((d, k) => d.classList.toggle("on", k === i));
      setCaption(i);
      caption.classList.remove("swap"); void caption.offsetWidth; caption.classList.add("swap");
      swapBackground(srcs[i]);
    },
  });
  onLangChange(() => setCaption(current));
}
