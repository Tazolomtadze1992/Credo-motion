import { SHEET_HEIGHT, VIEWS, VIEW_KEYS } from './transfer-flow.mjs';

// Surface and content respond together; a first CTA enters as its space opens.
export const MOTION = {
  unit: 116, omega: 32.5, fadeMs: 130, moveMs: 180, hint: 8,
  ease: [.25, .46, .45, .94], bodyEase: [.26, .08, .25, 1], titleMs: 150, bodyScale: .96
};
const clamp = n => Math.max(0, Math.min(1, n));
const position = view => (SHEET_HEIGHT - VIEWS[view].height) / MOTION.unit;
const rank = view => ({ options: 0, china: 1, amount: 2, custom: 3, review: 4, processing: 5, success: 6, failure: 6, pending: 6 })[view];

// Preserve the approved options/method switch. New flow steps use Emil's
// height-dependent content clock, independent of the physical surface clock.
export function transitionProfile(from, to) {
  const presetReview = [from, to].includes('amount') && [from, to].includes('review');
  if (presetReview) return {
    bodyMs: 130, exitMs: 100, separateExit: true, titleMs: 130, moveMs: 180, fadeDelay: 30,
    ease: MOTION.ease, moveEase: MOTION.ease, depth: true,
    omega: MOTION.omega, hint: 8, exitHint: 8,
    enterScale: to === 'amount' ? 1.025 : 1, exitScale: from === 'amount' ? 1.025 : 1,
    actionMs: 130, actionDelay: 0, actionY: 0, actionScale: 1,
    actionEase: MOTION.ease, persistenceVersion: 'preset-review-v1'
  };
  if ([from, to].every(view => VIEWS[view]?.receipt)) return {
    bodyMs: 200, titleMs: 130, moveMs: 200, fadeDelay: 0,
    ease: [.19, 1, .22, 1], moveEase: [.19, 1, .22, 1], depth: false,
    omega: MOTION.omega, hint: 0, exitHint: 0, enterScale: 1, exitScale: 1,
    actionMs: 130, actionDelay: 0, actionY: 0, actionScale: 1,
    actionEase: MOTION.ease, persistenceVersion: 'receipt-button-v2'
  };
  const customReview = [from, to].includes('custom') && [from, to].includes('review');
  if (customReview) return {
    bodyMs: 130, exitMs: 100, titleMs: 130, moveMs: 180, fadeDelay: 30,
    ease: MOTION.ease, moveEase: MOTION.ease, depth: true, separateExit: true, fadeAmount: true,
    omega: MOTION.omega, hint: 8, exitHint: 8,
    enterScale: to === 'custom' ? .96 : 1, exitScale: from === 'custom' ? .96 : 1,
    actionMs: 130, actionDelay: 0, actionY: 0, actionScale: 1,
    actionEase: MOTION.ease, persistenceVersion: 'amount-fade-v9'
  };
  const amountCustom = [from, to].includes('amount') && [from, to].includes('custom');
  if (amountCustom) return {
    bodyMs: 150, titleMs: 130, moveMs: 180,
    ease: MOTION.ease, moveEase: MOTION.ease, depth: true, fadeDelay: 0,
    omega: MOTION.omega,
    hint: to === 'custom' ? 12 : 8,
    exitHint: from === 'amount' ? 8 : 12,
    enterScale: to === 'custom' ? .96 : 1.025,
    exitScale: from === 'amount' ? 1.025 : .96,
    actionMs: 150, actionDelay: 0, actionY: 0, actionScale: 1,
    actionEase: MOTION.ease, persistenceVersion: 'v7'
  };
  const baseline = [from, to].every(view => ['options', 'china'].includes(view));
  const methodAmount = [from, to].includes('china') && [from, to].includes('amount');
  const bodyMs = baseline || methodAmount ? MOTION.fadeMs : Math.min(270, Math.max(150, Math.abs(VIEWS[to].height - VIEWS[from].height) * 2));
  const enterScale = methodAmount ? (to === 'amount' ? .94 : 1.04) : baseline ? 1 : MOTION.bodyScale;
  const exitScale = methodAmount ? (from === 'china' ? 1.04 : .94) : baseline ? 1 : MOTION.bodyScale;
  return { bodyMs, titleMs: baseline || methodAmount ? MOTION.fadeMs : MOTION.titleMs,
    moveMs: baseline || methodAmount ? MOTION.moveMs : bodyMs,
    moveEase: baseline || methodAmount ? MOTION.ease : MOTION.bodyEase,
    depth: methodAmount, fadeDelay: 0,
    omega: MOTION.omega,
    hint: methodAmount ? (to === 'amount' ? 8 : 0) : baseline ? MOTION.hint : 0,
    exitHint: methodAmount ? (from === 'amount' ? 8 : 0) : baseline ? MOTION.hint : 0,
    enterScale, exitScale,
    actionMs: baseline || methodAmount ? MOTION.fadeMs : MOTION.titleMs,
    actionDelay: methodAmount && to === 'amount' ? 60 : 0,
    actionY: methodAmount ? 0 : 4, actionScale: methodAmount ? .96 : .98,
    actionEase: MOTION.ease,
    ease: baseline || methodAmount ? MOTION.ease : MOTION.bodyEase };
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
  const omega = transitionProfile(from, to).omega;
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

export function createTransferMotion({ sheet, holder, stage, timelineButton, onView, createStatusMorph, amountFade }) {
  const query = selector => sheet.querySelector(selector);
  const header = query('.transfer-sheet-header'), divider = query('.transfer-divider');
  const mask = query('.transfer-content-mask'), close = query('.transfer-close');
  const titles = query('.transfer-sheet-titles');
  const context = query('.transfer-method-context'), money = query('.transfer-money');
  const caption = query('.transfer-money-caption');
  const moneyValue = query('.transfer-money-value'), moneyNumber = query('.transfer-money-number');
  const total = query('.transfer-review-total');
  const fadeValue = amountFade.querySelector('.transfer-fade-value');
  const fadeCurrency = amountFade.querySelector('.transfer-fade-currency');
  const fadeNumber = amountFade.querySelector('.transfer-fade-number');
  const edit = query('.transfer-edit-amount'), action = query('.transfer-primary');
  const detailsLabel = query('.transfer-review-heading h3');
  const actionVisual = query('.transfer-primary-visual');
  const actionPress = query('.transfer-primary-press');
  const panels = Object.fromEntries(VIEW_KEYS.map(key => [key, query(`[data-panel="${key}"]`)]));
  const bodies = Object.fromEntries(VIEW_KEYS.map(key => [key, query(`[data-panel="${key}"] .transfer-panel-body`)]));
  const headings = Object.fromEntries(VIEW_KEYS.map(key => [key, query(`[data-title="${key}"]`)]));
  const labels = [...sheet.querySelectorAll('[data-action-label]')];
  const check = query('.transfer-success-path');
  const statusSlot = query('.transfer-status-slot'), capsule = query('.transfer-status-capsule');
  const statusText = query('.transfer-status-text'), capsuleSpinner = query('.transfer-capsule-spinner');
  const capsuleCheck = query('.transfer-capsule-check');
  const spinners = [...sheet.querySelectorAll('.transfer-spinner')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const spring = { value: position('options'), velocity: 0, target: position('options'), omega: MOTION.omega };
  const weights = Object.fromEntries(VIEW_KEYS.map(key => [key, key === 'options' ? 1 : 0]));
  const shifts = Object.fromEntries(VIEW_KEYS.map(key => [key, key === 'options' ? 0 : MOTION.hint]));
  const titleShifts = { ...shifts }, titleWeights = { ...weights }, actionWeights = { ...weights };
  const actionPose = { y: 4, scale: .98 };
  const scales = Object.fromEntries(VIEW_KEYS.map(key => [key, 1]));
  let fadeTop = 164;
  let direction = 1;
  let reveal = 0, tween = null, frame = 0, previousTime = 0;
  let mode = 'options', previewActive = false, suppressPreview = false;
  let timeline = null, dock = null, timelineFactory = null, visible = false;
  let pair = ['options', 'china'], disposed = false, phoneScale = 1, previewTime = 0;
  let pendingResult = null, completedResult = null, available = false;
  const statusCopy = { review: 'Confirm transfer', processing: 'Sending transfer…', success: 'Transfer sent' };
  let statusMorph = createStatusMorph?.(statusText, statusCopy.processing), morphTarget = statusCopy.processing;
  let previewMorphPair = null, morphDisabled = false, lastMorphPreviewTime = -1;
  const entryText = query('.transfer-entry-text'), entrySlot = query('.transfer-entry-label');
  const entryCopy = { amount: 'Continue', custom: 'Continue', review: 'Confirm transfer' };
  let entryMorph = createStatusMorph?.(entryText, entryCopy.amount, false, 160), entryTarget = entryCopy.amount;
  let entryDisabled = false, entryPreviewPair = null, lastEntryPreviewTime = -1;

  function syncEntryText(next, instant = false) {
    if (!entryCopy[next]) return;
    const text = entryCopy[next], disabled = instant || reduced.matches;
    if (!entryMorph) entryText.textContent = text;
    else if (disabled) {
      entryMorph.destroy(); entryMorph = createStatusMorph(entryText, text, disabled, 160);
    } else if (entryDisabled) {
      entryMorph.destroy(); entryMorph = createStatusMorph(entryText, entryTarget, false, 160);
      if (entryTarget !== text) entryMorph.update(text);
    } else if (entryTarget !== text) entryMorph.update(text);
    else if (entryPreviewPair) entryText.getAnimations({ subtree: true }).forEach(animation => animation.play());
    entryTarget = text; entryDisabled = disabled; entryPreviewPair = null;
  }

  function seekEntryText(from, to, time) {
    if (!entryCopy[from] || !entryCopy[to] || entryCopy[from] === entryCopy[to]) return;
    const key = `${from}-${to}`;
    if (entryMorph && (entryPreviewPair !== key || time < lastEntryPreviewTime)) {
      entryMorph.destroy(); entryMorph = createStatusMorph(entryText, entryCopy[from], reduced.matches, 160);
      entryMorph.update(entryCopy[to]); entryTarget = entryCopy[to];
      entryPreviewPair = key; entryDisabled = reduced.matches;
    }
    lastEntryPreviewTime = time;
    entryText.getAnimations?.({ subtree: true }).forEach(animation => {
      animation.pause(); animation.currentTime = Math.min(160, Math.max(0, time * 1000));
    });
  }

  function syncStatusText(next, instant = false) {
    if (!statusCopy[next]) return;
    const text = statusCopy[next], disabled = instant || reduced.matches;
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
      statusMorph.destroy(); statusMorph = createStatusMorph(statusText, statusCopy[from], reduced.matches);
      statusMorph.update(statusCopy[to]); morphTarget = statusCopy[to];
      previewMorphPair = key; morphDisabled = reduced.matches;
    }
    lastMorphPreviewTime = time;
    statusText.getAnimations?.({ subtree: true }).forEach(animation => {
      animation.pause(); animation.currentTime = Math.min(200, Math.max(0, time * 1000));
    });
  }

  // Snapshot the custom value at its resting anchor. This visual copy lives
  // outside the resizing sheet clip, so a pure fade cannot be sliced off.
  // The native input and receipt retain their accessible values.
  function snapshotAmountFade() {
    const saved = money.style.transform;
    money.style.transform = `translateY(${SHEET_HEIGHT - VIEWS.custom.height - 64}px)`;
    const canvas = sheet.getBoundingClientRect(), source = moneyNumber.getBoundingClientRect();
    const scale = canvas.width / 390;
    fadeCurrency.textContent = moneyNumber.querySelector('span').textContent;
    fadeNumber.textContent = query('.transfer-amount-input input').value;
    fadeTop = (source.top - canvas.top) / scale;
    fadeValue.style.fontSize = getComputedStyle(moneyValue).fontSize;
    fadeValue.style.transform = `translate(${(source.right - canvas.left) / scale}px, ${(source.top + source.height / 2 - canvas.top) / scale}px) translateY(-50%)`;
    money.style.transform = saved;
  }

  function selectState(next) {
    if (next === mode) return;
    mode = next;
    onView(next);
  }

  const sum = (predicate, track = weights) => VIEW_KEYS.reduce((total, key) => total + (predicate(VIEWS[key], key) ? track[key] : 0), 0);

  function paint() {
    const offset = reduced.matches && VIEWS[mode] ? SHEET_HEIGHT - VIEWS[mode].height : MOTION.unit * spring.value;
    const contextAlpha = clamp(sum(view => view.context));
    const moneyAlpha = clamp(sum(view => view.money));
    const actionAlpha = clamp(sum(view => view.action, actionWeights));
    const actionY = actionPose.y;
    const footer = 34 + 72 * (reduced.matches ? Number(Boolean(VIEWS[mode]?.action)) : actionAlpha);
    const amountCustom = pair.includes('amount') && pair.includes('custom');
    const customReview = pair.includes('custom') && pair.includes('review');
    const presetReview = pair.includes('amount') && pair.includes('review');
    sheet.style.clipPath = `inset(${offset}px 0px 0px round 24px)`;
    sheet.toggleAttribute('data-preview', previewActive);
    header.style.transform = divider.style.transform = `translateY(${offset}px)`;
    titles.style.transform = 'none';
    // Returning presets enter8px above their resting slot, plus centered growth.
    // Leave 12px headroom while keeping content below the divider.
    mask.style.clipPath = `inset(${(amountCustom ? 88 : 100) + offset}px 0px ${footer}px 0px)`;
    const featherEnd = SHEET_HEIGHT - footer;
    const feather = `linear-gradient(to bottom, #000 ${featherEnd - 16}px, transparent ${featherEnd}px)`;
    mask.style.maskImage = mask.style.webkitMaskImage = feather;
    for (const key of VIEW_KEYS) {
      const weight = clamp(weights[key]);
      const crispPanel = customReview || presetReview ? ['custom', 'review', 'amount'].includes(key) : amountCustom ? key === 'amount' || key === 'custom' : key === 'amount';
      const blur = reduced.matches || crispPanel ? 0 : 8 * weight * (1 - weight);
      const filter = blur > .001 ? `blur(${blur}px)` : 'none';
      const titleWeight = clamp(titleWeights[key]);
      panels[key].style.opacity = String(weight);
      headings[key].style.opacity = String(titleWeight);
      panels[key].style.visibility = weight > .00001 ? 'visible' : 'hidden';
      headings[key].style.visibility = titleWeight > .00001 ? 'visible' : 'hidden';
      const panelOffset = offset + (reduced.matches ? 0 : shifts[key]);
      panels[key].style.transform = `translateY(${panelOffset}px)`;
      bodies[key].style.transform = reduced.matches ? 'none' : `scale(${scales[key]})`;
      headings[key].style.transform = reduced.matches ? 'none' : `translateY(${titleShifts[key]}px)`;
      panels[key].style.filter = filter;
      const titleBlur = reduced.matches ? 0 : 8 * titleWeight * (1 - titleWeight);
      headings[key].style.filter = titleBlur > .001 ? `blur(${titleBlur}px)` : 'none';
    }
    const statusAlpha = clamp(sum(view => view.status));
    if (statusAlpha > .00001) {
      // Keep the receipt anchored while the sheet removes the36px heading row.
      const receiptOffset = pair.every(key => VIEWS[key]?.receipt)
        ? SHEET_HEIGHT - VIEWS.review.height : offset;
      panels.review.style.opacity = String(clamp(sum(view => view.receipt)));
      panels.review.style.visibility = 'visible';
      panels.review.style.transform = `translateY(${receiptOffset}px)`;
      panels.review.style.filter = 'none'; bodies.review.style.transform = 'scale(1)';
    }
    if (pair[0] !== pair[1] && VIEWS[pair[0]].title === VIEWS[pair[1]].title) {
      pair.forEach(key => {
        headings[key].style.opacity = String(Number(key === mode));
        headings[key].style.filter = 'none'; headings[key].style.transform = 'none';
      });
    }
    const confirmSending = pair.includes('review') && pair.includes('processing');
    const statusTextAlpha = confirmSending ? clamp(weights.review + weights.processing) : statusAlpha;
    statusSlot.style.opacity = String(statusTextAlpha);
    statusSlot.style.visibility = statusTextAlpha > .00001 ? 'visible' : 'hidden';
    // Keep Confirm centered while the icon's reserved28px enters the group.
    statusText.style.transform = confirmSending && !reduced.matches ? `translateX(${-14 * (1 - statusAlpha)}px)` : 'none';
    statusSlot.style.transform = 'none';
    const successMix = statusAlpha ? clamp(weights.success / statusAlpha) : 0;
    // One painted surface carries the brand gradient through sending, then
    // blends into semantic green. No overlay can expose a rim at the clip edge.
    const fillMix = clamp(weights.success);
    const successFill = 'var(--transfer-success-fill)';
    const tint = stop => `color-mix(in oklch, var(${stop}), ${successFill} ${fillMix * 100}%)`;
    actionPress.style.backgroundImage = fillMix === 1 ? 'none' : fillMix > 0
      ? `linear-gradient(209.002716deg, ${tint('--transfer-gradient-start')} -141.51%, ${tint('--transfer-gradient-end')} 108.14%)` : '';
    actionPress.style.backgroundColor = fillMix === 1 ? successFill : '';
    capsule.style.backgroundColor = 'transparent';
    capsule.style.color = 'inherit';
    capsuleSpinner.style.opacity = String((1 - successMix) * (confirmSending ? statusAlpha : 1));
    capsuleSpinner.style.animationPlayState = statusAlpha && !previewActive && !reduced.matches ? 'running' : 'paused';
    capsuleCheck.style.opacity = String(successMix);
    capsuleCheck.style.transform = reduced.matches ? 'none' : `scale(${.6 + .4 * successMix})`;
    context.style.transform = `translateY(${offset}px)`;
    // Custom entry puts the amount in the first content slot.
    const compactMoneyWeight = customReview ? 1 : reduced.matches ? Number(mode === 'custom') : clamp(weights.custom);
    money.style.transform = `translateY(${offset - 64 * compactMoneyWeight}px)`;
    context.style.opacity = String(contextAlpha);
    // The reduced-motion surface snaps immediately: clear the old amount
    // before that layout switch rather than fading it at its new position.
    const clearReducedAmount = reduced.matches && customReview && mode !== 'custom';
    money.style.opacity = String(clearReducedAmount ? 0 : moneyAlpha);
    // Clear the old hint before the receipt becomes readable, without giving
    // the fading caption its former64px downward movement. Reverse on Edit.
    caption.style.opacity = String(customReview ? clamp((weights.custom - .5) * 2) : 1);
    edit.style.opacity = detailsLabel.style.opacity = String(titleWeights.review);
    detailsLabel.style.visibility = titleWeights.review > .00001 ? 'visible' : 'hidden';
    const fadingAmount = customReview && mode !== 'closed' && !reduced.matches &&
      (previewActive || Boolean(tween) || spring.value !== spring.target);
    // Finish the fade before the shrinking sheet edge reaches the old value.
    // On Edit, reveal it only after there is white surface beneath it again.
    const fadeAlpha = fadingAmount ? moneyAlpha * clamp((fadeTop - offset) / 20) : 0;
    amountFade.style.visibility = fadeAlpha > .00001 ? 'visible' : 'hidden';
    amountFade.style.opacity = String(fadeAlpha);
    moneyValue.style.opacity = fadingAmount ? '0' : '1';
    total.style.opacity = '1';
    action.style.opacity = String(actionAlpha);
    action.style.visibility = actionAlpha > .00001 ? 'visible' : 'hidden';
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

    const hit = Math.ceil(44 / phoneScale);
    const closeSize = Math.max(40, hit), closeTop = Math.max(0, 40 - closeSize / 2);
    close.style.setProperty('--hit-size', `${closeSize}px`);
    close.style.setProperty('--hit-left', `${40 - closeSize}px`);
    close.style.setProperty('--hit-top', `${closeTop - 20}px`);
    holder.style.setProperty('--control-hit', `${hit}px`);
    // Extra row hit padding fits the 12px gaps at the minimum interactive scale.
    sheet.querySelectorAll('.transfer-row--interactive').forEach(row => {
      row.style.setProperty('--hit-height', `${Math.max(48, hit)}px`);
    });
  }

  function sampleTween(time) {
    if (!tween) return;
    const elapsed = time - tween.start;
    const f = tween.fadeDuration ? easeContent((elapsed - tween.fadeDelay) / tween.fadeDuration, tween.profile.ease) : 1;
    const m = tween.moveDuration ? easeContent(elapsed / tween.moveDuration, tween.profile.moveEase) : 1;
    const h = tween.titleDuration ? easeContent(elapsed / tween.titleDuration) : 1;
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
    actionPose.y = tween.actionPose.y + (tween.actionTarget.y - tween.actionPose.y) * a;
    actionPose.scale = tween.actionPose.scale + (tween.actionTarget.scale - tween.actionPose.scale) * a;
    reveal = tween.reveal + (Number(tween.target === 'success') - tween.reveal) * m;
    if (elapsed >= Math.max(tween.fadeDuration + tween.fadeDelay, tween.moveDuration, tween.titleDuration, tween.actionDuration + tween.actionDelay)) tween = null;
  }

  function step(time) {
    const sampled = sampleSurface(spring.value, spring.velocity, spring.target, Math.max(0, (time - previousTime) / 1000), spring.omega);
    previousTime = time;
    spring.value = sampled.value; spring.velocity = sampled.velocity;
    sampleTween(time); paint();
    frame = sampled.moving || tween ? requestAnimationFrame(step) : 0;
  }

  function stopFrame() { cancelAnimationFrame(frame); frame = 0; }
  function pauseTimeline() { suppressPreview = true; timeline?.pause(); suppressPreview = false; }

  function selectTimeline(from, to) {
    pair = [from, to];
    if (!timelineFactory) return;
    timeline?.destroy();
    timeline = timelineFactory(from, to);
    const profile = transitionProfile(from, to);
    timeline.subscribe(values => {
      if (disposed || suppressPreview || mode === 'closed') return;
      stopFrame(); tween = null; previewActive = true; previewTime = values.time;
      const sampled = sampleSurface(position(from), 0, position(to), Number(values.surface.current.progress) * Math.max(settleDuration(from, to), .001), profile.omega);
      spring.value = sampled.value; spring.velocity = sampled.velocity; spring.omega = profile.omega;
      direction = rank(to) >= rank(from) ? 1 : -1;
      const f = clamp(Number(values.body.current.progress)), m = clamp(Number(values.movement.current.progress));
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
      seekEntryText(from, to, values.label ? Number(values.label.current.progress) * .16 : values.time);
      paint();
    }, false);
  }

  function setMode(next, instant = false) {
    if (disposed || (next === mode && !previewActive && !instant)) return;
    const previous = mode, wasClosed = previous === 'closed', wasPreview = previewActive;
    if (next === 'processing' && !wasPreview) completedResult = null;
    pauseTimeline(); previewActive = false;
    sheet.querySelectorAll('[data-pointer-pressed]').forEach(node => node.removeAttribute('data-pointer-pressed'));
    if (next === 'closed') { stopFrame(); tween = null; selectState(next); paint(); return; }
    if (!VIEWS[next]) return;
    pendingResult = null;
    const now = performance.now(); sampleTween(now);
    syncStatusText(next, instant);
    syncEntryText(next, instant);
    const previewOrigin = wasPreview && pair.includes(next) ? pair.find(view => view !== next) : null;
    direction = wasClosed || rank(next) >= rank(previewOrigin ?? previous) ? 1 : -1;
    const profile = transitionProfile(previewOrigin ?? (wasClosed ? next : previous), next);
    if (profile.fadeAmount) snapshotAmountFade();
    if (!wasClosed && previous !== next) selectTimeline(previous, next);
    spring.target = position(next); spring.omega = profile.omega;
    if (weights[next] < .00001) { shifts[next] = direction * profile.hint; scales[next] = profile.enterScale; }
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
      if (!frame) { previousTime = now; frame = requestAnimationFrame(step); }
    }
    paint();
  }

  function fitPhone() {
    const mobile = window.innerWidth < 700;
    const framed = holder.dataset?.framed === 'true';
    const reserved = (mobile ? 168 : 88) + (visible ? 260 : 12);
    const widthScale = (window.innerWidth - 40) / (framed ? 414 : 390);
    // Preserve 44px nonoverlapping targets. A small authoring viewport can scroll.
    phoneScale = Math.min(1, widthScale, Math.max(.75, (window.innerHeight - reserved) / (framed ? 876 : 852)));
    holder.style.setProperty('--transfer-scale', String(phoneScale));
    stage.style.paddingBottom = visible ? '260px' : '12px';
    stage.toggleAttribute('data-timeline', visible);
    if (pair.includes('custom') && pair.includes('review')) snapshotAmountFade();
    paint();
  }

  function syncVisibility() {
    timelineButton.textContent = visible ? 'Hide timeline' : 'Show timeline';
    if (visible && timeline && !previewActive && mode !== 'closed') {
      if (transitionProfile(...pair).fadeAmount) snapshotAmountFade();
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
    if (event.defaultPrevented || event.target.closest('input, textarea, [contenteditable="true"]')) return;
    event.preventDefault(); timeline.pause();
    timeline.seek(Math.max(0, Math.min(timeline.values.duration, timeline.values.time + (event.key === '.' ? 1 : -1) / 60)));
  }

  async function initTimeline() {
    const { createDialTimeline, createDialTimelineRoot } = await import('dialkit/vanilla');
    if (disposed) return;
    // TODO(production): Preserve the phase-to-spring composition, shared elements,
    // reversible panel weights and checkmark binding when replacing this preview.
    timelineFactory = (from, to) => {
      const duration = Math.max(settleDuration(from, to), .001);
      const profile = transitionProfile(from, to);
      return createDialTimeline(`${VIEWS[from].title} → ${VIEWS[to].title}`, {
        duration: Math.max(.4, duration),
        surface: { at: 0, duration, from: { progress: 0 }, to: { progress: 1 }, transition: { type: 'easing', duration, ease: [0, 0, 1, 1] } },
        ...(profile.exitMs ? {
          exit: { at: 0, duration: profile.exitMs / 1000, from: { progress: 0 }, to: { progress: 1 }, transition: { type: 'easing', duration: profile.exitMs / 1000, ease: profile.ease } },
        } : {}),
        ...(entryCopy[from] && entryCopy[to] && entryCopy[from] !== entryCopy[to] ? {
          label: { at: 0, duration: .16, from: { progress: 0 }, to: { progress: 1 }, transition: { type: 'easing', duration: .16, ease: [0, 0, 1, 1] } }
        } : {}),
        body: { at: profile.fadeDelay / 1000, duration: profile.bodyMs / 1000, from: { progress: 0 }, to: { progress: 1 }, transition: { type: 'easing', duration: profile.bodyMs / 1000, ease: profile.ease } },
        action: { at: profile.actionDelay / 1000, duration: profile.actionMs / 1000, from: { progress: 0 }, to: { progress: 1 }, transition: { type: 'easing', duration: profile.actionMs / 1000, ease: profile.actionEase } },
        titles: { at: 0, duration: profile.titleMs / 1000, from: { progress: 0 }, to: { progress: 1 }, transition: { type: 'easing', duration: profile.titleMs / 1000, ease: MOTION.ease } },
        movement: { at: 0, duration: profile.moveMs / 1000, from: { progress: 0 }, to: { progress: 1 }, transition: { type: 'easing', duration: profile.moveMs / 1000, ease: profile.moveEase } }
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
