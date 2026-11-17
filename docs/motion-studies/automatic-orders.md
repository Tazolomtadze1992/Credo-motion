# Automatic orders (ავტომატური დავალებები)

Study at `/studies/automatic-orders` · `components/AutomaticOrdersStudy.jsx` ·
`lib/automatic-orders-flow.mjs` · started 2026-11-12.

**Status: experiment, awaiting the user's review.** Nothing here is approved yet.

## Row spacing belongs to the component (2026-11-13)

**User report:** rows on the list screen and in the tray were stacked too
tightly compared with China and the design system.

**Cause:** the rows were `ListRow`, but the 12 px gap between rows lived in
each flow's container (China's `.transfer-rows`, the design system's
`.ds-rows`). This flow's containers had 4 px (tray) or 0 (list screen). The
earlier 56 px row override had hidden that.

**Change:** a `ListRows` container (exported from `ListRow.jsx`,
`.credo-row-list`) owns the standard gap, `--credo-row-gap` = 12 px.
- Automatic orders uses it for every stack of rows: tray lists and both order
  lists.
- The design-system preview uses it.
- China keeps its motion-positioned panels but reads the same variable.
- The landing row's collapse also offsets the gap, so the list doesn't jump
  by 12 px when a new order arrives.

**Verification:** row pitch measured in the browser.
- China: 60 px (48 + 12), with 0 computed-style differences across 282
  elements.
- Automatic orders list screen and tray: 60 px. Design system: 60 px.
- 38 tests pass, and the build passes.

## List screen from the old Credo mockup (2026-11-13)

**User request:** replace the first screen with the old Credo mockup (Figma
`Credo-Fuckscreens`, node 78-9541), using our components where possible.

**Mockup:**
- a back chevron with a centered title;
- a Transfers | Payments segmented control;
- payment rows (logo, name, "monthly" or a yellow "paused" tag, amount,
  chevron; paused amounts greyed);
- a quiet "Add payment" button.

**Built with our components:**
- **Rows:** `ListRow`, with the category icon in the tinted leading circle
  (we have no provider logos) and the amount in its badge slot
  (receipt-value type).
- **Button:** `SecondaryButton`. Its label morphs with Torph:
  "Add payment" ↔ "Add transfer".

**Local, not yet components:**
- the segmented control: a sliding white pill (240 ms `easeOut`);
- the "Paused" tag.

The two lists crossfade in one slot on one clock (170 ms), following the
text-swap lesson.

**Scope:** the transfers list is a static sample, and "Add transfer" is
disabled because only the payment setup is prototyped. `orderSummary` now
returns the amount separately, with two decimals ("up to 50.00 ₾" for bills).
A test covers it.

**Verification:** background-tab checks.
- Rows 48 px; amount 450 14/14.
- Switching tabs swaps the active list, with the button disabled on
  Transfers.
- No console errors. 38 tests pass, and the build passes.
- The segment and list motion were not judged at full speed: the background
  tab pauses transitions.

## Button states move into the shared button (2026-11-13)

**User report (screenshots):** the busy ("Looking up") and done ("Activated")
buttons had a strange outline. The user asked whether this used our button.

**Cause:** it used `PrimaryButton`, but I'd added my own overlay: an opaque
quiet-colour layer over the red gradient, both with the same radius. The
anti-aliased edges blended, leaving a thin gradient outline. (The half-faded
"ed" in the screenshot was just the label morph caught mid-frame.)

**Change:** `PrimaryButton` gets an opt-in `blend` prop.
- With `blend`, the gradient and the quiet/success fill are separate
  full-size layers that crossfade (200 ms opacity, 240 ms colour). The
  outgoing layer fades to 0, so at rest only one fill exists.
- Automatic orders now uses the standard props
  (`blend variant="secondary" busy success`), and its overlay CSS
  (9 lines) is gone.
- China doesn't opt in; its button is driven by its own controller.

**Verification:**
- China: 282-element computed styles show 0 differences, and it still uses
  its gradient.
- Automatic orders, at rest:
  - Find: gradient 1, fill 0, white label;
  - Looking up: gradient 0, fill 1 (quiet), secondary label;
  - Activated: gradient 0, fill 1 (light green), green label.
- A screenshot of the busy state shows a clean edge.
- 37 tests pass, and the build passes.

## Components own their Credo look (2026-11-13)

**User question:** are we using our components as much as we can? Some things
looked different from China.

**Audit (computed styles measured in both flows):** Automatic orders used
Tray, Keypad, Amount display, List row, Primary button and Icon. The
differences had two causes:
- China's final type for those components lived in rules scoped to
  `.transfer-phone`, so other flows got the component defaults: keypad and
  amount line heights, and caption type and grey.
- Automatic orders overrode a few things itself: rows stretched to 56 px,
  receipt rows 40 px apart, and a lighter muted grey for supporting text.

**User decision:** apply fixes 1–3.

**Change:**
1. Keypad, Amount display (with its caption) and List row carry the Credo
   type themselves. They use one longhand per token, with today's values as
   fallbacks, so a screen without tokens (the payment-day study) is unchanged.
   `credoTypographyStyle` now also emits a `-weight` token per role. China's
   scoped copies were removed.
2. Automatic orders' overrides were removed: rows use the component's 48 px,
   and supporting text uses `text/secondary` like China (12 rules).
3. A new **Receipt rows** component (`components/ReceiptRows.jsx`) holds the
   China review layout (label left, value right, 32 px rows, supporting /
   receipt-value type). China's review and this Review both use it, and it
   has a preview on the Components page.

**Verification:**
- China: a 282-element computed-style snapshot before and after showed 0
  style differences.
- Automatic orders: rows 48 px; keypad 24/28; amount 40/52; captions and
  receipt labels in secondary grey at 14/14; receipt values at 14 px / 450 —
  all equal to China's values.
- The Components page preview shows 32 px rows with no console errors.
- 37 tests pass, and the build passes.

**Not done (user chose 1–3):**
- shared busy/success states in Primary Button (each flow still has its own);
- search field, checkbox and code input as components (wait for a second use).

## Shared Tray component again (2026-11-13)

**User report:** the divider looked different from the China tray, and the
user asked whether this flow used our Tray component.

**Cause:** it didn't. The iteration-2 rebuild (tray → full screen) replaced
the shared `Tray` with a custom header. Its divider used `border/subtle`
(#EDEDED) at 80 px. China uses `line/divider` (#F7F7F7) at 79 px.

**Change:** the main surface renders the shared `Tray` (header, title, close,
divider, body, footer) with this study's classes. The divider uses
`line/divider` with 24 px insets, and the header is 79 px + a 1 px divider, as
in China.

**Verification:** measured in the browser against China:
- divider colour `oklch(0.976 0 0)`, 79 px from the tray top, 24 px insets;
- title at 28 px, `550 18px/18px Inter`;
- 40 px close button at 20 px from the top, 24 px from the right.

All match. The tray still resizes per step (picker 626 px, providers 250 px),
and the X steps back. 37 tests pass, and the build passes.

## No back chevrons in trays (2026-11-13)

**User decision:** remove back chevrons from trays entirely.

**Change:** the tray's only control is Family's X. It closes the tray on the
first step and steps back one tray on every later step. It is labelled
"Close" or "Back" to match, and Escape follows it.
- Automatic orders: the chevron and its header shift were removed. The
  side-trip-only split from earlier the same day is superseded.
- Automatic payments (payment day): the chevron is hidden (the element stays
  for the motion controller). The X reads "Back to amount" on Payment day.
  "Payment day" now shares the "Payment amount" spot.
- Because the two payment-day titles now swap in place, their fade became one
  complementary clock (160 ms, no 12 px opposing slides). The old 60 ms exit
  followed by a 60 ms-delayed entry left a blank header. Two tests that pinned
  "one title at a time" now assert the titles always sum to 1.
- China transfer already had no tray chevron (X closes, Escape and Edit go
  back), so it is unchanged.
- Regression fixed (reported by the user with a screenshot): removing the
  chevron's CSS by the `.ao-back` prefix also deleted the `.ao-backdrop`
  rules, so the dim overlay disappeared. The rules were restored, and a
  class-by-class check found no other missing style.

**Verification:** browser checks.
- Automatic orders: no chevron on any step; X = Back on Electricity (it
  returned to the picker) and X = Close on the first step (it closed).
- Payment day: no visible chevron, both titles at the same position, and the
  X returned to Payment amount.
- 37 tests pass, and the build passes.

## Tray controls: X as back only on side trips (2026-11-13)

**User question:** Family's trays use an X where we use a back chevron. Benji's
case study says the one icon closes the first tray or steps back through a
sequence. Is that good UX?

**Answer given:** yes for short, layered trays where nothing is lost. Family
itself morphs X → back chevron in longer multi-step flows. For a 7–8-step setup
with entered data, X-as-back clashes with "X = cancel".

**User decision:** apply the split.

**Change:**
- **Side trips** (`DETOUR_STEPS`: How the limit works, Pay from, Terms) show
  only an X. It steps back one tray, is labelled "Back" for assistive tech,
  and Escape does the same. The title doesn't shift.
- **The setup path** keeps a back chevron plus an X that cancels the setup.
- Not done: the optional X → chevron morph when entering the path from the
  picker.

**Verification:** browser checks.
- "How the limit works" → X returned to "Pay up to" with the flow still open.
- "Pay from" → Escape returned to Review.
- On the path steps, back is shown and the X is labelled Close.
- 38 tests pass, and the build passes.



**User decision:** with the screens simplified, run the whole flow in one tray,
like the China transfer. Several full-screen steps were stretched and empty.

**Change:**
- Every step is a step of the one resizing tray, so each step's content sets
  the height. Measured heights:

  | Step | Height |
  | --- | --- |
  | Picker | 627 px |
  | Providers / rule / Pay from | 251 px |
  | Number with keypad | 629 px |
  | Limit | 605 px |
  | Limit explanation | 321 px |
  | Review | 463 px |
  | Agreements | 379 px |
  | Code | 587 px |

- The transient steps (limit explanation, Pay from, agreements → terms, code)
  are steps in the same tray, not sheets on top, which avoids a tray stacked
  on a tray (rejected in the China study).
- Choosing an account returns to Review through the `go()` review hub.
  "Agree and continue" moves the tray to the code step.
- The full-screen bar, the sheet component and their CSS were removed. The
  iteration-3 screens are unchanged apart from tighter top spacing.

**Verification:** a browser walk-through of picker → providers → number →
found → rule → limit → explanation → limit → review → Pay from → review →
agreements → code → landing, with no console errors. Review → agreements kept
the combined layer and title opacity at or above 1. 37 tests pass, and the
build passes.

**Superseded:** iteration 2's tray → full-screen split. The user judged it
right in principle for long input tasks, but here the simplified steps fit a
tray.



**User feedback (annotated screenshots):** the screens were bloated.
- Too many things were tappable, and it wasn't clear which.
- The Telmico / subscriber header repeated on every step and looked tappable.
- The rule choices were custom cards instead of our List Row.
- The left-aligned titles clashed with the centered amounts.
- Review was crowded with hidden tappable words and an agreements row.
- Agreements → back to Review → Continue → code was a pointless round trip.

The user asked to fix this the way Family / Aave keep screens easy to digest.

**Changes:**
- **Titles:** the step title sits centered in the top bar (back · title ·
  close). The large in-page title and the progress dashes are gone.
- **No persistent subscriber header.** On the number step, the provider name
  sits above the number. After Find, the subscriber's name and address appear
  under it and the button becomes Continue, which removes the "Is this you?"
  step.
- **"When should we pay?"** uses the shared List Row, as China's "How would
  you transfer?" does.
- **Amount steps:** an amount, a single caption only for the limit, and the
  keypad.
- **Review:** plain receipt rows (Provider, Subscriber, Pays, Up to / Amount,
  Monthly fee), plus one List Row for "Pay from" with a chevron. Values aren't
  tappable; Back changes them. Agreements are no longer on Review.
- **Continue opens one sheet:** "Before you activate" lists the three
  agreements, with a terms link and **Agree and continue**. The same sheet then
  becomes "Enter code".
- **Step handoff:** enter and exit share one duration and curve (170 ms,
  `easeOut`, no delay), applying the China text-swap lesson. The old
  100 ms exit / 40 ms-delayed entry left a gap.
- **Fixed:** a crash when reopening after a completed payment (a provider-less
  render of the old Review layer).

**Verification:** a browser walk-through of number → found → rule → limit →
review → agreements → code → landing, and of reopening afterwards. Sampled
during a step change, the combined opacity of the layers and of the bar titles
never fell below 1. 38 tests pass, and the build passes.

**Superseded (user, 2026-11-13):** the agreements must not be pre-checked. Each
consent is an unchecked checkbox, and "Agree and continue" stays disabled
until all three are ticked.



**User feedback on iteration 1:** the motion was "kinda ok". The design was too
text-heavy, and non-clickable containers looked tappable (the user is deferring
design for now). The copy must be English. The user also asked whether running
the whole flow in one tray was right for Family.

**Decision (user said "Yes, rebuild it"):** follow Family's split.
- **Trays** for transient, single-focus moments.
- **Full screen** for longer input tasks.
- **A tray that grows into a full screen** when a quick choice leads into a real
  setup. Evidence: the Family Values text ("trays can also function as the
  starting point for more elaborate flows that ultimately transition to a full
  screen"), the New Wallet → Choose Wallet Group clip, and the full-screen send
  and import flows.

**Structure now:**
- **Picker tray:** templates, search, categories.
- **The same surface grows to full screen** for subscriber number → "Is this
  you?" → when to pay → amount or limit → day → review. A back / progress /
  close bar sits on top. The subscriber stays at the top of every setup step as
  plain text, not a box. Each step has a large title, and keypads are pinned
  above the action.
- **Sheets on top of the setup** for the limit explanation, "Pay from", the
  agreements (with terms) and the code.

Back from the first setup step shrinks the surface back into the tray.

**Motion and fixes:**
- The surface height uses the same tray spring, with a fixed full-screen target.
  Its corner radius squares off over the last 56 px. A frame sample of
  providers → number went from 251 to about 825 px in about 110 ms, and settled
  at 852 px.
- The full bar fades in on a 60 ms delay, and the backdrop fades out under the
  full screen.
- Fixed while testing:
  - the main surface's top margin was leaking into the sheets;
  - the main button label painted over the sheets (stacking). Each surface now
    uses `isolation: isolate`.

The iteration-1 single-tray component was not kept in the project.

## Source and brief

The prototype copy is in English (the user asked for English; the source screens are Georgian). The old flow (Figma `Credo-Fuckscreens`, node 11-13716, another designer's work)
has twelve full-screen steps:
1. a two-choice sheet (template or new provider)
2. categories (as a list and as a grid)
3. providers
4. an almost empty subscriber-number screen
5. the lookup result with "save as template" and a promo code
6. "when to pay?" radio cards that reveal an amount, which is a limit in one branch and a fixed payment in the other
7. account and fee
8. three consent checkboxes, a terms page and an SMS code
9. a green banner on the order list

The user asked how the Family / Aave designers would design it, and then to
prototype that plan. The research came from the Family Values case study, sampled
frames of about 20 of its demo clips, and Austin Valleskey's and Alex Vanderzon's
Aave clips (Day of Month, Future Mode, button transitions). The evidence is frame
samples, not frame-level timing.

## What the prototype does

- **One tray that grows from "+ ახალი დავალება"**: picker (search, saved
  templates, categories) → providers → number → subscriber → rule → limit, or
  amount → day → review → agreements / terms → code → done. Every step has its
  own height; X stays, and Back appears from the second step (Family's
  title-plus-icon rule). Templates skip straight to the rule.
- **A persistent subscriber card** (provider, then subscriber name · number)
  rides the tray from the number step to the review. Its subtitle morphs with
  Torph when the lookup succeeds. This follows Family's rule that "a component
  that persists stays consistent".
- **Plain choices advance on tap** (rule, account, provider). There is no
  radio-plus-continue.
- **The limit is labelled as a maximum**, with an (i) explanation tray (Family's
  "Use Max" pattern). The fixed amount is labelled as the amount to pay. Both
  reuse Amount Display and Keypad. The day uses the payment-day calendar
  controller, with "last day" in Georgian.
- **The review is one sentence with tappable values** (rule/day, amount,
  account). Each edit returns to the same review (`go()` treats review as a hub).
- **Legal is one checklist tray** (Family's ENS "Transfer Options" before
  confirming), with a "select all" and the terms as a taller tray. After the
  user agrees, the review button morphs **გაგრძელება → გააქტიურება** (Family's
  Continue → Confirm).
- **Code entry auto-submits**. The button turns quiet with a spinner, then light
  green with a check. This matches the approved China transfer button.
- **Result where it lives**: the tray closes and the new order opens into the top
  of the list with a one-time highlight, in place of the old green banner.

## Motion (from tokens and the approved transfer handoff)

- Tray height: `springs.tray` (ω 32.5) to the measured content height. A browser
  sample of review → day went 535 → 579 px and settled in about 250 ms.
- Step handoff: outgoing step 100 ms, incoming 170 ms after a 40 ms delay,
  `easeOut`, scale .96 (.98 for keypad steps) and a 2 px blur peak. The title
  crossfades on the same clock. These are the transfer study's approved Family
  handoff values, reused, not re-tuned. Browser frames showed no overlap.
- Presence: `drawer` curve, `trayOpen` / `trayClose`; the backdrop uses `easeOut`.
- Button labels: Torph, `textSwap`.

## Verified

- Browser walk-through of both paths: category → provider → demo number →
  lookup → bill → limit (with explanation) → review → change account →
  agreements (terms, select all) → activate → code → success → landing; and
  template → monthly → amount → last day → review.
- `tests/automatic-orders-flow.test.mjs` (8 tests): navigation and review hub,
  surface assignment, progress per path, number entry, search, and the review
  sentence. The suite passes 38 tests, and the build passes.
- Iteration 2: both paths were scripted in the browser:
  - category → provider → full screen → Back to the tray;
  - demo number → lookup → bill → limit → limit sheet → review → account sheet →
    agreements sheet → Activate → code sheet → landing;
  - template → monthly → amount → day.

**Not verified:**
- reduced motion in the browser
- keyboard-only and screen-reader passes
- a real phone

## Assumptions to confirm with the PO

These are copy and rules in the prototype, not decisions:
- a bill over the limit is skipped entirely
- day 29–31 in shorter months pays on the last day
- the three consents can sit in one checklist tray
- the SMS code is needed per order
- an automatic order replaces "save as template"
- the promo code is dropped
- the 1.00 ₾ monthly fee comes from Figma

Order management (pause, edit, delete with a warning tray) is not built.

## Colour pass: neutral rows (user asked for it on 2026-11-13)

The user said the coloured icon circles and bright tints were tiring. They approved a plan modelled on Family and Aave: colour is kept for identity (logos, avatars), status and the one main action.

- `ListRow` has one neutral leading style for every row: `icon/leading` #646464 on `surface/leading` #F4F4F4 (5.38:1). The purple/blue/mint/gold tones are gone, and `tone` is ignored. This applies to China, Automatic orders and the design system together.
- Logo images (Alipay, WeChat) keep their own colour and get no circle.
- The China pagoda is drawn as a CSS mask, so it takes the neutral icon colour.
- Paused uses grey (`feedback/paused/*`, 5.38:1), not gold.
- The checkbox outline uses `border/control` #808080 (3.95:1; the old #C9CFD1 was 1.58:1).
- The empty number uses `text/placeholder`, and the backdrop uses `overlay/scrim`, the same as China.
- Verified: China's computed styles differ only in the row icon colours and circles. `tests/color-roles.test.mjs` checks the new pairs.
- Open: the user has not yet reviewed the result on screen. Provider logos don't exist yet, so providers use the neutral icon.

## Family-style list screen (2026-11-13; user approved: "Yes, roll it out")

After the neutral pass, the user said the app looked "dead" next to Family. Comparing the Family screenshots showed that Family's neutral is black on white, not grey on grey: row icons are near-black with no circle. Each screen also has one large saturated block (the user's wallet card), and the main action is solid black.

This was tried on the list screen only, scoped in `automatic-orders.css` under "Experiment":
- An account card at the top: one-hue Credo blue, oklch 0.58→0.46. White text is 4.1:1 at the lightest stop and 7.0:1 at the darkest.
- Row icons are `text/strong` with no circle.
- "Add payment" is a solid `text/strong` button with a white label.

Observation: the brand's two-stop primary gradient (blue→coral) goes a muddy brown when stretched over a card, so the card uses a single hue instead.

Rollout (user approved): bare near-black icons are now part of `ListRow` in every flow. `icon/leading` is #171717 (17.9:1 on white), with a 28 px slot and the `leading` icon tier at 24/2. The `surface/leading` circle was removed. Logos and avatars keep a 40 px circle. The account card and the solid button stay on the Automatic orders list.

Still open: the card colours are not tokens yet.

## Reverted: back to tinted rows (2026-11-13, user request)

The user said both the grey pass and the Family-style black pass still looked "dead" and asked for the version from before the colour changes. It is restored:
- Tinted leading circles (purple, blue, mint, gold) with coloured icons in China, Automatic orders and the design system.
- The coloured China pagoda image.
- The gold Paused tag.
- The secondary "Add payment" button.
- The account card and black button are removed.

China's computed styles match the pre-change snapshot exactly (0 differences).

Kept from the colour pass: the checkbox outline uses `border/control` #808080, because the old #C9CFD1 failed 3:1 at 1.58:1. The placeholder and backdrop also stay on their tokens.

Lesson (observation): removing colour from rows made the screens feel lifeless. Family gets its life from things Credo doesn't have yet (a personal identity colour, real logos), not from grey rows.

## Trying brand blue rows (2026-11-13, user's idea, not yet reviewed)

The user proposed matching row icons to the secondary button, to look calmer and on-brand. Every `ListRow` now uses one style, a Credo blue icon in a light blue circle:
- Icon: `icon/leading` #1E6E91.
- Circle: `surface/leading` #E6F1F5. The button's #F4F8F9 is only 1.07:1 against white, so the circle disappeared. #E6F1F5 is 1.15:1, and the icon on it is 4.94:1.
- The China pagoda is a mask again, so it takes the blue.
- Logos keep their colour, and Paused stays amber because it is a status.
- China's computed styles differ only in the row icon colours and circles.

## First step split: Templates or Categories (2026-11-13, user request)

The user found the first tray overwhelming: search, two section headers and six rows. It is now one decision:
- "Templates" (bookmark icon; the "2 saved" subtitle was removed at the user's request) and "Categories" (grid icon), as two `ListRow`s.
- Each opens its own step: `templates` lists the saved templates; `categories` holds the provider search and the four categories, then providers as before.
- The section-header style is removed. The search field has 12 px below it, before the first row.
- Checked in the browser: picker → categories → X (steps back) → templates. Escape was not verified here (the key event did not reach the tray in the test tab).
- Open: search now lives only under Categories. Confirm that's where people expect it.

## Less text (2026-11-13, user requests)

The user removed these, one screen at a time:
- The "2 saved" subtitle on Templates.
- The provider name above the subscriber number.
- The subtitles on the two rule rows.
- The "How it works" link on the limit step, together with its `limitInfo` explanation step. The caption "Bills above this are skipped" stays.

## Review: account field on top (2026-11-13, user request with a reference image)

The user said the "Pay from" list row under the receipt looked poor. They shared a "From · My card" reference: a quiet rounded card with a small card image, a label over the name, the balance, and blue up/down chevrons. They asked for it at the top, with the receipt labels below.
- New shared component `components/AccountField.jsx` with `account-field.css`:
  - fill `action/secondary-button/fill`, 16 px radius, 80 px tall;
  - a 44×28 dark card image;
  - the label in supporting type, and the name and balance at 17 px;
  - chevrons `select` (Lucide ChevronsUpDown) in the secondary label blue;
  - press scale .98.
- Review order: AccountField ("Pay from", Main account, balance), then the receipt rows.
- Checked in the browser: tapping the field opens the account picker.
- Added to the design-system Components page (user approved) with these states: Default, Pressed, Long Name (truncates) and No Balance.

## Real provider logos (2026-11-13, user request)

Companies now show their own logo in the 40 px circle. Categories, which are not companies, keep their icons. Logos are taken from each company's own website and saved as 120 px squares in `public/assets/providers/`:

| Company | Source | Note |
| --- | --- | --- |
| Magti | magticom.ge apple-touch-icon (180 px) | |
| Energo-Pro | energo-pro.ge favicon (180 px) | |
| Tbilisi Energy | te.ge logo.png | swirl mark cropped from the wordmark |
| Telmico | telmico.ge logo_ge.svg | round mark cropped through the viewBox |
| Silknet | silknet.com header SVG | mark path only |
| GWP | gwp.ge GWP-LOGO.png | only 83×32 is published, so it's slightly upscaled and may look soft on retina |

- `PROVIDERS[].logo` names the file, and `Leading` renders it as an image.
- `.ao-logo` adds a 1 px `border/subtle` ring inside the circle, so white logos don't vanish on the white tray.
- Open: logo use is for this internal prototype. Production needs the companies' official assets, and a sharper GWP mark.

## Logos as full circles (2026-11-13, user request)

The user wanted logos to fill the circle with no outline: a logo on white "floats" without one, and a ring looked wrong. Following Family's token icons, every provider is now a full brand-colour circle:

| Company | Circle | Mark |
| --- | --- | --- |
| Magti | its red app icon, as is | |
| Silknet | #0087CD | white |
| Energo-Pro | #153676 | white and its light blue |
| Tbilisi Energy | #262262 | swirl lifted toward white |
| GWP | #00AEEF | white |
| Telmico | its round mark fills the circle | |

- The `.ao-logo` outline is removed.
- These knockout versions are prototype stand-ins. Production should use each company's official app icon.

## Review: Pay from as a receipt row (2026-11-13, user approved)

The user said the AccountField card on the review was too big and broke the alignment. They shared Family's "Review Details", where "Pay with" is a plain receipt row after a divider. The review now matches that:
- Receipt rows, then a 1 px `line/divider`, then a "Pay from" row.
- The value is a 20×13 card chip, "Main account" and a small blue up/down chevron. The button's hit area covers the whole row.
- The balance is no longer on the review; it stays in the account picker.
- Removed "On day 1 of each month" under the day slider. The slider's aria-valuetext still says it.
- Checked in the browser: all six labels start at the same x and all values end at the same x. Tapping the label side opens the account picker.
- AccountField stays in the design system but is unused in flows for now.

## Review polish, step 1–3 of the Family comparison (2026-11-13, user approved)

- **Head row:** a 48 px provider logo, then the name (17/600) over the subscriber number, then the amount on the right ("Up to" or "Each month" over a bold 17 px value). `reviewSummary()` in the flow lib supplies it.
- **Receipt:** now only Pays and Monthly fee, then the divider and Pay from. Provider, subscriber and amount moved to the head row.
- **Rows:** 44 px, with 15 px labels in `text/muted` and 15/500 values. Scoped to `.ao-receipt`; the shared ReceiptRows component is unchanged.
- Checked in the browser: the head, labels and values share the 24 px edges.
- Not done yet: groups with small headers (an Order group with Edit, and a Payment group with Total), and testing a less brown Continue button.

Reverted at the user's request ("undo this"): the review is back to the receipt rows, then the divider and Pay from.

## Agreement checkbox motion (2026-11-13, user request with a Family video)

The reference is Family's "Choose Chains" checkboxes (checkboxes.mov, 60 fps). Frame by frame:
- On tick, a filled shape with the check already inside grows from the centre while fading in. It starts when the finger lifts.
- Diameter: 31%, 54%, 69%, 77%, 92%, then 100% at 17, 33, 50, 67, 83 and 117 ms. No overshoot.

Ours keeps a rounded square, as the user wanted: consent checkboxes are square, and round reads as a selection.
- Tick: `.ao-check__fill` goes from scale 0 to 1 over 200 ms on the `textSwap` curve. That curve and duration were the best fit among the motion tokens, and opacity runs over 140 ms.
- Seeking the transition gives 30%, 52%, 69%, 81%, 88% and 97% at the same times, so the first 50 ms match the video within a few percent; ours settles a little slower after that.
- Untick: back to 0 in 140 ms (ease-out). This is not in the video; it is our choice, faster so it gets out of the way.
- Reduced motion: opacity only.
- Not yet watched live in a visible pane: the preview pane was hidden, so I checked the timing by seeking the transitions.

## Interruptible step handoff (plan 004, 2026-11-13, user asked to implement)

The /improve-animations review found that steps and titles used `@keyframes`, and that a new step deleted any layer still fading out. A quick second tap made a half-faded layer vanish in one frame and a half-arrived one jump to full before fading.

**Change:**
- Each layer has a registered number `--ao-w` (0 hidden, 1 shown) moved by a 170 ms `easeOut` transition. Opacity, the .96/.98 scale and the blur all derive from it.
- The blur now peaks mid-swap with China's formula `8 * w * (1 - w)`, so 2 px at w = .5.
- `nextLayers()` in the flow lib keeps leaving layers and never reorders them. Going back to a step that is still leaving turns the same layer around.
- Leaving layers are dropped on `transitionend`, or by a 260 ms sweep if one left before it was visible.
- `.ao-found` keeps the old `ao-in` keyframe.

**Verified (seeking the transitions in the browser):**
- Categories paused at 60 ms: picker .11, categories .89.
- Tapping back starts from exactly .11 / .89, so nothing snaps. At 85 ms it reads .98 / .02. The sum is always 1, and blur is 2 px at the crossover.
- After it ends, one picker layer remains and the title is back.
- 43 tests pass, including three for `nextLayers`, and the build passes.

**Not checked:** a live feel check at normal speed in a visible pane, reduced motion in the browser, and a physical iPhone.

## China-style tray reveal (plan 005, 2026-11-13, user asked to implement)

**Problems:** while the tray grew, the next step's content showed around and below the button. The tray also resized by writing `height` and `border-radius` every frame, which means layout on every frame.

**Change (China's mechanism, `lib/transfer-motion.mjs:248–261`):**
- The surface is always 788 px and revealed with `clip-path: inset(o 0 0 round r r 0 0)`.
- The header, divider and body ride the edge with `translateY(o)`. The radius formula is unchanged.
- The body is clipped at the footer line, `inset(0 0 o+f 0)`, with a 16 px feather above it like `.transfer-feather`.
- **Deviation from the plan, observed in the browser:** with the line on a spring, content showed about 20 px under the button's top while the button faded in. The line now jumps up at once when a step gains its button and glides down on the tray spring when the button leaves.

**Verified (visible pane, sampled every frame):**
- Providers → number: on every frame where the button is visible, the content ends at least 12 px above it.
- Number → providers: the line follows the fading button down.
- Settled screens match.
- Tapping the dimmed area above the tray hits the backdrop and closes it.
- 43 tests pass, and the build passes.

**Not checked:** a physical iPhone and reduced motion in the browser.

## Close flash fix (2026-11-13, user report with a recording)

The user reported that closing the tray breaks. macOS blocked reading the recording from its temp folder, so this fix is based on the code and a browser check, not on the video.

**Likely cause:** when the close slide finished, the handler cancelled the slide and backdrop animations, which drops their `fill: forwards`, and only then asked React to hide them. That re-render can land a frame later, so the tray (back at translate 0) and the full scrim could flash for one frame.

**Fix:** set `hidden` on `.ao-presence` and `.ao-backdrop` directly before cancelling.

**Verified:** at the moment the animations are cancelled (transform none, scrim opacity 1), both are already hidden. Open and close twice in a row works. 43 tests pass.

**Open:** confirm with the user's recording that this was the break they saw.

## Press feedback and number morph (2026-11-13, from /review-animations, user approved)

The review approved China as is. For Automatic orders it found two gaps.

1. **No press feedback.** Keypad keys and list rows only show their press when the flow sets `data-pointer-pressed`, and only China did that.
   - China's handler moved unchanged into a shared hook, `components/usePointerPress.js`. China now uses the hook.
   - Automatic orders spreads it on `.ao-phone`, so presses get scale .97 over 150 ms on `easeOutQuad`, plus the keypad's quiet key background.
2. **Subscriber number without morph.** The number now morphs its digits like the amount steps (Torph, `digitMorph` 180 ms, `easeOutExpo`, respects reduced motion).

**Verified in the browser:**
- Automatic orders: pressing a row or key sets the attribute, and the key gets its background and .97 scale. Release clears it.
- The number renders through Torph.
- China: press still sets and clears the attribute.
- 43 tests pass, and the build passes.

**Not done (LOW, from the same review):** under reduced motion the segment pill still jumps instead of fading.

## Round selection mark in Pay from (2026-11-13, user request)

The user asked for Family's choose-chains selection mark in Credo blue on the account picker.
- New `SelectMark` in `components/ListRow.jsx`, styled in `list-row.css`: a 24 px circle outlined in 2 px `border/control`.
- When selected, a filled `action/primary/start` (#1E6E91) circle with a white check grows from the centre. It uses the same motion as the agreement checkbox: 200 ms on `textSwap`, and 140 ms ease-out back.
- Round marks mean "pick one"; consent checkboxes stay square.
- It replaces the plain ✓. Chevrons in rows now use `icon/secondary` grey, as in China.
- Checked in the browser: the selected circle is filled blue, the other is a grey outline.
- Design system (user request): the List Row "Selected" state now uses `SelectMark` instead of a plain ✓, and it is live: tapping a row moves the selection, so the grow/shrink can be seen. The spec line reads "chevron, SelectMark or none".
- SelectMark proportions (the user found Family's chunkier and friendlier). Measured in the Family video: a ~26 px circle with a check of ~14 × 9.5 at ~2.6 px. Ours was 24 px with a ~9 × 6 check at 1.75 px. Now: a 26 px circle and a 21 px Lucide check at stroke-width 3, which measures 14 × 9.6 in the browser.
- SelectMark, closer to Family (user request; the brand colour stays):
  - The check is now a custom path traced from the Family video: a longer short arm with the corner just left of centre, and a 2.6 px stroke with round caps and joins.
  - The unselected outline uses the new `border/select` #E0E0E0 (Family's is about #E6E6E6) instead of `border/control` #808080.
  - **Trade-off:** that outline is about 1.3:1 on white, below 3:1. The row label and the filled selected mark carry the meaning, as in Family. Consent checkboxes keep the 3:1 `border/control`.
- The agreement checkbox now is `SelectMark shape="square"`: the same 26 px size, `border/select` outline, Credo blue fill, traced check and motion as the round list mark, with an 8 px radius (user request: the checkmark was too thin and the colours differed). The old `.ao-check__box/__fill` rules were removed.
  - **Trade-off:** the consent outline is now the light #E0E0E0 (about 1.3:1), consistent with the list mark at the user's request. It replaces the earlier 3:1 `border/control` choice.

## Component and token quick fixes (2026-11-13, user approved after an audit)

- **Dead CSS removed:** 28 unused rules (`ao-choice*`, `ao-details*`, `ao-token`, `ao-sentence`, `ao-links`, `ao-agree`, `ao-agreements-row`, `ao-tray*`, `ao-titles--center`), plus the leftover title `transform` transition.
- **Limit caption:** now Amount Display's own `caption`, as in China, centred under the amount.
- **Terms link:** China's inline action (`credo-inline-action` gradient text) in receipt-value type at the edit weight 600, instead of a raw 600 14/20.
- **Subscriber number:** the amount type at the compact size, 34 px / 600 / amount tracking. It was a raw 600 32/40, so the number grew by 2 px.
- **OTP digits:** a new type role `code` (26/26, 600, tabular) in `content/typography.js`, instead of a raw 600 26/1.
- Checked in the browser: computed styles match, and there are no console errors. Tests pass.
- **Build:** the first build failed. The China typography panel (`TransferTypographyPanel.jsx`) needs a slider range for every role, and `code` had none. A `code` range of size 18–36 and leading 18–44 was added; the build now passes. The panel lists the new role.
- **Next (from the audit):** components for the segmented control, page header, card art, search field, code input, phone status bar and home indicator, and a List Row value slot.

## Segmented control and page header become components (2026-11-13, user approved)

- **`components/SegmentedControl.jsx`** with `segmented-control.css`. Its values come unchanged from the Automatic orders list: a 44 px track, a white pill with a soft shadow, option type, and a 240 ms ease-out pill slide with the label colour swap.
  - It now takes any number of segments: the pill is `(100% − 8px) / count` wide and moves by `index × 100%`.
  - Automatic orders uses it with a margin only.
- **`components/PageHeader.jsx`** with `page-header.css`: a 48 px back slot (nav chevron in the secondary blue), a centred title in the Tray title type, and a 48 px end slot. `onBack` makes the chevron a real button.
  - Both China ("International Transfers") and Automatic orders use it.
  - Each screen keeps its own placement class (China: absolute at 53 px with its divider; Automatic orders: 54 px top margin, 56 px tall).
- **Verified:**
  - China's header compared with a computed-style snapshot taken before the change: identical positions and sizes. The only differences are the same #1E6E91 blue reported in another notation, and the inherited colour on two empty slots.
  - Automatic orders: the pill and lists switch correctly.
  - The design-system Components page has both new sections (live: tap the segments), with no console errors.
  - Tests and the build pass.
- **Still to do from the audit:** card art, search field, code input, the phone status bar and home indicator, and a List Row value slot.

## Card art, search field and code input become components (2026-11-13, user approved)

- **`CardArt`** (`components/CardArt.jsx`, `card-art.css`): one CSS card drawing at three sizes, chip 20 × 13, thumb 40 × 26 and field 44 × 28.6, with dark and blue finishes.
  - It replaces the Automatic orders `.ao-card-chip/.ao-card-thumb` and the Account field's own copy.
  - The field size is now 44 × 28.6 with a 6.6 px radius (was 44 × 28 with 5 px).
- **`SearchField`**: values unchanged from the categories step. The clear button appears with text.
- **`CodeInput`**: values unchanged from the code step, including the 180 ms digit pop and the reduced-motion "none". It is display only; the flow's keypad edits the value.
- Automatic orders keeps only the placement margins (`.ao-search`, `.ao-otp`).
- The design-system Components page has three new sections: Search Field and Code Input with states, and Card Art showing all sizes.
- **Verified in the flow:**
  - Search "mag" → Magti, and clear empties it.
  - The Pay from chip is 20 px; the picker shows 2 thumbs.
  - Code after one digit: "1 of 4", box 1 filled, box 2 active.
  - Tests and the build pass.
- **Not seen:** the new design-system sections render client-side, and the hidden browser pane never finished loading any section on that page (all 11 stayed pending, including older ones). They were not viewed.

## Typography tokens everywhere (2026-11-14, user approved after an audit)

- **New type roles** in `content/typography.js`:
  - `body` 14/20 400, for wrapping text;
  - `display` 80/80 700, tracking −0.025, tabular, for the calendar day;
  - `eyebrow` 16/20 600, uppercase, tracking 0.094, for "ON THE".
- `--credo-type-receipt-edit-weight` (600) is now emitted with the other tokens.
- The China typography panel got slider ranges for the new roles (it needs one per role).
- **Payment day:**
  - The day number was 80/700 in **Arial**; it now uses `display`, in Inter.
  - The header uses `eyebrow`, and the last-day variant is derived from `display` (×0.325).
  - "First day / Last day" use `supporting` and `text/muted`. They were 16px in #969696, so they are now 2 px smaller and slightly darker.
- **Elsewhere in the flow:**
  - Terms use `body`, and agreement labels keep `option` with the `body` line height.
  - The subscriber number's line height is the amount leading ×0.85, so 44 px instead of 40.
  - The Terms link and demo chips use the edit weight token. The chips went from a raw 12 px to `supporting` 14 px.
- `payment-stage.css` was trimmed to the rules Automatic orders uses (103 → 49 lines). The rest belonged to the archived study.
- Raw sizes remain only in lab and device chrome: the toolbar buttons, the demo note and the status bar.
- Checked in the browser with computed styles on number, chip, calendar, slider labels, agreements, link and terms. Tests and the build pass.

## Half-pixel shift of row marks (2026-11-14, user report with a Figma measurement)

**Report:** in the Pay from picker the round marks looked about 1 px left of the X above them. The user measured 14 / 16 px gaps in Figma (file "Credo Case study / Design system", node 35-3088).

**Evidence:**
- The layout centres are identical: the X spans 326–366, the marks 333–359, and both centre at 346.
- At 100 % phone scale they also share whole pixels.
- In the user's screenshot the X circle centres at about 406 and the marks at about 404 (at Figma 400 %), so the marks are about one device pixel left.
- This was not reproduced in my browser, where centres differed by about 0.1 px.

**Likely cause (not confirmed in the user's browser):** since plan 004, a settled step kept `transform: scale(1)` and `filter: blur(0px)`. Chrome can draw such an element as its own layer snapped to device pixels, which shifts its contents by up to half a pixel against the header. The X is in the header, outside that layer.

**Change:**
- An arrived step settles to phase `rest` (on `transitionend`, or from the 260 ms sweep, because transition events don't fire in a hidden tab).
- In `idle` / `rest` the layer and title have `transform: none` and `filter: none`.
- Leaving from `rest` is unchanged: `--ao-w` still transitions from 1.

**Verified:**
- A settled step reports transform and filter `none`.
- Going back crossfades from w = 1.
- 36 tests (including a `rest` → `out` case) and the build pass.

**Open:** confirm on the user's screen that the marks now sit under the X.
- **Follow-up (still off on the user's screen, now about 57 / 55 px gaps):** most likely Chrome rounds each box to device pixels on its own at a fractional zoom or scale. The X is a 40 px box; the mark was a 26 px box 7 px inside it, so they rounded differently.
  - **Fix:** the round SelectMark is now a 40 px box, exactly the X's box at 326–366.
  - The 26 px ring (radius 11–13) and the fill (radius 13) are painted as centred radial gradients, and the check SVG fills the same box (viewBox −7 −7 40 40).
  - The square consent mark is unchanged.
  - Verified that the X, ring, fill and check boxes all measure 326 / 40. The grow animation is unchanged (scale on the 40 px fill).
  - The result on the user's screen is still to be confirmed.
- **Resolution (2026-11-14):** the code was rebuilt in the user's Figma file as "Pay from tray (from code, 1x)", node 37:3073. There the X and the marks centre at exactly 346, and in the user's own screenshot the pixel centres match within 0.02 px. So the remaining offset is **optical**: the dark mark with its right-pointing check reads as shifted right next to the pale X circle.
  - **User decision:** nudge the round mark 0.5 px left (`position: relative; left: -0.5px` on the round SelectMark). It is mirrored in the Figma replica and recorded as a Decided rule in the List Row guide.
  - 0.5 px still read as a bit off in the browser; the user asked for **1 px** (2026-11-14). The code, guide rule and Figma replica are updated.

## Chunkier body text, Family-style (2026-11-14, user trying it)

**Problem:** the user found the body copy too thin and hard to read. They compared it with Family on an iPhone 12.

**Family, measured from the user's screenshot (2.37 px/pt):** body about 17 pt on a 24 pt line, regular to medium weight, colour #8F8F8F; headings about 17 pt semibold, #161616. The difference is mostly size and line spacing, not weight.

**Change (experiment):**
- `body` 14/20 400 → **17/24 450**. The terms text uses `text/muted` #707070 (4.9:1), not Family's #8F8F8F (3.3:1, too low), and terms headings stay `text/strong`.
- `supporting` 14/14 400 → **15/20 450**. This affects row subtitles, receipt labels, the amount caption, hints and chips, in China too.
- Agreement labels keep `option` with the `supporting` line height (20).

**Checked:**
- Computed styles in Automatic orders: subtitles, caption and receipt labels are 15/20/450, and terms are 17/24/450 muted.
- Row heights are unchanged.
- China's custom amount caption still clears the keypad, and China's review fits.
- Tests and the build pass.

**Open:** the user's feel review.

- **Receipt hierarchy (user decision, 2026-11-14):** with `supporting` at 15/20/450, the review labels outweighed their values. The user decided that labels and values are both 14 px, with the value one weight heavier and darker.
  - New role `receipt-label`: 14/14 400, text/secondary. `receipt-value` goes 450 → 500.
  - Receipt Rows labels use `receipt-label`, so China's review and Automatic orders change together.
  - Checked on China's review: labels are 14/400 grey, values 14/500 dark.
  - Recorded as a Decided rule in the Receipt Rows guide.

- **Approved (2026-11-14):** the Payment day slider labels ("First day", "Last day") use `receipt-label` (14/14/400) instead of `supporting` (15/20/450). The user's reason: the calendar and slider already explain the control, so the labels are secondary and can be smaller. This applies to labels that support a self-explaining visual, not to supporting text in general.
- **User decision (2026-11-14):** the gap from the last content to the button should be about 24–32 px. The Terms step had a fixed 520 px text box, which left ~236 px empty above "Got it". It now sizes to its text (max 582 px, then scrolls), leaving 24 px. Measured on other steps: number, amount, day and terms 24 px; agreements 28 px; review 32 px.
- **Approved (2026-11-14):** Terms has 40 px from the last paragraph to the button (`.ao-terms` bottom padding 16 px, max-height 566 px). At 24 px it felt "too stacked"; 48 px was tried and the user chose 40 px. Only the Terms step (running text with no clear bottom edge); other steps keep 24–32 px.
- **Fix (2026-11-14):** tray titles were 3 px (Automatic orders) and 1 px (China) above the close button's centre. Both titles now centre their line box on the button centre (40 px), computed from `--credo-type-title-leading`, so a leading change keeps them aligned. Measured: 0 px offset on every step of both flows.
- **User decision (2026-11-14):** tray content starts 16 px below the divider, measured to the first visible edge (Family measured at 12–15 pt from its iPhone screenshots). Implemented with `--ao-content-top` on `.ao-layer`; each step's first element compensates for its own inner offset (row icon 4 px, receipt logo 4 px, text half-leading). Measured: picker, templates, categories, providers, rule, review, account, agreements, terms and code all at 16 px. Emphasis steps unchanged and still differ: number 25, amount 29, payment day 30 px (open question: one shared value).
- **Spacing tokens, phase 2 (2026-11-14):** the tray reads `content/spacing.mjs`: `HEAD`, `FOOTER_SPACE` and `BOTTOM_INSET` come from the tray roles; the header, title, divider, footer, step gutters, content top, row inset and the Terms reading gap use the `--credo-tray-*` / `--credo-list-*` variables. Re-measured every step: identical to before. **Found, not fixed:** the footer button is `inline-block`, so its line adds 4 px below it: the button ends 38 px above the tray bottom (China: 34) and the footer's 16 px gap above it is really 12 px. Fixing it moves the button down 4 px on every step; waiting for the user.
- **Fix (2026-11-14, user approved):** the footer button is now `display: block`. It ends 34 px above the tray bottom (home-inset, same as China) and the footer's 16 px action-gap is real. The space from content to the button grew by 4 px on every step with a button (keypad steps 28 px, review 43, agreements 39 measured box to box). Terms keeps 40 px: its bottom padding is now reading gap − layer padding (12) − action-gap.
- **Spacing tokens, phase 3 (2026-11-14):** shared components (account field, code input, keypad, list row, primary button, receipt rows, search field, segmented control) use `--credo-space-*`; list rows use `--credo-list-row-inset` and `--credo-tray-gutter`; the row list falls back from `--credo-row-gap` to `--credo-list-row-gap`. Computed values checked on every component page: identical. Off-grid values (amount display 6 / 2 px and others in the flows) wait for the user.
- **Off-grid values (2026-11-14, user approved):** amount display number↔currency gap is `.15em` (6 px at 40 px; about 5 px in the compact size); Payment day slider labels 10 → 8 px (`space-2`). Kept and commented as optical adjustments: amount caption 2 px, checkbox −3 px, Pay from chevrons −2 px.
- **Spacing tokens, phase 4 (2026-11-14):** step and panel spacing in both flows uses `--credo-space-*` and the tray roles. `tests/spacing-guard.test.mjs` fails on any raw px margin, padding or gap in the flows or shared components unless it is listed with a reason (17 today: optical, emphasis, page, component); lab controls around the phone are excluded. `scripts/measure-tray-spacing.js` measures the open step in the browser. Both flows re-measured: identical.
- **Approved (2026-11-14; value picked by Claude at the user's request, kept by the user):** `tray/emphasis-top` = 32 px (space-8, twice content-top). Number, Amount/Limit and Payment day now start their big number (or the calendar) 32 px below the divider (were 25, 29, 30). Content→button unchanged (trays size to content).
- **User decision (2026-11-16):** the search field is a fully rounded pill on the secondary button's fill (`action/secondary-button/fill` #F4F8F9) instead of grey `surface/quiet` with 12 px corners; side padding 12 → 16 px so the icon clears the round end. Shared component, so every search field changes.
- **Fix (2026-11-16, user report "search focus/typing state is broken"):** focusing the search field scrolled the whole tray surface 86 px (an `overflow: hidden` box can still be scrolled by focus), hiding the header, and the study's generic `.ao-phone input:focus-visible` outline drew a square box over the pill. `.ao-surface` is now `overflow: clip` (not scrollable), and the generic outline skips the search input (the pill keeps its own 2 px ring). Checked: focus, typing, one result, no results.
- **User decision (2026-11-16):** the search field's icons sit on the list row's 40 px icon columns: search icon centred at 44 px (was 49), clear X at 346 px (was 336), the same line as the chevrons and the tray's X. Padding is `(40 − 18) / 2` left and `(40 − 28) / 2` right; the text starts at 61 px (row titles stay at 76, by choice).
- **User decision (2026-11-16):** row chevrons match the tray's X. The `trailing` icon tier is 24 px with a 2.5 stroke (was 18 / 1.75): the chevron now draws 6×12 px with the same 2.5 px line as the X (9×9 px). Shared tier, so China's rows change too. The Pay from select chevrons moved to a new `inline` tier (18 / 1.75), so they did not grow.
- **Approved (2026-11-16, user asked to apply China plan 006 here; after trying it: "Good, keep it"):** step bodies are different layouts in one space (list, keypad, receipt, checkboxes), and the shared 170 ms complementary crossfade showed both for ~3 frames. The leaving step now clears on its own 100 ms exit (`.ao-layer[data-phase="out"] { transition-duration: 100ms }`); the arriving step keeps 170 ms on easeOut, titles keep the shared 170 ms crossfade, reduced motion keeps the plain crossfade. This supersedes "enter and exit share one duration" for step bodies only. Measured on 11 handoffs (real taps, 60 Hz): frames with both steps above 15% 3 → 1; old step below 15% at 42–74 ms (was 68–100 ms); body sum minimum 0.78–0.79; title sum 1.00 on every frame.

### Agreement checkboxes (2026-11-16)

- Tried centring each checkbox on its whole label (one line or two). The user rejected it ("alignment was bad idea"); the checkbox stays on the label's first line with the −3px optical nudge.
- Kept: labels use `text-wrap: pretty`.
- User request: "Identity check with the Ministry of Internal Affairs" moved to third, so the two one-line consents come first.

- **User decision (2026-11-17, "make all text links 44px tall"):** `.ao-link` (Terms and conditions here,
  and the links in auto lombard) taps at 44 px through an invisible `::before` hit area, as China's Edit
  does. The visible 30 px link and its spacing are unchanged. The link is now only as wide as its text,
  where before it spanned the row.

## One motion family — 2026-11-17 (plan 011, built, not yet reviewed)

The user asked for China transfer, Automatic orders and Auto lombard to become one animation
family and to build the whole plan while they were away. In this flow:

- **Keyboard is instant** (China's rule): Enter on a row, Escape back or closed, and opening from
  "Add payment" with the keyboard change at once, with no handoff, spring or slide. Focus stays in
  the tray after a step change and returns to "Add payment" after a close (both were being lost).
- **Titles hold their position:** opacity and the 2 px blur only (were growing from .96).
- **Activating → Activated** matches China: the spinner grows in from .6 and shrinks as the check
  grows; the tick draws on with it (180 ms); outgoing words blur 2 px. Timing matched to a recording
  of China's button (user: "Yes, match China", 2026-11-17); see plan 011.
- **The button arrives** up 4 px from .98 in 150 ms on easeOutQuad (was 8 px, 240 ms).
- **The new order lands once the tray has closed** (was 120 ms into the close), on the plan's
  recommendation D1. Proposed until the user reviews it.
- Reduced motion: the tray fade is on `ease` (was the drawer curve); the segmented control keeps
  its colour fade while the pill moves at once; spinners slow to half speed instead of stopping.
- Handoff timings read the new `handoffExit` / `handoffEnter` tokens; values unchanged.

