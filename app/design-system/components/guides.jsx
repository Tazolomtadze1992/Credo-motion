'use client';

import { useState } from 'react';
import PrimaryButton from '../../../components/PrimaryButton';
import SecondaryButton from '../../../components/SecondaryButton';
import ListRow, { ListRows, SelectMark } from '../../../components/ListRow';
import Icon from '../../../components/Icon';
import Practices from '../Practices';
import AmountDisplay from '../../../components/AmountDisplay';
import Keypad from '../../../components/Keypad';
import CodeInput from '../../../components/CodeInput';
import SearchField from '../../../components/SearchField';
import SegmentedControl from '../../../components/SegmentedControl';
import PageHeader from '../../../components/PageHeader';
import ReceiptRows from '../../../components/ReceiptRows';
import CardArt from '../../../components/CardArt';
import AccountField from '../../../components/AccountField';
import UploadSlot from '../../../components/UploadSlot';
import { LiveConsents } from './LombardPreviews';
import OptionCard, { OptionCards } from '../../../components/OptionCard';
import ProductCard, { ProductCards } from '../../../components/ProductCard';
import ProductGlyph from '../../../components/ProductGlyph';
import { editAmount, formatInput } from '../../../lib/transfer-flow.mjs';

/*
 * Usage guidance per component (Geist-style): examples with a sentence on
 * when to use them and a "Show code" snippet, then best practices.
 * Every practice is tagged:
 *   decided  - the user decided it (date and where it is recorded)
 *   proposed - a suggestion, waiting for the user's approval
 * Follow decided rules without asking; raise proposed ones first.
 */

const asset = name => `/assets/${name}`;
const noop = () => {};

function LiveSelection() {
  const [chosen, setChosen] = useState('main');
  return <ListRows className="ds-rows">{[['main', 'Main account'], ['daily', 'Everyday account']].map(([id, name]) =>
    <ListRow key={id} leading={<Icon name="wallet" size="leading" />} trailing={<SelectMark selected={chosen === id} />}
      onClick={() => setChosen(id)} aria-pressed={chosen === id}>{name}</ListRow>)}</ListRows>;
}

function LiveAmountKeypad() {
  const [value, setValue] = useState('50');
  return <div className="ds-guide__stack">
    <AmountDisplay value={formatInput(value)} currency="₾" label="Amount" active animate compact={false} caption="Bills above this are skipped" />
    <Keypad onKey={key => setValue(current => editAmount(current, key))} />
  </div>;
}

function LiveCode() {
  const [value, setValue] = useState('47');
  return <div className="ds-guide__stack">
    <CodeInput value={value} length={4} />
    <Keypad label="Code keypad" onKey={key => setValue(current => key === 'backspace' ? current.slice(0, -1) : /^\d$/.test(key) ? (current + key).slice(0, 4) : current)}
      keyProps={key => key === '.' ? { disabled: true, 'aria-hidden': true, style: { visibility: 'hidden' } } : undefined} />
  </div>;
}

function LiveSearch() {
  const [query, setQuery] = useState('');
  const names = ['Magti', 'Silknet', 'Telmico', 'GWP'].filter(name => name.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="ds-guide__stack ds-guide__narrow">
    <SearchField value={query} onChange={setQuery} placeholder="Search providers" />
    <ListRows className="ds-rows">{names.length ? names.map(name => <ListRow key={name} leading={<Icon name="wifi" size="leading" />} onClick={noop}>{name}</ListRow>)
      : <p className="ds-guide__empty">No providers found</p>}</ListRows>
  </div>;
}

function LiveSegments() {
  const [tab, setTab] = useState('payments');
  return <div className="ds-guide__narrow"><SegmentedControl label="Order type" value={tab} onChange={setTab}
    options={[{ id: 'transfers', label: 'Transfers' }, { id: 'payments', label: 'Payments' }]} /></div>;
}

export const guides = {
  'amount-display': {
    examples: [
      { title: 'With the keypad', text: 'Any screen where someone types money. The digits morph as they are typed; the keypad edits a string, the display only shows it. Try the keys.',
        preview: <LiveAmountKeypad />,
        code: `<AmountDisplay value={formatInput(amount)} currency="₾" label="Amount" active animate\n  caption="Bills above this are skipped" />\n<Keypad onKey={key => setAmount(value => editAmount(value, key))} />` },
      { title: 'Caption', text: 'One short line under the amount when the number needs a rule or a limit. Use the caption prop, not a separate paragraph.',
        preview: null,
        code: `<AmountDisplay value="50" currency="₾" caption="Bills above this are skipped" />` }
    ],
    practices: [
      { status: 'decided', text: 'The amount stays in its place between steps; no long travel of the number across the tray.', source: 'China transfer, 2026-11-12' },
      { status: 'decided', text: 'Captions come from Amount Display’s own caption, as in China.', source: 'Automatic orders quick fixes, 2026-11-13' },
      { status: 'decided', text: 'Other large keypad values (a subscriber number) use the same amount type at the compact size, so keypad steps look alike.', source: '2026-11-13' },
      { status: 'decided', text: 'One caption at most; if it needs more explanation, the step is doing too much.', source: 'rule review, 2026-11-13' },
      { status: 'decided', text: 'The amount is bigger on full screens only; trays keep the default size.', source: 'user, 2026-11-16 (“make the amount bigger only on full screens”)' },
      { status: 'proposed', text: 'Full screens use size="large": 1.4× the amount type (56 px on a 72 px line).', source: 'auto lombard, 2026-11-16' }
    ]
  },
  keypad: {
    examples: [
      { title: 'Amount, number or code', text: 'Pair it with what it edits (Amount Display, a number, Code Input). Keys press to .97 with a quiet key background while held.',
        preview: <div className="ds-guide__narrow"><Keypad onKey={noop} /></div>,
        code: `<Keypad onKey={key => setValue(value => editAmount(value, key))} />` },
      { title: 'Without a decimal key', text: 'Whole-number input (subscriber numbers, codes): hide the decimal key but keep the grid.',
        preview: null,
        code: `<Keypad label="Code keypad" onKey={type}\n  keyProps={key => key === '.' ? { disabled: true, 'aria-hidden': true, style: { visibility: 'hidden' } } : undefined} />` }
    ],
    practices: [
      { status: 'decided', text: 'Keys show press feedback through the shared usePointerPress hook in every flow.', source: '/review-animations fix, 2026-11-13' },
      { status: 'decided', text: 'Use the keypad instead of the system keyboard for amounts, numbers and codes inside a tray.', source: 'rule review, 2026-11-13' },
      { status: 'decided', text: 'Never animate the key labels themselves; feedback is the press only.', source: 'rule review, 2026-11-13' }
    ]
  },
  'code-input': {
    examples: [
      { title: 'One-time code', text: 'The last step before an action is confirmed. The next empty box is outlined; digits pop in. Try the keypad.',
        preview: <LiveCode />,
        code: `<CodeInput value={otp} length={4} />\n<Keypad label="Code keypad" onKey={typeDigit} keyProps={hideDecimal} />` }
    ],
    practices: [
      { status: 'decided', text: 'Digits use the code type token (26/26, 600, tabular).', source: '2026-11-13' },
      { status: 'decided', text: 'Submit automatically when the last digit is typed; no separate Confirm button.', source: 'rule review, 2026-11-13' },
      { status: 'decided', text: 'Say where the code was sent in one short line above the boxes.', source: 'rule review, 2026-11-13' }
    ]
  },
  'search-field': {
    examples: [
      { title: 'Filter a list', text: 'Above a list long enough to scan. Results replace the list as you type; a clear button appears with text. Try it.',
        preview: <LiveSearch />,
        code: `<SearchField value={query} onChange={setQuery} placeholder="Search providers" />` }
    ],
    practices: [
      { status: 'decided', text: 'Show search only above lists that are hard to scan (more than about six items or many providers).', source: 'rule review, 2026-11-13' },
      { status: 'decided', text: 'The field is a fully rounded pill on the secondary button’s light blue (accent/subtle), not grey.', source: '2026-11-16' },
      { status: 'decided', text: 'Its icons sit on the list row’s icon columns: the search icon centred under the row icons, the clear X in line with the chevrons and the tray’s X.', source: '2026-11-16' }
    ]
  },
  tray: {
    examples: [
      { title: 'One tray for a short flow', text: 'A focused task with a few steps keeps the screen behind it. The tray resizes per step; content crossfades inside it.',
        preview: null,
        code: `<Tray title={title} onClose={close} onBack={hasPreviousStep ? goBack : undefined}\n  footer={<PrimaryButton onClick={next}>Continue</PrimaryButton>}>\n  {stepContent}\n</Tray>` },
      { title: 'Close and back', text: 'The one round X closes on the first step and steps back after that; Escape does the same. Tray does this for you: always pass onClose, and onBack whenever there is a previous step. The X is then labelled “Back” and steps back.',
        preview: null,
        code: `<Tray onClose={close} onBack={step > 0 ? goBack : undefined} …>\n// Escape: (step > 0 ? goBack : close)()` }
    ],
    practices: [
      { status: 'decided', text: 'A short flow lives in one resizing tray, like the China transfer, not on full screens.', source: 'Automatic orders, 2026-11-13' },
      { status: 'decided', text: 'No back chevrons in trays. One X: close on the first step, back after that.', source: '2026-11-13' },
      { status: 'decided', text: 'Never wire the X by hand: pass onClose always and onBack whenever there is a previous step; Tray picks the action and its label.', source: 'China fixed to match Automatic orders, 2026-11-16' },
      { status: 'decided', text: 'One decision per step, with a clear title.', source: 'Automatic orders rebuild, 2026-11-13' },
      { status: 'decided', text: 'The screen behind is dimmed with the shared scrim, and the title divider is border/separator, as in China.', source: '2026-11-13' },
      { status: 'decided', text: 'Content never shows around or under the button while the tray grows.', source: 'plan 005, 2026-11-13' }
    ]
  },
  'page-header': {
    examples: [
      { title: 'Screen header', text: 'At the top of a full screen: back on the left, centred title. Pass onBack to make the back a real button.',
        preview: <div className="ds-guide__wide"><PageHeader title="Automatic orders" onBack={noop} /></div>,
        code: `<PageHeader title="Automatic orders" onBack={goBack} />` }
    ],
    practices: [
      { status: 'decided', text: 'China and Automatic orders share this header; each screen sets only its position.', source: '2026-11-13' },
      { status: 'decided', text: 'Trays never use a page header; they have their own title and X.', source: 'rule review, 2026-11-13' },
      { status: 'decided', text: 'Titles are short nouns (“Automatic orders”), not sentences.', source: 'rule review, 2026-11-13' },
      { status: 'proposed', text: 'A tab’s root screen (Products) passes back={false}: no chevron, title still centred.', source: 'plan 007, 2026-11-16' },
      { status: 'proposed', text: 'Any end action is drawn like the back chevron (bare icon, same size); the auto lombard flow has none (chat dropped by the user).', source: 'user review, 2026-11-16' }
    ]
  },
  'segmented-control': {
    examples: [
      { title: 'Two views of one list', text: 'Switching between sibling lists on one screen (Transfers | Payments). The pill slides; the lists crossfade in one place. Try it.',
        preview: <LiveSegments />,
        code: `<SegmentedControl label="Order type" value={tab} onChange={setTab}\n  options={[{ id: 'transfers', label: 'Transfers' }, { id: 'payments', label: 'Payments' }]} />` }
    ],
    practices: [
      { status: 'decided', text: 'Spacing: 16 px from the header above, 24 px to the list below.', source: '2026-11-13' },
      { status: 'decided', text: 'Two segments at most; more than that becomes a list or tabs.', source: 'rule review, 2026-11-13' },
      { status: 'decided', text: 'Use it to switch views, never to submit a choice in a form.', source: 'rule review, 2026-11-13' }
    ]
  },
  'receipt-rows': {
    examples: [
      { title: 'Review', text: 'A plain label and value list before confirming. Group what is being set up, then a divider and how it is paid.',
        preview: <div className="ds-guide__narrow"><ReceiptRows rows={[{ label: 'Subscriber', value: '492 312 312' }, { label: 'Pays', value: 'When a bill arrives' }, { label: 'Up to', value: '50 ₾' }]} /></div>,
        code: `<ReceiptRows rows={[\n  { label: 'Subscriber', value: '492 312 312' },\n  { label: 'Pays', value: 'When a bill arrives' },\n  { label: 'Up to', value: '50 ₾' }\n]} />` },
      { title: 'Pay from', text: 'The paying account is the last row, after a divider: small card art, name and up/down chevrons; the whole row opens the picker.',
        preview: <div className="ds-guide__narrow"><ReceiptRows rows={[{ label: 'Pay from', value: <span className="ds-guide__pay"><CardArt size="chip" />Main account<Icon name="select" size="inline" /></span> }]} /></div>,
        code: `<ReceiptRows rows={[{ label: 'Pay from', value:\n  <button onClick={openPicker}><CardArt size="chip" />Main account<Icon name="select" size="inline" /></button> }]} />` }
    ],
    practices: [
      { status: 'decided', text: 'The value is the information; the label only names it. Both are 14 px; the value is one weight heavier (500 vs 400) and darker (text/primary vs text/secondary). Never make labels bigger or heavier than values.', source: '2026-11-14' },
      { status: 'decided', text: '“Pay from” is a receipt row after a divider, not a big card.', source: 'Family “Pay with”, 2026-11-13' },
      { status: 'decided', text: 'A company is shown by its logo in the value, after the number (“492 312 312” + logo).', source: '2026-11-13' },
      { status: 'decided', text: 'Keep it short: drop rows that do not change the decision (the monthly fee was removed).', source: '2026-11-13' },
      { status: 'decided', text: 'Edits use the inline action style (China’s Edit).', source: 'China transfer' },
      { status: 'decided', text: 'No more than five rows; if there are more, split the step.', source: 'rule review, 2026-11-13' }
    ]
  },
  'secondary-button': {
    examples: [
      { title: 'Supporting action', text: 'Next to or instead of a primary when the action matters less, or on a calm screen. Same size, press and motion as Primary.',
        preview: <div className="ds-guide__buttons"><SecondaryButton onClick={noop}>Add payment</SecondaryButton></div>,
        code: `<SecondaryButton onClick={openFlow}>Add payment</SecondaryButton>` }
    ],
    practices: [
      { status: 'decided', text: 'Its colours (light blue surface, Credo blue label) are the brand pair also used for list-row icons.', source: '2026-11-13' },
      { status: 'decided', text: 'It is also the quiet surface the primary blends to while sending.', source: 'China transfer, 2026-11-12' },
      { status: 'decided', text: 'Never two secondary buttons stacked; use rows for more options.', source: 'rule review, 2026-11-13' }
    ]
  },
  'card-art': {
    examples: [
      { title: 'Sizes', text: 'chip inside a receipt value, thumb as a list row’s leading image, field in the Account Field.',
        preview: <div className="ds-guide__cards"><CardArt size="chip" /><CardArt size="thumb" /><CardArt size="field" /><CardArt size="thumb" finish="blue" /></div>,
        code: `<CardArt size="thumb" finish="blue" />` }
    ],
    practices: [
      { status: 'decided', text: 'Accounts are shown with their card image, and the row shows only the balance (no dots or card digits).', source: '2026-11-13' },
      { status: 'decided', text: 'Swap these CSS drawings for real Credo card artwork when it exists.', source: 'rule review, 2026-11-13' }
    ]
  },
  'account-field': {
    examples: [
      { title: 'Standalone account choice', text: 'A screen whose main job is choosing where money comes from. Not inside a review.',
        preview: <div className="ds-guide__narrow"><AccountField label="Pay from" name="Main account" amount="1,240.50 ₾" onClick={noop} /></div>,
        code: `<AccountField label="Pay from" name="Main account" amount="1,240.50 ₾" onClick={openPicker} />` }
    ],
    practices: [
      { status: 'decided', text: 'Do not use it on a review screen; it is too big and breaks the row alignment. Use the Pay from receipt row.', source: '2026-11-13' },
      { status: 'decided', text: 'Use it at the top of a transfer or top-up amount screen, where the source account is the first thing to see.', source: 'rule review, 2026-11-13' }
    ]
  },
  'primary-button': {
    examples: [
      { title: 'Primary', text: 'The one main action of a screen or tray step. Name what happens.',
        preview: <div className="ds-guide__buttons"><PrimaryButton onClick={noop}>Continue</PrimaryButton></div>,
        code: `<PrimaryButton onClick={next}>Continue</PrimaryButton>` },
      { title: 'Secondary', text: 'A supporting action, or the main action on a calm screen where a gradient would shout (Add payment on the orders list).',
        preview: <div className="ds-guide__buttons"><SecondaryButton onClick={noop}>Add payment</SecondaryButton></div>,
        code: `import SecondaryButton from 'components/SecondaryButton';\n\n<SecondaryButton onClick={openFlow}>Add payment</SecondaryButton>` },
      { title: 'Disabled', text: 'Only while the action is impossible: an amount is still zero, or required consents are not ticked.',
        preview: <div className="ds-guide__buttons"><PrimaryButton disabled>Agree and continue</PrimaryButton></div>,
        code: `<PrimaryButton disabled={!agreed.every(Boolean)} onClick={next}>Agree and continue</PrimaryButton>` },
      { title: 'Sending and success', text: 'The same button carries the action through: it blends to the quiet surface with a spinner while sending, then to light green with a check. The label morphs; nothing else appears.',
        preview: null,
        code: `<PrimaryButton blend variant={busy || done ? 'secondary' : 'primary'} busy={busy} success={done}>\n  <TextMorph>{done ? 'Activated' : busy ? 'Activating' : 'Activate'}</TextMorph>\n</PrimaryButton>` }
    ],
    practices: [
      { status: 'decided', text: 'One filled (gradient) button per screen. Everything else stays quiet.', source: '2026-11-13, colour plan' },
      { status: 'decided', text: 'Sentence case labels that name what happens: “Add payment”, “Agree and continue”.', source: '2026-11-13' },
      { status: 'decided', text: 'The main button owns processing and success (sending → light-green success, label morph); no separate status screen element.', source: 'China transfer, 2026-10-13 and 2026-11-12' },
      { status: 'decided', text: 'Disable until the input is complete, for example until every agreement is ticked.', source: 'Automatic orders, 2026-11-13' },
      { status: 'decided', text: 'Avoid bare verbs and generic confirms (“Submit”, “OK”); prefer “Confirm transfer”, “Activate”.', source: 'rule review, 2026-11-13' },
      { status: 'decided', text: 'Use a link or a row, not a button, for navigation to another screen.', source: 'rule review, 2026-11-13' }
    ]
  },
  'consent-list': {
    examples: [
      { title: 'Agreements', text: 'Each consent unticked; the action stays off until all are ticked. Tap to tick.',
        preview: <div className="ds-guide__wide"><LiveConsents /></div>,
        code: `<ConsentList items={CONSENTS} checked={agreed} onChange={(index, value) => tick(index, value)} />` }
    ],
    practices: [
      { status: 'decided', text: 'Consents start unticked; the action is disabled until all are ticked.', source: '2026-11-13' },
      { status: 'decided', text: 'The square mark sits on the label’s first line, not centred on a two-line label.', source: 'user, 2026-11-16 (“alignment was bad idea”)' },
      { status: 'decided', text: 'Labels use text-wrap: pretty.', source: 'user request, 2026-11-16' },
      { status: 'proposed', text: 'With many consents (auto lombard has five), a Select all text button sits under the list, the same link as under other lists; once all are ticked it reads Clear all.', source: 'user requests, auto lombard 2026-11-17 (placement: “under checkboxes”); Clear all label not yet reviewed' }
    ]
  },
  'upload-slot': {
    examples: [
      { title: 'Photo to add', text: 'A tappable tile; the label sits under it so the layout never moves.',
        preview: <div className="ds-guide__wide" style={{ maxWidth: 200 }}><UploadSlot label="Front" onClick={noop} /></div>,
        code: `<UploadSlot label="Front" state={state} image={photo} onClick={capture} />` },
      { title: 'Error on the slot', text: 'The problem is shown on the photo it is about, not in a banner at the top.',
        preview: <div className="ds-guide__wide" style={{ maxWidth: 200 }}><UploadSlot label="Engine" state="error" error="Engine not clear. Retake the photo." onClick={noop} /></div>,
        code: `<UploadSlot label="Engine" state="error" error="Engine not clear. Retake the photo." onClick={retake} />` }
    ],
    practices: [
      { status: 'proposed', text: 'No dashed borders and no file-format text: people take photos with their phone.', source: 'user review of the current flow, 2026-11-16' },
      { status: 'proposed', text: 'Errors appear on the slot they describe.', source: 'auto lombard, plan 007, 2026-11-16' },
      { status: 'proposed', text: 'Each photo slot will show a drawing of its angle (placeholder icons until then).', source: 'user decision 2026-11-16: placeholders first' },
      { status: 'proposed', text: 'State changes are transitions: the photo fades in over the spinner, the done check grows like SelectMark, the error fades in without a shake.', source: 'plan 010 G2, built 2026-11-17 (feel not yet reviewed)' }
    ]
  },
  'product-card': {
    examples: [
      { title: 'Products', text: 'Every product the person has, as a grid of cards. The colour and glyph name the product and stay the same in New product and every list inside it.',
        preview: <div className="ds-guide__wide"><ProductCards>
          <ProductCard icon={<ProductGlyph name="accounts" />} color="ink" title="Accounts" detail="5,752.00 ₾" onClick={noop} />
          <ProductCard icon={<ProductGlyph name="loans" />} color="blue" title="Loans" detail="1,752.00 ₾" onClick={noop} />
        </ProductCards></div>,
        code: `<ProductCards>\n  <ProductCard icon={<ProductGlyph name="loans" />} color="blue"\n    title="Loans" detail="1,752.00 ₾" onClick={open} />\n</ProductCards>` },
      { title: 'A status', text: 'A short badge when something about the product is pending. One word or two, never a sentence.',
        preview: <div className="ds-guide__wide"><ProductCards>
          <ProductCard icon={<ProductGlyph name="loans" />} color="blue" title="Loans" detail="1,752.00 ₾" badge="Under review" onClick={noop} />
        </ProductCards></div>,
        code: `<ProductCard … badge="Under review" />` }
    ],
    practices: [
      { status: 'decided', text: 'Products shows one colourful card per product, like Family’s wallets, with no card art or balance block.', source: 'user, auto lombard, 2026-11-16' },
      { status: 'decided', text: 'Card colours are the category colours, one per product, all at the same lightness.', source: 'Product colours pattern, 2026-11-17' },
      { status: 'decided', text: 'Names are white at 4.5:1 or more; the detail line is white at 75%.', source: 'user, 2026-11-17' },
      { status: 'decided', text: 'Badges use a dark tint, not a white one, so white text passes.', source: 'user approved, 2026-11-17' },
      { status: 'proposed', text: 'Names are one line: use the short name (Accounts, Installments); trays keep the full name.', source: 'Family wallets, auto lombard, 2026-11-16' },
      { status: 'proposed', text: 'One detail line only, usually the balance.', source: 'minimal text rule' }
    ]
  },
  'option-card': {
    examples: [
      { title: 'Choosing a product', text: 'A list where each choice is a product or product type (New product, Loans, Car loans). The glyph and colour are the same as the product’s card on Products; items inside a product (loan types, car loans) take that product’s colour.',
        preview: <div className="ds-guide__wide"><OptionCards>
          <OptionCard icon={<ProductGlyph name="loans" size={24} />} color="blue" title="Loans and installments" onClick={noop} />
          <OptionCard icon={<ProductGlyph name="lombard" size={24} />} color="blue" title="Auto lombard" subtitle="Money against your car" onClick={noop} />
        </OptionCards></div>,
        code: `<OptionCards>\n  <OptionCard icon={<ProductGlyph name="loans" size={24} />} color="blue"\n    title="Loans and installments" onClick={open} />\n</OptionCards>` }
    ],
    practices: [
      { status: 'decided', text: 'New product, Loans and Car loans use option cards with the product’s own glyph and colour, in the tray.', source: 'user, 2026-11-16 (chose Tray with Family-style cards)' },
      { status: 'proposed', text: 'A glyph means the same thing everywhere: a product keeps one glyph and one colour on Products and in every list.', source: 'user review of mismatched icons, 2026-11-16' },
      { status: 'decided', text: 'Items inside a product take its colour: every loan type and car loan is Loans blue.', source: 'user, 2026-11-17' },
      { status: 'proposed', text: 'No chevron: the grey card is the affordance. Use List row (with a chevron) for settings-like navigation instead.', source: 'Family option cards, 2026-11-16' },
      { status: 'proposed', text: 'A supporting line only when the title alone is not enough to choose.', source: 'minimal text rule' }
    ]
  },
  'list-row': {
    examples: [
      { title: 'Navigation', text: 'The row opens something: a chevron on the right.',
        preview: <ListRows className="ds-rows"><ListRow leading={<Icon name="bank" size="leading" />} onClick={noop}>Account Number</ListRow></ListRows>,
        code: `<ListRow leading={<Icon name="bank" size="leading" />} onClick={open}>Account Number</ListRow>` },
      { title: 'Pick one', text: 'Choosing one option in place: a round SelectMark instead of the chevron. Tap a row.',
        preview: <LiveSelection />,
        code: `<ListRow leading={<CardArt size="thumb" />} trailing={<SelectMark selected={id === chosen} />}\n  onClick={() => choose(id)} aria-pressed={id === chosen}>Main account</ListRow>` },
      { title: 'Company logo', text: 'A real company gets its logo filling the circle, with no outline. Categories (not companies) keep an icon.',
        preview: <ListRows className="ds-rows"><ListRow leading={<img src={asset('providers/magti.png')} alt="" width="40" height="40" style={{ borderRadius: '50%' }} />} onClick={noop}>Magti</ListRow><ListRow leading={<Icon name="lightning" size="leading" />} onClick={noop}>Electricity</ListRow></ListRows>,
        code: `<ListRow leading={<img src="/assets/providers/magti.png" alt="" width="40" height="40" />} onClick={pick}>Magti</ListRow>` },
      { title: 'Not tappable', text: 'Information only: no chevron and no onClick, so it does not look clickable.',
        preview: <ListRows className="ds-rows"><ListRow leading={<img src={asset('providers/gwp.png')} alt="" width="40" height="40" style={{ borderRadius: '50%' }} />} trailing={false} badge={<span className="ds-guide__amount">21.00 ₾</span>}>GWP</ListRow></ListRows>,
        code: `<ListRow leading={logo} trailing={false} badge={<span>21.00 ₾</span>}>GWP</ListRow>` },
      { title: 'Checklist (plain)', text: 'Information, not a choice: the icon has no circle, so it never looks tappable. Proposed.',
        preview: <ListRows className="ds-rows"><ListRow plain leading={<Icon name="sun" size="content" />}>Good light</ListRow></ListRows>,
        code: `<ListRow plain leading={<Icon name="sun" size="content" />}>Good light</ListRow>` },
      { title: 'Large option', text: 'A big choice with a subtitle and an optional badge. Proposed.',
        preview: <ListRows className="ds-rows"><ListRow size="large" leading={<Icon name="video" size="leading" />} subtitle="About a minute" onClick={noop}>Video</ListRow></ListRows>,
        code: `<ListRow size="large" leading={<Icon name="video" size="leading" />} subtitle="About a minute" badge={recommended} onClick={chooseVideo}>Video</ListRow>` }
    ],
    practices: [
      { status: 'decided', text: 'Nothing looks clickable unless it is: a chevron only on rows that open something; static rows have no trailing mark.', source: 'user rule, saved 2026' },
      { status: 'decided', text: 'Pick-one lists use the round SelectMark in Credo blue; consent checkboxes use its square shape.', source: '2026-11-13' },
      { status: 'decided', text: 'The round mark sits 1 px left of the X column’s geometric centre: an optical correction, because the dark mark with its right-pointing check otherwise reads as shifted right.', source: 'measured in Figma, 2026-11-14' },
      { status: 'decided', text: 'Companies show their real logo filling the circle, no outline; categories keep an icon in the light-blue circle with a Credo blue icon.', source: '2026-11-13' },
      { status: 'decided', text: 'Minimal text: add a subtitle only when the title alone is not enough to choose.', source: 'repeated removals in Automatic orders, 2026-11-13' },
      { status: 'decided', text: 'Stack rows with ListRows (12 px gap), never with a container’s own spacing.', source: '2026-11-13' },
      { status: 'decided', text: 'At most one badge per row (for example Fast).', source: 'rule review, 2026-11-13' },
      { status: 'proposed', text: 'Icons in circles only on tappable rows; information rows use the plain option.', source: 'user review of auto lombard, 2026-11-16' }
    ]
  }
};

export default function ComponentGuide({ slug }) {
  const guide = guides[slug];
  if (!guide) return null;
  return <div className="ds-guide">
    {guide.examples.map(example => <section className="ds-guide__example" key={example.title}>
      <h2>{example.title}</h2>
      <p>{example.text}</p>
      {example.preview && <div className="ds-guide__canvas">{example.preview}</div>}
      <details className="ds-guide__code"><summary>Show code</summary><pre><code>{example.code}</code></pre></details>
    </section>)}
    <Practices practices={guide.practices} />
  </div>;
}
