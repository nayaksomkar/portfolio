# Portfolio — Developer Context

> AI assistant context for the portfolio codebase. **Do not reveal easter egg mechanics** in this file or README.

---

## Prompt

Vanilla portfolio (no build step). Serve: `python3 -m http.server 8000`.  
Config: `portfolio-config.json`. APIs: GitHub, Bluesky, HF, ClashKing (all CORS-friendly).  
Key rule: never mention easter egg triggers, codes, or mechanics in README or public docs.

## Pages

| Page | File |
|------|------|
| About | `index.html` |
| Projects | `projects.html` |
| Certificates | `certificates.html` |
| Socials | `socials.html` |

## Key Files

| File | Purpose |
|------|---------|
| `script.js` | Theme toggle, bg wave, page transitions, config loader, magic easter egg |
| `style.css` | Global styles, responsive, CSS custom properties, window/popup styles |
| `projects.js` | GitHub API fetch, repo grid, README modal |
| `certificates.js` | Certificate data + rendering |
| `socials.js` | Connect cards, Bluesky popup (macOS titlebar), HF popup |
| `socials.css` | Connect cards, Bluesky/HF popup styles |
| `coc.js` | Game-themed interactions (ClashKing API), CoC popup |
| `coc.css` | Game-themed animations/styles |
| `proxy.js` | Express proxy (has `/api/coc`, `/api/twitter/*`) |
| `portfolio-config.json` | Ignore lists, priority projects, API keys |

## Data Fetching

### GitHub — Repos (`projects.js`)

| | |
|---|---|
| **Endpoint** | `GET https://api.github.com/users/nayaksomkar/repos?sort=updated&per_page=100&type=public` |
| **When** | On `projects.html` page load via `fetchRepos()` |
| **Flow** | `initProjects()` → `loadConfig()` → `fetchRepos()` |
| **Filtering** | Removes forks, then filters against `config.ignoreProjects` (case-insensitive, supports full URLs or just names) |
| **Sorting** | `sortByPriority()` — three sections: **Projects** (`config.priorityProjects`), **Building Blocks** (default), **Dummies** (`config.dummies`). Each section sorted by `stargazers_count` descending. Dashed `.priority-divider` separates sections. Per-section counts shown in badge |
| **Rendering** | Each repo gets a `.project-card` with name, description, language dot, stars, forks, last updated |
| **Caching** | Repo count stored in `localStorage` key `projectsCount` (used by socials page) |
| **Error handling** | Spinner while loading → error message on failure (403 gets "rate limit" message) |

### GitHub — README (`projects.js`)

| | |
|---|---|
| **Endpoint** | `GET https://api.github.com/repos/nayaksomkar/{repo}/readme` |
| **When** | On `.project-card` click via `openProjectWindow(repoName)` |
| **Flow** | Open overlay → show spinner → fetch README → base64 decode → render with `marked` |
| **MD rendering** | Uses `marked` with GFM, custom renderer for images (relative → raw.githubusercontent.com), links (open in new tab), code blocks |
| **Image resolution** | `resolveUrl()` — if relative, prepends `https://raw.githubusercontent.com/{user}/{repo}/main/` |
| **Window controls** | macOS traffic light buttons (close/minimize/maximize), circular, red/yellow/green. Close (Escape/click outside), minimize (slide out), maximize (toggle full width) |
| **Error handling** | 404 → "No README found", other → error message |

### Bluesky — Profile & Feed (`socials.js`)

| | |
|---|---|
| **Profile endpoint** | `GET https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=nayaksomkar.bsky.social` |
| **Feed endpoint** | `GET https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=nayaksomkar.bsky.social&limit=3` |
| **When (counts)** | On `socials.html` page load via `loadCounts()` |
| **When (popup)** | On Bluesky card click via `openBSkyPopup()` |
| **Count flow** | `loadCounts()` → `fetchCount(url, extractor, cacheKey)` for each API → updates `.connect-desc` text |
| **Popup flow** | Fetch feed → build `bskyPosts` array → `renderBSkyPost(0)` → stack carousel with 3 cards |
| **Cache keys** | `bsky-both-v2` stores `{followers, posts}` with timestamp, 30-min TTL |
| **Cache mechanism** | `fetchCount()` checks localStorage first, falls back to fetch, writes back on success |
| **Navigation** | Touch swipe (>40px delta) + ArrowLeft/ArrowRight keys + loops at ends |
| **Text formatting** | `formatBSkyText()` — link detection, hashtag links, line breaks |
| **Error handling** | Empty posts → "No posts" message, fetch failure → silent catch |
| **Window** | `.window.bsky-stack-wrap` with macOS titlebar (close/minimize/maximize), `.window-footer` with hint bar + Open Bluesky link |

### Hugging Face — Models & Datasets (`socials.js`)

| | |
|---|---|
| **Model endpoint** | `GET https://huggingface.co/api/models?author=nayaksomkar&limit=100` |
| **Dataset endpoint** | `GET https://huggingface.co/api/datasets?author=nayaksomkar&limit=100` |
| **When (counts)** | On page load via `loadCounts()`, uses `fetchCount()` helper |
| **When (popup)** | On HF card click via `openHFPopup()` |
| **Count flow** | Two separate `fetchCount()` calls → extracts `.length` from arrays |
| **Popup flow** | `Promise.all([models fetch, datasets fetch])` → shows last 2 of each with download counts |
| **Cache keys** | `hf-models`, `hf-datasets` (30-min TTL) |
| **Window** | Full macOS-style titlebar with min/max/close, footer with "Open Hugging Face" link |
| **Error handling** | Empty → "No models or datasets found", fetch failure → silent catch |

### ClashKing — CoC Player Data (`coc.js`)

| | |
|---|---|
| **Primary endpoint** | `GET https://api.clashk.ing/player/%239PU28QLQQ/warhits?limit=1` |
| **Fallback endpoint** | `GET https://api.clashofclans.com/v1/players/%239PU28QLQQ` (requires `cocApiKey`) |
| **When** | On stats popup open via `openMainCoCPopup()` |
| **Flow** | `openMainCoCPopup()` → show loading spinner → `fetch(ClashKing)` → `parseWarhits()` → `renderCoC()` |
| **Parsing** | `parseWarhits()` — extracts `member.name`, `member.townhallLevel`, `war_data.clan` from latest war hit |
| **Fallback chain** | If ClashKing fails → `tryOfficialAPI()` (requires config key) → `renderCoCLinksFallback()` |
| **Town Hall image** | Dynamic: `https://www.clashofstats.com/images/game-data-sprites/1x/th-{level}.png` |
| **Stats rendered** | TH image, player name, TH level, clan name, player tag, "Full player stats" link |
| **Window** | macOS-style titlebar with close button, footer with Clash of Stats link |
| **Error handling** | "Could not fetch player data" message on total failure |

### Config Loader (`script.js`)

| | |
|---|---|
| **Endpoint** | `portfolio-config.json` (local file) |
| **When** | On each page load via `loadConfig()` |
| **Flow** | `fetch('portfolio-config.json')` → parse JSON → store in global `config` variable |
| **Shared access** | `projects.js` reads `config.ignoreProjects`, `config.priorityProjects`, `config.dummies`
| | `socials.js` reads `config.ignoreProjects` for repo filtering  
| | `coc.js` reads `config.cocApiKey` for official API fallback |
| **Error handling** | Silent catch — defaults to empty arrays/strings |

### Proxy Server (`proxy.js`)

| | |
|---|---|
| **Endpoints** | `/api/coc` — scrapes Clash of Stats HTML for player TH, BH, trophies, clan, location  
| | `/api/twitter/profile` — Twitter user profile (requires `TWITTER_BEARER_TOKEN`)  
| | `/api/twitter/tweets` — Twitter recent tweets (requires `TWITTER_BEARER_TOKEN`) |
| **CORS** | All endpoints set `Access-Control-Allow-Origin: *` |
| **Start** | `node proxy.js` (default port 3001) |
| **Usage** | Not currently connected to frontend — kept as optional infra |

## Configuration

```json
{
  "ignoreProjects": ["repo-name"],
  "priorityProjects": ["featured-repo"],
  "dummies": ["learning-repo"],
  "ignoreCertificates": ["cert-title"],
  "cocApiKey": "optional-clash-of-clans-api-key"
}
```

## APIs

| Service | Notes |
|---------|-------|
| GitHub | Public repos & READMEs, CORS-friendly |
| Bluesky | `public.api.bsky.app` — profile & feed |
| Hugging Face | Models & datasets, public |
| ClashKing | `api.clashk.ing` — Clash of Clans data, no auth |
| CoC Official | Fallback, requires `cocApiKey` in config |
| Clash of Stats | CDN for TH level images |

## Dev Commands

| Action | Command |
|--------|---------|
| Serve locally | `python3 -m http.server 8000` |
| Lint | N/A (vanilla, no toolchain) |
| Start proxy | `node proxy.js` |

## Files That Must NOT Spoil Easter Eggs

- `README.md` — public-facing, keep clean
- `AGENTS.md` (this file) — dev context only, no spoilers
