# Thuytiengem · Portfolio

Static site (HTML/CSS/JS, no build step) — ready for GitHub Pages.

## New machine (Windows)

Run `setup-windows.bat` (double-click). It installs Git, Node.js LTS, VS Code, Claude Code and the VS Code
extensions (Live Preview, Claude Code), clones the repo if needed, and opens it in VS Code.
Preview inside VS Code: open `index.html` → **Show Preview**, or *Run Task → Studio: start server*.
On macOS the same tools: `brew install git node` + `brew install --cask visual-studio-code` + `curl -fsSL https://claude.ai/install.sh | bash`.

## Run locally

The page loads JSON files, so it needs a local server (opening `index.html` directly will not work):

```bash
python3 -m http.server 8765
# → http://localhost:8765/
```

## Publish on GitHub Pages

1. Push this folder to a GitHub repository.
2. Repository → **Settings → Pages** → *Source: Deploy from a branch* → branch `main`, folder `/ (root)`.
3. The site will be at `https://<user>.github.io/<repo>/`. All paths are relative, so it works under a sub-path.
   `.nojekyll` is included so GitHub serves every file as-is.

## Portfolio Studio (content editor)

A local editor for everything below — no need to touch JSON by hand:

```bash
node portfolio-studio/server.mjs
# → http://localhost:4100/portfolio-studio/   (PORT=4101 node … if the port is busy)
```

- **Intro & Hồ sơ**: intro texts, profile, photo, social links, Explore links, rain word, default language.
- **Kinh nghiệm**: work-experience timeline.
- **Dự án game / 3D Blender**: add, edit, delete, drag to reorder; paste any YouTube / Shorts link.
  Game projects also have "Hiện ở trang chủ" (Featured on/off) and the Video Games card image (thumbnail).
- **Personal Artworks**: drag & drop images (resized to JPG ≤ 2400px), titles / descriptions, reorder.
- **2D Artwork**: the `art2d.html` page — intro, sections (add / remove / reorder, id = image folder, renamed on save),
  section & step texts, images per section / step (upload, "Quét thư mục" for files copied by hand, captions, reorder, cover).
- **3D Artwork**: the `art3d.html` page — intro, projects (same list / id / folder rules as 2D), tools, text, final result
  (YouTube videos: paste a link or id → live thumbnail, invalid links flagged, Ngang / Dọc, captions; final images), steps
  (text, images, one optional video). Same image manager as 2D.
- **Graphic Design**: the `graphic-design.html` page (list of cards + one detail page per project, same data) — intro, projects
  (same list / id / folder rules as 2D / 3D), name, text, client, year, tools, cover, steps (title, text, images). Same image manager.
- **Văn bản giao diện**: every UI label in EN / VI.
- "Xem trước" shows the live site (without the intro) next to the form and reloads after each save.

It writes straight into `web-config.json` and `Database/`; commit & push afterwards to publish.
The server only listens on 127.0.0.1. On GitHub Pages the Studio page is static and does nothing without the server.

## Editing content

| What | Where |
|---|---|
| All UI texts (EN + VI), name, email, phone, profile, work experience, social links, Explore links | `web-config.json` |
| Featured projects | `Database/Projects/index.json` + `Database/Projects/<folder>/data.json` |
| Home 3D Blender section | the 3D Artwork projects with `"home": true` (`Database/Art3D/data.json`) |
| Home 2D Artwork section | Personal Artworks carousel = 2D Artwork images with `"home": true` (+ `"title"`); Other 2D Projects = sections with `"homeOther": true` (`Database/Art2D/data.json`) |
| 2D Artwork page | `Database/Art2D/data.json` + images in `Database/Art2D/images/<section id>/` (guide: [ART2D.md](ART2D.md)) |
| 3D Artwork page | `Database/Art3D/data.json` + images in `Database/Art3D/images/<project id>/` (guide: [ART3D.md](ART3D.md)) |
| Graphic Design page | `Database/GraphicDesign/data.json` + images in `Database/GraphicDesign/images/<project id>/` (guide: [GD.md](GD.md)) |
| Store / APK buttons under a project video | `Database/Projects/<folder>/data.json → "stores": { "googlePlay", "appStore", "apk" }` (empty = hidden) |
| Profile photo | put the file in `assets/images/` and set `web-config.json → profile.photo` |

Any text value can be a plain string or `{ "en": "...", "vi": "..." }`. If the Vietnamese value is empty, English is shown.
Text values accept Unity-style rich text tags (`<b>`, `<i>`, `<color=#hex>`, `<link=url>`, `<br>` …) — full list in [RICHTEXT.md](RICHTEXT.md).

**Social links:** fill the URL in `web-config.json → social`; empty ones are hidden.

**Contact form:** the form button opens the visitor's mail app addressed to `profile.email`, with name / email / message pre-filled
(subject and body templates: `i18n.<lang>.mail_subject` / `mail_body`).

### Project `data.json`

```json
{
  "title": "NAME PROJECT",
  "tagline": { "en": "Some information about the game", "vi": "..." },
  "tags": ["Art Director", "UI/UX Designer"],
  "video": { "youtube": "VIDEO_ID", "orientation": "landscape" },
  "description":      { "en": ["line 1", "line 2"], "vi": ["..."] },
  "responsibilities": { "en": ["line 1", "line 2"], "vi": ["..."] },
  "exploreUrl": ""
}
```

- `video.youtube`: the id from the YouTube link (`youtube.com/watch?v=ID` or `youtube.com/shorts/ID`).
- `video.orientation`: `"landscape"` or `"portrait"` (Shorts / vertical videos) — the layout adapts.
- Videos start muted when scrolled into view and pause when scrolled away.
- To add a project: create the folder + `data.json`, then add the folder name to `index.json` (order = display order).
- `exploreUrl`: where the project's **Explore** button goes; empty → the project detail page `project.html?id=<folder>`.
- `featured`: `false` → the project is NOT shown in the home page Featured Projects (missing = shown). It is still listed on `games.html`.
- `thumbnail`: card image on the Video Games page (relative to the project folder, or URL). Missing → `cover` → YouTube thumbnail → `logo` → a generated placeholder.

Blender `data.json` uses the same `tags`, `video`, `exploreUrl` (empty or `#` → the 3D Artwork page `art3d.html`); `description` is a single paragraph; `title` is optional.

### Artworks `index.json`

```json
[{ "src": "images/artwork-01.jpg", "title": { "en": "...", "vi": "..." }, "desc": { "en": "...", "vi": "..." } }]
```

## Project detail page

`project.html?id=<folder>` shows one project from `Database/Projects/<folder>/data.json` (the Featured **Explore** buttons link here).
Owner's guide (Vietnamese, full field list + examples): [PROJECT-PAGE.md](PROJECT-PAGE.md). Every field is optional — empty = hidden.

| Field | Type | Shown as |
|---|---|---|
| `logo`, `cover` | image path (relative to the project folder, or URL) | app icon · blurred header background (fallback: YouTube thumbnail, then logo) |
| `studio`, `period` | text | small line under the title |
| `downloads`, `members`, `genre` | text (`members`: number → "{n} members") | HUD stats |
| `roles` | `[{ title, text }]` | **My Roles** cards (missing → `responsibilities` as one untitled card) |
| `progression` | `[{ id, name, text, images }]` | **Product Progression** stages, a filmstrip + lightbox each |
| `challenges` | `[{ problem, solution }]` | **Challenges & Solutions** split cards |
| `learned` | `[text | { title, text }]` | **What I learned** checklist |

Progression images are **file names** inside the stage's own folder (`id` = slug `a-z 0-9 -`):

```
Database/Projects/<folder>/images/product-progression/<step id>/01.jpg …
```

Labels: `i18n.<lang>.pd_*` in `web-config.json`. Code: `project.html`, `assets/css/project.css`, `assets/js/project/`
(`main.js` entry · `model.js` data normalisation · `render.js` layout · `parts.js` · `gallery.js` · `lightbox.js`).

## Video Games page + Portfolio menu

`games.html` starts with the shared page banner (`assets/js/page-banner.js`, `assets/css/page-banner.css`: ← Home, title
`games_page_title`, intro `games_intro` — empty = hidden, project count) and lists **every** project of `Database/Projects/index.json` (same order, featured or not) as a card linking to
`project.html?id=<folder>`: image (`thumbnail`, see above), `logo`, `title`, `genre` · `members` · `downloads`, `tags`, first line of
`description` (else `tagline`). Missing fields are hidden. Code: `assets/js/games/` (`main.js` · `model.js` · `cards.js`), `assets/css/games.css`.
Labels: `i18n.<lang>.games_*`. The home page "Other game projects" Explore button goes there when `links.otherProjects` is empty or `#`.

The topbar **Portfolio** link is a dropdown on every page (`assets/js/portfolio-menu.js`, `assets/css/portfolio-menu.css`):
Video Games → `games.html`; 3D Artwork → `art3d.html`; 2D Artwork → `art2d.html`; Graphic Design → `graphic-design.html`. Items: `ITEMS` in portfolio-menu.js; labels `i18n.<lang>.pm_*`.

## 2D Artwork page

`art2d.html` (Portfolio menu → 2D Artwork; also the home "Personal Artworks" **Explore** button when `links.artworks` is empty or `#`)
shows `Database/Art2D/data.json`: the page banner (title `a2_page_title`, `intro`, section / artwork counts), a sticky bar of
section chips, then one numbered section per entry — text + a filmstrip (click → lightbox) and optional **steps** (numbered rows,
each with its own text + filmstrip).

```json
{
  "intro": { "en": "…", "vi": "…" },
  "sections": [
    { "id": "character-design", "name": { "en": "Character Design", "vi": "Thiết kế nhân vật" }, "text": "…",
      "images": ["01.jpg", { "src": "02.jpg", "caption": { "en": "…", "vi": "…" } }],
      "steps": [{ "title": "Sketches", "text": ["…", "…"], "images": ["sketch-1.jpg"] }] }
  ]
}
```

Every field is optional (empty = hidden). `id` = slug `a-z 0-9 -` = image folder `Database/Art2D/images/<id>/` (steps use the
same folder) = anchor `art2d.html#<id>`. `text`: string = paragraph, list = bullets. `cover` is stored for later layouts.
Titles containing Vietnamese letters the Qualy font lacks are drawn in Montserrat. Labels `i18n.<lang>.a2_*`.
Code: `assets/js/art2d/` (`main.js` · `model.js` · `render.js`), `assets/css/art2d.css`. Owner guide (Vietnamese): [ART2D.md](ART2D.md).

## 3D Artwork page

`art3d.html` (Portfolio menu → 3D Artwork; also the home **3D Blender** Explore button when that video's `exploreUrl` is empty or `#`)
shows `Database/Art3D/data.json` (owner's pick: variant 1 "Progression"): the page banner (title `a3_page_title`, `intro`, project /
video / image counts), a sticky bar of project chips (▶ = has a final video), then one numbered section per project — counts line,
**TOOLS** chips + text, **FINAL RESULT** (YouTube videos in the cyan HUD frame, autoplay muted in view; a portrait / Shorts video sits
beside the text; final images as a filmstrip, bigger when there is no video) and **PROCESS** steps on the cyan rail (text, optional
video, filmstrip). `art3d.html#<project id>` jumps to a project.

```json
{
  "intro": { "en": "…", "vi": "…" },
  "projects": [
    { "id": "blossom-fairy", "name": { "en": "Blossom Fairy", "vi": "Tiên hoa" }, "tools": ["Blender", "Substance Painter"], "text": "…",
      "final": { "videos": [{ "youtube": "LhaYfT7kzbg", "orientation": "landscape", "caption": { "en": "…", "vi": "…" } }],
                 "images": ["render-01.jpg", { "src": "render-02.jpg", "caption": "…" }] },
      "steps": [{ "title": "Modeling", "text": ["…", "…"], "images": ["modeling-01.jpg"], "video": { "youtube": "FMr91afriiI" } }] }
  ]
}
```

Every field is optional (empty = hidden). `id` = image folder `Database/Art3D/images/<id>/` (steps share it) = anchor. `youtube` = an id or
a watch / youtu.be / shorts / embed / live link (`/shorts/` → portrait unless `orientation` says otherwise; invalid → dropped).
`cover` is stored for later layouts. Labels `i18n.<lang>.a3_*` (+ `pd_image(s)`). Code: `assets/js/art3d/` (`main.js` · `model.js` ·
`render.js`, reusing art2d's jump bar / `jumpTo`, project gallery + lightbox, `framedVideo`), `assets/css/art3d.css` (on top of art2d.css).
Owner guide (Vietnamese): [ART3D.md](ART3D.md).

## Graphic Design page

`graphic-design.html` (Portfolio menu → Graphic Design; owner's pick: variant 1 "Poster grid + rail") is one page with two views,
both built from **one** file, `Database/GraphicDesign/data.json`:

- **List** `graphic-design.html`: the page banner (title `gd_page_title`, `intro`, project / image counts), then the Video Games
  poster cards (`games/cards.js` `gameCard` + `games.css`): image (`cover` → first step image), `name`, client · year, `tools` as
  tags, 3-line `text` (a list → its first line), "View project →".
- **Detail** `graphic-design.html?id=<id>`: "← All design projects" (back to the list, scrolled / focused on that card
  `#gd-<id>`), HUD banner ("GRAPHIC DESIGN 01 / 05", title, client · year, text, TOOLS chips, step / image chips, the cover framed
  on the right — never cropped, click → lightbox), **PROCESS** steps on the cyan rail (number, title, text, filmstrip + lightbox),
  then Previous / All / Next project. `#step-<n>` deep-links a step; an unknown id shows "This project does not exist" + a link back.

```json
{
  "intro": { "en": "…", "vi": "…" },
  "projects": [
    { "id": "gem-brand-identity", "name": { "en": "Gem Brand Identity", "vi": "Nhận diện thương hiệu Gem" }, "text": "…",
      "cover": "logo-final.jpg", "client": { "en": "Personal project", "vi": "Dự án cá nhân" }, "year": "2025",
      "tools": ["Illustrator", "Photoshop", "Figma"],
      "steps": [{ "title": "Sketches", "text": ["…", "…"], "images": ["sketch-1.jpg", { "src": "logo-final.jpg", "caption": "…" }] }] }
  ]
}
```

Every field is optional (empty = hidden). `id` = slug `a-z 0-9 -` = image folder `Database/GraphicDesign/images/<id>/` (every step
uses it) = `?id=`. Order of `projects` = card order = previous / next order. Labels `i18n.<lang>.gd_*` (+ `pd_image(s)`, `games_view`).
Code: `assets/js/gd/` (`main.js` entry + view switch · `model.js` · `parts.js` · `list.js` · `detail.js`), `assets/css/gd.css` (on top of
games.css, art2d.css, art3d.css, project.css). Owner guide (Vietnamese): [GD.md](GD.md).

## Intro

The intro is split so it can be changed piece by piece:

```
assets/js/intro/
├── timeline.js     ← order & timing of the steps (edit this first); INTRO_ENABLED to turn it off
├── steps.js        ← step name → effect call
├── index.js        ← runner (builds the glass scene + particles, plays the timeline)
└── effects/
    ├── glass.js      glass scene from the textures, shard layout, tremble, shard "signal error" glitch, flash, shockwave
    ├── particles.js  sprite particles (particle-*.png) + error noise blocks
    ├── shake.js      organic pre-break shake
    └── title.js      idle glitch on the PORTFOLIO title
```

Textures are in `assets/images/intro-texture/` (`glass-demo.png` intact glass, `electric-fx.png` circuit lines,
`glass-1..14.png` shards placed like `glass-broken-demo.png`, `particle-*.png` small pieces).
Styles for the hero are in `assets/css/intro.css`. Visitors with "reduced motion" enabled get the final state directly (no idle glitches).

## UI frames (9-slice images)

The info panel and the Explore button are drawn from images, scaled like Unity's 9-slice sprites (CSS `border-image`):

```
assets/ui/
├── description-frame/   frame.png + frame.json        (project / About panels)
├── explore-button/      frame.png + frame.json        (every Explore button)
├── text-frame/          text-frame.png + frame.json   (hero quote bar)
└── store-button/        frame.png + frame.json        (Google Play / App Store / APK buttons)
```

Replace `frame.png` (keep the name) and set the slice borders in the Studio → **Giao diện** (drag the 4 guide lines),
or edit `frame.json` by hand: `slice` (px on the image), `scale` (0.5 for 2x art), `edges` (`stretch` / `repeat` / `round` / `space`),
`fill`, `padding` (content inset in CSS px), optional `mobileScale` (smaller borders on phones). Loader: `assets/js/ui-frames.js`.

## Structure

```
index.html · project.html · games.html · art2d.html · art3d.html · graphic-design.html · web-config.json · .nojekyll
assets/fonts   Qualy (titles), Montserrat (body)
assets/css     base.css · intro.css · sections.css · project.css · games.css · art2d.css · art3d.css · gd.css · page-banner.css · portfolio-menu.css
assets/js      main.js · i18n.js · richtext.js · ui-frames.js · cursor.js · utils.js · rain-bg.js · youtube.js · carousel.js · stores.js · topbar.js · portfolio-menu.js · page-banner.js · sections/ · intro/ · project/ · games/ · art2d/ · art3d/ · gd/
assets/ui      image frames (9-slice) for the panel and the Explore button
assets/icons   social icons (Simple Icons, CC0)
Database/      Projects · Blender · Artworks · Art2D · Art3D · GraphicDesign
```

Font licenses: Qualy is free for personal use only (replace before any commercial use); Montserrat is SIL OFL (free, see `assets/fonts/OFL-Montserrat.txt`).
