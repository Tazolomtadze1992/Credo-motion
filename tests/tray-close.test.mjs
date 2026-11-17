import test from 'node:test';
import assert from 'node:assert/strict';
import { trayCloseAction } from '../lib/tray-close.mjs';
import { VIEWS, backTarget } from '../lib/transfer-flow.mjs';

// Navigation-and-closing pattern: one X; it closes on the first step and steps back after that.
test('the tray X steps back when there is a previous step, and closes otherwise', () => {
  const back = () => 'back', close = () => 'close';
  assert.deepEqual(trayCloseAction({ onBack: back, onClose: close }), { kind: 'back', onClick: back, label: 'Back' });
  assert.deepEqual(trayCloseAction({ onClose: close, closeLabel: 'Close transfer' }), { kind: 'close', onClick: close, label: 'Close transfer' });
  assert.equal(trayCloseAction({}), null);
});

test('China: every step that can go back has somewhere to go back to', () => {
  for (const [view, config] of Object.entries(VIEWS)) {
    if (config.back) assert.ok(backTarget(view, 'amount'), `${view} has a back target, so its X steps back`);
  }
});
