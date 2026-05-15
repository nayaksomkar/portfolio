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
8. [Background Text Wave Effect](#background-text-wave-effect)  
9. [Browser Compatibility & SEO](#browser-compatibility--seo)  
10. [Deployment](#deployment)  
11. [GitHub Pages Clean URLs](#github-pages-clean-urls)  
12. [Customization Quick Reference](#customization-quick-reference)  

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
├── script.js               ← Shared JS (theme toggle, bg wave, page transitions)
├── projects.js             ← Project grid + GitHub API fetch + README window
├── certificates.js         ← Certificate data + rendering
├── portfolio-config.json   ← Ignore lists (hide specific repos/certs)
├── devReadMe.md            ← This file
└── .github/                ← GitHub Actions (if any)
```

---

## File-by-File Breakdown

### `index.html`
- **Purpose**: Landing / About page.
- **Structure**:
  - `#bg-text` — Fixed-position background element for the animated wave text effect.
  - `nav` — Single-row navigation: brand (clickable avatar + name → about page), nav links (Projects / Certificates), social icons, theme toggle.
  - `main.about-main` — Main content:
    - `.about-hero` — GitHub avatar with animated purple glow ring + ASCII art.
    - `.about-card` — Tagline, Education, skill cards (Languages, AI/ML, Frameworks, AI & LLM Stack, Databases), Connect card.
    - `footer.about-footer` — Tagline + copyright.
- **Body classes**: `night-mode page-about`

### `projects/index.html`
- **Purpose**: Displays all public GitHub repositories as cards.
- **Structure**:
  - Same nav as index (brand + links).
  - `.content-section` — Contains `.section-desc` and `#project-grid`.
  - `#project-grid` — Populated by `projects.js` via GitHub API.
  - `footer` — Social links + copyright.
  - `.window-overlay#window-overlay` — Modal for README content.

### `certificates/index.html`
- **Purpose**: Displays certifications and achievements.
- **Structure**:
  - Same nav as index.
  - `.content-section` — Contains `.section-desc` and `#cert-grid`.
  - `#cert-grid` — Populated by `certificates.js`.
  - `footer` — Social links + copyright.

### `style.css`
- **Purpose**: All styling — layout, colors, animations, responsive breakpoints.
- **Key sections**:
  1. `#bg-text` & `.bg-text-item` — Background wave text.
  2. `:root` CSS custom properties (dark theme) + `body.light-mode` overrides.
  3. Reset & base styles.
  4. Custom scrollbar.
  5. `nav` — Fixed top nav with backdrop blur.
  6. `.nav-brand`, `.nav-brand-link` — Clickable brand area pointing to about page.
  7. `.nav-links`, `.nav-link` — Page navigation.
  8. `.toggle-wrap`, `.toggle-label`, `.toggle-ball` — Dark/light toggle.
  9. `.about-hero`, `.avatar-glow`, `.about-avatar` — Hero section with pulsing glow ring.
  10. `.ascii-art pre` — ASCII logo with sweep fill animation.
  11. `.about-card`, `.edu-item` — About content cards with hover glow.
  12. `.skill-icons`, `.skill-icons--xl` — Skill logo grids with individual hover scale.
   13. `.contact-links`, `.contact-btn`, `.find-links`, `.find-btn` — Connect section buttons.
   14. `.page-wrap`, `@keyframes pageUnfold`, `.page-fold` — Page transition animations.
   15. `.project-grid`, `.project-card` — Project cards.
   16. `.cert-grid`, `.cert-card` — Certificate cards.
   17. `.window-overlay`, `.window` — Modal popup system.
   18. `@media` breakpoints at 900px, 768px, 700px, 640px, 480px, 380px.

### `script.js`
- **Purpose**: Shared functionality across all pages.
- **Modules**:
  1. **Theme Toggle** — localStorage persistence, flash overlay transition.
  2. **Config Loader** — Fetches `portfolio-config.json`.
  3. **Page Transition** — `.page-fold` animation on nav link clicks.
  4. **Background Text Wave** — `requestAnimationFrame` sine wave glow on Devanagari `"नायक Omkar"` grid.

### `projects.js`
- **Purpose**: Fetches GitHub repos and renders project cards; manages README popup window.
- Key functions: `initProjects()`, `fetchRepos()`, `renderRepos()`, `openProjectWindow()`, `closeOverlay()`, `renderMarkdown()` (full custom parser).

### `certificates.js`
- **Purpose**: Renders certificate cards from local `certData` array.
- Key functions: `initCerts()`, `renderCerts()`.

---

## Configuration

### `portfolio-config.json`
```json
{
  "ignoreProjects": ["repo-name"],
  "ignoreCertificates": ["cert-title"]
}
```

---

## GitHub API Integration

Projects page fetches repos from:
```
GET https://api.github.com/users/nayaksomkar/repos?sort=updated&per_page=100&type=public
```

README fetching:
```
GET https://api.github.com/repos/nayaksomkar/{repoName}/readme
```

---

## Markdown README Renderer

Located in `projects.js` → `renderMarkdown(md)`.

Supports: headings, bold, italic, inline code, code blocks, links, images, blockquotes, horizontal rules, ordered/unordered/task lists, tables, HTML stripping.

---

## Window/Popup System

Used on the Projects page for README display. Components: `.window-overlay`, `.window` (titlebar + body + footer). Animations: `winOpen` scale-in, `winClose` scale-out, `winMin` scale-down.

---

## Theme Toggle

- Toggle switch in nav.
- State saved to `localStorage` under key `"theme"`.
- Dark mode: `night-mode` class; Light mode: `light-mode` class.
- Flash overlay transition on switch.

---

## Background Text Wave Effect

- Devanagari text `"नायक Omkar"` repeated in a responsive grid.
- `requestAnimationFrame` loop with sine wave to reveal text with purple glow.
- Configurable params: `waveFreq = 0.003`, `waveAmp = 350`, `waveBand = 260`.

---

## Skill Icons — Sources & Sizing

| Card | Source | Size |
|---|---|---|
| Languages | simpleicons.org | 56px |
| AI / ML Libraries | Wikimedia Commons | 56px |
| Frameworks | simpleicons.org | 56px |
| AI & LLM Stack | unsloth.ai / lobehub (GitHub raw) | 80px |
| Databases | techicons.dev (icepanel.io) / Streamline | 56px |

All icons have individual hover scale(1.2) animation.

---

## Navigation

- Brand area (avatar + `@nayaksomkar` + `नायक Omkar 🖤🦢`) links to the About page.
- Nav links: Projects, Certificates (About link removed).
- Social icons: GitHub, LinkedIn.
- Theme toggle with moon/sun icons.

---

## Browser Compatibility & Accessibility

- **Prefixes**: `-webkit-text-stroke`, `-webkit-background-clip`, `-webkit-line-clamp`, `-webkit-backdrop-filter`.
- **`prefers-reduced-motion`**: Disables all CSS animations and JS wave effects.
- **`(hover: hover)` / `(hover: none)`**: Mouse vs touch differentiation.
- **`font-size: 16px` base** with `line-height: 1.7`.
- **Viewport meta**: Standard responsive meta tag.
- **`loading="lazy"`** on images.
- **`aria-hidden="true"`** on decorative elements.

---

## Deployment

### GitHub Pages
```bash
git add .
git commit -m "Update portfolio"
git push origin main
```

### Clean URLs (No .html)
Uses subfolder structure: `projects/index.html`, `certificates/index.html`.

URLs: `yoursite.com/portfolio/`, `yoursite.com/portfolio/projects/`, `yoursite.com/portfolio/certificates/`.

---

## Customization Quick Reference

| What to change | Where |
|---|---|
| Handle / display name | `.nav-handle`, `.nav-fullname`, `BG_TEXT` in script.js |
| Avatar | `img[src*="avatars.githubusercontent.com"]` — change GitHub username |
| Skill icons | Individual `<img>` tags in `index.html` skill cards |
| Connect links | `.contact-links` in `index.html` |
| Social links in nav | `.social-icon` links in all HTML files |
| Add/remove certificates | `certData` array in `certificates.js` |
| Ignore repos/certs | `portfolio-config.json` |
| Colors | CSS custom properties in `:root` |
| GitHub username | `GITHUB_USER` constant in `projects.js` |