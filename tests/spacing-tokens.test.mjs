import test from 'node:test';
import assert from 'node:assert/strict';
import { scale, roles, px, footerSpace, credoSpacingStyle } from '../content/spacing.mjs';

test('scale is the 4px steps the flows use', () => {
  assert.deepEqual(scale, { 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32, 10: 40 });
  for (const [n, value] of Object.entries(scale)) assert.equal(value, Number(n) * 4);
});

test('roles on the scale match their step', () => {
  for (const items of Object.values(roles)) for (const token of Object.values(items))
    if (token.step) assert.equal(token.px, scale[token.step]);
});

// Decided by the user on 2026-11-14. Changing one is a design decision: update this test with it.
test('decided tray roles keep their values', () => {
  assert.equal(px('tray', 'content-top'), 16);
  assert.equal(px('tray', 'content-to-action'), 24);
  assert.equal(px('tray', 'content-to-action-reading'), 40);
  assert.equal(px('tray', 'emphasis-top'), 32);
});

test('footer space matches the 106px both flows reserve', () => {
  assert.equal(footerSpace(), 106);
});

test('CSS variables mirror the tokens', () => {
  assert.equal(credoSpacingStyle['--credo-space-4'], '16px');
  assert.equal(credoSpacingStyle['--credo-tray-content-top'], 'var(--credo-space-4)');
  assert.equal(credoSpacingStyle['--credo-tray-header'], '80px');
  assert.equal(credoSpacingStyle['--credo-list-row-gap'], 'var(--credo-space-3)');
  assert.equal(credoSpacingStyle['--credo-tray-emphasis-top'], 'var(--credo-space-8)');
});
