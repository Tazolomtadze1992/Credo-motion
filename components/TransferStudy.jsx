'use client';

import { useEffect, useRef, useState } from 'react';
import { FormatOn, ThousandStyle, formatValueForDisplay } from 'numora';
import { TextMorph } from 'torph';
import TransferAmountInput from './TransferAmountInput';
import IPhoneFrame, { PhoneFrameToggle } from './IPhoneFrame';
import { CURRENCY, CURRENCY_SYMBOL, MAX_AMOUNT, RECIPIENT_NAME, PRESETS, VIEWS, VIEW_KEYS, METHODS, backTarget, amountToMinor, editAmount, formatAmount, simulateTransfer } from '../lib/transfer-flow.mjs';
import { createTransferMotion } from '../lib/transfer-motion.mjs';

const asset = (name, format = 'svg') => `/assets/transfers/${name}.${format}`;
const amountFormat = { formatOn: FormatOn.Change, thousandSeparator: ',', decimalSeparator: '.', thousandStyle: ThousandStyle.Thousand };

function Icon({ name }) {
  return <img src={asset(name)} alt="" draggable="false" />;
}

function Templates() {
  return <section className="transfer-templates" aria-label="Transfer templates">
    <h2>Templates</h2>
    <div className="transfer-favourites">
      <div className="transfer-favourite">
        <div className="transfer-add"><Icon name="add" /></div>
        <span>Add<br />template</span>
      </div>
      {[
        ['david', 'David Sarajishvili', null, null],
        ['home', 'Home', '#2, Vaja Psh..', 'homeBadge'],
        ['dad', 'Dad', '595 14 21 42', 'dadBadge'],
        ['anastasia', 'Anastasia', null, null]
      ].map(([image, name, description, badge]) => <div className="transfer-favourite" key={image}>
        <div className="transfer-avatar">
          <img className={`transfer-portrait transfer-portrait--${image}`} src={asset(image, 'png')} alt="" />
          {badge && <img className="transfer-template-badge" src={asset(badge, 'png')} alt="" />}
        </div>
        <div className="transfer-template-copy"><span title={name}>{name}</span>{description && <small>{description}</small>}</div>
      </div>)}
    </div>
  </section>;
}

function TransferRow({ icon, children, tone, fast, onClick, payment }) {
  const contents = <>
    <span className={`transfer-row-icon${tone ? ` transfer-row-icon--${tone}` : ''}`}>
      {payment ? <img src={asset(icon, 'png')} alt="" width="40" height="40" /> : <Icon name={icon} />}
    </span>
    <span className="transfer-row-label">{children}</span>
    {fast && <span className="transfer-fast"><span>Fast</span><Icon name="zap" /></span>}
    <span className="transfer-chevron"><Icon name="chevron" /></span>
  </>;
  return onClick
    ? <button className="transfer-row transfer-row--interactive" type="button" onClick={onClick}><span className="transfer-row-visual">{contents}</span></button>
    : <div className="transfer-row"><span className="transfer-row-visual">{contents}</span></div>;
}


function TransferPanel({ view, screen, className, children, activeViews = [view] }) {
  const active = activeViews.includes(screen);
  return <div className={`transfer-panel ${className}`} data-panel={view} aria-hidden={!active} inert={!active}>
    <div className="transfer-panel-body">{children}</div>
  </div>;
}

function StatusIcon({ kind }) {
  if (kind === 'processing') return <span className="transfer-status-icon transfer-status-icon--processing" aria-hidden="true"><svg className="transfer-spinner" viewBox="0 0 48 48"><circle cx="24" cy="24" r="19" /><path d="M24 5a19 19 0 0 1 19 19" /></svg></span>;
  return <span className={`transfer-status-icon transfer-status-icon--${kind}`} aria-hidden="true"><svg viewBox="0 0 48 48" fill="none">
    {kind === 'success' && <path className="transfer-success-path" pathLength="100" d="m14 24 7 7 14-15" />}
    {kind === 'failure' && <><path d="m17 17 14 14M31 17 17 31" /></>}
    {kind === 'pending' && <><circle cx="24" cy="24" r="12" /><path d="M24 17v8l5 3" /></>}
  </svg></span>;
}

const STATUS_COPY = {
  processing: ['Sending your transfer', 'Your transfer details are being confirmed.'],
  success: ['Transfer successful', 'Your transfer has been completed.'],
  failure: ['Transfer wasn’t completed', 'Review your details and try again.'],
  pending: ['Waiting for confirmation', 'You can close this window and check back.']
};
const ACTION_COPY = { continue: 'Continue', confirm: 'Confirm transfer', sending: 'Processing…', done: 'Done', retry: 'Review transfer', check: 'Check status' };

export default function TransferStudy() {
  const [framed, setFramed] = useState(true);
  const [screen, setScreen] = useState('options');
  const [method, setMethod] = useState('alipay');
  const [preset, setPreset] = useState(null);
  const [custom, setCustom] = useState('0');
  const [amountMotion, setAmountMotion] = useState(false);
  const [source, setSource] = useState('amount');
  const [reviewOrigin, setReviewOrigin] = useState('amount');
  const [demoOutcome, setDemoOutcome] = useState('success');
  const [record, setRecord] = useState(null);
  const holderRef = useRef(null), sheetRef = useRef(null), resetRef = useRef(null);
  const stageRef = useRef(null), timelineButtonRef = useRef(null), controllerRef = useRef(null);
  const requestRef = useRef(null), mountedRef = useRef(false), draftRef = useRef(null);
  const isOpen = screen !== 'closed';
  const amountMinor = source === 'custom' ? amountToMinor(custom) : (preset ?? 0) * 100;
  const statusView = ['processing', 'success', 'failure', 'pending'].includes(screen);
  const displayedMinor = statusView && record ? record.amountMinor : amountMinor;
  const displayedMethod = METHODS[statusView && record ? record.method : method];
  const amountText = screen === 'custom' ? formatValueForDisplay(custom, 2, amountFormat).formatted : formatAmount(displayedMinor);
  draftRef.current = { method, preset, custom, source, reviewOrigin, amountMinor, demoOutcome, record };

  useEffect(() => {
    mountedRef.current = true;
    controllerRef.current = createTransferMotion({ amountFade: holderRef.current.querySelector('.transfer-amount-fade'), sheet: sheetRef.current, holder: holderRef.current, stage: stageRef.current, timelineButton: timelineButtonRef.current, onView: setScreen,
      createStatusMorph: (element, text, disabled = false, duration = 200) => {
        element.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
        element.textContent = text;
        element.style.width = ''; element.style.height = '';
        const morph = new TextMorph({ element, duration, ease: 'cubic-bezier(0.19,1,0.22,1)', respectReducedMotion: true, disabled });
        morph.update(text); return morph;
      } });
    return () => {
      mountedRef.current = false;
      requestRef.current?.abort();
      controllerRef.current?.destroy(); controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const available = ['amount', 'custom'].includes(screen) ? amountMinor > 0 : ['review', 'success', 'failure', 'pending'].includes(screen);
    controllerRef.current?.setAvailable(available);
  }, [screen, amountMinor]);

  useEffect(() => {
    if (isOpen) sheetRef.current?.focus({ preventScroll: true });
    else resetRef.current?.focus({ preventScroll: true });
  }, [screen, isOpen]);

  const clearPressed = () => sheetRef.current?.querySelectorAll('[data-pointer-pressed]').forEach(node => node.removeAttribute('data-pointer-pressed'));
  useEffect(() => {
    const release = () => sheetRef.current?.querySelectorAll('[data-pointer-pressed]').forEach(node => node.removeAttribute('data-pointer-pressed'));
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    window.addEventListener('blur', release);
    return () => { window.removeEventListener('pointerup', release); window.removeEventListener('pointercancel', release); window.removeEventListener('blur', release); release(); };
  }, []);
  function pressControl(event) {
    const button = event.target.closest('button');
    if (event.isPrimary && event.button === 0 && button && !button.disabled) button.setAttribute('data-pointer-pressed', '');
  }
  function leaveControl(event) {
    const button = event.target.closest('button');
    if (button && !button.contains(event.relatedTarget)) button.removeAttribute('data-pointer-pressed');
  }

  const go = (next, instant = false) => {
    setAmountMotion(false);
    controllerRef.current?.setMode(next, instant);
  };
  const instantInput = event => event.detail === 0;

  function chooseMethod(next, event) {
    if (!controllerRef.current?.canActivate()) return;
    setMethod(next); setSource('amount');
    draftRef.current = { ...draftRef.current, method: next, source: 'amount' };
    go('amount', instantInput(event));
  }

  function choosePreset(value, event) {
    event.currentTarget.parentElement.toggleAttribute('data-selection-instant', instantInput(event));
    setPreset(value); setSource('amount');
    draftRef.current = { ...draftRef.current, preset: value, source: 'amount', amountMinor: value * 100 };
  }

  function openCustom(event) {
    if (!controllerRef.current?.canActivate()) return;
    setSource('custom');
    draftRef.current = { ...draftRef.current, source: 'custom', amountMinor: amountToMinor(draftRef.current.custom) };
    go('custom', instantInput(event));
  }

  function enterDigit(key, animate = true) {
    if (controllerRef.current?.mode() !== 'custom') return;
    const next = editAmount(draftRef.current.custom, key);
    setAmountMotion(animate);
    setCustom(next);
    draftRef.current = { ...draftRef.current, custom: next, source: 'custom', amountMinor: amountToMinor(next) };
  }

  function back(instant = false) {
    const current = controllerRef.current?.mode();
    const next = backTarget(current, draftRef.current.reviewOrigin);
    if (!next) return;
    if (next === 'amount' || next === 'custom') {
      setSource(next);
      draftRef.current = { ...draftRef.current, source: next, amountMinor: next === 'custom' ? amountToMinor(draftRef.current.custom) : (draftRef.current.preset ?? 0) * 100 };
    }
    go(next, instant);
  }

  async function submit(instant = false, checking = false) {
    const draft = draftRef.current;
    if (requestRef.current || !controllerRef.current?.canActivate()) return;
    if (checking ? draft.record?.status !== 'pending' : draft.amountMinor <= 0) return;
    const snapshot = checking ? draft.record : { method: draft.method, amountMinor: draft.amountMinor, reference: 'DEMO-001' };
    const request = new AbortController(); requestRef.current = request;
    const processing = { ...snapshot, status: 'processing' };
    setRecord(processing); draftRef.current = { ...draftRef.current, record: processing };
    go('processing', instant);
    try {
      const result = await simulateTransfer({ ...snapshot, outcome: draft.demoOutcome, signal: request.signal });
      if (!mountedRef.current || requestRef.current !== request) return;
      requestRef.current = null; setRecord(result);
      draftRef.current = { ...draftRef.current, record: result };
      controllerRef.current?.complete(result.status);
    } catch (error) {
      if (error.name === 'AbortError' || !mountedRef.current) return;
      requestRef.current = null;
      const failed = { ...snapshot, status: 'failure' };
      setRecord(failed); draftRef.current = { ...draftRef.current, record: failed };
      controllerRef.current?.complete('failure');
    }
  }

  function primary(event) {
    const current = controllerRef.current?.mode();
    if (!controllerRef.current?.canActivate()) return;
    const instant = instantInput(event);
    if (current === 'amount' || current === 'custom') {
      if (draftRef.current.amountMinor <= 0) return;
      setReviewOrigin(current);
      draftRef.current = { ...draftRef.current, reviewOrigin: current };
      go('review', instant);
    } else if (current === 'review') submit(instant);
    else if (current === 'success') go('closed', true);
    else if (current === 'failure') go('review', instant);
    else if (current === 'pending') submit(instant, true);
  }

  function reset() {
    requestRef.current?.abort(); requestRef.current = null;
    setMethod('alipay'); setPreset(null); setCustom('0'); setSource('amount'); setReviewOrigin('amount'); setRecord(null);
    controllerRef.current?.reset();
  }

  function onSheetKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (VIEWS[screen]?.back) back(true); else go('closed', true);
      return;
    }
    if (screen === 'custom' && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const key = /^\d$/.test(event.key) ? event.key : event.key === '.' || event.key === ',' ? '.' : event.key === 'Backspace' ? 'backspace' : event.key === 'Delete' ? 'clear' : null;
      if (key !== null) { event.preventDefault(); enterDigit(key, false); return; }
      if (event.key === 'Enter' && event.target.tagName !== 'BUTTON') { event.preventDefault(); primary({ detail: 0 }); return; }
    }
    if (event.key === 'Tab') {
      const controls = [...sheetRef.current.querySelectorAll('button, input')].filter(node => !node.disabled && node.tabIndex >= 0 && !node.closest('[inert]') && getComputedStyle(node).visibility !== 'hidden');
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement === sheetRef.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === sheetRef.current)) { event.preventDefault(); first?.focus(); }
    }
  }

  useEffect(() => { controllerRef.current?.fitPhone(); }, [framed]);

  const dataReady = VIEWS[screen];

  return <>
    <div className="transfer-tools phone-study-tools">
      <PhoneFrameToggle enabled={framed} onToggle={() => setFramed(value => !value)} />
      <button className="transfer-reset" ref={resetRef} type="button" onClick={reset}>Reset study</button>
      <button className="transfer-timeline-toggle" ref={timelineButtonRef} type="button" onClick={() => controllerRef.current?.toggleTimeline()}>Show timeline</button>
    </div>
    <main className="transfer-stage" aria-label="Transfer flow prototype" ref={stageRef}>
      <div className="transfer-holder" ref={holderRef} data-framed={framed} style={{ '--device-width': `${framed ? 414 : 390}px`, '--device-height': `${framed ? 876 : 852}px` }}>
        <IPhoneFrame enabled={framed}>
        <div className="transfer-phone">
          <div className="transfer-background" inert={isOpen}>
            <header className="transfer-page-header"><span className="transfer-page-back" aria-hidden="true"><Icon name="back" /></span><h1>International transfers</h1><span className="transfer-header-spacer" /></header>
            <Templates />
            {record && <section className="transfer-activity" aria-label="Latest demo transfer"><h2>Recent transfer</h2><button type="button" onClick={() => go(record.status, true)}><img src={asset(METHODS[record.method].asset, 'png')} alt="" width="40" height="40" /><span><strong>{METHODS[record.method].label}</strong><small>{({ processing: 'Processing', success: 'Completed', failure: 'Unsuccessful', pending: 'Pending' })[record.status]}</small></span><b>{CURRENCY_SYMBOL}{formatAmount(record.amountMinor)}</b><Icon name="chevron" /></button></section>}
            <div className="transfer-status" aria-hidden="true"><span>9:41</span><span className="transfer-cellular"><Icon name="cellular" /></span><span className="transfer-wifi"><Icon name="wifi" /></span><span className="transfer-battery"><Icon name="battery" /></span></div>
          </div>
          <div className="transfer-home-indicator" aria-hidden="true" />
          <div className="transfer-backdrop" hidden={!isOpen} onClick={() => go('closed', true)} aria-hidden="true" />
          <section className="transfer-sheet" hidden={!isOpen} data-view={screen} role="dialog" aria-modal="true" aria-labelledby={`transfer-title-${screen}`} ref={sheetRef} tabIndex={-1} onKeyDown={onSheetKeyDown} onPointerDownCapture={pressControl} onPointerOutCapture={leaveControl} onClickCapture={clearPressed} onKeyDownCapture={clearPressed}>
            <header className="transfer-sheet-header">
              <h2 className="transfer-sheet-titles">{VIEW_KEYS.map(key => <span key={key} id={`transfer-title-${key}`} data-title={key} aria-hidden={screen !== key}>{VIEWS[key].title}</span>)}</h2>
              <button className="transfer-close" type="button" aria-label="Close transfer" onClick={() => go('closed', true)}><Icon name="close" /></button>
            </header>
            <div className="transfer-divider" aria-hidden="true"><Icon name="divider" /></div>
            <div className="transfer-content-mask">
              <div className="transfer-method-context" aria-hidden={!dataReady?.context}><img src={asset(displayedMethod.asset, 'png')} alt="" width="40" height="40" /><span><strong>{displayedMethod.label}</strong><small>Transfer to China</small></span><span className="transfer-currency">{CURRENCY}</span></div>
              <div className="transfer-money" aria-hidden={!dataReady?.money} inert={!dataReady?.money}>
                <div className="transfer-money-value" style={{ fontSize: amountText.length > 8 ? '34px' : undefined }}><span className="transfer-money-number"><span>{CURRENCY_SYMBOL}</span><TransferAmountInput value={amountText} label={screen === 'custom' ? `Custom amount in ${CURRENCY}` : `Transfer amount in ${CURRENCY}`} active={screen === 'custom'} animate={screen === 'custom' && amountMotion} /></span></div>
                <span className="transfer-money-caption">{screen === 'custom' || (screen === 'review' && source === 'custom') ? `Max amount: ${MAX_AMOUNT.toLocaleString('en-US').replaceAll(',', ' ')}` : 'Amount to transfer'}</span>
              </div>
              <TransferPanel view="options" screen={screen} className="transfer-rows transfer-rows--options">
                <TransferRow icon="account" tone="purple">Account Number</TransferRow>
                <TransferRow icon="card" tone="blue">Card Number</TransferRow>
                <TransferRow icon="international" tone="mint">International transfer</TransferRow>
                <TransferRow icon="china" tone="gold" fast onClick={event => go('china', instantInput(event))}>Transfer to China</TransferRow>
              </TransferPanel>
              <TransferPanel view="china" screen={screen} className="transfer-rows transfer-rows--china">
                <TransferRow icon="alipay" payment onClick={event => chooseMethod('alipay', event)}>Alipay</TransferRow>
                <TransferRow icon="wechat" payment onClick={event => chooseMethod('wechat', event)}>WechatPay</TransferRow>
              </TransferPanel>
              <TransferPanel view="amount" screen={screen} className="transfer-amount-panel">
                <p className="transfer-amount-intro">How much would you like to transfer?</p>
                <div className="transfer-presets" aria-label="Transfer amounts">{PRESETS.map(value => <button type="button" key={value} aria-label={`${CURRENCY_SYMBOL}${value}`} aria-pressed={preset === value} onClick={event => choosePreset(value, event)}><span className="transfer-tile-visual"><span>{CURRENCY_SYMBOL}</span><span>{value}</span></span></button>)}<button type="button" className="transfer-custom-option" onClick={openCustom}><span className="transfer-tile-visual">Custom</span></button></div>
              </TransferPanel>
              <TransferPanel view="custom" screen={screen} className="transfer-custom-panel">
                <div className="transfer-keypad" aria-label="Amount keypad">{['1','2','3','4','5','6','7','8','9','.','0','backspace'].map(key => <button key={key} type="button" aria-label={key === 'backspace' ? 'Delete digit' : key === '.' ? 'Decimal point' : key} onClick={event => enterDigit(key, !instantInput(event))}><span className="transfer-key-visual">{key === 'backspace' ? <span className="transfer-delete-chevron"><Icon name="chevron" /></span> : key}</span></button>)}</div>
              </TransferPanel>
              <TransferPanel view="review" screen={screen} activeViews={['review', 'processing', 'success']} className="transfer-review-panel">
                <div className="transfer-review-heading"><h3 aria-hidden={screen !== 'review'}>Transfer details</h3><button className="transfer-edit-amount" type="button" tabIndex={screen === 'review' ? 0 : -1} disabled={screen !== 'review'} aria-hidden={screen !== 'review'} aria-label="Edit amount" onClick={event => back(instantInput(event))}>Edit</button></div>
                <dl className="transfer-review-summary"><div><dt>Amount</dt><dd className="transfer-review-total" data-amount={`${CURRENCY_SYMBOL}${formatAmount(displayedMinor)}`}>{CURRENCY_SYMBOL}{amountText}</dd></div><div><dt>Recipient</dt><dd>{RECIPIENT_NAME}</dd></div><div><dt>Pay with</dt><dd><img src={asset(displayedMethod.asset, 'png')} alt="" width="24" height="24" /><span>{displayedMethod.label}</span></dd></div></dl>
              </TransferPanel>
              {Object.entries(STATUS_COPY).map(([key, [title, description]]) => <TransferPanel view={key} screen={screen} className="transfer-result-panel" key={key}>{!['processing', 'success'].includes(key) && <><StatusIcon kind={key} /><h3>{title}</h3><p>{description}</p></>}</TransferPanel>)}
            </div>
            <div className="transfer-sheet-footer"><button className="transfer-primary" type="button" aria-hidden={!dataReady?.action} tabIndex={dataReady?.action ? 0 : -1} aria-label={screen === 'success' ? 'Transfer sent. Close' : screen === 'processing' ? 'Sending transfer' : ACTION_COPY[dataReady?.action] ?? 'Continue'} disabled={!dataReady?.action || screen === 'processing' || (['amount', 'custom'].includes(screen) && amountMinor <= 0)} onClick={primary}><span className="transfer-primary-visual" aria-hidden="true"><span className="transfer-primary-press"><span className="transfer-status-slot" aria-hidden="true"><span className="transfer-status-capsule"><span className="transfer-capsule-icon"><svg className="transfer-spinner transfer-capsule-spinner" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 1 9 9" /></svg><svg className="transfer-capsule-check" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" /><path className="transfer-success-path" pathLength="100" d="m7.5 12 3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span><span className="transfer-status-text">Sending transfer…</span></span></span><span className="transfer-entry-label"><span className="transfer-entry-text">Continue</span></span>{Object.entries(ACTION_COPY).map(([key, label]) => <span key={key} data-action-label={key} aria-hidden="true">{label}</span>)}</span></span></button><div className="transfer-home-indicator" aria-hidden="true" /></div>
            <div className="transfer-announcement" role="status" aria-live="polite" aria-atomic="true">{statusView ? `${STATUS_COPY[screen][0]}. ${METHODS[record?.method ?? method].label}, ${CURRENCY} ${formatAmount(displayedMinor)}.` : ''}</div>
          </section>
          <div className="transfer-amount-fade" aria-hidden="true"><span className="transfer-fade-value"><span className="transfer-fade-currency" /><span className="transfer-fade-number" /></span></div>
        </div>
        </IPhoneFrame>
      </div>
    </main>
    <div className="transfer-demo-controls"><span>Prototype · sample {CURRENCY} amounts</span><label>Demo result<select aria-label="Demo transfer result" value={demoOutcome} onChange={event => setDemoOutcome(event.target.value)}><option value="success">Success</option><option value="pending">Pending</option><option value="failure">Unsuccessful</option></select></label></div>
  </>;
}
