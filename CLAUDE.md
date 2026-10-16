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
- `assets/js/main.js` entry · `i18n.js` (tr/label/bind*; every text goes through `richtext.js` = Unity-style tags, list in `RICHTEXT.md`) · `ui-frames.js` (9-slice image frames from `assets/ui/<name>/frame.png + frame.json`) · `youtube.js` (autoplay muted when in view) · `carousel.js` · `rain-bg.js` (letter rain) · `sections/*`.
- `assets/js/intro/` — intro "Power Surge": `timeline.js` (order/timing), `steps.js` (step registry), `effects/*`
  (`glass.js` scene + shard glitch, `particles.js`, `title.js` idle glitch, `shake.js`). Textures in `assets/images/intro-texture/`. Styles in `assets/css/intro.css`.
- `project.html?id=<folder>` — project detail page (`assets/js/project/`: main.js entry, model.js normalize, render.js layout, parts.js, gallery.js filmstrip, lightbox.js; `assets/css/project.css`). Owner guide: `PROJECT-PAGE.md` (VI).
- Shared helpers: `stores.js` (store buttons, home + detail), `topbar.js` (phone menu, home + detail).
- `portfolio-studio/` — local editor (server.mjs = no-dependency Node server + API; studio.js UI). Writes need the `X-Studio: 1` header; localhost only.

## Decisions already made (don't re-ask)
- Default language EN, dropdown EN/VI, choice remembered in localStorage.
- Letter rain: full screen, fixed, behind content, hidden over the intro/hero area; word from `background.rainWord`.
- Intro = demo 2 "Power Surge" (picked from 5 texture demos; demos deleted): circuit lines on → glass fades in → overload →
  white-out + 3D explosion; only ~24 small particles after the break, they stop on screen; idle "signal error" glitches on
  shards, particles and the PORTFOLIO title.
- Intro plays on every load, no skip button; shards stay and tremble slowly; topbar + brand/quote FADE in (no typing, no slide-down).
- Every YouTube video (home Featured + Blender, project page) sits in the cyan HUD corner frame: `framedVideo()` in youtube.js, `.hud-frame` in sections.css.
- Featured/Blender: YouTube only, autoplay when scrolled into view, portrait (Shorts) layout supported; portrait video → info panel stretches to video height.
- Artworks: looping coverflow carousel, auto snap, autoplay, background cross-fade "Dissolve + zoom", per-image title/description.
- Explore buttons stay. Featured Explore → `exploreUrl` if set, else `project.html?id=<folder>`; Blender/Artworks/About Explore unchanged.
- Project detail page = variant 3 "HUD" (owner's pick from 5 demos, demos deleted) with variant 1's numbered role cards and
  variant 2's vertical stages + horizontal filmstrip + lightbox; Challenges = split cards, Learned = checklist. Every field optional,
  empty = hidden, section numbers count only rendered sections; no `roles` → `responsibilities` as one untitled role.
  Progression images = file names in `Database/Projects/<folder>/images/product-progression/<step id>/` (jelly-master has demo images).
- Contact form opens `mailto:` with the filled fields. Social links hidden when empty (15 networks, icons = Simple Icons in assets/icons/<key>.svg).
- Fonts: Qualy (titles; misses some Vietnamese glyphs, free for personal use only), Montserrat (body; self-hosted variable woff2, OFL, full Vietnamese).
- Lists render with round bullets (no "- " prefix).
- Letter rain: each column = the word written continuously and standing still; the falling drop (teardrop glow + bloom, unchanged)
  acts as a mask that reveals the next letters at its head and fades them at its tail. (The earlier random-character scramble was dropped.)
- Featured projects: optional `"stores": { googlePlay, appStore, apk }` in data.json → buttons under the video (hidden when empty),
  frame `assets/ui/store-button/` (owner picked design 1 "neon chamfer" of 10), labels `store_*` in web-config i18n, editable in Studio.
- Custom cursor = "Laser comet" (owner picked design 8 of 10, built from their star-cursor reference): `assets/js/cursor.js`
  (engine + design, `initCursor()` in main.js) + "Custom cursor" rules in base.css. Mouse only; add new clickable classes to CLICKABLE.
- Coming back from a project page (Back to projects, Portfolio/About links, browser Back) opens the home page WITHOUT the intro
  (sessionStorage flag, `assets/js/intro/skip.js`); Home / logo on the project page still play it.
- Clicking Home or the logo scrolls to the top and replays the intro; the topbar stays visible (`runIntro` returns `replay()`).
- Description panel, Explore button and hero quote bar (`assets/ui/text-frame/text-frame.png`, owner's art) = image frames with 9-slice via CSS `border-image` (owner picked this over canvas / 9 files);
  slices edited visually in Studio → "Giao diện" (Unity Sprite Editor style). Default PNGs are generated at 2x (`scale: 0.5`).
  Each frame gets a dark layer behind it cut to the frame's own shape (`::after` + `mask-border` of the same image; `backdrop`
  in frame.json, default 0.75) so the letter rain shows through dimmed, not cut (owner rejected clipping the rain at frames).

## Current status / next step
- Power Surge intro is live on the site. The old hero image (`intro.heroImage`, `hero.jpg`) was removed — the glass comes from the textures.
- Placeholder content everywhere (lorem ipsum, sample YouTube ids, generated artwork images).

## Conventions
- Match existing style: ES modules, small helpers, comment density like the current files; no frameworks, no build tools.
- Keep every user-facing string in `web-config.json` (both `en` and `vi`); data text fields may be a string or `{ "en", "vi" }`.
- Verify UI changes with real screenshots (headless Chrome) before reporting.
