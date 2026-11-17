import test from 'node:test';
import assert from 'node:assert/strict';
import { PROVIDERS, STEPS, nextLayers, orderSummary, afterRule, back, editNumber, formatNumber, go, queryProviders, reviewRows, validNumber } from '../lib/automatic-orders-flow.mjs';

const setup = ['picker', 'categories', 'providers', 'number', 'rule', 'limit', 'review'];

test('every step has a definition', () => {
  for (const step of [...setup, 'templates', 'amount', 'day', 'account', 'agreements', 'terms', 'otp']) assert.ok(STEPS[step], step);
});

test('changing the rule returns to the same review', () => {
  // Back to the rule, switch to "monthly": rule → amount → day → review.
  let stack = go(back(back(setup)), afterRule('monthly'));
  stack = go(stack, 'day');
  stack = go(stack, 'review');
  assert.deepEqual(stack, ['picker', 'categories', 'providers', 'number', 'rule', 'amount', 'day', 'review']);
  assert.equal(back(stack).at(-1), 'day');
});

test('account, agreements and the code are tray steps that return to review', () => {
  assert.deepEqual(go(go(setup, 'account'), 'review'), setup);
  assert.deepEqual(go(go(go(setup, 'agreements'), 'terms'), 'review'), setup);
  assert.deepEqual(go(setup, 'agreements').concat('otp').slice(-3), ['review', 'agreements', 'otp']);
});

test('back never empties the stack', () => {
  assert.deepEqual(back(['picker']), ['picker']);
});

test('subscriber numbers take digits only, grouped in threes', () => {
  let value = '';
  for (const key of ['4', '9', '.', '2', '3', '1', '2', 'backspace', '2']) value = editNumber(value, key);
  assert.equal(value, '492312');
  assert.equal(formatNumber('492312312'), '492 312 312');
  assert.ok(validNumber(value));
  assert.ok(!validNumber('4923'));
});

test('search matches provider names and aliases', () => {
  assert.deepEqual(queryProviders('magti').map(p => p.id), ['magti']);
  assert.deepEqual(queryProviders('tel').map(p => p.id), ['telmico']);
  assert.deepEqual(queryProviders('', 'gas').map(p => p.id), ['teg']);
});

test('review is a plain receipt that names a limit for bills and an amount for a day', () => {
  const provider = PROVIDERS[0];
  const bill = reviewRows({ provider, number: '492312312', rule: 'bill', amountText: '50', day: 5 });
  assert.deepEqual(bill.map(row => row.label), ['Subscriber', 'Pays', 'Up to']);
  const monthly = reviewRows({ provider, number: '492312312', rule: 'monthly', amountText: '25', day: 31 });
  assert.equal(bill[0].value, '492 312 312 · Telmico');
  assert.equal(monthly[1].value, 'Last day of the month');
  assert.equal(monthly[2].label, 'Amount');
});


test('a new order shows how often and how much, with two decimals', () => {
  const provider = PROVIDERS[0];
  const bill = orderSummary({ provider, number: '492312312', rule: 'bill', amountText: '50', day: 1 });
  assert.deepEqual([bill.subtitle, bill.amount], ['When billed', 'up to 50.00 ₾']);
  const monthly = orderSummary({ provider, number: '492312312', rule: 'monthly', amountText: '1,250.5', day: 31 });
  assert.deepEqual([monthly.subtitle, monthly.amount], ['Last day each month', '1,250.50 ₾']);
});

test('a forward step keeps the old layer leaving and adds one entering layer', () => {
  const layers = nextLayers([{ id: 0, step: 'picker', phase: 'idle' }], 'categories', 1);
  assert.deepEqual(layers.map(l => [l.id, l.step, l.phase]), [[0, 'picker', 'out'], [1, 'categories', 'in']]);
});

test('going back to a step that is still leaving turns that same layer around', () => {
  const forward = nextLayers([{ id: 0, step: 'picker', phase: 'idle' }], 'categories', 1);
  const back = nextLayers(forward, 'picker', 2);
  assert.deepEqual(back.map(l => [l.id, l.step, l.phase]), [[0, 'picker', 'in'], [1, 'categories', 'out']]);
});

test('two quick steps keep both earlier layers leaving', () => {
  let layers = nextLayers([{ id: 0, step: 'picker', phase: 'idle' }], 'categories', 1);
  layers = nextLayers(layers, 'providers', 2);
  assert.deepEqual(layers.map(l => l.phase), ['out', 'out', 'in']);
});

test('a settled layer leaves like any shown layer', () => {
  const layers = nextLayers([{ id: 1, step: 'picker', phase: 'rest' }], 'categories', 2);
  assert.deepEqual(layers.map(l => [l.id, l.phase]), [[1, 'out'], [2, 'in']]);
});
