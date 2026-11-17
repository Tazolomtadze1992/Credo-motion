'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FormatOn, ThousandStyle, formatValueForDisplay } from 'numora';
import { TextMorph } from 'torph';
import AmountDisplay from './AmountDisplay';
import Keypad from './Keypad';
import usePointerPress from './usePointerPress';
import Tray from './Tray';
import CredoIcon from './Icon';
import ListRow from './ListRow';
import ReceiptRows from './ReceiptRows';
import TransferTypographyPanel from './TransferTypographyPanel';
import TransferHome from './TransferHome';
import IPhoneFrame, { PhoneFrameToggle } from './IPhoneFrame';
import PrimaryButton, { PrimaryButtonCheck, PrimaryButtonSpinner } from './PrimaryButton';
import { ACTION_COPY, STATUS_ACTION_COPY, CURRENCY, CURRENCY_SYMBOL, MAX_AMOUNT, RECIPIENT_NAME, PRESETS, VIEWS, VIEW_KEYS, METHODS, backTarget, amountToMinor, editAmount, formatAmount, simulateTransfer } from '../lib/transfer-flow.mjs';
import { createTransferMotion } from '../lib/transfer-motion.mjs';
import { animateTrayPresence } from '../lib/tray-presence.mjs';
import { cubicBezier, durations } from '../content/motion.mjs';
import { credoTypographyStyle } from '../content/typography';
import { credoColorStyle } from '../content/colors';

const asset = (name, format = 'svg') => `/assets/transfers/${name}.${format}`;
const amountFormat = { formatOn: FormatOn.Change, thousandSeparator: ',', decimalSeparator: '.', thousandStyle: ThousandStyle.Thousand };

// Transfer icons: Credo icon names and size tiers. The China pagoda and
// status bar glyphs have no library equivalent and stay as files.
const ICON = {
  add: ['add', 'content'], back: ['back', 'nav'], close: ['close', 'small'],
  chevron: ['chevron-right', 'trailing'], delete: ['chevron-right', 'nav'], zap: ['lightning', 'badge'],
  account: ['bank', 'leading'], card: ['card', 'leading'], international: ['globe', 'leading']
};

function Icon({ name }) {
  if (ICON[name]) {
    const [credoName, size] = ICON[name];
    return <CredoIcon name={credoName} size={size} className={`transfer-icon transfer-icon--${name}`} />;
  }
  // The pagoda is single-colour artwork: drawn as a mask so it takes the
  // row's brand icon colour.
  if (MASKED.has(name)) return <span className={`transfer-icon transfer-icon--mask transfer-icon--${name}`} style={{ '--transfer-icon-src': `url(${asset(name)})` }} aria-hidden="true" />;
  return <img src={asset(name)} alt="" draggable="false" />;
}
const MASKED = new Set(['china']);


// A transfer option: Credo's list row with the transfer icon set.
function TransferRow({ icon, children, tone, fast, onClick, payment }) {
  return <ListRow tone={tone} onClick={onClick}
    leading={payment ? <img src={asset(icon, 'png')} alt="" width="40" height="40" /> : <Icon name={icon} />}
    badge={fast && <span className="transfer-fast"><span>Fast</span><Icon name="zap" /></span>}
    trailing={<Icon name="chevron" />}>{children}</ListRow>;
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
  processing: ['Sending Your Transfer', 'Your transfer details are being confirmed.'],
  success: ['Transfer Successful', 'Your transfer has been completed.'],
  failure: ['Transfer Wasn’t Completed', 'Review your details and try again.'],
  pending: ['Waiting for Confirmation', 'You can close this window and check back.']
};

export default function TransferStudy() {
  const [framed, setFramed] = useState(true);
  const [typographyOpen, setTypographyOpen] = useState(false);
  const [screen, setScreen] = useState('options');
  const [method, setMethod] = useState('alipay');
  const [preset, setPreset] = useState(null);
  const [custom, setCustom] = useState('0');
  const [amountMotion, setAmountMotion] = useState(false);
  const [source, setSource] = useState('amount');
  const [reviewOrigin, setReviewOrigin] = useState('amount');
  const [record, setRecord] = useState(null);
  const [closing, setClosing] = useState(false);
  const backdropRef = useRef(null), trayAnimationsRef = useRef([]), pendingOpenRef = useRef(false);
  const holderRef = useRef(null), phoneRef = useRef(null), sheetRef = useRef(null), resetRef = useRef(null);
  const stageRef = useRef(null), timelineButtonRef = useRef(null), controllerRef = useRef(null);
  const requestRef = useRef(null), mountedRef = useRef(false), draftRef = useRef(null);
  const isOpen = screen !== 'closed';
  const amountMinor = source === 'custom' ? amountToMinor(custom) : (preset ?? 0) * 100;
  const statusView = ['processing', 'success', 'failure', 'pending'].includes(screen);
  const displayedMinor = statusView && record ? record.amountMinor : amountMinor;
  const displayedMethod = METHODS[statusView && record ? record.method : method];
  const amountText = formatAmount(displayedMinor);
  const editorText = screen === 'custom' || (screen === 'review' && source === 'custom')
    ? formatValueForDisplay(custom, 2, amountFormat).formatted : amountText;
  draftRef.current = { method, preset, custom, source, reviewOrigin, amountMinor, record };

  useEffect(() => {
    mountedRef.current = true;
    controllerRef.current = createTransferMotion({ sheet: sheetRef.current, holder: holderRef.current, stage: stageRef.current, timelineButton: timelineButtonRef.current, onView: setScreen,
      createStatusMorph: (element, text, disabled = false) => {
        element.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
        element.textContent = text;
        element.style.width = ''; element.style.height = '';
        // An evenly paced ~300ms swap (Family's text swaps run about 230–250ms
        // without a front-loaded jump); expo-out at 160–200ms put nearly all
        // of the movement into the first 40ms.
        const morph = new TextMorph({ element, duration: durations.textSwap, ease: cubicBezier('textSwap'), respectReducedMotion: true, disabled });
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
    if (controllerRef.current?.isPreviewing()) return;
    if (isOpen) sheetRef.current?.focus({ preventScroll: true });
    else resetRef.current?.focus({ preventScroll: true });
  }, [screen, isOpen]);

  // Press feedback: the shared hook (same behaviour as before, now also used
  // by Automatic orders).
  const { clear: clearPressed, pressProps: { onPointerDownCapture: pressControl, onPointerOutCapture: leaveControl } } = usePointerPress(sheetRef);

  const go = (next, instant = false) => {
    setAmountMotion(false);
    controllerRef.current?.setMode(next, instant);
  };
  const instantInput = event => event.detail === 0;

  // A pointer close slides the tray down on the same steep sheet curve and
  // fades the backdrop; reopening reverses it. Keyboard and the study's
  // Reset stay instant.
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function cancelTrayAnimations() {
    trayAnimationsRef.current.forEach(animation => animation.cancel());
    trayAnimationsRef.current = [];
    if (sheetRef.current) sheetRef.current.style.pointerEvents = '';
  }
  function closeTray(event) {
    const sheet = sheetRef.current, backdrop = backdropRef.current;
    const animate = event && !instantInput(event) && sheet && backdrop && !controllerRef.current?.isPreviewing();
    if (!animate) { cancelTrayAnimations(); setClosing(false); go('closed', true); return; }
    if (closing) return;
    const reduce = reducedMotion();
    const height = VIEWS[controllerRef.current?.mode()]?.height ?? 0;
    cancelTrayAnimations();
    sheet.style.pointerEvents = 'none';
    setClosing(true);
    // Shared with every tray flow (lib/tray-presence.mjs, plan 011 W6); values unchanged.
    const [tray, dim] = animateTrayPresence({ tray: sheet, backdrop, height, opening: false, reduce });
    trayAnimationsRef.current = [tray, dim];
    tray.finished.then(() => { if (mountedRef.current) { setClosing(false); go('closed', true); } }).catch(() => {});
  }
  function openTray(next, event) {
    pendingOpenRef.current = Boolean(event && !instantInput(event));
    go(next, true);
  }
  useLayoutEffect(() => {
    // Runs before paint, so a closed tray never flashes back before hiding.
    if (!isOpen) { cancelTrayAnimations(); return; }
    if (!pendingOpenRef.current) return;
    pendingOpenRef.current = false;
    const sheet = sheetRef.current, backdrop = backdropRef.current, reduce = reducedMotion();
    const height = VIEWS[screen]?.height ?? 0;
    trayAnimationsRef.current = animateTrayPresence({ tray: sheet, backdrop, height, opening: true, reduce });
  }, [isOpen]);

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
      const result = await simulateTransfer({ ...snapshot, signal: request.signal });
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
    else if (current === 'success') closeTray(event);
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
    if (event.key === 'Tab' && !typographyOpen) {
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
        <div className="transfer-phone" style={{ ...credoTypographyStyle, ...credoColorStyle }} ref={phoneRef}>
          <div className="transfer-background" inert={isOpen}>
            <TransferHome onTransfer={event => openTray('options', event)} />
            <div className="transfer-status transfer-status--on-dark" aria-hidden="true"><span>9:41</span><span className="transfer-cellular"><Icon name="cellular" /></span><span className="transfer-wifi"><Icon name="wifi" /></span><span className="transfer-battery"><Icon name="battery" /></span></div>
          </div>
          <div className="transfer-home-indicator" aria-hidden="true" />
          <div className="transfer-backdrop" ref={backdropRef} hidden={!isOpen} onClick={event => closeTray(event)} aria-hidden="true" />
          <Tray ref={sheetRef} className="transfer-sheet" hidden={!isOpen} data-view={screen} role="dialog" aria-modal={!typographyOpen} aria-labelledby={`transfer-title-${screen}`} tabIndex={-1} onKeyDown={onSheetKeyDown} onPointerDownCapture={pressControl} onPointerOutCapture={leaveControl} onClickCapture={clearPressed} onKeyDownCapture={clearPressed}
            headerClassName="transfer-sheet-header" titleClassName="transfer-sheet-titles"
            title={VIEW_KEYS.map(key => <span key={key} id={`transfer-title-${key}`} data-title={key} aria-hidden={screen !== key}>{VIEWS[key].title}</span>)}
            onClose={event => closeTray(event)} closeLabel="Close transfer" closeIcon={<Icon name="close" />}
            onBack={VIEWS[screen]?.back ? event => back(instantInput(event)) : undefined}
            dividerClassName="transfer-divider" bodyClassName="transfer-content-mask"
            footer={<>
            <div className="transfer-sheet-footer">
              <PrimaryButton
                className="transfer-primary"
                visualClassName="transfer-primary-visual"
                surfaceClassName="transfer-primary-press"
                data-managed-press
                aria-hidden={!dataReady?.action}
                tabIndex={dataReady?.action ? 0 : -1}
                aria-label={screen === 'success' ? `${STATUS_ACTION_COPY.success}. Close` : screen === 'processing' ? STATUS_ACTION_COPY.processing.replace('…', '') : ACTION_COPY[dataReady?.action] ?? ACTION_COPY.continue}
                busy={screen === 'processing'}
                disabled={!dataReady?.action || (['amount', 'custom'].includes(screen) && amountMinor <= 0)}
                onClick={primary}
              >
                <span className="transfer-status-slot" aria-hidden="true">
                  <span className="transfer-status-capsule">
                    <span className="transfer-capsule-icon">
                      <PrimaryButtonSpinner className="transfer-spinner transfer-capsule-spinner" />
                      <PrimaryButtonCheck className="transfer-capsule-check" pathClassName="transfer-success-path" />
                    </span>
                    <span className="transfer-status-label"><span className="transfer-status-text">{STATUS_ACTION_COPY.processing}</span><span className="transfer-status-ellipsis" aria-hidden="true">…</span></span>
                  </span>
                </span>
                <span className="transfer-entry-label" aria-hidden="true"><span className="transfer-entry-text">{ACTION_COPY.continue}</span></span>
                <span className="transfer-step-labels" aria-hidden="true">
                  <span data-action-label="continue">{ACTION_COPY.continue}</span>
                  <span data-action-label="confirm">{ACTION_COPY.confirm}</span>
                </span>
                {Object.entries(ACTION_COPY).filter(([key]) => key !== 'continue' && key !== 'confirm').map(([key, label]) => <span key={key} data-action-label={key} aria-hidden="true">{label}</span>)}
              </PrimaryButton>
              <div className="transfer-home-indicator" aria-hidden="true" />
            </div>
            <div className="transfer-announcement" role="status" aria-live="polite" aria-atomic="true">{statusView ? `${STATUS_COPY[screen][0]}. ${METHODS[record?.method ?? method].label}, ${CURRENCY} ${formatAmount(displayedMinor)}.` : ''}</div>
            </>}>
              <div className="transfer-method-context" aria-hidden={!dataReady?.context}><img src={asset(displayedMethod.asset, 'png')} alt="" width="40" height="40" /><span><strong>{displayedMethod.label}</strong><small>Transfer to China</small></span><span className="transfer-currency">{CURRENCY}</span></div>
              <div className="transfer-money" aria-hidden={!dataReady?.money} inert={!dataReady?.money}>
                <AmountDisplay value={editorText} currency={CURRENCY_SYMBOL} label={screen === 'custom' ? `Custom amount in ${CURRENCY}` : `Transfer amount in ${CURRENCY}`} active={screen === 'custom'} animate={screen === 'custom' && amountMotion}
                  caption={screen === 'custom' || (screen === 'review' && source === 'custom') ? `Max amount: ${MAX_AMOUNT.toLocaleString('en-US').replaceAll(',', ' ')}` : 'Amount to transfer'} />
              </div>
              <TransferPanel view="options" screen={screen} className="transfer-rows transfer-rows--options">
                <TransferRow icon="account" tone="purple">Account Number</TransferRow>
                <TransferRow icon="card" tone="blue">Card Number</TransferRow>
                <TransferRow icon="international" tone="mint">International Transfer</TransferRow>
                <TransferRow icon="china" tone="gold" fast onClick={event => go('china', instantInput(event))}>Transfer to China</TransferRow>
              </TransferPanel>
              <TransferPanel view="china" screen={screen} className="transfer-rows transfer-rows--china">
                <TransferRow icon="alipay" payment onClick={event => chooseMethod('alipay', event)}>Alipay</TransferRow>
                <TransferRow icon="wechat" payment onClick={event => chooseMethod('wechat', event)}>WechatPay</TransferRow>
              </TransferPanel>
              <TransferPanel view="amount" screen={screen} className="transfer-amount-panel">
                <div className="transfer-presets" aria-label="Transfer amounts">{PRESETS.map(value => <button type="button" key={value} aria-label={`${CURRENCY_SYMBOL}${value}`} aria-pressed={preset === value} onClick={event => choosePreset(value, event)}><span className="transfer-tile-visual"><span>{CURRENCY_SYMBOL}</span><span>{value}</span></span></button>)}<button type="button" className="transfer-custom-option" onClick={openCustom}><span className="transfer-tile-visual">Custom</span></button></div>
              </TransferPanel>
              <TransferPanel view="custom" screen={screen} className="transfer-custom-panel">
                <Keypad onKey={(key, event) => enterDigit(key, !instantInput(event))} deleteIcon={<Icon name="delete" />} />
              </TransferPanel>
              <TransferPanel view="review" screen={screen} activeViews={['review', 'processing', 'success']} className="transfer-review-panel">
                <ReceiptRows className="transfer-review-summary" rows={[
                  { label: 'Amount', className: 'transfer-review-amount', value: <>
                    <button className="transfer-edit-amount" type="button" tabIndex={screen === 'review' ? 0 : -1} disabled={screen !== 'review'} aria-hidden={screen !== 'review'} aria-label="Edit amount" onClick={event => back(instantInput(event))}><span className="credo-inline-action">Edit</span></button>
                    <strong className="transfer-review-total" data-amount={`${CURRENCY_SYMBOL}${formatAmount(displayedMinor)}`}>{CURRENCY_SYMBOL}{amountText}</strong>
                  </> },
                  { label: 'Recipient', className: 'transfer-review-recipient', value: RECIPIENT_NAME },
                  { label: 'Pay with', className: 'transfer-review-method', value: displayedMethod.label }
                ]} />
              </TransferPanel>
              {Object.entries(STATUS_COPY).map(([key, [title, description]]) => <TransferPanel view={key} screen={screen} className="transfer-result-panel" key={key}>{!['processing', 'success'].includes(key) && <><StatusIcon kind={key} /><h3>{title}</h3><p>{description}</p></>}</TransferPanel>)}
            <div className="transfer-feather" aria-hidden="true" />
          </Tray>
        </div>
        </IPhoneFrame>
      </div>
    </main>
    <TransferTypographyPanel onOpenChange={setTypographyOpen} phoneRef={phoneRef} controllerRef={controllerRef} />
  </>;
}
