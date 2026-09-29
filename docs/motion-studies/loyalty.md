# Loyalty: earning and spending

**Status:** user-approved web prototype, 2026-09-25.
**Route:** `/studies/loyalty`.
**Code:** [LoyaltyStudy.jsx](../../components/LoyaltyStudy.jsx) and
[loyalty.css](../../app/studies/loyalty/loyalty.css).

## Intent and identity

Switch between earning and spending information while keeping the screen easy
to follow. The header, coin, introduction, and footer remain still. The tab pill
communicates selection. Three persistent checkmarks anchor the changing rows.
Both outgoing and incoming text follow those anchors while their opacity swaps.

This is our application of the supplied document's continuity principle.
Checkmarks are persistent objects; the two text layers represent different
content. A brief text crossfade does not require duplicating the checkmarks.

## Approved tuning

| Part | Current setting | Scope |
| --- | --- | --- |
| Tab pill | 240ms; cubic-bezier(.645, .045, .355, 1) | Live pointer/touch selection |
| Text | 160ms for a full swap; cubic-bezier(.25, .46, .45, .94) | Duration shortens for an interrupted fade's remaining opacity distance |
| Checkmarks | Critically damped spring, omega 22.2 | Retains velocity on live reversals; no fixed duration |
| Text position | Each row follows its corresponding marker's current Y | Both text layers share the moving anchor |
| Timeline | 0.42s inspection window; checkmark spring stiffness 493, damping 44.4, mass 1 | Preview configuration; the window is not a required wait for live input |

The user explicitly approved the checkmark motion and the tab/text durations.
Preserve these when fixing unrelated issues unless the user asks to retune them.
The preview and live interaction currently use separate animation paths: edits
in DialKit are preview experiments until deliberately applied to the live code
and checked there. The two spring parameterizations are approximately matched.

## Lessons from the iterations

| Evidence / rejected behavior | Accepted decision | Transferable lesson and limit |
| --- | --- | --- |
| The user disliked the initial checkmark/text entrance treatment. | Keep the checkmarks present and move them to the next row positions. | Persistent anchors can communicate continuity better than replaying an entrance. Relevant when the identity really persists. |
| Slow playback exposed a blank interval during text replacement. | Crossfade simultaneously with complementary opacity and a shared start time. | Avoid an empty handoff in this content swap; do not make exit-before-enter a universal recipe. |
| New text appeared at its final position while checkmarks were still moving. | Position incoming and outgoing text relative to the current marker Y. | Related elements should share the same spatial progress, even when their opacity and travel finish at different times. |
| A paused timeline at about 0.033s could freeze overlapping text when the selected tab was tapped. | Force the live handoff to settle even when the logical tab selection is unchanged. Hiding the timeline also resumes toward a settled state. | Logical selection and visual completion are separate states. Preview controls must return control cleanly. |
| Review found full animation on keyboard selection. | Arrow navigation and keyboard button activation settle immediately. | Match feedback to input mode; this is a project implementation decision informed by the Emil skills. |
| Review found that preview playback bypassed reduced motion and scaled buttons had short hit areas. | Keep text fades with stationary text rows and snapped markers under reduced motion; expand invisible tab hit areas to approximately 44px on screen. | Preview and live paths need equivalent accessibility handling. Measure targets after scaling. |

## Verification and limits

- User feedback: the user approved the feel after these fixes and requested a
  final review, which approved the web prototype.
- Desktop browser checks: rapid tab changes reached the correct state; the
  selected-tab timeline handoff and hiding the timeline settled properly;
  keyboard selection worked; scaled hit areas measured approximately 44px tall.
- Code and a focused reduced-motion rendering check: no intermediate marker
  travel, stationary text rows, complementary fades. This was not an OS-level
  reduced-motion device test.
- Production build passed after the fixes.
- Physical-phone frame rate, high-refresh devices, and React Native behavior
  have not been verified. This study is a web implementation, not a tested
  native component.

## Future changes

Record new evidence here when this study changes. Preserve the distinction
between visual approval, code review, browser checks, and device validation.
Use another study file for a different Credo screen rather than inheriting these
timings automatically.

