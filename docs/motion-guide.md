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
study demonstrates why a gap between outgoing and incoming content can fail.

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
