# 002 — Carry custom amount into Review

- **Commit:** e8788ef; substantial current transfer work is uncommitted.
- **Severity:** MEDIUM
- **Categories:** continuity, timing, physicality
- **Scope:** TransferStudy.jsx, transfers.css, transfer-motion.mjs, controller tests and study notes.

## Project and authorization

Project `/Users/tazo/Documents/Codex/2026-09-24/new-chat/outputs/credo-motion-lab`.
User explicitly approved all three findings: carry the amount into its Review
row; clear keypad sooner; crisp summary with an 8px entrance. Keep the spring
and button anchored. Execute against the current checkout: the required source
is largely uncommitted, so a HEAD-based worktree would omit the implementation.
Preserve all unrelated changes. No commits, installs or publishing.

## Evidence and current code

`lib/transfer-motion.mjs:29` applies generic 270ms body opacity/movement with
`MOTION.bodyEase=[.26,.08,.25,1]` to custom/review. `paint():137` blurs these panels
by up to 2px; `paint():155` moves `.transfer-money` by
`offset - 64 * weights.custom` while fading it with `moneyAlpha`.
Review renders a separate `.transfer-review-total` (14px/500).
Browser preview at 100ms: old amount opacity .3715 and Review .6285, almost the
same vertical position; keypad also remains .3715 behind the summary. The old
amount drifts down as its 64px compact offset is removed. This loses continuity.

## Targets

Apply only to custom ↔ review, extending the existing analytical controller.

1. Keep surface omega32.5, dimensions612/344, velocity-preserving retargeting,
   button full opacity1, transform translateY(0), scale1. CTA labels crossfade
   over130ms with existing quad `[.25,.46,.45,.94]`; titles130ms same curve.
2. Keypad exits in100ms, stays crisp, local y0→-8px and scale1→.96 over180ms
   forward. Review body enters opacity0→1 in130ms after30ms, local y+8→0 over180ms,
   scale1 throughout; no per-row stagger, no blur. On reverse: Review exits100ms,
   keypad enters130ms after30ms, inverse local poses. Preserve current pose on
   reversal, including independent outgoing/incoming opacity clocks. This is
   a pair-specific extension, never a global timing change.
3. Show ONE continuous amount traveling from Custom's centered40px value to
   the right-aligned14px Review total over200ms with ease-out-quint
   `[.23,1,.32,1]`. Carry the same value, never roll digits during navigation.
   A pointer-events:none, aria-hidden flight layer outside the content mask can
   bridge the original and target. Keep the real input and Review dd semantic.
   Hide their duplicate visual amounts while flight is active. Measure the actual
   source/target endpoints outside the per-frame painter (not guessed widths),
   convert viewport geometry to the fixed390px phone canvas; endpoint alignment
   must work for1, 56, 1,234.50 and50,000. Use transform/opacity per-frame, not
   font-size/top/left/width reflow. Preserve currency proportions/glyph spacing
   with a co-located end handoff if needed, with no distant duplicate. Never
   crossfade two numbers in different locations. Reverse the flight when Edit
   or Back returns to Custom; retarget from its current pose on rapid reversal.
   Respect the moving surface without making the value jump with the parent or
   clip behind the divider/footer. Avoid reading layout every frame.
4. Clear Max amount caption in100ms independently of the amount flight.
5. Reduced motion: no spatial flight, scaling or movement; retain short opacity
   swaps and actual amount readability. Keyboard navigation remains instant.
6. DialKit preview uses the SAME sampled tracks/painter including the amount
   flight and independent fade timings; scrubbing and timeline→live handoff
   cannot restart poses or make duplicates. Add pair-specific persistence v8.

## Conventions and implementation boundaries

Read AGENTS, docs/motion-guide.md, docs/motion-studies/transfers.md and animate
skill plus css-techniques before editing. Existing amount/custom pair profile
and sampleTween/selectTimeline demonstrate the controller conventions. Keep
Torph/Numora typing behavior, summary layout/colors/weights, selection ring,
other transitions, accessible controls and submission simulation unchanged.
Do not introduce a motion dependency. Extend analytical state, not React updates
each frame. Avoid new action availability delays.

## Verification

- Update meaningful controller tests: at100ms keypad is gone, Review clear,
  crisp scales, anchored CTA; ONE amount flight; endpoint and reversal poses,
  reduced motion and keyboard instant path. Keep tests for approved old pairs.
- Run tests and production build. Root handles browser with CUA; do not operate
  the shared browser from the executor.
- Root scrub50/100/150/200ms both ways; no duplicate amount/blank interval,
  cut CTA or summary blur. Check Edit preserves typed cents; preview→live
  handoff and rapid reversal don't snap. Physical-device feel remains untested.
- Update study notes and plan status with actual verification, not assumed feel
  approval. Report exact implementation choices and any remaining limitations.

## Execution status

Implemented in the current checkout. Six tests and production build pass.
Root browser verification passed; user feel review pending. Endpoint measurement
is surface-local with current spring composition; full CTA remains anchored.

Browser verified forward/reverse scrubbing, exact amount endpoints, pointer
Continue/Edit with cents preserved, timeline-to-live handoff, edited-value
remeasurement and active amount accessibility. Real-device and OS reduced-motion
playback remain untested; controller coverage includes reduced motion/reversal.
