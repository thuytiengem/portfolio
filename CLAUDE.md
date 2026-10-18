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
- `games.html` — "Video Games" page: every folder of `Database/Projects/index.json` as a poster card → project page
  (`assets/js/games/`: main.js entry, model.js card data + image fallback, cards.js; `assets/css/games.css`).
- `art2d.html` — "2D Artwork" page from `Database/Art2D/data.json` (sections → images in `Database/Art2D/images/<section id>/`)
  (`assets/js/art2d/`: main.js entry, model.js normalize, render.js layout + jump bar; `assets/css/art2d.css`; reuses
  project/gallery.js filmstrip + lightbox.js + project.css headings). Owner guide: `ART2D.md` (VI).
- `art3d.html` — "3D Artwork" page from `Database/Art3D/data.json` (projects → images in `Database/Art3D/images/<project id>/`)
  (`assets/js/art3d/`: main.js entry, model.js normalize + YouTube parsing `youtubeId`/`videoOf`, render.js layout;
  `assets/css/art3d.css` on top of art2d.css; imports art2d's `jumpBar`/`jumpTo`, project gallery + lightbox, `framedVideo`). Owner guide: `ART3D.md` (VI).
- `graphic-design.html` — "Graphic Design" page, ONE page with 2 views from `Database/GraphicDesign/data.json` (projects → images in
  `Database/GraphicDesign/images/<project id>/`): list (no `?id`) and detail `?id=<project id>` (`assets/js/gd/`: main.js entry + view
  switch, model.js normalize + URLs, parts.js, list.js, detail.js; `assets/css/gd.css` on top of games.css + art2d.css + art3d.css +
  project.css; reuses games/cards.js `gameCard`, page banner, project gallery + lightbox). Owner guide: `GD.md` (VI).
- Shared helpers: `stores.js` (store buttons, home + detail), `topbar.js` (phone menu, all pages), `portfolio-menu.js` +
  `assets/css/portfolio-menu.css` (topbar "Portfolio" dropdown on every page; init after `initI18n`, before `initMenu`),
  `page-banner.js` + `assets/css/page-banner.css` (HUD page banner of games.html / art2d.html / art3d.html / graphic-design.html list; `titleFont()` = Montserrat
  fallback `.alt-font` (base.css) for titles with Vietnamese letters Qualy lacks — ă ơ ư ĩ ũ and stacked marks ả ạ ế ậ …).
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
- Explore buttons stay. Featured Explore → `exploreUrl` if set, else `project.html?id=<folder>`; Blender / Artworks Explore fall back to art3d.html / art2d.html (below); About unchanged.
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
  (sessionStorage flag, `assets/js/intro/skip.js`); Home / logo on the project page still play it. Same on games.html, art2d.html and art3d.html.
- Clicking Home or the logo scrolls to the top and replays the intro; the topbar stays visible (`runIntro` returns `replay()`).
- Description panel, Explore button and hero quote bar (`assets/ui/text-frame/text-frame.png`, owner's art) = image frames with 9-slice via CSS `border-image` (owner picked this over canvas / 9 files);
  slices edited visually in Studio → "Giao diện" (Unity Sprite Editor style). Default PNGs are generated at 2x (`scale: 0.5`).
  Each frame gets a dark layer behind it cut to the frame's own shape (`::after` + `mask-border` of the same image; `backdrop`
  in frame.json, default 0.75) so the letter rain shows through dimmed, not cut (owner rejected clipping the rain at frames).
- Topbar "Portfolio" = dropdown (hover + click pin, Esc / outside click close, arrow keys; accordion in the phone menu):
  Video Games → games.html; 3D Artwork → art3d.html; 2D Artwork → art2d.html; Graphic Design → graphic-design.html (all 4 are real pages;
  the "Soon" support stays in portfolio-menu.js for future items). Labels `pm_*` in web-config i18n.
  Home page nav highlight still marks it at #featured.
- Video Games page = variant 1 "Poster grid" (owner's pick of 3 demos, demos deleted); its header is now the shared page banner
  (owner asked for the 2D page's banner here too, for consistency): "← Home", VIDEO GAMES / GAME (`games_page_title`),
  intro label `games_intro` (empty = hidden), "5 PROJECTS" chip. Then 3 / 2 / 1 columns of cards (image, logo over its edge, title, genre · team · downloads,
  role tags, 3-line description, hover lift + HUD corners). No filters. Card image: `thumbnail` → `cover` → YouTube thumbnail
  → `logo` → generated "no signal" initials. Labels `games_*`.
- Project data.json: `"featured": false` hides it from the home Featured Projects (missing = shown; games.html lists all);
  `"thumbnail"` = card image. Studio ("Dự án game") has a "Hiện ở trang chủ" toggle, a thumbnail picker
  (`images/thumbnail.<ext>`) and an "Ẩn ở trang chủ" badge in the list.
- Home "Other game projects" Explore → games.html when `links.otherProjects` is empty or "#"; home "Personal Artworks"
  Explore → art2d.html when `links.artworks` is empty or "#"; home 3D Blender Explore → art3d.html when that video's
  `exploreUrl` is empty or "#" (`renderBlender` in sections/projects.js).
- 2D Artwork page = demo variant 1 "Progression" + the page banner of variant 2 (owner's pick of 2 demos, demos deleted):
  banner (title `a2_page_title`, data `intro`, "5 SECTIONS" / "29 ARTWORKS" chips), sticky jump-chip bar (scroll-spy),
  sections "01 NAME · n images" (HUD number + dotted rule) with text + filmstrip + lightbox; optional steps = numbered rows on a
  cyan rail, each with text + its own filmstrip. Section/step titles with Vietnamese letters Qualy lacks switch to Montserrat
  (EN look unchanged). Data `{ intro, sections: [{ id, name, text, cover?, images, steps?: [{ title, text, images }] }] }`;
  text = 1 line → paragraph, list → bullets; `cover` stored but not shown by this layout. Labels `a2_*`.
  Studio view "2D Artwork" edits it (sections/steps/images, id = folder, renamed on save; API `/api/art2d`, images
  `/api/art2d/images?dir=<id>`, `/api/art2d/rename-section`); its image manager is the generic `imgGroup()` also used by
  the project progression steps.
- 3D Artwork page = demo variant 1 "Progression" (owner's pick of 2 demos, demos deleted): page banner (`a3_page_title`, data
  `intro`, projects / videos / images chips), sticky jump chips (▶ = project has a final video), sections "01 NAME" + counts line
  (steps · images · videos), TOOLS chips + text, FINAL RESULT (videos in `.hud-frame` via framedVideo; portrait / Shorts video
  beside the text; final images = filmstrip, bigger when no video), PROCESS steps on the cyan rail (text, optional video,
  filmstrip). `art3d.html#<project id>` deep-links. Data `{ intro, projects: [{ id, name, text, tools?, cover?, final: { videos:
  [{ youtube, orientation?, caption? }], images }, steps: [{ title, text, images, video? }] }] }`; youtube = id or any
  watch / youtu.be / shorts / embed / live link (shorts → portrait default, invalid dropped); `cover` stored, not shown. Labels `a3_*`.
  Studio view "3D Artwork" shares the 2D code (generic `PAGES` / `pg*` helpers in studio.js; server `PAGES` + `pageApi()`):
  API `/api/art3d`, `/api/art3d/images?dir=<id>`, `/api/art3d/rename-project`; video inputs normalise to the id, live
  thumbnail, invalid links block saving, /shorts/ → Dọc.
- Graphic Design page = demo variant 1 "Poster grid + rail" (owner's pick of 2 demos, demos deleted). ONE data source for card + detail:
  `Database/GraphicDesign/data.json` (same single-file shape as Art2D / Art3D so the Studio reuses `PAGES` / `pg*`; not index.json + folders).
  List = shared page banner (`gd_page_title`, data `intro`, projects / images chips, "← Home") + games.css poster cards (`gameCard`):
  image `cover` → first step image, `name` (titleFont fallback), client · year line, `tools` as tags, 3-line `text`, "View project →" (`games_view`).
  Detail `?id=<id>` = "← All design projects" (→ `graphic-design.html#gd-<id>`, scrolls to + focuses that card), HUD banner
  ("GRAPHIC DESIGN 01 / 05", title, client · year, text, TOOLS chips, steps / images chips, cover framed on the right, never cropped,
  click → lightbox), PROCESS steps on the art2d cyan rail (number, title, text, filmstrip + lightbox), Prev / All / Next pager.
  `#step-<n>` deep-links a step; unknown id → not-found + link back. Tab title per view. Data `{ intro, projects: [{ id, name, text,
  cover?, client?, year?, tools?, steps: [{ title, text, images }] }] }`. Labels `gd_*`. Studio view "Graphic Design" (`#/graphic`,
  `PAGES.graphic`): API `/api/graphic`, `/api/graphic/images?dir=<id>`, `/api/graphic/rename-project`; commit scope `Database/GraphicDesign`.
- Project page "← Back to projects" still → index.html#featured (owner hasn't decided whether it should go to games.html).

## Current status / next step
- Power Surge intro is live on the site. The old hero image (`intro.heroImage`, `hero.jpg`) was removed — the glass comes from the textures.
- Placeholder content everywhere (lorem ipsum, sample YouTube ids, generated artwork images). 2D Artwork has 5 demo sections
  (images cut from Personal Artworks, texts marked "Demo"); 3D Artwork has 3 demo projects (borrowed YouTube ids, placeholder
  images marked "DEMO · PLACEHOLDER", texts marked "Demo"). Graphic Design has 5 demo projects (same markers).

## Conventions
- Match existing style: ES modules, small helpers, comment density like the current files; no frameworks, no build tools.
- Keep every user-facing string in `web-config.json` (both `en` and `vi`); data text fields may be a string or `{ "en", "vi" }`.
- Verify UI changes with real screenshots (headless Chrome) before reporting.
