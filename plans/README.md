# Animation plans

| Order | Plan | Dependencies | Status |
| --- | --- | --- | --- |
| 1 | [Presets ↔ custom entry](001-amount-custom.md) | Existing transfer controller | Implemented and browser-verified; user feel approval pending |
| 2 | [Custom amount ↔ Review](002-custom-review.md) | Current compact Review layout and transfer controller | Implemented and browser-verified; tests/build pass; user feel approval pending |
| 3 | [Review → Custom Amount return](003-review-custom-return.md) | Existing transfer controller and DialKit timeline | Implemented and verified locally. Physical iPhone feel pending. |
| 4 | [Automatic orders: interruptible step handoff](004-ao-interruptible-handoff.md) | None | Implemented 2026-11-13; reversal verified by seeking transitions; live feel check pending |
| 5 | [Automatic orders: China-style tray reveal and content clip](005-ao-china-tray-reveal.md) | Run after 004: both edit `AutomaticOrdersStudy.jsx` and `automatic-orders.css` | Implemented 2026-11-13; browser-sampled; iPhone feel pending |
| 6 | [China: Custom amount ↔ Review clean handoff](006-china-custom-review-clean-handoff.md) | Supersedes the complementary floor for this pair only (rule from 2026-11-12); independent of 001–005 | Implemented 2026-11-16; tests (43) and build pass; live recording done (1 overlap frame each way, was 3–4); user approved 2026-11-16 ("Much better, keep it") |
| 7 | [Auto lombard: full-path redesign](007-auto-lombard-redesign.md) | Static screens first; motion (M1–M5) only after the user reviews them | Rebuilt 2026-11-16 as one resizing tray (user decision); both paths browser-checked; awaiting user review |
| 9 | [Colour tokens in OKLCH](009-color-tokens.md) | Independent; Phase A keeps role names (no component changes), Phase B renames | Phase A and B built 2026-11-16 (ramps, roles renamed to the better-colors grammar, loose hex replaced in product UI) |
| 10 | [Auto lombard: motion and interaction](010-auto-lombard-motion.md) | After 007; reuses the AO/China tray (no token changes). Supersedes 007 motion M1–M5 | G1–G3 built 2026-11-17 (user: "Yes, build G1–G3"); G4 (preload, with the demo photo) built the same day; G5 done: Show your car ↔ Car photos (462 px) uses ω 42, re-recorded (user: "Yes, the 462 px move"); feel check on a device open. M4 not started |
| 11 | [One motion family: China, Automatic orders, Auto lombard](011-one-motion-family.md) | After 010. W1/W3 share `automatic-orders.css` (run in order); W2 after W6; W4, W5, W7 wait for decisions D1–D3 | **Built 2026-11-17**, awaiting user review; D1–D3 taken on the plan's recommendations |
