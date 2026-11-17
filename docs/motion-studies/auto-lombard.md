# Auto lombard

Route: `/studies/auto-lombard` · Plan: [007](../../plans/007-auto-lombard-redesign.md) · Source: Figma
`gIAq5vKxLlIdlcyns0aziO` (flow `66:4345`; entry `71:5120`, `71:5418`, `71:5101`, `71:5112`)

## Background (the user's case study)

The current Credo flow asked for 10 photos of the car. The user added a video option (as TBC and BOG
do) with an AI-made guide image showing how to film, because most people don't read instructions. Per
the user, 80%+ now send video and completion rose 45%. They made a similar numbered image for the VIN.
The redesign keeps both images and makes the video guide more prominent.

## Step 1: static screens (2026-11-16)

Built in English with the shared components. No new motion yet: Start swaps from the tray to the
full-screen flow instantly, and flow screens change without a transition.

**User decisions this build follows (2026-11-16):**
- The flow is full screens; trays only for short content (entry, guides, OTP).
- VIN guide only on the photos path.
- Products keeps the bottom "Request a new product" button; the header + Add is gone.
- Only the Auto lombard row has a subtitle.
- Photo slots use placeholders first.
- Chat is dropped from the flow header.
- Product colour lives in the icon only.
- The amount screen shows all three figures; terms are 6–48 months (demo).

**Built (Proposed until the user reviews):**
- Entry tray from the Products button: New product → Loans and installments → Car loans → Before you
  start (plain checklist and the four-phase route map) → Start.
- Flow: Loan amount (keypad, term chips, payment and rates) → Insurance (pick one, returns at once) →
  Registration certificate (front, back) → Show your car (Video, recommended / Photos) → Car video or
  Car photos → Check your loan (Edit returns to the review) → Terms (5 consents) → code tray →
  Request sent → Products with an "Under review" row.
- The footer button is one persistent button; its label morphs between screens (Continue → Send
  request, and "3 of 10 photos" on the photos screen) with the existing TextMorph swap.
- New shared components: Upload Slot, Phase Bar, Chips, Result. Consent List moved out of Automatic
  orders. List Row gained `accent`, `plain`, `value` and `size="large"`; Page Header gained
  `back={false}`. The tray mechanics moved from Automatic orders to `components/TrayFlow.jsx`
  (unchanged; its classes keep the ao- prefix, so this study imports automatic-orders.css).

**Observations (from building it, not user decisions):**
- The Figma "ტექ. პასპორტი" sample is the vehicle registration certificate, not a personal ID, so the
  documents step is "Registration certificate".
- Insurer logos follow the decided rule: the logo fills the circle, no outline. Aldagi's white logo has
  no visible edge on white as a result.
- Product icon colours were darkened from the Figma tiles to keep 3:1 on their circles (test added).
- Checked in the browser with real clicks: both paths end to end (video and photos), the engine error
  state, the VIN and video guide trays, Edit from the review, consents gating Send request, the code,
  and the pending row in Products. Automatic orders still opens its tray after the move.

**Not done yet:** motion moments M1–M5 (tray into full screen, amount travelling to the review, the
animated video guide, result handoff); angle drawings for the photo slots; an error result path in
the demo.

## Open questions

- Does the phase bar need the phase name under it in the flow, or is the screen title enough?
- Non-prototyped rows in the entry tray (other categories, loans and car loans) are tappable but do
  nothing.

## User review of step 1 (2026-11-16)

User feedback, verbatim in spirit: Products "looks awful"; Before you start "looks dead"; Loan amount has
"too much happening" (big number, pills, labels and percentages, keypad); overall "soulless", while
Family's similar pages are "clean and full of life". Asked how to reach Family level, with Alex
Vanderzon's Family and Aave clips as reference.

Observations from those clips (not yet decisions):
- Aave "Add Money" tray: big amount, one segmented control, keypad, Continue. Nothing else.
- Aave home: one huge number as the hero; everything else is small and quiet; one accent colour.
- Family Wallets: objects with identity (each wallet a coloured card with its own emoji or photo;
  people as large avatars), not icon rows. Activity: every row has a real image; bold section headings.
- Family detail tray: the object itself as a large hero, then a short receipt.

## Rebuild of three screens (2026-11-16, user: "Yes, rebuild them")

Applied the Family / Aave observations above to the three screens the user called out. Proposed until
the user reviews them.
- **Products:** one hero (Total balance, Aave-size number, a green "earned this month" line). Cards are
  shown as the cards themselves (Card Art `tile` size, new `coral` finish), scrolling sideways. Other
  products are plain rows whose leading ring shows their state (deposit matured, loan repaid, limit
  used) around a Credo blue icon. No tinted circles or product colours: this replaces the earlier
  "colour in the icon only" choice, because the user called the screen awful and said they are not a
  fan of the colourful treatment. The List Row `accent` option, the product tone colours and their
  contrast test were removed with it.
- **Before you start:** the car is the hero (a cleaned crop of the user's video-guide illustration:
  red circle and arrow removed by inpainting; a placeholder until the user makes a proper hero image),
  a bold title and one line, then three things with Credo blue icons that arrive one after another
  (60 ms apart; opacity only under reduced motion). The phase map is gone from this tray.
- **Loan amount:** Aave's Add Money order: the amount, one quiet line under it (≈ monthly payment,
  morphing as you type; the allowed range when empty; the maximum in error colour when exceeded), one
  "12 months ⇕" control that opens a Term tray (pick one, each with its monthly payment, returns at
  once), then the keypad at the bottom. The rates moved to the review. The in-app keypad stays (Family
  and Aave both use one; the iPhone keyboard would cover half the screen).
- Chips was removed from the design system: the term is now a picker.

Checked in the browser with real clicks: Products, the tray to Before you start, typing 5,000, the
monthly line, choosing 24 months in the Term tray.

## Second review (2026-11-16)

User: Products is a list of product types, not balances and cards ("we don't need cards and balance
here"); they want colourful cards like Family's wallets (screenshot). "Before you start" text was not
understandable, the heading and subheading said different things, and the icons looked cheap; they
proposed a tray titled "You will need" with the three things. The amount screen idea is liked, but the
big number feels too small.

Done:
- **Products:** a 2-column grid of solid colourful cards, one per product type (white icon top-left,
  name and balance at the bottom), in the same order as before. Colours are new Proposed roles
  `product/*`, deeper than Family's hues so white text keeps 4.5:1 (test added). The New product tray
  uses the same colours as solid dots (Family's New wallet tray). Hero total, card art and rings were
  removed, and Card Art's tile/coral additions reverted.
- **You will need:** the tray title says what it is; each item has a custom flat illustration
  (`components/LombardArt.jsx`: certificate, car in sunlight, phone camera), a title and one line on
  why. The car hero, heading and subheading are gone.
- **Amount size:** not changed yet. Every flow uses the shared amount type (40 px): China, Automatic
  orders and this screen. Open question for the user: raise it everywhere, or only on full screens.

## Third review (2026-11-16)

User: Products "still awful": cards bad, content crammed, colours weird, icons bad. The "You will need"
illustrations were wrong: they meant simple illustrations like Family's (screen recording of Family's
Import / Add an Existing Wallet flow).

Observed in the recording and Family's Wallets screenshot (not decisions):
- Family's hero illustrations are one flat card shape in a single bright colour, a pale circle and pill
  on it, rising out of a grey band that crops it, with a dark round badge carrying the action icon.
  Option rows use solid round icons with a white glyph.
- Wallet cards: bright single colours, a solid white glyph top-left, a one-line name and the value at
  the bottom, empty space between.

Done:
- **Products cards:** bright Family-like colours (`product/*` retuned: blue, green, coral, orange,
  teal, ink), filled white glyphs (`components/ProductGlyph.jsx`), one-line short names (Accounts,
  Loans, Deposits, Credit card, Installments, Insurance; trays keep the full names), 104 px cards,
  20 px radius. Trade-off: bold white labels are at least 3:1, not 4.5:1, to keep the bright look
  (test changed accordingly); flag for review with 40+ users.
- **You will need:** Family's flat hero (a grey band, a Credo blue card with a coral one behind, a dark
  camera badge), then three rows with solid Credo blue round icons, title and one line. The detailed
  SVG drawings (`LombardArt`) were removed.
- User request: more air between the glyph and the name. Cards are now 120 px tall (was 104), so the
  glyph-to-name gap went from about 13 px to about 29 px (measured in the browser). Card names use the
  option type (15 px) at weight 650; the shared option token is 550.
- User decision: the amount is bigger on full screens only. Amount Display gained `size="large"`
  (Proposed value: 1.4× the amount type, 56 px on a 72 px line); the loan amount screen uses it, trays
  (China, Automatic orders) keep 40 px. Measured: 56 px; "20,000" is 239 px wide in the 342 px column.
- User request: card names back to the option token's weight (550, was 650). Balances use the
  receipt-label token (14 px, 400) at 78% opacity.
- User: the abstract card hero "does not tell me anything". Replaced with the flow's object drawn
  Family-flat: a bright blue car (product/blue, ink wheels, pale windows) on the grey band, with the dark
  camera badge for the action (film or photograph it). Checked in the browser.
- User decision: no illustration in the You will need tray (it repeated the rows and took ~150 px).
  The tray is the three rows and Start; the video guide stays the flow's one illustration.

## The whole flow in one tray (2026-11-16)

User decision: the flow can be done in our tray style. The full-screen flow was replaced by one
resizing tray built on the shared TrayFlow mechanics and the Automatic orders step styles (ao-rows,
ao-amount, ao-keypad, ao-receipt, ao-link, ao-otp), with only new parts prefixed al-:
- Steps: New product → Loans and installments → Car loans → You will need → Loan amount (Term is a
  step; picking returns) → Insurance (About insurance is a step) → Registration certificate (Example is
  a step) → Show your car → Film your car → Car video, or Car photos (Where to find the VIN is a step) →
  Check your loan → Terms → Enter the code. X closes on the first step and steps back after that.
- Photos use a 3-column grid of 72 px slots so all ten, with the error line, fit the tray.
- The amount keeps the default 40 px inside the tray (the bigger size is for full screens only).
- No phase bar: the tray's height change and the titles carry progress, as in China and Automatic
  orders. After the code, the button goes Sending → Request sent, the tray closes and "Under review"
  appears on the Loans card.
- Phase Bar and Result were removed from the design system (unused). A decided tray-flows rule records
  that a long flow can still be one tray when each step is one decision.
- Checked in the browser with real clicks: both paths end to end (photos with the engine error and
  demo fill; video through the film guide), review, consents gating Send request, the code, and the
  landing on Products.
- User: the icons changed style from step to step (colourful dots, blue circles, solid blue dots).
  Every tray row now uses the decided List row style (light blue circle, Credo blue icon), including
  New product and You will need; product colour lives only on the Products cards.

## New product: option cards, tray or full screen (2026-11-16)

User: the New product list used different icons from the Products cards and looked bad; asked for
Family's style (light grey containers, bigger coloured custom icons) and to compare a tray with a
full-screen version "like Family but without texts and colored illustration", with a switcher.
- New product, Loans and Car loans are now Family-style option cards: a light grey 20 px container, a
  48 px circle in the product colour with the same filled glyphs as the Products cards (new glyphs for
  each loan and car-loan type in `ProductGlyph.jsx`), the name and an optional line. No chevron: the
  container is the affordance. Study-local and Proposed (`ProductOption`), not yet in the design system.
- Lab switch in the toolbar: **Tray** (the lists are tray steps, as before) or **Full screen** (the
  lists are full-screen pages with a back chevron that slide in from the right; Auto lombard then opens
  the flow tray at "You will need" over the page; after success the pages close and the request lands on
  Products).
- Checked in the browser: both variants, the push and back between pages, the tray over the page and
  its X closing back to the page.
- Open: "You will need" still uses the standard List row icons (light blue circle), not the coloured
  glyph circles; it is information, not a choice.
- User decision: New product stays a **tray** step (chose Tray over Full screen). The full-screen pages
  and the lab switch were removed; the option cards stay in the tray.
- User request: the option card is now a shared design-system component, **Option Card**
  (`components/OptionCard.jsx`, `OptionCards` for the 12 px stack), with its own page under
  /design-system/components/option-card. The study uses it with `ProductGlyph`. Decided: New product,
  Loans and Car loans use option cards with the product's glyph and colour in the tray. Proposed: one
  glyph and colour per product everywhere; no chevron; a supporting line only when needed.

## Product card colours on the ramps (2026-11-17, user: "Yes, apply them")

Built with oklch-skill and better-colors. The bright set from the third review failed white text
(names 3.4–3.9:1, 78% subtitles 2.7–2.9:1). Its coral sat 8.6° from the danger red, and its blue
was 16° off brand blue. Vividness ranged from 77% to 97% of each hue's maximum.

User-approved (this replaces the 3:1 trade-off above):
- **One lightness (~0.51) for every card,** so no card outweighs another and white passes 4.5:1.
- **The brand steps:** ink → gray-900, Loans → blue-500, Deposits → green-500 and Credit card → coral-700.
- **Two new single colours:** Installments → violet `#7242C8`, which replaces orange because orange
  turns brown at this lightness; Insurance → teal `#257373`. Car loan and Auto lombard option circles
  follow the violet.
- **Subtitles are full white**, not 78%.

Observations, not yet reviewed:
- The "Under review" badge was white text on a 24% white tint, which failed (3.4–3.9:1). It now uses an
  18% black tint (7.4–8.3:1).
- The cards are deeper and calmer than the Family look. Violet (70% of its maximum chroma, held
  back from 85% so it doesn't look neon) is the loudest card. Teal sits between green and blue
  (ΔE about 0.055 to blue), so keep it away from Loans in the grid.

User decision (2026-11-17, "Tone down the violet and make teal greener"):
- **Violet** `#7242C8` → `#6E4EB3`, at 55% of its maximum chroma. That matches the coral card's absolute vividness
  (C 0.154 vs 0.153); white text is 6.17:1.
- **Teal** hue 195 → 182 (`#257373` → `#277469`). ΔE to Loans blue went from 0.055 to 0.076, and to Deposits
  green from 0.061 to 0.043. It sits diagonally from Deposits in the grid, not next to it. White text is
  5.54:1.

User request (2026-11-17, "amounts should be subtler than names"): card amounts are white at 85%, the
lowest that keeps 4.5:1 on every card (teal 4.51). They already use one size smaller and one weight lighter
(14/400 vs 15/550). Test added. Observation: the step is small; going quieter means accepting about 4:1.
User decision (2026-11-17, "Go quieter"): amounts are white at 75%, which gives 3.89–4.26:1 on the coloured
cards (8.83:1 on ink). This trades 4.5:1 for a visible step below the names. The test floor is 3.8:1.
User approved (2026-11-17): the violet Car loan and Auto lombard circles, the dark badge tint and keeping teal
away from blue. All three are now Decided in the Product colours pattern.

User decision (2026-11-17, "use the category colours in the New product option cards"): sub-lists take their
parent's colour. All six loan types and all three car loans are now Loans blue (blue-500). Before, they mixed
all six category colours, which put Insurance's teal on Student loan and Deposits' green on Mortgage. This
replaces the earlier violet circles for Car loan and Auto lombard. The first New product list already matched
the Products cards and is unchanged.

## Product Card in the design system (2026-11-17, user: "add the product card to the design system")

- The Products cards are now a shared component, `components/ProductCard.jsx` with `ProductCards` (two
  columns, 12 px gap). The props are icon, a category colour, title, detail and an optional badge. Without
  onClick it renders as a static div; the Colors page uses that.
- The styles moved out of `auto-lombard.css`. The study only places the grid. Nothing changes visually: cards
  are 120 px tall, details are 75% white and the badge has a dark tint.
- Design system: a Product Card page with Products, badge and pressed states, a guide whose practices are
  Decided where the user decided them (short one-line names are Proposed), a sidebar entry and a link from the
  Product colours pattern.
- Also fixed: the Secondary Button spec still listed pre-ramp hex values and now names its roles.

## Motion: plan 010 G1–G3 (2026-11-17, user: "Yes, build G1–G3")

- **"You will need" stagger removed (G1).** It was my addition after "looks dead" and was never approved.
  It gave the list two entrances and replayed on Back. The step handoff is now its only entrance, as in
  China and Automatic orders.
- **Upload slot states (G2), built as planned.** The photo fades in over 170 ms while the spinner fades out
  over 100 ms. The done check grows like SelectMark (200 ms textSwap, 60 ms after the photo). Error colours
  fade over 150 ms `ease` and the message over 170 ms, with no shake. All of these are transitions, so a
  quick retake turns around.
  Observation: `@starting-style` would replay every check when a step remounts. Slots therefore animate only
  after their state changes on screen.
- **Under review badge (G3).** It now appears when the tray's close animation finishes, not on a timer. It
  fades in and grows from .9 at its top-right corner over 240 ms easeOut. The card is not highlighted.
- **Open questions (need a look on a device):** does the check read as part of the photo? Is the badge
  landing noticeable without a highlight? Both are still Proposed until the user has seen them.
- **Images preloaded (G4, user: "Build G4 and preload the demo photo too").** The three guide pictures and
  the demo car photo now load when the tray opens. Before, they loaded on first use, so the first done photo
  could fade in before it had loaded. Observation: this only matters for the demo, since a real capture is
  already on the phone.
- **Long tray moves measured (G5, user: "Do G5, measure the long tray moves").** The heights were read in
  the browser and the tray spring was simulated, not recorded. The longest move is Show your car ↔ Car
  photos at 462 px (China's longest is 329 px). Four more are 286–316 px. Observation: at ω 32.5 every one
  reaches 97% at 167 ms and spends 100–108 ms on its last 20 px, the same as China's move that crept on
  screen. Distance changes the speed, not the timing. Unresolved: whether they creep on screen. Nothing
  changes until a recording shows it. Details are in plan 010.
- **Long tray moves recorded (user: "Yes, record it").** Visible tab, 60 Hz, scripted clicks, three runs each
  way. Show your car ↔ Car photos (462 px): 97% at 182–197 ms, within 1 px at 282–298 ms, last 10 px about
  84 ms. Show your car ↔ Film your car (300 px): 97% at 176–182 ms, within 1 px at 259–265 ms. Both start
  26–48 ms after the click and jump about 10% on the first frame. Observation: the 462 px move matches
  China's Custom ↔ Review before the user approved ω 42 there. Unresolved: whether to apply ω 42 here.
- **User decision (2026-11-17, "Yes, the 462 px move"):** Show your car ↔ Car photos uses China's ω 42, in
  both directions; every other move keeps ω 32.5. Re-recorded: 97% at 145–164 ms (was 182–197), within 1 px
  at 211–231 ms (was 282–298), last 10 px about 50 ms (was 84). These match China's ω 42 numbers.
  Observation: the first frame now jumps 15–17% (once 39%), up from about 10%, because the faster spring
  covers more in the 27–47 ms before it paints. Open: check the start on an iPhone. The 286–316 px moves
  were not changed.
- **Correction (plan 011, 2026-11-17):** the first-frame "jump" is the spring's normal first 16 ms frame
  (about 10% at ω 32.5, 15% at ω 42); the 39% run was a dropped frame hitting the 50 ms clamp. Not a defect.
- **One motion family (plan 011, built 2026-11-17, not yet reviewed):** keyboard steps, opens and closes are
  instant; titles no longer scale; Sending → Request sent now matches China (spinner grows, tick draws,
  words blur); the button arrives up 4 px from .98 in 150 ms; reduced-motion tray fade is on `ease`. The
  ending was already the family rule (closes after 900 ms, nothing lands).

## Trims and Select all (2026-11-17, user review on screen)

- **Removed "See an example"** on Registration certificate, and the Example step it opened (user: "no need
  for see example on registration certificate screen"). The caption-to-button gap is ~27 px without it, within
  the 24–32 px rule. `guide-id.jpg` stays: the registration slots use it as their demo photo.
- **Removed the Car row** (Video / 10 photos) from Check your loan (user: "no need for this"), and the
  `method` draft field that only fed it.
- **Removed the Under review badge** on the Loans card (user: "no need for this under review badge"). After
  Request sent, the tray closes and Products stays as it was. The badge entry motion from plan 010 G3 stays
  in Product Card for any future badge; the study no longer uses it.
- **Removed the second lines** from the three "You will need" rows (user). They are title-only List rows now.
- **Select all on Terms** (user: "there are 5 checkboxes, let's give users button to mark them all. Use same
  textbutton that we have for edit"). It is a text button styled like Edit (highlight text, 14 px, 600) on its
  own line above the consents, and it ticks all five at once. When all five are ticked it reads "Clear all"
  and unticks them. It is 44 px tall to tap. Its text sits 27 px below the terms and 16 px above the first
  box, so it groups with the list it acts on. Each tick uses the usual SelectMark growth, all five together.
  Choices I made, not reviewed by the user yet: the "Clear all" label, left alignment and the spacing.
- **Select all moved under the consents** (user: "move select all/clear all under checkboxes we have like that
  for other screens"). It is now the same `ao-link` text button as "About insurance" under the insurers: inline
  action colour, 14 px, 600, and an 8 px gap after the list's last row. Its tap area is 30 px tall, like the
  other links, which is less than 44 px. Measured: the last consent to the link is 8 px, the link to Send
  request is 32 px. This replaces the line above the list and its spacing.
- **Text links tap at 44 px** (user: "make all text links 44px tall"). This uses China's Edit method: an
  invisible `::before` hit area, so the visible links and their spacing don't move.
  - `.ao-link` ("About insurance", "Select all", and "Terms and conditions" in Automatic orders) now has a
    44 px tall hit area, up from 30. The link is only as wide as its text; before, it spanned the whole row.
  - The review's Edit (`.al-edit`) gets a 44 × 44 hit area, up from 26 × 14.
  - China's Edit already had a 44 px hit area.
  - Checked: the computed hit areas in the browser and a CSS test. Not checked: real taps; hit testing doesn't
    work in the background tab.
