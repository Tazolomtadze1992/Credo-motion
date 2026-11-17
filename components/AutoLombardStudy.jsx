'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import AmountDisplay from './AmountDisplay';
import CodeInput from './CodeInput';
import ConsentList from './ConsentList';
import Icon from './Icon';
import Keypad from './Keypad';
import ListRow, { ListRows, SelectMark } from './ListRow';
import PageHeader from './PageHeader';
import OptionCard, { OptionCards } from './OptionCard';
import ProductCard, { ProductCards } from './ProductCard';
import ProductGlyph from './ProductGlyph';
import ReceiptRows from './ReceiptRows';
import SecondaryButton from './SecondaryButton';
import Tray from './Tray';
import UploadSlot from './UploadSlot';
import usePointerPress from './usePointerPress';
import IPhoneFrame, { IPHONE_FRAME, IPHONE_SCREEN, PhoneFrameToggle } from './IPhoneFrame';
import { Action, HEAD, Layers, reducedMotion, useInputSource, useKeepFocus, useLayers, useTrayHeight } from './TrayFlow';
import { animateTrayPresence } from '../lib/tray-presence.mjs';
import { credoColorStyle } from '../content/colors';
import { credoTypographyStyle } from '../content/typography';
import { amountToMinor, editAmount, formatInput } from '../lib/transfer-flow.mjs';
import { preloadImages } from '../lib/preload-images.mjs';
import {
  AMOUNT_MAX, AMOUNT_MIN, ANNUAL_RATE, CAR_LOANS, CATEGORIES, CONSENTS, DEMO_OTP, INSURERS, LOANS, NEEDS,
  OTP_LENGTH, PHOTOS, PRELOAD_IMAGES, PRODUCTS, trayOmega, TERMS, amountInRange, back, current, effectiveRate, formatGel, formatPercent, go,
  monthlyPayment, returnTo
} from '../lib/auto-lombard-flow.mjs';

// Auto lombard study (plan 007). The whole path is one resizing tray, like
// China and Automatic orders (user request 2026-11-16): it grows from
// "Request a new product" on Products and steps through the flow; X closes on
// the first step and steps back after that (decided tray rules).

const asset = name => `/assets/lombard/${name}`;
const statusIcon = name => `/assets/transfers/${name}.svg`;
const UPLOAD_MS = 600, SEND_MS = 1200, SUCCESS_HOLD_MS = 900;
const hiddenDot = key => key === '.' ? { disabled: true, 'aria-hidden': true, tabIndex: -1, className: 'ao-key-hidden' } : undefined;
const insurerById = id => INSURERS.find(item => item.id === id);
const LISTS = { category: CATEGORIES, loans: LOANS, car: CAR_LOANS };
const NEXT = { category: { loans: 'loans' }, loans: { car: 'car' }, car: { lombard: 'start' } };

const TABS = [['home', 'Home'], ['products', 'Products'], ['operations', 'Operations'], ['finances', 'Finances'], ['more', 'More']];
const KEYPAD_STEPS = ['amount', 'otp'];

const TITLES = {
  category: 'New product', loans: 'Loans and installments', car: 'Car loans', start: 'You will need',
  amount: 'Loan amount', term: 'Term', insurance: 'Insurance', 'insurance-info': 'About insurance',
  registration: 'Registration certificate', method: 'Show your car',
  film: 'Film your car', video: 'Car video', photos: 'Car photos', vin: 'Where to find the VIN',
  review: 'Check your loan', terms: 'Terms', otp: 'Enter the code'
};

function freshDraft() {
  return {
    amount: '0', term: 12, insurer: null, registration: { front: 'empty', back: 'empty' },
    video: 'empty', photos: Object.fromEntries(PHOTOS.map(photo => [photo.id, 'empty'])), engineFailed: false,
    consents: CONSENTS.map(() => false), otp: '', sending: 'idle', fromReview: false
  };
}

export default function AutoLombardStudy() {
  const [framed, setFramed] = useState(true);
  const [scale, setScale] = useState(.85);
  const [draft, setDraft] = useState(freshDraft);
  const [open, setOpen] = useState(false);
  const [stack, setStack] = useState(['category']);
  const [session, setSession] = useState(0);
  const phoneRef = useRef(null);
  const { pressProps } = usePointerPress(phoneRef);
  const keyboard = useInputSource(phoneRef);
  const surfaceRef = useRef(null), innerRef = useRef(null), presenceRef = useRef(null), backdropRef = useRef(null);
  const openerRef = useRef(null), timers = useRef([]), presenceAnimations = useRef([]);
  const step = current(stack);
  useKeepFocus(surfaceRef, step, open);
  // The step the tray is moving from, so one long move can use a faster spring (plan 010 G5).
  const [move, setMove] = useState({ from: null, to: step });
  if (move.to !== step) setMove({ from: move.to, to: step });
  const update = patch => setDraft(value => ({ ...value, ...(typeof patch === 'function' ? patch(value) : patch) }));
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); };
  const nav = target => setStack(value => go(value, target));
  const goBack = () => setStack(back);
  const amount = amountToMinor(draft.amount) / 100;
  const insurer = insurerById(draft.insurer);
  const photosDone = PHOTOS.filter(photo => draft.photos[photo.id] === 'done').length;
  const busy = draft.sending !== 'idle';

  /* ---------- Flow ---------- */
  // An edit from the review returns to that review (decided rule).
  const next = target => {
    if (draft.fromReview) { update({ fromReview: false }); setStack(value => returnTo(value, 'review')); }
    else nav(target);
  };
  function chooseInsurer(id) { update({ insurer: id }); next('registration'); }
  function addRegistration(side) {
    update(value => ({ registration: { ...value.registration, [side]: 'uploading' } }));
    later(() => update(value => ({ registration: { ...value.registration, [side]: 'done' } })), UPLOAD_MS);
  }
  function addPhoto(id) {
    // Demo of the error state: the first engine photo comes back unusable.
    const fails = id === 'engine' && !draft.engineFailed;
    update(value => ({ photos: { ...value.photos, [id]: 'uploading' } }));
    later(() => update(value => ({ engineFailed: value.engineFailed || fails, photos: { ...value.photos, [id]: fails ? 'error' : 'done' } })), UPLOAD_MS);
  }
  // Open camera (simulated): the guide gives way to the video step.
  function recordVideo() {
    update({ video: 'uploading' });
    setStack(value => [...value.slice(0, -1), 'video']);
    later(() => update({ video: 'done' }), UPLOAD_MS);
  }
  function otpKey(key) {
    if (busy) return;
    const otp = key === 'backspace' ? draft.otp.slice(0, -1) : /^\d$/.test(key) ? (draft.otp + key).slice(0, OTP_LENGTH) : draft.otp;
    update({ otp });
    if (otp.length === OTP_LENGTH) send();
  }
  // As in Automatic orders: the button goes Sending → Sent, the tray closes and
  // the request lands where it lives (the Loans card on Products).
  function send() {
    update({ sending: 'busy' });
    later(() => {
      update({ sending: 'done' });
      // No Under review badge on Products (user 2026-11-17: not needed); the
      // tray closes after Request sent and Products stays as it was.
      later(() => closeFlow(), SUCCESS_HOLD_MS);
    }, SEND_MS);
  }

  /* ---------- Footer action per step: one button whose label morphs ---------- */
  const registrationDone = draft.registration.front === 'done' && draft.registration.back === 'done';
  const actions = {
    start: { label: 'Start', onClick: () => nav('amount') },
    amount: { label: draft.fromReview ? 'Save' : 'Continue', disabled: !amountInRange(amount), onClick: () => next('insurance') },
    'insurance-info': { label: 'Got it', onClick: goBack },
    registration: { label: 'Continue', disabled: !registrationDone, onClick: () => next('method') },
    film: { label: 'Open camera', onClick: recordVideo },
    video: { label: 'Continue', disabled: draft.video !== 'done', onClick: () => next('review') },
    // Family's counting button: the label counts until all ten are in.
    photos: photosDone < PHOTOS.length ? { label: `${photosDone} of ${PHOTOS.length} photos`, disabled: true } : { label: 'Continue', onClick: () => next('review') },
    vin: { label: 'Got it', onClick: goBack },
    review: { label: 'Continue', onClick: () => nav('terms') },
    terms: { label: 'Send request', disabled: !draft.consents.every(Boolean), onClick: () => nav('otp') },
    otp: draft.sending === 'busy' ? { label: 'Sending', busy: true } : draft.sending === 'done' ? { label: 'Request sent', success: true } : null
  };
  const action = actions[step] ?? null;

  /* ---------- Tray presence (shared TrayFlow mechanics) ---------- */
  const { measure, spring } = useTrayHeight(surfaceRef, innerRef, { head: HEAD, footer: Boolean(action), fixed: null, rounded: true, omega: trayOmega(move.from, step), instant: keyboard });
  const [layers, drop] = useLayers(step, session, keyboard);
  const [titles, dropTitle] = useLayers(step, session, keyboard);

  function cancelPresence() { presenceAnimations.current.forEach(animation => animation.cancel()); presenceAnimations.current = []; }
  function openFlow(first = 'category') {
    cancelPresence(); timers.current.forEach(clearTimeout); timers.current = [];
    setDraft(freshDraft()); setStack([first]); setSession(value => value + 1); setOpen(true);
    preloadImages(PRELOAD_IMAGES.map(asset));
  }
  // New product stays a tray step (user decision 2026-11-16, over full-screen pages).
  function pick(list, item) {
    const target = NEXT[list][item.id];
    if (target) nav(target);
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
  // `instant`: a keyboard close (plan 011 W2) hides at once.
  function closeFlow({ onClosed, instant = false } = {}) {
    cancelPresence();
    // Hidden in the same frame the slide ends, so nothing flashes back (decided rule).
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
  function reset() {
    cancelPresence(); timers.current.forEach(clearTimeout); timers.current = [];
    setOpen(false); setDraft(freshDraft()); setStack(['category']); setSession(value => value + 1);
  }
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const nested = stack.length > 1;
  const closeMain = () => { if (!busy) closeFlow({ instant: keyboard.current }); };
  const dismiss = () => { if (busy) return; if (nested) goBack(); else closeFlow({ instant: keyboard.current }); };

  /* ---------- Steps ---------- */
  function renderStep(name) {
    switch (name) {
      case 'category':
      case 'loans':
      case 'car':
        // Shared Option card: the product's glyph and colour, as on the Products cards.
        return <OptionCards className="al-options">{LISTS[name].map(item => <OptionCard key={item.id} icon={<ProductGlyph name={item.glyph} size={24} />}
          color={item.color} title={item.name} subtitle={item.subtitle} onClick={() => pick(name, item)} />)}</OptionCards>;
      case 'start':
        // A plain checklist (no illustration, user 2026-11-16), drawn with the
        // same List row style as every other tray step. No stagger: the step
        // handoff is its only entrance (plan 010 G1, user 2026-11-17).
        return <ListRows className="ao-rows al-needs">{NEEDS.map(item => <ListRow key={item.text}
          leading={<Icon name={item.icon} size="leading" />} trailing={false}>{item.text}</ListRow>)}</ListRows>;
      case 'amount': {
        // Aave's Add Money: the amount, one quiet line, one control, the keypad.
        // In a tray the amount keeps the default size (bigger is for full screens).
        const caption = amount > AMOUNT_MAX ? `Up to ${AMOUNT_MAX.toLocaleString('en-US')} ₾`
          : amountInRange(amount) ? `≈ ${formatGel(monthlyPayment(amount, draft.term))} a month` : `From ${AMOUNT_MIN} to ${AMOUNT_MAX.toLocaleString('en-US')} ₾`;
        return <>
          <AmountDisplay className="ao-amount" value={formatInput(draft.amount)} currency="₾" label="Loan amount" active animate compact={false} caption={caption} />
          <div className="al-select-row">
            <button type="button" className="al-select" onClick={() => nav('term')} aria-label={`Term: ${draft.term} months. Change`}>
              <span className="al-select__visual">{draft.term} months<Icon name="select" size="inline" /></span>
            </button>
          </div>
          <Keypad className="ao-keypad" onKey={key => update(value => ({ amount: editAmount(value.amount, key) }))} keyProps={hiddenDot} />
        </>;
      }
      case 'term':
        // Pick one, returns at once (decided Selection rule).
        return <ListRows className="ao-rows">{TERMS.map(months => <ListRow key={months}
          value={formatGel(monthlyPayment(amount || AMOUNT_MIN, months))} trailing={<SelectMark selected={months === draft.term} />}
          onClick={() => { update({ term: months }); goBack(); }}>{months} months</ListRow>)}</ListRows>;
      case 'insurance':
        return <>
          <ListRows className="ao-rows">{INSURERS.map(item => <ListRow key={item.id}
            leading={<img className="al-logo" src={asset(item.logo)} alt="" width="40" height="40" draggable="false" />}
            value={item.rate} trailing={<SelectMark selected={item.id === draft.insurer} />}
            onClick={() => chooseInsurer(item.id)}>{item.name}</ListRow>)}</ListRows>
          <button type="button" className="ao-link" onClick={() => nav('insurance-info')}><span className="credo-inline-action">About insurance</span></button>
        </>;
      case 'insurance-info':
        return <p className="al-guide__text">The car is insured while it secures the loan. The insurance rate is added to your monthly payment.</p>;
      case 'registration':
        // No "See an example" step (user 2026-11-17: not needed here).
        return <div className="al-pair">
          {['front', 'back'].map(side => <UploadSlot key={side} label={side === 'front' ? 'Front' : 'Back'} icon="file"
            state={draft.registration[side]} image={asset('guide-id.jpg')} onClick={() => addRegistration(side)} />)}
        </div>;
      case 'method':
        return <ListRows className="ao-rows al-rows--large">
          <ListRow size="large" leading={<Icon name="video" size="leading" />} subtitle="About a minute" badge={<span className="al-badge">Recommended</span>}
            onClick={() => nav('film')}>Video</ListRow>
          <ListRow size="large" leading={<Icon name="camera" size="leading" />} subtitle={`${PHOTOS.length} photos`}
            onClick={() => nav('photos')}>Photos</ListRow>
        </ListRows>;
      case 'film':
        return <div className="al-guide">
          <img className="al-guide__image" src={asset('guide-video.jpg')} alt="A camera moving in a circle around the car, starting at the front left" width="342" height="264" draggable="false" />
          <ol className="al-steps">
            <li>Stand in front of the car.</li>
            <li>Walk slowly around it, left to right.</li>
            <li>Keep the whole car in the frame.</li>
          </ol>
        </div>;
      case 'video':
        return <UploadSlot className="al-video" wide kind="video" label="Car video" state={draft.video} icon="video"
          image={asset('car-photo.jpg')} onClick={() => nav('film')} />;
      case 'photos':
        return <div className="al-photos">
          {['outside', 'inside'].map(group => <section key={group} className="al-photo-group" aria-label={group === 'outside' ? 'Outside' : 'Inside'}>
            <h3 className="al-group-label">{group === 'outside' ? 'Outside' : 'Inside'}</h3>
            <div className="al-grid">{PHOTOS.filter(photo => photo.group === group).map(photo => <div key={photo.id} className="al-slot">
              <UploadSlot label={photo.label} state={draft.photos[photo.id]} image={asset('car-photo.jpg')}
                error="Not clear. Retake." onClick={() => addPhoto(photo.id)} />
              {photo.guide && <button type="button" className="al-slot__info" aria-label="Where to find the VIN" onClick={() => nav('vin')}><Icon name="info" size="small" /></button>}
            </div>)}</div>
          </section>)}
          <div className="ao-hint"><button type="button" className="ao-chip" onClick={() => update({ photos: Object.fromEntries(PHOTOS.map(photo => [photo.id, 'done'])) })}>Use demo photos</button></div>
        </div>;
      case 'vin':
        return <div className="al-guide">
          <img className="al-guide__image" src={asset('guide-vin.jpg')} alt="The car with three numbered places where the VIN can be found" width="342" height="240" draggable="false" />
          <ol className="al-steps">
            <li>Under the bonnet, on the engine bay.</li>
            <li>Bottom corner of the windscreen, driver’s side.</li>
            <li>The driver’s door frame.</li>
          </ol>
        </div>;
      case 'review': {
        const edit = target => <button type="button" className="al-edit" onClick={() => { update({ fromReview: true }); nav(target); }}>Edit</button>;
        return <ReceiptRows className="ao-receipt" rows={[
          { label: 'Amount', value: <>{formatGel(amount)}{edit('amount')}</> },
          { label: 'Term', value: `${draft.term} months` },
          { label: 'Monthly payment', value: formatGel(monthlyPayment(amount, draft.term)) },
          { label: 'Interest rate', value: formatPercent(ANNUAL_RATE) },
          { label: 'Effective rate', value: formatPercent(effectiveRate()) },
          { label: 'Insurance', value: <>{insurer && <img className="ao-receipt-logo" src={asset(insurer.logo)} alt="" width="24" height="24" draggable="false" />}{insurer?.name ?? '—'}{edit('insurance')}</> }
          // No Car row (user 2026-11-17: not needed).
        ]} />;
      }
      case 'terms':
        return <>
          <div className="al-terms">
            <p>The loan is secured by your car. You keep using it while you repay.</p>
            <p>If payments stop, the bank may sell the car to cover the debt, as set out in the agreement.</p>
          </div>
          <ConsentList className="al-consents" items={CONSENTS} checked={draft.consents}
            onChange={(index, checked) => update(value => ({ consents: value.consents.map((item, i) => i === index ? checked : item) }))} />
          {/* Five consents: one text button ticks them all (user 2026-11-17). It sits under the list, the
              same link as "About insurance" under the insurers (user: "move … under checkboxes"). */}
          <button type="button" className="ao-link" onClick={() => update(value => ({ consents: value.consents.map(() => !value.consents.every(Boolean)) }))}>
            <span className="credo-inline-action">{draft.consents.every(Boolean) ? 'Clear all' : 'Select all'}</span>
          </button>
        </>;
      case 'otp':
        return <>
          <p className="ao-otp-copy">Code sent to 571 *** 385</p>
          <CodeInput className="ao-otp" value={draft.otp} length={OTP_LENGTH} />
          <div className="ao-hint ao-hint--center"><button type="button" className="ao-chip" disabled={busy} onClick={() => { update({ otp: DEMO_OTP }); send(); }}>Use demo code {DEMO_OTP}</button></div>
          <Keypad className="ao-keypad" label="Code keypad" disabled={busy} onKey={otpKey} keyProps={hiddenDot} />
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

  return <>
    <div className="ap-tools"><PhoneFrameToggle enabled={framed} onToggle={() => setFramed(value => !value)} /><button type="button" onClick={reset}>Reset study</button></div>
    <main className="ap-stage" aria-label="Auto lombard prototype">
      <div className="ap-holder" style={{ '--phone-scale': scale, '--device-width': `${framed ? IPHONE_FRAME.width : IPHONE_SCREEN.width}px`, '--device-height': `${framed ? IPHONE_FRAME.height : IPHONE_SCREEN.height}px`, '--control-hit': `${44 / scale}px` }}>
        <IPhoneFrame enabled={framed}>
          <div ref={phoneRef} className="ao-phone al-phone" lang="en" style={{ ...credoTypographyStyle, ...credoColorStyle }} {...pressProps}>
            {/* Products tab: one colourful card per product, like Family's wallets. */}
            <div className="al-products" inert={open || undefined}>
              <PageHeader className="ao-page-header" title="Products" back={false} />
              <ProductCards className="al-product-grid">{PRODUCTS.map(item => <ProductCard key={item.id} icon={<ProductGlyph name={item.id} />} color={item.color}
                title={item.short} detail={item.balance} onClick={() => {}} />)}</ProductCards>
              <div className="al-new"><SecondaryButton ref={openerRef} onClick={() => openFlow()}>Request a new product</SecondaryButton></div>
              <nav className="al-tabs" aria-hidden="true">{TABS.map(([id, label]) => <span key={id} className="al-tab" data-active={id === 'products' || undefined}>
                <span className="al-tab__icon" style={{ '--tab-icon': `url(/assets/home/tab-${id}.svg)` }} />{label}</span>)}</nav>
            </div>

            <div className="ap-status-bar ao-status" aria-hidden="true"><b>9:41</b><div><img src={statusIcon('cellular')} alt="" /><img src={statusIcon('wifi')} alt="" /><img src={statusIcon('battery')} alt="" /></div></div>
            <div className="ao-backdrop" ref={backdropRef} hidden={!open} onClick={closeMain} aria-hidden="true" />
            <div className="ao-presence" ref={presenceRef} hidden={!open}>
              {/* The shared Credo Tray: one surface for the whole flow. */}
              <Tray ref={surfaceRef} className="ao-surface" role="dialog" aria-modal="true" aria-label={TITLES[step]} tabIndex={-1}
                onKeyDown={event => { if (event.key === 'Escape') dismiss(); }}
                headerClassName="ao-head" titleClassName="ao-head__title"
                title={<span className="ao-titles"><Layers layers={titles} drop={dropTitle} className="ao-title" render={name => TITLES[name]} /></span>}
                onClose={closeMain} onBack={nested ? () => { if (!busy) goBack(); } : undefined} closeClassName="ao-close"
                dividerClassName="ao-head__divider" bodyClassName="ao-body"
                footer={<><div className="ao-feather" aria-hidden="true" /><Action action={action} /></>}>
                <div ref={innerRef} className="ao-inner">
                  <div className="ao-layers"><Layers layers={layers} drop={drop} render={renderStep} keypadSteps={KEYPAD_STEPS} /></div>
                </div>
              </Tray>
            </div>
            <div className="ao-home-indicator" aria-hidden="true" />
          </div>
        </IPhoneFrame>
      </div>
    </main>
    <div className="ap-demo-note">Prototype · auto lombard in GEL · demo data</div>
  </>;
}
