# Family and Aave bottom trays for Credo

Research and prototype reference · 11 November 2026

## Family

Benji Taylor's [Family Values](https://benji.org/family-values) documents the iOS wallet's design and motion, with a series of short screen recordings. Three ideas carry through the case study.

| Example | What the interaction communicates | Credo application |
| --- | --- | --- |
| Dynamic trays | A compact, task-specific surface opens in context. Its height and title change as its purpose changes. The leading control changes from dismiss to back as the user goes deeper. | Use one setup surface. Let search expand while a two-option decision stays short. Preserve the draft and make Back undo navigation, including after calendar or terms. |
| Swap approval | The approval surface grows from the action that led to it. The paired demos make the spatial link especially easy to see. | Start the setup from the Add action and keep the payments list visible where space permits. Let the review feel like the next state of the same task. |
| Send and confirmation | The amount keeps its identity through entry and review. Button label changes mark a new level of commitment. Once submitted, motion directs attention to where activity will be found. | Preserve the provider, amount or limit, and CTA position when possible. Change Continue to Activate at the authorization boundary. On success, expose the new rule in the list. |
| Wallet cards, onboarding and grouping | Visible objects travel between states when their identity carries over. Grouping has a readable destination. | Keep the subscriber summary in the same location across timing and amount. The confirmed rule can appear as the first item in the list on return. |
| Selective delight | Frequent entry uses small feedback such as digit formatting. Infrequent milestones can carry stronger emphasis. | Spend expressive motion on the calendar and completion. Keep lookup, terms and OTP quick and predictable. |

The design has a strong hierarchy because each tray takes on a clear job. Short titles, compact icon controls, a quieter supporting layer and a primary action in a predictable place do much of the work. A change in surface height can signal progress, but equal-height states can still feel distinct through content direction and the header. Search with a keyboard and long legal text need usable height and scrolling. Family also uses trays as a starting point for tasks that grow into a full screen. [Case study and embedded clips](https://benji.org/family-values) · [Emil Kowalski's Family-inspired drawer write-up](https://emilkowal.ski/ui/building-a-drawer-component)

## Aave App

Use the consumer savings app as the reference. Alex Vanderzon's portfolio credits Benji Taylor and Austin Valleskey on the homescreen and Day Picker. Austin publishes additional motion samples for Future Mode, chart markers, the Future Scrubber, waitlist and button transitions. The official launch material describes Auto Saver, the recurring-deposit feature, and shows deposit and savings interfaces. [Alex Vanderzon](https://www.alexvanderzon.com/) · [Austin Valleskey](https://www.austinvalleskey.com/) · [Aave App introduction](https://aave.dev/blog/introducing-aave-app-smarter-way-to-save) · [Aave design engineering](https://aave.com/design)

| Reference | Detail to carry forward |
| --- | --- |
| Day of Month | Make the recurring rule tangible. The paper calendar uses a fixed color cap, a horizontal fold, and a reversible flip tied to the scrubber. The final position means the actual last day of the month. Keep a plain-language date alongside the visual. |
| Amount-to-date sequence | Amount and frequency lead into a dedicated day selector. The bottom action stays visually anchored as the panel changes, and the selected day returns to the amount view. |
| Homescreen and deposit | Give the financial value the strongest typography and keep supporting choices compact. Use one distinctive accent per task. Plain language exposes the decision users are making, such as how much and when. |
| Future Mode and Future Scrubber | Show the result of changing a control next to the control itself. For Credo, the schedule and cap are better expressed as an immediately readable payment rule. |
| Button transitions | Treat button press and label changes as part of the interaction. The button remains in a familiar location and the action text describes the next commitment. |

[Day of Month clip, 9.36 s](https://www.austinvalleskey.com/videos/aave-day-of-month.mp4) · [Future Mode clip](https://www.austinvalleskey.com/videos/aave-future-mode.mp4) · [Future Scrubber clip](https://www.austinvalleskey.com/videos/aave-future-scrubber.mp4) · [Button transitions clip](https://www.austinvalleskey.com/videos/aave-button-transitions.mp4) · [Aave product page and screenshots](https://aave.com/app)

The published product visuals show Family's darker transaction context and currency-first send screen, and Aave's large balance, accent color and quieter action rows. These supported the dark Family tray and amount-led Aave variant. [Family launch screenshots](https://family.co/blog/launch) · [Aave App screenshots](https://aave.com/app)

### Evidence and limits

Family observations use the full case study and its clip descriptions, plus the existing Credo transfer study's frame-by-frame analysis of the Family send recording. Aave calendar observations use the Credo calendar study's analysis of the user-supplied 17.01-second recording and the existing implementation. The designer portfolios and live media elements identified the linked recordings. Playback and frame extraction of the newly located public videos could not be completed in this session. The Future Mode and button references are design directions, with no frame-level timing claim.

## What Credo already has

| Existing study | What was adopted | What to reuse here |
| --- | --- | --- |
| China Transfer | One bottom-anchored surface changes height. Header and divider travel together. The method and amount persist through entry, review and results. Credo's 24 px corners, quiet divider, round controls and coral CTA establish the local language. The expanded preset ring and the amount handoff were informed by Family recording frames. | Preserve tray continuity, reuse the local visual hierarchy in variant 1, and reserve prominent color for selection and authorization. |
| Automatic Payments calendar | The calendar adapts the Aave-style fixed cap, folding paper, scrubber and explicit Last Day position. Credo's implementation uses one reversible fold to keep adjacent faces coherent during fast reversals. Thumb, track and page share a continuous position and settle to the same day on release. | Reuse the existing controller and calendar styles, localize the visible strings, and return to the same draft on save. Back from the calendar returns to the previously saved day. |

[China Transfer study](https://credo-motion.vercel.app/studies/transfers) · [China Transfer source Figma](https://www.figma.com/design/j82F8IlyXGFLfyx4RT84iF/Credos-Ugly-screens?node-id=93-10946) · [Automatic Payments calendar study](https://credo-motion.vercel.app/studies/automatic-payments) · [Original automatic payments flow](https://www.figma.com/design/UyXzqOprSwLS2awh5f9IFV/Credo-Fuckscreens?node-id=11-13716)

## How this changes the automatic payment flow

1. Open one picker with saved templates, direct provider search and category browsing. A saved template carries in the subscriber information.
2. Verify a new subscriber and show a compact identity row at the next decision. Provide an edit action in place of carrying forward a disabled input.
3. Choose whether the payment follows a bill or a monthly date. Label a bill-triggered amount as a maximum. Explain that the entire charge is skipped above the limit. Label a scheduled amount as the amount to pay, and show the date or month-end rule separately.
4. Put source account, applicable fee and required agreements together where the user can review the commitment. Calendar, account and terms open within the same flow and return to the same draft.
5. Confirm with OTP and show that the rule was created. Return to the list with the new rule visible.

### Three prototype directions

| Direction | Interaction to compare | Tradeoff |
| --- | --- | --- |
| Credo | Familiar sheet controls and one rule form with conditional fields. | Fast to scan with fewer steps. The rule screen is denser. |
| Family | Short task-specific trays. Choosing a trigger takes the user into that branch, with the subscriber still visible. | Each step is easier to understand at a glance. Editing across steps takes more navigation. |
| Aave | Amount-led rule builder. Timing, account and day appear as compact controls around the value, with a dedicated calendar when tapped. | Keeps the monetary decision prominent. The paired timing control needs clear language to distinguish fixed amounts from limits. |

All three are local simulations. The sample 1 ₾ monthly fee comes from Figma. Consent wording is illustrative, and the prototype does not model existing-debt collection at activation, eligibility restrictions, or what happens to day 29 or 30 in shorter months. Resolve those rules with the PO before writing production authorization copy.
