# My Space: all, savings, and journal

**Status:** push-and-fade iteration now includes the authorized subtle compression experiment; revised feel awaiting user review.
**Route:** `/studies/my-space`.
**Design:** [Figma My Space](https://www.figma.com/design/HCDg7UYvbrW2ClFpC8qugG/Experimenting-shit?node-id=33-1601).
**Reference behavior:** user-supplied My Space recording, 2026-09-25.
**Code:** [MySpaceStudy.jsx](../../components/MySpaceStudy.jsx) and
[my-space.css](../../app/studies/my-space/my-space.css).

## Intent

Move from “ყველა” into “აგროვე” without losing the savings illustration or
“დაიწყე აგროვება” action. These are one persistent content group. The journal
card leaves as the savings surface grows; the header and bottom navigation stay
anchored. The green “სიახლე” treatment in the recording was omitted at the
user's request.

## Current prototype tuning

User authorized the four audit suggestions on 2026-09-25. This authorizes the
implementation, not a claim that the resulting feel is approved.

| Part | Current experiment | Why |
| --- | --- | --- |
| Selection pill | Critical spring, stiffness 1024, damping 64, mass 1 | Roughly 99.6% settled around 240ms; preserves velocity on reversal. |
| Savings surface and content | One critical spring, stiffness 676, damping 52, mass 1; content travels 135px | Roughly 99.6% settled around 300ms; surface and content share progress. |
| Journal card | Translate by `308p` px; opacity `1 - p`; vertical scale `1 - (1 - minimumHeightScale)q` where `q = clamp(p / .55)`; origin top center | Fading follows the full Savings resize in both directions; the 16px gap remains intact. |
| Tab lettering | White duplicate labels clipped to the blue pill's actual bounds | Removes the premature white label on an unselected background. |
| Changed description | 160ms, cubic-bezier(.25, .46, .45, .94) | Preserves the complementary crossfade within the moving content group. |

Live springs follow the analytical critically damped solver convention already
used in Loyalty, with My Space-specific settings. Retargeting keeps velocity;
repeated selection leaves the animation alone. DialKit uses matching spring
parameters and the same geometry/Journal mapping. Its Journal track was removed
because Journal now derives from surface progress. Preview edits remain
experiments until applied to live settings. The versioned preview ID avoids
loading the superseded independent-fade configuration.

Timeline handoff retains the displayed positions and text opacity. A paused
preview resumes with zero velocity. Pausing DialKit is guarded against its
subscription overwriting the live state. Keyboard selection settles immediately.
Reduced motion snaps Savings geometry, keeps Journal translation at zero and scale at one, and retains opacity transitions.

## Superseded approach and observed problem

The first experiment used a 280ms in-out cubic for expansion and an independent
120ms exponential fade plus 12px drift for Journal. The user rejected its feel.
At 0.033s, browser inspection showed savings moved only 2.86px while Journal
was already down to 12.6% opacity. In the revised preview at the same time,
savings moves 29.07px and Journal retains 88.1% opacity. These are observations
of choreography, not performance measurements or proof of user preference.

## Third iteration: push and fade (fade cutoff superseded below)

The user found the stationary Journal fade and Savings covering it unnatural,
and explicitly requested that Savings push Journal downward while it fades,
with Journal rising back into place on return. This supersedes the second
iteration's stationary Journal and occlusion treatment.

Journal now follows the expanding edge, maintaining the original 16px gap until
its opacity reaches zero at 55% expansion. It stops travelling while invisible;
it does not need to slide its entire height offscreen. Both directions use the
same position and opacity mapping from the existing spring, including reversals
and DialKit scrubbing. The content viewport clips movement above bottom navigation.

At 0.033s the inspected preview now shows Journal displaced 66.33px with opacity
0.660, and the full Journal heading stays below Savings rather than being
covered. Scrubbing forward and back returns the same position and opacity.
The production build passed; browser checks covered live category switching,
rapid alternating taps, and returning from a paused timeline. Physical-device
feel and OS reduced-motion behavior remain unverified.

## Compression experiment

The user requested a subtle press effect and approved trying uniform scale
1 → .97 with a top-center origin. Scale follows the same normalized exit
progress as Journal's push and fade, restoring to 1 on return. There is no
additional timer or bounce. This tuning is an experiment, not yet user-approved
for feel and not a universal card-motion rule.

Browser inspection at 0.033s confirmed scale .988254 on both axes, translation
66.33px, opacity .660, and origin (195px, 0px). The production build passed;
paused-preview handoff and live reversal were checked. Reduced motion uses the
existing zero-progress transform branch, suppressing compression and translation.

## Compression control

A persistent DialKit “Journal compression” panel now exposes “Minimum Height Scale” from
0.70 to 1.00 in .01 increments, default .97. The value controls both exit and
return; 1 disables compression. It updates live motion and paused timeline
frames immediately without restarting the spring or changing opacity. This
parameter is live, unlike the timeline's experimental timing edits. Browser
verification changed .97 to .96 at a paused frame and confirmed the corresponding
scale change, then restored .97 and checked live tab switching and the panel's
timeline toggle. The production build passed.

## Height-only correction

The user corrected the compression direction: width should stay fixed and only
height should compress. The earlier uniform-scale experiment is superseded.
Journal now uses `translateY(...) scaleY(...)`, anchored at top center, with X
scale always 1. DialKit's Minimum Height Scale drives both directions and paused
previews, retaining the .97 default and .70–1.00 range. Reduced motion still
suppresses the spatial transform. Text and art participate in the vertical
compression of the card.

## Opacity synchronized to the full resize

The user found Journal's fade poorly timed against Savings resizing in both
directions. Diagnosis: at 0.0667s Savings was 51.7% expanded, but Journal opacity
was already .0103. The cutoff at 55% expansion also withheld Journal on return
until Savings had contracted by 45%.

Opacity now maps directly to `1 - p`, with `p` already eased by the shared
spring. No extra clock or easing is applied. At the same inspected frame,
opacity is .483. Journal translation continues at `308p` instead of stopping
at 169.4px, preserving the 16px gap while it remains visible. This supporting
geometry adjustment avoids Savings covering the newly visible part of Journal.
Compression phase, height control, tab spring, and text fade remain unchanged.
Live reversals use the same mapping; reduced motion retains its short fade.
Production build, intermediate browser frame, preview handoff, and rapid
alternating taps passed. User feel approval and physical-device checks remain
pending.

## Selected height scale

The user selected minimum height scale **0.88**. Applied to the live persistent
DialKit setting and the source default; width stays fixed.

## Preview tap-area correction

The invisible tab hitboxes now expand horizontally as well as vertically using
the displayed-scale compensation. With the timeline open at scale .609, the
first tab measures approximately 44×44px and the second 46.28×44px. Visual chip
sizes and motion are unchanged. Browser measurements and production build passed.

## Mirrored Journal expansion

The user requested the same interaction for All ↔ Journal, with the lower card
pushing the upper card upward. Journal is now an interactive category. Its top
moves upward 264px as its surface grows from 248px to 556px; its illustration,
description, and action stay together and settle at the same content position
as the expanded Savings card. Journal copy is preserved.

Savings moves upward by the same 264px progress and compresses vertically
around its bottom edge (248px), preserving the 16px gap. Its opacity is `1 - p`.
The shared minimum height setting (.88) and the existing spring parameters
apply to the outgoing card in either transition. Direct category switches keep
both card springs' current positions and velocities. The pill uses measured
category bounds and interruptible position/width springs, including the longer
journey to Journal. Horizontal category scrolling keeps selection reachable.

DialKit automatically changes between All → Save and All → Journal when that
category is selected. Returning to All keeps the last transition available for
scrubbing. “Card compression” names the existing shared control. Journal has no
Description timeline track because its sentence does not change.

Verification: production build passed. Browser inspection confirmed Journal's
expanded endpoint and its 0.033s frame: both cards translate upward 56.85px,
Savings scaleY is .9530 and opacity .7847, with X scale 1 and the gap intact.
Checked the original Savings endpoint, rapid cross-category taps, keyboard
return, and handoff from a paused Journal preview; no console errors were
reported. Physical-device and OS reduced-motion checks remain pending.

## Evidence and limits

- The Figma node establishes the “ყველა” layout, typography, card art, chip
  positions, and navigation. Its 20 SVG assets were downloaded locally from the
  design's asset links.
- The recording shows category switching and a near-empty intermediate frame.
  The selected savings layout in this prototype uses the recording as the
  spatial reference because the supplied Figma node depicts “ყველა.”
- Browser inspection confirmed the all and selected savings states and the
  timeline at an intermediate frame. Rapid reversal and the handoff back from
  timeline preview were checked locally.
- The revised iteration passed a production build. Browser checks covered both
  endpoints, the early timeline frame, rapid alternating taps, repeated selection,
  leaving a paused preview, and instant keyboard return. No browser errors were
  reported. The revised feel still awaits user review. Physical device performance,
  OS-level reduced-motion behavior, and React Native equivalence remain
  unverified.

The other visible category chips, CTA labels, and bottom navigation provide
screen context for this focused study. The interactive scope is “ყველა” ↔ “აგროვე” and “ყველა” ↔
“ფინანსების ჟურნალი”, their timelines, and interruption between these categories.


## Journal heading and top-edge refinement

The user authorized the two review suggestions: reduce the heading's long
travel and soften the outgoing Savings illustration at the viewport boundary.
This implementation awaits feedback on feel.

The Journal info icon and label now fade as a single unit between compact and
expanded slots. Both slots counter the Journal parent's upward translation.
The compact slot fades over the first 18% of expansion with an 8px upward hint;
the expanded slot appears over the final 8%, with an 8px settling hint, once
its white surface has reached the upper slot. These thresholds are specific
to this geometry: a first attempt fading the compact label over 42% allowed
it to overlap the rising illustration, so it was shortened. The heading is
quiet during the large movement while the card and illustration remain visible.
Both visual heading copies are hidden from accessibility; the containing
section retains its existing accessible name.

A 24px opacity mask feathers Savings content at the top viewport edge. Its
coordinates compensate for the card's translation and height compression;
the white surface and card edges stay crisp. It is absent when there is no
upward push, including reduced motion. Existing .88 compression, card opacity,
spring settings, and tab behavior are preserved. All new values derive from
the same card progress for live motion and timeline scrubbing.

Verification: production build passed. Browser checks covered both endpoints,
an early frame at .0167s, the softened clipping boundary at .0667s, and heading
arrival at .2s. At .0167s the compact heading opacity was .607186; scrubbing
back returned the same opacity and position. At .2s the upper heading opacity
was .572466 and its surface was already behind it. Checked alternating live
selection, return from a paused preview, keyboard selection, and the Savings
endpoint with scaleY .88 on the outgoing Journal. No browser errors were
reported. Physical-device performance and OS reduced-motion behavior were not
tested; the existing no-travel branches remain in place.

## Persistent top info row (supersedes the two-slot heading fade)

The user rejected the heading disappearing and reappearing. At the reviewed
.10s frame both heading copies had opacity zero; the 18%–92% gap in their
visibility interrupted continuity. The user authorized a persistent top info
icon with an overlapping label change.

The top info row now lives outside both moving cards, on a stationary white
header area with a soft lower edge. Its single icon stays at full opacity and
never receives a transform. Savings and Journal labels share that position and
use complementary opacity (1-p and p) from the Journal spring. The compact
lower Journal heading travels with its card and fades over the first 55% of
expansion. The top icon stays visible throughout this secondary heading exit.
The former expanded heading copy and its delayed arrival were removed.

Reduced-motion selection retains the fixed icon and crossfades the labels over
up to 160ms, proportional to remaining opacity, sampling the current values on
interruption. Keyboard selection remains instant. Reduced-motion timeline
scrubbing uses unrounded progress for the labels while geometry keeps its
existing endpoint mapping. Resize and compression-control updates do not
replace an in-progress label fade. Card springs, .88 compression, surface and
content motion, and the Savings boundary mask are unchanged.

Verification: production build and whitespace checks passed. Browser inspection
at .0167s and .10s found the icon at exactly the same y position (141.717px at
the timeline display scale), opacity 1, and no transform. Label opacities were
.929294/.0707064 and .267385/.732615 respectively. Checked Journal and Savings
endpoints, timeline return, alternating selections, preview-to-live handoff,
and instant keyboard selection. No browser errors were reported. The revised
feel awaits user feedback; OS reduced-motion and physical-device performance
remain unverified.

## Content clearance and label readability

The user annotated the .05s Journal transition: outgoing Savings content
approached the fixed header while two sharp header labels overlapped. The old
Savings mask still referenced the top of the viewport after the header became
stationary. This iteration addresses that overlap; feel awaits user review.

Savings content now fades below the header. At rest the mask is transparent
through y=40 and opaque at y=56, leaving the illustration's resting inset
intact. Over the first 20% of Journal expansion, that boundary extends smoothly
to y=56–80 for breathing room. Coordinates still compensate for translation
and height compression. The white card surface is unaffected.

Header label mixing now occupies 40%–85% of Journal expansion, using the same
spring progress in either direction. The old label shifts upward by up to 8px;
the new one starts 8px below, with complementary opacity. A maximum 2px blur
blends the overlapping glyphs, returning to zero at both endpoints. The 24px
label viewport clips the local movement. This applies animate's small-content
crossfade recipe; the phase and boundary values are specific geometry tuning,
not universal course rules. The icon stays stationary at full opacity.
Reduced motion retains opacity only; keyboard changes reset transforms and
blur immediately. Card motion, tabs, and .88 compression remain unchanged.

Verification: production build passed. At the annotated .05s frame, the old
label now has opacity 1 and no blur, and the new label has opacity 0. At .0833s,
the outgoing Savings copy no longer crowds the label area. Reverse scrubbing
returned the same .05s label values. Checked alternating live selection,
paused-preview handoff, and keyboard selection (no residual blur/transform).
No browser errors were reported. OS reduced-motion and physical-device
performance remain unverified.

## Journal surface merge

The user identified the grey gap remaining near the end of All → Journal,
then disappearing as the view became one white container. Diagnosis: the
16px separation persisted while Savings opacity faded its white surface too.
At the annotated .0862s frame, Savings opacity was .344854. The user authorized
a gradual merge of the backgrounds while retaining the content choreography.

A white backing surface now sits behind both cards. Its opacity is
clamp((journalProgress - .15) / .5): the surfaces start separate and become
fully joined at 65% expansion, before the final settling motion. Its bottom
clip follows Journal's outer edge, 512 → 556px, preserving the lower boundary.
Filling behind the facing corners makes their separation disappear naturally.
The mapping reverses with the same spring, without a separate timer. It stays
invisible throughout All ↔ Savings. Content motion, header, .88 compression,
and existing spring parameters are unchanged.

Reduced motion uses a short opacity fade while geometry snaps; keyboard
selection stays instant. Reduced-motion timeline opacity uses unrounded
progress, and resize/control updates leave active fades intact.

Verification: production build passed. Browser screenshot at .10s showed a
continuous white surface with backing opacity 1. Reverse scrubbing showed
opacity .446354 at .05s and 0 at the All endpoint. The Savings endpoint and
keyboard return also had opacity 0. Checked rapid alternating selections and
timeline-to-live use; no browser errors reported. User feel approval and
physical-device/OS reduced-motion checks remain pending.

## Savings content fade control

Added persistent “Savings Fade Speed” in the renamed “My Space motion” DialKit
panel, range .25–3 in .05 steps, default 1. The existing persistence ID and .88
compression setting are retained. Savings opacity is now separated between its
surface and its content mask: the surface stays at 1-p, while the illustration,
description, and CTA use (1-p)^speed. Larger values fade content earlier;
smaller values retain it longer. Reversal retraces that curve. The existing
header-clearance mask still clips content approaching the fixed heading.
The background merge, card movement, and header timing are not controlled by
this dial. In reduced motion the content fade duration is 160ms / speed.

Control changes repaint paused frames immediately. Browser verification at .05s
changed speed 1 → 2: content opacity changed .626823 → .392907 while surface
opacity stayed .626823. Restored speed 1, checked live preview handoff and
category switching, and left the controls open. Production build passed; no
browser errors reported. Physical-device and OS reduced-motion checks remain
unverified.

## Reduced-motion fade cap

Applied the review's 200ms maximum to Savings content opacity in both the
reduced-motion selection path and DialKit retargeting. The retargeting path
also scales that capped duration by the remaining opacity distance. At speed
.25 the full fade is now 200ms rather than 640ms; speed 1 remains 160ms and
speed 3 remains approximately 53ms. Normal spring-driven opacity and keyboard
instant selection are unchanged. Production build and whitespace checks passed;
OS reduced-motion playback remains unverified.

## Selected Savings fade speed

The user selected **3.00** as the Savings Fade Speed default. Updated the source
initial value, DialKit default, and fallback, and set the existing saved browser
control to 3.00. This supersedes the earlier default of 1. The .25–3 range and
200ms reduced-motion cap are unchanged. Production build passed.

## Direct Savings ↔ Journal content exchange

Implemented the user-authorized proposal after the user approved the info-label
motion but flagged the direct content transition. The old route simultaneously
collapsed Savings and raised Journal through the overview positions, with
unpaired visibility curves. Both expanded endpoints use the same centered slot.

Direct switching now holds a full-height white backing surface and exchanges
the illustration/copy/action as two groups. Complementary opacity shares one
160ms progress value; vertical movement uses 220ms and an 8px directional hint,
with the existing cubic-bezier(.25,.46,.45,.94) family. Reversing targets the
current values. The selected Savings description stays with its outgoing group.
The approved info-label and pill springs retain their existing motion. The .88
compression and Savings Fade Speed 3 remain scoped to overview transitions.

Entering or leaving the direct route while an overview transition is unfinished
uses a temporary correction from the displayed frame, decaying over 220ms.
Fully hidden groups can adopt their entrance position immediately. Keyboard
selection snaps; reduced motion removes content travel and retains paired fades.

Added separate Savings → Journal and Journal → Savings timelines with Pill,
Heading, Fade and Movement tracks. Scrubbing shares the live geometry renderer;
closing the timeline resumes from its displayed values. Returning to All restores
the corresponding overview timeline.

Verification: production build passed. In-browser forward and reverse previews
at .0867s had complementary group opacity .192034/.807966 (reversed on return),
with backing opacity 1, no surface clip, and 8px between group positions. Checked
live rapid reversal, paused-preview handoff, return to All and its timeline, and
keyboard selection (Savings opacity 1, Journal 0, heading blur none at the
endpoint). Browser console reported no errors. Actual-device performance and
OS reduced-motion playback remain unverified. This implementation awaits user
feel review; it is not recorded as user-approved tuning.

## Matching illustration heights

The user approved the direct-switch animation and requested matching illustration
heights. Both original art slots were 96px, but the foreground bounds differed:
Savings y=9.23–94.69, Journal y=5.27–94.60. Added a shared ArtFrame that uniformly
scales each scene to an 86px foreground height, aligned at y=8–94 within the
existing slot. Aspect ratios, text positions, and animation parameters remain
unchanged. Browser measurement at the current phone scale returned approximately
76.27px foreground height for both scenes and the same 7.09px top inset.
Production build passed. This sizing adjustment awaits user visual review.

## Journal spacing in All

Per user request, doubled the compact Journal info-row-to-content gap from 16px
to 32px by moving its full content group down 16px. The offset interpolates out
as Journal expands, keeping its expanded endpoint and direct-switch motion.
Initial CSS matches the rendered All state. Browser measurement confirmed a
32px gap; screenshot confirmed the action remains inside the compact surface.
Production build passed.

## Timeline-only controls

Removed the floating My Space motion controls panel at the user's request.
Minimum height scale .88 and Savings fade speed 3.00 are now fixed values;
the DialKit timeline and its show/hide button remain. Production build passed;
browser reload confirmed the floating panel is absent and the timeline opens.

## Cancel stale overview fades on direct handoff

Fixed the review finding where reduced-motion All → Savings followed by an
instant Journal selection could leave Journal invisible. Entering a direct
transition now cancels the four overview opacity animations and removes their
ownership entries before the direct renderer paints, so stale completion
callbacks cannot overwrite the new state. Approved normal motion is unchanged.

An isolated harness running the actual effect code passed both directions for
keyboard and pointer interruption at 50ms, including simulated stale completion
callbacks. Production build passed and the local browser was refreshed.
OS-level reduced-motion/device playback remains unverified.
