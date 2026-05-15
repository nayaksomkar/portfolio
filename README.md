# Portfolio

Personal developer portfolio built with vanilla HTML, CSS, and JavaScript.  
Hosted at: `https://nayaksomkar.github.io/portfolio/`

## Pages

| Page | File | Description |
|---|---|---|
| About | `index.html` | Landing page with ASCII art, skill cards, education |
| Projects | `projects.html` | GitHub repos grid with README modal |
| Certificates | `certificates.html` | Certificate cards |
| Socials | `socials.html` | GitHub, Bluesky (posts popup), Hugging Face (models/datasets popup), Email |

## Structure

```
portfolio/
├── index.html              ← About page
├── projects.html           ← Projects page
├── certificates.html       ← Certificates page
├── socials.html            ← Socials page
├── style.css               ← Global styles + responsive
├── socials.css             ← Socials/Bluesky/HF styles
├── script.js               ← Theme toggle, bg wave, page transitions, magic easter egg
├── projects.js             ← GitHub API fetch, repo grid, README modal
├── certificates.js         ← Certificate data + rendering
├── socials.js              ← Connect cards, counts, Bluesky popup, HF popup
├── portfolio-config.json   ← Ignore lists for repos/certs
└── README.md
```

## Features

- Dark/light theme with localStorage persistence
- Background wave text animation
- Smooth page transitions (translateY slide)
- GitHub repos grid with README popup
- Bluesky posts stack with swipe/keyboard navigation
- Hugging Face models & datasets popup
- Configurable ignore lists for repos and certificates
- Fully responsive (mobile through ultrawide)
- Reduced motion support

## Configuration

Edit `portfolio-config.json`:

```json
{
  "ignoreProjects": ["repo-name"],
  "priorityProjects": ["featured-repo"],
  "ignoreCertificates": ["cert-title"]
}
```

## APIs Used

- GitHub — public repos & READMEs
- Bluesky (public.api.bsky.app) — profile & feed
- Hugging Face — models & datasets

All APIs are CORS-friendly — no proxy needed.

## Customization

| What | Where |
|---|---|
| Name/handle | Nav HTML, `BG_TEXT` in `script.js` |
| GitHub username | `GITHUB_USER` in `projects.js` |
| Colors | CSS custom properties in `:root` |
| Ignores | `portfolio-config.json` |
| Certificates | `certData` in `certificates.js` |
