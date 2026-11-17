# 011 — One motion family: China transfer, Automatic orders, Auto lombard

- **Written:** 2026-11-17, at the user's request ("audit all 3 flows fully: china transfer, automatic
  payments and auto lombard. Prepare full plan what to improve and how to make all this one
  animation/interaction family"). "Automatic payments" is the live **Automatic orders** study
  (`/studies/automatic-orders`); the older Automatic payments study is archived.
- **Commit:** none (the project is not a git repository).
- **Method:** Emil's `improve-animations` audit (its eight categories, `AUDIT.md` values) and the
  `animate` / `animation-accessibility` rules. Every finding was re-read at its `file:line` on
  2026-11-17. Decided behaviour in `docs/motion-studies/*.md` and `content/patterns.js` is respected,
  not re-opened; where a fix would touch an approved value it is listed under **Decisions**.
- **Status:** **built 2026-11-17, not yet reviewed.** The user asked to build the full plan without
  approvals while away ("implement this full plan, don't ask for approvals"). D1–D3 were taken on this
  plan's recommendations; they are not user decisions. See **Build log** at the end.

---

## 1. Recon

| | |
| --- | --- |
| **Stack** | Next.js 16, React. Motion is plain CSS transitions (`@property --ao-w`, `@starting-style`), WAAPI (`element.animate`) for tray presence, and rAF for the tray-height spring. Torph (`torph`, `torph/react`) morphs labels and digits. DialKit is lab tooling (China timeline). `motion` is installed but no flow imports it. |
| **Two engines** | **China** runs its own controller, `lib/transfer-motion.mjs` (679 lines): every panel, title, the amount line, the button and the tray are painted per frame from weights, with per-pair profiles (`transitionProfile`). **Automatic orders and Auto lombard** share `components/TrayFlow.jsx`: `useTrayHeight` (spring, rAF), `useLayers` / `Layers` (CSS transition on `--ao-w`) and `Action` (footer button). The CSS lives in `app/studies/automatic-orders/automatic-orders.css`. |
| **Tokens** | `content/motion.mjs`: curves `easeOut .23,1,.32,1` · `easeOutExpo .19,1,.22,1` · `easeOutQuad .25,.46,.45,.94` · `drawer .32,.72,0,1` · `textSwap .25,1,.5,1`; spring `tray ω 32.5`; durations press 150 · digitMorph 180 · textSwap 300 · trayOpen 320 · trayClose 240 · backdropIn 240 · backdropOut 200 · reduced 150 · spinner 700. CSS: `--credo-ease-*`, `--credo-duration-*`. Pinned by `tests/motion-tokens.test.mjs`. |
| **Personality** | A bank for people 40+: calm, crisp, Family-inspired. No bounce anywhere (all springs critically damped). Delight is reserved for rare moments (the M4 video guide). |
| **Frequency** | Each flow is occasional (a few times a month). Inside a flow: step changes, presses and keypad digits are the most frequent (tens per run); tray open/close, sending → success and the result are once per run. Nothing is used 100+ times a day. |

## 2. Already one family (keep)

Checked in code on 2026-11-17. These match across all three flows.

| Moment | Shared behaviour | Where |
| --- | --- | --- |
| Tray presence | Slides from the bottom edge on `drawer` 320 ms, closes 240 ms; backdrop `easeOut` 240 / 200 ms; hidden in the same frame the close ends | `TransferStudy.jsx:149–188`, `AutomaticOrdersStudy.jsx:172–199`, `AutoLombardStudy.jsx:163–186` (same values, three copies: see F6) |
| Tray height | Clip-path reveal, content rides the edge, critically damped spring ω 32.5; ω 42 for the one recorded creeping move in each of China and lombard | `transfer-motion.mjs:39,57`, `TrayFlow.jsx:29–83`, `lib/auto-lombard-flow.mjs` `trayOmega` |
| Step handoff | Outgoing clears on a short exit, incoming arrives on `easeOut`, scale .96 (.98 keypad), blur `8px·w·(1−w)` (2 px peak), reversal retargets | `transfer-motion.mjs:40–75`, `automatic-orders.css:80–97` |
| Footer button | One persistent button; label morphs with Torph `textSwap` 300 ms; primary → secondary while sending → light green success | `TransferStudy.jsx:115`, `TrayFlow.jsx:134–147`, `primary-button.css:76–86` |
| Press | scale .97, 150 ms `easeOutQuad`, via `usePointerPress` (`data-pointer-pressed`) | keypad, list row, option card, product card, upload slot, presets, primary button |
| Selection | Fill grows from the centre 200 ms `textSwap`, back 140 ms (SelectMark, consents, upload check); China presets: ring .94 → 1, 180 ms | `list-row.css:42–49`, `transfers.css:83–88` |
| Digits | Torph `digitMorph` 180 ms `easeOutExpo`; code digits pop from .85 in 180 ms | `AmountDisplay`, `code-input.css:5–6` |
| Text links | 44 px tap height through an invisible hit area | `automatic-orders.css` `.ao-link::before`, `auto-lombard.css` `.al-edit::before`, `transfers.css:77` |
| Reduced motion | Every moving part falls back to opacity (and colour) | each CSS file's `prefers-reduced-motion` block |

## 3. Where the three flows drift (findings, ranked by leverage)

| # | Severity | Category | Location | Finding | Fix |
| --- | --- | --- | --- | --- | --- |
| F1 | MEDIUM | Cohesion (spatial) | `TrayFlow.jsx:134–147` `Action`; `automatic-orders.css:106–112` | **Sending → success is poorer in Automatic orders and lombard than in China.** China: the spinner grows in from .6 and shrinks as the check grows into the same slot, the tick **draws on** (stroke-dashoffset over 180 ms, `transfer-motion.mjs:399`), and outgoing words blur to 2 px (`transfers.css:165–169`). TrayFlow: the spinner only fades, the tick is static, and words swap without blur. One shared component (`Action`) fixes both flows. | **W1** |
| F2 | MEDIUM | Purpose & frequency (keyboard) | `AutomaticOrdersStudy.jsx:395`, `AutoLombardStudy.jsx:357`, `TrayFlow.jsx:91–131`, `TrayFlow.jsx:64–77` | **Keyboard actions animate in two flows.** China makes every keyboard-initiated step, open and close instant (`instantInput = event => event.detail === 0`, `TransferStudy.jsx:144`; documented in `transfers.md` "Full flow extension"). In Automatic orders and lombard, Escape slides the tray out and Enter on a row runs the full handoff and spring. | **W2** |
| F3 | LOW | Cohesion | `automatic-orders.css:43` (`.ao-title { --ao-scale: .96 … transform-origin: 0 50% }`) | **Titles scale in TrayFlow, not in China.** China keeps both titles in one position with opacity and blur only: "Both titles hold the same position; opposing slides read as two copies" (`transfer-motion.mjs:307`). TrayFlow titles also grow from .96. | **W3** (one value) |
| F4 | MEDIUM | Cohesion (outcome) | `TransferStudy.jsx:264`; `AutomaticOrdersStudy.jsx:215–224`; `AutoLombardStudy.jsx:120–127` | **Three different endings.** China: success stays in the tray until the person taps "Transfer Sent". Automatic orders: success holds 900 ms, the tray closes itself, and the new order lands in the list on a 120 ms timer while the tray is still sliding. Lombard: holds 900 ms, closes itself, nothing lands (the user removed the badge). | **W4** (decision D1) |
| F5 | LOW | Cohesion | `automatic-orders.css:101–102` vs `transfer-motion.mjs:387–388,501–553` | **The footer button arrives differently.** China: rises 4 px with scale .98, 130–150 ms on `easeOutQuad`. TrayFlow: rises 8 px, opacity 150 ms but transform 240 ms on `easeOut`. | **W5** (decision D2) |
| F6 | LOW | Cohesion / accessibility | the three presence blocks in §2 | **Tray open/close is copied three times and has drifted.** Under reduced motion China fades on `ease`; Automatic orders and lombard fade opacity on the steep `drawer` curve (AUDIT: opacity and colour changes use `ease`). | **W6** |
| F7 | LOW | Cohesion | `automatic-orders.css:80–93` vs `transfer-motion.mjs:40–75,84–103` | **Handoff timings are literals in two places.** TrayFlow: exit 100, entry 170. China: exits 90/100, entries 130/150/180/200 per pair (approved). Nothing names the shared values, so new flows copy whichever file they open. | **W7** (decision D3) |
| F8 | LOW | Accessibility | `primary-button.css:92`; `transfers.css:129–131`; `upload-slot.css:18–19,39` | **Three spinners, three reduced-motion behaviours.** The primary and China spinners stop dead (a frozen arc reads as hung); the upload spinner slows to 1400 ms. The upload spinner also hard-codes `700ms` instead of `--credo-duration-spinner`. | **W8** |
| F9 | LOW | Accessibility | `segmented-control.css:7–8` | Under reduced motion the Automatic orders pill and label colour both jump (`transition-duration: 0ms`). Reduced motion should drop the movement but keep the colour fade. Open since the AO review (`automatic-orders.md` "Press feedback…"). | **W9** |
| F10 | LOW | Physicality | `account-field.css:2–3` | Account field presses with `:active` at scale .98; every other pressable uses `data-pointer-pressed` at .97. Not used by a flow today (design-system only), so it would bring the odd press into the next flow that adopts it. | **W10** |

### Missed opportunities (additive)

- **M-a. One result rule (see D1).** Automatic orders lands its result where it lives; lombard now has
  nothing to land; China keeps the result in the tray. Whatever the user picks, write it once in the
  patterns.
- **M-b. Lombard video guide (plan 010 M4).** Still blocked on layered art; the only place a delight
  budget is justified.

### Checked and not filed

- **SelectMark grows from scale 0** (`list-row.css:42`), also used by the upload check. AUDIT flags
  `scale(0)`, but this was measured against Family's video (31% at 17 ms) and decided
  (`automatic-orders.md` "Agreement checkbox motion"). Kept.
- **Spinner, code-digit and `ao-found` keyframes:** constant or one-shot motion, exempt.
- **`.ao-order[data-landed]` animates `grid-template-rows` and margin** (`automatic-orders.css:25–28`):
  a layout animation, but one row, once per run, at the top of a short list. Exempt (few children).
  Its timing is part of W4.
- **`.ao-action__status` animates `width` and `margin`** (`automatic-orders.css:106`): makes room for
  the spinner beside the label, one small inline element, once per run. Exempt.
- **China's per-pair handoffs and ω 42 exceptions:** approved, documented, kept (see D3).
- **First-frame "jump" in plan 010 G5.** The 10–17% first step is the spring's own first 16 ms frame
  (ω 32.5 covers 10% in 16 ms, ω 42 covers 15%), not a lurch; the one 39% sample was a dropped frame
  (the tick clamps to 50 ms). No fix needed. Correct the plan 010 note when W-docs runs.

## 4. The family spec (target)

One table both engines follow. Values in **bold** change in this plan; the rest are today's.

| Moment | Rule | Values |
| --- | --- | --- |
| Open / close tray | Slide from the bottom edge; backdrop fades | `drawer` 320 / 240 ms; backdrop `easeOut` 240 / 200 ms; reduced: opacity 150 ms **`ease`** |
| Tray height | Critically damped spring to the content | ω 32.5; ω 42 only for a pair that creeps in a recording (Proposed rule) |
| Step change | Old clears, new arrives, reversal turns around | exit 100 ms, entry 170 ms, `easeOut`, scale .96 (.98 keypad), blur peak 2 px; China's tuned pairs stay as named exceptions (D3) |
| Titles | Complementary crossfade in one position | opacity + 2 px blur peak, **no scale** |
| Footer button | One button; label morphs; arrives once | Torph 300 ms `textSwap`, **outgoing words blur 2 px**; arrival per D2 |
| Sending → success | Primary → secondary + spinner → light green + check | **spinner grows from .6, check grows from .6 while the tick draws on (180 ms `easeOut`)** |
| Result | Per D1 | — |
| Press | Felt, not seen | .97, 150 ms `easeOutQuad`, via `data-pointer-pressed` only |
| Selection | Grows from the centre | 200 ms `textSwap`, back 140 ms; China preset ring .94 → 1 in 180 ms |
| Digits | Morph in place | Torph 180 ms `easeOutExpo`; code digit pop from .85 in 180 ms |
| Keyboard | **Instant** | **no step, height or presence animation when the trigger was a key** |
| Reduced motion | Gentler, not gone | opacity/colour only, 150 ms; **spinners turn at half speed (1400 ms)**; colours still fade |
| Text links | 44 px tap height | invisible `::before` hit area |

## 5. Work packages

Each package is self-contained. Exemplars are named; copy their structure.

### W1 — Sending → success parity in the shared `Action` (F1)

**Where:** `components/TrayFlow.jsx:134–147`, `app/studies/automatic-orders/automatic-orders.css:106–112`,
`app/studies/transfers/transfers.css:163–169`, `components/primary-button.css`.

Current code:

```jsx
// components/TrayFlow.jsx:139–143
<span className="ao-action__status" data-state={state} aria-hidden="true">
  <PrimaryButtonSpinner className="ao-action__spinner" /><PrimaryButtonCheck className="ao-action__check" />
</span>
<TextMorph as="span" className="ao-action__label" duration={durations.textSwap} ease={cubicBezier('textSwap')} respectReducedMotion>
```

```css
/* automatic-orders.css:108–111 */
.ao-action__status > svg { grid-area: 1 / 1; width: 20px; height: 20px; transition: opacity 150ms var(--credo-ease-out), transform 240ms var(--credo-ease-out); }
.ao-action__status .ao-action__check { opacity: 0; transform: scale(.6); color: var(--credo-color-success-solid); }
.ao-action__status[data-state="done"] .ao-action__spinner { opacity: 0; }
.ao-action__status[data-state="done"] .ao-action__check { opacity: 1; transform: none; }
```

```css
/* transfers.css:165–169 (China only today) */
.transfer-primary [torph-item] { transition: filter 160ms var(--credo-ease-out); }
.transfer-primary [torph-exiting] { filter: blur(2px); }
@media (prefers-reduced-motion: reduce) { .transfer-primary [torph-exiting] { filter: none; } }
```

**Target:**

1. Move the Torph blur into `components/primary-button.css` so every primary button shares it, and
   delete the China copy:
   ```css
   /* Outgoing Torph words soften as they fade, like Family's text swaps (China, 2026-11-12). */
   .credo-primary-button [torph-item] { transition: filter 160ms var(--credo-ease-out); }
   .credo-primary-button [torph-exiting] { filter: blur(2px); }
   @media (prefers-reduced-motion: reduce) { .credo-primary-button [torph-exiting] { filter: none; } }
   ```
   Check first that `.transfer-primary` carries the `credo-primary-button` class (it renders
   `PrimaryButton`); if not, keep the China rule and add the shared one.
2. Spinner grows in and shrinks out like China's:
   ```css
   .ao-action__status .ao-action__spinner { transform: scale(.6); }
   .ao-action__status[data-state="busy"] .ao-action__spinner { transform: none; }
   .ao-action__status[data-state="done"] .ao-action__spinner { opacity: 0; transform: scale(.6); }
   ```
3. The tick draws on. In `TrayFlow.jsx` pass `pathClassName="ao-action__tick"` to `PrimaryButtonCheck`
   (it already accepts it, `PrimaryButton.jsx:10–14`; the path has `pathLength="100"`). Then:
   ```css
   .ao-action__tick { stroke-dasharray: 100 110; stroke-dashoffset: 100; transition: stroke-dashoffset 180ms var(--credo-ease-out) 60ms; }
   .ao-action__status[data-state="done"] .ao-action__tick { stroke-dashoffset: 0; }
   ```
   `100 110` and 180 ms are China's values (`transfers.css` `.transfer-success-path`,
   `transfer-motion.mjs:399`). The 60 ms delay lets the circle start growing first.
4. Reduced motion (add to the existing block at `automatic-orders.css:149`):
   `.ao-action__status > svg { transform: none !important; } .ao-action__tick { stroke-dashoffset: 0; transition: none; }`

**Out of scope:** China's controller, the button colours, the status width transition, the hold times.

**Verify:** sending → success in Automatic orders (code step) and lombard (Send request → code): the
spinner grows from .6, the check grows while its tick draws, outgoing words blur. Seek with
`document.getAnimations()` at 0/60/120/240 ms. Reduced motion: no scale, tick shown at once, colours
still blend.

### W2 — Keyboard is instant in TrayFlow flows (F2)

**Exemplar:** China, `TransferStudy.jsx:144` (`instantInput`), `:159` (close), `:174` (open), and
`transfer-motion.mjs` instant `go(next, true)`.

**Where:** `components/TrayFlow.jsx` (`useTrayHeight.measure`, `useLayers`, `Layers`),
`AutomaticOrdersStudy.jsx` and `AutoLombardStudy.jsx` (`nav`, `goBack`, `openFlow`, `closeFlow`,
`dismiss`, the `onKeyDown` on the tray at `:395` / `:357`).

**Target behaviour:** when the action that changes the step, opens or closes the tray came from a key
(Enter/Space on a focused control, or Escape), there is no handoff, no spring and no slide: the new
step, height and presence appear in the next frame. Pointer input is unchanged.

**Steps:**
1. Add a `useInputSource(rootRef)` hook (in `TrayFlow.jsx`) that keeps `keyboard.current = true` on
   `keydown` (capture) and `false` on `pointerdown` (capture) on the phone root; flows read it. This
   mirrors `usePointerPress` (`components/usePointerPress.js`), which already listens on the root.
2. `useLayers(step, resetKey, instant)`: when `instant` is true at a step change, replace the layers
   with `[{ id, step, phase: 'idle' }]` (no `in`/`out` layers), exactly like the reset branch at
   `TrayFlow.jsx:95–99`.
3. Pass `instant` into `measure(true)` for that change (the `instant` branch already exists in
   `useTrayHeight.measure`). The simplest route: in the flow, after `setStack`, call
   `measure(keyboard.current)` from the same layout effect that already re-measures.
4. `openFlow` / `closeFlow`: when `keyboard.current`, skip `animate()` and set `hidden` directly (the
   close path must still hide tray and backdrop in the same frame and restore focus to the opener).
5. Titles follow step 2 (they use `useLayers` too).

**Out of scope:** China. Press feedback (already pointer-only). Reduced-motion code paths.

**Verify:** Tab to a row, press Enter: the next step appears at once (no `--ao-w` transition in
`getAnimations()`), height jumps. Escape on a later step goes back at once; on the first step closes
at once and focus returns to the opener. Tap the same controls: full motion as before. Add a unit test
for the `useLayers` instant branch through `nextLayers`/a pure helper if it is extracted.

### W3 — Titles hold their position (F3)

**Where:** `app/studies/automatic-orders/automatic-orders.css:43`.

```css
/* current */
.ao-title { --ao-scale: .96; position: absolute; top: 0; left: 0; white-space: nowrap; transform-origin: 0 50%; }
/* target */
.ao-title { --ao-scale: 1; position: absolute; top: 0; left: 0; white-space: nowrap; }
```

**Why:** with `--ao-scale: 1` the shared transform is `scale(1)` at every weight, so titles crossfade
with opacity and the 2 px blur only, as China's do. Nothing else changes.

**Verify:** step through Automatic orders and lombard; seek a title change at 85 ms: both titles at the
same x, no size change, opacities sum to 1.

### W4 — One ending (F4) — after D1

Build only the option the user picks.

- **Option A (recommended): "success in the button, then show it where it lives".** Every flow holds
  success in the button for 900 ms, the tray closes itself, and anything new appears **once the
  close has finished** (lombard G3 rule). Automatic orders: change `AutomaticOrdersStudy.jsx:222`
  ```js
  closeFlow(() => later(() => { setOrders(list => [order, ...list]); setLanded(order.id); }, 120));
  ```
  to call the landing from `slide.finished` (give `closeFlow` an `onClosed` callback like lombard's,
  `AutoLombardStudy.jsx:174–186`, and keep `onClosing` for anything that must start with the slide).
  China: success would close by itself after 900 ms instead of waiting for "Transfer Sent". This
  changes an approved China ending, so D1 must say yes for China explicitly.
- **Option B: keep three endings** and only record why each differs (China: the receipt is the
  result; Automatic orders: the order list is the result; lombard: nothing to show yet).

### W5 — Footer button arrival (F5) — after D2

**Where:** `automatic-orders.css:101–102`.

```css
/* current */
.ao-footer { … opacity: 0; transform: translateY(8px); … transition: opacity 150ms var(--credo-ease-out), transform 240ms var(--credo-ease-out); }
/* target (China's arrival: 4 px, .98, one 150 ms clock on easeOutQuad) */
.ao-footer { … opacity: 0; transform: translateY(4px) scale(.98); … transition: opacity 150ms var(--credo-ease-out-quad), transform 150ms var(--credo-ease-out-quad); }
```

Keep `.ao-footer[data-shown] { opacity: 1; transform: none; }` and the reduced-motion
`transition-property: opacity`. Values from `transfer-motion.mjs:6` (`MOTION.ease` = `easeOutQuad`,
`titleMs` 150) and the profile defaults `actionY: 4`, `actionScale: .98` (`:98–101`).

### W6 — One tray presence helper (F6)

**Where:** `TransferStudy.jsx:149–188`, `AutomaticOrdersStudy.jsx:172–199`, `AutoLombardStudy.jsx:163–186`.

**Target:** add to `components/TrayFlow.jsx`:

```js
/** Tray presence (all flows): slide from the edge on drawer, backdrop on easeOut.
    Reduced motion: an opacity fade on `ease`. Returns [slide, dim]. */
export function animateTrayPresence({ tray, backdrop, height, opening }) {
  const reduce = reducedMotion();
  const along = opening ? [`translateY(${height}px)`, 'translateY(0px)'] : ['translateY(0px)', `translateY(${height}px)`];
  const fade = opening ? [0, 1] : [1, 0];
  const slide = tray.animate(reduce ? fade.map(opacity => ({ opacity })) : along.map(transform => ({ transform })),
    { duration: reduce ? durations.reduced : opening ? durations.trayOpen : durations.trayClose,
      easing: reduce ? 'ease' : cubicBezier('drawer'), fill: opening ? 'none' : 'forwards' });
  const dim = backdrop.animate(fade.map(opacity => ({ opacity })),
    { duration: reduce ? durations.reduced : opening ? durations.backdropIn : durations.backdropOut,
      easing: cubicBezier('easeOut'), fill: opening ? 'none' : 'forwards' });
  return [slide, dim];
}
```

Replace the six `animate()` calls with it. Keep each flow's own `finished` handling (hide in the same
frame, focus the opener). **Out of scope:** changing any duration or curve except the reduced-motion
easing in Automatic orders and lombard (`drawer` → `ease`).

### W7 — Name the shared handoff values (F7) — after D3

Add to `content/motion.mjs` `durations`: `handoffExit: 100`, `handoffEnter: 170`. They become
`--credo-duration-handoff-exit` / `-enter` automatically. In `automatic-orders.css:85` and `:93` use
them instead of `170ms` / `100ms`. Update `tests/motion-tokens.test.mjs` (the `durations` deepEqual).
China keeps its pair profiles; add a comment in `transfer-motion.mjs` above `transitionProfile` that
its 130/150/180/200 ms entries and 90 ms exits are tuned exceptions to the shared 170/100.

### W8 — One spinner rule (F8)

- `upload-slot.css:18`: `700ms` → `var(--credo-duration-spinner)`.
- Reduced motion, all three spinners turn at half speed instead of stopping:
  - `primary-button.css:92`: `.credo-primary-spinner { animation: none; }` →
    `.credo-primary-spinner { animation-duration: calc(var(--credo-duration-spinner) * 2); }`
  - `transfers.css:129–131`: `.transfer-sheet .transfer-spinner { animation: none !important; transform: none !important; }` →
    `.transfer-sheet[data-view="processing"] .transfer-spinner { animation-duration: calc(var(--credo-duration-spinner) * 2); }`
  - `upload-slot.css:39`: `1400ms` → `calc(var(--credo-duration-spinner) * 2)`.

**Why:** a spinner is state, not decoration; a frozen arc reads as a hung app. Slow rotation in a 20 px
glyph is not vestibular motion. (If the user prefers stopping, swap to a 1 s opacity pulse instead.)

### W9 — Segmented control under reduced motion (F9)

`segmented-control.css:7–8`:
```css
/* current */
@media (prefers-reduced-motion: reduce) { .credo-segments__pill, .credo-segments button { transition-duration: 0ms; } }
/* target: no movement, colour still fades */
@media (prefers-reduced-motion: reduce) {
  .credo-segments__pill { transition-duration: 0ms; }
  .credo-segments button { transition: color var(--credo-duration-reduced) ease; }
}
```

### W10 — Account field press like everything else (F10)

`account-field.css:3`: `.credo-account-field:active, .credo-account-field[data-pressed] { transform: scale(.98); }`
→ `.credo-account-field[data-pointer-pressed] { transform: scale(.97); }` and add the reduced-motion
rule used by `list-row.css:23–24`. Callers spread `usePointerPress` (they already do on the phone root).

### W-docs — Write the family down

After the built packages are approved:
- `docs/motion-guide.md`: a short "Tray flow family" section linking §4 of this plan as the source.
- `content/patterns.js` `motion-handoffs`: add the family rules as **Proposed** (keyboard instant,
  titles hold position, success check draws on, spinners slow under reduced motion, the ending per
  D1). Tag one **Decided** only after the user approves it.
- `docs/motion-studies/auto-lombard.md` / plan 010: correct the G5 "first frame jump" note (see §3).

## Decisions for the user

1. **D1 — Ending (W4):** A) one rule for all three: success holds 900 ms in the button, the tray
   closes itself, the result appears once the tray is gone (China would no longer wait for a tap); or
   B) keep three endings. *Recommended: A for Automatic orders and lombard now; China only if you want
   it to close itself too.*
2. **D2 — Footer button arrival (W5):** use China's (4 px, .98, 150 ms) in Automatic orders and
   lombard? *Recommended: yes.*
3. **D3 — Handoff tokens (W7):** name exit 100 / entry 170 as the family default and keep China's tuned
   pairs as documented exceptions? *Recommended: yes; no China value changes.*

W1, W2, W3, W6, W8, W9 and W10 need no decision beyond "go".

## Build order

| Order | Package | Depends on | Files |
| --- | --- | --- | --- |
| 1 | W3 titles | — | `automatic-orders.css` |
| 2 | W1 success parity | — | `TrayFlow.jsx`, `automatic-orders.css`, `primary-button.css`, `transfers.css` |
| 3 | W6 presence helper | — | `TrayFlow.jsx`, three study files |
| 4 | W2 keyboard instant | W6 (uses the helper's skip path) | `TrayFlow.jsx`, two study files |
| 5 | W8, W9, W10 | — | component CSS |
| 6 | W5 | D2 | `automatic-orders.css` |
| 7 | W7 | D3 | `motion.mjs`, test, `automatic-orders.css`, `transfer-motion.mjs` comment |
| 8 | W4 | D1 | study files |
| 9 | W-docs | after review | guide, patterns, plan 010 |

W1 and W3 both edit `automatic-orders.css`; run them one after the other, not in parallel.

## Out of scope

- No new animation library; no move of China onto TrayFlow (its controller carries the amount line,
  timeline scrubbing and tuned pairs; a rewrite would risk approved behaviour for little gain).
- No change to any approved China value unless D1/D3 say so.
- Loyalty and My Space.

## Verification (every package)

**Build:** `npm test` and `npx next build` pass; add tests where a package adds logic (W2) or a token (W7).

**Behaviour**
- [ ] Tap through each flow end to end; reverse quickly mid-step: layers turn around, nothing snaps.
- [ ] Keyboard pass in Automatic orders and lombard (W2): nothing animates; focus is never lost.
- [ ] Reduced motion emulated: nothing moves; opacity and colour still change; spinners turn slowly.

**Feel**
- [ ] Record sending → success in all three flows at 60 fps and compare side by side: same spinner,
  same check, same word blur.
- [ ] Watch at normal speed in a visible tab, then on a real iPhone (dev server by IP).
- [ ] Look again the next day before tagging anything Decided.

## Notes

- Feel can't be settled from code: whether the drawn tick reads in a 20 px check, and whether China's
  4 px / .98 button arrival feels better than TrayFlow's 8 px in the other flows, need a look.
- Two engines remain by design. The family is the spec in §4 plus shared tokens and components, not
  one code path.

## Build log (2026-11-17)

All packages built. 72 tests and `next build` pass. Checked in the browser (background tab for logic,
a briefly fronted test tab for timing; the user's tab was left alone).

| Package | What was done | Checked |
| --- | --- | --- |
| W1 | Torph blur moved to `primary-button.css` (China copy removed). `.ao-action__spinner` uses the `scale` property (.6 → 1 → .6) so it composes with the spin; `PrimaryButtonCheck` gets `pathClassName="ao-action__tick"`; tick `100 110` dash, 180 ms easeOut, 60 ms delay. Reduced motion: no scale, tick shown. | Fronted tab, per frame: spinner .60 → .71 (66 ms) → .96 (130 ms) → 1; on success back to .6 while the tick goes 100 → 50 → 3 → 0 px over ~200 ms; outgoing words blurred. |
| W2 | `useInputSource(rootRef)` (capture keydown / pointerdown) in `TrayFlow.jsx`; `useLayers(step, key, keyboard)` swaps with no handoff; `useTrayHeight({ instant })` jumps; open skips the presence animation, `closeFlow({ instant })` hides at once. Timer-driven closes (after success) still animate. | AO and lombard: Enter → one `idle` layer, no presence animation; Escape back and close instant; taps still give `out` + `in` layers and 320 / 240 ms presence. |
| W2 extra | Found while checking: focus dropped to `<body>` after a step change (Escape then did nothing) and the opener was never refocused (the screen behind was still `inert`). Added `useKeepFocus` and a refocus after the re-render. | Lombard: focus on the tray after a keyboard step; on the opener after a keyboard and a pointer close. |
| W3 | `.ao-title { --ao-scale: 1 }`, transform-origin removed. | Computed `--ao-scale: 1`. |
| W4 (D1 = A, AO and lombard only) | `closeFlow({ onClosed })` in AO; the order lands once the tray is hidden. Lombard already matched. China unchanged. | AO: 2 rows during the close, 3 with `data-landed` after. |
| W5 (D2 = yes) | `.ao-footer` 4 px, .98, 150 ms easeOutQuad on both properties. | Computed transition. |
| W6 | `lib/tray-presence.mjs` (`animateTrayPresence`, pure `presenceKeyframes` / `presenceTiming`), used by all three flows. AO and lombard reduced-motion fade now `ease`. | China open 320 ms drawer 370 → 0 px, backdrop 240 ms; close 240 / 200 ms forwards; unit tests. |
| W7 (D3 = yes) | `durations.handoffExit: 100`, `handoffEnter: 170` (+ CSS vars, test); used in `automatic-orders.css` and `upload-slot.css`; comment above China's `transitionProfile`. | Computed vars 100ms / 170ms. |
| W8 | Upload spinner reads the token; all three spinners run at `spinner × 2` under reduced motion. | CSS test. |
| W9 | Segmented control: pill instant, label colour 150 ms `ease` under reduced motion. | — (reduced motion not emulated) |
| W10 | Account field presses on `[data-pointer-pressed]` (and the preview's `[data-pressed]`) at .97, with a reduced-motion rule. | — (design-system only) |
| W-docs | Motion guide section, Motion handoffs pattern (7 Proposed rules), study notes for all three flows, plan 010 G5 correction. | — |

**Not verified:** reduced motion in a browser (only by CSS tests), the side-by-side recording of all three
success moments, and an iPhone. Feel is unreviewed.


## Recording: sending → success, all three flows (2026-11-17, user: "Yes, record them")

Visible tab, 60 Hz, scripted taps, values read every frame from computed style (spinner `scale` and
opacity, check scale and opacity, tick `stroke-dashoffset`; opacity includes the status slot's).
Times are from the first frame of the state change.

| Moment | China | Automatic orders | Auto lombard |
| --- | --- | --- | --- |
| Spinner grows in (.6 → 1) | .83 at 33 ms, .95 at 60, 1 at ~125 ms | .81 at 53 ms, .93 at 86, 1 at ~186 ms | same as Automatic orders |
| Spinner shrinks / check grows | check .79 at 25 ms, .93 at 58, 1 at ~125 ms | check .72 at 32 ms, .88 at 66, 1 at ~165 ms | same |
| Tick draws (100 → 0) | starts with the check: 52 at 25 ms, 17 at 58, 5 at 91, done ~160 ms | waits 60 ms: 100 at 66 ms, 49 at 99, 14 at 132, done ~230 ms | same |
| Outgoing words blur | peak 1.9 px | peak 1.9 px | peak 2 px |

- Automatic orders and lombard are now the same as each other (one shared button).
- They match China in shape and order. Two timing differences remain, both mine, not China's:
  - **The tick starts ~65 ms later and finishes ~70 ms later than China's.** The 60 ms delay in W1 was
    an assumption ("let the circle start first"); China draws the tick with the circle.
  - **The spinner and check settle ~40–60 ms later.** TrayFlow's 240 ms `scale`/`transform` transition
    has a longer tail than China's state-weight motion (done in ~125 ms).
- Possible fix (not made): drop the 60 ms tick delay and shorten the status icon transition to 150 ms.
  Feel still needs a look at normal speed.

### Matched to China (2026-11-17, user: "Yes, match China")

Changed in `automatic-orders.css` (shared button, so both flows): the tick's 60 ms delay removed
(180 ms easeOut, starting with the circle); the status icons' `transform` / `scale` transition
240 → 150 ms. Re-recorded Automatic orders the same way (lombard uses the same CSS):

| Moment | China | Automatic orders, after |
| --- | --- | --- |
| Check grows | .79 at 25 ms, .93 at 58, 1 at ~125 ms | .77 at 23 ms, .95 at 57, 1 at ~110 ms |
| Tick draws | 52 at 25 ms, 17 at 58, 5 at 91, ~0 at 158 | 63 at 23 ms, 18.5 at 57, 4.6 at 90, ~0 at 155 |
| Spinner grows | .95 at 60 ms, 1 at ~125 | .89 at 60 ms, 1 at ~126 (first movement ~30 ms later) |

Observation: the remaining ~30 ms is the start, not the motion. China's controller paints the new
state in the same frame as the tap; TrayFlow waits for React to render the new state. Not changed.

**Correction (user: "fix the 30 ms start gap too", 2026-11-17):** the gap is the dev server, not the
button. Traced frame by frame: in dev, React takes ~26 ms to commit the busy state (then the CSS
transition starts on the next frame with no lost frame). In a production build (`next start`, launch
config `credo-motion-lab-prod`, port 4174) the commit takes ~8 ms and the two buttons move together:

| Frame after the tap | ~7 ms | ~24 ms | ~40 ms | ~57 ms | ~74 ms | ~107 ms |
| --- | --- | --- | --- | --- | --- | --- |
| China spinner scale | .64 | .77 | .87 | .93 | .96 | .99 |
| Automatic orders spinner scale | .60 | .77 | .89 | .95 | .98 | 1 |

The only difference left is China's first frame (.64 vs .60, 4% of the move, ~7 ms). No code changed:
a fix (for example a negative transition delay) would put Automatic orders ahead of China from the
second frame on. Lesson: time starts in a production build; dev render cost looks like motion lag.
72 tests pass (one assertion added for these values).

