# 001 — Refine presets ↔ custom entry

- **Commit:** e8788ef (local transfer implementation is uncommitted)
- **Severity:** MEDIUM
- **Categories:** easing/duration, cohesion, physicality
- **Scope:** lib/transfer-motion.mjs, tests/transfer-flow.test.mjs, study notes

## Evidence and current code

Project: `/Users/tazo/Documents/Codex/2026-09-24/new-chat/outputs/credo-motion-lab`.
Next.js/React, custom analytical spring and direct style painter, DialKit preview.
The user requests implementation, preserving existing approved switches and
Credo visual styling. Follow the animate skill; this plan is the read-only
improve-animations audit handoff.

`lib/transfer-motion.mjs:14–32` treats amount/custom as a generic large swap:
`Math.min(270, Math.max(150, Math.abs(VIEWS[to].height - VIEWS[from].height) * 2))`.
Both bodies scale toward .96, body fades for 270ms with [.26,.08,.25,1], title
fades for 150ms, and no local movement accompanies the layout shift.
`paint():119–135` makes amount always crisp, but blurs custom digits during entry.
At ~101ms in browser preview, preset values visibly overlap the new amount;
keypad numerals blur. Family frames 7.883–8.200s show the outgoing grid withdrawing
upward, incoming keypad appearing during tray growth, and the bottom CTA staying.
Exact native parameters are unknown.

## Target values

Only amount ↔ custom receives a new named pair profile:

- Surface omega 32.5, unchanged; preserve analytical velocity and existing sampler.
- Body opacity 150ms, ease [.25,.46,.45,.94], zero delay.
- Titles 130ms, same ease; movement 180ms, same ease.
- Amount → Custom: outgoing presets 1 → 1.025, exit local y 0 → -8px;
  incoming keypad .96 → 1, entry local y +12px → 0.
- Custom → Amount: outgoing keypad 1 → .96, exit local y 0 → +12px;
  incoming presets 1.025 → 1, entry local y -8px → 0.
- Use existing depth convention: outgoing scale follows movement progress;
  incoming follows body progress. Panel travel continues to follow the tray.
- CTA stays translateY(0), scale1, opacity1 when both states have Continue.
  Keep its existing 150ms action track, no new action delay.
- For this pair only, allow 12px mask headroom (88px + surface offset) so
  returning presets' -8px hint and centered1.025 scale do not cut the question.
  The mask remains 8px below the divider.
- In this pair only, both amount/custom panels stay unblurred. Directional blur
  was rejected during executor review because switching the crisp panel on
  reversal caused an immediate filter jump. The faster fade reduces overlap;
  all unrelated blur behavior remains unchanged.
- Keyboard and reduced motion retain existing instant/gentle paths.
- Give only amount/custom pair a fresh DialKit persistence version (e.g. v7).
  Preserve method/amount v6 and all unrelated pair IDs.

## Steps

1. Read project AGENTS.md, docs/motion-guide.md, relevant transfer study and animate
   skill before editing. Use the method/amount profile in the same file as exemplar.
2. Extend transitionProfile explicitly for the amount/custom pair with values above.
   Preserve all other pair values, especially options/China and China/amount.
3. Adjust painter crisp-panel rule for this pair in live and preview consistently.
   Keep both numeral panels crisp so reversal cannot jump their filters.
4. Fresh pair persistence only. Live and preview must continue using the same profile.
5. Update existing controller checks at100ms for the new fade (roughly.897 incoming)
   and outgoing scale>1. Assert crisp numeral panels, anchored CTA and reversal
   continuity including filters. Existing generic custom/review behavior must remain unchanged.
6. Run existing tests and production build. Do not install dependencies or commit.
7. Append concise study notes explaining source, values, rejected ghosting,
   verification and pending user feel approval. Root handles browser feel checks.

## Scope boundaries

No UI redesign, CTA color changes, flow/value changes, individual-key stagger,
new animation library, global timing changes or changes to other studies.
Do not change the new amount selection ring or its keyboard handling.

## Verification

Tests must cover continuity and real controller behavior, not only profile values.
Root will compare normal speed and scrub ~50/100/150ms, test Back, paused handoff
and custom input persistence. Keep no blank gap, no overlapping strong preset and
custom numerals, no CTA reentrance, and a clear incoming keypad. Physical-device
feel and next-day review remain unverified, not a condition to invent a pass.

## Audit coverage

Purpose: occasional task transition, justified. Physical origin centered on inner
body already correct. Interruptibility, keyboard snapping, reduced motion and
stable hit areas already implemented. Performance uses direct transforms/opacity;
only small bounded blur is retained. No evidence requiring added will-change.
No additional motion opportunities outside this transition are selected.
