# 006 — Custom Amount ↔ Review: let the old layout leave before the new one fills in

- **Commit:** none (the project is not a git repository; written 2026-11-16)
- **Severity:** HIGH (finding 1) + MEDIUM (finding 2), fixed together
- **Category:** 7. Cohesion, hierarchy & spatial consistency (crossfade between different layouts); 2. Easing & duration (exit longer than entry)
- **Estimated scope:** 2 files (`lib/transfer-motion.mjs`, `tests/transfer-handoff.test.mjs`), ~25 lines

## Problem

On Custom Amount → Review and Review → Custom Amount, the two bodies are complementary:
the controller holds the outgoing body at `1 − incoming`, so their opacities always add
up to 1. That rule was made for swaps in one place with similar shapes (tray titles). These
two bodies are different layouts in the same space (a big amount line and keypad vs. three
receipt rows), so the rule guarantees a frame where both are half visible: the user's
screenshot shows "$2,111" on top of the receipt rows with keypad digits under them, both
blurred. Measured in the browser (real taps, 60 Hz): both bodies above 15% opacity from about
30 to 80 ms on Continue (peak 0.51 / 0.58 at ~46 ms) and 35 to 68 ms on Edit.

Second, Continue's outgoing fade is 220 ms while the incoming fade is 180 ms. Exits should be
shorter than entries (the user already decided; get out of the way). Review → Custom already uses
100 ms. Today the 220 ms is hidden because the complementary floor controls the exit; once the
floor is off for this pair, 220 ms would leave the keypad visible for a long time.

## Where

| File | Lines | What's there |
| --- | --- | --- |
| `lib/transfer-motion.mjs` | ~55–64 | `amountHandoffProfile`: the custom/review profile (`exitMs: from === 'custom' ? 220 : 100`) |
| `lib/transfer-motion.mjs` | ~424–434 | `sampleTween`: the complementary floor for `separateExit` profiles |
| `lib/transfer-motion.mjs` | ~371–374 | `paint`: the amount line's opacity and its comment |
| `tests/transfer-handoff.test.mjs` | ~50–57 | Per-frame assertions for the custom/review handoff, including the "no blank frame" sum |

### Current code

```js
// lib/transfer-motion.mjs (amountHandoffProfile)
  if (between('custom', 'review')) return {
    ...shared, omega: EDITOR_OMEGA, bodyMs: 180, exitMs: from === 'custom' ? 220 : 100, fadeDelay: 0, moveMs: 180, actionMs: 150,
    persistenceVersion: 'family-editor-v4'
  };
```

```js
// lib/transfer-motion.mjs (sampleTween)
    if (tween.profile.separateExit) {
      // The outgoing body may leave quickly, but never faster than the incoming
      // body arrives: together they always cover the slot (no blank tray).
      const outgoing = VIEW_KEYS.filter(key => key !== tween.target);
      const shown = outgoing.reduce((total, key) => total + weights[key], 0);
      const floor = 1 - weights[tween.target];
      const start = outgoing.reduce((total, key) => total + tween.weights[key], 0);
      if (shown < floor && start > .00001) for (const key of outgoing) {
        weights[key] = Math.min(tween.weights[key], weights[key] + (floor - shown) * tween.weights[key] / start);
      }
    }
```

```js
// lib/transfer-motion.mjs (paint)
    // The amount line belongs to the editor body and hands over with it, on the
    // same complementary clock (no frame where neither is shown).
    money.style.opacity = String(moneyAlpha);
```

```js
// tests/transfer-handoff.test.mjs (inside the per-frame loop of the custom/review test)
      assert.ok(h.opacity('custom') + h.opacity('review') >= .999, 'the two bodies always cover the tray (no blank frame)');
```

## Target

1. The custom/review profile opts out of the complementary floor and uses a 100 ms exit in
   both directions:

```js
  if (between('custom', 'review')) return {
    ...shared, omega: EDITOR_OMEGA, bodyMs: 180, exitMs: 100, fadeDelay: 0, moveMs: 180, actionMs: 150,
    // Different layouts in one space: the old one leaves on its own 100ms exit
    // instead of waiting for the new one (user decision 2026-11-16).
    coverFloor: false,
    persistenceVersion: 'family-editor-v5'
  };
```

2. The floor in `sampleTween` applies only when the profile does not opt out, and always
   under reduced motion (reduced motion stays a plain complementary crossfade):

```js
    if (tween.profile.separateExit && (tween.profile.coverFloor !== false || reduced.matches)) {
```

3. The amount line keeps following the editor body's opacity (`moneyAlpha`), so it now leaves
   on the same 100 ms exit. Only its comment changes:

```js
    // The amount line belongs to the editor body and hands over with it: on
    // Custom ↔ Review it leaves on the body's own 100ms exit (no floor).
    money.style.opacity = String(moneyAlpha);
```

**Expected curves** (computed with `easeContent` and `[.23, 1, .32, 1]`, the existing `curves.easeOut`; time from the tap):

| Time | Outgoing (100 ms exit) | Incoming (180 ms, unchanged) | Sum |
| --- | --- | --- | --- |
| 16 ms | 0.42 | 0.36 | 0.77 |
| 25 ms | 0.22 | 0.52 | 0.75 |
| 33 ms | 0.13 | 0.64 | 0.77 |
| 40 ms | 0.07 | 0.73 | 0.80 |
| 50 ms | 0.03 | 0.82 | 0.85 |
| 83 ms | 0.00 | 0.95 | 0.95 |

**Why these values:**
- `exitMs: 100`: matches Review → Custom today and the 90–100 ms exits of the other Family
  handoff profiles in this file (`amount`/`review` 90, `amount`/`custom` 90); shorter than the 180 ms entry.
- Incoming 180 ms on `curves.easeOut` `[.23,1,.32,1]`: unchanged (approved timing).
- `coverFloor: false` only for this pair: the floor stays for amount ↔ review and amount ↔ custom
  (similar layouts, approved), and for titles (handled separately by `titleWeights`, untouched).
- The body sum dips to about 0.75 for ~30 ms. The tray surface, header, title, divider and button stay
  fully visible, so the tray never looks empty. This is the trade the user chose: a short dip instead
  of two layouts on top of each other.
- `persistenceVersion` bump: the DialKit timeline persists per id in development; a new id avoids
  reloading the old 220 ms exit into the scrubber.

## Conventions to follow

- Motion tokens live in `content/motion.mjs`; this plan adds none. Use the profile fields that
  already exist (`exitMs`, `separateExit`) and the new boolean `coverFloor`.
- `amountHandoffProfile` in `lib/transfer-motion.mjs` is the exemplar: each pair is one object
  spread from `shared`, with a comment above it saying why it differs.
- Tests use the existing harness in `tests/transfer-handoff.test.mjs` (`h.tick(1000 / 120)`,
  `h.opacity(view)`).

## Steps

1. In `amountHandoffProfile`, change the custom/review return object to the Target in step 1
   (`exitMs: 100`, `coverFloor: false`, `persistenceVersion: 'family-editor-v5'`, plus the comment).
2. In `sampleTween`, change `if (tween.profile.separateExit) {` to the Target condition. Update the
   comment above the block to: `// The outgoing body may leave quickly, but never faster than the
   incoming body arrives (unless the profile opts out with coverFloor: false, as Custom ↔ Review does).`
3. In `paint`, replace the two-line comment above `money.style.opacity` with the Target comment.
   Do not change the line itself.
4. In `tests/transfer-handoff.test.mjs`, in the custom/review per-frame test:
   - Replace the `>= .999` sum assertion with: the sum never drops below `0.7`
     (`assert.ok(h.opacity('custom') + h.opacity('review') >= .7, 'the dip stays short and shallow')`).
   - After the loop's first 5 ticks at 120 fps (~42 ms), assert the outgoing body is below `0.1`
     (`'the old layout is out of the way within ~40ms'`). Do this for both directions the test covers.
   - Keep the riding, rigid-amount and "amount hands over with the editor" assertions unchanged.
5. Run `npm test`. The reduced-motion test in `tests/transfer-flow.test.mjs` (`money + review >= .999`)
   must still pass unchanged; if it fails, the reduced-motion clause in step 2 is wrong.
6. Run the browser check below.

## Out of scope

- Amount ↔ Review and Amount ↔ Custom profiles, their floor and their timing.
- Tray titles and their crossfade (`titleWeights`, `titleMs`), the button label morph, the tray
  spring (`EDITOR_OMEGA` 42) and any duration or curve not named above.
- The blur and scale bridge (`8 * w * (1 − w)`, `KEYPAD_SCALE`): finding 3 is a feel check only (below).
- Automatic orders. Do not introduce a new animation library.

## Verification

**Build**
- [ ] `npm test` passes (43 tests, with the updated handoff assertions).
- [ ] `npx next build` passes.

**Behaviour** (`/studies/transfers`, Browser pane visible; real pointer taps, not keyboard: keyboard input is instant by design)
- [ ] Record opacity of `[data-panel=custom]`, `.transfer-money` and `[data-panel=review]` on every
  animation frame for Continue (Custom → Review) and Edit (Review → Custom). Outgoing is below 0.15
  by about 35 ms in both directions; no frame has both bodies above 0.3.
- [ ] Step the DialKit timeline (Show timeline, `,` / `.`) through both directions: at no frame is the
  amount text drawn over a receipt row.
- [ ] Titles, header, divider and button stay fully visible throughout (no blank tray).
- [ ] Interrupt: tap Continue, then X within ~60 ms. The bodies turn back without a jump.
- [ ] Reduced motion (emulate `prefers-reduced-motion: reduce`): amount and receipt still crossfade
  with their opacities adding to 1.

**Feel**
- [ ] Record at 60 fps and scrub frame by frame: one layout clears, the other arrives; there is no
  frame that reads as two screens on top of each other.
- [ ] At normal speed, compare with Amount ↔ Review (unchanged). Both should feel like one family.
- [ ] Finding 3 (blur): with the overlap this short, check whether the 2 px blur peak still reads
  as a smear. If it does, report it; do not change it in this plan.
- [ ] Ask the user to feel it; it changes a rule they approved on 2026-11-12, for this pair only.
