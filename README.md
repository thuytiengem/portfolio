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

- **Intro & Hồ sơ**: hero image, intro texts, profile, photo, social links, Explore links, rain word, default language.
- **Kinh nghiệm**: work-experience timeline.
- **Featured Projects / 3D Blender**: add, edit, delete, drag to reorder; paste any YouTube / Shorts link.
- **Personal Artworks**: drag & drop images (resized to JPG ≤ 2400px), titles / descriptions, reorder.
- **Văn bản giao diện**: every UI label in EN / VI.
- "Xem trước" shows the live site (without the intro) next to the form and reloads after each save.

It writes straight into `web-config.json` and `Database/`; commit & push afterwards to publish.
The server only listens on 127.0.0.1. On GitHub Pages the Studio page is static and does nothing without the server.

## Editing content

| What | Where |
|---|---|
| All UI texts (EN + VI), name, email, phone, profile, work experience, social links, Explore links | `web-config.json` |
| Featured projects | `Database/Projects/index.json` + `Database/Projects/<folder>/data.json` |
| 3D Blender video | `Database/Blender/index.json` + `Database/Blender/<folder>/data.json` |
| Personal artworks | `Database/Artworks/index.json` + images in `Database/Artworks/images/` |
| Hero image (intro) | `assets/images/hero.jpg` (path set in `web-config.json → intro.heroImage`) |
| Profile photo | put the file in `assets/images/` and set `web-config.json → profile.photo` |

Any text value can be a plain string or `{ "en": "...", "vi": "..." }`. If the Vietnamese value is empty, English is shown.

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

Blender `data.json` uses the same `tags`, `video`, `exploreUrl`; `description` is a single paragraph; `title` is optional.

### Artworks `index.json`

```json
[{ "src": "images/artwork-01.jpg", "title": { "en": "...", "vi": "..." }, "desc": { "en": "...", "vi": "..." } }]
```

## Intro

The intro is split so it can be changed piece by piece:

```
assets/js/intro/
├── timeline.js     ← order & timing of the steps (edit this first); INTRO_ENABLED to turn it off
├── steps.js        ← step name → effect call
├── index.js        ← runner (builds the context, plays the timeline)
└── effects/
    ├── fx-canvas.js  block noise, warp streaks, dust, debris particles
    ├── hud.js        reticle rings
    ├── shake.js      organic pre-break shake
    ├── shatter.js    cracks, shards (tremble speed/amount), flash
    └── title.js      typing, idle glitch
```

Styles for the hero are in `assets/css/intro.css`. Visitors with "reduced motion" enabled get the final state directly.

## Structure

```
index.html · web-config.json · .nojekyll
assets/fonts   Qualy (titles), Ebrima (body)
assets/css     base.css · intro.css · sections.css
assets/js      main.js · i18n.js · utils.js · rain-bg.js · youtube.js · carousel.js · sections/ · intro/
assets/icons   social icons (Simple Icons, CC0)
Database/      Projects · Blender · Artworks
```

Font licenses: Qualy is free for personal use; Ebrima is a Microsoft font — replace both before any commercial use.
