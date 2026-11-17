import test from 'node:test';
import assert from 'node:assert/strict';
import { SHEET_HEIGHT, VIEWS } from '../lib/transfer-flow.mjs';
import { createTransferMotion, transitionProfile, MONEY_REST_GAP } from '../lib/transfer-motion.mjs';

const REVIEW_INSET = SHEET_HEIGHT - VIEWS.review.height;
const CUSTOM_INSET = SHEET_HEIGHT - VIEWS.custom.height;

test('amount, custom and review hand off with small scales and a quick exit', () => {
  const preset = transitionProfile('amount', 'review');
  assert.equal(preset.enterScale, .96);
  assert.equal(preset.exitScale, .96);
  assert.ok(preset.exitMs < preset.bodyMs && preset.fadeDelay === 0, 'the handoff starts on the tap; the grid never leaves faster than the receipt arrives');
  const editor = transitionProfile('review', 'custom');
  assert.equal(editor.enterScale, .98, 'the tall keypad uses a gentler scale');
  // Plan 006 (2026-11-16): the keypad no longer lingers; exits are shorter than entries both ways.
  for (const [from, to] of [['custom', 'review'], ['review', 'custom']]) {
    const profile = transitionProfile(from, to);
    assert.ok(profile.exitMs < profile.bodyMs && profile.coverFloor === false, `${from} → ${to} exits quickly without waiting for the new body`);
  }
  assert.equal(transitionProfile('amount', 'custom').exitScale, .96, 'presets withdraw inward, never inflate');
});

function harness() {
  const elements = new Map(), frames = new Map();
  let now = 0, sequence = 0;
  const element = () => ({ getBoundingClientRect: () => ({ left: 0, top: 0, right: 390, width: 390, height: 20 }), textContent: '$1', querySelector() { return { textContent: '$' }; }, style: { setProperty(key, value) { this[key] = value; } }, toggleAttribute() {}, removeAttribute() {}, dataset: {} });
  const sheet = element();
  sheet.querySelector = selector => { if (!elements.has(selector)) elements.set(selector, element()); return elements.get(selector); };
  sheet.querySelectorAll = () => [];
  const media = { matches: false, addEventListener() {}, removeEventListener() {} };
  globalThis.window = { innerWidth: 390, innerHeight: 844, matchMedia: () => media, addEventListener() {}, removeEventListener() {} };
  globalThis.document = { addEventListener() {}, removeEventListener() {} };
  globalThis.performance = { now: () => now };
  globalThis.getComputedStyle = () => ({ fontSize: '40px' });
  globalThis.requestAnimationFrame = callback => { frames.set(++sequence, callback); return sequence; };
  globalThis.cancelAnimationFrame = id => frames.delete(id);
  const controller = createTransferMotion({ sheet, holder: element(), stage: element(), timelineButton: element(), onView() {} });
  const tick = ms => { now += ms; const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(now)); };
  const y = key => parseFloat(elements.get(`[data-panel="${key}"]`).style.transform.slice(11));
  const opacity = key => Number(elements.get(`[data-panel="${key}"]`).style.opacity);
  return { controller, tick, y, opacity, elements, sheet };
}

test('custom/review handoff rides the tray and reverses smoothly', () => {
  const globals = ['window', 'document', 'performance', 'requestAnimationFrame', 'cancelAnimationFrame', 'getComputedStyle'];
  const saved = Object.fromEntries(globals.map(key => [key, globalThis[key]]));
  let controller;
  try {
    const h = harness(); controller = h.controller;
    controller.setMode('custom', true);
    controller.setMode('review');
    for (let frame = 0; frame < 40; frame++) {
      h.tick(1000 / 120);
      // Both bodies ride the tray edge exactly: no jump, drift or relative slide.
      const edge = parseFloat(/inset\(([\d.]+)/.exec(h.sheet.style.clipPath)[1]);
      assert.equal(h.y('custom'), edge, 'the editor rides the tray');
      assert.equal(h.y('review'), edge, 'the receipt rides the tray');
      assert.equal(parseFloat(h.elements.get('.transfer-money').style.transform.slice(11)), edge - MONEY_REST_GAP, 'the amount is attached rigidly');
      assert.equal(Number(h.elements.get('.transfer-money').style.opacity), h.opacity('custom'), 'the amount hands over with the editor');
      // Plan 006: different layouts, so the editor leaves on its own 100ms exit
      // instead of waiting for the receipt. A short, shallow dip is allowed.
      assert.ok(h.opacity('custom') + h.opacity('review') >= .7, 'the dip stays short and shallow');
      if (frame >= 4) assert.ok(h.opacity('custom') < .1, 'the old layout is out of the way within ~40ms');
    }
    h.tick(1000);
    assert.equal(h.opacity('review'), 1);
    assert.equal(h.y('review'), REVIEW_INSET);
    // Edit: the same in reverse.
    controller.setMode('custom');
    for (let frame = 0; frame < 40; frame++) {
      h.tick(1000 / 120);
      assert.ok(h.opacity('custom') + h.opacity('review') >= .7, 'the dip stays short and shallow (Edit)');
      if (frame >= 4) assert.ok(h.opacity('review') < .1, 'the receipt is out of the way within ~40ms (Edit)');
    }
    h.tick(1000);
    assert.equal(h.opacity('custom'), 1);
    controller.setMode('review'); h.tick(1000);
    controller.setMode('custom'); h.tick(40);
    const pose = [h.opacity('custom'), h.opacity('review'), h.sheet.style.clipPath];
    controller.setMode('review');
    assert.deepEqual([h.opacity('custom'), h.opacity('review'), h.sheet.style.clipPath], pose, 'reversal keeps the displayed pose');
    h.tick(1000);
    assert.equal(h.sheet.style.clipPath, `inset(${REVIEW_INSET}px 0px 0px round 24px)`);
  } finally {
    controller?.destroy();
    for (const key of globals) globalThis[key] = saved[key];
  }
});

// Family / Loyalty text swap: the old title fades as the new one arrives, on
// one clock, in one place. A title is on screen on every frame, and the two
// overlap only briefly.
test('tray titles crossfade without a blank frame', () => {
  const globals = ['window', 'document', 'performance', 'requestAnimationFrame', 'cancelAnimationFrame', 'getComputedStyle'];
  const saved = Object.fromEntries(globals.map(key => [key, globalThis[key]]));
  let controller;
  try {
    const h = harness(); controller = h.controller;
    const title = key => Number(h.elements.get(`[data-title="${key}"]`).style.opacity);
    for (const [from, to] of [['options', 'china'], ['china', 'options'], ['china', 'amount'], ['amount', 'china'], ['amount', 'custom'], ['custom', 'review'], ['review', 'custom'], ['amount', 'review'], ['review', 'amount'], ['review', 'processing']]) {
      controller.setMode(from, true); h.tick(16);
      controller.setMode(to);
      let overlap = 0;
      for (let frame = 0; frame < 40; frame++) {
        h.tick(1000 / 120);
        assert.ok(title(from) + title(to) >= .999, `${from} → ${to}: a title is always shown`);
        if (title(from) > .1 && title(to) > .1) overlap++;
        assert.equal(h.elements.get(`[data-title="${to}"]`).style.transform, 'none', 'titles hold one position');
      }
      assert.ok(overlap <= 14, `${from} → ${to}: the overlap stays brief (${overlap} frames at 120 fps)`);
      assert.equal(title(to), 1);
    }
  } finally {
    controller?.destroy();
    for (const key of globals) globalThis[key] = saved[key];
  }
});
