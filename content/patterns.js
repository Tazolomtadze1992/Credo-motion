// Patterns: rules that span components. Each practice is tagged
//   decided  - the user decided it (date / where it is recorded)
//   proposed - a suggestion waiting for the user's approval
// Follow decided rules without asking; raise proposed ones first.

const CHINA = { title: 'China transfer', href: '/studies/transfers' };
const ORDERS = { title: 'Automatic orders', href: '/studies/automatic-orders' };
const LOMBARD = { title: 'Auto lombard', href: '/studies/auto-lombard' };

export const patterns = [
  {
    slug: 'tray-flows', title: 'Tray flows',
    description: 'Short tasks happen in one resizing tray over the screen they started from.',
    sections: [
      { title: 'When to use a tray', text: 'A focused task with a few steps: setting up a payment, choosing an amount, confirming. The screen behind stays recognisable, so people know where they are and where they return.' },
      { title: 'One decision per step', text: 'Each step asks one thing and has its own title. If a step needs a heading, a search and several lists, split it: the first step chooses the path (Templates or Categories), the next step shows that list.' },
      { title: 'The tray follows its content', text: 'The tray resizes to each step on the tray spring. Content stays above the footer button while the tray grows, so nothing shows around the button.' },
      { title: 'The footer action', text: 'One primary action in the footer, labelled with what happens next. It carries sending and success itself.' },
      { title: 'Spacing', text: 'The header is the same on every step: the title is centred on the X, and the divider sits under both. The first thing you see in a step (a row icon, a field, the top of the letters) starts 16px below the divider. From the last content to the button is 24px, or 40px under running text like terms.' }
    ],
    practices: [
      { status: 'decided', text: 'A short flow lives in one resizing tray, like the China transfer.', source: 'Automatic orders, 2026-11-13' },
      { status: 'decided', text: 'One decision per step, each with a clear title.', source: '2026-11-13' },
      { status: 'decided', text: 'An overwhelming step is split: first choose the path, then show its list.', source: 'Templates or Categories, 2026-11-13' },
      { status: 'decided', text: 'Content never shows around or under the button while the tray grows.', source: 'plan 005, 2026-11-13' },
      { status: 'decided', text: 'Edits from a review return to that same review instead of stacking a new one.', source: 'rule review, 2026-11-13' },
      { status: 'proposed', text: 'A tray move that creeps in a recording gets the faster ω 42 spring for that pair of steps only; every other move keeps the tray spring.', source: 'China Custom amount ↔ Review (2026-11-14) and auto lombard Show your car ↔ Car photos (2026-11-17), each approved for that pair' },
      { status: 'decided', text: 'The tray title is centred on the X button.', source: '2026-11-14' },
      { status: 'decided', text: 'A step’s first visible content starts 16px below the divider, measured to what you see, not to a line box.', source: 'compared with Family (12–15pt), 2026-11-14' },
      { status: 'decided', text: 'Last content to the footer button: 24–32px; 40px under running text.', source: 'Terms, 2026-11-14' },
      { status: 'decided', text: 'Every text link (Edit, About insurance, Terms and conditions, Select all) taps at 44px tall.', source: 'user, 2026-11-17 (“make all text links 44px tall”); built as an invisible hit area, so the visible link and spacing stay the same' },
      { status: 'decided', text: 'Steps built around one big number (amount, subscriber number, payment day, custom amount) start it 32px below the divider (tray/emphasis-top).', source: '2026-11-14' },
      { status: 'decided', text: 'A long flow can still be one tray when each step is one decision: auto lombard runs in a single resizing tray, uploads and camera steps included.', source: 'user, auto lombard, 2026-11-16' }
    ],
    components: ['tray', 'primary-button', 'list-row'], usedIn: [CHINA, ORDERS]
  },
  {
    slug: 'navigation-and-closing', title: 'Navigation and closing',
    description: 'One way out of a tray, and a clear way back on full screens.',
    sections: [
      { title: 'One X in trays', text: 'The round X closes the tray on its first step. On any later step the same X steps back. Escape does the same. Trays have no back chevron.' },
      { title: 'Closing', text: 'The tray slides down on the drawer curve while the backdrop fades. When it is gone it is gone: nothing flashes back for a frame.' },
      { title: 'Full screens', text: 'A full screen has a Page Header with a back chevron on the left.' }
    ],
    practices: [
      { status: 'decided', text: 'No back chevrons in trays; one X closes on the first step and steps back after that.', source: '2026-11-13' },
      { status: 'decided', text: 'Closing must not flash: the tray and backdrop are hidden in the same frame the animation ends.', source: 'user report, 2026-11-13' },
      { status: 'decided', text: 'Tapping the dimmed screen behind a tray closes it, on any step.', source: 'rule review, 2026-11-13' },
      { status: 'decided', text: 'The X’s accessible label says what it does on this step: “Close” or “Back”.', source: 'rule review, 2026-11-13' },
      { status: 'decided', text: 'Built into Tray: flows pass onClose and, when there is a previous step, onBack. Both flows use it; the China X closed on every step until 2026-11-16.', source: '2026-11-16' }
    ],
    components: ['tray', 'page-header'], usedIn: [CHINA, ORDERS]
  },
  {
    slug: 'text-and-copy', title: 'Text and copy',
    description: 'Few words, in English, that say what happens.',
    sections: [
      { title: 'Minimal text', text: 'Show a heading and the choice. Add a subtitle, caption or hint only when people cannot decide without it. A rule that matters (Bills above this are skipped) is one caption, not a “How it works” screen.' },
      { title: 'Labels', text: 'Sentence case, naming what happens: Add payment, Agree and continue, Confirm transfer.' },
      { title: 'Only real affordances', text: 'Text that is not tappable never looks tappable: no chevrons, link colours or button shapes on static content.' }
    ],
    practices: [
      { status: 'decided', text: 'Prototype copy is English.', source: 'user rule' },
      { status: 'decided', text: 'Minimal text: remove subtitles, hints and explanations that do not change the decision.', source: 'repeated in Automatic orders, 2026-11-13' },
      { status: 'decided', text: 'Sentence case for labels and titles.', source: '2026-11-13' },
      { status: 'decided', text: 'Use as few font sizes as possible on one screen; build hierarchy with weight and colour before adding a size.', source: '2026-11-14' },
      { status: 'decided', text: 'Nothing is styled as clickable unless it is.', source: 'user rule' },
      { status: 'decided', text: 'No bare “OK”, “Submit” or “Confirm”; name the action and its object.', source: 'rule review, 2026-11-13' },
      { status: 'decided', text: 'Numbers show what people need (the balance), not internal detail (masked card digits).', source: 'rule review, 2026-11-13' }
    ],
    components: ['primary-button', 'list-row', 'amount-display'], usedIn: [ORDERS, CHINA]
  },
  {
    slug: 'selection', title: 'Selection',
    description: 'Round marks pick one option; square boxes give consent.',
    sections: [
      { title: 'Pick one', text: 'A list where one option is chosen in place uses the round SelectMark in Credo blue on each row. Choosing an option returns to where the choice was needed.' },
      { title: 'Consent', text: 'Agreements use the square SelectMark. They start unticked, and the action stays disabled until every required box is ticked.' },
      { title: 'Motion', text: 'The filled mark grows from the centre while it fades in (200 ms, textSwap curve) and shrinks back faster, matching Family’s video.' }
    ],
    practices: [
      { status: 'decided', text: 'Round SelectMark for pick-one, square for consent, both in Credo blue with the light outline.', source: '2026-11-13' },
      { status: 'decided', text: 'Consents start unticked; the action is disabled until all are ticked.', source: '2026-11-13' },
      { status: 'decided', text: 'The mark grows from the centre like Family’s, with a chunky, centred check.', source: '2026-11-13' },
      { status: 'decided', text: 'Choosing in a picker returns immediately; no separate Done button.', source: 'rule review, 2026-11-13' }
    ],
    components: ['list-row'], usedIn: [ORDERS]
  },
  {
    slug: 'motion-handoffs', title: 'Motion handoffs',
    description: 'How one state becomes the next inside a tray, a button or a line of text.',
    sections: [
      { title: 'Text swaps', text: 'When a title or label changes in place, the old and new text crossfade on one clock with opacities that always add up to one: about 90–100 ms of overlap, never a blank frame, never two offset copies.' },
      { title: 'Step changes', text: 'Inside a tray the outgoing step fades and scales to .96 while the incoming one arrives, with a 2 px blur at the crossover. A quick second tap turns the change around from where it is.' },
      { title: 'Press', text: 'Every tappable thing presses to .97 for 150 ms. Feedback is felt, not seen.' },
      { title: 'Reduced motion', text: 'Movement becomes opacity: gentler, not gone, so state changes stay understandable.' }
    ],
    practices: [
      { status: 'decided', text: 'Text swaps keep complementary opacity on one clock and one position; no gap between old and new.', source: 'China transfer, 2026-11-12' },
      { status: 'decided', text: 'Different layouts in one space (a keypad, a list, a receipt) do not crossfade: the old one leaves on its own short exit (about 100ms) while the new one arrives on its usual entry.', source: 'China plan 006 and Automatic orders, 2026-11-16' },
      { status: 'decided', text: 'Tray steps crossfade with .96 scale and a mid-swap blur, and are interruptible.', source: 'plan 004, 2026-11-13' },
      { status: 'decided', text: 'Press feedback on keys and rows in every flow.', source: '2026-11-13' },
      { status: 'decided', text: 'Content in a tray uses the shared ease-out curve; durations come from the motion tokens.', source: 'China full-flow review, 2026-11-12' },
      { status: 'decided', text: 'Reduced motion keeps state feedback and drops movement.', source: 'motion guide' },
      { status: 'decided', text: 'Anything toggled quickly uses CSS transitions or springs, never keyframes, so it can reverse mid-way.', source: 'rule review, 2026-11-13' },
      { status: 'proposed', text: 'Keyboard-initiated steps, tray resizes, opens and closes are instant in every flow (China already does this); focus stays in the tray.', source: 'plan 011 W2, built 2026-11-17, not yet reviewed' },
      { status: 'proposed', text: 'Tray titles hold one position: opacity and the 2 px blur only, no scale.', source: 'plan 011 W3, built 2026-11-17, not yet reviewed' },
      { status: 'proposed', text: 'Sending → success: the spinner grows in from .6, then shrinks as the check grows into the same slot and its tick draws on with it (180 ms); outgoing button words blur 2 px. Matched to a recording of China’s button.', source: 'plan 011 W1; timing matched to China, user “Yes, match China”, 2026-11-17' },
      { status: 'proposed', text: 'The footer button arrives up 4 px from .98 on one 150 ms easeOutQuad clock.', source: 'plan 011 W5 (D2), China’s values, built 2026-11-17, not yet reviewed' },
      { status: 'proposed', text: 'The step handoff default is exit 100 ms, entry 170 ms (durations.handoffExit / handoffEnter); China’s tuned pairs are named exceptions.', source: 'plan 011 W7 (D3), built 2026-11-17, not yet reviewed' },
      { status: 'proposed', text: 'A flow that finishes by itself holds success in the button for 900 ms, closes the tray, and shows the result only once the tray is gone. China still waits for a tap on its receipt.', source: 'plan 011 W4 (D1), built 2026-11-17, not yet reviewed' },
      { status: 'proposed', text: 'Under reduced motion spinners turn at half speed instead of stopping, and colours still fade.', source: 'plan 011 W8–W9, built 2026-11-17, not yet reviewed' }
    ],
    components: ['tray', 'primary-button', 'keypad'], usedIn: [CHINA, ORDERS, LOMBARD]
  },
  {
    slug: 'product-colours', title: 'Product colours',
    description: 'Each product owns one colour, used for its card and its icon circle.',
    sections: [
      { title: 'One colour per product', text: 'Accounts ink, Loans blue, Deposits green, Credit card coral, Installments violet, Insurance teal. The same colour marks the product wherever it appears: its card on Products, its circle in New product, and the circles of everything inside it (every loan type is blue).' },
      { title: 'Same weight', text: 'All six sit at the same lightness (about 0.51), so no card looks heavier than another. Every colour is a ramp step: blue, green and coral from the brand ramps, violet and teal from their own ramps built to match.' },
      { title: 'Text on the colour', text: 'Names are white and reach 4.5:1 on every card. Details such as balances are white at 75%, one step quieter (about 4:1).' },
      { title: 'Not a status', text: 'These colours name a product, nothing more. Green does not mean success and coral does not mean error here; status keeps its own roles.' }
    ],
    practices: [
      { status: 'decided', text: 'Product cards use the category colours at one lightness, on the brand ramps where possible (blue-500, green-500, coral-700, gray-900).', source: 'auto lombard, 2026-11-17' },
      { status: 'decided', text: 'Installments use violet instead of orange: orange turns brown at this lightness.', source: 'auto lombard, 2026-11-17' },
      { status: 'decided', text: 'Violet is held back to the coral card’s vividness (#6E4EB3), and teal leans green (#277469).', source: 'auto lombard, 2026-11-17' },
      { status: 'decided', text: 'Every card colour is a ramp step: gray-900, blue-500, green-500, coral-700, violet-500, teal-500.', source: 'user, 2026-11-17' },
      { status: 'decided', text: 'Names are white at 4.5:1 or more.', source: 'auto lombard, 2026-11-17' },
      { status: 'decided', text: 'Details are white at 75%, accepting about 4:1 for a visible step below the name.', source: 'user, “Go quieter”, 2026-11-17' },
      { status: 'decided', text: 'Items inside a product take its colour: every loan type and car loan in New product is Loans blue. (Replaces the earlier violet circles for Car loan and Auto lombard.)', source: 'user, 2026-11-17' },
      { status: 'decided', text: 'Badges on a card use a dark tint (black 18%), not a white one, so white text passes.', source: 'user approved, 2026-11-17' },
      { status: 'decided', text: 'Keep teal away from blue in a grid; they are the closest pair.', source: 'user approved, 2026-11-17' }
    ],
    components: ['product-card', 'option-card'], usedIn: [LOMBARD]
  }
];

export const patternBySlug = slug => patterns.find(pattern => pattern.slug === slug);
