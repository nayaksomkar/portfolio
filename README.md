<div align="center">
  <h1>✧ Portfolio</h1>
  <p>
    <a href="https://nayaksomkar.github.io/portfolio/" target="_blank">nayaksomkar.github.io/portfolio</a>
  </p>
  <p>
    <img src="https://img.shields.io/badge/status-live-brightgreen?style=flat-square">
    <img src="https://img.shields.io/badge/stack-vanilla-9cf?style=flat-square">
    <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square">
  </p>
</div>

---

## Prompt

Vanilla HTML/CSS/JS developer portfolio. No frameworks, no build step — just open `index.html`.  
Uses GitHub, Bluesky, Hugging Face, and ClashKing APIs (all CORS-friendly).  
Config file at `portfolio-config.json`. Serve locally with `python3 -m http.server 8000`.

## Pages

| Page | File | Highlights |
|------|------|------------|
| About | `index.html` | ASCII art, skill cards, education, easter eggs |
| Projects | `projects.html` | Live GitHub repos grid + README modal |
| Certificates | `certificates.html` | Filterable certificate cards |
| Socials | `socials.html` | GitHub / Bluesky / Hugging Face / Email |

## File Structure

```
portfolio/
├── index.html              About page
├── projects.html           Projects page
├── certificates.html       Certificates page
├── socials.html            Socials page
├── style.css               Global styles + responsive
├── socials.css             Socials/Bluesky/HF styles
├── coc.css                 Game-themed styles
├── script.js               Theme toggle, bg wave, page transitions
├── coc.js                  Game-themed interactions
├── projects.js             GitHub API fetch, repo grid, README modal
├── certificates.js         Certificate data + rendering
├── socials.js              Connect cards, Bluesky popup, HF popup
├── proxy.js                Express proxy (optional, for CoC API)
├── portfolio-config.json   Ignore lists + API keys
├── AGENTS.md               Dev context for AI assistants
├── EASTER-EGGS.md          Easter egg documentation
└── README.md               You are here
```

## Features

| Feature | Detail |
|---------|--------|
| Theme | Dark/light with localStorage persistence |
| Animation | Sine-wave glow on background text |
| Transitions | translateY slide + fade between pages |
| GitHub | Live repo grid with priority sorting, README popup |
| Bluesky | Posts carousel with swipe/arrow nav, macOS-style titlebar |
| Hugging Face | Models & datasets popup with download counts |
| Windows | macOS traffic light controls (close/minimize/maximize) on all popups |
| Responsive | 9 breakpoints: 380px → 1600px+ |
| Accessibility | Reduced-motion support, touch-friendly targets |
| Caching | localStorage with 30-min TTL for API counts |

## Data Flow

### GitHub — Repos (`projects.js`)

| | |
|---|---|
| **Endpoint** | `api.github.com/users/nayaksomkar/repos?sort=updated&per_page=100&type=public` |
| **Fetch** | On page load via `fetchRepos()` |
| **Filtering** | Removes forks + repos in `ignoreProjects` config |
| **Sorting** | Priority repos (from `priorityProjects`) first, then by stars descending |
| **Caching** | Repo count stored in `localStorage` key `projectsCount` |
| **Error** | Shows spinner → error message (rate limit: 403 gets special message) |

### GitHub — README (`projects.js`)

| | |
|---|---|
| **Endpoint** | `api.github.com/repos/nayaksomkar/{repo}/readme` |
| **Fetch** | On card click via `openProjectWindow()` |
| **Decoding** | Base64 → TextDecoder → rendered with `marked` library |
| **Images** | Relative URLs resolved to `raw.githubusercontent.com/{user}/{repo}/main/` |
| **Window** | macOS titlebar with close/minimize/maximize, footer with "Open on GitHub" link |
| **Error** | 404 → "No README found"; other → error message |

### Bluesky — Profile & Feed (`socials.js`)

| | |
|---|---|
| **Profile endpoint** | `public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=nayaksomkar.bsky.social` |
| **Feed endpoint** | `public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=nayaksomkar.bsky.social&limit=3` |
| **Profile fetch** | On page load via `fetchCount()`, returns `{followers, posts}` |
| **Feed fetch** | On popup open via `openBSkyPopup()` |
| **Caching** | Profile data cached 30 min under `bsky-both-v2` (localStorage) |
| **Navigation** | Swipe (touch) + arrow keys, loops at start/end |
| **Window** | macOS titlebar with close/minimize/maximize, footer with hint bar + Open Bluesky link |

### Hugging Face — Models & Datasets (`socials.js`)

| | |
|---|---|
| **Model endpoint** | `huggingface.co/api/models?author=nayaksomkar&limit=100` |
| **Dataset endpoint** | `huggingface.co/api/datasets?author=nayaksomkar&limit=100` |
| **Count fetch** | On page load via `fetchCount()`, returns array length |
| **Popup fetch** | On popup open via `Promise.all()` — fetches both in parallel |
| **Display** | Last 2 models + last 2 datasets with download counts |
| **Caching** | Counts cached separately: `hf-models`, `hf-datasets` (30 min) |
| **Window** | macOS titlebar with close/minimize/maximize, footer with "Open Hugging Face" link |

### ClashKing — CoC Player Data (`coc.js`)

| | |
|---|---|
| **Endpoint** | `api.clashk.ing/player/%239PU28QLQQ/warhits?limit=1` |
| **Fetch** | On stats popup open via `openMainCoCPopup()` |
| **Parsing** | `parseWarhits()` extracts name, TH level, clan from latest war hit |
| **Fallback** | Official CoC API (`api.clashofclans.com`) if ClashKing fails, requires `cocApiKey` in config |
| **Error** | Shows "Could not fetch player data" fallback |

### Proxy Server (`proxy.js`)

| | |
|---|---|
| **Endpoint** | `/api/coc` — scrapes Clash of Stats HTML for player data |
| **Usage** | Optional, not currently used by frontend |
| **Also** | `/api/twitter/profile` and `/api/twitter/tweets` (requires `TWITTER_BEARER_TOKEN` env) |
| **Start** | `node proxy.js` (runs on port 3001) |

### Config (`script.js`)

| | |
|---|---|
| **Endpoint** | `portfolio-config.json` (local file) |
| **Fetch** | On page load via `loadConfig()` |
| **Contents** | Ignore lists, priority projects, CoC API key |
| **Shared** | Stored in global `config` object, used by `projects.js`, `socials.js`, `coc.js` |

## Configuration

```json
{
  "ignoreProjects": ["repo-name"],
  "priorityProjects": ["featured-repo"],
  "ignoreCertificates": ["cert-title"],
  "cocApiKey": "your-clash-of-clans-api-key"
}
```

## APIs

| Service | Endpoint | Auth | Used By |
|---------|----------|------|---------|
| GitHub | `api.github.com` | Public | `projects.js` |
| Bluesky | `public.api.bsky.app` | Public | `socials.js` |
| Hugging Face | `huggingface.co/api` | Public | `socials.js` |
| ClashKing | `api.clashk.ing` | None | `coc.js` |
| CoC Official | `api.clashofclans.com` | API key (fallback) | `coc.js` |
| Clash of Stats | `clashofstats.com` (CDN images) | Public | `coc.js` |

## Customization

| Aspect | Location |
|--------|----------|
| Name / handle | Nav HTML, `BG_TEXT` in `script.js` |
| GitHub username | `GITHUB_USER` in `projects.js` |
| Colors | CSS custom properties in `:root` |
| Ignore lists | `portfolio-config.json` |
| Certificates | `certData` in `certificates.js` |
