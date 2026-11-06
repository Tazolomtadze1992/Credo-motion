'use client';

import { useEffect, useRef, useState } from 'react';
import TransferAmountInput from './TransferAmountInput';
import IPhoneFrame, { IPHONE_SCREEN, IPHONE_FRAME, PhoneFrameToggle } from './IPhoneFrame';
import { editAmount, amountToMinor, formatInput } from '../lib/transfer-flow.mjs';
import { createCalendar, dayDescription } from '../lib/payment-day.mjs';
import { createPaymentTray } from '../lib/automatic-payments-motion.mjs';
import { createPaymentPresence } from '../lib/payment-tray-presence.mjs';

const icon = name => `/assets/transfers/${name}.svg`;
function Chevron({ left = false }) { return <img className={left ? 'ap-chevron-left' : ''} src={icon('chevron')} width="24" height="24" alt="" draggable="false" />; }
function RepeatIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 10V7a3 3 0 0 1 3-3h11m-3-3 3 3-3 3M20 14v3a3 3 0 0 1-3 3H6m3 3-3-3 3-3" /></svg>; }

function Calendar() {
  return <div className="ap-calendar" aria-hidden="true">
    <div className="ap-calendar-stack ap-calendar-stack--back" /><div className="ap-calendar-stack" />
    <div className="ap-calendar-header">On the</div>
    <div className="ap-calendar-body">
      <div className="ap-calendar-half ap-calendar-half--top"><span className="ap-calendar-copy" data-calendar-top>1</span></div>
      <div className="ap-calendar-half ap-calendar-half--bottom"><span className="ap-calendar-copy" data-calendar-bottom>1</span></div>
      <div className="ap-calendar-leaf" data-calendar-leaf>
        <div className="ap-leaf-face ap-leaf-front"><span className="ap-calendar-copy" data-front-copy>1</span><div className="ap-leaf-shade" data-leaf-shade /></div>
        <div className="ap-leaf-face ap-leaf-back"><span className="ap-calendar-copy" data-back-copy>2</span><div className="ap-leaf-shade" data-leaf-shade /></div>
      </div>
      <div className="ap-calendar-seam" />
    </div>
  </div>;
}

export default function AutomaticPaymentsStudy() {
  const [view, setView] = useState('amount');
  const [open, setOpen] = useState(true);
  const [present, setPresent] = useState(true);
  const [amount, setAmount] = useState('100');
  const [amountMotion, setAmountMotion] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [timeline, setTimeline] = useState(false);
  const [framed, setFramed] = useState(true);
  const [scale, setScale] = useState(.85);
  const sheetRef = useRef(null), calendarRef = useRef(null), rangeRef = useRef(null);
  const fillRef = useRef(null), descriptionRef = useRef(null), tray = useRef(null), calendar = useRef(null);
  const reopenRef = useRef(null), pointer = useRef(false);
  const presenceRef = useRef(null), backdropRef = useRef(null), presence = useRef(null);
  const valid = amountToMinor(amount) > 0;

  useEffect(() => {
    tray.current = createPaymentTray({ sheet: sheetRef.current, onView: setView, onTimeline: setTimeline });
    calendar.current = createCalendar({ root: calendarRef.current, range: rangeRef.current, fill: fillRef.current,
      description: descriptionRef.current, onCommit: setSelectedDay });
    presence.current = createPaymentPresence({ layer: presenceRef.current, sheet: sheetRef.current,
      backdrop: backdropRef.current, onPresent: setPresent });
    return () => { tray.current?.destroy(); calendar.current?.destroy(); presence.current?.destroy(); };
  }, []);
  useEffect(() => {
    const fit = () => {
      const size = framed ? IPHONE_FRAME : IPHONE_SCREEN;
      const top = window.innerWidth < 700 ? 152 : 88;
      setScale(Math.min(1, (window.innerWidth - 40) / size.width, Math.max(.6, (window.innerHeight - top - (timeline ? 280 : 24)) / size.height)));
    };
    fit(); window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [timeline, framed]);
  useEffect(() => {
    if (open) sheetRef.current?.focus({ preventScroll: true });
    else if (!present) reopenRef.current?.focus({ preventScroll: true });
  }, [open, present, view]);
  useEffect(() => {
    const release = () => sheetRef.current?.querySelectorAll('[data-pointer-pressed]').forEach(node => node.removeAttribute('data-pointer-pressed'));
    window.addEventListener('pointerup', release); window.addEventListener('pointercancel', release); window.addEventListener('blur', release);
    return () => { window.removeEventListener('pointerup', release); window.removeEventListener('pointercancel', release); window.removeEventListener('blur', release); };
  }, []);
  function pointerPress(event) {
    const button = event.target.closest('button');
    if (event.isPrimary && event.button === 0 && button && !button.disabled) button.setAttribute('data-pointer-pressed', '');
  }
  const go = (next, instant = false) => { setAmountMotion(false); tray.current?.setView(next, instant); };
  const commit = () => calendar.current?.commit();
  function beginDayDrag(event) {
    if (!event.isPrimary || event.button !== 0) return;
    pointer.current = true; calendar.current?.beginDrag();
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function finishDayDrag(instant = false) {
    if (!pointer.current) return;
    pointer.current = false; calendar.current?.endDrag(instant);
  }
  function back(instant) { commit(); go('amount', instant); }
  function close(instant = false) {
    finishDayDrag(true); commit(); calendar.current?.settle(); tray.current?.pause();
    setOpen(false); presence.current?.setOpen(false, instant);
  }
  function reopen(instant = false) {
    if (!presence.current?.isPresent()) go('amount', true);
    setOpen(true); presence.current?.setOpen(true, instant);
  }
  function reset() {
    setAmount('100'); setAmountMotion(false); setSelectedDay(1); calendar.current?.setDay(1, true);
    tray.current?.setView('amount', true); setOpen(true); presence.current?.setOpen(true, true);
  }
  function digit(key, animate = true) { setAmountMotion(animate); setAmount(value => editAmount(value, key)); }
  function primary(event) {
    if (!valid) return;
    if (view === 'amount') go('day', event.detail === 0);
    else back(event.detail === 0);
  }
  function keydown(event) {
    if (event.key === 'Escape') { event.preventDefault(); if (view === 'day') back(true); else close(true); return; }
    if (view === 'amount' && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const key = /^\d$/.test(event.key) ? event.key : event.key === '.' || event.key === ',' ? '.' : event.key === 'Backspace' ? 'backspace' : event.key === 'Delete' ? 'clear' : null;
      if (key !== null) { event.preventDefault(); digit(key, false); return; }
      if (event.key === 'Enter' && event.target.tagName !== 'BUTTON') { event.preventDefault(); if (valid) go('day', true); return; }
    }
    if (event.key === 'Tab') {
      const controls = [...sheetRef.current.querySelectorAll('button, input')].filter(node => !node.disabled && node.tabIndex >= 0 && !node.closest('[inert]'));
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && (event.target === first || event.target === sheetRef.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && event.target === last) { event.preventDefault(); first?.focus(); }
    }
  }
  return <>
    <div className="ap-tools"><PhoneFrameToggle enabled={framed} onToggle={() => setFramed(value => !value)} /><button onClick={reset}>Reset study</button><button onClick={() => tray.current?.toggleTimeline()}>{timeline ? 'Hide timeline' : 'Show timeline'}</button></div>
    <main className="ap-stage" style={{ paddingBottom: timeline ? 280 : 24 }} aria-label="Automatic payments prototype">
      <div className="ap-holder" style={{ '--phone-scale': scale, '--device-width': `${framed ? IPHONE_FRAME.width : IPHONE_SCREEN.width}px`, '--device-height': `${framed ? IPHONE_FRAME.height : IPHONE_SCREEN.height}px`, '--control-hit': `${44 / scale}px` }}>
        <IPhoneFrame enabled={framed}>
        <div className="ap-phone">
          <div className="ap-background" inert={present}>
            <header className="ap-page-header"><Chevron left /><h1 lang="ka">ავტომატური გადახდები</h1></header>
            <div className="ap-overview"><div className="ap-feature-icon"><RepeatIcon /></div><h2>Your bills.<br />Taken care of.</h2><p>Choose when to pay.<br />We’ll take it from there.</p><button ref={reopenRef} onClick={event => reopen(event.detail === 0)}>Set up a payment <span>＋</span></button></div>
            <div className="ap-services"><span>EVERYDAY PAYMENTS</span><div><span className="ap-service-symbol">⌂</span><span>Home & utilities<small>Keep the essentials covered</small></span><Chevron /></div><div><span className="ap-service-symbol">↗</span><span>Internet & mobile<small>Stay connected, automatically</small></span><Chevron /></div></div>
          </div>
          <div className="ap-status-bar" aria-hidden="true"><b>9:41</b><div><img src={icon('cellular')} alt="" /><img src={icon('wifi')} alt="" /><img src={icon('battery')} alt="" /></div></div>
          <div className="ap-backdrop" ref={backdropRef} onClick={event => close(event.detail === 0)} aria-hidden="true" />
          <div className="ap-sheet-presence" ref={presenceRef}>
          <section className="ap-sheet" ref={sheetRef} inert={!open} aria-hidden={!open} role="dialog" aria-modal="true" aria-label={view === 'amount' ? 'Payment amount' : 'Payment day'} tabIndex={-1} onKeyDown={keydown} onPointerDown={pointerPress}>
            <header className="ap-sheet-header"><button className="transfer-close ap-sheet-back" type="button" aria-label="Back to amount" disabled={view !== 'day'} aria-hidden={view !== 'day'} tabIndex={view === 'day' ? 0 : -1} onClick={event => back(event.detail === 0)}><Chevron left /></button><h2><span data-ap-title="amount" aria-hidden={view !== 'amount'}>Payment amount</span><span data-ap-title="day" aria-hidden={view !== 'day'}>Payment day</span></h2><button className="transfer-close ap-close" aria-label="Close automatic payments" onClick={event => close(event.detail === 0)}><img src={icon('close')} alt="" /></button></header>
            <div className="ap-divider" />
            <div className="ap-content-mask">
              <div className="ap-panel-mask" data-ap-mask="amount"><div className="ap-panel ap-amount-panel" data-ap-panel="amount" inert={view !== 'amount'} aria-hidden={view !== 'amount'}><div className="ap-panel-body">
                <div className="transfer-money-value ap-amount"><span className="transfer-money-number"><span>₾</span><TransferAmountInput value={formatInput(amount)} label="Payment amount in GEL" active={view === 'amount' && open} animate={amountMotion} /></span></div>
                <div className="ap-frequency" aria-label="Payment frequency"><span className="ap-frequency-oneoff">One-off</span><button type="button" aria-label={`Choose monthly payment day, ${dayDescription(selectedDay)}`} onClick={event => { if (valid) go('day', event.detail === 0); }} disabled={!valid}><span>Monthly</span><svg viewBox="0 0 12 16" width="12" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3.5 5 2.5-2.5L8.5 5m-5 6L6 13.5 8.5 11" /></svg></button></div>
                <div className="transfer-keypad ap-keypad" aria-label="Amount keypad">{['1','2','3','4','5','6','7','8','9','.','0','backspace'].map(key => <button type="button" key={key} aria-label={key === 'backspace' ? 'Delete digit' : key === '.' ? 'Decimal point' : key} onClick={event => digit(key, event.detail !== 0)}><span className="transfer-key-visual">{key === 'backspace' ? <span className="transfer-delete-chevron"><Chevron /></span> : key}</span></button>)}</div>
              </div></div></div>
              <div className="ap-panel-mask" data-ap-mask="day"><div className="ap-panel ap-day-panel" data-ap-panel="day" inert={view !== 'day'} aria-hidden={view !== 'day'}><div className="ap-panel-body">
                <div ref={calendarRef}><Calendar /></div>
                <div className="ap-day-control"><div className="ap-slider"><div className="ap-slider-track"><div ref={fillRef} /></div><input ref={rangeRef} type="range" min="1" max="31" step="1" defaultValue="1" aria-label="Day of month" aria-valuetext="On day 1 of every month" onPointerDown={beginDayDrag} onPointerUp={() => finishDayDrag()} onPointerCancel={() => finishDayDrag(true)} onLostPointerCapture={() => finishDayDrag()} onKeyDown={() => { pointer.current = false; calendar.current?.prepareKeyboard(); }} onInput={event => { if (pointer.current) calendar.current?.track(event.currentTarget.value); else { calendar.current?.setDay(event.currentTarget.value, true); commit(); } }} onBlur={() => { finishDayDrag(true); commit(); }} /></div>
                <div className="ap-slider-labels" aria-hidden="true"><span>First Day</span><span>Last Day</span></div></div>
                <p className="ap-date-description" ref={descriptionRef}>{dayDescription(1)}</p>
              </div></div></div>
            </div>
            <button className="transfer-primary ap-primary" type="button" disabled={!valid} aria-label={view === 'day' ? 'Save payment day and continue' : 'Continue'} onClick={primary}><span className="transfer-primary-visual"><span className="transfer-primary-press"><span className="transfer-entry-label">Continue</span></span></span></button>
          </section>
          </div>
          <div className="ap-home-indicator" aria-hidden="true" />
        </div>
        </IPhoneFrame>
      </div>
    </main>
    <div className="ap-demo-note">Prototype · recurring payments in GEL</div>
  </>;
}
