import test from 'node:test';
import assert from 'node:assert/strict';
import { createPaymentPresence } from '../lib/payment-tray-presence.mjs';

function withPresence(run) {
  const globals = ['window', 'performance', 'requestAnimationFrame', 'cancelAnimationFrame'];
  const saved = Object.fromEntries(globals.map(key => [key, globalThis[key]]));
  const layer = { style: {}, hidden: false }, backdrop = { style: {}, hidden: false };
  const sheet = { get offsetHeight() { return layer.hidden ? 0 : 676; }, style: { clipPath: 'inset(40px 0 0 round 24px)' } };
  const frames = new Map(), changes = []; let now = 0, sequence = 0, changed, presence;
  const media = { matches: false, addEventListener(_, callback) { changed = callback; }, removeEventListener() {} };
  try {
    globalThis.window = { matchMedia: () => media };
    globalThis.performance = { now: () => now };
    globalThis.requestAnimationFrame = callback => { frames.set(++sequence, callback); return sequence; };
    globalThis.cancelAnimationFrame = id => frames.delete(id);
    presence = createPaymentPresence({ layer, sheet, backdrop, onPresent: value => changes.push(value) });
    const tick = ms => { now += ms; const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(now)); };
    const pose = () => [layer.style.transform, layer.style.opacity, backdrop.style.opacity];
    run({ presence, layer, sheet, backdrop, frames, changes, media, changed, tick, pose });
  } finally {
    presence?.destroy();
    globals.forEach(key => { if (saved[key] === undefined) delete globalThis[key]; else globalThis[key] = saved[key]; });
  }
}

test('presence retains the complete tray through dismissal and enters without a second content fade', () => withPresence(h => {
  h.presence.setOpen(false);
  assert.equal(h.layer.hidden, false, 'the surface must remain mounted for its exit');
  h.tick(80);
  assert.notEqual(h.layer.style.transform, 'translateY(0px)');
  assert.equal(h.layer.style.opacity, '1', 'normal presence moves the assembled sheet without ghosting its content');
  assert.ok(Number(h.backdrop.style.opacity) > 0 && Number(h.backdrop.style.opacity) < 1);
  h.tick(140);
  assert.equal(h.layer.style.transform, 'translateY(637px)');
  assert.equal(h.layer.hidden, true); assert.equal(h.backdrop.hidden, true);
  assert.deepEqual(h.changes, [false]); assert.equal(h.frames.size, 0);
  h.presence.setOpen(true);
  assert.equal(h.layer.hidden, false); assert.equal(h.backdrop.hidden, false);
  assert.equal(h.layer.style.transform, 'translateY(637px)');
  h.tick(100);
  const y = Number(h.layer.style.transform.match(/\((.*)px/)[1]);
  assert.ok(y > 0 && y < 160, 'entry covers most travel early and settles gently');
  h.tick(200);
  assert.deepEqual(h.pose(), ['translateY(0px)', '1', '1']);
  assert.deepEqual(h.changes, [false, true]);
}));

test('reversing entry or exit captures the visible pose and never hides a reopened tray', () => withPresence(h => {
  h.presence.setOpen(false); h.tick(50);
  const closing = h.pose(); h.presence.setOpen(true);
  assert.deepEqual(h.pose(), closing);
  assert.equal(h.frames.size, 1, 'only the newest presence clock remains active');
  h.tick(30);
  const opening = h.pose(); h.presence.setOpen(false);
  assert.deepEqual(h.pose(), opening);
  h.tick(20); h.presence.setOpen(true); h.tick(300);
  assert.equal(h.layer.hidden, false); assert.equal(h.presence.isPresent(), true);
  assert.deepEqual(h.pose(), ['translateY(0px)', '1', '1']);
  assert.deepEqual(h.changes, [], 'an interrupted dismissal never exposes the underlying screen as active');
}));

test('reopening after an offscreen view reset uses the current inset despite zero hidden layout height', () => withPresence(h => {
  h.sheet.style.clipPath = 'inset(164px 0 0 round 24px)';
  h.presence.setOpen(false); h.tick(220);
  assert.equal(h.sheet.offsetHeight, 0, 'a hidden ancestor removes the sheet from browser layout');
  assert.equal(h.layer.style.transform, 'translateY(513px)');
  // The real flow resets calendar to amount before making the layer visible.
  h.sheet.style.clipPath = 'inset(40px 0 0 round 24px)';
  h.presence.setOpen(true);
  assert.equal(h.layer.style.transform, 'translateY(637px)', 'entry begins below the phone using the new amount height');
  h.tick(299);
  assert.notEqual(h.layer.style.transform, 'translateY(0px)', 'the existing 300ms entrance clock is preserved');
  h.tick(1);
  assert.deepEqual(h.pose(), ['translateY(0px)', '1', '1']);
}));

test('dismissal measures the current clipped height while keyboard and reset paths finish instantly', () => withPresence(h => {
  h.sheet.style.clipPath = 'inset(129.2px 0 0 round 24px)';
  h.presence.setOpen(false); h.tick(220);
  assert.equal(h.layer.style.transform, 'translateY(547.8px)');
  h.sheet.style.clipPath = 'inset(40px 0 0 round 24px)';
  h.presence.setOpen(true, true);
  assert.deepEqual(h.pose(), ['translateY(0px)', '1', '1']);
  assert.equal(h.frames.size, 0);
  h.presence.setOpen(false, true);
  assert.equal(h.layer.hidden, true); assert.equal(h.frames.size, 0);
}));

test('reduced motion uses a stationary fade and changing preference cancels pending travel', () => withPresence(h => {
  h.media.matches = true; h.presence.setOpen(false); h.tick(60);
  assert.equal(h.layer.style.transform, 'translateY(0px)');
  assert.ok(Number(h.layer.style.opacity) > 0 && Number(h.layer.style.opacity) < 1);
  h.tick(60); assert.equal(h.layer.hidden, true);
  h.presence.setOpen(true); h.tick(60);
  assert.equal(h.layer.style.transform, 'translateY(0px)');
  assert.ok(Number(h.layer.style.opacity) > 0 && Number(h.layer.style.opacity) < 1);
  h.tick(60); assert.deepEqual(h.pose(), ['translateY(0px)', '1', '1']);
  h.media.matches = false; h.presence.setOpen(false); h.tick(40);
  h.media.matches = true; h.changed();
  assert.equal(h.layer.hidden, true); assert.equal(h.frames.size, 0);
  h.presence.destroy(); h.presence.setOpen(true);
  assert.equal(h.layer.hidden, true, 'disposal cannot leave a late callback reopening the tray');
}));
