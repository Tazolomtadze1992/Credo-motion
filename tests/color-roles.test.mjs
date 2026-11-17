import test from 'node:test';
import assert from 'node:assert/strict';
import { colorTokens, contrastRatio } from '../content/colors.js';

const hex = role => colorTokens[role].hex;

test('brand row icons stay readable on their circle (3:1)', () => {
  assert.ok(contrastRatio(hex('accent/text'), hex('accent/subtle-strong')) >= 3);
});

test('an unchecked checkbox outline is visible on the tray (3:1)', () => {
  assert.ok(contrastRatio(hex('border/strong'), '#FFFFFF') >= 3);
});

// White labels on product cards: 4.5:1. The user first chose Family's bright
// look at 3:1 (2026-11-16), then approved the on-ramp set at ~0.51 lightness
// (2026-11-17), so names and subtitles both pass as normal text.
test('white labels reach 4.5:1 on every product card', () => {
  for (const color of ['ink', 'blue', 'green', 'coral', 'violet', 'teal']) assert.ok(contrastRatio('#FFFFFF', hex(`category/${color}`)) >= 4.5, color);
});

// Amounts sit quieter than names: white at 75%. The user accepted about 4:1
// over 4.5:1 for a visible step (2026-11-17, "Go quieter"); this floor
// guards against going lower.
test('75% white amounts stay at or above 3.8:1 on every product card', () => {
  const blend = (back, alpha) => '#' + back.slice(1).match(/../g).map(v => Math.round(parseInt(v, 16) + (255 - parseInt(v, 16)) * alpha).toString(16).padStart(2, '0')).join('');
  for (const color of ['ink', 'blue', 'green', 'coral', 'violet', 'teal']) {
    const back = hex(`category/${color}`);
    assert.ok(contrastRatio(blend(back, 0.75), back) >= 3.8, color);
  }
});
