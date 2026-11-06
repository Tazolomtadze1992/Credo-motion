import test from 'node:test';
import assert from 'node:assert/strict';
import { createPaymentTray, PAYMENT_SHEET } from '../lib/automatic-payments-motion.mjs';

test('payment tray preserves its pose on reversal and clears old content before reduced-motion layout changes', () => {
  const keys = ['window', 'document', 'performance', 'requestAnimationFrame', 'cancelAnimationFrame'];
  const saved = Object.fromEntries(keys.map(key => [key, globalThis[key]]));
  const nodes = new Map();
  const element = () => ({ style: {}, dataset: {}, querySelector() { return this.body ??= element(); } });
  const titles = [element(), element()]; titles[0].dataset.apTitle = 'amount'; titles[1].dataset.apTitle = 'day';
  const sheet = { style: {}, querySelector(key) { if (!nodes.has(key)) nodes.set(key, element()); return nodes.get(key); }, querySelectorAll: () => titles };
  const frames = new Map(); let sequence = 0, now = 0;
  const media = { matches: false, addEventListener() {}, removeEventListener() {} };
  let tray;
  try {
    globalThis.window = { matchMedia: () => media };
    globalThis.document = { addEventListener() {}, removeEventListener() {} };
    globalThis.performance = { now: () => now };
    globalThis.requestAnimationFrame = cb => { frames.set(++sequence, cb); return sequence; };
    globalThis.cancelAnimationFrame = id => frames.delete(id);
    const tick = ms => { now += ms; const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(cb => cb(now)); };
    tray = createPaymentTray({ sheet, onView() {}, onTimeline() {} });
    tray.setView('day'); tick(50);
    const amount = nodes.get('[data-ap-panel="amount"]'), day = nodes.get('[data-ap-panel="day"]');
    const pose = [sheet.style.clipPath, amount.style.opacity, amount.style.transform, day.style.opacity, day.style.transform];
    tray.setView('amount');
    assert.deepEqual([sheet.style.clipPath, amount.style.opacity, amount.style.transform, day.style.opacity, day.style.transform], pose);
    tick(1000);
    assert.equal(sheet.style.clipPath, `inset(${PAYMENT_SHEET.canvas - PAYMENT_SHEET.amount}px 0 0 round 24px)`);
    media.matches = true; tray.setView('day');
    assert.equal(amount.style.opacity, '0', 'clear the old amount before its layout position changes');
    assert.equal(day.style.opacity, '0', 'the new day panel starts its gentle opacity entrance');
    assert.equal(day.body.style.transform, 'none');
    tick(65);
    assert.equal(amount.style.opacity, '0');
    assert.ok(Number(day.style.opacity) > 0 && Number(day.style.opacity) < 1);
    assert.equal(sheet.style.clipPath, `inset(${PAYMENT_SHEET.canvas - PAYMENT_SHEET.day}px 0 0 round 24px)`);
    tick(1000); tray.destroy(); assert.equal(frames.size, 0);
  } finally { tray?.destroy(); keys.forEach(key => { if (saved[key] === undefined) delete globalThis[key]; else globalThis[key] = saved[key]; }); }
});

function withTray(run) {
  const globals = ['window', 'document', 'performance', 'requestAnimationFrame', 'cancelAnimationFrame'];
  const saved = Object.fromEntries(globals.map(key => [key, globalThis[key]]));
  const nodes = new Map();
  const element = () => ({ style: {}, dataset: {}, querySelector() { return this.body ??= element(); } });
  const titles = [element(), element()]; titles[0].dataset.apTitle = 'amount'; titles[1].dataset.apTitle = 'day';
  const sheet = { style: {}, querySelector(key) { if (!nodes.has(key)) nodes.set(key, element()); return nodes.get(key); }, querySelectorAll: () => titles };
  const frames = new Map(); let sequence = 0, now = 0, motionChanged;
  const media = { matches: false, addEventListener(_, callback) { motionChanged = callback; }, removeEventListener() {} };
  let tray;
  try {
    globalThis.window = { matchMedia: () => media };
    globalThis.document = { addEventListener() {}, removeEventListener() {} };
    globalThis.performance = { now: () => now };
    globalThis.requestAnimationFrame = callback => { frames.set(++sequence, callback); return sequence; };
    globalThis.cancelAnimationFrame = id => frames.delete(id);
    tray = createPaymentTray({ sheet, onView() {}, onTimeline() {} });
    const tick = ms => { now += ms; const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(now)); };
    const panel = key => nodes.get(`[data-ap-panel="${key}"]`);
    const mask = key => nodes.get(`[data-ap-mask="${key}"]`);
    const visiblePose = () => ({ surface: sheet.style.clipPath,
      panels: ['amount','day'].map(key => ({ alpha: panel(key).style.opacity, ...(Number(panel(key).style.opacity) > .00001 ? { y: panel(key).style.transform, scale: panel(key).body.style.transform, clip: mask(key).style.clipPath } : {}) })),
      titles: titles.map(t => ({ alpha: t.style.opacity, ...(Number(t.style.opacity) > .00001 ? { y: t.style.transform } : {}) })),
      back: nodes.get('.ap-sheet-back').style.opacity });
    run({ tray, tick, panel, mask, titles, sheet, media, frames, visiblePose, motionChanged });
  } finally { tray?.destroy(); globals.forEach(key => { if (saved[key] === undefined) delete globalThis[key]; else globalThis[key] = saved[key]; }); }
}

test('payment content clears early, withdraws outward and keeps its own aperture', () => withTray(h => {
  h.tray.setView('day'); h.tick(20);
  assert.ok(Number(h.panel('amount').body.style.transform.match(/scale\((.*)\)/)[1]) > 1, 'outgoing content grows rather than shrinking inward');
  assert.ok(Number(h.panel('amount').style.transform.match(/translateY\((.*)px\)/)[1]) < 40, 'outgoing content withdraws from its captured position');
  assert.equal(h.panel('day').style.opacity, '0', 'incoming content has a brief head start for the exit');
  assert.ok(Number(h.mask('amount').style.clipPath.match(/inset\((.*)px 0 106px\)/)[1]) < 134, 'the outgoing aperture moves with its withdrawing content rather than the downward resizing header');
  h.tick(63.3333);
  assert.ok(Number(h.panel('amount').style.opacity) < .01, 'the old keypad is no longer legible behind the calendar at the reviewed 83ms frame');
  assert.ok(Number(h.panel('day').style.opacity) > .1);
  assert.equal(h.titles[0].style.opacity, '0');
  assert.ok(Number(h.titles[1].style.opacity) > 0, 'a single title enters the fixed header mask');
  h.tick(107);
  assert.equal(h.panel('amount').style.opacity, '0');
  assert.equal(h.panel('day').style.opacity, '1');
  assert.equal(h.panel('day').style.transform, 'translateY(164px)');
  assert.equal(h.panel('day').body.style.transform, 'scale(1)');
}));

test('rapid handoff reversals preserve every visible panel, title and mask', () => withTray(h => {
  for (const delay of [15, 35, 55, 83, 125, 175]) {
    h.tray.setView('amount', true);
    h.tray.setView('day'); h.tick(delay);
    const before = h.visiblePose(); h.tray.setView('amount');
    assert.deepEqual(h.visiblePose(), before, `forward reversal at ${delay}ms must retain the current pose`);
    h.tick(17);
    const reversed = h.visiblePose(); h.tray.setView('day');
    assert.deepEqual(h.visiblePose(), reversed, 'a second reversal must not restart the entry');
    for (let i=0; i<20; i++) {
      h.tick(10);
      assert.ok(h.titles.filter(t => Number(t.style.opacity) > .00001).length <= 1, 'masked title changes never expose two readable labels');
    }
    h.tick(1000);
    assert.equal(h.panel('day').style.opacity, '1');
    assert.equal(h.panel('amount').style.opacity, '0');
  }
}));

test('the return handoff preserves its outgoing calendar anchor and keyboard/reduced-motion changes clear movement', () => withTray(h => {
  h.tray.setView('day', true); h.tray.setView('amount'); h.tick(20);
  assert.ok(Number(h.panel('day').style.transform.match(/translateY\((.*)px\)/)[1]) > 164);
  assert.ok(Number(h.panel('day').body.style.transform.match(/scale\((.*)\)/)[1]) > 1);
  h.tick(30);
  assert.equal(h.panel('amount').style.opacity, '0', 'the tall keypad stays unreadable until its bottom row has room');
  h.tick(35);
  assert.ok(Number(h.panel('amount').style.opacity) > 0);
  assert.ok(Number(h.panel('amount').style.transform.match(/translateY\((.*)px\)/)[1]) < 55, 'return travel leads the fade so the bottom row is not sliced');
  h.tick(1000);
  assert.equal(h.panel('amount').style.transform, 'translateY(40px)');
  h.tray.setView('day', true);
  assert.equal(h.frames.size, 0); assert.equal(h.panel('day').style.opacity, '1');
  h.media.matches = true; h.tray.setView('amount');
  assert.equal(h.panel('day').style.opacity, '0'); assert.equal(h.panel('amount').style.opacity, '0');
  assert.equal(h.panel('amount').body.style.transform, 'none');
  h.tick(80); assert.ok(Number(h.panel('amount').style.opacity) > 0);
  assert.equal(h.panel('amount').style.transform, 'translateY(40px)');
  h.motionChanged(); assert.equal(h.frames.size, 0);
  assert.equal(h.panel('amount').style.opacity, '1');
}));
