# Credo motion guide

A living reference for designing and reviewing Credo interactions. Use motion
to explain what changed, preserve orientation, and make actions feel responsive.

## Sources and scope

- **Foundation:** the user-supplied *Family / Benji Interaction Principles*
  Pages document, adapted below on 2026-09-25. Its original reference to the
  “Benjis Approach” project has been adapted to Credo. The source remains at
  `/Users/tazo/Desktop/Family Benji Interaction Principles.pages`; this guide
  can be used without that file.
- **Primary inspiration:** Benji's [Family Values](https://benji.org/family-values),
  published 8 July 2024. It describes simplicity, fluidity, and selective delight.
  Its examples establish visible relationships between states and preserve
  objects that continue into the next state. This is design reasoning, not a
  source for our exact durations or spring settings.
- **Credo evidence:** user feedback, implementation, and recorded checks in the
  [study notes](#study-notes). These are project findings, not claims by Benji.

## Principles adapted from the supplied document

### Keep each state understandable

Keep essential actions close. Reveal additional choices when they become useful.
Give a state one clear main decision. Motion should help someone follow that
decision without postponing access to the result.

### Make the connection visible

Identify what persists between states: a value, recipient, card, icon, control,
or surface. Preserve its identity and show where it goes. Forward and return
transitions should express a consistent spatial relationship. Avoid making a
persistent object disappear and then introducing its apparent replacement.

### Coordinate the transition

An interaction should read as one understandable change. Establish a new
surface before revealing detail when that helps explain an unfamiliar space.
Do not apply that sequence mechanically to every interaction: an in-place
content swap can need simultaneous movement and overlapping fades. The loyalty
study demonstrates why a gap between outgoing and incoming content can fail. The China transfer
confirmed it on 2026-11-12. For text that swaps in one place (titles,
headings), the user rejected a gap, and Family's own swaps overlap briefly. Keep
the two opacities complementary on one clock, in one position, for about
90–100 ms.

### Keep gestures connected to input

A dragged object should follow the finger and allow reversal before commitment.
Provide an obvious tap route when a gesture is a shortcut. Preserve a clear way
back or out of a flow.

### Let transient flows keep their context

Consider one evolving tray for short, focused tasks. Keep the originating screen
recognizable, give each tray state a clear title and purpose, and show how it
relates to the action that opened it. Use a full screen when the task needs more
space or sustained attention. A tray is an option, not a requirement for Credo.

### Connect progress to its outcome

Carry a confirmed action through processing to a visible result. Where helpful,
show where the pending or completed item can now be found. Animation must
represent the actual application state; elapsed animation time alone does not
establish that an action succeeded.

### Spend attention deliberately

Keep frequent interactions restrained. Stronger emphasis can suit an occasional
milestone. Remove motion that distracts from reading, delays a task, or weakens
orientation. Retain useful state feedback when reducing spatial movement for
accessibility.

## Applying the guide to a Credo screen

Before implementation, identify the trigger, starting state, destination,
persistent elements, changing content, and parts that should remain still.
Explain what the proposed movement helps the user understand. Use the relevant
Emil animation skill for implementation details when available; do not infer
exact easing or spring settings from the Family article.

Evaluate the whole interaction at normal speed. Use slow playback or timeline
scrubbing to investigate a specific flaw, then judge the change again at normal
speed. Include reversal before completion, repeated selection, and return from
any preview controls. Check reduced motion and the actual displayed tap areas.
State which platforms and input modes were tested.

Preserve approved behavior while fixing a specific problem. Different parts may
finish at different times if they still feel connected. Choose parameters for
the screen's purpose and distance; loyalty's numbers are a reference, not global
defaults.

## Study notes

- [Loyalty: earning and spending](motion-studies/loyalty.md) — user-approved web
  prototype; persistent checkmarks, attached text movement, overlapping fades,
  and timeline handoff.
- [My Space: all to savings](motion-studies/my-space.md) — prototype awaiting user
  review; a card surface expands while its illustration and action persist.

- [China transfer: one continuous tray](motion-studies/transfers.md) —
  approved initial switch. The user chose the Family-drawer handoffs
  (content rides the resizing tray, one title at a time, animated close,
  secondary sending → light success button) as the only version on
  2026-11-12; the earlier variant and its switch were removed. A separate
  Review layer was tried and rejected: it broke the single resizing tray.

- [Automatic payments: payment day](motion-studies/automatic-payments.md) — **archived 2026-11-13** (removed from the lab; Automatic orders covers the flow and reuses its payment-day calendar; files in `archive/automatic-payments/`). Originally:
  a spring-resized tray and a reversible monthly calendar. The initial multi-page
  flip was rejected after rapid-drag failures; its single-fold replacement is
  awaiting user feel review. See the study for the half-page consistency checks.

- [Automatic orders: one resizing tray](motion-studies/automatic-orders.md) —
  experiment awaiting user review (2026-11-13). The Family-style rebuild of the
  ავტომატური დავალებები flow, in English, with one decision per step. The
  user moved it from tray → full screen back to a single tray once the steps
  were simplified.

- [Auto lombard: entry tray into a full-screen flow](motion-studies/auto-lombard.md) —
  static screens (plan 007, step 1) awaiting user review (2026-11-16). The car-pawn
  loan path rebuilt in the design system, keeping the user's video and VIN guides.

- [One motion family (plan 011)](../plans/011-one-motion-family.md) — China transfer, Automatic orders and
  Auto lombard audited together on 2026-11-17 and brought onto one spec (§4 of the plan). Built the same
  day while the user was away; **not yet reviewed**. Every new rule is Proposed in the Motion handoffs pattern.

- [Family and Aave bottom trays for Credo](family-aave-bottom-trays.md) —
  design reference and three full automatic-payment setup experiments at
  `/prototypes/automatic-payments` (archived 2026-11-13 to `archive/automatic-payments/prototypes/`). The experiments reuse the payment-day
  controller and are awaiting user review.

## How this guide grows

After a meaningful iteration, update the relevant study with:

- **Problem and evidence:** what the user noticed or what a check demonstrated.
- **Decision and scope:** what changed, why, and where the lesson applies.
- **Status:** experiment, observed, user-approved, or superseded.
- **Verification and limits:** what was tested and what remains unknown.

Record useful rejected approaches so they are not repeated without reason.
Keep exact tuning values and code links in the relevant study. Promote a lesson
into the shared principles only when its broader scope is justified; retain its
source and limitations. Update existing guidance when superseded rather than
accumulating contradictory rules. Learning is maintained through these files
during future work, not through a background process.

## Optional device frame — 2026-11-06

All four studies now share the IPhoneFrame and PhoneFrameToggle components. The
user approved the automatic-payments frame and requested the same option for
Loyalty, My Space and China transfer. Frames default on. The wrapper preserves
each original screen height (888,849,852,852px) and keeps its children mounted
when hidden, so changing presentation does not restart live motion or selection.
Responsive fitting includes the hardware and reserves space for the toolbars.
The controllers retain their existing timing and spring parameters.

Browser checks confirmed Loyalty's Spend tab, My Space's Journal tab and a$50
WechatPay transfer survive frame off/on. Loyalty and My Space timeline controls
remain usable. China transfer also completed its simulated processing while
the frame was toggled twice. At390×844 the transfer frame and all three toolbar
buttons fit without horizontal overflow. Normal viewport restored afterward.
All11 tests and the production build pass. Browser console showed no warnings
or errors. Device-frame screenshots are saved under `/tmp/credo-*-phone-frame.png`.

## Motion tokens — 2026-11-12

The user asked to name the motion values the China transfer and Automatic
payments flows share. They now live in `content/motion.mjs`: six curves
(easeOut, easeOutExpo, easeOutQuad, drawer, textSwap, contentMove; contentMove was
removed on 2026-11-12 after the full-flow review moved every content curve to easeOut), the tray
spring (ω 32.5, critically damped) and nine durations (press, digitMorph,
textSwap, trayOpen, trayClose, backdropIn, backdropOut, reduced, spinner).
JavaScript imports them; CSS reads `--credo-ease-*` and `--credo-duration-*`,
set once on `<html>` from the same module. The design system's Motion page plots
each curve and plays it at the duration it is used with.

**Status:** a refactor, not a new tuning decision. No value changed. Computed CSS
transitions on the transfer screen matched a before-snapshot exactly. The tray
close still runs 240 ms on the drawer curve, with the backdrop at 200 ms on
easeOut. `tests/motion-tokens.test.mjs` pins every value, so changing one is a
visible, deliberate edit; all 30 tests and the production build pass.

**Scope and limits:** the tokens are the tuned values these two flows share, not
defaults every new screen must use. Pick a token because it fits the new
interaction's purpose and distance; keep timings that belong to one interaction
(handoff delays, the payment-day release spring, the activity reveal) with that
interaction. Loyalty and My Space still use their own constants and were not
migrated.

## Tray flow family — 2026-11-17

The user asked to audit China transfer, Automatic orders and Auto lombard and make them one
animation family, then to build the whole plan without waiting for approvals (they were away).
Plan 011 holds the audit, the family spec (§4) and the build log.

**What changed (built, not yet reviewed):** keyboard actions are instant in the two TrayFlow flows,
as in China; titles no longer scale; the shared footer button now has China's sending → success
(spinner grows, tick draws, words blur) and China's arrival (4 px, .98, 150 ms); tray presence is
one helper (`lib/tray-presence.mjs`) used by all three flows, and its reduced-motion fade is on
`ease` everywhere; the handoff default became two tokens (`handoffExit` 100, `handoffEnter` 170);
Automatic orders lands its new order after the tray has closed; spinners slow to half speed under
reduced motion instead of freezing; the segmented control keeps its colour fade under reduced
motion; the account field presses at .97 like everything else.

**Choices made on the plan's recommendation, not by the user:** D1 (one self-closing ending for
Automatic orders and lombard; China's tap-to-close receipt kept), D2 (China's button arrival), D3
(handoff tokens). All are Proposed until the user looks.

**Observed, not decided:** keyboard focus was dropping to `<body>` after a step change (Escape
then stopped working) and the opener was not refocused after a close because the screen behind was
still inert. Both are fixed (`useKeepFocus`, refocus after the re-render).

**Unresolved:** feel. Nothing here was recorded side by side or tried on an iPhone yet.

**Two engines remain by design.** China keeps its own controller; TrayFlow is the engine for new
flows. The family is the shared spec, tokens and components, not one code path.

