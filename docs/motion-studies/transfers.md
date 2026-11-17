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

### Typography pilot — 2026-11-11

Family's use of a small number of text treatments per screen informed this
Credo experiment. The shared role definitions are in `content/typography.js`
and are shown at `/design-system`. Tray titles use 18/18
at weight 550, option labels use 15/15 at weight 550, and primary actions
use 18/18 at weight 550. All three roles use title case, including the CTA
label morph. Supporting text uses 14/14 at weight 400. Receipt values use
14/14 at weight 450. Edit shares that size and line height and defaults to
weight 600, with its own dial under Receipt value. The amount display and keypad
retain their dedicated numeric sizes.

Choose amount relies on the tray title. Review uses an inline Edit action in
the amount row, and the shared receipt sits in the same 314 px tray through
confirmation, processing and success. This removes the earlier status resize
that existed to collapse the extra details heading. The CTA morph and the
other tray transition profiles remain in use.

The typography pilot is implemented for review in Credo Motion Lab.

### Preset spacing and receipt type

Family’s [refuel tray sequence](https://60fps.design/shots/family-sequence-of-sheets-vary-in-height-interaction)
shows a compact preset step before the taller custom keypad. Credo's preset
tray uses a 358px surface, 60px tiles and 28px of space above and below the
grid. Continue uses the disabled style until a preset is selected. The preset
panel has room above its resting position during the existing motion, and
the footer remains bottom-anchored. The content mask's footer feather recedes
as presets or the receipt settle, keeping the lowest row fully visible.

Receipt values use a shared role, including the amount, recipient, payment
method and Edit. The visible gap between Edit and the amount is 6px and the
Edit tap area extends left. The Credo palette uses the same blue and coral
stops as the primary action for the Edit text gradient.

The canvas uses DialKit's floating launcher, with the phone centered as the
panel opens. The simulated submission uses the success outcome by default.

### Edit returns to Custom Amount in the same tray

Implemented the approved return plan in `plans/003-review-custom-return.md`.
The receipt fades at its Review position over 65 ms as the same spring
expands the tray. The live amount and caption follow the divider with a
60–135 ms fade. The keypad stays in its bottom-anchored Custom position and
fades as one group over 80 ms after the measured clearance opens. The
Primary Button stays anchored as its label morphs.

The return profile has its own DialKit timeline. In the local 60 fps scrub,
the receipt stayed at y462, the amount appeared by 67 ms, and the first
visible keypad sample at 150 ms fit fully above the footer. At 217 ms the
keypad was at 99% opacity. The button held y586 and full opacity. The
normal-speed flow preserved $12,345.67 through Edit and Success, and preset
Edit preserved $500. The browser also verified keyboard Edit and exiting an
early paused timeline. Controller assertions cover rapid reversal and
reduced motion. Physical iPhone feel is pending.

### Custom Amount and Review share a single editor fade

The next pass addresses the amount and keypad reading as separate pieces.
On Edit, the native amount, caption and keypad stay at their Custom anchors
and use the same 80 ms fade after the divider clears the editor. On Continue,
the editor fades in place over 55 ms before the existing spring contracts.
The live value carries through the fade, including typed trailing zeros.
Both titles share a baseline and use a 110 ms opacity handoff. The primary
button keeps its anchor and label morph.

The local DialKit scrub confirmed matching editor opacities, no visible
clipping, and one title at a time. The editor was at 29% opacity at 167 ms
and 99.9% at 233 ms on Edit. On Continue it was gone before the first
contracting frame. Browser checks covered pausing and resuming the return,
preserving `58.0` across repeated Edit, keyboard entry and simulated
completion. Controller tests cover mid-transition reversal and reduced motion.

### Coordinating the editor fade with the tray

On Edit, the editor starts as soon as its aperture has room. The amount,
caption and keypad travel together by up to 12 px, with the old receipt
fading over 100 ms to shorten the empty beat. On Continue, the spring moves
within the available editor clearance during the 40 ms exit. It carries
that velocity into the rest of the contraction. The receipt enters when
the divider is about 130 px from its resting content. The same-baseline
title handoff now overlaps within an 85 ms window.

In Chrome, the editor was already at 26% opacity at 133 ms on Edit and
fully visible by 200 ms. On Continue, the tray had moved by the first
17 ms sample and the editor cleared together above the footer. The receipt
was visible at 117 ms, 101 px below the divider. Verified a paused-timeline
handoff, repeated Edit and the preserved `58.0` draft. Controller tests
exercise early reversals, keyboard entry and reduced motion. Touch feel
on a physical iPhone remains unverified.

### Overlapping the editor and review as the tray resizes

The earlier clearance gates left both bodies invisible at 100 ms on Continue.
The review title and button had already started to change. Frame review of
Family's Send ↔ Confirm example showed the amount carrying attention while
the keypad and confirmation details overlapped.

The tray now springs directly to its next height. Both bodies follow the
divider and overlap during the resize. The editor amount, caption, and keypad
travel together. The two amount styles fade in their respective layouts.
A short keypad mask softens the last visible digits at the fixed footer,
and the receipt stays crisp. Reversals retain the rendered position, velocity,
and opacities. Keyboard and reduced-motion entry switch the two layouts
immediately.

At the sampled 60 fps frames in both directions, one body stayed at or above
57% opacity. The button stayed fixed throughout. Browser checks covered
Alipay, WechatPay, a $49,999.99 entry, resuming a paused Edit transition,
and simulated completion. Controller tests cover mid-flight reversal,
early confirmation, and reduced motion. The motion is awaiting user review
and has yet to be tried on a physical iPhone.

### One visible amount through Custom Amount and Review

The body overlap removed the empty tray and left two readable copies of the
amount in the same frame. The title briefly faded away, and the primary
button showed fragments of its two labels.

Both directions now use a 145 ms content track with the existing body easing.
The outgoing value stays fully visible as its supporting content fades. At
the track midpoint, the incoming value, title, and complete button label
take over on the same frame. The button action follows that switch. The
amount keeps its existing position in each layout, and the tray still
springs from its current position and velocity. Recipient and payment method
fade in together on Continue. The amount and keypad begin their entrance on
the same frame on Edit.

In the browser's 60 fps scrub, each frame showed one fully visible value,
title, and button label in both directions. The switch fell between the
33 ms and 50 ms samples. The $2,508.0 draft survived closing a paused
timeline and a subsequent live Edit. The simulated transfer completed.
Controller checks sample at 120 fps and cover early reversal, reduced
motion, and keyboard entry. Physical-device feel is pending user review.

### Keep the amount movement close to each layout

The first shared-amount experiment interpolated the two anchors inside the
moving tray. The tray's height change added almost 300 px of vertical travel.
The user rejected the resulting sweep. Family's full-screen reference has
less vertical distance to cover.

The editor now moves within 24 px of its resting position. Its amount scales
from 96% as the caption and keypad fade in with it. The receipt stays within
12 px of its resting position and fades as one unit, including Amount and
Edit. The tray still resizes through its full distance. Opacity follows the
available space in the tray. A keypad mask protects the space occupied by the
fading receipt during the overlap.

Browser scrubbing showed the amount and keypad at 66% opacity at 100 ms on
Edit, with the receipt and Edit both at 15%. The button stayed fixed. Closing
a paused timeline preserved the $2,508.0 draft. The forward flow completed
the simulated transfer. Controller tests cover the movement bounds, reversal,
early confirmation, keyboard entry, and reduced motion. This version is
awaiting the user's feel review on their device.

### Coordinate the receipt, keypad, and labels

User feedback accepted the large amount entrance and flagged the rest of the
transition. Browser scrubbing showed the receipt separating from its title
and the keypad mask holding back the lower rows.

The large amount uses the existing position, scale, and opacity. The receipt
follows the tray with temporary clearance for the editor during the overlap.
Amount and Edit fade with the receipt. All keypad rows share one transform
and fade. The title and button change together using whole labels with a
small shift. Early confirmation starts from the current receipt position
and opacity.

Checked Continue and Edit in the browser using $49,999.99, including the
crossover frames and live simulated completion. The controller tests also
cover early confirmation, reversal, keyboard entry, and reduced motion.
The result is awaiting user review.

### Align the Continue and Edit handoffs

The earlier geometry threshold switched the labels at about 16 ms on
Continue and 95 ms on Edit. The receipt also moved against the tray as its
clearance offset receded. Both directions now share one reversible 176 ms
timeline. The tray begins contracting while the editor is visible on
Continue, and opens far enough for the editor before the same handoff on
Edit. The amount keeps its 24 px movement limit and small scale change.
The receipt clearance recedes over a wider part of the resize, keeping the
receipt's motion in the same direction as the tray. Its contrast settles
with the tray on Continue.

A trial wipe showed fragments of both labels during the scrub. The title
and button now soften briefly and switch as whole labels on a shared
baseline when the new content takes focus. The primary action follows that
switch. Interruptions retain the current pose and decelerate before turning.

In the browser timeline, Continue switched at about 89 ms and Edit at about
87 ms. Reviewed the crossover with $49,999.99 and ran both live directions
with $2,508 through simulated confirmation. Tests cover monotone receipt
motion, the shared timing, reversal, early confirmation and reduced motion.
Physical-device feel is awaiting review.

### Spread the tray travel across the full transition

The user reported a heavy, glitchy feel. Browser scrubbing found that the
176 ms version moved the tray 7 px in the first 50 ms of Continue, then
95 px in one 60 Hz interval. The title and button label also dimmed as they
changed. Scrubbing across the handoff moved keyboard focus to the dialog.

This iteration uses one 208 ms surface curve. The editor and review hand off
when the tray has clearance for the full amount line. The large amount keeps
its local travel and scale. The keypad and receipt each fade as a group.
The title and button switch as whole labels at full contrast, and the
timeline retains keyboard focus during preview.

The browser timeline showed a peak of about 36 px per 60 Hz interval in
both directions. Inspected the crossover with $49,999.99, scrubbed across
the view change with the arrow keys, and completed a simulated transfer
after leaving a paused preview. Controller checks cover the editor's
aperture, reversal, early confirmation, and reduced motion. The new pacing
is awaiting user review on a physical device.

### Rejected: Review as a separate layer — 2026-11-12

A prototype tried Review as a second surface rising out of the primary
button over the amount editor, first as a floating Family-style card and
then as a separate full-width tray. The user rejected both. The card
changed Credo's design. The second tray broke this study's core concept:
one continuous tray that resizes while its content changes. The route was
deleted. Lesson: apply Family's principles inside the existing single tray
rather than copying the structure of a Family screen.

### Experiment: Family handoff inside the single tray — 2026-11-12

**Status:** experiment, off by default. The "Family: Off/On" switch at the
bottom left of `/studies/transfers` (or `?handoff=family`) enables it.
Awaiting the user's feel review. The design, the tray, its omega 32.5
surface spring, and every other transition are unchanged.

**Problem and evidence.** Stepping the current version 25 ms at a time
showed the preset path superimposing the grid and receipt at about 50 ms
in both directions. On the custom path, Continue cut the editor at about
40 ms and then showed an oversized empty tray. Edit grew the tray with the
old receipt for about 150 ms before the keypad appeared over it.

**Decision and scope.** Applied the Family Drawer recipe from the `animate`
skill: one surface whose height changes while its content crossfades with
scale 0.96 and a 2 px blur peak. The surface spring is unchanged.
- Choose Amount ↔ Review: the outgoing body fades in 90 ms; the incoming
  body starts at 40 ms and fades over 150 ms. Both use 0.96 scale, no
  directional shift, and `[.23,1,.32,1]`. This replaces the 1.025
  scale-up and the crisp overlap.
- Custom Amount ↔ Review: no sweep (the user rejected about 300 px of
  amount travel). Each body follows the tray edge only within the approved
  24 px of its resting slot, so the edge covers or uncovers it. Exit 100 ms;
  entry 180 ms after 30 ms. The amount and its caption appear together
  once the amount line clears the header.
- Continue ↔ Confirm Transfer uses the Torph label morph on both paths.

**Verification.** Chrome, paused clock stepped 25 ms. Preset Continue: grid
only at 25 ms, faint blurred handoff at 50 ms, Review settled by 125 ms.
Preset Edit: the same in reverse, with the $200 ring back by 150 ms.
Custom Continue: no hard cut, receipt in its slot by about 75 ms, settled
by 150 ms. A short white gap above the receipt remains around 75 ms while
the spring finishes. Custom Edit: amount and caption appear together at
about 100 ms, settled by 150 ms. Tests (26) cover opt-in profiles, bounded
travel at 120 fps, pose-preserving reversal and switching the variant
off, and the production build passes. Not checked: OS reduced motion in
the browser, a physical iPhone, and the DialKit timeline preview for the
new profiles. The title crossfade still briefly shows both titles,
blurred, at about 50 ms on the custom path.

#### Revision: remove the jumps — 2026-11-12

**User feedback:** with Family on, things bounced and did "weird stuff".
**Evidence:** a per-frame trace of the controller at 120 fps showed the
24 px edge-following rule jumped the editor 24 px down within 25 ms on
Continue, and then drifted the receipt 24 px between about 150 and 300 ms,
after the handoff had finished. Edit mirrored this. A caption-reveal gate
also popped the amount from 0 to 92% opacity in one frame. The preset path
had no direction reversals.
**Change:** both bodies on the custom path now stay exactly at their resting
slots (editor 64 px, receipt 362 px), the reveal gate is removed (the rising
edge uncovers the amount), and the editor pair scales from 0.98 instead
of 0.96. Lesson: in a resizing tray, a body that follows the edge for only
part of the travel reads as a jump plus a late drift; either ride the edge
or stay fixed.
**Verification:** the trace shows constant body positions throughout; the
browser 25 ms steps show no jump or drift in either custom direction. A
brief white band above the arriving receipt remains around 50–100 ms on
Continue. Tests (26) pass. Awaiting the user's feel review.

#### Revision: content rides the resizing tray — 2026-11-12

**User feedback:** much better, but on Custom Amount → Review the rows
appeared at their final position while the tray resized around them; the
content should move with the tray. The user asked for Choose Amount →
Custom Amount, Custom Amount → Review and Edit to be reviewed together.
**Evidence (120 fps trace):** Choose Amount → Custom Amount still used the
original profile. Both bodies were at about half opacity together at 25–50 ms,
the grid scaled up to 1.025 as it left, and the amount slid 64 px relative to
the tray (its compact offset was blended during the transition).
**Change (Family handoff only):** every body now rides the tray's top
edge exactly, like the header. The amount line is attached rigidly (always
64 px above the tray offset). The Family profile now also covers Choose
Amount ↔ Custom Amount: the grid exits in 90 ms at 0.96, and the keypad
enters from 0.98 after 40 ms over 180 ms. On Continue the keypad fades
over 220 ms while it rides down, filling the shrinking tray under the
arriving receipt. Because the amount shares its slot with the receipt rows
and the preset grid, its opacity uses only the upper half of the keypad
weight: it clears by about 25 ms and arrives at about 75 ms, never overlapping.
Lesson (this study): in a resizing tray, either ride the edge rigidly or
stay fixed; content that appears in place while the tray resizes reads as
detached from it.
**Verification:** the trace shows every body's position equal to the tray
offset on every frame, with no relative slide. Browser 25 ms steps for
all three interactions showed no text-on-text, no empty tray, and settling by
about 150 ms. Tests (26) cover riding, the rigid amount, no amount/receipt
overlap, and reversal. The title crossfade still shows both titles,
blurred, for about one frame around 50 ms. Awaiting the user's feel review.

#### Revision: one tray title at a time — 2026-11-12

**User request:** fix the remaining title overlap. **Change (Family handoff
only):** each tray title's opacity uses the upper half of its title weight,
so a title is visible only while it holds the larger share. The outgoing
title clears by about 35 ms and the incoming one starts at about 45 ms, in step
with the body handoff; the 8 px title shift and the small blur remain.
**Verification:** a 120 fps trace of all six amount/custom/review directions
showed zero frames with both titles above 2% opacity. A new test asserts
this for five directions. Browser 25 ms steps on Custom Amount → Review
showed one title per frame. Tests (27) and the production build pass.
Awaiting the user's feel review.

### Equal receipt row spacing — 2026-11-12

**User request (screenshot of Transfer Status):** Amount → Recipient was
looser than Recipient → Pay with; use the Recipient → Pay with spacing.
**Cause:** the Amount row had `min-height: 44px` so Edit was 44 px tall; the
other rows are 32 px. **Change:** all rows are 32 px. Edit is 32 px tall and
keeps its ≥44 px hit area through its existing `::before`. The summary gains
6 px top padding so the first row stays where it was. The receipt tray
(Review, processing, success) is 308 px instead of 314 px, so the gap from
the last row to the button is unchanged.
**Verification (browser, 390 px canvas):** row centres 32 px apart on both
gaps, divider → Amount text 36 px (unchanged), Pay with → button 25 px
(unchanged), Edit hit area 59 px at the current phone scale. Tests (27)
pass. Applies with Family handoff on and off.

### Full-flow review fixes (Family handoff) — 2026-11-12

**User request:** review the whole flow, then implement all fixes.
**Evidence:** a 120 fps trace of 12 transitions, plus browser checks.
Closing (Transfer Sent, ✕, backdrop) hid the tray and backdrop in one
frame, and reopening from Recent transfer appeared in one frame.
Review → Transfer Status showed both titles for 8 frames. The first switch
and method ↔ amount still overlapped titles. Reduced motion overlapped titles
for 8–9 frames. The recent-transfer row appeared behind the backdrop at
Confirm.
**Changes (all behind the Family switch; Off is unchanged):**
- Pointer close slides the tray down by its visible height
  (240 ms, `cubic-bezier(.32,.72,0,1)`) and fades the backdrop (200 ms),
  then closes. Reopening from Recent transfer reverses it (320 ms tray,
  240 ms backdrop). Reduced motion uses a 150 ms opacity fade. Escape and
  Reset stay instant (keyboard/study controls). The tray ignores pointer
  input while closing; leftover animations are cancelled before paint.
- One tray title at a time on every step, including Confirm and the
  approved first switch (its body crossfade is unchanged), and under
  reduced motion.
- The recent-transfer row stays hidden while the tray is open and appears
  as it closes (60 ms delay, 8 px rise, 200/240 ms), with a one-time
  surface-quiet → canvas highlight over 900 ms. This applies the guide's
  "connect progress to its outcome".
**Not changed:** the Torph label fragments mid-morph, and content finishing
about 100 ms before the tray settles. Both were "watch on a device first"
with no measured defect.
**Verification:** the trace shows zero title-overlap frames across all
12 transitions, with and without reduced motion. Browser 40/100/200 ms
steps showed the close slide, the backdrop fade, the activity reveal and the
reopen rise; it ended hidden with no leftover animations or pointer lock.
No console errors. Tests (27) now cover titles in ten directions. Not
checked: physical iPhone, failure/pending results.

### Secondary sending and light success, Family-style (Family handoff) — 2026-11-12

**User request:** after Confirm, the button should become the secondary button
for sending and then succeed the way Family's status pill does (user's
recording of Warning → Analyzing → Safe), with Family-like spinner, check and
smoother text swaps. The user chose Family's light success look (light green,
green label, solid green check) over the solid green success.
**Reference observations (60 fps frame steps of the recording):** each
handoff runs about 230–250 ms, evenly paced. Words swap as words: the
outgoing word fades with a slight blur, the shared word ("Transaction")
slides to its new place, the new word fades in after it. Surface and text
colours blend continuously. The old icon shrinks while the new one grows
into the same slot; the check settles from about 75% to full size.
**Changes (Family on; Off unchanged):**
- New token `feedback/success/fill` #E2F3E6 (green label 4.96:1). The
  design-system Secondary success now uses it with a green label and a solid
  green check with a white tick.
- The transfer button blends continuously with the state weights: gradient
  with white label → secondary fill with blue label (sending) → light green
  with green label (success).
- The spinner follows the label colour (20% track, solid arc), grows in from
  0.6, and shrinks as the check grows into the same slot. The tick still draws on.
- Torph: 300 ms on `cubic-bezier(.25,1,.5,1)` instead of 160–200 ms expo-out
  (which put nearly all movement into the first ~40 ms). Exiting words blur
  to 2 px. The trailing "…" is a separate element that fades with sending,
  so Torph keeps "Transfer" as a shared word instead of morphing
  "Sending" letters across it into "Sent" (seen at 40–120 ms before the fix).
**Verification:** browser 40/80/120/200 ms steps of Confirm → Sending and
Sending → Transfer Sent showed no letter crossing, a continuous colour handoff,
and the spinner → check handoff in one slot. Design-system Secondary success
checked. Tests (27) pass, no console errors. Not checked: physical iPhone,
reduced motion in the browser (Torph respects it; colours still blend).

### Family handoff becomes the only version — 2026-11-12

**User decision:** the Family handoff version is much better; remove the old
one, make this the default and drop the switch. The approved first switch
(options ↔ payment method) and method → amount body motion are unchanged.
**Removed:** the "Family: On/Off" switch and `?handoff=family`. In the
controller: the earlier Custom Amount ↔ Review editor swap (its own clock,
the receipt clearance and keypad nudges, whole-label switching), the earlier
Choose Amount ↔ Review and ↔ Custom Amount profiles (1.025 scale-up, crisp
overlap), and the gradient → solid-green status fill. Earlier sections of
this study that describe those mechanisms are now history, not current
behaviour.
**Fixed while consolidating:** an early Confirm during Custom → Review
squared the receipt's opacity for a frame (an old compensation from the removed swap).
With reduced motion, the amount line now also never overlaps the receipt
or preset text. A quick reversal no longer snaps a hidden body's scale
(about 0.1%).
**Verification:** a per-frame dump of every painted style across 12
transitions and reversals matched the Family version exactly in normal
motion. Under reduced motion, only the amount handoffs differ (the
intended non-overlap fix). Codex's controller test was rewritten for the
current behaviour (riding, rigid amount, secondary sending, light success,
ellipsis, early Confirm, reduced-motion non-overlap). Tests (27) and the
production build pass. A normal-speed browser run of the full flow (custom
amount → Review → Sending → Transfer Sent → close) worked with no console
errors.

### Text swaps without a blank frame — 2026-11-12

**User report:** titles, headings and similar text crossfaded badly. At some
moments the old text had reached 0 opacity before the new text appeared, so
the tray title was empty (screenshot). Category rows did not have this
problem. The user pointed to Family's swaps and the Loyalty text swap as good
examples.

**Evidence:**
- **Family** (user's 60 fps screen recording, Wallet Details / Select Icon /
  Use Emoji trays): "Use Emoji" → "Wallet Details" is an overlapping crossfade
  in one place over about 5–6 frames (≈90 ms). Both titles are at partial
  opacity mid-swap, and there is never a frame without a title. Bodies overlap
  the same way.
- **Loyalty** (user-approved): complementary opacity (`1 − p` / `p`) from a
  shared start over 160 ms. Both rows follow one anchor.
- **China transfer:**
  - Tray titles used `smooth((w − .5) / .5)`, the "one title at a time"
    revision earlier the same day. A controller trace showed about 7 frames at
    120 fps (~58 ms) with combined title opacity under 0.6, on 13 of 14
    transitions (all except processing → success). The 8 px opposing title
    slide also made any overlap read as two offset copies.
  - The Family body handoff (fast exit, 40 ms-delayed entry) dropped the two
    bodies' combined opacity to 0.09–0.38 on amount ↔ custom ↔ review.
  - The amount line used the same upper-half rule.
  - The category rows were already complementary, which is why they looked
    right.

**Change (lib/transfer-motion.mjs; durations and curves unchanged):**
- Titles use their weight directly: complementary opacity on one clock, with
  no opposing slide (`transform: none`). The 2 px blur peak stays as the
  bridge.
- In the separate-exit body handoff, the outgoing body may not fall below
  `1 − incoming`. It still never lingers longer than its own exit, and the
  approved entry timing is unchanged.
- The amount line follows the editor body's opacity.
- Button labels are out of scope; they keep their own animation.

**Lesson (supersedes "one tray title at a time"):** for a swap in one place,
keep the two opacities summing to 1 and share one clock and one position. Keep
the overlap short (about 90–100 ms), and do not separate exit and entry in
time. Exit-before-enter leaves a blank; opposing slides make the overlap
legible as two copies.

**Verification:**
- Controller trace across 14 transitions, normal and reduced motion: the
  minimum combined title opacity is 1.00, with no blank frames. Both titles are
  above 10% for 10–12 frames at 120 fps (83–100 ms). The minimum combined body
  opacity is 1.00.
- Live browser (real taps, 60 Hz sampling), method → amount, amount → custom,
  custom → review and confirm → status: 0 blank title frames, and 4–6 frames
  with both titles. Bodies never dipped.
- Tests updated for the new invariant: 38 pass. The build passes.

**Status:** awaiting the user's feel review.

#### Follow-up from /review-animations — 2026-11-12

**Review finding (verdict Block, small):** after the complementary fix, the
Family handoff's 40 ms `fadeDelay` no longer separated exit from entry. It held
the outgoing body at 100% for about 33 ms after the tap, a response delay. The
body also crossed 50% at 67 ms while the title crossed at 50 ms, because titles
used the default `easeOutQuad` and bodies used the handoff `easeOut`.

**User decision:** apply both fixes.

**Change:** the Family handoff profiles use `fadeDelay: 0`, and the title clock
uses `tween.profile.ease`. Durations are unchanged.

**Verification (controller trace, 120 fps):**
- Amount ↔ custom ↔ review: title and body both cross 50% at 25 ms, and the
  outgoing body starts changing on the tap. The baseline steps are unchanged
  (42/42 ms).
- No blank frames on any of the 14 transitions, with or without reduced
  motion. The two titles overlap for 6 frames (50 ms) on the handoff steps.
- Custom → review keeps its approved 220 ms keypad exit, so the combined body
  opacity there briefly exceeds 1. The invariant is "never below 1".
- Tests: 38 pass, and the build passes.

Not re-checked on a physical device. Awaiting the user's feel review.

### Full-flow /review-animations fixes — 2026-11-12

**Review (verdict Block):**
1. Failure, pending and retry used `contentMove` `[.26,.08,.25,1]` over
   270 ms. The new content was only 12% visible at 33 ms, against 46–73%
   elsewhere, and finished at 242 ms.
2. The tray ran on four content clocks: `easeOutQuad` 130 ms, the handoff
   `easeOut` 150/180 ms, `easeOutExpo` 200 ms and `contentMove` 270 ms.
3. The footer feather rewrote `mask-image` every frame, causing 16–33
   repaints on method → amount, amount → custom and the result steps.

**User decision:** apply all three.

**Change:**
- Every content profile uses `curves.easeOut` `[.23,1,.32,1]`; titles follow
  `profile.ease`.
- Approved durations are kept: first switch 130 ms, handoff 150/180 ms,
  receipt 200 ms. Results and retry now use 180 ms.
- The feather is a 16 px tray-coloured overlay (`.transfer-feather`) moved
  with `transform` and faded with `opacity`. Its position and strength are
  unchanged.
- The unused `contentMove` token was removed. `MOTION.bodyEase` is gone.

**Verification (controller trace, 120 fps):**
- New content is 60–79% visible at 33 ms on every step. Results finish at
  117 ms.
- Mask string changes: 0 on every transition.
- No blank title or body frames on 14 transitions, with or without reduced
  motion. Titles overlap for 5–6 frames.
- Browser: the overlay sits in the content mask at 626 px with opacity 1 on
  the options list (as before), the mask is `none`, and there are no console
  errors.
- Tests: 38 pass, and the build passes.

**Still to check on a device:** panel blur cost on large layers, content
finishing before the tray settles, and Torph label fragments.

**Status:** awaiting the user's feel review.


### Shared components own their type — 2026-11-13

The Credo type for Keypad, Amount display (and caption) and List row moved
from `.transfer-phone` rules in transfers.css into the components. The review
summary now renders the shared **Receipt rows** component, keeping the
`transfer-review-*` classes and the Edit / total markup the motion controller
uses. A 282-element computed-style comparison before and after showed no
difference in this study. Context: [automatic orders](automatic-orders.md).

- **User decision (2026-11-14): tray spacing standard.** The first visible content of a step starts 16 px below the divider (was 20–35 px: rows 24, amount tiles 28, review text 35). `PANEL_TOP` 100 → 96 and `CONTENT_HEADROOM` 88 → 84 (same 12 px headroom); row panels sit 4 px higher for the row's inner padding; the amount panel lost its 8 px top padding; the review summary starts 9 px above the slot so its first label lands on 16 px. View heights shrank by the same amounts (options 370, china 254, amount 346, custom 608, receipt 289, failure/pending 496), so the gap above the button is unchanged (amount 28 px, review 25 px measured). Motion unit (116) and every duration/curve are unchanged. Two tests now derive the custom money offset from `VIEWS.custom.height` instead of assuming 0. Not yet re-checked by eye in motion: amount ↔ review and custom ↔ review handoffs.
- **Fix (2026-11-14):** the tray title is centred on the X (it sat 1 px high).
- **Spacing tokens, phase 2 (2026-11-14):** `PANEL_TOP`, `CONTENT_HEADROOM` and the footer reserve come from `content/spacing.mjs`; the title, divider, content slot, row panels, method row, amount line and button use the `--credo-tray-*` / `--credo-list-*` variables. View heights stay numbers (they follow each view's content). Re-measured: identical.
- **Off-grid values (2026-11-14, user approved):** review Edit↔amount gap 6 → 8 px (`space-2`); currency chip padding 5/8 → 4/8 px. Kept and commented as optical: template copy gap 2 px, Templates heading 1 px.
- **Approved (2026-11-14; value picked by Claude, kept by the user):** Custom Amount's digits start `tray/emphasis-top` (32 px) below the divider (was 22). `MONEY_LIFT` = 64 − (32 − 16 − 6) = 54 replaces the 64 px lift on Custom Amount pairs; the keypad padding follows (+10) and the custom view is 10 px taller (618), so the gap above the button is unchanged (32 px). Failure/pending keep the line under the method row. Amount ↔ Custom and Custom ↔ Review handoffs not yet watched at full speed.
- **Fix after animation review (2026-11-14):** the amount line's emphasis shift is no longer a hard-coded 6 px half-leading in two places. JS lifts the line by `MONEY_REST_GAP` (64, named) and sets `--transfer-money-lift` (0 → 1); CSS adds `--transfer-amount-emphasis-shift` = emphasis-top − content-top − (amount leading − amount size) / 2, and the keypad padding is `--transfer-keypad-gap` (100, named) + the same shift. Measured: digits at 32 px with the default amount type and with the line height tuned to 60 px; amount box → keypad 48 px by default. The Custom Amount tray height stays 618 (it does not follow live tuning).
- **Approved (2026-11-14, after /debug-animation "custom ↔ review feels heavy"; user: "Lighter, keep it"):** diagnosis by frame recording: the fades finish by ~150 ms, but the tray's 329 px move (the longest in the flow) crept its last 10–20 px for ~130 ms on the shared tray spring (ω 32.5), and the first frame could jump ~30% when the tap blocked the page for 20–40 ms (dev build). Change: Custom Amount ↔ Review only uses `EDITOR_OMEGA` = 42. Measured (3 runs each way, from the tap): 90% at 113–125 ms, 97% at 147–159 ms, within 1 px at 208–224 ms (ω 32.5 in theory: 97% ≈ 195 ms, 1 px ≈ 280 ms with the same tap delay). Durations, curves, blur and scale unchanged. Open: start-lurch (tap delay) not yet checked in a production build.
- **Observation (2026-11-14, production build on port 4174):** each step change blocks the tap for 13–23 ms (dev 9–30 ms); the tray's first movement lands 28–33 ms after the tap and jumps 0–12% (ω 42). Cause, measured: `setMode` → `selectTimeline` destroys and rebuilds the DialKit timeline scrubber on every step (≈4,800 DOM mutations, mostly `.dialkit-slider*`), even while the timeline is hidden, and it runs after the spring's clock has started. This is lab tooling, not product motion, but it is in every tap we judge by feel. Not fixed yet.
- **Fix (2026-11-14, user approved):** the DialKit timeline scrubber is rebuilt only while it is shown and the tray is at rest (deferred out of the tap; a running tray schedules it from its last frame), never inside a step change. Production build, 4 runs each way: tap handler 13–23 → 3–7.5 ms, DOM changes per tap ~4,800 → ~90; the tray moves on the next frame. With the timeline open, it still shows the right pair after the tray settles, and frame-stepping (`,` / `.`) still previews. Product motion unchanged. User, after trying it: "Feels much lighter now." Lesson: judge feel with lab tooling out of the tap path; a hidden debug panel cost more than the motion did.
- **User decision → plan 006 (2026-11-16):** "content fades out late and new and old … are overlapping and both seen" on Custom Amount ↔ Review. Measured before: the complementary floor (outgoing ≥ 1 − incoming, the 2026-11-12 rule) kept both bodies above 15% for ~50 ms (peak 0.51 / 0.58), with the amount line over the receipt rows; Continue's exit was 220 ms (longer than the 180 ms entry). Change, this pair only: `coverFloor: false` and `exitMs: 100` both ways; the amount line follows the editor's own exit. Titles, the button morph, the other amount pairs and reduced motion keep the complementary rule. Expected (computed): outgoing below 0.15 by ~33 ms; body sum dips to ~0.75 for ~30 ms while the tray, header, title and button stay fully visible. Verified by the controller test at 120 fps (sum ≥ 0.7; old body < 0.1 from ~42 ms, both directions); live browser recording (real taps, 60 Hz): one frame each way with both bodies above 15% (Continue 0.36 / 0.40 at ~36 ms, then 0.11 / 0.67; Edit 0.21 / 0.54), before 3–4 frames peaking at 0.51 / 0.58; body sum minimum 0.75–0.76; title sum 1.00 on every frame. **User, after trying it: "Much better, keep it" (approved).** Lesson: complementary opacity suits swaps of similar things in one place (titles, rows); for two different layouts in the same space it guarantees a frame of both, so let the old one leave on its own short exit.
- **Fix (2026-11-16, user request):** the tray X now steps back on every step that has a previous one (china, amount, custom, review) and closes only on the first step (options), as in Automatic orders and the navigation-and-closing pattern; its label reads "Back" or "Close transfer". Escape already did this. The behaviour now lives in the Tray component (`onBack` + `onClose`, logic in `lib/tray-close.mjs`, tested), so a flow cannot wire the X differently. Checked: review → custom → amount → china → options → closed.
- **User request (2026-11-16):** the screen behind the tray is now the Credo home screen from Figma ("Home", node 63:3281 in the design-system file), rebuilt in code (`components/TransferHome.jsx`, `components/transfer-home.css`) in English by the user's choice. Its assets are in `public/assets/home/`. The Transfer quick action opens the tray (with the drawer open animation on a tap); the other actions are inert demo content. Status bar text and icons are white over the dark top. Removed the old "International Transfers" page header, Templates and the "Recent transfer" row (the latter reopened a finished transfer's status; Reset study still restarts the flow). Measured against Figma: nav y 53, content 127, cards 191, actions 359, sheet 479, offers 681 (the actions row keeps Figma's 96 px though the English labels fit on one line).

## One motion family — 2026-11-17 (plan 011, built, not yet reviewed)

No China value changed. Tray open and close now call the shared `animateTrayPresence`
(`lib/tray-presence.mjs`), with the same keyframes, durations and curves (checked in the browser:
open 320 ms drawer, close 240 ms drawer, backdrop 240 / 200 ms easeOut). The outgoing-word blur
moved from `.transfer-primary` to every Primary button. Under reduced motion the processing spinner
now turns at half speed instead of stopping. China's tuned handoff pairs are documented as
exceptions to the new `handoffExit` 100 / `handoffEnter` 170 tokens. The receipt still waits for a
tap; making it close by itself was left for the user (plan 011 D1).

