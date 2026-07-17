# Karamel Kumar 🧡

Warm, cozy, caramel-themed sub-page — a dedicated space for the @KaramelKumar brand on the portfolio site.

## Overview

| | |
|---|---|
| **Page** | `karamel.html` |
| **Styles** | `karamel.css` — caramel color variables, layout, responsive |
| **Logic** | `karamel.js` — connect card data + renderer |
| **Emoji burst** | `script.js` — `triggerKaramelRain()` |
| **Entry** | "🧡 get karamelised" link in footer of every main page |

Accessed at `/karamel` (relative to portfolio root).

## Design Aesthetic

Warm mocha ambience. Deep browns and amber accents replace the main site's purple palette.

| Role | Dark | Light |
|------|------|-------|
| Background | `#2c1810` | `#faf3eb` |
| Accent (primary) | `#e8a84c` | `#b87333` |
| Text | `#f7efe8` | `#2a1a0d` |
| Card bg | `rgba(61,36,21,0.3)` | `rgba(255,255,255,0.6)` |
| Border glow | `rgba(232,168,76,0.2)` | `#e8d5c0` |
| Shadow hover | `rgba(232,168,76,0.15)` | `rgba(184,115,51,0.15)` |

Toggle ball uses a caramel gradient (`#d4923d` → `#e8a84c`) instead of purple.

## Page Structure

```
✦ ✦ ✦                          ← karamel-drip (top)
Karamel Kumar 🧡               ← section title
@KaramelKumar                   ← handle
warm · cozy · caramel everything ← tagline
[ Instagram ] [ Threads ] [ YouTube ] ← connect cards (3-column grid)
✦ ✦ ✦                          ← karamel-drip (bottom)
← back to @nayaksomkar          ← footer
```

## Emoji Burst

On page load, a sweet emoji rain animates across the screen as a welcome effect:

- **Emojis**: 🧡 🤎 🍫 🍬 🍭 ✨ 💛 🍯 🍪 🍩
- **Desktop**: 28 main particles + 3 child particles each (~112 total)
- **Mobile**: 22 main particles + 2 child particles each (~66 total)
- **Timing**: Fires 900ms after load. Particles pop in with staggered delay, float gently, then fade upward and exit.
- **Animation**: Reuses `hearts-particle` / `hearts-overlay` CSS classes from the main site heart burst — identical quality, different emojis.
- **Vibration**: Subtle haptic feedback on mobile.

## Responsive

| Breakpoint | Behavior |
|------------|----------|
| >768px | 3-column connect grid, centered layout, `clamp()`-based font sizing |
| ≤768px | Cards start closer to top (`justify-content: flex-start`), tighter drip spacing |
| ≤480px | 1-column connect grid, horizontal card layout for easy thumb reach |
| Short viewport (≤700px) | Compact padding, reduced vertical gaps |

Uses `clamp()` for font sizes and spacing — smooth scaling across all device sizes without hard breakpoints for typography.

## Connect Cards

Three social links rendered as cards (identical pattern to the main site socials page):

| Card | Destination |
|------|-------------|
| Instagram | `instagram.com/KaramelKumar` |
| Threads | `threads.net/@KaramelKumar` |
| YouTube | `youtube.com/@KaramelKumar` |

Cards inherit `.connect-card` styles from `socials.css` with caramel hover glow via `--purple-accent` variable.

## Footer

Minimal — just a "← back to @nayaksomkar" link. Social links live in the cards above, so the footer stays clean.

## Key Files

| File | Role |
|------|------|
| `karamel.html` | Page markup |
| `karamel.css` | Theme variables, layout, responsive, decorative accents |
| `karamel.js` | Social link data + card renderer |
| `script.js` | `triggerKaramelRain()` emoji burst function |
| `style.css` | `.karamel-link` hover glow on main site footers |
| `socials.css` | Shared `.connect-grid` / `.connect-card` styles |
