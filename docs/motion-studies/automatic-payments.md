# Automatic payments: a tactile payment-day calendar

## Scope and status

Study04 at `/studies/automatic-payments`, implemented2026-11-06 after the user
approved adapting their Aave/Family reference. The focused interaction is
amount→monthly payment day→amount. Continue on the calendar saves the day selection and
returns to amount entry; Back also retains the current selection. Review,
activation and actual payment execution are outside this study. Visual feel
approval and physical-device testing remain pending.

## Reference observations

Source: the user-supplied `Screen Recording2026-11-06 at09.18.20.mov`,17.01s,
1248×1252. Reviewed overview sequences and30/60fps close-ups of the transition,
calendar folds and reverse movement. The recording includes repeated frames;
these are observations of the visible behavior, not recovered native settings.

- The white tray resizes with its bottom and CTA anchored.
- Amount/frequency/keypad content and date controls overlap briefly while
  switching; the calendar enters near its resting size.
- A fixed colored calendar cap sits above a horizontal paper fold.
- Pages flip in opposite directions when moving forward/back through dates;
  several partially folded pages can overlap during fast scrubbing.
- The last slider position has a two-line Last Day face.
- The recording returns to the amount screen; the subsequent confirmation
  flow is not shown.

Reference frames are under `/tmp/credo-auto-payments-reference/` for local review.

## Credo adaptation

The study uses the same390×852 phone,24px tray corners, restrained type,3% black
divider, coral color family and original CTA gradient as the existing studies.
The CTA is14px/500 uppercase with zero tracking. Amount entry uses GEL and the
existing Torph component and exact-cent input logic. Background screen/copy is
a proposed portfolio context, not a supplied production Credo design.

The tray has a fixed676px canvas, exposing636px for amount entry and512px for
the calendar. The edge/header/divider share the existing critically damped
spring sampler with omega32.5; the CTA/home indicator remain anchored. Panel
opacity and movement now have the pass-one handoff described below:100ms
outward exit, near-full entering growth and independent scene masks. Reversals
retain the current surface velocity and all visible panel/header poses. These are implementation choices to
match the existing Credo family, not exact measured reference parameters.

The date control is a native range:1–30 plus an explicit Last Day position.
Pointer input uses continuous positions; keyboard input retains whole-day steps.
The thumb, progress track and calendar follow pointer input directly, with a
short shared settle to the nearest day on release (see pass two below).
The calendar uses one reversible CSS3D sheet driven by that continuous date
position. Between two integer dates, the exposed upper
half and sheet back always belong to the higher date, and the exposed lower
half and sheet front to the lower date. Reversal simply unwinds the same angle.
No React state updates happen on animation frames or each pointer move.

The original four-leaf pool with independent185ms flips is superseded: rapid
input left unrelated numbers visible on overlapping leaves, even though the
final selected value was correct. The old tests only established bounded leaf
count and final settlement; that was insufficient evidence of visual coherence.

Keyboard date changes are instant. Reduced motion cancels decorative flips,
shows the selected date directly, and snaps tray geometry before fading in
only the new panel. This avoids relocating a still-visible outgoing amount.
The range has a44px effective target at the authoring scale; its endpoint
labels are plain text directly beneath the track. Compact buttons use expanded hit areas. The background is inert while
the dialog is open; keyboard Tab stays within the active screen. Escape goes
back from the day picker, then closes from amount entry.

Show timeline exposes the tray Surface and Content tracks in both directions.
The calendar remains directly controlled by its own slider. Preview handoff
returns to the selected endpoint from the displayed spring state. No new
packages were installed, and existing studies were not changed.

## Verification

- Eleven tests pass, including the existing six transfer tests.
- New tests cover bounded day selection, explicit month-end semantics, rapid
  continuous matching halves during180 rapid retargets, pose-preserving reversal, latest-value settlement,
  cancellation on reduced-motion changes, instant keyboard changes, tray
  reversal continuity, and clearing old content before reduced-motion resizing.
- Production build passes with the new route.
- Browser checked amount→day, pointer scrubbing forward/reverse, Last Day,
  keyboard input, saved day on return, timeline seeking and preview handoff.
- At83.3ms in the tray timeline, edge/header/divider shared133.262px offset;
  panel opacity was.209831/.790169 and CTA bottom remained34px.
- Final keyboard selection settled both page halves to9 with zero active
  leaves. Browser console contained no warnings/errors.
- Screenshot: `/tmp/credo-automatic-payments-calendar.png`.

No native timing equality, physical-device feel or frame-rate claim is made.

## UI correction after user review — 2026-11-06

The user rejected the initial UI approximations, specifically the frequency row,
calendar, slider, spacing and duplicated transfer controls. This correction uses
the existing transfer stylesheet and control markup for amount typography, the
64px keypad cells with12px gaps,18px close asset in its40px circle,24px chevron,
and layered CTA with the original gradient and14px/500 uppercase label. Existing
transfer source and behavior were left intact.

The reference's One-off/Monthly shape replaces the settings-style frequency row.
Monthly opens the day picker; One-off is contextual only because one-off payment
execution is outside this automatic-payment study. The selected day is retained
and included in the Monthly control's accessible name. Both tray screens now
use Continue, matching the reference's consistent CTA label.

The calendar is a152px square with a42px coral On the cap, larger76px numeral,
aligned paper edges and a fold line that does not cross the ink. The slider uses
a6px track,32px thumb and16px endpoint labels10px below the visible thumb bounds.
Its expanded input hit area is independent of the visual row height, so scaling
the authoring phone does not push the labels away. Content spacing determines
the636px/512px tray endpoints; spring and transition timing are unchanged.

This is a proposed UI correction, pending user visual approval.

Correction verification: all nine tests and the production build pass. Browser
checks covered keypad delete/entry, pointer dragging to Last Day, and retaining
that selection on return. Computed shared controls were342×56px with14px/500
CTA text,40×40px close circle with the18px asset, and64px keypad rows. The
slider's effective target measured44px at the tested scaled viewport. Browser
console had no warnings/errors. Updated screenshots:
`/tmp/credo-automatic-payments-amount-refined.png` and
`/tmp/credo-automatic-payments-day-refined.png`.

## Calendar drag correction — 2026-11-06

The user reported that the calendar broke during scrubbing and still lacked the
reference's polish. Browser sweeps confirmed four different page pairs could
remain visible at once. The replacement uses a single coherent fold with one
animation clock; input changes the authoritative day immediately while the
visible sheet keeps its current position and velocity. It does not queue an
animation for each slider event. Large jumps can skip dates between frames.
The reference can show several sheets; this adaptation deliberately prioritizes
a coherent reversible surface over reconstructing that layered simulation.

Visual corrections: an80px Arial numeral, quieter paper shadows, a restrained
coral cap gradient, less exaggerated perspective, shading on both page faces,
and reference-style staggered Last/Day words with faint perforations. The tray
spring, shared transfer controls, anchored CTA and sheet spacing are unchanged.

Verification: repeated real browser drags included full forward/reverse sweeps
and interruptions. Captured live poses showed one sheet joining adjacent dates
with matching upper/back and lower/front copies. Unit checks exercise180 dense
retargets, mid-fold reversal, latest selection, month-end, keyboard input, motion
preference changes and disposal. Physical touch-device testing and user feel
approval remain pending; this is not a claim of exact Aave timing or rendering.

## Optional device frame — 2026-11-06

At the user's request, automatic payments now defaults to a CSS iPhone-style
frame: a natural metal rail, dark bezel, side buttons, antenna breaks and camera
island. The 390×852 live screen is preserved inside a414×876 shell. Hardware is
decorative, hidden from accessibility and does not intercept pointer events.
The reusable IPhoneFrame wrapper keeps the screen mounted when its toggle is
changed, preserving the entered amount, chosen day and current tray view.

Hide/Show phone frame lives with the study controls. Responsive fitting includes
the shell dimensions; the narrow-screen toolbar uses a separate row so its
controls do not overlap All studies. No payment or calendar motion was changed.
Browser checks covered amount entry, frame off/on with105 retained, slider
pointer dragging to Last Day inside the frame, toggling during the day view,
and Continue returning with that day retained. At390×844 the framed device fit
within the viewport and the page had no horizontal overflow. The normal browser
viewport was restored afterward. All11 tests and the production build pass;
console showed no warnings/errors. Screenshot: `/tmp/credo-iphone-frame.png`.

## Pass one: content and header handoff — 2026-11-06

Implemented the first pass of the user-approved refinement plan. This authorizes
the implementation; visual feel approval remains pending. The review's83.3ms
frame exposed the old amount/keypad at21% opacity behind the calendar, and two
header labels were visible simultaneously.

Each content scene now owns a full-canvas mask. The outgoing group captures its
current position, moves8px outward along the transition direction, grows toward
1.02 and fades over100ms with[.19,1,.22,1]. The incoming calendar/slider is one
group, starting at.97 near its final slot with an8px hint and160ms quad entrance
after30ms. There is no individual-key stagger.

The taller amount scene needs its return travel to lead visibility: it travels
with the stronger expo curve after30ms, then fades in over130ms after60ms. This
keeps the bottom row inside the106px footer aperture once it becomes readable;
both directions complete their normal content handoff at190ms. Interrupted
transitions shorten from the current opacity and preserve the current position,
scale, masks and surface velocity.

Titles use the fixed24px header mask and12px directional hints. The old label
clears over60ms before the new label enters over100ms; the back affordance is
coordinated with that exchange. Header blur is removed. Only one title is visible
at a time, including rapid reversals.

The original omega32.5 sheet spring,636px/512px endpoints and34px CTA anchor are
preserved. Calendar drag response and opening/closing behavior are unchanged
for the later passes. Keyboard navigation still snaps. Reduced motion clears
the old group before geometry changes and only fades in the stationary new
group. DialKit now samples the same content/header choreography using separate
Content and Header clocks, with a new nonpersistent handoff version.

Verification: all14 tests and production build pass. Tests cover outward exits,
independent apertures, early clearing, title exclusivity, visible pose continuity
at15/35/55/83/125/175ms reversals, return-row clearance, keyboard and reduced
motion. Browser verified live forward/return/reversal, preview handoff and native
slider dragging after adding the scene masks. At83.3ms forward, old opacity was
.000451457 instead of.209831; new opacity.578974; surface inset133.353px and CTA
bottom34px matched the prior geometry. At83.3ms return, the final keypad row
bottom was560.931px, safely above the570px mask edge. Browser console had no
warnings/errors. No physical-device or frame-rate claim is made.

Screenshots: `/tmp/credo-autopay-pass1-83ms.png`,
`/tmp/credo-autopay-pass1-return-83ms.png` and
`/tmp/credo-autopay-pass1-ready.png`.

## Pass two: direct calendar tracking and shared release — 2026-11-06

The user accepted pass one with “Good” and authorized this focused calendar
pass. During a pointer drag, native range stepping becomes continuous and the
paper angle, thumb and fill use the same current position immediately. There
is no spring, queued flip or React state update on each pointer move. The
selected day and accessible description update to the nearest whole day.

Release commits that day immediately and settles all three visuals together
from their exact tracked pose. The critically damped release uses omega75,
a160ms maximum and velocity capped at8 dates/second; holding still for80ms
discards stale velocity. This lets the final partial page finish without
trailing several dates behind or snapping the thumb independently. Catching
the settling thumb cancels its clock and continues from the visible pose.
Endpoints finish directly, and cancellation settles to the selected day.

Whole-day native stepping returns after settlement and before keyboard input.
Keyboard changes remain instant. Reduced motion keeps direct pointer selection
but removes the decorative fold and release travel. First-pass surface/content/
header behavior, scene masks, CTA anchor and all calendar styling are unchanged;
the first-pass controller and study stylesheet have identical before/after
SHA256 hashes. Opening and closing are reserved for a later pass.

Verification: all19 tests and the production build pass. New gesture tests
cover180 direct fractional updates, matching adjacent faces, shared settlement
within160ms, catching/reversing a release, full sweeps, held-thumb velocity,
cancellation, keyboard preparation and changing reduced-motion preference.
Actual browser pointer sweeps reached Last Day and returned to day1. A release
was observed at14.804 with one coherent14/15 fold, then settled to15 with both
halves matching and native integer stepping restored. Home then ArrowRight
selected day2 immediately; Continue retained day2 on the amount screen.
Browser console showed no warnings/errors. Screenshot:
`/tmp/credo-autopay-pass2-preview.png`.

Second-pass visual feel approval and physical touch-device testing remain
pending. No frame-rate or exact Aave timing claim is made.

## Pass three: assembled sheet entrance and dismissal — 2026-11-06

The user authorized the third pass before reviewing the complete result.
Opening/closing previously toggled `hidden` immediately. A separate presence
layer now moves the assembled sheet, including its CTA, as one object. The
existing amount/day spring and content/header controller and the pass-two
calendar controller are byte-identical to their preceding versions. Only the
outer presence wrapper and its lifecycle are new.

Pointer opening takes300ms with[.32,.72,0,1]; dismissal takes220ms with
[.19,1,.22,1]. Backdrop opacity uses a180ms quad fade. There is no additional
content fade or key stagger. Exit travel measures the currently clipped sheet
height, including a partially completed internal resize. Reversing presence
captures its current pose and shortens the remaining movement, without a late
exit callback hiding the reopened sheet. The native-style home indicator stays
in place outside the moving tray.

The background remains inert until dismissal finishes; closing sheet controls
become inert immediately. Focus returns to Set up a payment after dismissal
and moves into the dialog when opened. Keyboard opening/closing is instant.
Reduced motion uses a stationary120ms fade; changing that preference cancels
pending travel. A fully dismissed flow reopens on amount entry while retaining
the entered amount and selected payment day. Initial presentation stays open
without an unsolicited load animation, as in the previous passes.

Verification: all23 tests and the production build pass. Four new tests cover
the complete exit/entry lifecycle, reversals, current-height travel, instant
keyboard/reset behavior, reduced-motion changes and disposal. Real browser
checks covered pointer closing/opening from both sheet heights, dragging to
Last Day, retaining it on reopen, keyboard Enter in both directions and focus
restoration. The observed full-height exit was637px and the calendar exit513px;
the home indicator retained its screen position. Browser console had no
warnings/errors. Screenshot: `/tmp/credo-autopay-pass3-preview.png`.

This completes the three implementation passes for user review. Visual feel
approval and physical-device testing remain pending.

## Opening-distance correction after full-flow review — 2026-11-06

The full-flow review found that a fully hidden presence layer makes the sheet's
`offsetHeight` zero. Reading that value before unhiding collapsed entry travel
to2px. The original presence test used a constant676px mock height, so it did
not reproduce browser layout behavior and missed the defect.

Travel now uses the existing `PAYMENT_SHEET.canvas` constant minus the current
clip inset, plus the existing1px clearance. This yields637px for amount entry
even when layout height is zero; reading the current inset also preserves
interrupted-resize exits and offscreen calendar-to-amount resets. No timing,
curve, fade, focus or visibility behavior changed. The tray handoff controller,
calendar controller, component and stylesheet are byte-identical to their
pre-correction versions.

The test fixture now returns zero height when its ancestor is hidden. Both the
existing entrance test and a new calendar-close/amount-reopen regression failed
with2px travel before the fix and pass afterward. All24 tests and the production
build pass. A fresh browser load confirmed zero layout height while closed,
then substantial entry travel (560.661px at an early sampled frame). Closing
from the day picker retained its513px exit; reopening used the taller amount
entry and retained day8. Console had no warnings/errors. Screenshot:
`/tmp/credo-autopay-opening-fixed.png`.

The demonstrated lesson is to model hidden layout in presence tests and derive
this fixed-canvas study's travel independently of its current display state.
User approval of the corrected entrance remains pending.
