// 2D ARTWORK section, from the 2D Artwork page data (Database/Art2D, art2d/model.js):
//   01 <first tab, "Personal Artworks"> = carousel of its projects (cover, name, first paragraph of the text) + blurred
//      background that cross-fades (dissolve + zoom); its Explore opens the project of the slide in view.
//   02 Other 2D Projects = cards of the next 3 tabs (cover of their first project, name, "n projects") → art2d.html#<tab>.
import { h, $ } from "../utils.js";
import { tr, label, bind, onLangChange } from "../i18n.js";
import { createCarousel } from "../carousel.js";
import { setRich } from "../richtext.js";
import { titleFont } from "../page-banner.js";

const OTHER_CARDS = 3;
const pageUrl = id => `art2d.html#${encodeURIComponent(id)}`;
/** first paragraph of a text value (a list → its first item), per language */
const firstLine = v => { const t = tr(v); return Array.isArray(t) ? tr(t[0]) : t; };
const corners = () => ["c1", "c2", "c3", "c4"].map(c => h("i", { class: c, "aria-hidden": "true" }));

export function renderArtworks(model) {
  const [personal, ...rest] = model.categories;
  const slides = (personal?.projects || []).filter(p => p.cover);
  const others = rest.slice(0, OTHER_CARDS);
  if (personal) bind($("#artworksPersonalTitle"), el => titleFont(setRich(el, tr(personal.name))));
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
    titleFont(setRich(caption.querySelector("h3"), tr(slides[i].name)));
    setRich(caption.querySelector("p"), firstLine(slides[i].text) || "");
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
    images: slides.map(s => s.cover),
    onChange(i) {
      current = i;
      dotEls.forEach((d, k) => d.classList.toggle("on", k === i));
      setCaption(i);
      caption.classList.remove("swap"); void caption.offsetWidth; caption.classList.add("swap");
      swapBackground(slides[i].cover);
      more.href = pageUrl(slides[i].id);
    },
  });
  onLangChange(() => setCaption(current));
}

/** tab card: image in the HUD frame, tab name, "n projects" */
const otherCard = c => h("a", { class: "art-card", href: pageUrl(c.id) },
  h("div", { class: "hud-frame" }, h("div", { class: "art-card-img", style: { backgroundImage: c.cover ? `url("${c.cover}")` : "none" } }), corners()),
  bind(h("h4"), el => titleFont(setRich(el, tr(c.name)))),
  bind(h("p"), el => { const n = c.projects.length; el.textContent = label(n === 1 ? "a2_project_one" : "a2_projects", { n }); }));
