# 007 — Auto lombard: redesign the full path in Credo's design system

- **Written:** 2026-11-16 (the project is not a git repository)
- **Type:** new study (product design + motion), not a fix to existing code
- **Source screens:** Figma `gIAq5vKxLlIdlcyns0aziO`
  - Entry: Products `71:5120` → New product `71:5418` → Loans `71:5101` → Car loans `71:5112`
  - Flow: section `66:4345` (18 frames)
- **Reference:** [Family Values](https://benji.org/family-values), the user's Family screenshots
  (`UyXzqOprSwLS2awh5f9IFV`, node `28:13746`), [docs/family-aave-bottom-trays.md](../docs/family-aave-bottom-trays.md)

## Update 2026-11-16: the whole flow is one tray

After reviewing the screens, the user decided the flow fits our tray style after all: the entry, every
flow step, the guides and the code now run in **one resizing tray** (shared `TrayFlow` mechanics, as in
Automatic orders). This supersedes the full-screen parts below: the Page Header and phase bar in the
flow, the full-screen Result, and motion M1 (tray into full screen) no longer apply. Guides, the term
picker and About insurance are steps in the same stack (X steps back). After the code, the button goes
Sending → Request sent, the tray closes and the request lands on the Loans card. Phase Bar and Result
were removed from the design system; Amount Display's `size="large"` stays for future full screens.

## Why

Every screen on the path uses its own container: tinted tiles on a blue page, white cards with a grey
stroke, blue cards, dashed upload tiles, cards with dividers inside. Shape no longer tells people what
is tappable (the "What you'll need" icons sit in the same circles as tappable rows). The video and
photo uploads share one screen with no explanation of which is needed. The step counter reads "1 / 4"
on every screen.

**What must survive:** the video option and its guide image. The user introduced them; per the user,
80%+ of people now send video and completion rose 45%, because the image explains filming without
reading. The redesign makes the guide more prominent, never less.

## Already settled with the user (2026-11-16)

- The flow itself is **full screens**, not one tray (it is too long). Trays are for short, passing
  content: guides, warnings, OTP, pickers.
- The **VIN guide belongs to the photos path** (the ⓘ on the VIN photo slot), not the video path.
- The user's review of the current screens (their points 1–13): one visual language instead of many
  containers; no heading that repeats the title; Car loans subtitles feel forced; mismatched header
  controls; non-tappable icons must not look tappable; amount results and insurance cards too heavy;
  ID upload has too many dividers, dashed strokes and file-format text; video vs photos must be a
  choice; Loan terms is the best screen but should use the review layout; OTP and results are fine.

Everything else below is **Proposed** until the user decides it.

## Proposed design rules for this flow

1. **One surface.** White page, plain rows. Shape and tint only on things that can be tapped: rows
   with a chevron, select marks, upload slots, buttons.
2. **Information is plain.** Non-tappable lists (what you'll need, loan figures) use bare grey icons
   or no icon, no circle, no box.
3. **One header language.** Page Header: back chevron and centred title. No chat button in this flow
   (user decision 2026-11-16).
4. **The route is shown once, then followed.** The start tray shows the four phases; during the flow
   a thin phase bar continues it. No "1 / 4".
5. **What persists travels.** Amount, term and the button keep their identity between screens instead
   of being redrawn (Family's send flow).

## The new path, screen by screen

Copy is English (project rule). Titles are sentence case.

### Entry (Products tab)

| # | Screen | What it shows | Components |
| --- | --- | --- | --- |
| E1 | **Products** (full screen, tab) | White page, title "Products". The header **+ Add** is removed; the bottom **Request a new product** button stays (user decision). One row per product: icon in the product's own colour (no tinted box), name, balance on the right. | Page title, List Row + trailing value + coloured icon, Secondary Button |
| E2 | **New product** tray, step 1 | Grows out of the **Request a new product** button (Family: trays can emerge from within buttons). Title "New product". Six category rows, no "Products" heading. | Tray, List Rows |
| E3 | Same tray, step 2: **Loans** | Six loan rows. X steps back (decided Tray rule). | Tray, List Rows |
| E4 | Same tray, step 3: **Car loans** | New car, Used car, Auto lombard. Only Auto lombard has a subtitle ("Money against your car"), because the term may be unfamiliar (user decision). | Tray, List Rows |
| E5 | Same tray, step 4: **Before you start** | One line on what auto lombard is, then a plain checklist: ID, the car, good light, camera access. Below it the four phases: Loan · Documents · Car · Confirm. Button: **Start**. | Tray, Checklist (new), Phase map (new), Primary Button |

Tapping **Start** turns the tray into the full-screen flow (motion M1). The old intro screen and "What
you'll need" screen are both replaced by E5.

### Flow (full screens, Page Header + phase bar)

| # | Phase | Screen | What it shows | Components |
| --- | --- | --- | --- | --- |
| F1 | Loan | **How much do you need?** | Amount (500–20,000 ₾) on the keypad; term chips, 6–48 months (demo range, user decision). Under them, plain rows: Monthly payment, Interest rate, Effective rate (all three, user decision). Button **Continue**. | Amount Display, Keypad, Chips (new), Receipt Rows |
| F2 | Loan | **Insurance** | Pick-one list: Aldagi, Imedi L, Euronis. Logo left, 0.78% as the value, round select mark right, all centred vertically. One ⓘ per row opens a short tray about that insurer (replaces "See more"). Choosing one continues immediately (decided Selection rule). | List Row (logo + value + SelectMark), Tray |
| F3 | Documents | **ID card** | Two upload slots side by side: Front, Back. No file-format text. A slot opens the camera or the photo library. ⓘ opens the ID sample tray. | Upload Slot (new), Guide tray |
| F4 | Car | **How do you want to show your car?** | Two large option rows: **Video** (badge "Recommended", "About a minute") and **Photos** ("10 photos"). | List Row large option variant (new variant) |
| F5a | Car | **Video** guide tray | Opens over F4 when Video is chosen. Title "Film your car", the animated guide (M4), three short lines, button **Open camera**. After recording: one video slot with a thumbnail and Retake. | Guide tray, Upload Slot |
| F5b | Car | **Photos** | Ten slots in two groups (Outside 6, Inside 4). Each slot shows a small drawing of its angle instead of relying on a text label. Header count "3 of 10". The VIN slot's ⓘ opens the VIN guide tray. An unusable photo shows its error on the slot itself. | Upload Slot (with angle drawing), Inline error (new), Guide tray |
| F6 | Confirm | **Check your loan** | Receipt rows: Amount, Term, Monthly payment, Interest rate, Effective rate, Insurance, Promo code (inline action). Edit returns here (decided rule). Button **Continue**. | Receipt Rows, Primary Button |
| F7 | Confirm | **Terms** | Terms text, then the 5 consents (square marks, unticked, button off until all ticked; decided Selection rules). Button morphs **Continue → Send request** (M3). | Consent list (promoted), Primary Button |
| F8 | Confirm | **OTP** tray | Code input and keypad, as in Automatic orders. | Tray, Code Input, Keypad |
| F9 | — | **Result** | Success: "Request sent", one line about the SMS, **Done**. Error: "Something went wrong", **Try again** / **Help**. On Done, return to Products with the new request as a pending row (M5). | Result (new) |

## Components

### Reuse as they are

Primary Button, Secondary Button, Keypad, Amount Display, Code Input, Tray, Receipt Rows, SelectMark,
Page Header (back + title), List Rows (12 px gap).

### Extend (existing component, new option)

| Component | Extension | Why |
| --- | --- | --- |
| List Row | `trailing` value style (amount/percent on the right, receipt value type) | Products balances, insurer rate. `trailing` already accepts a node; this adds the shared style. |
| List Row | Leading icon in a per-product colour (today every leading circle is Credo blue) | Products keeps its colour in the icon only (user decision). |
| List Row | Logo leading vertically centred with a trailing SelectMark | Insurance (user point 8). |
| List Row | `plain` leading: bare grey icon, no circle, non-interactive | Checklist; user point 6 (circles read as tappable). |
| List Row | Large option variant: taller row, title + one-line subtitle + existing `badge` | Video or photos (F4). |
| Page Header | Optional phase bar below the header | Rule 4. |
| Chips | Promote term chips to a shared component (China's presets are tiles, local to that study) | F1. |
| Consent list | Promote `.ao-check` from Automatic orders to a shared component | F7; same rules already decided. |

### New (each needs the user's decision before it is added to the design system)

| Component | States | Used in |
| --- | --- | --- |
| **Upload Slot** | empty (angle drawing or icon + label), uploading (progress), done (thumbnail + remove/retake), error (message on the slot) | F3, F5a, F5b |
| **Phase bar / Phase map** | map: the four phases listed in E5; bar: four segments, current one filled, phase name | E5, F1–F7 |
| **Checklist** | plain icon + one line, non-interactive (may simply be List Row `plain`) | E5, guide trays |
| **Inline error** | text under or on the element it describes, error colour | F5b, F3 |
| **Result** | success, error; icon, title, one line, one or two actions | F9 |
| **Guide tray** (pattern, not a component) | illustration on top, title, up to three short lines, one action | Video, VIN, ID sample, insurer info |

## Motion

| # | Moment | Intent | Notes |
| --- | --- | --- | --- |
| M1 | Tray → full screen on **Start** | Family: "trays can be the starting point for flows that transition to full screen". The person sees the flow grow out of where they were. | New study. Exemplar for an object growing into a view: My Space (`/studies/my-space`). Exit/back must reverse it. |
| M2 | Amount and term travel F1 → F6 | Confidence that the reviewed amount is the entered one (Family send flow). | Reuse the China amount handoff thinking; F6 is a new screen, so this is a shared-element move between screens. |
| M3 | Button label morph | **Continue → Send request** at the commitment point; photo count on the button. | Primary Button's existing label swap. |
| M4 | Animated video guide | The rarest, most important moment gets the delight (Family's delight-impact curve): the camera marker travels around the car along the arrow, then rests. | Loop at most twice, then rest. Reduced motion: the still image. Needs the user's image split into layers (car, path, marker). |
| M5 | Result → Products | Show where the request lives (Family's spinner into the tab bar). | The pending row appears in Products. |

Everything else stays quiet: decided press feedback (.97), tray step crossfade, select-mark growth.

## Build order

1. **Static screens, no new motion.** Study at `/studies/auto-lombard` (component `AutoLombardStudy.jsx`,
   flow logic in `lib/auto-lombard-flow.mjs`, styles in `app/studies/auto-lombard/auto-lombard.css`, an
   entry in `content/studies.js`). Build the List Row and Page Header extensions and the new components
   with the design-system pages (`app/design-system/components/registry.js` + `guides.jsx`). Use
   spacing tokens; add guard exceptions only with a reason.
2. **User review of the static screens** in the browser. Decide the Proposed rules and components.
3. **Motion**, one at a time, each with its own plan if needed: M3, M2, M1, M4, M5.
4. **Notes:** study notes in `docs/motion-studies/auto-lombard.md`; Decided rules into `content/patterns.js`
   only after the user decides them.

## Assets needed

- The video guide image (exists) — for M4, a layered version: car, dashed path, camera marker.
- The VIN guide image (exists) and an ID sample (exists, with lorem text to replace).
- Ten small angle drawings for the photo slots: simple outline placeholders in the prototype; the user
  may make final ones later (user decision).
- Insurer logos (exist in Figma).

## Answered by the user (2026-11-16)

1. Products keeps the **bottom "Request a new product" button**; the header + Add goes.
2. Car loans: a subtitle on the **Auto lombard row only**.
3. Photo slot drawings: **placeholders first**.
4. Chat: **dropped** from the flow header.
5. Products colours: **in the icon only**, no tinted tiles.
6. Amount screen: **all three figures**; term chips **6–48 months** (demo data).

## Out of scope

- Real camera, upload and validation logic: the prototype simulates capture with sample images.
- Georgian copy (prototype is English).
- Other loan types reached from the same trays (rows can be inert).

## Verification

- Every screen in the path matches the rules above: no box around non-tappable content, one header
  language, no repeated headings.
- `npm test` and `npx next build` pass; the spacing guard has a reason for every raw value.
- The user reviews the static screens before any motion work (step 2).
- Motion moments are recorded and scrubbed frame by frame, as in plans 001–006.
