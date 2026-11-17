import { curves, durations, springs } from '../content/motion.mjs';
import { BUTTON_HEIGHT, px } from '../content/spacing.mjs';
import { ACTION_COPY, STATUS_ACTION_COPY as statusCopy, SHEET_HEIGHT, VIEWS, VIEW_KEYS } from './transfer-flow.mjs';

// Surface and content respond together; a first CTA enters as its space opens.
export const MOTION = {
  unit: 116, omega: springs.tray.omega, fadeMs: 130, moveMs: 180, hint: 8,
  ease: curves.easeOutQuad, titleMs: 150, bodyScale: .96
};
const clamp = n => Math.max(0, Math.min(1, n));
const position = view => (SHEET_HEIGHT - VIEWS[view].height) / MOTION.unit;
const rank = view => ({ options: 0, china: 1, amount: 2, custom: 3, review: 4, processing: 5, success: 6, failure: 6, pending: 6 })[view];
// Content starts content-top (16px) below the divider (tray spacing standard,
// 2026-11-14; was 100 = 20px). Every view height is 4px shorter to match.
const PANEL_TOP = px('tray', 'header') + px('tray', 'content-top');
// Amount pairs: 12px headroom above the content slot.
const CONTENT_HEADROOM = PANEL_TOP - 12;
// Footer reserve: home inset, plus button and its gap while an action shows.
const HOME_INSET = px('tray', 'home-inset');
const ACTION_SPACE = BUTTON_HEIGHT + px('tray', 'action-gap');
// The amount line rests MONEY_REST_GAP below the content slot (under the method
// row on failure/pending; must match --transfer-money-rest-gap in transfers.css).
// On Custom Amount the controller lifts it back by that gap; CSS then drops it
// by the emphasis shift (emphasis-top − content-top − the amount type's
// half-leading), so the digits start emphasis-top below the divider and follow
// any tuning of the amount type.
export const MONEY_REST_GAP = 64;
// Custom Amount ↔ Review: the amount line needs headroom above the panel slot.
const EDITOR_APERTURE_TOP = 82;
const lerp = (from, to, progress) => from + (to - from) * progress;

// Amount, Custom Amount and Review hand off like a Family drawer: every body
// rides the tray's top edge with the header (nothing is pinned or slides
// relative to the tray). The outgoing top content clears before the incoming
// content arrives, with a small scale (.96, or .98 for the tall keypad) and a
// 2px blur peak.
const HANDOFF_EASE = curves.easeOut;
// Custom Amount ↔ Review tray spring (rad/s; the shared tray spring is 32.5).
export const EDITOR_OMEGA = 42;
// The keypad block is tall; .96 visibly pulls its outer rows inward.
const KEYPAD_SCALE = .98;
const handoffScale = view => view === 'custom' ? KEYPAD_SCALE : .96;
function amountHandoffProfile(from, to) {
  const between = (a, b) => [from, to].includes(a) && [from, to].includes(b);
  const shared = {
    separateExit: true, depth: true, omega: MOTION.omega,
    ease: HANDOFF_EASE, moveEase: HANDOFF_EASE, hint: 0, exitHint: 0,
    enterScale: handoffScale(to), exitScale: handoffScale(from),
    titleMs: 150, actionDelay: 0, actionY: 0, actionScale: 1, actionEase: HANDOFF_EASE
  };
  if (between('amount', 'review')) return {
    ...shared, bodyMs: 150, exitMs: 90, fadeDelay: 0, moveMs: 150, actionMs: 150,
    persistenceVersion: 'family-preset-v2'
  };
  // The tray travels 329px here, the longest move in the flow: on the shared
  // tray spring it crept the last 10–20px for ~130ms after the content had
  // settled, which read as heavy. A faster spring lands it crisply and stays
  // interruptible (user approved, 2026-11-14: "lighter").
  if (between('custom', 'review')) return {
    ...shared, omega: EDITOR_OMEGA, bodyMs: 180, exitMs: 100, fadeDelay: 0, moveMs: 180, actionMs: 150,
    // Different layouts in one space: the old one leaves on its own 100ms exit
    // instead of waiting for the new one (user decision 2026-11-16, plan 006).
    coverFloor: false,
    persistenceVersion: 'family-editor-v5'
  };
  if (between('amount', 'custom')) return {
    ...shared, bodyMs: 180, exitMs: 90, fadeDelay: 0, moveMs: 180, actionMs: 150,
    persistenceVersion: 'family-amount-custom-v1'
  };
  return null;
}

// One content curve for the whole tray: the strong ease-out of the Family
// handoff. Approved durations stay (130ms first switch, 150/180ms handoff,
// 200ms receipt); results and retry use 180ms.
// These are tuned exceptions to the family handoff default (durations.handoffExit
// 100 / handoffEnter 170 in content/motion.mjs, plan 011 W7); keep them per pair.
const CONTENT_EASE = curves.easeOut;
const RESULT_MS = 180;
export function transitionProfile(from, to) {
  const amountHandoff = amountHandoffProfile(from, to);
  if (amountHandoff) return amountHandoff;
  if ([from, to].every(view => VIEWS[view]?.receipt)) return {
    bodyMs: 200, titleMs: 130, moveMs: 200, fadeDelay: 0,
    ease: CONTENT_EASE, moveEase: CONTENT_EASE, depth: false,
    omega: MOTION.omega, hint: 0, exitHint: 0, enterScale: 1, exitScale: 1,
    actionMs: 130, actionDelay: 0, actionY: 0, actionScale: 1,
    actionEase: MOTION.ease, persistenceVersion: 'receipt-button-typography'
  };
  const baseline = [from, to].every(view => ['options', 'china'].includes(view));
  const methodAmount = [from, to].includes('china') && [from, to].includes('amount');
  // Results (failure, pending) and retry arrive on the handoff's 180ms clock.
  const bodyMs = baseline || methodAmount ? MOTION.fadeMs : RESULT_MS;
  const enterScale = methodAmount ? (to === 'amount' ? .94 : 1.04) : baseline ? 1 : MOTION.bodyScale;
  const exitScale = methodAmount ? (from === 'china' ? 1.04 : .94) : baseline ? 1 : MOTION.bodyScale;
  return { bodyMs, titleMs: baseline || methodAmount ? MOTION.fadeMs : MOTION.titleMs,
    moveMs: baseline || methodAmount ? MOTION.moveMs : bodyMs,
    moveEase: CONTENT_EASE,
    depth: methodAmount, fadeDelay: 0,
    omega: MOTION.omega,
    hint: methodAmount ? (to === 'amount' ? 8 : 0) : baseline ? MOTION.hint : 0,
    exitHint: methodAmount ? (from === 'amount' ? 8 : 0) : baseline ? MOTION.hint : 0,
    enterScale, exitScale,
    actionMs: baseline || methodAmount ? MOTION.fadeMs : MOTION.titleMs,
    actionDelay: methodAmount && to === 'amount' ? 60 : 0,
    actionY: methodAmount ? 0 : 4, actionScale: methodAmount ? .96 : .98,
    actionEase: MOTION.ease,
    ease: CONTENT_EASE };
}

export function sampleSurface(value, velocity, target, seconds, omega = MOTION.omega) {
  const delta = value - target;
  const coefficient = velocity + omega * delta;
  const time = Math.max(0, seconds);
  const decay = Math.exp(-omega * time);
  const displacement = (delta + coefficient * time) * decay;
  const speed = (velocity - omega * coefficient * time) * decay;
  const moving = Math.abs(displacement) >= .0001 || Math.abs(speed) >= .002;
  return { value: moving ? target + displacement : target, velocity: moving ? speed : 0, moving };
}

export function settleDuration(from, to) {
  const { omega } = transitionProfile(from, to);
  for (let ms = 0; ms <= 2000; ms++) {
    if (!sampleSurface(position(from), 0, position(to), ms / 1000, omega).moving) return ms / 1000;
  }
  return 2;
}

export function easeContent(value, curve = MOTION.ease) {
  const p = clamp(value);
  if (p === 0 || p === 1) return p;
  const bezier = (t, a, b) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;
  let low = 0, high = 1;
  for (let i = 0; i < 16; i++) {
    const t = (low + high) / 2;
    if (bezier(t, curve[0], curve[2]) < p) low = t;
    else high = t;
  }
  return bezier((low + high) / 2, curve[1], curve[3]);
}

// Label morphs (Torph) run 300ms; the timeline preview seeks within this.
const LABEL_MORPH_MS = durations.textSwap;

export function createTransferMotion({ sheet, holder, stage, timelineButton, onView, createStatusMorph }) {
  // The trailing "…" is a separate element, so Torph sees "Sending Transfer"
  // → "Transfer Sent", keeps "Transfer" as a shared word and fades the others,
  // instead of morphing "Sending" letters across it into "Sent".
  const statusLabel = key => statusCopy[key]?.replace(/…$/, '');
  const query = selector => sheet.querySelector(selector);
  const header = query('.transfer-sheet-header'), divider = query('.transfer-divider');
  const mask = query('.transfer-content-mask'), close = query('.credo-tray__close');
  const featherOverlay = query('.transfer-feather');
  const titles = query('.transfer-sheet-titles');
  const context = query('.transfer-method-context'), money = query('.transfer-money');
  const edit = query('.transfer-edit-amount'), action = query('.transfer-primary');
  const editorValue = query('.credo-amount__number');
  const actionVisual = query('.transfer-primary-visual');
  const actionPress = query('.transfer-primary-press');
  const panels = Object.fromEntries(VIEW_KEYS.map(key => [key, query(`[data-panel="${key}"]`)]));
  const bodies = Object.fromEntries(VIEW_KEYS.map(key => [key, query(`[data-panel="${key}"] .transfer-panel-body`)]));
  const headings = Object.fromEntries(VIEW_KEYS.map(key => [key, query(`[data-title="${key}"]`)]));
  const labels = [...sheet.querySelectorAll('[data-action-label]')];
  const check = query('.transfer-success-path');
  const statusSlot = query('.transfer-status-slot'), capsule = query('.transfer-status-capsule');
  const statusText = query('.transfer-status-text'), capsuleSpinner = query('.transfer-capsule-spinner');
  const statusEllipsis = query('.transfer-status-ellipsis');
  const capsuleCheck = query('.transfer-capsule-check');
  const spinners = [...sheet.querySelectorAll('.transfer-spinner')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const spring = { value: position('options'), velocity: 0, target: position('options'), omega: MOTION.omega };
  const weights = Object.fromEntries(VIEW_KEYS.map(key => [key, key === 'options' ? 1 : 0]));
  const shifts = Object.fromEntries(VIEW_KEYS.map(key => [key, key === 'options' ? 0 : MOTION.hint]));
  const titleShifts = { ...shifts }, titleWeights = { ...weights }, actionWeights = { ...weights };
  const actionPose = { y: 4, scale: .98 };
  const scales = Object.fromEntries(VIEW_KEYS.map(key => [key, 1]));
  let direction = 1;
  let reveal = 0, tween = null, frame = 0, previousTime = 0;
  let mode = 'options', previewActive = false, suppressPreview = false;
  let timeline = null, dock = null, timelineFactory = null, visible = false;
  // The DialKit scrubber is lab tooling: rebuilding it costs ~4,800 DOM changes.
  // It is rebuilt only while it is shown and the tray is at rest, never inside
  // a tap (that blocked the first frame 13–23ms and made the tray jump).
  let timelineStale = false;
  let pair = ['options', 'china'], disposed = false, phoneScale = 1, previewTime = 0;
  let pendingResult = null, completedResult = null, available = false;
  let statusMorph = createStatusMorph?.(statusText, statusLabel('processing')), morphTarget = statusLabel('processing');
  let previewMorphPair = null, morphDisabled = false, lastMorphPreviewTime = -1;
  const entryText = query('.transfer-entry-text'), entrySlot = query('.transfer-entry-label');
  const entryCopy = { amount: ACTION_COPY.continue, custom: ACTION_COPY.continue, review: ACTION_COPY.confirm };
  let entryMorph = createStatusMorph?.(entryText, entryCopy.amount, false), entryTarget = entryCopy.amount;
  let entryDisabled = false, entryPreviewPair = null, lastEntryPreviewTime = -1;

  function syncEntryText(next, instant = false) {
    if (!entryCopy[next]) return;
    const text = entryCopy[next], disabled = instant || reduced.matches;
    if (!entryMorph) entryText.textContent = text;
    else if (disabled) {
      entryMorph.destroy(); entryMorph = createStatusMorph(entryText, text, disabled);
    } else if (entryDisabled) {
      entryMorph.destroy(); entryMorph = createStatusMorph(entryText, entryTarget, false);
      if (entryTarget !== text) entryMorph.update(text);
    } else if (entryTarget !== text) entryMorph.update(text);
    else if (entryPreviewPair) entryText.getAnimations({ subtree: true }).forEach(animation => animation.play());
    entryTarget = text; entryDisabled = disabled; entryPreviewPair = null;
  }

  function seekEntryText(from, to, time) {
    if (!entryCopy[from] || !entryCopy[to] || entryCopy[from] === entryCopy[to]) return;
    const key = `${from}-${to}`;
    if (entryMorph && (entryPreviewPair !== key || time < lastEntryPreviewTime)) {
      entryMorph.destroy(); entryMorph = createStatusMorph(entryText, entryCopy[from], reduced.matches);
      entryMorph.update(entryCopy[to]); entryTarget = entryCopy[to];
      entryPreviewPair = key; entryDisabled = reduced.matches;
    }
    lastEntryPreviewTime = time;
    entryText.getAnimations?.({ subtree: true }).forEach(animation => {
      animation.pause(); animation.currentTime = Math.min(LABEL_MORPH_MS, Math.max(0, time * 1000));
    });
  }

  function syncStatusText(next, instant = false) {
    if (!statusCopy[next]) return;
    const text = statusLabel(next), disabled = instant || reduced.matches;
    if (!statusMorph) statusText.textContent = text;
    // Prime the hidden status channel with the exact Review label. It can
    // then morph Confirm→Sending without crossfading two whole text layers.
    else if (morphDisabled && !disabled && next === 'processing') {
      statusMorph.destroy(); statusMorph = createStatusMorph(statusText, morphTarget, false);
      if (morphTarget !== text) statusMorph.update(text);
    } else if (next === 'review' || disabled || morphDisabled) {
      statusMorph.destroy(); statusMorph = createStatusMorph(statusText, text, disabled);
    } else if (morphTarget !== text) statusMorph.update(text);
    else if (previewMorphPair) statusText.getAnimations({ subtree: true }).forEach(animation => animation.play());
    morphTarget = text; morphDisabled = disabled; previewMorphPair = null;
  }

  function seekStatusText(from, to, time) {
    if (!statusCopy[from] || !statusCopy[to] || from === to) return;
    const key = `${from}-${to}`;
    if (statusMorph && (previewMorphPair !== key || time < lastMorphPreviewTime)) {
      statusMorph.destroy(); statusMorph = createStatusMorph(statusText, statusLabel(from), reduced.matches);
      statusMorph.update(statusLabel(to)); morphTarget = statusLabel(to);
      previewMorphPair = key; morphDisabled = reduced.matches;
    }
    lastMorphPreviewTime = time;
    statusText.getAnimations?.({ subtree: true }).forEach(animation => {
      animation.pause(); animation.currentTime = Math.min(LABEL_MORPH_MS, Math.max(0, time * 1000));
    });
  }

  function selectState(next) {
    if (next === mode) return;
    mode = next;
    onView(next);
  }

  const sum = (predicate, track = weights) => VIEW_KEYS.reduce((total, key) => total + (predicate(VIEWS[key], key) ? track[key] : 0), 0);

  function paint() {
    // Every body rides the tray edge; the amount line is attached rigidly to it
    // (no extra slide relative to the tray).
    const editorPair = pair.includes('custom') && pair.includes('review');
    const moneyPair = pair.includes('custom') && (pair.includes('review') || pair.includes('amount'));
    const offset = reduced.matches && VIEWS[mode] ? SHEET_HEIGHT - VIEWS[mode].height : MOTION.unit * spring.value;
    const contextAlpha = clamp(sum(view => view.context));
    const moneyAlpha = clamp(sum(view => view.money));
    const receiptAlpha = clamp(sum(view => view.receipt));
    const actionAlpha = clamp(sum(view => view.action, actionWeights));
    const actionY = actionPose.y;
    const footer = HOME_INSET + ACTION_SPACE * (reduced.matches ? Number(Boolean(VIEWS[mode]?.action)) : actionAlpha);
    const amountCustom = pair.includes('amount') && pair.includes('custom');
    const presetReview = pair.includes('amount') && pair.includes('review');
    sheet.style.clipPath = `inset(${offset}px 0px 0px round 24px)`;
    sheet.toggleAttribute('data-preview', previewActive);
    header.style.transform = divider.style.transform = `translateY(${offset}px)`;
    titles.style.transform = 'none';
    // Returning presets enter 8px above their resting slot, plus centered growth.
    // Leave 12px headroom while keeping content below the divider.
    const contentTop = (editorPair ? EDITOR_APERTURE_TOP : pair.includes('amount') ? CONTENT_HEADROOM : PANEL_TOP) + offset;
    mask.style.clipPath = `inset(${contentTop}px 0px ${footer}px 0px)`;
    // A 16px fade above the footer, as a composited overlay (transform and
    // opacity only; a per-frame mask-image repainted the content). It clears as
    // the last preset and receipt rows settle near the footer.
    const featherStrength = editorPair ? 0 : 1 - clamp(receiptAlpha + weights.amount);
    featherOverlay.style.transform = `translateY(${SHEET_HEIGHT - footer - 16}px)`;
    featherOverlay.style.opacity = String(featherStrength);
    const confirmSending = pair.includes('review') && pair.includes('processing');
    for (const key of VIEW_KEYS) {
      const weight = clamp(weights[key]);
      // The amount/custom/review handoffs let the blur peak (2px at the
      // midpoint) blend the crossfade; presets otherwise settle crisp.
      const crispPanel = editorPair || presetReview || amountCustom ? false : key === 'amount';
      const blur = reduced.matches || crispPanel ? 0 : 8 * weight * (1 - weight);
      const filter = blur > .001 ? `blur(${blur}px)` : 'none';
      // Titles share one baseline and crossfade on one clock with complementary
      // opacity (Family's tray titles, Loyalty's text swap): the old title fades
      // as the new one arrives, so a title is always on screen. Using only the
      // upper half of each weight left ~58ms with no title at all.
      const titleWeight = clamp(titleWeights[key]);
      panels[key].style.opacity = String(weight);
      headings[key].style.opacity = String(titleWeight);
      panels[key].style.visibility = weight > .00001 ? 'visible' : 'hidden';
      headings[key].style.visibility = titleWeight > .00001 ? 'visible' : 'hidden';
      const panelOffset = offset + (reduced.matches ? 0 : shifts[key]);
      panels[key].style.transform = `translateY(${panelOffset}px)`;
      bodies[key].style.transform = reduced.matches ? 'none' : `scale(${scales[key]})`;
      // Both titles hold the same position; opposing slides read as two copies.
      headings[key].style.transform = 'none';
      panels[key].style.filter = filter;
      const titleBlur = reduced.matches ? 0 : 8 * titleWeight * (1 - titleWeight);
      headings[key].style.filter = titleBlur > .001 ? `blur(${titleBlur}px)` : 'none';
    }
    const statusAlpha = clamp(sum(view => view.status));
    if (statusAlpha > .00001 || confirmSending) {
      // Keep the receipt anchored across confirmation and status. It already
      // rides the tray, so an early Confirm continues from its displayed
      // position and opacity without compensation.
      const visibleReceipt = receiptAlpha;
      panels.review.style.opacity = String(visibleReceipt);
      panels.review.style.visibility = 'visible';
      panels.review.style.transform = `translateY(${offset}px)`;
      panels.review.style.filter = 'none';
      bodies.review.style.transform = reduced.matches ? 'none' : `scale(${lerp(.98, 1, visibleReceipt)})`;
    }
    if (pair[0] !== pair[1] && VIEWS[pair[0]].title === VIEWS[pair[1]].title) {
      pair.forEach(key => {
        headings[key].style.opacity = String(Number(key === mode));
        headings[key].style.filter = 'none'; headings[key].style.transform = 'none';
      });
    }
    const statusTextAlpha = confirmSending ? clamp(weights.review + weights.processing) : statusAlpha;
    statusSlot.style.opacity = String(statusTextAlpha);
    statusSlot.style.visibility = statusTextAlpha > .00001 ? 'visible' : 'hidden';
    // Keep Confirm centered while the icon's reserved28px enters the group.
    statusText.style.transform = confirmSending && !reduced.matches ? `translateX(${-14 * (1 - statusAlpha)}px)` : 'none';
    if (statusEllipsis) {
      // The "…" belongs to sending and fades with it.
      statusEllipsis.style.opacity = String(clamp(weights.processing));
      statusEllipsis.style.transform = statusText.style.transform;
    }
    statusSlot.style.transform = 'none';
    const successMix = statusAlpha ? clamp(weights.success / statusAlpha) : 0;
    // Confirm hands the button to the secondary style while sending (light
    // surface, blue label and spinner), then to the light success style (light
    // green, green label and check). One painted surface blends continuously
    // with the state weights; no overlay can expose a rim at the clip edge.
    const busy = clamp(weights.processing + weights.success);
    const share = busy ? clamp(weights.success / busy) : 0;
    const surface = `color-mix(in oklch, var(--credo-color-accent-subtle), var(--credo-color-success-subtle) ${share * 100}%)`;
    const ink = `color-mix(in oklch, var(--credo-color-accent-text), var(--credo-color-success-solid) ${share * 100}%)`;
    const blend = stop => `color-mix(in oklch, var(${stop}), ${surface} ${busy * 100}%)`;
    actionPress.style.backgroundImage = busy >= 1 ? 'none' : busy > 0
      ? `linear-gradient(209.002716deg, ${blend('--transfer-gradient-start')} -141.51%, ${blend('--transfer-gradient-end')} 108.14%)` : '';
    actionPress.style.backgroundColor = busy >= 1 ? surface : '';
    action.style.color = busy > 0 ? `color-mix(in oklch, var(--credo-color-text-on-accent), ${ink} ${busy * 100}%)` : '';
    capsule.style.backgroundColor = 'transparent';
    capsule.style.color = 'inherit';
    const spinnerAlpha = (1 - successMix) * (confirmSending ? statusAlpha : 1);
    capsuleSpinner.style.opacity = String(spinnerAlpha);
    // The spinner grows into its slot and shrinks as the check grows into the
    // same slot (CSS `scale` composes with the spin animation).
    capsuleSpinner.style.scale = !reduced.matches ? String(.6 + .4 * spinnerAlpha) : '';
    capsuleSpinner.style.animationPlayState = statusAlpha && !previewActive && !reduced.matches ? 'running' : 'paused';
    capsuleCheck.style.opacity = String(successMix);
    capsuleCheck.style.transform = reduced.matches ? 'none' : `scale(${.6 + .4 * successMix})`;
    context.style.transform = `translateY(${offset}px)`;
    // Custom entry puts the amount in the first content slot.
    const compactMoneyWeight = reduced.matches ? Number(mode === 'custom') : clamp(weights.custom);
    const moneyLift = moneyPair ? 1 : compactMoneyWeight;
    money.style.transform = `translateY(${offset - MONEY_REST_GAP * moneyLift}px)`;
    money.style.setProperty('--transfer-money-lift', String(moneyLift));
    context.style.opacity = String(contextAlpha);
    // The amount line belongs to the editor body and hands over with it: on
    // Custom ↔ Review it leaves on the body's own 100ms exit (no floor).
    money.style.opacity = String(moneyAlpha);
    money.style.visibility = '';
    // The amount sits outside the keypad panel; give it the panel's pose.
    const keypadPose = moneyPair && !reduced.matches ? clamp(weights.custom) : 1;
    editorValue.style.transform = moneyPair && !reduced.matches ? `scale(${lerp(KEYPAD_SCALE, 1, keypadPose)})` : '';
    const moneyBlur = moneyPair && !reduced.matches ? 8 * keypadPose * (1 - keypadPose) : 0;
    money.style.filter = moneyBlur > .001 ? `blur(${moneyBlur}px)` : '';
    edit.style.opacity = String(titleWeights.review);
    action.style.opacity = String(actionAlpha);
    action.style.visibility = actionAlpha > .00001 ? 'visible' : 'hidden';
    action.dataset.busy = String(mode === 'processing');
    action.disabled = !available || mode === 'processing';
    action.style.transform = reduced.matches ? 'none' : `translateY(${actionY}px)`;
    actionVisual.style.transform = reduced.matches ? 'none' : `translateY(0px) scale(${actionPose.scale})`;
    entrySlot.style.opacity = String(confirmSending ? 0 : clamp(sum(view => ['continue', 'confirm'].includes(view.action), actionWeights)) * (1 - statusAlpha));
    labels.forEach(label => {
      // A first CTA fades as one object; don't multiply its label fade by the
      // button fade. Existing action-to-action label swaps still crossfade.
      const labelTotal = sum(view => view.action, titleWeights);
      const alpha = labelTotal > .00001 ? clamp(sum(view => view.action === label.dataset.actionLabel, titleWeights) / labelTotal) : 0;
      label.style.opacity = String(['continue', 'confirm'].includes(label.dataset.actionLabel) ? 0 : alpha * (1 - statusAlpha));
      const localLabelY = (VIEWS[mode]?.action === label.dataset.actionLabel ? direction : -direction) * 4 * (1 - alpha);
      label.style.transform = reduced.matches ? 'none' : `translateY(${localLabelY}px)`;
    });
    check.style.strokeDashoffset = String(100 * (1 - (reduced.matches ? 1 : reveal)));
    if (previewActive) spinners.forEach(spinner => { spinner.style.transform = `rotate(${previewTime * 360 / .7}deg)`; });
  }

  function sampleTween(time) {
    if (!tween) return;
    const elapsed = time - tween.start;
    const f = tween.fadeDuration ? easeContent((elapsed - tween.fadeDelay) / tween.fadeDuration, tween.profile.ease) : 1;
    const m = tween.moveDuration ? easeContent(elapsed / tween.moveDuration, tween.profile.moveEase) : 1;
    const titleClock = tween.titleDuration ? clamp(elapsed / tween.titleDuration) : 1;
    // Titles share the body's curve so the whole tray changes on one clock.
    const h = easeContent(titleClock, tween.profile.ease);
    const a = tween.actionDuration ? easeContent((elapsed - tween.actionDelay) / tween.actionDuration, tween.profile.actionEase) : 1;
    for (const key of VIEW_KEYS) {
      const active = Number(key === tween.target);
      const bodyProgress = tween.profile.separateExit
        ? easeContent((elapsed - (active ? tween.fadeDelay : 0)) / Math.max(.001, tween.bodyDurations[key]), tween.profile.ease)
        : f;
      weights[key] = tween.weights[key] + (active - tween.weights[key]) * bodyProgress;
      titleWeights[key] = tween.titleWeights[key] + (active - tween.titleWeights[key]) * h;
      actionWeights[key] = tween.actionWeights[key] + (active - tween.actionWeights[key]) * a;
      const destination = active ? 0 : -tween.direction * tween.profile.exitHint;
      shifts[key] = tween.shifts[key] + (destination - tween.shifts[key]) * m;
      scales[key] = tween.scales[key] + ((active ? 1 : tween.profile.exitScale) - tween.scales[key]) * (tween.profile.separateExit || (tween.profile.depth && !active) ? m : f);
      const titleDestination = active ? 0 : -tween.direction * MOTION.hint;
      titleShifts[key] = tween.titles[key] + (titleDestination - tween.titles[key]) * h;
    }
    if (tween.profile.separateExit && (tween.profile.coverFloor !== false || reduced.matches)) {
      // The outgoing body may leave quickly, but never faster than the incoming
      // body arrives (unless the profile opts out with coverFloor: false, as
      // Custom ↔ Review does; reduced motion always keeps the plain crossfade).
      const outgoing = VIEW_KEYS.filter(key => key !== tween.target);
      const shown = outgoing.reduce((total, key) => total + weights[key], 0);
      const floor = 1 - weights[tween.target];
      const start = outgoing.reduce((total, key) => total + tween.weights[key], 0);
      if (shown < floor && start > .00001) for (const key of outgoing) {
        weights[key] = Math.min(tween.weights[key], weights[key] + (floor - shown) * tween.weights[key] / start);
      }
    }
    actionPose.y = tween.actionPose.y + (tween.actionTarget.y - tween.actionPose.y) * a;
    actionPose.scale = tween.actionPose.scale + (tween.actionTarget.scale - tween.actionPose.scale) * a;
    reveal = tween.reveal + (Number(tween.target === 'success') - tween.reveal) * m;
    if (elapsed >= Math.max(tween.fadeDuration + tween.fadeDelay, ...Object.values(tween.bodyDurations), tween.moveDuration, tween.titleDuration,
      tween.actionDuration + tween.actionDelay)) tween = null;
  }

  function step(time) {
    const sampled = sampleSurface(spring.value, spring.velocity, spring.target, Math.max(0, (time - previousTime) / 1000), spring.omega);
    previousTime = time;
    spring.value = sampled.value; spring.velocity = sampled.velocity;
    sampleTween(time);
    paint();
    frame = sampled.moving || tween ? requestAnimationFrame(step) : 0;
    // At rest: catch the scrubber up, after this frame is on screen.
    if (!frame && timelineStale && visible) buildTimelineAtRest();
  }

  function stopFrame() { cancelAnimationFrame(frame); frame = 0; }
  function pauseTimeline() { suppressPreview = true; timeline?.pause(); suppressPreview = false; }

  function selectTimeline(from, to) {
    pair = [from, to];
    timelineStale = true;
    if (visible) buildTimelineAtRest();
  }

  // After the current task (a tap's work and its first frame) and only at rest;
  // a running tray schedules it again from its last frame.
  function buildTimelineAtRest() {
    setTimeout(() => { if (!frame && visible && !disposed) buildTimeline(); });
  }

  function buildTimeline() {
    if (!timelineFactory || !timelineStale) return;
    timelineStale = false;
    const [from, to] = pair;
    const profile = transitionProfile(from, to);
    timeline?.destroy();
    const surfaceDuration = Math.max(settleDuration(from, to), .001);
    timeline = timelineFactory(from, to, profile, surfaceDuration);
    timeline.subscribe(values => {
      if (disposed || suppressPreview || timelineStale || mode === 'closed') return;
      stopFrame(); tween = null; previewActive = true; previewTime = values.time;
      direction = rank(to) >= rank(from) ? 1 : -1;
      const sampled = sampleSurface(position(from), 0, position(to), Number(values.surface.current.progress) * surfaceDuration, profile.omega);
      spring.value = sampled.value; spring.velocity = sampled.velocity; spring.omega = profile.omega;
      const f = clamp(Number(values.body.current.progress));
      const m = clamp(Number(values.movement.current.progress));
      const h = clamp(Number(values.titles.current.progress));
      const a = clamp(Number(values.action.current.progress));
      const exit = profile.separateExit ? clamp(Number(values.exit.current.progress)) : f;
      for (const key of VIEW_KEYS) {
        weights[key] = key === from ? 1 - exit : key === to ? f : 0;
        titleWeights[key] = key === from ? 1 - h : key === to ? h : 0;
        actionWeights[key] = key === from ? 1 - a : key === to ? a : 0;
        const pose = profile.separateExit || (profile.depth && key === from) ? m : f;
        scales[key] = key === from ? 1 + (profile.exitScale - 1) * pose : profile.enterScale + (1 - profile.enterScale) * pose;
        shifts[key] = key === from ? -direction * profile.exitHint * m : direction * profile.hint * (1 - m);
        titleShifts[key] = key === from ? -direction * MOTION.hint * h : direction * MOTION.hint * (1 - h);
      }
      const hasFromAction = Boolean(VIEWS[from].action), hasToAction = Boolean(VIEWS[to].action);
      const actionHidden = hasFromAction && hasToAction ? 0 : hasToAction ? 1 - a : hasFromAction ? a : 1;
      actionPose.y = profile.actionY * actionHidden;
      actionPose.scale = 1 + (profile.actionScale - 1) * actionHidden;
      reveal = to === 'success' ? m : from === 'success' ? 1 - m : 0;
      selectState(f >= .5 ? to : from);
      seekStatusText(from, to, values.time);
      seekEntryText(from, to, values.label ? Number(values.label.current.progress) * LABEL_MORPH_MS / 1000 : values.time);
      paint();
    }, false);
  }

  function setMode(next, instant = false) {
    const previousTarget = tween?.target ?? mode;
    if (disposed || (next === previousTarget && !previewActive && !instant)) return;
    const previous = mode, wasClosed = previous === 'closed', wasPreview = previewActive;
    if (next === 'processing' && !wasPreview) completedResult = null;
    pauseTimeline(); previewActive = false;
    sheet.querySelectorAll('[data-pointer-pressed]').forEach(node => node.removeAttribute('data-pointer-pressed'));
    if (next === 'closed') { stopFrame(); tween = null; selectState(next); paint(); return; }
    if (!VIEWS[next]) return;
    pendingResult = null;
    const now = performance.now();
    const wasEditorPair = pair.includes('custom') && pair.includes('review');
    const previewOrigin = wasPreview && pair.includes(next) ? pair.find(view => view !== next) : null;
    const origin = previewOrigin ?? (next !== previous ? previous
      : instant && wasEditorPair ? pair.find(view => view !== next) : previousTarget);
    direction = wasClosed || rank(next) >= rank(origin) ? 1 : -1;
    const profile = transitionProfile(wasClosed ? next : origin, next);
    // Retarget from the last painted weights and spring position.
    sampleTween(now);
    syncStatusText(next, instant);
    syncEntryText(next, instant);
    if (!wasClosed && (wasPreview ? previous !== next : origin !== next)) selectTimeline(origin, next);
    spring.target = position(next); spring.omega = profile.omega;
    // A hidden body takes its entry pose, unless it is still leaving (a quick
    // reversal): then it turns back from its current pose without a snap.
    if (weights[next] < .00001 && !(tween && tween.target !== next && Math.abs(scales[next] - 1) > .00001)) {
      shifts[next] = direction * profile.hint; scales[next] = profile.enterScale;
    }
    if (titleWeights[next] < .00001) titleShifts[next] = direction * MOTION.hint;
    if (sum(view => view.action, actionWeights) < .00001 && VIEWS[next].action) {
      actionPose.y = profile.actionY; actionPose.scale = profile.actionScale;
    }
    selectState(next);
    if (instant || wasClosed) {
      stopFrame(); tween = null;
      spring.value = spring.target; spring.velocity = 0;
      for (const key of VIEW_KEYS) {
        weights[key] = titleWeights[key] = actionWeights[key] = Number(key === next);
        scales[key] = 1;
        shifts[key] = titleShifts[key] = key === next ? 0 : -direction * MOTION.hint;
      }
      actionPose.y = VIEWS[next].action ? 0 : profile.actionY;
      actionPose.scale = VIEWS[next].action ? 1 : profile.actionScale;
      reveal = Number(next === 'success');
    } else {
      const remainingBody = Math.max(...VIEW_KEYS.map(key => Math.abs(Number(key === next) - weights[key])));
      const remainingTitle = Math.max(...VIEW_KEYS.map(key => Math.abs(Number(key === next) - titleWeights[key])));
      const remainingAction = Math.max(...VIEW_KEYS.map(key => Math.abs(Number(key === next) - actionWeights[key])));
      const hintBudget = Math.max(profile.hint, profile.exitHint);
      const remainingHint = hintBudget ? Math.min(1, Math.max(...VIEW_KEYS.filter(key => weights[key] > .00001 || key === next).map(key => Math.abs((key === next ? 0 : -direction * profile.exitHint) - shifts[key]) / hintBudget))) : remainingBody;
      const remainingScale = profile.depth ? Math.max(...VIEW_KEYS.filter(key => weights[key] > .00001 || key === next).map(key => Math.abs((key === next ? 1 : profile.exitScale) - scales[key]) / Math.max(.001, Math.abs((key === next ? profile.enterScale : profile.exitScale) - 1)))) : 0;
      const remainingMove = Math.min(1, Math.max(remainingHint, remainingScale));
      const fadeDelay = weights[next] < .00001 ? profile.fadeDelay : 0;
      // Delay only a brand-new action. Reversals and preview handoffs retain
      // their displayed opacity and resume immediately.
      const actionDelay = !wasPreview && weights[next] < .00001 && sum(view => view.action, actionWeights) < .00001 && VIEWS[next].action ? profile.actionDelay : 0;
      tween = { start: now, target: next, direction, profile, fadeDelay, actionDelay, weights: { ...weights }, titleWeights: { ...titleWeights }, actionWeights: { ...actionWeights }, actionPose: { ...actionPose },
        actionTarget: { y: VIEWS[next].action ? 0 : profile.actionY, scale: VIEWS[next].action ? 1 : profile.actionScale }, scales: { ...scales }, shifts: { ...shifts }, titles: { ...titleShifts }, reveal,
        moveDuration: profile.moveMs * remainingMove,
        titleDuration: profile.titleMs * remainingTitle,
        actionDuration: profile.actionMs * remainingAction,
        fadeDuration: profile.bodyMs * remainingBody,
        bodyDurations: Object.fromEntries(VIEW_KEYS.map(key => [key, (key === next ? profile.bodyMs : profile.exitMs ?? profile.bodyMs) * Math.abs(Number(key === next) - weights[key])])) };
      if (reduced.matches) { spring.value = spring.target; spring.velocity = 0; }
      if (!frame || wasEditorPair) previousTime = now;
      if (!frame) frame = requestAnimationFrame(step);
    }
    paint();
  }

  function fitPhone() {
    const mobile = window.innerWidth < 700;
    const framed = holder.dataset?.framed === 'true';
    const reserved = (mobile ? 128 : 88) + (visible ? 260 : 12);
    const availableWidth = Math.min(window.innerWidth - 40, (stage.clientWidth || window.innerWidth) - 24);
    const widthScale = availableWidth / (framed ? 414 : 390);
    // Preserve 44px nonoverlapping targets. A small authoring viewport can scroll.
    phoneScale = Math.min(1, widthScale, Math.max(.75, (window.innerHeight - reserved) / (framed ? 876 : 852)));
    holder.style.setProperty('--transfer-scale', String(phoneScale));
    const hit = Math.ceil(44 / phoneScale);
    const closeSize = Math.max(40, hit), closeTop = Math.max(0, 40 - closeSize / 2);
    close.style.setProperty('--hit-size', `${closeSize}px`);
    close.style.setProperty('--hit-left', `${40 - closeSize}px`);
    close.style.setProperty('--hit-top', `${closeTop - 20}px`);
    holder.style.setProperty('--control-hit', `${hit}px`);
    // Extra row hit padding fits the 12px gaps at the minimum interactive scale.
    sheet.querySelectorAll('.credo-row--interactive').forEach(row => {
      row.style.setProperty('--hit-height', `${Math.max(48, hit)}px`);
    });
    stage.style.paddingBottom = visible ? '260px' : '12px';
    stage.toggleAttribute('data-timeline', visible);
    paint();
  }

  function syncVisibility() {
    timelineButton.textContent = visible ? 'Hide timeline' : 'Show timeline';
    if (visible && !frame) buildTimeline();
    if (visible && timeline && !previewActive && mode !== 'closed') {
      timeline.seek(mode === pair[0] ? 0 : timeline.values.duration);
    }
    else if (!visible && previewActive) {
      const next = pendingResult ?? (mode === 'processing' ? completedResult : null) ?? mode;
      setMode(next); pendingResult = null;
    }
    fitPhone();
  }

  function toggleTimeline() { visible = !visible; dock?.setVisible(visible); syncVisibility(); }
  function frameKey(event) {
    if (!visible || !timeline || ![',', '.'].includes(event.key)) return;
    if (event.defaultPrevented || event.target.closest('input, textarea, [contenteditable="true"], .transfer-typography')) return;
    event.preventDefault(); timeline.pause();
    timeline.seek(Math.max(0, Math.min(timeline.values.duration, timeline.values.time + (event.key === '.' ? 1 : -1) / 60)));
  }

  async function initTimeline() {
    const { createDialTimeline, createDialTimelineRoot } = await import('dialkit/vanilla');
    if (disposed) return;
    // TODO(production): Preserve the phase-to-spring composition, shared elements,
    // reversible panel weights and checkmark binding when replacing this preview.
    timelineFactory = (from, to, profile, duration) => {
      const bodyDelay = profile.fadeDelay ?? 0;
      return createDialTimeline(`${VIEWS[from].title} → ${VIEWS[to].title}`, {
        duration: Math.max(.4, duration, (bodyDelay + profile.bodyMs) / 1000),
        surface: { at: 0, duration, from: { progress: 0 }, to: { progress: 1 }, transition: { type: 'easing', duration, ease: [0, 0, 1, 1] } },
        ...(profile.exitMs ? {
          exit: { at: 0, duration: profile.exitMs / 1000, from: { progress: 0 }, to: { progress: 1 }, transition: { type: 'easing', duration: profile.exitMs / 1000, ease: profile.ease } },
        } : {}),
        ...(entryCopy[from] && entryCopy[to] && entryCopy[from] !== entryCopy[to] ? {
          label: { at: 0, duration: LABEL_MORPH_MS / 1000, from: { progress: 0 }, to: { progress: 1 }, transition: { type: 'easing', duration: LABEL_MORPH_MS / 1000, ease: [0, 0, 1, 1] } }
        } : {}),
        ...({
          body: { at: bodyDelay / 1000, duration: profile.bodyMs / 1000, from: { progress: 0 }, to: { progress: 1 }, transition: { type: 'easing', duration: profile.bodyMs / 1000, ease: profile.ease } },
          action: { at: profile.actionDelay / 1000, duration: profile.actionMs / 1000, from: { progress: 0 }, to: { progress: 1 }, transition: { type: 'easing', duration: profile.actionMs / 1000, ease: profile.actionEase } },
          titles: { at: 0, duration: profile.titleMs / 1000, from: { progress: 0 }, to: { progress: 1 }, transition: { type: 'easing', duration: profile.titleMs / 1000, ease: profile.ease } },
          movement: { at: 0, duration: profile.moveMs / 1000, from: { progress: 0 }, to: { progress: 1 }, transition: { type: 'easing', duration: profile.moveMs / 1000, ease: profile.moveEase } }
        })
      }, { autoplay: false, persist: process.env.NODE_ENV === 'development', id: `credo-transfer-flow-${from}-${to}-${profile.persistenceVersion ?? (profile.depth ? 'v6' : 'v4')}${[from, to].includes('custom') ? '-compact' : ''}${[from, to].includes('review') && ![from, to].every(key => VIEWS[key]?.receipt) ? '-review-polish-v2' : ''}${[from, to].includes('review') && [from, to].includes('processing') ? '-confirm-sending-v3' : ''}` });
    };
    selectTimeline(...pair);
    dock = createDialTimelineRoot({ theme: 'light', defaultVisible: visible, defaultOpen: true, onVisibilityChange: next => {
      if (visible === next) return; visible = next; syncVisibility();
    } });
  }

  const onMotionChange = () => previewActive ? paint() : setMode(mode, true);
  fitPhone(); initTimeline();
  window.addEventListener('resize', fitPhone);
  document.addEventListener('keydown', frameKey);
  reduced.addEventListener('change', onMotionChange);
  return {
    setMode, toggleTimeline, fitPhone,
    mode: () => mode,
    isPreviewing: () => previewActive,
    canActivate: () => Boolean(VIEWS[mode]),
    setAvailable(value) { available = value; paint(); },
    complete(next) { completedResult = next; if (previewActive || mode === 'closed') pendingResult = next; else setMode(next); },
    reset() { pendingResult = completedResult = null; setMode('options', true); selectTimeline('options', 'china'); },
    destroy() {
      disposed = true; stopFrame();
      window.removeEventListener('resize', fitPhone);
      document.removeEventListener('keydown', frameKey);
      reduced.removeEventListener('change', onMotionChange);
      timeline?.destroy(); dock?.destroy();
      statusMorph?.destroy();
      entryMorph?.destroy();
    }
  };
}
