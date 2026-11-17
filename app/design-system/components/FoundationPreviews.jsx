'use client';

import { useState } from 'react';
import StatePreview from './StatePreview';
import Keypad from '../../../components/Keypad';
import AmountDisplay from '../../../components/AmountDisplay';
import Tray, { TrayIconButton } from '../../../components/Tray';
import ListRow, { ListRows, SelectMark } from '../../../components/ListRow';
import ReceiptRows from '../../../components/ReceiptRows';
import AccountField from '../../../components/AccountField';
import SegmentedControl from '../../../components/SegmentedControl';
import PageHeader from '../../../components/PageHeader';
import CardArt from '../../../components/CardArt';
import SearchField from '../../../components/SearchField';
import CodeInput from '../../../components/CodeInput';
import Icon from '../../../components/Icon';
import PrimaryButton from '../../../components/PrimaryButton';
import { editAmount, formatInput, MAX_AMOUNT } from '../../../lib/transfer-flow.mjs';

const asset = name => `/assets/transfers/${name}`;
const maxCaption = `Max amount: ${MAX_AMOUNT.toLocaleString('en-US').replaceAll(',', ' ')}`;

/* Amount entry: the amount display above a working keypad. */
function LiveAmount({ start = '0' }) {
  const [value, setValue] = useState(start);
  const [animate, setAnimate] = useState(false);
  return <div className="ds-amount-entry">
    <AmountDisplay value={formatInput(value)} label="Preview amount in USD" active animate={animate} caption={maxCaption} />
    <Keypad onKey={(key, event) => { setAnimate(event.detail !== 0); setValue(current => editAmount(current, key)); }} />
  </div>;
}

export function KeypadPreview() {
  const groups = [
    { label: 'Interaction', states: [
      { id: 'default', label: 'Default', detail: '12 px gaps, 64 px keys, Keypad number type. Delete is the chevron rotated to point left.' },
      { id: 'pressed', label: 'Pressed', detail: 'The pressed key scales to 97% on the quiet surface.' },
      { id: 'focused', label: 'Keyboard Focus', detail: '2 px focus ring with a 3 px offset.' }
    ] },
    { label: 'Availability', states: [
      { id: 'disabled', label: 'Disabled', detail: 'Every key at 45% opacity; activation is blocked.' }
    ] }
  ];
  return <StatePreview param="__keypad" name="Keypad" groups={groups} canvasHeight={340}>
    {active => <Keypad onKey={() => {}} disabled={active.id === 'disabled'}
      keyProps={key => key !== '5' ? undefined : active.id === 'pressed' ? { 'data-pointer-pressed': '' } : active.id === 'focused' ? { 'data-preview-focus': '' } : undefined} />}
  </StatePreview>;
}

export function AmountPreview() {
  const groups = [
    { label: 'Content', states: [
      { id: 'default', label: 'Default', detail: 'Amount display type; the currency sits at 70% size and 500 weight.' },
      { id: 'compact', label: 'Long Amount', detail: 'Longer than 8 characters, the amount steps down to 85% so it fits.' },
      { id: 'empty', label: 'Empty', detail: 'Starts at 0 before any key is pressed.' }
    ] },
    { label: 'Try It', states: [
      { id: 'live', label: 'With Keypad', detail: 'Digits morph in place with Torph as you type; the value stays a real input for screen readers.' }
    ] }
  ];
  return <StatePreview param="__amount" name="Amount display" groups={groups} canvasHeight={active => active.id === 'live' ? 470 : 172}>
    {active => active.id === 'live' ? <LiveAmount key="live" start="2508" />
      : <div className="ds-amount"><AmountDisplay key={active.id} value={{ default: '2,508', compact: '49,999.99', empty: '0' }[active.id]} label="Preview amount in USD" caption={maxCaption} /></div>}
  </StatePreview>;
}

export function TrayPreview() {
  const groups = [
    { label: 'Header', states: [
      { id: 'default', label: 'Title and Close', detail: 'Title, a 40 px close button and a quiet divider. The X also steps back on nested steps; trays have no back chevron.' }
    ] },
    { label: 'Footer', states: [
      { id: 'footer', label: 'With Action', detail: 'The footer holds the primary action, pinned above the home indicator.' }
    ] }
  ];
  return <StatePreview param="__tray" name="Tray" groups={groups} canvasHeight={active => active.id === 'footer' ? 360 : 290}>
    {active => <div className="ds-tray-scene">
      <Tray className={`ds-tray${active.id === 'back' ? ' ds-tray--back' : ''}`} role="dialog" aria-label="Tray preview"
        title={active.id === 'back' ? 'Payment Day' : 'Choose Amount'} onClose={() => {}} closeLabel="Close"
        headerStart={active.id === 'back' && <TrayIconButton className="ds-tray__back" aria-label="Back"><Icon name="back" size="nav" /></TrayIconButton>}
        footer={active.id === 'footer' && <div className="ds-tray__footer"><PrimaryButton>Continue</PrimaryButton></div>}>
        <ListRow leading={<img src={asset('alipay.png')} alt="" width="40" height="40" />} onClick={() => {}}>Alipay</ListRow>
        <ListRow leading={<img src={asset('wechat.png')} alt="" width="40" height="40" />} onClick={() => {}}>WechatPay</ListRow>
      </Tray>
    </div>}
  </StatePreview>;
}

// The Selected state is live: tapping a row moves the selection, so the
// SelectMark grow / shrink can be seen.
function SelectedRows() {
  const [chosen, setChosen] = useState('alipay');
  return [['alipay', 'Alipay'], ['wechat', 'WechatPay']].map(([id, name]) =>
    <ListRow key={id} leading={<img src={asset(`${id}.png`)} alt="" width="40" height="40" />}
      trailing={<SelectMark selected={chosen === id} />} onClick={() => setChosen(id)} aria-pressed={chosen === id}>{name}</ListRow>);
}

export function ListRowPreview() {
  const groups = [
    { label: 'Content', states: [
      { id: 'default', label: 'Icon and Title', detail: '40 px light blue circle (accent/subtle-strong) with a Credo blue icon (accent/text), as on the secondary button. Logos keep their own colour. Stacked rows use ListRows, which owns the 12 px gap.' },
      { id: 'subtitle', label: 'With Subtitle', detail: 'A supporting line under the title, for example the recipient or account.' },
      { id: 'badge', label: 'With Badge', detail: 'A compact badge before the chevron, such as Fast.' },
      { id: 'selected', label: 'Selected', detail: 'Pick-one lists use SelectMark: an outline circle, and a Credo blue filled circle with a check that grows from the centre when chosen (200 ms, textSwap). Tap a row to see it.' }
    ] },
    { label: 'Interaction', states: [
      { id: 'pressed', label: 'Pressed', detail: 'The row content scales to 97% while pressed.' },
      { id: 'focused', label: 'Keyboard Focus', detail: '3 px focus ring with a 3 px offset.' }
    ] }
  ];
  // Same icons as the transfer flow; the pagoda is a mask so it takes the
  // row's brand icon colour.
  const icon = name => name === 'china'
    ? <span className="ds-row-mask" style={{ '--ds-mask': `url(${asset('china.svg')})` }} aria-hidden="true" />
    : <Icon name={{ account: 'bank', card: 'card' }[name]} size="leading" />;
  return <StatePreview param="__row" name="List row" groups={groups} canvasHeight={260}>
    {active => <ListRows className="ds-rows">
      {active.id === 'subtitle' ? <>
        <ListRow leading={<img src={asset('alipay.png')} alt="" width="40" height="40" />} subtitle="David Sarajishvili" onClick={() => {}}>Alipay</ListRow>
        <ListRow leading={<img src={asset('wechat.png')} alt="" width="40" height="40" />} subtitle="Dad · 595 14 21 42" onClick={() => {}}>WechatPay</ListRow>
      </> : active.id === 'selected' ? <SelectedRows /> : <>
        <ListRow leading={icon('account')} tone="purple" onClick={() => {}} data-pointer-pressed={active.id === 'pressed' ? '' : undefined}>Account Number</ListRow>
        <ListRow leading={icon('card')} tone="blue" onClick={() => {}} data-preview-focus={active.id === 'focused' ? '' : undefined}>Card Number</ListRow>
        <ListRow leading={icon('china')} tone="gold" onClick={() => {}}
          badge={active.id === 'badge' && <span className="ds-badge">Fast</span>}>Transfer to China</ListRow>
      </>}
    </ListRows>}
  </StatePreview>;
}

export function ReceiptRowsPreview() {
  const groups = [
    { label: 'Content', states: [
      { id: 'default', label: 'Label and Value', detail: 'Supporting label on the left, receipt value on the right, rows 32 px apart.' },
      { id: 'action', label: 'With Inline Action', detail: 'A value can carry an inline action, such as Edit before the amount on the China review.' },
      { id: 'long', label: 'Long Value', detail: 'Long values wrap at the right edge instead of pushing the label.' }
    ] }
  ];
  const rows = active => active.id === 'long'
    ? [{ label: 'Recipient', value: 'David Sarajishvili' }, { label: 'Address', value: '24 Vazha-Pshavela Avenue, Tbilisi 0186, Georgia' }, { label: 'Pay with', value: 'Alipay' }]
    : [{ label: 'Amount', value: active.id === 'action' ? <><button type="button" className="ds-inline-edit"><span className="credo-inline-action">Edit</span></button><strong>$50</strong></> : '$50' },
       { label: 'Recipient', value: 'David Sarajishvili' }, { label: 'Pay with', value: 'Alipay' }];
  return <StatePreview param="__receipt" name="Receipt rows" groups={groups} canvasHeight={172}>
    {active => <div className="ds-receipt"><ReceiptRows rows={rows(active)} /></div>}
  </StatePreview>;
}

export function AccountFieldPreview() {
  const groups = [
    { label: 'States', states: [
      { id: 'default', label: 'Default', detail: 'Label over the account name, balance, and up/down chevrons that open the account picker.' },
      { id: 'pressed', label: 'Pressed', detail: 'Scales to 98% on press, with the shared press duration and ease.' }
    ] },
    { label: 'Content', states: [
      { id: 'long', label: 'Long Name', detail: 'A long account name truncates; the balance and chevrons keep their place.' },
      { id: 'plain', label: 'No Balance', detail: 'Without an amount, the name takes the free space.' }
    ] }
  ];
  return <StatePreview param="__account" name="Account field" groups={groups} canvasHeight={140}>
    {active => <div className="ds-account">
      <AccountField label="Pay from" name={active.id === 'long' ? 'Everyday savings account' : 'Main account'}
        amount={active.id === 'plain' ? null : '1,240.50 ₾'} onClick={() => {}} data-pressed={active.id === 'pressed' ? '' : undefined} />
    </div>}
  </StatePreview>;
}

function LiveSegments({ count }) {
  const options = [{ id: 'transfers', label: 'Transfers' }, { id: 'payments', label: 'Payments' }, { id: 'loans', label: 'Loans' }].slice(0, count);
  const [value, setValue] = useState(options.at(-1).id);
  return <SegmentedControl label="Preview segments" options={options} value={value} onChange={setValue} />;
}

export function SegmentedControlPreview() {
  const groups = [
    { label: 'Content', states: [
      { id: 'two', label: 'Two Segments', detail: 'The pill slides under the chosen segment (240 ms ease-out); labels swap secondary → strong text. Tap to try.' }
    ] }
  ];
  return <StatePreview param="__segments" name="Segmented control" groups={groups} canvasHeight={120}>
    {active => <div className="ds-segments"><LiveSegments key={active.id} count={2} /></div>}
  </StatePreview>;
}

export function PageHeaderPreview() {
  const groups = [
    { label: 'Content', states: [
      { id: 'back', label: 'Back and Title', detail: 'Back chevron (nav icon, secondary blue), centred title in the Tray title type, and an empty slot so the title stays centred.' }
    ] }
  ];
  return <StatePreview param="__header" name="Page header" groups={groups} canvasHeight={120}>
    {() => <div className="ds-page-header"><PageHeader title="Automatic orders" onBack={() => {}} /></div>}
  </StatePreview>;
}

export function CardArtPreview() {
  const groups = [
    { label: 'Size', states: [
      { id: 'all', label: 'Chip · Thumb · Field', detail: 'One drawing at 20 × 13 (receipt value), 40 × 26 (list row leading) and 44 × 28.6 (Account field). Finishes: dark and blue. Stand-ins until real card artwork.' }
    ] }
  ];
  return <StatePreview param="__card" name="Card art" groups={groups} canvasHeight={120}>
    {() => <div className="ds-card-art">{['chip', 'thumb', 'field'].map(size => ['dark', 'blue'].map(finish => <CardArt key={size + finish} size={size} finish={finish} />))}</div>}
  </StatePreview>;
}

function LiveSearch({ initial }) {
  const [value, setValue] = useState(initial);
  return <SearchField value={value} onChange={setValue} placeholder="Search providers" />;
}

export function SearchFieldPreview() {
  const groups = [
    { label: 'Content', states: [
      { id: 'empty', label: 'Empty', detail: '44 px quiet field, search icon, option type. Focus draws a 2 px inset ring.' },
      { id: 'typed', label: 'With Text', detail: 'A clear button appears once there is text.' }
    ] }
  ];
  return <StatePreview param="__search" name="Search field" groups={groups} canvasHeight={120}>
    {active => <div className="ds-search"><LiveSearch key={active.id} initial={active.id === 'typed' ? 'Magti' : ''} /></div>}
  </StatePreview>;
}

export function CodeInputPreview() {
  const groups = [
    { label: 'State', states: [
      { id: 'empty', label: 'Empty', detail: 'One 54 × 62 box per digit, code type; the next box is outlined in the secondary blue.' },
      { id: 'partial', label: 'Two Digits', detail: 'Each digit pops in (scale .85 → 1, 180 ms easeOutExpo).' },
      { id: 'full', label: 'Complete', detail: 'All digits entered; the flow submits.' }
    ] }
  ];
  return <StatePreview param="__code" name="Code input" groups={groups} canvasHeight={140}>
    {active => <CodeInput value={{ empty: '', partial: '47', full: '4721' }[active.id]} length={4} />}
  </StatePreview>;
}
