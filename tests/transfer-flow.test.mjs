import test from 'node:test';
import assert from 'node:assert/strict';
import { amountToMinor, editAmount, formatInput, backTarget, simulateTransfer, VIEWS, SHEET_HEIGHT } from '../lib/transfer-flow.mjs';
import { createTransferMotion, sampleSurface, settleDuration, transitionProfile, MOTION } from '../lib/transfer-motion.mjs';

test('amount entry preserves exact cents and rejects invalid or oversized values', () => {
  assert.equal(amountToMinor('12.34'), 1234);
  assert.equal(amountToMinor('0.1'), 10);
  assert.equal(amountToMinor('49999.99'), 4999999);
  assert.equal(amountToMinor('50000.00'), 5000000);
  for (const value of ['', '-1', '1e4', '1000000', '50000.01', '50001', '999999.99', '1.234', 'NaN']) assert.equal(amountToMinor(value), 0);
  let input = '0';
  for (const key of ['0','1','2','.','3','4','5','.']) input = editAmount(input, key);
  assert.equal(input, '12.34');
  assert.equal(editAmount(input, 'backspace'), '12.3');
  assert.equal(editAmount('0', 'backspace'), '0');
  assert.equal(editAmount('50000', '1'), '50000');
  assert.equal(editAmount('50000.0', '1'), '50000.0');
  assert.equal(editAmount('50000.0', '0'), '50000.00');
  assert.equal(formatInput('1234.'), '1,234.');
});

test('review returns to the chosen amount branch and submitted states cannot go back', () => {
  assert.equal(backTarget('review', 'custom'), 'custom');
  assert.equal(backTarget('review', 'amount'), 'amount');
  assert.equal(backTarget('custom'), 'amount');
  assert.equal(backTarget('amount'), 'china');
  assert.equal(backTarget('china'), 'options');
  for (const view of ['processing','success','pending','failure']) assert.equal(backTarget(view), null);
});

test('simulated response retains its submitted snapshot and cancellation rejects it', async () => {
  const controller = new AbortController();
  const submitted = { method: 'wechat', amountMinor: 1234, outcome: 'pending', signal: controller.signal, delay: 1 };
  const response = simulateTransfer(submitted);
  submitted.amountMinor = 9999;
  assert.deepEqual(await response, { method: 'wechat', amountMinor: 1234, status: 'pending', reference: 'DEMO-001' });
  const cancel = new AbortController();
  const cancelled = simulateTransfer({ method: 'alipay', amountMinor: 1000, outcome: 'success', signal: cancel.signal });
  cancel.abort();
  await assert.rejects(cancelled, { name: 'AbortError' });
});

test('the approved 116px transition retains its curve and a reversal carries velocity', () => {
  assert.equal(VIEWS.options.height - VIEWS.china.height, 116);
  const state = sampleSurface(0, 0, 1, .1);
  assert.ok(Math.abs(state.value - (1 - 4.25 * Math.exp(-3.25))) < 1e-12);
  const reversed = sampleSurface(state.value, state.velocity, 0, 0);
  assert.equal(reversed.value, state.value);
  assert.equal(reversed.velocity, state.velocity);
  assert.equal(sampleSurface(reversed.value, reversed.velocity, 0, 1).value, 0);
});

test('every timeline surface clock includes its actual spring settling tail', () => {
  for (const from of Object.keys(VIEWS)) for (const to of Object.keys(VIEWS)) {
    const start = (SHEET_HEIGHT - VIEWS[from].height) / MOTION.unit;
    const target = (SHEET_HEIGHT - VIEWS[to].height) / MOTION.unit;
    const atEnd = sampleSurface(start, 0, target, settleDuration(from, to), transitionProfile(from, to).omega);
    assert.equal(atEnd.value, target, `${from} → ${to}`);
    assert.equal(atEnd.velocity, 0);
  }
});

test('the live controller reverses without a jump, preserves closed state and handles reduced motion', () => {
  const globals = ['window','document','performance','requestAnimationFrame','cancelAnimationFrame','getComputedStyle'];
  const saved = Object.fromEntries(globals.map(key => [key, globalThis[key]]));
  const elements = new Map(), frames = new Map();
  let now = 0, sequence = 0, preferenceChanged;
  const element = () => ({ getBoundingClientRect: () => ({ left: 0, top: 0, right: 390, width: 390, height: 20 }), textContent: '$1,234.50', value: '1,234.50', querySelector() { return { textContent: '$' }; }, style: { setProperty(key, value) { this[key] = value; } }, toggleAttribute() {}, removeAttribute() {}, dataset: {} });
  const sheet = element();
  sheet.querySelector = selector => { if (!elements.has(selector)) elements.set(selector, element()); return elements.get(selector); };
  sheet.querySelectorAll = () => [];
  const media = { matches: false, addEventListener(event, callback) { preferenceChanged = callback; }, removeEventListener() {} };
  let controller;
  try {
    globalThis.window = { innerWidth: 390, innerHeight: 844, matchMedia: () => media, addEventListener() {}, removeEventListener() {} };
    globalThis.document = { addEventListener() {}, removeEventListener() {} };
    globalThis.performance = { now: () => now };
    globalThis.getComputedStyle = () => ({ fontSize: '40px' });
    globalThis.requestAnimationFrame = callback => { frames.set(++sequence, callback); return sequence; };
    globalThis.cancelAnimationFrame = id => frames.delete(id);
    const amountFade = element(); amountFade.querySelector = sheet.querySelector;
    elements.set('.transfer-amount-fade', amountFade);
    controller = createTransferMotion({ amountFade, sheet, holder: element(), stage: element(), timelineButton: element(), onView() {} });
    const tick = milliseconds => { now += milliseconds; const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(now)); };
    controller.setMode('china', true);
    controller.setMode('amount'); tick(10);
    assert.ok(Number(elements.get('[data-panel="china"]').style.opacity) > 0,
      'the outward-moving methods must remain visible while the new content enters');
    assert.ok(Number(elements.get('[data-panel="china"] .transfer-panel-body').style.transform.slice(6,-1)) > 1);
    tick(50);
    assert.ok(Number(elements.get('[data-panel="china"] .transfer-panel-body').style.transform.slice(6, -1)) > 1,
      'payment methods must withdraw outward');
    const gridScale = Number(elements.get('[data-panel="amount"] .transfer-panel-body').style.transform.slice(6,-1));
    assert.ok(gridScale > .94 && gridScale < 1, 'the amount grid must grow toward its final size');
    assert.equal(elements.get('.transfer-primary').style.transform, 'translateY(0px)',
      'the full CTA must remain inside its resting footer bounds throughout entry');
    const buttonScale = Number(elements.get('.transfer-primary-visual').style.transform.match(/scale\(([^)]+)/)[1]);
    assert.ok(buttonScale >= .96 && buttonScale <= 1, 'CTA growth must stay within the complete capsule bounds');
    assert.equal(elements.get('.transfer-primary').style.opacity, '0',
      'the first CTA must wait for space to open below the growing grid');
    tick(25);
    assert.ok(Number(elements.get('.transfer-primary').style.opacity) > 0,
      'the complete CTA must begin appearing as the tray opens');
    const pairBeforeReverse = [...elements].map(([key, node]) => [key, node.style.opacity, node.style.transform]);
    controller.setMode('china');
    assert.deepEqual([...elements].map(([key, node]) => [key, node.style.opacity, node.style.transform]), pairBeforeReverse,
      'reversing the payment/amount pair must retain the button and body poses');
    tick(1000);
    controller.setMode('custom'); tick(70);
    const displayed = sheet.style.clipPath;
    controller.setMode('amount');
    assert.equal(sheet.style.clipPath, displayed, 'redirecting must preserve displayed geometry');
    tick(1000); assert.equal(sheet.style.clipPath, `inset(${SHEET_HEIGHT - VIEWS.amount.height}px 0px 0px round 24px)`);
    controller.setAvailable(true); assert.equal(elements.get('.transfer-primary').disabled, false);
    controller.setMode('amount', true);
    controller.setMode('custom');
    assert.equal(controller.canActivate(), true, 'valid active controls must not wait for a fade');
    tick(100);
    const incoming = elements.get('[data-panel="custom"]');
    const outgoing = elements.get('[data-panel="amount"]');
    assert.ok(Number(incoming.style.opacity) > .89 && Number(incoming.style.opacity) < .91,
      'the incoming keypad must read clearly as the preset grid withdraws');
    assert.ok(Number(elements.get('[data-title="custom"]').style.opacity) > .85,
      'the title should settle ahead of the large body swap');
    assert.ok(Math.abs(Number(incoming.style.opacity) + Number(outgoing.style.opacity) - 1) < 1e-10);
    const customScale = Number(elements.get('[data-panel="custom"] .transfer-panel-body').style.transform.slice(6,-1));
    const outgoingScale = Number(elements.get('[data-panel="amount"] .transfer-panel-body').style.transform.slice(6,-1));
    assert.ok(customScale > .99 && customScale < 1, 'the keypad must grow gently into place');
    assert.ok(outgoingScale > 1 && outgoingScale < 1.025, 'presets must withdraw outward');
    assert.equal(incoming.style.filter, 'none', 'incoming keypad numerals must stay crisp');
    assert.equal(outgoing.style.filter, 'none', 'both numeral panels stay crisp on entry and reversal');
    assert.equal(elements.get('.transfer-primary').style.transform, 'translateY(0px)');
    assert.equal(elements.get('.transfer-primary').style.opacity, '1');
    const surfaceOffset = Number(sheet.style.clipPath.match(/inset\(([^p]+)/)[1]);
    const contentTop = Number(elements.get('.transfer-content-mask').style.clipPath.match(/inset\(([^p]+)/)[1]);
    assert.ok(Math.abs(contentTop - surfaceOffset - 88) < 1e-10, 'local entry movement must fit above the resting content slot');
    assert.equal(elements.get('.transfer-primary-visual').style.transform, 'translateY(0px) scale(1)',
      'Continue must stay anchored between amount and custom entry');
    const beforeReverse = [...elements].map(([key, node]) => [key, node.style.opacity, node.style.transform, node.style.filter]);
    controller.setMode('amount');
    assert.deepEqual([...elements].map(([key, node]) => [key, node.style.opacity, node.style.transform, node.style.filter]), beforeReverse,
      'reversal must preserve body scale, title position, both fades and blur');
    tick(1000);
    assert.equal(elements.get('[data-panel="amount"] .transfer-panel-body').style.transform, 'scale(1)');
    controller.setMode('amount', true); controller.setMode('review'); tick(50);
    const presetReview = elements.get('[data-panel="review"]');
    assert.equal(presetReview.style.filter, 'none', 'preset receipts stay crisp');
    assert.equal(elements.get('[data-panel="review"] .transfer-panel-body').style.transform, 'scale(1)');
    assert.ok(Number(elements.get('[data-panel="amount"]').style.opacity) < .24, 'tiles clear before the receipt becomes strong');
    tick(50);
    assert.equal(elements.get('[data-panel="amount"]').style.opacity, '0');
    assert.ok(Number(presetReview.style.opacity) > .80 && Number(presetReview.style.opacity) < .81);
    assert.equal(elements.get('.transfer-entry-label').style.opacity, '1', 'one Torph label stays readable throughout the swap');
    assert.equal(elements.get('.transfer-entry-text').textContent, 'Confirm transfer');
    const presetReceiptPose = [presetReview.style.opacity, presetReview.style.transform, sheet.style.clipPath];
    controller.setMode('amount');
    assert.deepEqual([presetReview.style.opacity, presetReview.style.transform, sheet.style.clipPath], presetReceiptPose, 'preset Edit reverses from its current pose');
    tick(1000);
    controller.setMode('custom', true);
    elements.get('.transfer-money-number').getBoundingClientRect = () => ({left: 132, right: 258, top: 164, width: 126, height: 52});
    controller.setMode('review'); tick(20);
    const fadePose = elements.get('.transfer-fade-value').style.transform;
    assert.equal(amountFade.style.visibility, 'visible');
    assert.ok(Number(amountFade.style.opacity) > 0 && Number(amountFade.style.opacity) < 1, 'the custom amount fades quickly in place');
    assert.ok(!fadePose.includes('scale'), 'the fading amount never scales into the receipt');
    tick(30);
    assert.equal(amountFade.style.visibility, 'hidden', 'the value clears before the sheet edge exposes the dim backdrop');
    const captionOffset = Number(elements.get('.transfer-money').style.transform.match(/translateY\(([^p]+)/)[1]);
    const currentSurface = Number(sheet.style.clipPath.match(/inset\(([^p]+)/)[1]);
    assert.equal(captionOffset, currentSurface - 64, 'caption keeps its original local slot instead of drifting through the receipt');
    assert.equal(elements.get('.transfer-money-caption').style.opacity, '0', 'old caption is gone before the details become prominent');
    tick(50);
    const review = elements.get('[data-panel="review"]');
    assert.equal(elements.get('[data-panel="custom"]').style.opacity, '0', 'keypad clears in100ms');
    assert.ok(Number(review.style.opacity) > .80 && Number(review.style.opacity) < .81, 'Review arrives over130ms after a30ms overlap');
    assert.equal(review.style.filter, 'none');
    assert.equal(elements.get('[data-panel="custom"]').style.filter, 'none');
    assert.equal(elements.get('[data-panel="review"] .transfer-panel-body').style.transform, 'scale(1)');
    assert.equal(elements.get('.transfer-primary').style.opacity, '1');
    assert.equal(elements.get('.transfer-primary').style.transform, 'translateY(0px)');
    assert.equal(elements.get('.transfer-primary-visual').style.transform, 'translateY(0px) scale(1)');
    assert.equal(amountFade.style.visibility, 'hidden', 'custom amount has faded completely at100ms');
    assert.equal(elements.get('.transfer-fade-value').style.transform, fadePose, 'the amount anchor stays fixed while the sheet shrinks');
    assert.equal(elements.get('.transfer-money-value').style.opacity, '0');
    assert.equal(elements.get('.transfer-review-total').style.opacity, '1', 'the Review total appears with the receipt instead of traveling');
    const fadeOpacity = amountFade.style.opacity;
    const reviewWeight = review.style.opacity;
    controller.setMode('custom');
    assert.equal(elements.get('.transfer-fade-value').style.transform, fadePose, 'reverse retains the stationary amount anchor');
    assert.equal(amountFade.style.opacity, fadeOpacity, 'reverse resumes from the displayed opacity');
    assert.equal(review.style.opacity, reviewWeight, 'reverse preserves the independent fade');
    tick(1000);
    assert.equal(amountFade.style.visibility, 'hidden');
    assert.equal(elements.get('.transfer-money-value').style.opacity, '1');
    controller.setMode('review'); tick(50); controller.setMode('processing');
    assert.equal(amountFade.style.visibility, 'hidden', 'redirecting clears the fade copy');
    assert.equal(elements.get('.transfer-money-value').style.opacity, '1');
    assert.equal(elements.get('.transfer-review-total').style.opacity, '1');
    controller.setMode('custom', true); controller.setMode('review', true);
    assert.equal(amountFade.style.visibility, 'hidden', 'keyboard navigation snaps with no fade copy');
    assert.equal(review.style.opacity, '1');
    tick(1000);
    controller.setMode('processing'); assert.equal(elements.get('.transfer-primary').disabled, true);
    assert.equal(elements.get('.transfer-entry-label').style.opacity, '0', 'Confirm→Sending never stacks the entry label underneath the status morph');
    assert.equal(elements.get('.transfer-status-slot').style.opacity, '1', 'one text channel stays opaque throughout the handoff');
    assert.equal(elements.get('.transfer-capsule-spinner').style.opacity, '0', 'spinner starts hidden while Confirm remains centered');
    assert.equal(elements.get('.transfer-status-text').style.transform, 'translateX(-14px)');
    assert.equal(sheet.style.clipPath, `inset(${SHEET_HEIGHT - VIEWS.review.height}px 0px 0px round 24px)`, 'status resize starts from the displayed Review surface');
    tick(100);
    assert.equal(elements.get('.transfer-entry-label').style.opacity, '0');
    assert.equal(elements.get('.transfer-status-slot').style.opacity, '1');
    assert.ok(Number(elements.get('.transfer-capsule-spinner').style.opacity) > 0 && Number(elements.get('.transfer-capsule-spinner').style.opacity) < 1);
    const shrinkingOffset = Number(sheet.style.clipPath.match(/inset\(([^p]+)/)[1]);
    assert.ok(shrinkingOffset > SHEET_HEIGHT - VIEWS.review.height && shrinkingOffset < SHEET_HEIGHT - VIEWS.processing.height,
      'the existing spring shrinks the sheet while the receipt stays anchored');
    assert.equal(elements.get('[data-panel="review"]').style.opacity, '1', 'the same receipt remains visible while processing opens');
    assert.equal(elements.get('[data-panel="review"]').style.transform, `translateY(${SHEET_HEIGHT - VIEWS.review.height}px)`, 'receipt rows stay at their Review position');
    assert.equal(elements.get('[data-panel="review"]').style.filter, 'none');
    tick(1000);
    assert.equal(VIEWS.review.height - VIEWS.processing.height, 36, 'status removes the heading and its12px margin');
    assert.equal(sheet.style.clipPath, `inset(${SHEET_HEIGHT - VIEWS.processing.height}px 0px 0px round 24px)`);
    assert.equal(elements.get('.transfer-review-heading h3').style.visibility, 'hidden');
    controller.complete('success'); tick(100);
    assert.equal(elements.get('[data-panel="review"]').style.opacity, '1', 'completion never fades the receipt');
    assert.equal(elements.get('.transfer-status-slot').style.opacity, '1', 'one persistent capsule spans processing and success');
    assert.equal(elements.get('.transfer-primary').style.transform, 'translateY(0px)');
    tick(1000);
    assert.equal(elements.get('.transfer-status-text').textContent, 'Transfer sent');
    assert.equal(elements.get('.transfer-capsule-check').style.opacity, '1');
    controller.setMode('closed'); controller.complete('success'); assert.equal(controller.mode(), 'closed');
    controller.reset(); media.matches = true; preferenceChanged(); controller.setMode('custom');
    assert.equal(sheet.style.clipPath, `inset(${SHEET_HEIGHT - VIEWS.custom.height}px 0px 0px round 24px)`);
    assert.equal(elements.get('.transfer-method-context').style.opacity, '0', 'custom entry omits payment method context');
    assert.equal(elements.get('.transfer-money').style.transform, 'translateY(0px)', 'custom amount closes the removed row space');
    tick(65);
    assert.equal(elements.get('[data-panel="custom"]').style.filter, 'none');
    assert.equal(elements.get('[data-panel="custom"] .transfer-panel-body').style.transform, 'none');
    assert.equal(elements.get('.transfer-primary-visual').style.transform, 'none');
    assert.equal(elements.get('[data-panel="custom"]').style.transform, `translateY(${SHEET_HEIGHT - VIEWS.custom.height}px)`);
    const opacity = Number(elements.get('[data-panel="custom"]').style.opacity);
    assert.ok(opacity > 0 && opacity < 1, 'reduced motion retains the content fade');
    tick(1000); controller.setMode('review');
    assert.equal(elements.get('.transfer-money').style.opacity, '0', 'reduced motion clears the old amount before snapping the sheet layout');
    tick(20);
    assert.equal(elements.get('.transfer-money').style.opacity, '0', 'the old value cannot reappear at its relocated262px position');
    tick(45);
    assert.equal(amountFade.style.visibility, 'hidden', 'reduced motion uses no spatial snapshot');
    assert.ok(Number(elements.get('[data-panel="review"]').style.opacity) > 0 && Number(elements.get('[data-panel="review"]').style.opacity) < 1, 'the receipt still fades in under reduced motion');
    assert.equal(elements.get('[data-panel="review"]').style.filter, 'none');
    assert.equal(elements.get('[data-panel="review"] .transfer-panel-body').style.transform, 'none');
    tick(1000); controller.destroy(); assert.equal(frames.size, 0);
  } finally {
    controller?.destroy();
    globals.forEach(key => { if (saved[key] === undefined) delete globalThis[key]; else globalThis[key] = saved[key]; });
  }
});
