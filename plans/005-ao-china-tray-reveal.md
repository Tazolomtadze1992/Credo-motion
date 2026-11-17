# 005 — Reveal the Automatic orders tray like China: clip, not height, and keep content above the button

- **Commit:** none (the project is not a git repository; written 2026-11-13)
- **Severity:** HIGH (content bleeds around the button) + MEDIUM (per-frame layout)
- **Category:** 7. Cohesion (China parity) and 5. Performance
- **Estimated scope:** 2 files, ~70 lines

## Problem

1. **Content shows around the button while the tray grows.** The tray body has no
   lower clip, so mid-spring the next step's lower rows are visible in the 16 px gap
   above Continue and the 34 px below it, until the spring catches up. China clips
   the content at the footer line and adds a 16 px fade above it
   (`lib/transfer-motion.mjs:252–261`, `.transfer-feather` in `app/studies/transfers/transfers.css:48`).
2. **The tray resizes by writing `style.height` (and `borderRadius`) every frame.**
   Animating layout properties re-lays out the whole tray on every frame, a frame-drop
   risk on phones. China keeps the sheet at a fixed height and moves only `clip-path`
   and `transform` (`sheet.style.clipPath = inset(offset 0 0 round 24px)`,
   `header/divider translateY(offset)`, `lib/transfer-motion.mjs:248–250`).

## Where

| File | Lines | What's there |
| --- | --- | --- |
| `components/AutomaticOrdersStudy.jsx` | 26–30 | `SCREEN_HEIGHT 852`, `TRAY_MAX 788`, `HEAD 80`, `FOOTER_SPACE 106`, `BOTTOM_INSET 34` |
| `components/AutomaticOrdersStudy.jsx` | 72–109 | `useTrayHeight`: spring and `paint()` writing height and radius |
| `components/AutomaticOrdersStudy.jsx` | ~234 | `useTrayHeight(surfaceRef, innerRef, { head: HEAD, footer: Boolean(action), fixed: null, rounded: true })` |
| `components/AutomaticOrdersStudy.jsx` | ~470–481 | The `<Tray … footer={<Action action={action} />}>` render |
| `app/studies/automatic-orders/automatic-orders.css` | 60–64 | `.ao-surface`, `.ao-head`, `.ao-head__divider` |

### Current code

```jsx
// components/AutomaticOrdersStudy.jsx:76
const paint = useCallback(() => {
  const surface = surfaceRef.current; if (!surface) return;
  const { value } = spring.current;
  surface.style.height = `${value}px`;
  if (options.current.rounded) {
    // Corners square up as the tray reaches the top of the screen.
    const radius = 24 * Math.max(0, Math.min(1, (SCREEN_HEIGHT - value) / 56));
    surface.style.borderRadius = `${radius}px ${radius}px 0 0`;
  }
}, [surfaceRef]);
```

```css
/* app/studies/automatic-orders/automatic-orders.css:60 */
.ao-surface { isolation: isolate; position: absolute; left: 0; bottom: 0; width: 390px; overflow: hidden; border-radius: 24px 24px 0 0; background: var(--credo-color-surface-tray); outline: none; pointer-events: auto; }
.ao-head { position: relative; height: 79px; }
```

## Target

The surface is always `TRAY_MAX` (788 px) tall and bottom-anchored. The spring value
`v` (visible height, same target as today) becomes an offset `o = TRAY_MAX − v`.

Each frame `paint()` writes only `clip-path` and `transform`:

```js
const o = TRAY_MAX - value;                              // hidden part above the tray
const r = rounded ? 24 * Math.max(0, Math.min(1, (SCREEN_HEIGHT - value) / 56)) : 24;
surface.style.clipPath = `inset(${o}px 0px 0px round ${r}px ${r}px 0px 0px)`;
head.style.transform = divider.style.transform = body.style.transform = `translateY(${o}px)`;
// Content stops at the footer line (China: inset(contentTop … footer …)).
// The body is TRAY_MAX − HEAD tall, so its bottom sits at o + TRAY_MAX in surface
// coordinates; the footer line is at TRAY_MAX − f. Clip the difference.
body.style.clipPath = `inset(0px 0px ${o + f}px 0px)`;
feather.style.transform = `translateY(${TRAY_MAX - f - 16}px)`;
```

where `f` is the footer reserve: `106` (FOOTER_SPACE) when the step has an action,
`34` (BOTTOM_INSET) when it does not. `f` must not jump: drive it with a second
critically damped spring in the same `tick`, using the existing
`sampleSurface(value, velocity, target, seconds, springs.tray.omega)` exactly as the
height spring does (target `106` or `34`). On an instant measure (open, reduced motion)
set it directly, like the height spring.

CSS:

```css
.ao-surface { height: 788px; border-radius: 0; overflow: hidden; }   /* keep the other existing declarations */
.ao-body { height: 708px; }                                          /* TRAY_MAX − HEAD */
.ao-feather { position: absolute; top: 0; left: 0; right: 0; z-index: 2; height: 16px; pointer-events: none;
  background: linear-gradient(to bottom, rgb(255 255 255 / 0), var(--credo-color-surface-tray)); }
```

**Why these values:**
- `clip-path: inset(o 0 0 round r r 0 0)` and `translateY(o)` on header/divider/body: China's mechanism (`lib/transfer-motion.mjs:248–250`). Only paint/composite; no layout per frame.
- Radius formula: unchanged from today's `paint()` (squares up within 56 px of the screen top).
- `106` / `34`: the existing `FOOTER_SPACE` / `BOTTOM_INSET` constants (56 px button + 16 px gap + 34 px home inset). China uses `34 + 72 * actionAlpha`, the same numbers.
- 16 px feather with that exact gradient: copied from `.transfer-feather` (`transfers.css:48`).
- Footer reserve on the tray spring (`springs.tray.omega` = 32.5): it moves with the tray instead of cutting content in one frame when a step gains or loses its button.

## Conventions to follow

- `app/studies/transfers/transfers.css:34, 46, 48` and `lib/transfer-motion.mjs:236–262` are the exemplar: copy the structure, not the China-specific constants (`PANEL_TOP`, `EDITOR_APERTURE_TOP`).
- Constants stay at the top of `AutomaticOrdersStudy.jsx` (lines 26–30). Do not add motion tokens; the spring is `springs.tray` from `content/motion.mjs`.
- `useTrayHeight` already handles `instant` and `reducedMotion()`; keep both paths.

## Steps

1. In `useTrayHeight`, keep the spring, `measure` and the ResizeObserver exactly as they are. Add a second spring state `{ value, velocity, target }` for the footer reserve (`f`) and step it in `tick` with `sampleSurface(..., springs.tray.omega)`. Keep `tick` running while either spring is moving.
2. Pass the footer reserve target from `measure`: `o.footer ? FOOTER_SPACE : BOTTOM_INSET` (the same expression already used for the height target). On `instant` or reduced motion, set both springs to their targets directly.
3. Rewrite `paint()` to the Target code. Find the parts once per paint from the surface:
   `surface.querySelector('.ao-head')`, `.ao-head__divider`, `.ao-body`, `.ao-feather`. Remove the `style.height` and `style.borderRadius` writes.
4. Render the feather inside the Tray but outside the body: change the Tray's `footer` prop to
   `footer={<><div className="ao-feather" aria-hidden="true" /><Action action={action} /></>}`.
5. CSS: add the Target rules. In `.ao-surface`, change `border-radius: 24px 24px 0 0` to `0` and add `height: 788px` (the clip draws the corners now).
6. Presence (`openFlow` / `closeFlow`) slides `.ao-presence` by `translateY(height)` where `height = spring.current.value`: leave it. The visible part is still `v` tall, so the slide distance is still right. Check this in Verification.

## Out of scope

- The step crossfade (plan 004), the footer's own fade/slide (`.ao-footer`), the button, the list screen.
- `useTrayHeight` `fixed` / `max` options and their call sites; the spring omega and the height target formula.
- China transfer files.
- Do not introduce a new animation library.

## Verification

**Build**
- [ ] `npm test` and `npx next build` pass.

**Behavior** (Browser pane visible; `/studies/automatic-orders`, Add payment)
- [ ] Settled states look exactly as before (compare screenshots of: picker, number keypad, review, agreements, code): same tray top, same corners, same button position.
- [ ] Picker (no button) → Categories → a provider → number step (gains the button, tray grows): at no frame do keypad rows show in the gap around Continue or below it. The bottom of the content fades out over 16 px above the clip line.
- [ ] Review → Pay from → back: the tray shrinks and grows without content crossing the button.
- [ ] Tap the dimmed area above the tray: it still closes the tray (the clipped part of the surface must not catch the tap).
- [ ] Open and close: the tray still slides fully off screen and back with `drawer` 320 / 240 ms, backdrop 240 / 200 ms.
- [ ] Performance panel, record one step change: no Layout events per frame from the tray (previously one per frame).
- [ ] With `prefers-reduced-motion: reduce`: the tray snaps to each height (as today); open/close is the 150 ms fade.

**Feel**
- [ ] Record at 60 fps and scrub a growing step: the content should look like it is being uncovered by the tray edge, never sliding behind the button.
- [ ] Try it on a real iPhone if possible: this plan exists for phone frame rates.
- [ ] Look at it again at normal speed.

## Notes

- Whether the 16 px feather should always be on, or fade out when the step settles (China fades it by row weight), is a feel call. Start always-on; if a settled step's last row looks washed out, report it rather than inventing a rule.
- The keypad steps are the tallest; check that the keypad's bottom row is fully clear of the feather when settled (it should be: settled content ends above the 16 px gap).
