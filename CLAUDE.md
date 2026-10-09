# Thuytiengem Portfolio — notes for Claude

Static portfolio site (plain HTML/CSS/JS ES modules, no build step) for Tran Thi Thuy Tien (Thuytiengem), hosted on GitHub Pages.
Design reference: `refs/port-wf-home.png`. Theme: sci-fi / future / electronic, purple palette.
The owner writes in Vietnamese — reply in Vietnamese.

## Run
- Site + content editor: `node portfolio-studio/server.mjs` → site http://localhost:4100/ , Studio http://localhost:4100/portfolio-studio/
  (port 4100 on purpose; 4000 is used by the owner's other project). `?nointro` skips the intro (used by the Studio preview).
- Any static server also works for the site alone (it fetches JSON, so `file://` does not work).

## Structure
- `index.html` — page skeleton; all text comes from `web-config.json` (EN + VI, `i18n.<lang>.<key>` for UI labels).
- `Database/Projects|Blender/<folder>/data.json` + `index.json` (order); `Database/Artworks/index.json` + `images/`.
- `assets/js/main.js` entry · `i18n.js` (tr/label/bind*) · `youtube.js` (autoplay muted when in view) · `carousel.js` · `rain-bg.js` (letter rain) · `sections/*`.
- `assets/js/intro/` — intro "Power Surge": `timeline.js` (order/timing), `steps.js` (step registry), `effects/*`
  (`glass.js` scene + shard glitch, `particles.js`, `title.js` idle glitch, `shake.js`). Textures in `assets/images/intro-texture/`. Styles in `assets/css/intro.css`.
- `portfolio-studio/` — local editor (server.mjs = no-dependency Node server + API; studio.js UI). Writes need the `X-Studio: 1` header; localhost only.

## Decisions already made (don't re-ask)
- Default language EN, dropdown EN/VI, choice remembered in localStorage.
- Letter rain: full screen, fixed, behind content, hidden over the intro/hero area; word from `background.rainWord`.
- Intro = demo 2 "Power Surge" (picked from 5 texture demos; demos deleted): circuit lines on → glass fades in → overload →
  white-out + 3D explosion; only ~24 small particles after the break, they stop on screen; idle "signal error" glitches on
  shards, particles and the PORTFOLIO title.
- Intro plays on every load, no skip button; shards stay and tremble slowly; topbar + brand/quote FADE in (no typing, no slide-down).
- Featured/Blender: YouTube only, autoplay when scrolled into view, portrait (Shorts) layout supported; portrait video → info panel stretches to video height.
- Artworks: looping coverflow carousel, auto snap, autoplay, background cross-fade "Dissolve + zoom", per-image title/description.
- Explore buttons stay; the "explore" pages will be built later.
- Contact form opens `mailto:` with the filled fields. Social links hidden when empty (9 networks).
- Fonts: Qualy (titles), Ebrima (body) — temporary; both miss some Vietnamese glyphs (Qualy is free for personal use only, Ebrima is a Microsoft font).

## Current status / next step
- Power Surge intro is live on the site. The old hero image (`intro.heroImage`, `hero.jpg`) was removed — the glass comes from the textures.
- Placeholder content everywhere (lorem ipsum, sample YouTube ids, generated artwork images).

## Conventions
- Match existing style: ES modules, small helpers, comment density like the current files; no frameworks, no build tools.
- Keep every user-facing string in `web-config.json` (both `en` and `vi`); data text fields may be a string or `{ "en", "vi" }`.
- Verify UI changes with real screenshots (headless Chrome) before reporting.
