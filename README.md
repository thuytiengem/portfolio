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
index.html · web-config.json · .nojekyll
assets/fonts   Qualy (titles), Montserrat (body)
assets/css     base.css · intro.css · sections.css
assets/js      main.js · i18n.js · richtext.js · ui-frames.js · cursor.js · utils.js · rain-bg.js · youtube.js · carousel.js · sections/ · intro/
assets/ui      image frames (9-slice) for the panel and the Explore button
assets/icons   social icons (Simple Icons, CC0)
Database/      Projects · Blender · Artworks
```

Font licenses: Qualy is free for personal use only (replace before any commercial use); Montserrat is SIL OFL (free, see `assets/fonts/OFL-Montserrat.txt`).
