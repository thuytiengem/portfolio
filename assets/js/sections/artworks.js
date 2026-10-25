// 2D ARTWORK section, from the 2D Artwork page data (Database/Art2D, art2d/model.js):
//   01 Personal Artworks = carousel of the images marked "home": true + blurred background that cross-fades (dissolve + zoom);
//      its Explore opens the 2D page at the section of the slide in view.
//   02 Other 2D Projects = 3 section cards (marked "homeOther": true, else the first 3) → art2d.html#<section>.
import { h, $ } from "../utils.js";
import { tr, label, bind, onLangChange } from "../i18n.js";
import { createCarousel } from "../carousel.js";
import { setRich } from "../richtext.js";
import { titleFont } from "../page-banner.js";

const OTHER_CARDS = 3;
const sectionUrl = id => `art2d.html#${encodeURIComponent(id)}`;
const corners = () => ["c1", "c2", "c3", "c4"].map(c => h("i", { class: c, "aria-hidden": "true" }));

export function renderArtworks(model) {
  const slides = model.sections.flatMap(s => s.all.filter(im => im.home).map(im => ({ ...im, section: s.id })));
  const picked = model.sections.filter(s => s.homeOther);
  const others = (picked.length ? picked : model.sections).filter(s => s.cover).slice(0, OTHER_CARDS);
  $("#artworksPersonal").hidden = !slides.length;
  $("#artworksOther").hidden = !others.length;
  $("#artworks").hidden = !slides.length && !others.length;
  if (slides.length) renderCarousel(slides);
  $("#otherArtGrid").append(...others.map(otherCard));
}

function renderCarousel(slides) {
  const bg = $("#artworksBg");
  const caption = $("#artworksCaption");
  const dots = $("#carouselDots");
  const more = $("#artworksExplore");
  let layer = null, current = 0;

  const dotEls = slides.map((_, i) => {
    const d = h("button", { type: "button", "aria-label": `${i + 1}` });
    d.addEventListener("click", () => carousel.goTo(i));
    dots.append(d);
    return d;
  });

  function setCaption(i) {
    titleFont(setRich(caption.querySelector("h3"), tr(slides[i].title)));
    setRich(caption.querySelector("p"), tr(slides[i].caption));
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
    images: slides.map(s => s.src),
    onChange(i) {
      current = i;
      dotEls.forEach((d, k) => d.classList.toggle("on", k === i));
      setCaption(i);
      caption.classList.remove("swap"); void caption.offsetWidth; caption.classList.add("swap");
      swapBackground(slides[i].src);
      more.href = sectionUrl(slides[i].section);
    },
  });
  onLangChange(() => setCaption(current));
}

/** image in the HUD frame, section name, "n artworks" */
const otherCard = s => h("a", { class: "art-card", href: sectionUrl(s.id) },
  h("div", { class: "hud-frame" }, h("div", { class: "art-card-img", style: { backgroundImage: `url("${s.cover}")` } }), corners()),
  bind(h("h4"), el => titleFont(setRich(el, tr(s.name)))),
  bind(h("p"), el => { el.textContent = label(s.count === 1 ? "a2_count_one" : "a2_count", { n: s.count }); }));
