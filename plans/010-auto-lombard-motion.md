# 010 — Auto lombard motion and interaction

- **Written:** 2026-11-17, at the user's request ("plan all the interaction/animation for this auto lombard
  flow … interactions should be same [as China transfer and Automatic orders]").
- **Commit:** none (the project is not a git repository).
- **Method:** Emil's `improve-animations` audit (its eight categories and plan template) and
  `review-animations` standards, read from `~/.claude/skills/`. Also `docs/motion-guide.md`, the China
  transfer and Automatic orders case studies, `content/motion.mjs` and the Decided rules in
  `content/patterns.js`. Every value below comes from those, not from estimates.
- **Status:** G1, G2 and G3 built 2026-11-17 (user: "Yes, build G1–G3"); G4 built the same day, with the
  demo photo added (user: "Build G4 and preload the demo photo too"). G5 measured the same day (user: "Do G5,
  measure the long tray moves") and recorded on screen (user: "Yes, record it"); Show your car ↔ Car photos now uses ω 42
  (user: "Yes, the 462 px move"). M4 not started.
  The feel checks below are still open.

## Principle: reuse, don't re-tune

Auto lombard is built on the same tray as Automatic orders (`components/TrayFlow.jsx`), which carries
China's approved handoffs. Repeated screens (lists, pickers, amount + keypad, receipt, terms, code)
therefore already move exactly as they do in China and Automatic orders. This plan keeps all of that,
adds motion only where Auto lombard has something new (uploads, the landing on Products, the video
guide), and fixes one place where it drifted from the system.

## 1. Already in place (keep; verify once)

Checked in code on 2026-11-17. All Decided unless marked.

| # | Moment | Behaviour | Values | Source |
| --- | --- | --- | --- | --- |
| R1 | Open / close the tray (Request a new product) | Slides from the bottom edge; backdrop fades | `drawer` curve, `trayOpen` 320 ms / `trayClose` 240 ms; backdrop `easeOut` 240 / 200 ms; reduced: opacity 150 ms | China, AO |
| R2 | Tray height between steps | Clip-path reveal on a critically damped spring; content rides the edge; footer line jumps up when a button appears, glides down when it goes; 16 px feather | `springs.tray` ω 32.5 | AO plan 005 |
| R3 | Step change | Outgoing step clears on its own short exit; incoming arrives; interruptible (a quick Back turns the same layer around) | exit 100 ms, entry 170 ms `easeOut`; scale .96 (.98 keypad steps); blur peaks 2 px mid-swap | China plan 006, AO plan 004 |
| R4 | Step titles | Complementary crossfade, never a blank title | 170 ms `easeOut` | China, AO |
| R5 | X button | Closes on the first step, steps back on every later one; Escape does the same | — | navigation pattern |
| R6 | Press | Cards, option cards, rows, keys, upload slots, the term pill | scale .97, 150 ms `easeOutQuad` | AO review |
| R7 | Footer button | One persistent button; the label morphs (Continue → Send request; "3 of 10 photos" counts up, then Continue). Sending → Request sent: secondary with spinner, then light success with check | Torph, `textSwap` 300 ms; spinner 700 ms linear | China, AO |
| R8 | Amount digits and monthly line | Digits morph as you type | Torph, `digitMorph` 180 ms `easeOutExpo` | China |
| R9 | Code digits | Each digit pops in | 180 ms `easeOutExpo` from scale .85 | AO |
| R10 | Select marks and consents | Fill grows from the centre, shrinks back faster | 200 ms `textSwap`; back 140 ms | selection pattern |
| R11 | Pickers (Term, Insurance) | Choosing returns at once, no Done button | — | selection pattern |
| R12 | Edit from Check your loan | Returns to that review instead of stacking a new one | — | tray-flows pattern |

## 2. Gaps (audit findings, ranked)

| # | Severity | Category | Location | Finding | Fix |
| --- | --- | --- | --- | --- | --- |
| G1 | MEDIUM | Cohesion | `app/studies/auto-lombard/auto-lombard.css:60–62` (`.al-needs .credo-row`) | "You will need" rows stagger in (`al-need-in` keyframes, 120 ms delay + 60 ms per row) on top of the step's own entry: two entrances in one container, unlike every list in China and AO. Keyframes also replay on Back and can't reverse. I added this after "looks dead"; the user never approved it. | Remove the stagger; the step handoff (R3) is the entrance. |
| G2 | MEDIUM | Missed opportunity | `components/UploadSlot.jsx`, `upload-slot.css` | Upload states swap instantly: the spinner is replaced by the photo and check in one frame, and the error border and message pop. Uploads are the flow's most repeated new action (12 slots). | See Target G2. Reuses the selection motion, so a done check means the same thing as a ticked box. |
| G3 | MEDIUM | Missed opportunity (spatial) | `components/AutoLombardStudy.jsx` `send()`; `ProductCard` badge | After Request sent, the tray closes and "Under review" appears on the Loans card 120 ms later in one frame. AO lands its new order where it lives (row opens, then a brief highlight). | See Target G3: the badge lands on the card once the tray is gone. |
| G4 | LOW | Performance | guide steps (`guide-id.jpg`, `guide-video.jpg`, `guide-vin.jpg`) | The guide images load the first time their step opens, so on a slow network the picture paints after the step has arrived. They have width/height, so the tray height does not jump. | Preload the three images when the tray opens. No motion change. |
| G5 | LOW | Feel check | tray moves Before you start ↔ Loan amount (keypad) and → Car photos | These are the longest tray moves in any flow. China's longest (329 px) crept for ~130 ms and needed ω 42 for that pair only (user approved "Lighter, keep it", 2026-11-14). | Measure each move. Only if one creeps in a recording, give that pair ω 42 (same exception China uses). No change before a recorded check. |

Exempt, not filed: the code-digit pop and the upload spinner use `@keyframes`. A digit pop runs once
per digit and a spinner is constant motion (`linear` is right), so neither is re-triggered mid-flight.

### Target G2 — upload slot states

| Change | Values | Why |
| --- | --- | --- |
| Spinner → photo | photo fades in over 170 ms `easeOut`; spinner fades out over 100 ms | Same timings as a step change (R3): the old thing clears quickly, the new one arrives. |
| Done check (green circle) | grows from the centre, scale 0 → 1 over 200 ms `textSwap`, opacity over 140 ms; delayed 60 ms after the photo starts | The same motion as SelectMark and consent ticks (R10), so done means done everywhere. |
| Error | tile background and 2 px border fade in over 150 ms `ease`; the message under the slot fades in over 170 ms `easeOut` | Colour change uses `ease`; no shake: the error is not the person's fault, and our users are 40+. |
| Retake (error → uploading) | spinner fades in over 100 ms; error colours fade back over 150 ms | Interruptible CSS transitions, so a fast retake turns around. |
| Reduced motion | opacity and colour only; the check fades in instead of growing | Gentler, not gone. |

Implementation: CSS transitions on `[data-state]` with `@starting-style` for the entering photo, check
and message (no keyframes). Exemplar: `components/list-row.css` (`.credo-select__fill`).

### Target G3 — the request lands on Products

| Change | Values | Why |
| --- | --- | --- |
| Badge appears when the tray close finishes (not on a fixed 120 ms timer) | starts on the close animation's `finished` | The person's eyes are back on Products; the change happens where they look. |
| Badge entry | opacity 0 → 1 and scale .9 → 1 over 240 ms `easeOut`, origin top-right | Nothing appears from nothing; 240 ms matches the backdrop's entry. |
| No highlight on the card | — | AO flashes a white row with the success tint; a coloured card has no room for a flash, and the badge is the news. |
| Reduced motion | opacity only, 150 ms | |

## 3. Plan 007 moments, updated

| # | Moment | Now |
| --- | --- | --- |
| M1 | Tray grows into a full screen on Start | **Dropped.** The flow is one tray (user decision 2026-11-16). |
| M2 | Amount travels from Loan amount to review | **Dropped.** In one tray the review comes many steps later, so no shared element is on screen at the same time. R12 covers editing. |
| M3 | Button label morph | **Done** (R7). |
| M4 | Animated video guide: a camera marker travels around the car along the arrow | **Open, blocked on art.** Needs the guide split into layers (car, path, marker). Spec when the art exists: one lap 1200 ms on `cubic-bezier(0.645, 0.045, 0.355, 1)` (on-screen movement → ease-in-out), at most two laps, then rest at the start; reduced motion shows the still image. Delight is allowed here: it is the rarest, most important moment. |
| M5 | Result lands on Products | **Becomes G3.** |

## Decisions for the user

1. **G1:** remove the "You will need" stagger? (Recommended: yes, it breaks one-entrance-per-container
   and no other flow has it.)
2. **G2:** upload state motion as in Target G2?
3. **G3:** badge landing as in Target G3?
4. **M4:** will you provide the video guide as layers, or drop the animation?

G4 needs no decision (no visible change). G5 is a measurement first.

## Build order (after approval)

1. G1 (remove three CSS rules, one class on the list). 2. G4 (preload). 3. G2 in `UploadSlot` (a
shared component, so its design-system preview and guide update too). 4. G3 in the study. 5. G5 measure,
record, decide. 6. M4 once art exists.

## Out of scope

- No change to any value in `content/motion.mjs` or to China and Automatic orders.
- No new animation library; CSS transitions and WAAPI as today.
- Steps, copy and layout stay as they are.

## Verification

**Build:** `npm test` and `npx next build` pass; add tests for G2 states and the G3 trigger.

**Behaviour**
- [ ] Back during a step change turns the same step around (no snap), on every step type.
- [ ] Tap a slot, then Retake quickly: transitions turn around instead of restarting.
- [ ] The badge starts after the tray is gone, never while it is still sliding.
- [ ] With reduced motion emulated, nothing moves; opacity and colour still change.

**Feel**
- [ ] Record the full flow at 60/120 fps and scrub the new moments frame by frame, then watch again at
  normal speed.
- [ ] Test on a real iPhone (the dev server by IP), especially uploads and the long tray moves.
- [ ] Look again with fresh eyes the next day before calling it done.

## Build log (2026-11-17)

- **G1 done.** The `al-need-in` keyframes, the reduced-motion copy and the `--i` index are gone; the rows
  arrive with their step.
- **G2 done** in `components/UploadSlot.jsx` and `upload-slot.css`, with the values in Target G2. The spinner
  stays mounted under the arriving photo so it can fade out. Entries run only after a slot's state changes
  on screen (`data-live`), so a step that mounts with photos already done (Back, reopening) does not replay
  every check. Reduced motion keeps the colour fades; the check fades in over 150 ms.
- **G3 done.** `send()` passes `setPending` straight to `closeFlow`, which calls it when the slide's
  `finished` resolves; the extra 120 ms timer is gone. The badge entry lives in `product-card.css`, so every
  new Product Card badge lands the same way.
- **Checked:** `npm test` (61 pass, including the new `tests/auto-lombard-motion.test.mjs`) and
  `npx next build` pass. In the browser, `getAnimations()` showed the specified durations, delays and curves
  for empty → uploading → done → error → retake and for the badge. The checks ran in a background tab, which
  does not paint frames, so they confirm the values but not the feel.
- **Not checked:** the full send → close → badge sequence on screen, a 60/120 fps recording, a real iPhone.
  The demo photo (`car-photo.jpg`) is not preloaded, so the very first done photo can fade in before it
  has decoded; a real capture is local, so this only affects the demo. Fixed by G4 below.
- **G4 done** (user: "Build G4 and preload the demo photo too"). `openFlow` calls
  `preloadImages(PRELOAD_IMAGES.map(asset))` (`lib/preload-images.mjs`), which fetches and decodes
  `guide-id.jpg`, `guide-video.jpg`, `guide-vin.jpg` and `car-photo.jpg` (about 158 KB) once per page. A test
  keeps the list in step with every `.jpg` the study shows. In the browser, opening the tray requested all
  four; none had loaded before. No motion change. The insurer logos are not preloaded (they were not in G4).

- **Later the same day:** the user removed the Under review badge from the study ("no need for this under
  review badge"). `send()` now just closes the tray. G3's entry motion stays in `product-card.css` for any
  future Product Card badge.

## G5 measurements (2026-11-17)

**Method.** I walked the whole flow in the browser and read each step's content height. The tray target
is the header (80) + content + the footer (106 with a button, 34 without), capped at 788. The same
`sampleSurface` the tray uses was then run at 120 Hz from rest, at ω 32.5 (shared) and ω 42 (China's
exception). Not a recording: the test tab is in the background and paints no frames. Times are from the
start of the move; China's real taps added about 28 ms before the first movement.

Tray height per step (px): New product 666 · Loans 666 · Car loans 402 · You will need 378 · Loan amount
664 · Term 486 · Insurance 348 · About insurance 280 · Registration 386 · Example 474 · Show your car 278 ·
Film your car 578 · Car video 436 · Car photos 740 · VIN 574 · Check your loan 442 · Terms 568 · Enter
the code 582.

| Move | Distance | ω 32.5: 90% / 97% / within 1 px | ω 42: 90% / 97% / within 1 px |
| --- | --- | --- | --- |
| China Custom amount ↔ Review (reference; crept, fixed with ω 42) | 329 | 125 / 167 / 250 ms | 100 / 133 / 192 ms |
| Show your car ↔ Car photos | **462** | 125 / 167 / 258 ms | 100 / 133 / 200 ms |
| Loan amount → Insurance | 316 | 125 / 167 / 250 ms | 100 / 133 / 192 ms |
| Show your car ↔ Film your car | 300 | 125 / 167 / 250 ms | 100 / 133 / 192 ms |
| Car photos → Check your loan | 298 | 125 / 167 / 250 ms | 100 / 133 / 192 ms |
| You will need ↔ Loan amount | 286 | 125 / 167 / 242 ms | 100 / 133 / 192 ms |
| Loans → Car loans | 264 | 125 / 167 / 242 ms | 100 / 133 / 192 ms |

**Findings.**
- A critically damped spring takes the same time to cover the same fraction of any move. Distance only
  changes the speed and the last pixel (by a few ms). The last 20 px take 100–108 ms at ω 32.5 for every
  move above about 160 px. So "creep" is not caused by distance alone. It is how slow the tail looks after a
  fast start: peak speed grows with distance.
- Five moves are about as long as China's 329 px, which crept on screen, or longer. Show your car ↔ Car
  photos is 462 px, 40% longer, with the fastest start (about 5,500 px/s at its peak, against 3,900 for
  China), so it is the most likely to creep.
- The plan's rule stands: no ω change without a recorded check. Next: record Show your car ↔ Car photos,
  and one 300 px move, at 60/120 fps in a visible tab or on an iPhone. If they creep, give those pairs
  ω 42, as China does. That needs a per-move ω option in `useTrayHeight`, which today uses
  `springs.tray.omega` for every move.

### Recording (2026-11-17, user: "Yes, record it")

**Method.** The auto lombard study ran in a visible browser-pane tab (dev build, 60 Hz, frames 16.7 ms),
with a rAF sampler reading the tray's clip-path every frame. Each move was triggered with a scripted click
(not a real tap) and timed from that click. Three runs each way.

| Move | Distance | First movement | 90% | 97% | Last 10 px | Within 1 px | Peak speed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Show your car ↔ Car photos | 462 px | 32–48 ms, jumps ~10% | 148–165 ms | 182–197 ms | 197 → 281 ms (84 ms) | 282–298 ms | 5,300–5,600 px/s |
| Show your car ↔ Film your car | 300 px | 26–48 ms, jumps ~10% | 143–148 ms | 176–182 ms | 180 → 263 ms (83 ms) | 259–265 ms | ~3,470 px/s |

**Findings.**
- The recording matches the simulation plus the 26–48 ms before the first movement.
- The 462 px move has the same profile as China's Custom amount ↔ Review before its fix, where in theory
  (with the tap delay) 97% came at about 195 ms and within 1 px at about 280 ms. The user judged that
  version to creep and approved ω 42 ("Lighter, keep it", 2026-11-14). Here: 97% at 182–197 ms, within 1 px
  at 282–298 ms, and the last 10 px take about 84 ms.
- The 300 px move is about 15 ms quicker at each mark but spends the same ~84 ms on its last 10 px, at
  two-thirds of the peak speed.
- First frame: each move starts 26–48 ms after the click and jumps about 10% on its first frame. This is
  the same start lurch as China (0–12%). It is not caused by distance and is not addressed here.
- Feel can't be settled from numbers. By China's precedent, the 462 px move creeps. Whether to give it,
  and the other 286–316 px moves, ω 42 is the user's call.

### Change and re-recording (2026-11-17, user: "Yes, the 462 px move")

- `useTrayHeight` (`components/TrayFlow.jsx`) takes an optional `omega`, read on every frame, and defaults
  to `springs.tray.omega`, so Automatic orders is unchanged. The study tracks which step the tray is moving
  from and passes `trayOmega(from, to)` from `lib/auto-lombard-flow.mjs`. That returns China's
  `EDITOR_OMEGA` (42) for Show your car ↔ Car photos in either direction and 32.5 for everything else.
  No value in `content/motion.mjs` changed. Test added (64 pass); the build passes.
- Re-recorded with the same method (visible tab, 60 Hz, scripted clicks, three runs each way):

| Move | 90% | 97% | Last 10 px | Within 1 px | First frame |
| --- | --- | --- | --- | --- | --- |
| Show your car ↔ Car photos, ω 42 (before: ω 32.5) | 111–131 ms (148–165) | 145–164 ms (182–197) | ~50 ms (~84) | 211–231 ms (282–298) | 27–47 ms, jumps 15–17% (~10%); one run 39% |
| Show your car ↔ Film your car (control, ω 32.5) | 148 ms | 181 ms | ~83 ms | 263–265 ms | unchanged |

- This matches China's ω 42 measurement (90% at 113–125, 97% at 147–159, within 1 px at 208–224 ms).
- Observation: the first-frame jump grew from about 10% to 15–17%, and one run reached 39%. A faster spring
  covers more ground in the 27–47 ms before the first painted frame. China saw 0–12% in a production
  build. Not addressed, like China's start lurch; worth a look on an iPhone.
- Correction (plan 011 audit, 2026-11-17): this is not a lurch. A critically damped spring covers about
  10% of the distance in its first 16 ms frame at ω 32.5 and about 15% at ω 42, so 10–17% is the spring's
  normal first frame. The 39% run was a dropped frame: the tick clamps a late frame to 50 ms. No fix needed.
- Proposed (not decided) in the Tray flows pattern: a move that creeps in a recording gets ω 42 for that
  pair only.

## Notes

- Feel can't be judged from code alone: whether the done check reads as one object with the photo, and
  whether the badge landing is noticeable enough without a highlight, need a look on a device.
- After building, record what was decided in `docs/motion-studies/auto-lombard.md` and promote any rule
  that should apply to every flow (for example the upload done check) into `content/patterns.js`.
