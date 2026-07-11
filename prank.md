# 💀 OnlyFans Prank

The OnlyFans link on the website is a bait-and-switch prank.

## How it works

| Step | What happens |
|------|-------------|
| 1 | Card/footer shows `onlyfans.com/nayaksomkar` in the URL bar on hover |
| 2 | Click intercepted in **capture phase** (`addEventListener(..., true)`) |
| 3 | Emoji rain overlay + "really bro?" popup appears instantly |
| 4 | After 3 seconds — OR on "my bad 😅" click / tap outside — navigate to Rick Roll |
| 5 | Flag set in `localStorage` (`of-prank`) |
| 6 | On return to the page, flag triggers the popup again |
| 7 | `visibilitychange` listener also catches tab-switch returns |

## Trigger points

- **Socials page** — OnlyFans card in the connect grid (class `of-prank`)
- **Footer** — "OnlyFans" link in Connect column + OnlyFans icon in social bar (class `of-prank`)

## Files involved

| File | Purpose |
|------|---------|
| `script.js` | Capture-phase click interception, `triggerOFPrank()`, `visibilitychange` listener |
| `socials.js` | Socials card rendered with `of-prank` class |
| `style.css` | `@keyframes ofDrift` / `popBounce` + `of-logo` / `hf-logo` filter rules |

## Click interception

All prank links use capture-phase (`addEventListener(..., true)`) to fire the handler **before** the browser's default navigation. `preventDefault()` + `stopPropagation()` ensure the original `href` (OF URL) is never followed. `window.location.href` replaces the current page with the YouTube Rick Roll.

## Animation

- Emojis: `😂 🤣 😭 💀 🫵 🤨 😏 💀 🤡`
- 50 particles on desktop, 30 on mobile
- **`ofDrift`** — 5-keyframe path: each emoji drifts horizontally via `--drift` CSS custom property while rotating 720° (`--rot` direction)
- **`popBounce`** — spring-in animation on the 🤨 icon
- `visibilitychange` listener catches users returning to tab without page reload

## Popup flow

1. Click → popup appears immediately (before navigation)
2. `setTimeout` auto-navigates to Rick Roll after 3 seconds
3. User can click "my bad 😅" or tap outside to skip the wait
4. On return from YouTube → `of-prank` flag triggers popup again

## localStorage

- Key: `of-prank`
- Set on navigation to Rick Roll, read + cleared on return
- No expiry — exists only for one return cycle

## Mobile

- Reduced particle count (30 vs 50)
- Smaller font sizes, padding, emoji sizes
- `-webkit-backdrop-filter` for Safari
- `overflow: hidden` prevents scroll jank during animation
