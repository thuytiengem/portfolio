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
- `Database/Projects/<folder>/data.json` + `index.json` (order). Home 3D Blender + 2D Artwork sections have NO data of their own:
  they read `Database/Art3D` / `Database/Art2D` (old `Database/Blender` + `Database/Artworks` were merged in and deleted).
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
- Explore buttons stay. Featured Explore → `exploreUrl` if set, else `project.html?id=<folder>`; Blender → `art3d.html#<id>`, Personal Artworks → `art2d.html#<section of the slide>` (below); About unchanged.
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
  (sessionStorage flag, `assets/js/intro/skip.js`); only the logo (#brand) on those pages plays it again; their Home link does not (owner). Same on games.html, art2d.html and art3d.html.
- Clicking the logo scrolls to the top and replays the intro; the topbar stays visible (`runIntro` returns `replay()`). The Home link
  only scrolls to the top, no intro (owner).
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
- Home "Other game projects" Explore → games.html when `links.otherProjects` is empty or "#"; home "Other 2D Projects"
  Explore → `art2d.html#<tab 2 id>` (NFT Projects = first card) when `links.artworks` is empty or "#" (set in `sections/artworks.js`).
- Home 3D Blender = Art3D projects with `"home": true` that have a final video (`renderBlender` in sections/projects.js): name,
  first final video, `tags` (role tags, home only; empty → `tools`), `text` (string → p, list → bullets), Explore → `art3d.html#<id>`.
  Menu label "Portfolio → 3D Artwork" and the home title "3D BLENDER" stay as they are (owner's decision). Studio "3D Artwork":
  "Hiện ở trang chủ (3D Blender)" toggle + "Tag vai trò" chips (red note when no final video).
- 2D data = TABS → PROJECTS, NO steps (owner dropped them; old step images were merged into the project images): `Database/Art2D/data.json` =
  `{ intro, categories: [{ id, name, text }], projects: [{ id, category, name, text, cover?, showCover?, images }] }`; images in
  `images/<project id>/`. `"showCover": false` (Studio checkbox "Hiện ảnh bìa trong trang chi tiết", only false written) = the cover
  (home image) is left out of the project filmstrip on art2d.html. Tabs + projects share one #anchor namespace (`art2d.html#<tab|project id>`). Tab 1 = Personal Artworks, tabs 2–4 =
  the home "Other 2D Projects". Model: `art2d/model.js` → `{ categories: [{ id, name, text, projects, images, cover }], projects, total }`.
- Home 2D ARTWORK section (`sections/artworks.js`): band `artworks_title` "2D ARTWORK"; "01 <tab 1 name>" (`.sub-head`, cyan number +
  dotted rule) = coverflow carousel of tab 1 projects (cover, name, first paragraph of text), Explore → `art2d.html#<project>`;
  "02 OTHER 2D PROJECTS" (`artworks_other`) = fixed row of the cards of tabs 2–4 (`.art-card`: HUD frame + cover of the tab's first
  project, tab name with titleFont, "{n} projects" = `a2_projects`) → `art2d.html#<tab>`; phone = same row, swipe sideways. Explore → art2d.html.
- 2D Artwork page (`art2d/render.js`) = owner's pick "Tab scroll" (of 2 demos, the other removed): page banner (`a2_page_title`, data
  `intro`, tabs / projects / artworks chips) + sticky tab bar (`.a2-jump` chips "01 Name n") + ONE tab at a time (owner: no scrolling
  through all tabs) = HUD heading "NAME · n projects" (NO number; the tab bar keeps "01 …") + tab text, then its projects stacked as
  HUD panels (`.a2-proj`: number in a cyan chamfered box, name, image count, text, filmstrip + lightbox). The bar switches tabs (#<tab>); #<project> opens
  its tab scrolled to it; no hash = tab 1. `jumpBar` / `jumpTo` stay exported for art3d.html. Labels `a2_*`. Owner guide: `ART2D.md`.
  Studio view "2D Artwork": "Các tab" editor (name EN/VI, id, intro; ↑ ↓, add, delete when empty) + projects grouped by tab (tab
  select per project, ↑ ↓ inside the tab, "+ Thêm dự án vào tab này"); projects use the generic `PAGES` / `pg*` code (list
  "projects", API `/api/art2d`, `/api/art2d/images?dir=<project id>`, `/api/art2d/rename-project`); a project points to its tab by
  the tab draft key `_k`, ids checked on save (tab id ≠ project id); "Xem tab / dự án trên web ↗" links (`art2d.html#id`).
- 3D Artwork page = demo variant 1 "Progression" (owner's pick of 2 demos, demos deleted): page banner (`a3_page_title`, data
  `intro`, projects / videos / images chips), sticky jump chips (▶ = project has a final video), sections "01 NAME" + counts line
  (steps · images · videos), TOOLS chips + text, FINAL RESULT (project number = big cyan box, always bigger than the step numbers; videos in `.hud-frame` via framedVideo; portrait / Shorts video
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
- Studio marks every field whose value is also shown on the home page with a cyan "(H)" after its label (`HM` in studio.js,
  `.hm` in studio.css, legend in the sidebar note): Intro / Hồ sơ / Mạng xã hội / Explore links / rain word / tab title, Kinh nghiệm,
  UI text keys shown on home (`isHomeKey`: all but `pd_ games_ a2_ a3_ gd_`, plus `a2_count*`), the featured-project fields, and
  the 2D / 3D Artwork fields that feed the home sections. Add (H) to any new home-visible field.
- Project page "← Back to projects" still → index.html#featured (owner hasn't decided whether it should go to games.html).

## Current status / next step
- Power Surge intro is live on the site. The old hero image (`intro.heroImage`, `hero.jpg`) was removed — the glass comes from the textures.
- Placeholder content everywhere (lorem ipsum, sample YouTube ids, generated artwork images). 2D Artwork has 4 demo tabs / 15 projects
  (Personal Artworks = the 9 original carousel artworks; the rest = cuts of them, extra texts marked "Demo"); 3D Artwork has 3 demo projects (borrowed YouTube ids, placeholder
  images marked "DEMO · PLACEHOLDER", texts marked "Demo"). Graphic Design has 5 demo projects (same markers).

## Conventions
- Match existing style: ES modules, small helpers, comment density like the current files; no frameworks, no build tools.
- Keep every user-facing string in `web-config.json` (both `en` and `vi`); data text fields may be a string or `{ "en", "vi" }`.
- Verify UI changes with real screenshots (headless Chrome) before reporting.
