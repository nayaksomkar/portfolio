# 🥚 Easter Eggs

> Internal documentation for all hidden interactions on the portfolio site.  
> **Keep this file out of public view** — don't link it from README.

---

## Prompt

Two easter eggs on the About page: Magic Number (tap ASCII art 6x → enter `634`) and CoC (tap tagline 6x → enter `coc`).  
Both have counter badges, 3-letter-box popups, haptic feedback, and emoji particle celebrations with child particles on desktop.  
CoC additionally fetches player stats from ClashKing API and shows a stats popup.

---

## Magic Number

| | |
|---|---|
| **Trigger** | Tap the ASCII art skull on the About page **6 times** (within ~1.2s window) |
| **Counter** | `1/6` → `6/6` badge appears beside the art, disappears on timeout/completion |
| **Puzzle** | 3 input boxes pop up — enter **`634`** |
| **Wrong** | Popup shakes, border turns red, phone vibrates, closes after 600ms |
| **Celebration** | `triggerHearts()` — 🖤🤍💜🦢✨ particles |
| **Particles** | 16 mobile / 28 desktop · each desktop particle spawns 3 child particles |
| **Cleanup** | Particles `exit` at 2.2s, overlay removed at 3.5s |

### Flow

```
6 taps → showMagicPopup() → 3 boxes → "634" ✓ → triggerHearts() → done
                                      → ✗ → shake + vibrate → close
```

### Code

| Aspect | Detail |
|--------|--------|
| **File** | `script.js` |
| **Trigger** | `click` event on `#ascii-art` element |
| **Counter** | `updateMagicCounter(count)` — creates/destroys `.magic-counter` badge |
| **Input popup** | `showMagicPopup()` — creates `.magic-popup` with 3 `.magic-box` inputs + `.magic-submit-two` button |
| **Auto-focus** | `inputs[0].focus()` after 100ms delay (ensures DOM ready) |
| **Input advance** | On input → auto-advance to next box. Backspace on empty → go back. Enter → submit. |
| **Validation** | `checkAnswer()` — `val === '634'` → remove popup → `triggerHearts()` |
| **Wrong answer** | `.shake` class + red border + vibration pattern → close after 600ms |
| **Particles** | `triggerHearts()` — document fragment approach, no reflow until append |
| **State vars** | `heartTapCount` (resets on timeout) + `heartTapTimer` + `magicCounterEl` |

### Styling

| Class | File | Purpose |
|-------|------|---------|
| `.magic-popup` | `style.css` | Full-screen overlay |
| `.magic-card` | `style.css` | Centered card with icon, text, inputs |
| `.magic-box` | `style.css` | 3 input boxes (narrow, centered, with bottom border) |
| `.magic-submit-two` | `style.css` | Purple "unlock" button |
| `.magic-counter` | `style.css` | Badge floating near ASCII art |
| `.shake` | `style.css` | Horizontal shake animation |

---

## Clash of Clans

| | |
|---|---|
| **Trigger** | Tap the tagline on the About page **6 times** (within ~1.2s window) |
| **Counter** | `1/6` → `6/6` badge with CoC styling, same behavior |
| **Puzzle** | 3 input boxes pop up — enter **`coc`** (auto-focused on first box) |
| **Wrong** | Same shake + vibrate + close as magic number |
| **Celebration** | `triggerCoCHearts()` — 🎮⚔️🏆👑🔥💎⚡🛡️ particles |
| **Particles** | 16 mobile / 28 desktop · 3 child particles per desktop parent |
| **Stats Popup** | Appears 800ms after celebration, shows TH image + player data |
| **Player Tag** | `#9PU28QLQQ` |

### Data Sources

| Priority | Source | Endpoint | Auth |
|----------|--------|----------|------|
| Primary | ClashKing | `api.clashk.ing/player/%239PU28QLQQ/warhits?limit=1` | None |
| Fallback | Official API | `api.clashofclans.com/v1/players/%239PU28QLQQ` | `cocApiKey` in config |

### Data Parsing (`parseWarhits`)

ClashKing returns a war hits array. The function takes the latest entry and extracts:

| Field | Source |
|-------|--------|
| `name` | `items[0].member_data.name` |
| `townHall` | `"TH " + items[0].member_data.townhallLevel` |
| `townHallLevel` | `items[0].member_data.townhallLevel` (numeric, used for image) |
| `clan` | `items[0].war_data.clan.name + " (lvl " + items[0].war_data.clan.clanLevel + ")"` |

Official API fallback (`tryOfficialAPI`) maps fields directly: `data.name`, `data.townHallLevel`, `data.clan`.

### Stats Popup Content

- Town Hall level image (from `clashofstats.com` CDN: `th-{level}.png`), wraps in `.coc-th-wrap` with glow
- 4 info rows (`.coc-row`): Name, Town Hall, Clan, Player Tag
- "Full player stats" link to Clash of Stats at bottom, separated by border

### Flow

```
6 taps → showGameQuestion() → 3 boxes → "coc" ✓ → triggerCoCHearts()
       → 800ms delay → openMainCoCPopup() → fetch ClashKing → render stats
                                         → ✗ → shake + vibrate → close
```

### Code

| Aspect | Detail |
|--------|--------|
| **File** | `coc.js` |
| **Trigger** | `click` event on `#coc-trigger` element |
| **Counter** | `updateCounter(count)` — creates/destroys `.coc-counter` badge |
| **Input popup** | `showGameQuestion()` — creates `.window-overlay` with 3 `.coc-letter` inputs + `.coc-submit` button |
| **Auto-focus** | `inputs[0].focus()` immediately after DOM append |
| **Input advance** | On input → auto-advance. Backspace → go back. Enter → submit. |
| **Validation** | `checkAnswer()` — `val === 'coc'` → remove popup → `triggerCoCHearts()` |
| **Stats fetch** | `openMainCoCPopup()` → spinner → ClashKing fetch → parse → render |
| **Fallback** | `tryOfficialAPI()` → if `config.cocApiKey` exists, try official CoC API → if fails, show fallback message |
| **Particles** | `triggerCoCHearts()` — separate from magic's `triggerHearts()` so emoji sets don't mix |
| **State vars** | `cocClickCount` (resets on timeout) + `cocClickTimer` + `cocCounterEl` |

### `openMainCoCPopup` — Full Flow

1. Create `.window-overlay` with macOS-style titlebar ("Clash of Clans · #9PU28QLQQ") + loading spinner
2. Close on: X button, Escape key, click outside
3. Fetch ClashKing `/warhits?limit=1`
4. If OK → `parseWarhits()` → `renderCoC()` builds HTML:
   - TH image: `<img src="https://www.clashofstats.com/.../th-{level}.png" class="coc-th-img">`
   - Stats grid: 4 `.coc-row` divs
   - External link: Clash of Stats
5. If ClashKing fails → `tryOfficialAPI()` → if that fails → fallback message

### Styling (`coc.css`)

| Class | Purpose |
|-------|---------|
| `.coc-window` | Window container: max-width 360px, centered, dark purple border |
| `.coc-th-wrap` | TH image wrapper with flex centering |
| `.coc-th-img` | TH icon: 72px, rounded, soft purple glow shadow |
| `.coc-row` | Stats row: flex row, label left, value right |
| `.coc-label` | Stat label: muted text, uppercase, small font |
| `.coc-value` | Stat value: white text, semibold |
| `.coc-counter` | Floating badge near tagline with CoC color scheme |
| `.coc-letter` | Input box: 48px, center text, purple accent border, uppercase transform |
| `.coc-submit` | Action button: purple gradient, hover scale |
| `.coc-link` | External link: purple accent, icon spacing |

---

## Shared Behavior

| Aspect | Detail |
|--------|--------|
| Tap timeout | 1.2s — counter resets if taps are too slow |
| Mobile particles | 16 per celebration |
| Desktop particles | 28 per celebration, each with 3 children (84 extra particles) |
| Haptic feedback | On each tap (20-30ms) and on wrong answer (pattern: 40-30-40-30-60) |
| Particle exit | `opacity`/`transform` fade via `.exit` class at 2.2s |
| Overlay cleanup | DOM removed at 3.5s |
| Particle rendering | Random position (0-100%), random delay (0-1.2s), randomized font sizes |
| Child particles | Desktop only: 3 per parent, offset randomly within 12% radius, staggered delay |
