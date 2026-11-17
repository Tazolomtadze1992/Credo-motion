import test from 'node:test';
import assert from 'node:assert/strict';
import { RAMP_STEPS, colorTokens, contrastRatio, ramps } from '../content/colors.js';

// Plan 009 (Phase A): the ramp rules from oklch-skill and better-colors.

function oklchToLinear(L, C, H) {
  const a = C * Math.cos(H * Math.PI / 180), b = C * Math.sin(H * Math.PI / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s];
}
const encode = x => x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
const channels = hex => hex.slice(1).match(/../g).map(v => parseInt(v, 16));
const hueOf = hex => {
  const [r, g, b] = channels(hex).map(v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return (Math.atan2(0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s, 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s) * 180 / Math.PI + 360) % 360;
};
const step = (name, n) => ramps[name].find(item => item.step === n);
const WHITE = '#FFFFFF';

test('every ramp has the 11 steps 50–950', () => {
  for (const [name, items] of Object.entries(ramps)) assert.deepEqual(items.map(item => item.step), RAMP_STEPS, name);
});

test('brand 500s are pinned exactly', () => {
  assert.equal(step('coral', 500).hex, '#FC6250');
  assert.equal(step('blue', 500).hex, '#1E6E91');
  assert.equal(step('green', 500).hex, '#2E734B');
  // Category ramps: the approved product card colours (2026-11-17).
  assert.equal(step('violet', 500).hex, '#6E4EB3');
  assert.equal(step('teal', 500).hex, '#277469');
});

test('category 500s share the brand ramps\' lightness (about 0.51)', () => {
  for (const name of ['blue', 'green', 'violet', 'teal']) assert.ok(Math.abs(step(name, 500).L - 0.51) <= 0.011, name);
});

test('every OKLCH value is inside sRGB and renders as its listed hex (±1 per channel)', () => {
  for (const item of Object.values(ramps).flat()) {
    const linear = oklchToLinear(item.L, item.C, item.H);
    assert.ok(linear.every(v => v >= -0.001 && v <= 1.001), `${item.name}-${item.step} out of gamut`);
    const rendered = linear.map(v => Math.round(encode(Math.min(1, Math.max(0, v))) * 255));
    channels(item.hex).forEach((value, index) => assert.ok(Math.abs(value - rendered[index]) <= 1, `${item.name}-${item.step}: ${item.hex} vs rendered ${rendered}`));
  }
});

test('one hue per ramp: rendered hue spread under 10°', () => {
  for (const [name, items] of Object.entries(ramps)) {
    if (name === 'gray') { assert.ok(items.every(item => item.C === 0), 'gray is neutral'); continue; }
    const hues = items.filter(item => item.C > 0.02).map(item => hueOf(item.hex));
    assert.ok(Math.max(...hues) - Math.min(...hues) < 10, `${name} hue drifts`);
  }
});

test('vividness peaks at 500 and never exceeds it', () => {
  for (const [name, items] of Object.entries(ramps)) {
    const peak = step(name, 500).C;
    assert.ok(items.every(item => item.C <= peak + 1e-9), name);
  }
});

test('light end steps finely (0.04–0.05) and no adjacent steps are under 0.03 apart', () => {
  for (const [name, items] of Object.entries(ramps)) {
    const gaps = items.slice(1).map((item, index) => items[index].L - item.L);
    assert.ok(gaps.every(gap => gap >= 0.03 - 1e-9), `${name}: adjacent steps too close`);
    if (name !== 'gray') for (const gap of gaps.slice(0, 2)) assert.ok(gap >= 0.04 - 1e-9 && gap <= 0.05 + 1e-9, `${name}: light end gap ${gap}`);
  }
});

test('danger sits at least 15° of hue from the brand coral', () => {
  assert.ok(Math.abs(step('coral', 500).H - step('red', 500).H) >= 15 - 1e-9);
});

const ratio = (front, back) => contrastRatio(colorTokens[front]?.hex ?? front, colorTokens[back]?.hex ?? back);

test('text roles reach 4.5:1 on what they render on', () => {
  for (const role of ['text/strong', 'text/primary', 'text/secondary', 'text/secondary', 'danger/text', 'highlight/text', 'accent/text'])
    assert.ok(ratio(role, WHITE) >= 4.5, role);
  assert.ok(ratio('accent/text', 'accent/subtle') >= 4.5);
  assert.ok(ratio('success/text', 'success/subtle') >= 4.5);
  assert.ok(ratio('success/solid', 'success/subtle') >= 4.5);
});

test('white labels reach 4.5:1 on both ends of the primary button and on success', () => {
  for (const role of ['accent/solid', 'highlight/solid', 'success/solid']) assert.ok(ratio(WHITE, role) >= 4.5, role);
});

test('outlines and icons reach 3:1', () => {
  assert.ok(ratio('border/strong', WHITE) >= 3);
  assert.ok(ratio('border/focus', WHITE) >= 3);
  assert.ok(ratio('highlight/border', WHITE) >= 3);
  assert.ok(ratio('icon/secondary', 'bg/subtle') >= 3);
  assert.ok(ratio('danger/icon', 'danger/subtle') >= 3);
  assert.ok(ratio('icon/secondary', 'bg/subtle') >= 3);
});
