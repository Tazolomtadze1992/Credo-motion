# 003 — Refine the Review to Custom Amount return

**Status** · Proposed after a local DialKit scrub  
**Severity** · High  
**Baseline** · Current workspace snapshot. This checkout has no Git revision.

## Problem

Edit should feel like reopening the amount editor in the same tray. Today the
receipt follows the rising header while fading. The keypad starts fading in
while its bottom rows are still below the footer clip. The large amount uses
a separate stationary copy, so the keys can precede the value they edit.

Measured in 390 px phone coordinates on the Review → Custom Amount DialKit
timeline. At 0 ms the receipt begins at y462. By 50 ms it begins at y322 at
23% opacity, the keypad extends to y703 at 29% opacity, and the large amount
is still invisible. At 66.7 ms the keypad is at 50% opacity and the amount
is still invisible. The CTA stays at y586 and full opacity. The snapshot
matches the native value's position at the settled endpoint.

## Starting point

| File | Relevant code |
| --- | --- |
| `lib/transfer-flow.mjs` | `VIEWS` sets Review to 314 px and Custom Amount to 612 px. `backTarget` returns to the original entry branch. |
| `lib/transfer-motion.mjs` | `transitionProfile` shares the 100 ms exit, 30 ms entry delay and 130 ms fade in both directions. `paint` adds the spring offset to each panel and gates the amount snapshot with `clamp((fadeTop - offset) / 20)`. |
| `app/studies/transfers/transfers.css` | The settled Review summary occupies y462–570. The settled Custom keypad occupies y264–556. The amount starts at y164. These are local coordinates in the 676 px sheet. |
| `components/TransferStudy.jsx` | Edit calls `back(instantInput(event))`. The existing custom input retains the draft. The footer uses the shared Primary Button. |

## Target sequence

The timing windows are starting values for an uninterrupted pointer return.
Use the existing `MOTION.ease` curve, `cubic-bezier(.25,.46,.45,.94)`, for
the opacity changes. Use the existing Torph label channel and the critically
damped tray spring with omega 32.5. The shell moves from a 362 px to a 64 px
top inset over its physical settling tail.

| Element | Starting timing | Motion |
| --- | --- | --- |
| Tray, title and divider | Start on Edit | The tray grows upward from the fixed bottom. The header and divider share the spring. Keep the current 130 ms title handoff. |
| Receipt | 0–65 ms | Fade the entire summary in place at its Review anchor. Include Edit in the same fade. |
| Custom amount and caption | 60–135 ms | Reveal the actual amount block at its normal local slot, 20 px below the moving divider. It follows that divider at full type size. The confirmed amount remains in the draft and appears in the editor with the same value. |
| Keypad | Around 135–215 ms | Fade in all 12 keys as a single group at their final y264–556 position, at scale 1. Start the 80 ms fade once the amount and caption have 12 px of clearance above the keypad and the keypad fits the tray aperture. |
| Primary Button | Visible throughout | Keep the shared surface at y586, scale 1 and full opacity. The current 160 ms Torph channel changes the label from Confirm Transfer to Continue. |

Use the options-to-payment-method transition as the reference for one continuous
surface, and Automatic Payments as the reference for a bottom-anchored tray with
a stable action. The larger travel here justifies the longer spring tail. Most
of the movement should read in the first 150 ms. The return should feel ready
to edit by roughly 215 ms at default typography.

## Implementation

1. Add a directional profile for Review → Custom Amount in
   `transitionProfile`. Route the receipt, amount and keypad through the
   same painter in live playback and DialKit. Give this return profile its own
   persistence version so the preview opens with the revised tracks.
2. Hold the outgoing receipt at its settled Review position and use one
   opacity for the row group. Paint the live custom amount and caption
   together in their divider-relative slot. Reserve the stationary
   amount snapshot for the existing Custom Amount → Review departure,
   where it protects the outgoing glyphs from the collapsing sheet edge.
3. Anchor the return keypad to its Custom Amount endpoint. Use the painted
   spring offset plus the amount block's cached height to determine when the
   12 px gap is available. Refresh metrics on typography or size changes.
   Run the fade through the same timeline or live clock once the geometry is
   clear. Keep the footer and individual key press feedback on their current
   paths.
4. Sample the displayed surface and content pose on interruption, including
   the keypad, receipt and amount. Continue from those values on a quick
   Continue tap or DialKit handoff. Keep both the draft and the original
   return branch in `TransferStudy` as the source of truth. When reduced
   motion is on, snap geometry and use short opacity changes. Keyboard Edit
   lands on the finished state immediately.

## Verification

- Scrub in 16.7 ms steps. While visible, the receipt stays at y462. The amount
  appears before the keypad. Every visible keypad frame fits above the footer,
  and the amount and caption remain below the divider and above the keys.
- Verify one rendered amount and a stable CTA through the whole handoff. Try
  $500 and $12,345.67, DialKit typography changes, and the narrow canvas.
- Exercise Custom → Review → Edit → immediate Continue, repeated Edit, and
  a timeline pause followed by live input. Verify the exact cents, focus,
  input availability, and reverse pose. Check the preset Edit branch and
  Review → Processing → Success as regression cases.
- Run `npm test` and `npm run build -- --webpack` after implementation.
  Compare normal-speed recordings with the existing method switch and test
  touch on the iPhone 12 before signing off on feel.
