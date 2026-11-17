import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { animateTrayPresence, presenceKeyframes, presenceTiming } from '../lib/tray-presence.mjs';
import { cubicBezier, durations } from '../content/motion.mjs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('tray presence slides on drawer and fades the backdrop on easeOut', () => {
  const open = presenceTiming({ opening: true, reduce: false });
  assert.deepEqual(open.tray, { duration: durations.trayOpen, easing: cubicBezier('drawer'), fill: 'auto' });
  assert.deepEqual(open.backdrop, { duration: durations.backdropIn, easing: cubicBezier('easeOut'), fill: 'auto' });
  const close = presenceTiming({ opening: false, reduce: false });
  assert.equal(close.tray.duration, durations.trayClose);
  assert.equal(close.tray.fill, 'forwards');
  assert.equal(close.backdrop.duration, durations.backdropOut);
  assert.deepEqual(presenceKeyframes({ height: 400, opening: true, reduce: false }).tray,
    [{ transform: 'translateY(400px)' }, { transform: 'translateY(0px)' }]);
});

test('reduced motion fades the tray on ease (plan 011 W6)', () => {
  const timing = presenceTiming({ opening: false, reduce: true });
  assert.deepEqual(timing.tray, { duration: durations.reduced, easing: 'ease', fill: 'forwards' });
  assert.deepEqual(presenceKeyframes({ height: 400, opening: false, reduce: true }).tray, [{ opacity: 1 }, { opacity: 0 }]);
});

test('animateTrayPresence returns [slide, dim]', () => {
  const calls = [];
  const fake = name => ({ animate: (frames, options) => { calls.push(name); return { name, frames, options }; } });
  const [slide, dim] = animateTrayPresence({ tray: fake('tray'), backdrop: fake('backdrop'), height: 300, opening: true, reduce: false });
  assert.equal(slide.name, 'tray');
  assert.equal(dim.name, 'backdrop');
  assert.deepEqual(calls, ['tray', 'backdrop']);
});

test('all three flows use the shared presence helper', () => {
  for (const file of ['components/TransferStudy.jsx', 'components/AutomaticOrdersStudy.jsx', 'components/AutoLombardStudy.jsx']) {
    const source = read(file);
    assert.match(source, /animateTrayPresence\(/, file);
    assert.doesNotMatch(source, /\.animate\(\s*reduce \?/, `${file} still animates presence by hand`);
  }
});

test('keyboard actions are instant in TrayFlow flows (plan 011 W2)', () => {
  const tray = read('components/TrayFlow.jsx');
  assert.match(tray, /export function useInputSource/);
  assert.match(tray, /instantRef\?\.current\) \{ setLayers\(\[\{ id: \+\+id\.current, step, phase: 'idle' \}\]\)/);
  for (const file of ['components/AutomaticOrdersStudy.jsx', 'components/AutoLombardStudy.jsx']) {
    const source = read(file);
    assert.match(source, /useLayers\(step, session, keyboard\)/, file);
    assert.match(source, /instant: keyboard\.current/, file);
  }
});

test('family button and spinner rules (plan 011 W1, W3, W5, W8)', () => {
  const ao = read('app/studies/automatic-orders/automatic-orders.css');
  assert.match(ao, /\.ao-title \{ --ao-scale: 1;/);
  assert.match(ao, /\.ao-action__tick \{ stroke-dasharray: 100 110; stroke-dashoffset: 100;/);
  // Matched to China's recording: the tick draws with the circle, icons settle in 150 ms.
  assert.match(ao, /transition: stroke-dashoffset 180ms var\(--credo-ease-out\); \}/);
  assert.match(ao, /transform 150ms var\(--credo-ease-out\), scale 150ms var\(--credo-ease-out\)/);
  assert.match(ao, /transform: translateY\(4px\) scale\(\.98\)/);
  assert.match(read('components/TrayFlow.jsx'), /pathClassName="ao-action__tick"/);
  const button = read('components/primary-button.css');
  assert.match(button, /\.credo-primary-button \[torph-exiting\] \{ filter: blur\(2px\); \}/);
  assert.doesNotMatch(button, /\.credo-primary-spinner \{ animation: none; \}/);
  assert.doesNotMatch(read('app/studies/transfers/transfers.css'), /transfer-spinner \{ animation: none !important/);
  assert.doesNotMatch(read('components/upload-slot.css'), /700ms|1400ms/);
});

test('Automatic orders lands the new order after the tray has closed (plan 011 W4)', () => {
  const source = read('components/AutomaticOrdersStudy.jsx');
  assert.match(source, /closeFlow\(\{ onClosed: \(\) => \{ setOrders/);
  assert.doesNotMatch(source, /onClosing/);
});
