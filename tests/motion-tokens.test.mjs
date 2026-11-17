import test from 'node:test';
import assert from 'node:assert/strict';
import { curves, springs, durations, credoMotionStyle, cubicBezier } from '../content/motion.mjs';
import { MOTION } from '../lib/transfer-motion.mjs';

// The values the China transfer and Automatic payments flows were tuned with.
// Changing one is a deliberate motion decision: update this test with it.
test('motion tokens keep the tuned values', () => {
  assert.deepEqual(curves, {
    easeOut: [.23, 1, .32, 1], easeOutExpo: [.19, 1, .22, 1], easeOutQuad: [.25, .46, .45, .94],
    drawer: [.32, .72, 0, 1], textSwap: [.25, 1, .5, 1]
  });
  assert.equal(springs.tray.omega, 32.5);
  assert.deepEqual(durations, { press: 150, digitMorph: 180, textSwap: 300, trayOpen: 320, trayClose: 240,
    backdropIn: 240, backdropOut: 200, reduced: 150, spinner: 700, handoffExit: 100, handoffEnter: 170 });
});

test('flows read the shared tokens', () => {
  assert.equal(MOTION.omega, springs.tray.omega);
  assert.equal(MOTION.ease, curves.easeOutQuad);
});

test('CSS variables mirror the tokens', () => {
  assert.equal(credoMotionStyle['--credo-ease-out'], 'cubic-bezier(0.23,1,0.32,1)');
  assert.equal(credoMotionStyle['--credo-ease-drawer'], cubicBezier('drawer'));
  assert.equal(credoMotionStyle['--credo-duration-press'], '150ms');
  assert.equal(credoMotionStyle['--credo-duration-tray-open'], '320ms');
  assert.equal(credoMotionStyle['--credo-duration-handoff-exit'], '100ms');
  assert.equal(credoMotionStyle['--credo-duration-handoff-enter'], '170ms');
});
