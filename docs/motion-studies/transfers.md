# Transfers: a continuous China transfer flow

## Scope and status

Study 03 at `/studies/transfers`. The user requested a faithful starting point
from their redesigned Figma screens, initially with instant switching. The user
then authorized the shared-sheet motion proposal and approved its faster timing.
The user subsequently defined and authorized the full flow: payment method →
amount presets or custom entry → review → processing → result. The new flow is
implemented as a local portfolio simulation; feel review of the extension is
pending. New screens use Credo's visual language rather than Family's cyan UI.

## Source

[Figma section](https://www.figma.com/design/j82F8IlyXGFLfyx4RT84iF/Credos-Ugly-screens?node-id=93-10946)
contains two 390×852 screens:

- `93:11006`: transfer options, 378px bottom sheet.
- `93:10947`: China payment methods, 262px bottom sheet.

Both use the same underlying International transfers screen and 60% black
backdrop. The source's English labels, colors, corner radii, template strip,
icons, Alipay/WechatPay artwork, and spacing are retained.

## Interaction

The initial sheet contains Account Number, Card Number, International transfer,
and Transfer to China. Clicking Transfer to China changes the sheet to
Alipay and WechatPay using the coordinated transition described below.
Both payment methods continue to amount selection. Custom entry is a branch
that goes directly to Review. Back/Edit restores the selected preset or custom
value. Reset study clears the demo and instantly returns to options. Close or
backdrop click dismisses the sheet; Escape goes back when allowed, then closes.
Keyboard focus remains within the sheet while tabbing; the background is inert.
Other methods and template items are static context for this study.

## Assets and implementation

`components/TransferStudy.jsx` and `app/studies/transfers/transfers.css` follow the
existing Next.js and plain CSS conventions. No animation dependency was added.
The phone is scaled as a fixed design canvas, like the existing studies.

Assets are local under `public/assets/transfers`. The grouped asset URLs supplied
by design context returned empty files; actual icons and avatar layers were
exported via the Figma Plugin API instead. No source canvas changes were made.
Icons retain their SVG root dimensions. Avatars and payment marks are original
layer PNG exports. The fifth avatar is a 30×64 export of the visible clipped
portion at the screen edge; the static template strip does not scroll.

## Verification

Compared browser screenshots of both states with the Figma screenshots. All
rendered images loaded, with their effective geometry inspected. The China
sheet measured 262px. Checked China selection, close and reset. Production
build passed. Physical-device behavior remains untested.


## Persistent sheet transition

The sheet stays mounted as a fixed 390×676 canvas, large enough for the keypad.
Clipping initially exposes 378px; its visible top edge moves 116px down to
expose a 262px China sheet, with its bottom fixed.
The header (including the same close button) and divider translate by exactly
the same progress. Text, icons and width are never scaled. The home indicator
stays stationary. Surface motion uses the same critically damped spring form as
My Space, tuned faster for this sheet: stiffness 1056.25, damping 65, mass 1
(omega 32.5), with velocity preserved on reversal.

Both title and list groups use complementary opacity from a shared 130ms fade,
starting together. Titles shift by 8px. Both titles and lists use at most 2px
blur during overlap, returning to no filter at rest.
List groups shift by 8px over 180ms and remain attached to the moving header.
The opacity and local movement use cubic-bezier(.25,.46,.45,.94). The lists are
clipped between their moving top inset and the fixed 34px footer, with a 16px
opacity feather above the footer boundary. There is no
row stagger, no icon morph, and no background/backdrop transition between steps.
Interrupted fades restart from their current value, with remaining duration
proportional to distance. Keyboard changes snap all values. Reduced motion
snaps geometry and removes offsets/blur, retaining the paired opacity change.
Opening/closing the whole modal remains instant, outside this step-switch scope.

## Timeline and checks

Added forward and return DialKit timelines with Surface, Fade and Movement
tracks, plus Show timeline and comma/period frame stepping. Both directions use
the same painter as live motion. Pausing the preview and returning to live
input resumes from the displayed geometry and opacity. Only active content is
exposed to assistive technology; inactive lists are inert. The narrow-screen
preview tools now fit without overlap. Next.js's development badge is hidden
because it covered the timeline button in the narrow preview.

At .0867s in the forward preview, the sheet edge, header and divider all moved
76.3561px. List opacity was .192034/.807966, local offsets differed by exactly
8px, close opacity was 1, and title blur was 1.24126px. The reverse preview at
the same time had sheet offset 39.6439px and opposite complementary opacities.
Both visual endpoints match the original Figma geometry. Browser checks covered
both directions, paused-preview handoff and instant Enter/Escape selection,
with no console errors. An isolated harness executing the actual animation
controller passed visibility, rapid reversal, preview handoff, keyboard
interruption and close/reopen checks in normal and reduced-motion branches.
OS reduced-motion playback and physical-device performance remain unverified.

## Review refinements — 2026-10-13

**Status:** the user described the baseline as very decent and authorized all
five review suggestions. These refinements are implemented; user feel review
of this iteration is pending.

- Lists now share the title's `8 × fade × (1 − fade)` blur envelope, peaking at
  2px. This softens double text during the simultaneous crossfade without a
  blank interval. Reduced motion removes the blur and spatial offsets.
- A fixed alpha mask stays opaque through y=328 and reaches transparency at
  y=344, the footer boundary. Outgoing rows fade through the last 16px instead
  of ending at a hard cut. Resting rows end at or before y=328 in both states.
- Live playback and timeline preview use the same exact critically damped
  spring sampler and `.0001` position / `.002` velocity stopping thresholds.
  The Surface track is a linear 460ms phase clock composed with that sampler;
  it is not the spring's easing curve. The editing window is 480ms. This keeps
  the settling tail visible and the clock bar editable. At 200ms, sheet,
  header and divider move 112.032px rather than snapping prematurely to 116px.
  Preview handoff retains sampled velocity as well as position.
- Invisible close and China-row hit areas compensate for phone scaling to
  provide at least 44×44 displayed pixels at the resting options state.
  Padding stays within the sheet and content clipping; at the smallest canvas
  scale, the row's extra hit padding expands toward the left to avoid the close
  target. Visual icon sizes and layout remain unchanged.
- A primary pointer press scales only the China icon to .97 over 150ms using
  cubic-bezier(.25,.46,.45,.94). Release, cancellation, leaving the row, window
  blur, keyboard input, and changing state clear the pressed flag. Keyboard
  selection stays instant; reduced motion removes this decorative scale.

**Observed checks:** browser scrubbing at 33.33ms showed complementary list
opacities .616294/.383706 and 1.89181px blur. At 200ms the surface, header and
divider all measured 112.032px. At the 319×748 preview size, resting hit areas
measured 44.63px with the timeline hidden and at least 44px with it open.
Clicks outside the original visual row and close-circle bounds activated the
expected actions. The fixed footer feather was visually inspected in the
early crossfade. An isolated harness executing the actual controller with the
installed DialKit adapter passed overlap, rapid reversal, instant keyboard
input, forward/reverse spring sampling, preview handoff, endpoints,
close/reopen and cleanup in normal and reduced-motion branches. Production
build passed. Real-device performance and OS reduced-motion playback remain
unverified. Timeline edits are authoring previews until baked into the live
motion constants.

## Faster overall timing — 2026-10-13

The user requested a slightly faster overall transition. Shortened the fade
from 160ms to 130ms and local content movement from 220ms to 180ms. Increased
omega from 26 to 32.5 while keeping critical damping, the same travel, easing,
paired fades, blur envelope, footer feather and interruption behavior. The
sheet now meets its existing rest thresholds after approximately 376ms from
rest, previously 460ms. DialKit's phase clock is 380ms with a 400ms editing
window, and versioned persistence IDs prevent old preview timings from masking
the new defaults. Icon press feedback remains a separate 150ms interaction.

This is a tuning iteration awaiting user feel review. Verified the new sampler
settles within the timeline clock and checked the updated track lengths and
both transition directions in the browser. Real-device performance remains
unverified.

### Growing amount selection ring — 2026-10-13

**Status:** implemented from the user's request; awaiting feel review. Revisited
the Family recording around 3.8–4.0s: the selection ring expands outward around
the neutral tile. The web adaptation keeps a persistent pseudo-element per
preset, scaling .94 → 1 over 180ms with [.23,1,.32,1] while fading in over 120ms
with [.25,.46,.45,.94]. Deselection shrinks over 120ms and fades over 90ms.
Its final 2px coral stroke remains outside the 12px tile, separated by a 2px
white gap with a concentric 16px outer radius. Neutral fill, text and layout
remain unchanged. CSS transitions retain their current pose when redirected.

Pointer selection animates; keyboard activation disables the ring transition.
Reduced motion retains a 100ms opacity fade and removes scale. Browser checks
confirmed an in-flight pointer ring transform, unchanged grey fill, and instant
keyboard selection with transition none. Pointer selection worked again after
keyboard activation. Native-device feel remains unverified; these web values
are an adaptation, not measurements of Family's native implementation.

## Full flow extension — 2026-10-13

**User decisions:** the faster initial switch was described as good. The user
specified payment method → preset/custom amount → review → processing → result,
with Family as an interaction reference and Credo's design language/colors.
They authorized implementation after reviewing the flow and choreography map.
No recipient, exchange-rate, authentication or extra banking fields were added.

**Prototype assumptions:** funding amounts use sample GEL presets 20, 50, 100,
200 and 500. Custom entry permits six integer digits and two decimal places,
stored as integer minor units. Currency, presets, review copy and result copy
are illustrative; they are not a statement about Credo's actual transfer terms.
A labeled external control chooses the next simulated response. The separate
1.6s response fixture performs no network call and is independent of animation
completion. Success, pending and failure are distinct states.

### Surface and persistent elements

The one fixed canvas exposes these heights: Options 378px, China methods 262px,
Amount 484px, Custom 676px, Review/Processing/Results 500px. The first 116px
resize retains its approved spring and fade. The generalized controller is in
`lib/transfer-motion.mjs`; state definitions, precise amount helpers and the
response fixture are in `lib/transfer-flow.mjs`.

- Surface, header and divider share the same offset. The same close button
  persists. A Back button is introduced after the first screen.
- Context (selected method) persists from Amount onward. The same amount element
  remains visible across Custom → Review and Review → Processing → Result.
  These shared elements move with the tray and do not join each panel's fade.
- Changing panels and titles retain the 130ms paired fade, 8px/180ms local
  movement, at most 2px blur, and the custom content curve. Reversals start from
  displayed weights/positions and preserve spring velocity. Remaining fade and
  movement duration shorten with distance.
- A single coral action button stays in the same footer slot after Amount.
  Labels change with panel weights; processing disables repeat submission.
- The footer's 16px opacity feather follows its reserved area as the action
  arrives, so outgoing methods are not cut off by the new action area.
- Preset selection and typed digits update immediately. The built-in keypad
  avoids a second asynchronous keyboard resize in this web prototype. Hardware
  digits, decimal, Delete, Backspace and Enter also work. Step changes initiated
  by keyboard are instant.
- Result icons share a fixed status slot. The success check's stroke follows
  the 180ms motion track, including timeline scrubbing. Processing uses a 700ms
  spinner; preview uses the playhead for its rotation, and reduced motion uses
  the static indicator plus status text.

### Navigation, response and authoring behavior

Review returns to its amount branch with values intact. Custom Back restores
presets without erasing the custom value. Closing after submission keeps the
simulated request alive; Recent transfer exposes its latest status and reopens
it. Reset aborts the fixture and clears the draft; unmount also cleans it up.
A pending result can be checked again, and a definite failure returns to Review.
Only explicit confirmation/checking starts a request; timeline markers never do.

Each transition has its own scrubbable timeline. The physical phase clock's
length is calculated with the same live spring/rest thresholds, including
longer travel. Review/Processing/Result retain the same height. An arriving
response is deferred while previewing and applied when returning to live motion;
it cannot overwrite a paused frame. Preview handoff resumes the displayed
geometry and fades. Decimal input takes precedence over frame stepping while
editing an amount.

Reduced motion snaps surface/geometry, removes blur and local movement, and
retains the content fade. Only the active panel and its applicable controls are
exposed to assistive technology. The phone preview has a minimum usable scale
of .75 when width allows, keeping adjacent row targets at least 44px without
overlapping. A smaller authoring viewport may scroll with the timeline open.

### Verification and limits

Browser checks covered both payment methods, preset review/confirmation,
custom decimal entry, hardware Enter, editing/restoring a custom amount,
success, failure returning to Review, pending resolving to success, and closing
while processing then reopening Recent transfer. At 390×844, the page had no
horizontal overflow; keypad targets measured approximately 90.6×54.7px and the
main action approximately 292.2×47.8px. Six automated tests cover cent precision,
input limits, amount-branch navigation, submitted snapshot/cancellation,
physical reversal, every pair's spring settling tail, and the actual live
controller's normal/reduced-motion branches. Production build passed.

New screen layouts and sample values await user review. Real-device frame rate,
OS reduced-motion playback and native React Native keyboard behavior remain
unverified. The prototype does not connect to banking services or persist a
transaction across page reloads.

Final browser timeline check: at 100ms in Amount → Custom, the surface and
persistent method row both had a 31.0401px offset; panel opacities were
.0560388/.943961 and local positions stayed 8px apart. Entered value 125 survived
scrubbing and returning to Review. A separate check paused Review → Processing
at its initial frame: the background record became Completed while the preview
remained Review; hiding the timeline then transitioned to Success with the
correct submitted amount. No browser console errors were observed.

A final screenshot exposed focus-induced scrolling inside the static phone:
inactive tall panels could enlarge its scrollable overflow even though the
visual mask clipped them. The phone artboard and content mask now use
`overflow: clip`, so focus/locator scrolling cannot move the canvas internally.
After Custom → Review, the phone's scrollTop stayed 0 and the home indicator
retained its 701.465px displayed bottom at the 1280×720 viewport. This fix is
specific to a static prototype canvas; real scrollable form content should
retain intentional scrolling.

### Amount screen refinement — 2026-10-13

User requested removing the method/context row from preset selection, reducing
space above Continue, and using Credo's primary button (Figma `103:12203`).
The preset tray is now 402px tall: question, choices, then a 32px clear gap to
the action. Method context remains on Custom, Review and submitted states.
The shared CTA uses the supplied 342×56 geometry, 32px corner radius and
Helvetica Neue Bold 16/20 uppercase typography. Its gradient is converted from
the actual Figma paint transform: 209.002716deg, secondary #1e6e91 at -141.51%,
primary #fc6250 at 108.14%. The generated code omitted the first stop's negative
sign; copying it directly would have flattened the visible gradient. Disabled
appearance is a prototype adaptation (50% white overlay), not a supplied variant.
Spring and content timing parameters are unchanged; shorter tray travel can
change its physical settling duration.

Browser verification at 615×763 covered WechatPay → presets → Review → presets
→ Custom → presets. Context was absent from presets, present on Review/Custom;
selected amount survived returning, the CTA enabled correctly, and phone scrollTop
stayed 0. The question occupied one 20px line, the CTA measured 342×56 in artboard
coordinates, and the settled presets-to-CTA gap was 32px. Six existing tests and
the production build passed. These design refinements await user review.

### Family / Emil choreography pass — 2026-10-13

**Status:** user authorized the review suggestions; implemented, awaiting feel review.
Sources were the supplied Emil1–4 lessons and `emilfcode.rtf`, plus consecutive
frames from the Family recording around presets/custom, custom/review and return
transitions. The native recording establishes visible relationships, not exact
native spring parameters. Processing/results apply our guide rather than copying
an unobserved Family result animation.

The approved options ↔ China switch retains its 130ms fade, 180ms/8px local
movement and existing spring. Extended steps use an adaptive body clock:
`clamp(abs(heightDifference) / 500, .15, .27)` seconds, with Emil's
`[.26,.08,.25,1]` easing. China/amount, amount/custom and custom/review use 270ms;
amount/review uses 196ms; equal-height submitted states use 150ms. The surface
spring is unchanged. Incoming and outgoing content overlap throughout.

Each panel now has an inner body whose natural bounds exclude its outer padding.
That body scales .96 → 1 on arrival and 1 → .96 on departure, around its own
center. The outer panel follows the physical tray edge. This prevents the empty
padding above a keypad from shifting its scale origin. Shared method and amount
remain unscaled, maintaining identity through review and submitted states.
Titles have an independent 150ms fade/8px masked movement; body and title blur
remain at most 2px during overlap. The initial switch keeps its original title clock.

The CTA appears with 4px vertical travel and .98 → 1 scaling on an inner visual
layer. It stays anchored when both states have an action; identical Continue
labels remain visible. Changed labels use a separate masked 4px/150ms transition.
Rows, presets, Custom, keypad and the CTA now press their inner visual layer to
.97 with 150ms recovery. Hit areas remain stable. Pointer release, leaving,
cancellation, window blur, keyboard input and navigation clear press feedback.

Active controls no longer wait for 90% opacity. State, valid amount and the
existing request guard determine whether an action can run. Keyboard navigation
still snaps. Reduced motion removes body scale, local movement, CTA movement,
blur and press scale while preserving fades. No dependency was added.

The DialKit v2 tracks are Surface, Body, Titles and Movement. Body progress drives
both scale and opacity; the same painter drives live and preview. Changing the
track schema uses a new persistence key to avoid loading the old 130ms preview.
Preview handoff retains its original pair's adaptive profile, current scale,
opacity, geometry and surface velocity, including when the active semantic state
has already changed to the destination.

**Verification:** the actual-controller test now covers readable overlap at 100ms,
the faster title clock, complementary fades, a stationary shared CTA, immediate
activation, continuity of scale/title/fade on reversal, final scale and reduced
motion. Six tests pass. Browser scrubbing at 100.223ms in amount → custom showed
body opacities .371988/.628012, scales .97488/.98512 and matching 44.9028px outer
translations. Scale origins were 171×90px for presets and 171×146px for the keypad
(their content centers); the title was .895596 opaque and CTA transform stayed
translateY(0px) scale(1). Browser checks also covered custom 12.5 entry, review,
Edit restoring 12.5, instant keyboard Enter, and processing/success. Real-device
frame rate and native React Native rendering remain unverified.
Final production build passed. A 100ms paused preview resumed to Custom with
opacity 1 / scale 1 and no stuck press flags; Alipay and WechatPay routes both
worked. No browser warnings/errors were observed. The page is left on presets
with 100 selected for the user's comparison.

### Focused method → amount refinement — 2026-10-13

**Status:** implemented in response to the user's feel correction; awaiting review.
The user found the shrinking method exit, long visible crossfade, amount-grid
scaling and almost stationary CTA entrance unconvincing. A paused browser frame
confirmed that this pair inherited the previous .96 exit and 270ms body clock;
the action had moved only 2.88px at approximately 54ms.

This pair now has its own reversible profile: body/movement 180ms with
[.23,1,.32,1], titles 130ms, action 180ms with the existing quad curve. The
methods scale 1 → 1.025 outward; incoming amounts retain scale 1 and have a 6px
local rise while following the surface. Returning keeps the grid at scale 1,
moves it down locally, and brings the methods from 1.025 → 1. Other body profiles
and the physical tray spring retain their prior settings.

The CTA has its own Action track, 24px local travel and .99 → 1 visual scale.
It also follows the remaining surface distance to the amount layout. The actual
button moves with its visual, preserving alignment of the hit area. The body
mask now reserves footer space at the moving button's actual position; reserving
its final footer too early had cut off the lower amount tiles. The fixed 34px
home-indicator area covers the emerging button. Its label stays centered in the
revealed portion, gaining opacity as enough height is exposed, so text is not
sliced through the safe-area boundary. The first CTA no longer multiplies its
label fade by its outer fade. Existing action-to-action labels still crossfade.

Body, title, action and surface state are retained on redirection and preview
handoff. DialKit adds an Action track and uses v3 persistence to avoid loading
the prior pair's tuning. Reduced motion snaps spatial changes and retains fades.

**Observed:** at 100.609ms in the browser, methods had scale 1.02449, amounts
scale 1, button travel 26.6996px and the amount-grid/button gap 36.15px; the mask
bottom inset was 79.3004px. The label was visually readable above the white
home-indicator area. Both Alipay and WechatPay paths, Back, paused-preview
handoff and preset selection worked. Actual-controller checks cover outward
exit, fixed-size grid, connected button travel, maintained spacing and continuity
on reversal. Six tests pass. Physical-device feel remains unverified.

### Correcting clipped CTA and restoring depth — 2026-10-13

**Status:** implemented from the user's screenshot correction; awaiting feel review.
This supersedes the preceding method/amount refinement. The previous full-height
CTA follow and white safe-area cover visibly sliced the button. The fixed-size
grid also removed the growth the user wanted from Family. Those approaches are
rejected for this transition.

Reinspection of the Family clip at 2.00–2.55s confirmed outward withdrawal of the
old rows, overlapping growth of the new grid and a complete bottom capsule.
The new method → amount profile uses methods 1 → 1.04, amount body .94 → 1,
and the inverse depth relation on Back. Outgoing pose begins immediately over
220ms with [.25,1,.5,1]. Body opacity begins 20ms later and lasts 180ms with
[.26,.08,.25,1]; incoming growth follows that body progress, so the new grid is
still visibly smaller while appearing. The old content thus moves before it
fades; the two bodies subsequently retain complementary alpha without a blank
interval. The amount panel no longer blurs, keeping its numerals crisp.

Continue stays at translateY(0), with .96 → 1 center scaling and the same
20ms/180ms entrance clock. The surface-follow term, moving-footer calculation,
white footer cover and label counter-translation were removed. Its entire
capsule stays inside the tray and above the home indicator at every progress
value. Existing action-to-action label transitions remain separate.

This pair's critically damped surface uses omega 48 (stiffness 2304, damping 96,
mass 1), making room for the taller grid sooner. The approved options/China
switch and other surface profiles retain omega 32.5. The exact sampler, velocity
preservation and per-pair settling clock remain shared by live and timeline.
The schema now uses v4 persistence; Body and Action start at .02s, Movement at 0.

**Verification:** at 50.304ms, the methods had scale 1.02606 and the CTA was a
complete capsule at zero vertical displacement. At 100.609ms after final tuning,
methods scale was 1.03643, grid scale .984256, CTA scale .989504, CTA displacement
0, amount blur none and footer pseudo-element content none. Browser screenshots
showed the whole button and a growing incoming grid. Both payment methods, Back
and a 100ms paused-preview handoff worked. No warnings/errors were observed.
Actual-controller tests now assert outgoing movement before opacity changes,
incoming grid growth, a contained CTA pose, continuity on reversal and the
per-pair spring clocks. Six tests and the production build passed. Native-device
feel remains unverified; this is a reference-informed web iteration, not a claim
of matching Family's undisclosed native values. The page is left on payment
methods for the user's live comparison.

### Faster method/amount experiment — 2026-10-13

**Status:** superseded; the user rejected this experiment as too fast and off.
Only payment methods ↔ amount selection changes. Body and CTA fade for 100ms
after an 11ms outward-motion lead; movement takes 122ms and titles 72ms.
The critically damped surface uses omega 90.5 and settles at 150ms under the
existing rest thresholds. Depth, easing, complete anchored CTA, interruption
and reduced-motion behavior remain as above. This supersedes this pair's
previous 268ms timing. Pair-specific v5 timeline persistence loads the new clocks.

**Verification:** six existing tests pass, including reversal continuity and
surface settling. Browser live entry, Back and preview-to-live handoff worked.
At 60ms on the timeline the incoming grid was still growing, the outgoing rows
remained visible and the complete CTA stayed within the tray. Timeline shows a
150ms surface track. Left on payment methods, timeline hidden, for comparison.
Real-device feel remains unverified.

### Match the first switch's pace, retain depth — 2026-10-13

**Status:** requested and implemented; awaiting user feel review. The user chose
the options → payment-method switch as the speed reference, while retaining
outward content withdrawal and incoming amount growth.

The method/amount pair now uses that reference's omega 32.5, 130ms body/title
fades and 180ms movement, all using [.25,.46,.45,.94]. Surface position and
velocity remain interruptible; its longer 140px travel settles at 382ms under
the existing strict thresholds, versus 376ms for the 116px reference. Most of
the spatial change happens by 180–200ms. This replaces the rejected omega 90.5,
72ms title and 100ms body clocks. Both bodies begin responding immediately.
Methods still scale 1 → 1.04 on forward exit, amounts .94 → 1 on entry, with
the inverse relation on Back and an 8px hint. Amount numerals remain unblurred.

Continue retains its full capsule, translateY(0) and .96 → 1 center growth.
Its first entrance starts at 60ms and fades for 130ms, giving the growing tray
space for the grid before the content mask reserves the button's footer area.
Back fades it immediately; existing actions, reversals with visible content,
and preview handoffs introduce no new delay. Live and timeline use the same
action clock; pair-specific v6 persistence avoids the rejected tuning.
No other step's timing or design changes.

**Verification:** six tests pass, including reversal continuity, growing grid,
contained CTA pose, first-action entrance and exact surface settling. Browser
Alipay/WechatPay entry and Back worked. At 50.304ms, the grid was growing while
the CTA remained hidden; at 100.609ms the complete CTA appeared below the grid
without overlap or a cut capsule. A paused 100ms preview resumed into the live
state. Left on payment methods with timeline hidden. Real-device feel remains
unverified.

### Presets ↔ custom keypad refinement — 2026-10-13

**Status:** implemented and browser-verified; awaiting user feel approval.
Family frames around 7.883–8.200s informed an outgoing
grid that withdraws upward while the keypad arrives during tray growth. These
web parameters are an adaptation, not measurements of Family's native curves.

This pair now has its own profile: unchanged critically damped surface omega
32.5, 150ms complementary body fade, 130ms title fade and 180ms local movement,
all using [.25,.46,.45,.94]. Forward presets scale 1 → 1.025 and move locally
0 → -8px; the keypad scales .96 → 1 while moving +12px → 0. Back reverses the
depth relation: keypad exits toward .96/+12px, presets enter from 1.025/-8px.
Outgoing scale follows movement and incoming scale follows opacity. The panels
remain attached to the surface; no key stagger or new library was introduced.

Both numeral panels stay crisp throughout this pair. Directional blur was
rejected because changing the crisp panel on reversal caused a filter jump;
the shorter fade removes the prolonged overlap. This replaces the generic
270ms overlap that left strong preset numerals over the emerging custom value
and blurred keypad digits.
Continue remains fully opaque, unscaled and anchored throughout this pair.
A pair-only 12px mask headroom accommodates the -8px return hint plus centered
scale without cutting the question; its top stays 8px below the divider.
Only this pair uses fresh v7 timeline persistence. Other pair timings, amount
selection ring, Credo styling and flow values are preserved.

**Verification:** six existing tests pass, covering actual-controller entry,
crisp numerals, outgoing growth, anchored CTA, mask headroom, reversal
continuity including filters, unchanged custom/review timing and reduced-motion
behavior. Production build and diff whitespace check pass.

Browser preview at 101.044ms showed preset opacity .101331/scale 1.0206 and
custom opacity .898669/scale .995947; both filters were none. Continue retained
opacity 1, translateY(0) and visual scale 1. At 50ms, outgoing and incoming
content overlapped without a blank frame. Back at 101ms left the question clear
within the new mask headroom. A paused 50ms preview resumed into live Custom;
entering 12, returning Back and reopening Custom restored 12. No console
warnings or errors were observed. Left on amount selection with timeline
hidden. Native-device feel remains unverified.

### Custom entry without method context — 2026-10-13

**Status:** implemented from the user's annotation. Custom entry now omits
the method icon/name, destination and GEL badge. Removing the 40px row and
24px gap shortens its tray from 676px to 612px and closes 64px above the amount
and keypad. The shared amount's position interpolates with custom view weight,
so Review can retain its original context and value slot without a position snap.
Reduced motion uses the target slot directly. Presets/custom keeps its approved
pair profile; custom/review's existing height-adaptive fade becomes 224ms for
the smaller height difference. Custom-related timeline IDs gain a compact suffix
to prevent persisted old surface durations masking the new geometry.

**Verification:** six tests pass, including custom context absence, compact
geometry, reduced-motion slot and reversal continuity. Browser checks showed
only the amount and keypad below the Custom header. Entering 1, continuing to
Review and returning preserved the amount; Review still showed method details.

### Torph amount entry — 2026-10-13

**Status:** implemented at the user's request; awaiting feel review. Added exact
dependencies torph 0.1.3 and numora 4.0.0. Source references:
[Torph](https://torph.lochie.me/) and
[Numora's Torph integration](https://numeric-input.com/docs/numora/integrations/torph/).
The actual library combination is reused; no claim is made about which package
or hidden parameters the native Family app uses.

`TransferAmountInput.jsx` places Torph's visible text over the existing real,
read-only input. Numora's string-based `formatValueForDisplay` formats custom
entry with commas and up to two decimals. The existing keypad, raw draft string,
validation, minor-unit arithmetic and input accessibility remain authoritative.
Numora's native typing adapter is unnecessary for this custom-keypad surface.

Torph uses caret matching at the end of the formatted string, 180ms with
[.19,1,.22,1], and its built-in reduced-motion handling. Pointer keypad entry
morphs digits/separators; physical keyboard entry and navigation disable morphing.
Navigation never replays digit animation over a tray transition. The overlay
uses real glyph width instead of the former character-count input width; the
real input is transparent and the visual layer is hidden from accessibility.
Library lifecycle/animation cleanup is handled by its React adapter.

**Verification:** tests and production build pass. Browser entry displayed
1,234.50 identically in input and Torph segments, retaining the final zero;
deletion produced 1,234.5 exactly. Hardware entry had no active Torph morph and
Review/Back restored 12.56. No browser warnings/errors were observed. Native-device
feel and OS reduced-motion behavior have not been exercised on hardware.
The dependency audit's three findings concern the existing Next/sharp/source-map-js
tree, with none reported for Torph or Numora; unrelated packages were not updated.

### USD and amount spacing — 2026-10-13

**Status:** implemented from the user's annotations. Transfer fixtures now use
USD/$ across presets, amount entry, Review/status, recent activity and accessible
labels. Amount tracking changes from -1px to .02em (+.8px at40px); the overlay
and real input inherit the same spacing. Custom caption reads “Max amount: 50 000.”
The displayed $50,000 limit is enforced by minor-unit validation and keypad
editing, including the cent boundary; other studies retain their currencies.

**Verification:** six tests pass, including 49,999.99, 50,000.00 and rejection of
50,000.01 or an appended integer digit. Browser showed $50,000, USD labels,
the new caption, computed .8px tracking and no change when another digit was
pressed at the maximum.

### Compact Review layout — 2026-10-13

**Status:** implemented from the user's chosen content scope; motion refinement
deferred. Review now contains the amount with Edit beside it, one icon/label row
“Alipay · China” (or WechatPay), and Confirm transfer. Removed the repeated
method/destination table, currency badge, amount caption and reminder sentence.
The sheet is 340px tall instead of 500px; amount occupies the first 100px content
slot, method row 180px, CTA 250px. Edit stays associated with the amount.

The existing shared amount slot calculation includes Review, and the existing
height-adaptive motion responds to the new layout; no new animation tuning is
introduced. Review-related timeline IDs are refreshed for its changed geometry.

**Verification:** six tests pass. Browser Review displayed only the intended
content. Edit returned to Custom with 5,650 preserved; continuing restored Review
with the same amount. Left on the compact Review screen. Animation feel review
remains intentionally deferred per the user's request.

### Review recipient and payment summary — 2026-10-13

**Status:** implemented following the user's correction that the previous
Review removed too much information. Retained the prominent amount with Edit,
then added two aligned rows: Recipient and Pay with. The latter shows the
selected method's icon and name once. David Sarajishvili is the explicit demo
recipient fixture, reused from the existing template names; no recipient-entry
step or real transfer recipient is implied. Removed the combined “Alipay · China”
row. Review is now 400px tall, leaving room for both rows and Confirm transfer.
Review timeline persistence is refreshed for the new geometry. Motion refinement
remains deferred.

**Verification:** six tests pass. Browser Review showed $100, David Sarajishvili,
and Alipay. Returning to method selection and choosing WechatPay retained $100
and updated the review icon/name to WechatPay. Left on that Review screen.

### Review aligned summary rows — 2026-10-13

**Status:** implemented from the user's layout correction, superseding the
prominent Review amount above. Amount now uses the same left-label/right-value
row as Recipient and Pay with; Edit remains beside the right-aligned total.
All summary labels and values share Helvetica Neue 14px/500 with 20px leading.
Labels retain their grey color and values their dark color. Review is 360px tall
and no longer uses the shared hero amount slot. Its timeline persistence is
refreshed for the changed geometry; animation refinement remains deferred.

**Verification:** six tests pass and diff whitespace checks pass. Browser
confirmed the aligned rows and identical computed typography for all three
label/value pairs, with WechatPay and the selected amount preserved.

### Review details heading and tighter spacing — 2026-10-13

**Status:** implemented from the user's reference and correction. Edit now sits
at the right of a “Transfer details” heading, above the summary, rather than
beside the total. It retains its amount-editing behavior and expanded touch
target. Summary rows are 32px tall instead of 48px, with a 12px gap after the
heading. The sheet is 344px instead of 360px, retaining a compact gap before
Confirm. Header/Edit use the existing muted summary typography. Review timeline
persistence is refreshed; animation tuning remains unchanged.

**Verification:** browser showed the heading and Edit on opposite edges,
compact aligned rows, and the complete CTA. Edit returned to the selected $500
preset; Continue restored Review with $500 and WechatPay preserved.

### Lighter Review labels — 2026-10-13

**Status:** implemented per user direction. Transfer details, Edit and the
Amount/Recipient/Pay with labels now use regular 400 weight and a shared neutral
`oklch(0.68 0 0)` instead of #818181 at 500. Values retain their existing dark
500 weight. This lighter label treatment is a visual prototype choice, not a
contrast-conformance claim; on white its WCAG contrast is approximately 2.88:1.

**Verification:** browser computed styles confirm all five labels use 400 and
the new neutral; values remain #292929/500. Whitespace checks pass.

### Custom amount ↔ Review continuity — 2026-10-13

**Status:** implemented from the three approved findings in
`plans/002-custom-review.md`; browser and user feel verification pending. This
supersedes the generic270ms custom/Review content fade. Other transition profiles
retain their timing.

The keypad clears over100ms. Review enters as one crisp, unscaled group over
130ms after30ms, with an8px/180ms local entrance. Return/Edit reverses the local
poses; the keypad grows from.96 on return and recedes to.96 on departure. Each
panel has its own opacity clock so an interrupted exit can continue from its
current opacity instead of reusing a complementary crossfade. Titles and CTA
labels use130ms quad easing[.25,.46,.45,.94]. The sheet retains omega32.5 and
velocity-preserving retargeting; the full CTA remains at opacity1/scale1/y0.

A noninteractive, aria-hidden flight carries the amount between measured Custom
and Review endpoints over200ms with[.23,1,.32,1]. Its right edge and vertical
center are stored in390px surface-local coordinates and composed with the
current surface spring offset. Measurement happens at pair entry/resize and
when reopening its timeline, not each frame. The amount's real input and Review
value retain their semantics while their duplicate visuals are hidden during
flight. Two typography skins share the same anchor and blend near the receipt
end, preserving the differing currency proportions and tracking without two
amounts appearing in different locations. Typing behavior remains owned by
Torph; navigation takes a fixed value snapshot.

DialKit uses the same flight/fade/movement painter with explicit outgoing and
amount tracks and v8 persistence. Reversal retains flight position, scale and
panel weights; redirects outside the pair clear the overlay and restore native
visuals. Keyboard navigation snaps. Reduced motion omits the spatial flight and
scaling while keeping the short content opacity swap.

**Verification:** six tests and production build pass. The actual-controller
harness checks keypad opacity0 and Review opacity≈.805 at100ms, crisp panels,
Review scale1, anchored CTA, one carried amount, pose-preserving reversal,
redirect cleanup, keyboard snapping and reduced-motion flight removal. Existing
approved transition tests remain passing. Browser scrubbing, exact glyph/endpoint
alignment, preview handoff and physical-device feel require root verification;
no user approval is claimed.

Root's browser check identified that `visibility:hidden` also removed the native
amount from the accessibility tree during flight. Corrected the duplicate
visual hiding to opacity0/1 so the active semantic input/Review value remains
available. The caption remains mounted with Max amount copy for custom/Review,
letting the parent's100ms custom weight clear it; results retain Amount to
transfer copy. Six controller tests pass after this correction.

**Root browser verification:** forward scrubbing at50/100/200ms showed the
keypad fully cleared at100ms, Review opacity≈.805 with no filter and scale1,
and CTA opacity1/translate0. At200ms the flight end and native total matched
exactly in measured viewport right/Y coordinates(435.75px/356.7336px). Reverse
200ms flight/source matched(376.6699px/380.7664px). Pointer Continue and Edit
worked with1,234.50 preserved. Hiding the timeline at200ms resumed live without
an amount duplicate; editing to5608 remeasured the snapshot correctly and
finished with native value visible/flight hidden. AX retained the active amount
after the opacity correction. These measurements verify this browser viewport,
not native-device feel. Real-device and OS reduced-motion playback remain
untested; controller tests cover reduced motion and reversal. User feel approval
is pending.

### Match Review content-to-button spacing — 2026-10-13

**Status:** implemented from the user's measured screenshot correction. Review
height is350px instead of344px, adding6px above Confirm without changing the
summary rows or anchored footer. The visible payment icon ends4px before its
32px row box, so the visible content-to-CTA gap is now32px, matching the preset
tile-to-Continue gap. Review timeline persistence is refreshed for the geometry.

**Verification:** browser measured both gaps at32.000007px in the390px canvas
(after accounting for phone scale). Review retains7,805.88/WechatPay. Animation
curves and spring tuning are unchanged.

### Persistent processing/success capsule — 2026-10-13

**Status:** implemented from the user's approved proposal and supplied status
recording. Processing and success share one410px sheet with a persistent receipt:
amount, David Sarajishvili and the submitted payment method remain visible.
The60px growth from350px Review opens space above the existing rows; their
absolute position and32px visible content-to-button gap stay fixed. The sheet
retains omega32.5. Completion does not resize the sheet or fade the receipt.

One capsule changes from “Sending transfer…” to “Transfer sent”. Torph0.1.3
animates the text and its measured width over200ms with[.19,1,.22,1], centered
inside a fixed-height slot. Coral background/text blend to muted green; a spinner
crossfades into a growing check with its stroke reveal. Removed the duplicate
large status heading/description and CTA spinner. The existing full CTA remains
anchored, disabled with Processing… while awaiting the response, then Done.
Failure/pending retain their existing result layouts.

Torph's vanilla API requires an initialupdate(text), not a constructor text
option. Rebuilding a preview clears old generated segments and cancels subtree
animations before initializing; rewinding after a completed morph rebuilds its
source before seeking WAAPI times. Live text, width, color and icon can therefore
be inspected on the existing DialKit timeline. The capsule is a decorative visual
layer; the existing live region announces the actual response and receipt data.
Keyboard entry snaps, reduced motion removes spatial/icon movement and the loop.

Actual simulated response completion still drives success independently of
animation clocks. Exiting a rewound processing preview restores an already-known
result rather than leaving the demo waiting for a response that already arrived.
No live banking integration or new dependency was introduced.

**Verification:** six controller/flow tests pass, including receipt opacity1,
fixed Review-row position, crisp text, persistent capsule, anchored CTA and
result-driven transition. Production build passed. Browser checked live processing
and success with$200/Alipay, timeline0/100/400ms, repeated rewind without
accumulating outgoing segments, and leaving a rewound preview with Done restored.
Measured final gap32.000007px; console showed no warnings/errors. Physical-device
feel and user approval remain unverified.

### Main CTA owns processing and success — 2026-10-13

**Status:** corrected following the user's clarification. The main CTA itself
now contains the Torph text, spinner/check and coral→green background. Removed
the separate status capsule above the receipt. The existing342×56 button stays
anchored and full width: Confirm transfer→Sending transfer…→Transfer sent.
Processing is disabled; the successful button retains the previous close action
with accessible name “Transfer sent. Close”. Its status copy uses16px/500 in
sentence case, while ordinary CTA labels retain their original styling.

Processing and success now share350px Review geometry, superseding the extra60px
status area and410px height above. Receipt details remain visible and stationary,
with the32px gap unchanged. Torph's200ms text animation and timeline scrubbing,
response-driven completion, reduced motion and keyboard handling are retained.
The receipt pair timeline uses a refreshed persistence ID.

**Verification:** six tests and production build pass. Browser confirmed exactly
one status element inside the main button, a visible persistent receipt,
processing disabled, successful text/check/background and32.000007px gap. Left
on$200/Alipay success. Physical-device feel and user approval remain pending.

### Remove sheet back chevrons — 2026-10-13

Removed the shared header Back button on every transfer step at the user's
request. Titles now stay left aligned without the48px back-button offset.
The close control, row affordances, keypad delete chevron and Review Edit action
retain their behavior. Six controller tests pass; browser confirmed zero shared
header back buttons and no title translation on payment method selection.

### Clean status button edge — 2026-10-13

Removed the greyish rim reported by the user. There was no CSS border or shadow;
the original CTA gradient remained underneath the pale status fill and showed
through the rounded antialiased edge. Once status opacity reaches1, its backing
uses the same flat color with no gradient; ordinary CTA states restore their
original gradient. Disabled native button appearance as the visual is custom.
Browser verified success backing background-image:none, matching green fill,
zero border and no shadow with$500/Alipay.

### Full-flow review fixes — 2026-10-13

**Status:** implemented from the user's approval of all three review findings.
Preset↔Review now has an explicit profile: outgoing100ms; incoming130ms after
30ms; local movement180ms with quad[.25,.46,.45,.94]; receipt scale1/crisp.
The grid withdraws outward to1.025 with-8px, reversing those poses on Edit.
Independent exit/entry clocks retain current opacity/pose on interruption.
The sheet spring and custom amount flight are unchanged.

Continue↔Confirm transfer uses a dedicated Torph label at160ms/expo
[.19,1,.22,1]. The two legacy overlaid labels remain opacity0; the one visible
label slot stays fully opaque through entry/review swaps. Keyboard navigation
snaps; switching back to pointer input re-enables the morph from its visible
text. A linear-time Label track seeks Torph's own easing/WAAPI animation,
including rewind/handoff. The existing processing→success Torph channel and
its200ms timing/color/icon choreography are unchanged.

During custom↔Review, the caption retains its original64px compact local offset
and fades out before the receipt becomes prominent (caption opacity derived
from the upper half of the custom panel weight). It no longer travels down
through Pay with. On Edit it returns after the old receipt starts clearing.
Entry/review timeline IDs are refreshed without altering status-pair tuning.

**Verification:** six tests and production build pass. Controller checks cover
preset tile opacity0/receipt≈.805 at100ms, crisp/unscaled summary, anchored
CTA, independent-fade reversal, single entry label and caption local position.
Browser confirmed those100ms values, Torph active and both legacy labels0.
At custom50ms caption opacity0; at200ms flight/native total endpoints still
match exactly. Pointer Edit, timeline handoff and1,234.56 preservation worked.
Processing/success retained the submitted WechatPay receipt and existing button
status transition; browser console showed no warnings/errors. Physical-device
feel and user approval remain unverified.

### Unified CTA typography and status colors — 2026-10-13

Implemented the user's14px uppercase, zero-tracking direction. All main CTA
states use medium500; status text inherits the same typography. The original
Figma gradient and stops remain unchanged for ordinary and Sending states,
with white copy/spinner. Success uses oklch(0.5 0.095 155) with white copy and
a white check disc whose tick uses the same green. This green is in sRGB gamut;
white text contrast is5.72:1 by WCAG luminance calculation.

The existing200ms status weights now tint the two brand-gradient stops toward
that green in OKLCH. At success the single painted backing becomes flat green;
there is no second opaque surface to expose the old gradient at a rounded edge.
Sheet spring, amount flight, Torph timing, status icon choreography and receipt
geometry are retained. This supersedes the pale status colors and16px sentence
case described above. User approval of the revised visual feel is pending.

Verification: six existing tests pass. Browser confirmed14px/500 uppercase in
Review and Success, the original gradient/white text during Sending, and flat
green/white text with visible check at Success. Saved
/tmp/credo-cta-unified-success.png. No physical-device performance claim.

### Collapse the removed receipt heading space — 2026-10-13

Processing and Success now use314px sheets, removing the36px previously reserved
for the24px Transfer details heading and12px margin. Review retains350px and its
heading/Edit row. The existing analytical spring moves the sheet edge, header,
divider and content mask into the smaller geometry as the heading fades out.
The receipt stays at its Review anchor; the main button remains bottom anchored.
Processing→Success retains equal heights and its existing text/color/icon motion.
This supersedes the shared350px status geometry above.

Verification: six tests pass, including a new assertion that Review→Processing
starts at the current surface, has an intermediate spring position, ends36px
shorter, and keeps the receipt at its anchor. Browser confirmed the362px final
clip inset, zero button displacement, hidden heading and compact success sheet.
Saved /tmp/credo-status-compact-sheet.png. User feel approval remains pending.

### Replace custom amount flight with a stationary fade — 2026-10-13

Implemented the user's preference for fading the custom value rather than
carrying/scaling it into the Review amount. Removed the shared amount flight,
its target measurement, typography skin blend and separate Amount timeline
track. Custom↔Review retains separate100ms exit/130ms entry with30ms overlap,
180ms content movement, original sheet spring and anchored CTA/Torph label.
The profile has a new persistence ID so the obsolete Amount track is discarded.

An aria-hidden snapshot keeps the original custom amount's position and size
while its opacity follows the exiting content. It is drawn outside the resizing
sheet clip to avoid sliced digits, with an additional opacity envelope that
clears it before the sheet edge reaches the value. On Edit, that envelope
reveals the value only once the white surface is underneath it again. The
native input remains accessible; Review's native total appears with the receipt.
Keyboard navigation snaps and reduced motion uses native opacity without the
snapshot. Entry/resize snapshots avoid per-frame layout measurement.

Verification: six tests pass and production build passes. Tests cover the fixed
anchor, no scale, fade completion before the old value can appear above the
sheet edge, reversal continuity, redirection and reduced motion. Browser scrub
showed opacity≈.690 at16.7ms and0 at50ms with identical transform; the old flight
node/Amount timeline track are absent. Pointer Edit and return to Review retain
$1,234/WechatPay. No console warnings/errors. Saved
/tmp/credo-review-amount-fade.png. User feel approval remains pending.

### Full-flow review follow-up: CTA handoff and reduced motion — 2026-10-13

Implemented the two approved review fixes. Confirm→Sending now uses the existing
200ms status Torph channel, primed with Confirm transfer while Review is shown.
During that pair its text layer stays opaque and the ordinary entry label stays
hidden. The spinner fades in independently, with a14px text offset compensating
for the icon's reserved28px at the start. Keyboard→pointer handoff restores the
morph from the visible Confirm copy. Rewind seeks the same Confirm→Sending
morph. Only this pair gets a refreshed timeline persistence suffix.

Reduced motion clears the outgoing custom money block before the surface snaps
to Review; the receipt retains its opacity entrance. The normal stationary
amount fade, analytical sheet spring, receipt anchors and existing200ms
Processing→Success color/text/icon choreography are unchanged.

Verification: six tests and production build pass. Added assertions cover a
single opaque handoff channel, hidden entry text, initially hidden spinner and
centered Confirm, and zero outgoing amount opacity throughout the reduced-motion
layout switch while the receipt still fades. Browser exercised custom entry
through submission and confirmed the corrected handoff at16.7ms in Chrome:
entry opacity0, status opacity1, spinner≈.410 and the original spring's329.711px
surface inset. The in-app browser became unavailable during frame capture;
subsequent Chrome capture was interrupted by page state changing to Reset.
No final transition screenshot or physical-device performance claim is made.
