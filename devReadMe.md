# Portfolio — Developer ReadMe

A personal developer portfolio built with vanilla HTML, CSS, and JavaScript.  
Hosted at: `https://nayaksomkar.github.io/portfolio/`

---

## Table of Contents

1. [Project Structure](#project-structure)  
2. [File-by-File Breakdown](#file-by-file-breakdown)  
3. [Configuration](#configuration)  
4. [GitHub API Integration](#github-api-integration)  
5. [Markdown README Renderer](#markdown-readme-renderer)  
6. [Window/Popup System](#windowpopup-system)  
7. [Theme Toggle](#theme-toggle)  
8. [Background Text Wave Effect](#background-text-wave-effect)  
9. [Browser Compatibility & SEO](#browser-compatibility--seo)  
10. [Deployment](#deployment)  
11. [GitHub Pages Clean URLs](#github-pages-clean-urls)  

---

## Project Structure

```
portfolio/
├── index.html              ← About page (landing page)
├── projects/
│   └── index.html          ← Projects page (clean URL, no .html)
├── certificates/
│   └── index.html          ← Certificates page (clean URL, no .html)
├── style.css               ← All styles (global + responsive)
├── script.js               ← Shared JS (theme toggle, background wave, config loader)
├── projects.js             ← Project grid + GitHub API fetch + README window
├── certificates.js         ← Certificate data + rendering
├── portfolio-config.json   ← Ignore lists (hide specific repos/certs)
├── devReadMe.md            ← This file
└── .github/                ← GitHub Actions (if any)
```

---

## File-by-File Breakdown

### `index.html`
- **Purpose**: Landing / About page. First page visitors see.
- **Structure**:
  - `#bg-text` — Fixed-position background element for the animated wave text effect.
  - `nav.nav-double` — Two-layer navigation:
    - `.nav-top` — Brand name, avatar, social links, theme toggle.
    - `.nav-bottom` — Page navigation links (About / Projects / Certificates).
  - `main.about-main` — Main content:
    - `.about-grid` — Two-column grid: Summary card + Education card.
    - `.skills-card` — Technologies/skills tag cloud.
    - `footer.about-footer` — Copyright notice.
- **Body classes**: `night-mode page-about` — Used by CSS to apply page-specific background wave styling.

### `projects/index.html`
- **Purpose**: Displays all public GitHub repositories as cards.
- **Structure**:
  - Same `nav.nav-double` navigation as index.
  - `.content-section` — Contains `.section-desc` and `#project-grid`.
  - `#project-grid` — Empty div populated by `projects.js` via GitHub API.
  - `footer` — Social links + copyright.
  - `.window-overlay#window-overlay` — Modal popup for displaying README content.
- **Scripts loaded**: `script.js` (shared) + `projects.js` (page-specific).

### `certificates/index.html`
- **Purpose**: Displays certifications and achievements.
- **Structure**:
  - Same `nav.nav-double` navigation.
  - `.content-section` — Contains `.section-desc` and `#cert-grid`.
  - `#cert-grid` — Empty div populated by `certificates.js`.
  - `footer` — Social links + copyright.
- **Scripts loaded**: `script.js` (shared) + `certificates.js` (page-specific).

### `style.css`
- **Purpose**: All styling — layout, colors, animations, responsive breakpoints.
- **Organization** (top to bottom):
  1. `#bg-text` & `.bg-text-item` — Background wave text positioning and animation states.
  2. `:root` CSS custom properties (dark theme variables) + `body.light-mode` overrides.
  3. Reset & base styles (`*`, `html`, `body`, `a`).
  4. Custom scrollbar styling.
  5. `nav` — Fixed top navigation bar with backdrop blur.
  6. `.nav-name`, `.nav-actions`, `.social-icon` — Brand and action items.
  7. `.nav-links`, `.nav-link`, `.nav-link.active` — Bottom tab navigation.
  8. `.toggle-wrap`, `.toggle-label`, `.toggle-ball` — Dark/light theme toggle switch.
  9. `.hero` — Full-viewport hero section on the About page.
  10. `.avatar-ring`, `.avatar` — Animated avatar with pulsing ring.
  11. `.hero-name`, `.hero-tagline`, `.hero-links` — Hero text and CTA buttons.
  12. `.content-section`, `.tabs-section` — Shared content container padding.
  13. `.tab-nav`, `.tab-btn` — Tab navigation (used on Projects page).
  14. `.section-desc` — Section description text.
  15. `.project-grid`, `.project-card` — Project card grid layout.
  16. `.cert-grid`, `.cert-card` — Certificate card grid layout.
  17. `.loader`, `.spinner`, `.error-msg` — Loading and error states.
  18. `.page-about`, `.nav-double`, `.nav-top`, `.nav-bottom` — About page specific layout.
  19. `.about-card`, `.edu-item`, `.edu-icon`, `.skills-grid`, `.skill-tags` — About tab content.
  20. `footer`, `.footer-links`, `.footer-copy`, `.heart` — Footer with beating heart animation.
  21. `.window-overlay`, `.window` — Modal popup system (projects README viewer).
  22. `.window-titlebar`, `.window-controls`, `.win-btn` — Window chrome/controls.
  23. `.window-body` — Scrollable content area for README display.
  24. `.btn-gh` — "Open on GitHub" button.
  25. `@media (max-width: 768px)` — Tablet responsive adjustments.
  26. `@media (max-width: 480px)` — Small phone adjustments.
  27. `@media (max-width: 640px)` — General mobile: nav wrapping, stacking grids, larger touch targets.
  28. `@media (hover: hover)` — Desktop-only hover effects.
  29. `@media (hover: none)` — Touch-only active states.
  30. `@media (prefers-reduced-motion: reduce)` — Accessibility: disable animations.

### `script.js`
- **Purpose**: Shared functionality across all pages.
- **Modules**:
  1. **Theme Toggle** — Reads/writes `localStorage` for dark/light mode preference. Toggles `light-mode` and `night-mode` classes on `<body>`.
  2. **Config Loader** — Fetches `portfolio-config.json` and populates the global `config` object (used by projects.js and certificates.js for ignore lists).
  3. **Background Text Wave** —
     - `BG_TEXT` = `"नायक Omkar"` (Devanagari text).
     - `buildBgText()` — Creates a grid of `<span>` elements at `#bg-text`. Responsive: 3 columns on desktop, 2 on tablet, 1 on phone.
     - `animateWave(time)` — Uses `requestAnimationFrame` to create a sine-wave glow effect. Each span's distance from the wave center determines if it glows (`.wave-glow` class).
     - Resize listener rebuilds the grid on viewport change.

### `projects.js`
- **Purpose**: Fetches GitHub repos and renders project cards; manages README popup window.
- **Key Functions**:
  1. `initProjects()` — Self-executing async function: loads config, then calls `fetchRepos()`.
  2. `fetchRepos()` — Fetches user repos from GitHub API, filters out forks, sorts by stars, applies ignore list, renders cards.
     - On **403 error**: Shows "GitHub API rate limit reached" message instead of raw error.
     - On success: calls `renderRepos(repos)`.
  3. `renderRepos(repos)` — Iterates repos, populates `#project-grid` with `.project-card` elements. Attaches click event to each card.
  4. `openProjectWindow(repoName, event)` — Opens the popup overlay, fetches and renders the README markdown.
     - Calculates popup origin from card position for the `clip-path` animation.
  5. Window controls: `closeOverlay()`, minimize, maximize (removed), close, Escape key, overlay click.
  6. `renderMarkdown(md)` — Full markdown-to-HTML parser supporting:
     - Headings (#-######), bold (**), italic (*), inline code (`)
     - Links ([text](url)), images (![alt](src))
     - Ordered/unordered/task lists
     - Tables (pipe-delimited)
     - Horizontal rules (---), blockquotes (>)
     - Code blocks (triple backtick)
     - HTML entity escaping
  7. `resolveUrl(url)` — Resolves relative image/link URLs to raw.githubusercontent.com paths.

### `certificates.js`
- **Purpose**: Renders certificate cards from local data.
- **Structure**:
  - `certData` array — Hard-coded certificate objects (icon, title, desc, badge, image).
  - `initCerts()` — Loads config, filters certs by ignore list, calls `renderCerts()`.
  - `renderCerts()` — Populates `#cert-grid` with `.cert-card` elements. Cards with images use `.has-img` layout; cards without show a gradient `.cert-icon`.

### `portfolio-config.json`
- **Purpose**: Allows non-code users to control portfolio content via a simple JSON file.
- **Fields**:
  - `"ignoreProjects"` — Array of repo names to hide from the Projects page.
  - `"ignoreCertificates"` — Array of certificate titles to hide from Certificates page.

---

## GitHub API Integration

Projects page fetches repos from:
```
GET https://api.github.com/users/nayaksomkar/repos?sort=updated&per_page=100&type=public
```

Flow:
1. Fetch repos → filter out forks → sort by `stargazers_count` descending.
2. Apply ignore list from `portfolio-config.json`.
3. Render each repo as a `.project-card` showing: name, description, language (with color dot), stars, forks, and "time since updated" badge.

README fetching:
```
GET https://api.github.com/repos/nayaksomkar/{repoName}/readme
```
- Returns base64-encoded content, decoded and rendered via the Markdown parser.

**Error handling**:
- `404`: "No README found"
- `403` (rate limit): Friendly message telling user to try again later
- Other errors: "Failed to load repos. [message]"

---

## Markdown README Renderer

Located in `projects.js` → `renderMarkdown(md)`.

Supports:
| Feature | Syntax |
|---|---|
| Headings | `# H1` through `###### H6` |
| Bold | `**text**` |
| Italic | `*text*` |
| Inline code | `` `code` `` |
| Code blocks | `` ```lang\ncode\n``` `` |
| Links | `[text](url)` |
| Images | `![alt](src)` (relative paths auto-resolved to GitHub raw) |
| Blockquotes | `> text` |
| Horizontal rules | `---` |
| Ordered lists | `1. item` |
| Unordered lists | `- item` or `* item` |
| Task lists | `- [x] done` / `- [ ] todo` |
| Tables | `| col \| col \|` with `| --- |` separator |
| HTML stripping | `<br>`, `<p>` tags removed |

---

## Window/Popup System

Used on the Projects page to display repository READMEs.

Components:
- `.window-overlay` — Full-screen semi-transparent backdrop with `clip-path` circle animation.
- `.window` — Centered card container with max-width 780px, max-height 85vh.
  - `.window-titlebar` — Title + control buttons (minimize, close).
  - `.window-body` — Scrollable area for rendered markdown.
  - `.window-footer` — "Open on GitHub" link.

Animations:
- **Open**: `winOpen` — Scales from 0.7 → 1.04 → 1.0 with opacity fade.
- **Close**: `winClose` — Scales from 1.0 → 0.7 with opacity fade.
- **Minimize**: `winMin` — Scales from 1.0 → 0.5 with opacity fade.

Controls:
- Minimize button — Hides window temporarily.
- Close button / overlay click / Escape key — Fully closes the popup.

---

## Theme Toggle

- Toggle switch in `.nav-actions`.
- State saved to `localStorage` under key `"theme"`.
- On page load: reads localStorage and applies saved theme.
- Dark mode (default): `night-mode` class on `<body>`.
- Light mode: `light-mode` class overrides CSS custom properties.
- CSS variables handle all color swaps — no JS color manipulation.

---

## Background Text Wave Effect

- Uses Devanagari text `"नायक Omkar"` repeated in a grid.
- Each character is a `<span>` with `color: transparent` and `-webkit-text-stroke` to create an outline effect.
- `requestAnimationFrame` loop calculates a sine wave position and adds `.wave-glow` class to spans near the wave, revealing them with a purple glow.
- Wave parameters (adjustable in `script.js`):
  - `waveFreq = 0.003` — Horizontal frequency
  - `waveAmp = 350` — Vertical amplitude (pixels)
  - `waveBand = 260` — Vertical range affected (pixels)

---

## Browser Compatibility & Accessibility

- **Prefixes used**: `-webkit-text-stroke`, `-webkit-background-clip`, `-webkit-line-clamp`, `-webkit-backdrop-filter`.
- **`prefers-reduced-motion`**: Disables all CSS animations and JS wave effects for users with motion sensitivity.
- **`(hover: hover)` / `(hover: none)`**: Differentiates mouse vs touch interactions.
- **`font-size: 16px` base** with `line-height: 1.7` for readability.
- **`-webkit-text-size-adjust: 100%`** prevents iOS auto-zoom on orientation change.
- **Viewport meta**: `<meta name="viewport" content="width=device-width, initial-scale=1.0">` on all pages.
- **`loading="lazy"`** on images for performance.
- **`aria-hidden="true"`** on decorative background text.

---

## Deployment

### GitHub Pages
Deploy from the `portfolio/` folder as a GitHub Pages site:
```bash
git add .
git commit -m "Update portfolio"
git push origin main
```

Then enable GitHub Pages in repo Settings → Pages → Source: `/(root)` or `main` branch.

### Clean URLs (No .html)
The project uses subfolder structure for clean URLs:
- `portfolio/` → `index.html` (About page)
- `portfolio/projects/` → `index.html` (Projects page)
- `portfolio/certificates/` → `index.html` (Certificates page)

This means URLs are:
- `yoursite.com/portfolio/`
- `yoursite.com/portfolio/projects/`
- `yoursite.com/portfolio/certificates/`

No `.html` extension shown in the browser address bar.

---

## Customization Quick Reference

| What to change | Where |
|---|---|
| Your name/title | `.nav-handle`, `.nav-fullname`, `.hero-name`, `BG_TEXT` in script.js |
| Avatar image | `img[src*="avatars.githubusercontent.com"]` — change the GitHub username in the URL |
| Skills/tags | `.skill-tags` spans in `index.html` |
| Add/remove certificates | `certData` array in `certificates.js` |
| Ignore repos/certs | `portfolio-config.json` → `ignoreProjects` / `ignoreCertificates` |
| Colors | CSS custom properties in `:root` |
| Social links | `.nav-links-line` and `.nav-actions` in all HTML files |
| GitHub username | `GITHUB_USER` constant in `projects.js` |