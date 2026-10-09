// ABOUT ME + contact footer (social links, mailto form).
import { h, $ } from "../utils.js";
import { bind, bindText, bindList, label } from "../i18n.js";

// order shown in the footer; icon files live in assets/icons/<key>.svg
const SOCIALS = ["whatsapp", "instagram", "linkedin", "bluesky", "x", "behance", "youtube", "itchio", "discord"];
const SOCIAL_NAMES = { whatsapp: "WhatsApp", instagram: "Instagram", linkedin: "LinkedIn", bluesky: "Bluesky", x: "X", behance: "Behance", youtube: "YouTube", itchio: "itch.io", discord: "Discord" };

export function renderAbout(config) {
  const p = config.profile || {};
  const photo = $("#aboutPhoto");
  if (p.photo) photo.style.backgroundImage = `url("${p.photo}")`;
  else bind(photo, el => { el.textContent = label("photo"); });

  bind($("#aboutName"), el => { el.textContent = `${p.name || ""} ${label("profile_suffix")}`.trim(); });
  bindText($("#aboutRole"), p.role);
  bindList($("#aboutSummary"), p.summary);

  $("#timeline").append(...(config.experience || []).map(x => h("div", { class: "timeline-item" },
    h("div", { class: "when" },
      bindText(h("h4"), x.role),
      bindText(h("p"), x.company),
      bindText(h("p"), x.period)),
    h("div", { class: "dot" }),
    bindList(h("ul", { class: "list" }), x.points),
  )));
}

export function renderContact(config) {
  const p = config.profile || {};
  const email = $("#contactEmail"), phone = $("#contactPhone");
  if (p.email) Object.assign($("a", email), { href: `mailto:${p.email}`, textContent: p.email }); else email.hidden = true;
  if (p.phone) Object.assign($("a", phone), { href: `tel:${p.phone.replace(/[^\d+]/g, "")}`, textContent: p.phone }); else phone.hidden = true;

  // only links that are filled in web-config.json are shown
  const social = config.social || {};
  $("#socials").append(...SOCIALS.filter(k => social[k]).map(k =>
    h("a", { href: social[k], target: "_blank", rel: "noopener", "aria-label": SOCIAL_NAMES[k], title: SOCIAL_NAMES[k] },
      h("img", { src: `assets/icons/${k}.svg`, alt: "" }))));

  // "Send" opens the visitor's mail app with everything pre-filled
  const form = $("#contactForm");
  form.addEventListener("submit", e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const v = Object.fromEntries(new FormData(form));
    const subject = label("mail_subject", v);
    const body = label("mail_body", v).replace(/\\n/g, "\n");
    window.location.href = `mailto:${p.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
