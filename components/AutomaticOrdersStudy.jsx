'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { TextMorph } from 'torph/react';
import AmountDisplay from './AmountDisplay';
import Icon from './Icon';
import Keypad from './Keypad';
import ListRow, { ListRows, SelectMark } from './ListRow';
import ReceiptRows from './ReceiptRows';
import Tray from './Tray';
import PageHeader from './PageHeader';
import CardArt from './CardArt';
import SearchField from './SearchField';
import CodeInput from './CodeInput';
import ConsentList from './ConsentList';
import SegmentedControl from './SegmentedControl';
import usePointerPress from './usePointerPress';
import IPhoneFrame, { IPHONE_FRAME, IPHONE_SCREEN, PhoneFrameToggle } from './IPhoneFrame';
import SecondaryButton from './SecondaryButton';
import { Action, HEAD, Layers, reducedMotion, useInputSource, useKeepFocus, useLayers, useTrayHeight } from './TrayFlow';
import { animateTrayPresence } from '../lib/tray-presence.mjs';
import { credoColorStyle } from '../content/colors';
import { credoTypographyStyle } from '../content/typography';
import { cubicBezier, durations } from '../content/motion.mjs';
import { amountToMinor, editAmount, formatInput } from '../lib/transfer-flow.mjs';
import { createCalendar } from '../lib/payment-day.mjs';
import {
  ACCOUNTS, AGREEMENTS, CATEGORIES, DEMO_OTP, KEYPAD_STEPS, MONTHLY_FEE, OTP_LENGTH, PROVIDERS, RULES, STEPS,
  TEMPLATES, afterRule, back, current, dayCopy, editNumber, formatNumber, go, orderSummary,
  queryProviders, reviewRows, validNumber
} from '../lib/automatic-orders-flow.mjs';

const LOOKUP_MS = 900, ACTIVATE_MS = 1200, SUCCESS_HOLD_MS = 900;
const statusIcon = name => `/assets/transfers/${name}.svg`;
const providerById = id => PROVIDERS.find(provider => provider.id === id);
const categoryOf = provider => CATEGORIES.find(category => category.id === provider?.category);
const hiddenDot = key => key === '.' ? { disabled: true, 'aria-hidden': true, tabIndex: -1, className: 'ao-key-hidden' } : undefined;

// The list screen (old Credo mockup, Figma 78-9541): payments and transfers.
const INITIAL_ORDERS = [
  { id: 'magti-seed', provider: 'magti', title: 'Magti', subtitle: 'Day 10 each month', amount: '25.00 ₾', number: '555010203' },
  { id: 'gwp-seed', provider: 'gwp', title: 'GWP', paused: true, amount: '21.00 ₾', number: '310228964' }
];
const TRANSFER_ORDERS = [
  { id: 'david', icon: 'transfer', tone: 'blue', title: 'David Sarajishvili', subtitle: 'Day 1 each month', amount: '200.00 ₾' },
  { id: 'savings', icon: 'wallet', tone: 'mint', title: 'Savings account', subtitle: 'Day 15 each month', amount: '100.00 ₾' }
];

function OrderRow({ order, landed }) {
  const item = order.provider && providerById(order.provider);
  return <div className="ao-order" data-landed={landed || undefined}><div>
    <ListRow leading={item ? <Leading provider={item} /> : <Icon name={order.icon} size="leading" />} tone={item ? categoryOf(item).tone : order.tone}
      badge={<span className="ao-row-amount" data-paused={order.paused || undefined}>{order.amount}</span>}
      trailing={false} onClick={() => {}}>{order.title}</ListRow>
  </div></div>;
}

function freshDraft() {
  return { query: '', category: null, provider: null, number: '', found: false, fromTemplate: false, lookup: 'idle',
    rule: null, limit: '0', amount: '0', day: 1, account: ACCOUNTS[0].id, agreed: AGREEMENTS.map(() => false),
    accepted: false, otp: '', activation: 'idle' };
}

// Companies show their own logo (identity keeps its colour); categories,
// which are not companies, keep an icon.
function Leading({ provider, category }) {
  if (provider?.logo) return <img className="ao-logo" src={`/assets/providers/${provider.logo}`} alt="" width="40" height="40" draggable="false" />;
  const tint = category ?? categoryOf(provider);
  return <Icon name={tint?.icon ?? 'bank'} size="leading" className={`ao-leading-icon ao-leading-icon--${tint?.tone}`} />;
}

/* ---------- The day picker reuses the payment-day calendar controller ---------- */
function DayPicker({ day, onPick }) {
  const root = useRef(null), range = useRef(null), fill = useRef(null), sink = useRef(null);
  const controller = useRef(null), dragging = useRef(false), initial = useRef(day), pick = useRef(onPick);
  useLayoutEffect(() => { pick.current = onPick; }, [onPick]);
  useLayoutEffect(() => {
    controller.current = createCalendar({ root: root.current, range: range.current, fill: fill.current, description: sink.current,
      onCommit: value => pick.current(value) });
    controller.current.setDay(initial.current, true);
    return () => { controller.current.destroy(); controller.current = null; };
  }, []);
  const end = instant => { if (!dragging.current) return; dragging.current = false; controller.current.endDrag(instant); };
  return <div className="ao-day">
    <div ref={root} aria-hidden="true"><div className="ap-calendar">
      <div className="ap-calendar-stack ap-calendar-stack--back" /><div className="ap-calendar-stack" />
      <div className="ap-calendar-header">On the</div>
      <div className="ap-calendar-body">
        <div className="ap-calendar-half ap-calendar-half--top"><span className="ap-calendar-copy" data-calendar-top>{day}</span></div>
        <div className="ap-calendar-half ap-calendar-half--bottom"><span className="ap-calendar-copy" data-calendar-bottom>{day}</span></div>
        <div className="ap-calendar-leaf" data-calendar-leaf>
          <div className="ap-leaf-face ap-leaf-front"><span className="ap-calendar-copy" data-front-copy>{day}</span><div className="ap-leaf-shade" data-leaf-shade /></div>
          <div className="ap-leaf-face ap-leaf-back"><span className="ap-calendar-copy" data-back-copy>{day}</span><div className="ap-leaf-shade" data-leaf-shade /></div>
        </div>
        <div className="ap-calendar-seam" />
      </div>
    </div></div>
    <div className="ap-day-control">
      <div className="ap-slider">
        <div className="ap-slider-track" aria-hidden="true"><div ref={fill} /></div>
        <input ref={range} type="range" min="1" max="31" step="1" defaultValue={day} aria-label="Day of month" aria-valuetext={dayCopy(day)}
          onPointerDown={event => { if (!event.isPrimary || event.button !== 0) return; dragging.current = true; controller.current.beginDrag(); event.currentTarget.setPointerCapture(event.pointerId); }}
          onPointerUp={() => end(false)} onPointerCancel={() => end(true)} onLostPointerCapture={() => end(false)}
          onKeyDown={() => controller.current.prepareKeyboard()}
          onInput={event => { if (dragging.current) controller.current.track(event.currentTarget.value); else { controller.current.setDay(event.currentTarget.value, true); controller.current.commit(); } }}
          onBlur={() => end(true)} />
      </div>
      <div className="ap-slider-labels" aria-hidden="true"><span>First day</span><span>Last day</span></div>
    </div>
    <span hidden ref={sink} />
  </div>;
}

export default function AutomaticOrdersStudy() {
  const [framed, setFramed] = useState(true);
  const [scale, setScale] = useState(.85);
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);
  const [stack, setStack] = useState(['picker']);
  const [draft, setDraft] = useState(freshDraft);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [landed, setLanded] = useState(null);
  const [tab, setTab] = useState('payments');
  // Tune panel: live optical offset for the round selection mark (debug aid).
  const [tuneOpen, setTuneOpen] = useState(false);
  const [nudge, setNudge] = useState(-1);
  useEffect(() => { try { const saved = localStorage.getItem('ao-select-nudge'); if (saved !== null) setNudge(Number(saved)); } catch {} }, []);
  const setNudgeSaved = value => { setNudge(value); try { localStorage.setItem('ao-select-nudge', String(value)); } catch {} };
  const phoneRef = useRef(null);
  const { pressProps } = usePointerPress(phoneRef);
  const keyboard = useInputSource(phoneRef);
  const surfaceRef = useRef(null), innerRef = useRef(null), presenceRef = useRef(null), backdropRef = useRef(null);
  const openerRef = useRef(null), timers = useRef([]), presenceAnimations = useRef([]);
  const step = current(stack);
  useKeepFocus(surfaceRef, step, open);
  const mode = 'tray';  // one resizing tray for the whole flow, like China
  const provider = providerById(draft.provider);
  const account = ACCOUNTS.find(item => item.id === draft.account);
  const update = patch => setDraft(value => ({ ...value, ...(typeof patch === 'function' ? patch(value) : patch) }));
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); };
  const nav = target => setStack(value => go(value, target));
  const goBack = () => setStack(back);
  const busy = draft.lookup === 'busy' || draft.activation !== 'idle';

  /* ---------- Main actions per step ---------- */
  const amountValid = value => amountToMinor(value) > 0;
  const mainActions = {
    // Find → (lookup) → Continue: the subscriber appears under the number, so
    // there is no separate "Is this you?" screen.
    number: draft.lookup === 'busy' ? { label: 'Looking up', busy: true }
      : draft.found ? { label: 'Continue', onClick: () => nav('rule') }
      : { label: 'Find', disabled: !validNumber(draft.number), onClick: lookup },
    limit: { label: 'Continue', disabled: !amountValid(draft.limit), onClick: () => nav('review') },
    amount: { label: 'Continue', disabled: !amountValid(draft.amount), onClick: () => nav('day') },
    day: { label: 'Continue', onClick: () => nav('review') },
    review: { label: 'Continue', onClick: () => nav('agreements') },
    // Agree, then the same tray becomes the code step.
    agreements: { label: 'Agree and continue', disabled: !draft.agreed.every(Boolean), onClick: () => { update({ accepted: true }); nav('otp'); } },
    terms: { label: 'Got it', onClick: goBack },
    otp: draft.activation === 'busy' ? { label: 'Activating', busy: true } : draft.activation === 'done' ? { label: 'Activated', success: true } : null
  };
  const action = mainActions[step] ?? null;

  /* ---------- Main surface: tray → full screen ---------- */
  const { measure, spring } = useTrayHeight(surfaceRef, innerRef, { head: HEAD, footer: Boolean(action), fixed: null, rounded: true, instant: keyboard });
  const [layers, drop] = useLayers(step, session, keyboard);
  const [titles, dropTitle] = useLayers(mode === 'tray' ? step : 'none', session, keyboard);

  function cancelPresence() { presenceAnimations.current.forEach(animation => animation.cancel()); presenceAnimations.current = []; }
  function openFlow() {
    cancelPresence(); timers.current.forEach(clearTimeout); timers.current = [];
    setDraft(freshDraft()); setStack(['picker']);
    setSession(value => value + 1); setOpen(true);
  }
  // Focus goes back to the opener once the screen behind is no longer inert:
  // focusing it while the tray was still open did nothing (plan 011 W2).
  const refocus = useRef(false);
  useLayoutEffect(() => {
    if (!open) { if (refocus.current) { refocus.current = false; openerRef.current?.focus({ preventScroll: true }); } return; }
    measure(true);
    // Opened from the keyboard: the tray is simply there (plan 011 W2).
    if (!keyboard.current) presenceAnimations.current = animateTrayPresence({ tray: presenceRef.current, backdrop: backdropRef.current,
      height: spring.current.value, opening: true, reduce: reducedMotion() });
    surfaceRef.current.focus({ preventScroll: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, session]);
  // `onClosed` runs once the tray is gone, so a result lands on a settled
  // screen (plan 011 W4, the lombard G3 rule). `instant`: a keyboard close.
  function closeFlow({ onClosed, instant = false } = {}) {
    cancelPresence();
    // Hide first, in the same frame: cancelling the animations drops their
    // forwards fill, and React's re-render (hidden) can land a frame later, so
    // the tray and the scrim would flash back for one frame.
    const hide = () => {
      presenceRef.current.hidden = true; backdropRef.current.hidden = true;
      cancelPresence(); refocus.current = true; setOpen(false); onClosed?.();
    };
    if (instant) { hide(); return; }
    const [slide, dim] = animateTrayPresence({ tray: presenceRef.current, backdrop: backdropRef.current,
      height: spring.current.value, opening: false, reduce: reducedMotion() });
    presenceAnimations.current = [slide, dim];
    slide.finished.then(hide).catch(() => {});
  }

  /* ---------- Flow ---------- */
  function pickTemplate(template) { update({ provider: template.provider, number: template.number, found: true, fromTemplate: true }); nav('rule'); }
  function pickProvider(item) { update({ provider: item.id, number: '', found: false, fromTemplate: false }); nav('number'); }
  function lookup() {
    update({ lookup: 'busy' });
    later(() => update({ lookup: 'idle', found: true }), LOOKUP_MS);
  }
  function chooseRule(rule) { update({ rule }); nav(afterRule(rule)); }
  function otpKey(key) {
    if (draft.activation !== 'idle') return;
    const otp = key === 'backspace' ? draft.otp.slice(0, -1) : /^\d$/.test(key) ? (draft.otp + key).slice(0, OTP_LENGTH) : draft.otp;
    update({ otp });
    if (otp.length === OTP_LENGTH) activate();
  }
  function activate() {
    update({ activation: 'busy' });
    later(() => {
      update({ activation: 'done' });
      later(() => {
        const order = orderSummary({ provider: providerById(draft.provider), number: draft.number, rule: draft.rule,
          amountText: formatInput(draft.rule === 'bill' ? draft.limit : draft.amount), day: draft.day });
        // Success holds in the button, the tray closes itself, then the order
        // lands in the list once the tray is gone (plan 011 W4).
        closeFlow({ onClosed: () => { setOrders(list => [order, ...list]); setLanded(order.id); } });
      }, SUCCESS_HOLD_MS);
    }, ACTIVATE_MS);
  }
  function reset() {
    cancelPresence(); timers.current.forEach(clearTimeout); timers.current = [];
    setOpen(false); setOrders(INITIAL_ORDERS); setLanded(null); setTab('payments');
    setDraft(freshDraft()); setStack(['picker']); setSession(value => value + 1);
  }
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* ---------- Content ---------- */
  const titleFor = name => name === 'providers' ? CATEGORIES.find(item => item.id === draft.category)?.name : STEPS[name]?.title;
  function renderMain(name) {
    // A reset clears the draft one render before old layers are replaced.
    if (!provider && !['picker', 'templates', 'categories', 'providers'].includes(name)) return null;
    switch (name) {
      // One decision: a saved template or a category. Each opens its own list.
      case 'picker':
        return <ListRows className="ao-rows">
          <ListRow leading={<Icon name="template" size="leading" />} onClick={() => nav('templates')}>Templates</ListRow>
          <ListRow leading={<Icon name="products" size="leading" />} onClick={() => nav('categories')}>Categories</ListRow>
        </ListRows>;
      case 'templates':
        return <ListRows className="ao-rows">{TEMPLATES.map(template => {
          const item = providerById(template.provider);
          return <ListRow key={template.id} leading={<Leading provider={item} />} subtitle={`${item.name} · ${formatNumber(template.number)}`} onClick={() => pickTemplate(template)}>{template.label}</ListRow>;
        })}</ListRows>;
      case 'categories': {
        const results = draft.query.trim() ? queryProviders(draft.query) : null;
        return <>
          <SearchField className="ao-search" value={draft.query} onChange={query => update({ query })} placeholder="Search providers" />
          {results ? <ListRows className="ao-rows">
            {results.length ? results.map(item => <ListRow key={item.id} leading={<Leading provider={item} />} tone={categoryOf(item).tone} onClick={() => pickProvider(item)}>{item.name}</ListRow>)
              : <p className="ao-empty" role="status">No providers found</p>}
          </ListRows> : <ListRows className="ao-rows">{CATEGORIES.map(category => <ListRow key={category.id} leading={<Leading category={category} />}
            onClick={() => { update({ category: category.id }); nav('providers'); }}>{category.name}</ListRow>)}</ListRows>}
        </>;
      }
      case 'providers':
        return <ListRows className="ao-rows">{queryProviders('', draft.category).map(item => <ListRow key={item.id} leading={<Leading provider={item} />} tone={categoryOf(item).tone} onClick={() => pickProvider(item)}>{item.name}</ListRow>)}</ListRows>;
      case 'number':
        return <>
          {/* Digits morph like the amount steps (Torph, digitMorph on easeOutExpo). */}
          <div className="ao-number" data-empty={!draft.number || undefined}>{draft.number
            ? <TextMorph as="span" duration={durations.digitMorph} ease={cubicBezier('easeOutExpo')} respectReducedMotion>{formatNumber(draft.number)}</TextMorph>
            : '000 000 000'}</div>
          <div className="ao-below" aria-live="polite">{draft.found
            ? <p className="ao-found"><strong>{provider.subscriber}</strong><span>{provider.address}</span></p>
            : <button type="button" className="ao-chip" onClick={() => update({ number: provider.demo })}>Use demo number</button>}</div>
          <Keypad className="ao-keypad" label="Subscriber number keypad" disabled={draft.lookup === 'busy'} onKey={key => update(value => ({ number: editNumber(value.number, key), found: false }))} keyProps={hiddenDot} />
        </>;
      case 'rule':
        return <ListRows className="ao-rows">{Object.entries(RULES).map(([id, rule]) => <ListRow key={id} leading={<Icon name={rule.icon} size="leading" />} tone={id === 'bill' ? 'gold' : 'blue'}
          onClick={() => chooseRule(id)}>{rule.title}</ListRow>)}</ListRows>;
      case 'limit':
      case 'amount':
        return <>
          <AmountDisplay className="ao-amount" value={formatInput(draft[name])} currency="₾" label={STEPS[name].title} active animate compact={false}
            caption={name === 'limit' ? 'Bills above this are skipped' : undefined} />
          <Keypad className="ao-keypad" onKey={pressed => update(value => ({ [name]: editAmount(value[name], pressed) }))} />
        </>;
      case 'day':
        return <DayPicker day={draft.day} onPick={day => update({ day })} />;
      case 'review': {
        const amountText = formatInput(draft.rule === 'bill' ? draft.limit : draft.amount);
        return <>
          {/* Subscriber: the number, then the provider's logo in place of its name. */}
          <ReceiptRows className="ao-receipt" rows={reviewRows({ provider, number: draft.number, rule: draft.rule, amountText, day: draft.day }).map(row => row.label === 'Subscriber' && provider.logo
            ? { ...row, value: <>{row.number}<img className="ao-receipt-logo" src={`/assets/providers/${provider.logo}`} alt={provider.name} width="24" height="24" draggable="false" /></> } : row)} />
          {/* How you pay, after a divider (Family's "Pay with"): one more receipt
              row; the whole row opens the account picker. */}
          <hr className="ao-receipt-divider" />
          <ReceiptRows className="ao-receipt" rows={[{ label: 'Pay from', className: 'ao-pay-from', value:
            <button type="button" onClick={() => nav('account')}>
              <CardArt size="chip" finish={account.card} />{account.name}<Icon name="select" size="inline" className="ao-pay-from__chevrons" />
            </button> }]} />
        </>;
      }
      default: return renderStep(name);
    }
  }
  // Transient steps (account, agreements, terms, code).
  function renderStep(name) {
    switch (name) {
      case 'account':
        // The account's card image, as on the review's Pay from row; just the balance below.
        return <ListRows className="ao-rows ao-account-rows">{ACCOUNTS.map(item => <ListRow key={item.id} leading={<CardArt size="thumb" finish={item.card} />} subtitle={item.balance}
          trailing={<SelectMark selected={item.id === draft.account} />}
          onClick={() => { update({ account: item.id }); nav('review'); }}>{item.name}</ListRow>)}</ListRows>;
      case 'agreements':
        // The user ticks each consent; nothing is pre-checked.
        return <>
          <ConsentList className="ao-checks" items={AGREEMENTS} checked={draft.agreed}
            onChange={(index, checked) => update(value => ({ agreed: value.agreed.map((item, i) => i === index ? checked : item) }))} />
          <button type="button" className="ao-link" onClick={() => nav('terms')}><span className="credo-inline-action">Terms and conditions</span></button>
        </>;
      case 'terms':
        return <div className="ao-terms" tabIndex={0}>
          <p>Payments are taken from the selected account according to the rule you set. You can change, pause or cancel an automatic payment from your list at any time.</p>
          <p>When a bill arrives, it is paid up to your maximum amount. If the bill is higher, nothing is taken and you are notified.</p>
          <p>If a month is shorter than your payment day, the payment is made on its last day.</p>
          <p>A monthly fee of {MONTHLY_FEE} is taken from the same account.</p>
        </div>;
      case 'otp':
        return <>
          <p className="ao-otp-copy">Code sent to 571 *** 385</p>
          <CodeInput className="ao-otp" value={draft.otp} length={OTP_LENGTH} />
          <div className="ao-hint ao-hint--center"><button type="button" className="ao-chip" disabled={draft.activation !== 'idle'} onClick={() => { update({ otp: DEMO_OTP }); activate(); }}>Use demo code {DEMO_OTP}</button></div>
          <Keypad className="ao-keypad" label="Code keypad" disabled={draft.activation !== 'idle'} onKey={otpKey} keyProps={hiddenDot} />
        </>;
      default: return null;
    }
  }

  /* ---------- Layout ---------- */
  useEffect(() => {
    const fit = () => {
      const size = framed ? IPHONE_FRAME : IPHONE_SCREEN;
      const top = window.innerWidth < 700 ? 152 : 88;
      setScale(Math.min(1, (window.innerWidth - 40) / size.width, Math.max(.6, (window.innerHeight - top - 24) / size.height)));
    };
    fit(); window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [framed]);

  // Family's tray control: one X. It closes the tray on the first step and
  // steps back one tray on every later step. No back chevron.
  const nested = stack.length > 1;
  const closeMain = () => { if (!busy) closeFlow({ instant: keyboard.current }); };
  const dismiss = () => { if (busy) return; if (nested) goBack(); else closeFlow({ instant: keyboard.current }); };

  return <>
    <div className="ap-tools"><PhoneFrameToggle enabled={framed} onToggle={() => setFramed(value => !value)} /><button type="button" onClick={reset}>Reset study</button><button type="button" aria-pressed={tuneOpen} onClick={() => setTuneOpen(open => !open)}>Tune</button></div>
    {tuneOpen && <div className="ao-tune" role="group" aria-label="Tune">
      <label htmlFor="ao-tune-nudge">Selection mark offset</label>
      <div className="ao-tune__row">
        <input id="ao-tune-nudge" type="range" min="-3" max="3" step="0.25" value={nudge} onChange={event => setNudgeSaved(Number(event.target.value))} />
        <output htmlFor="ao-tune-nudge">{nudge > 0 ? '+' : ''}{nudge.toFixed(2)} px</output>
      </div>
      <p>Negative moves the round marks left. Open Pay from to compare with the X.</p>
      <button type="button" onClick={() => setNudgeSaved(-1)}>Reset to −1 px</button>
    </div>}
    <main className="ap-stage" aria-label="Automatic payments prototype">
      <div className="ap-holder" style={{ '--phone-scale': scale, '--device-width': `${framed ? IPHONE_FRAME.width : IPHONE_SCREEN.width}px`, '--device-height': `${framed ? IPHONE_FRAME.height : IPHONE_SCREEN.height}px`, '--control-hit': `${44 / scale}px` }}>
        <IPhoneFrame enabled={framed}>
          <div ref={phoneRef} className="ao-phone" lang="en" style={{ ...credoTypographyStyle, ...credoColorStyle, '--credo-select-nudge': `${nudge}px` }} {...pressProps}>
            <div className="ao-screen" inert={open || undefined}>
              <PageHeader className="ao-page-header" title="Automatic orders" />
              <SegmentedControl className="ao-segments" label="Order type" value={tab} onChange={setTab}
                options={[{ id: 'transfers', label: 'Transfers' }, { id: 'payments', label: 'Payments' }]} />
              {/* Both lists share one slot and crossfade on one clock (no blank frame). */}
              <div className="ao-lists">
                <ListRows as="section" className="ao-orders" aria-label="Automatic payments" data-active={tab === 'payments' || undefined} inert={tab !== 'payments' || undefined}>
                  {orders.map(order => <OrderRow key={order.id} order={order} landed={order.id === landed} />)}
                </ListRows>
                <ListRows as="section" className="ao-orders" aria-label="Automatic transfers" data-active={tab === 'transfers' || undefined} inert={tab !== 'transfers' || undefined}>
                  {TRANSFER_ORDERS.map(order => <OrderRow key={order.id} order={order} />)}
                </ListRows>
              </div>
              <div className="ao-new">
                {/* Only the payment setup is prototyped; adding a transfer is not. */}
                <SecondaryButton ref={openerRef} onClick={openFlow} disabled={tab !== 'payments'}>
                  <TextMorph as="span" duration={durations.textSwap} ease={cubicBezier('textSwap')} respectReducedMotion>{tab === 'payments' ? 'Add payment' : 'Add transfer'}</TextMorph>
                </SecondaryButton>
              </div>
            </div>
            <div className="ap-status-bar ao-status" aria-hidden="true"><b>9:41</b><div><img src={statusIcon('cellular')} alt="" /><img src={statusIcon('wifi')} alt="" /><img src={statusIcon('battery')} alt="" /></div></div>
            <div className="ao-backdrop" ref={backdropRef} hidden={!open} onClick={closeMain} aria-hidden="true" />
            <div className="ao-presence" ref={presenceRef} hidden={!open}>
              {/* The shared Credo Tray: header (title, close), divider, body, footer. */}
              <Tray ref={surfaceRef} className="ao-surface" data-mode={mode} role="dialog" aria-modal="true"
                aria-label={titleFor(step)} tabIndex={-1}
                onKeyDown={event => { if (event.key === 'Escape') dismiss(); }}
                headerClassName="ao-head" titleClassName="ao-head__title"
                title={<span className="ao-titles"><Layers layers={titles} drop={dropTitle} className="ao-title" render={name => titleFor(name)} /></span>}
                onClose={closeMain} onBack={nested ? () => { if (!busy) goBack(); } : undefined} closeClassName="ao-close"
                dividerClassName="ao-head__divider" bodyClassName="ao-body"
                footer={<><div className="ao-feather" aria-hidden="true" /><Action action={action} /></>}>
                <div ref={innerRef} className="ao-inner">
                  <div className="ao-layers"><Layers layers={layers} drop={drop} render={renderMain} keypadSteps={KEYPAD_STEPS} /></div>
                </div>
              </Tray>
            </div>
            <div className="ao-home-indicator" aria-hidden="true" />
          </div>
        </IPhoneFrame>
      </div>
    </main>
    <div className="ap-demo-note">Prototype · automatic payments in GEL · demo data</div>
  </>;
}
