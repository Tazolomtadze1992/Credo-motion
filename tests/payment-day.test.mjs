import test from 'node:test';
import assert from 'node:assert/strict';
import { createCalendar, calendarCopy, clampDay, dayProgress, dayDescription } from '../lib/payment-day.mjs';

test('month-end is an explicit selection with bounded slider values', () => {
  assert.equal(clampDay(-2), 1); assert.equal(clampDay(99), 31);
  assert.equal(calendarCopy(31), 'Last\nDay');
  assert.equal(dayProgress(1), 0); assert.equal(dayProgress(31), 1);
  assert.equal(dayDescription(31), 'On the last day of every month');
});

function calendarHarness(run) {
  const keys = ['window', 'performance', 'requestAnimationFrame', 'cancelAnimationFrame'];
  const saved = Object.fromEntries(keys.map(key => [key, globalThis[key]]));
  const node = () => ({ style: {}, dataset: {}, textContent: '', attrs: {}, setAttribute(k, v) { this.attrs[k] = v; } });
  const top = node(), bottom = node(), front = node(), back = node(), leaf = node();
  const shades = [node(), node()];
  leaf.querySelector = key => key === '[data-front-copy]' ? front : back;
  leaf.querySelectorAll = () => shades;
  const root = { querySelector: key => ({ '[data-calendar-top]': top, '[data-calendar-bottom]': bottom, '[data-calendar-leaf]': leaf })[key] };
  const frames = new Map(); let sequence = 0, now = 0, committed, motionChange;
  const media = { matches: false, addEventListener(_, cb) { motionChange = cb; }, removeEventListener() {} };
  let calendar;
  try {
    globalThis.window = { matchMedia: () => media };
    globalThis.performance = { now: () => now };
    globalThis.requestAnimationFrame = cb => { frames.set(++sequence, cb); return sequence; };
    globalThis.cancelAnimationFrame = id => frames.delete(id);
    const range = node(), fill = node(), description = node();
    calendar = createCalendar({ root, range, fill, description, onCommit: value => { committed = value; } });
    const tick = ms => { now += ms; const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(cb => cb(now)); };
    const pose = () => [top.textContent, bottom.textContent, front.textContent, back.textContent, leaf.style.transform, leaf.style.visibility];
    const coherent = () => {
      if (leaf.style.visibility === 'hidden') { assert.equal(top.textContent, bottom.textContent); return; }
      assert.equal(top.textContent, back.textContent, 'the exposed upper half belongs to the incoming page');
      assert.equal(bottom.textContent, front.textContent, 'the exposed lower half belongs to the outgoing page');
      const value = text => text === 'Last\nDay' ? 31 : Number(text);
      assert.equal(value(back.textContent) - value(front.textContent), 1, 'one sheet always joins adjacent dates');
      const angle = Number(leaf.style.transform.match(/rotateX\((.*)deg\)/)[1]);
      assert.ok(angle < 0 && angle > -180, 'the fold stays within one physical turn');
      assert.ok(shades.every(shade => Number(shade.style.opacity) >= 0 && Number(shade.style.opacity) <= .12));
    };
    run({ calendar, top, bottom, leaf, range, fill, tick, pose, coherent, frames, media, motionChange, committed: () => committed });
  } finally { calendar?.destroy(); keys.forEach(key => { if (saved[key] === undefined) delete globalThis[key]; else globalThis[key] = saved[key]; }); }
}

test('scrubbing repeatedly retargets one coherent fold without restarting its pose', () => calendarHarness(h => {
  for (let index = 0; index < 180; index++) {
    const target = index % 3 === 0 ? 31 : index % 3 === 1 ? 1 : 7 + index % 20;
    const before = h.pose();
    h.calendar.setDay(target);
    assert.deepEqual(h.pose(), before, 'a new target at the same time never changes the rendered pose');
    assert.equal(h.calendar.value(), target, 'selection follows input immediately');
    assert.equal(h.frames.size, 1, 'there is only one active animation clock');
    h.tick(5); h.coherent();
  }
  h.calendar.setDay(31);
  assert.equal(h.range.attrs['aria-valuetext'], 'On the last day of every month');
  assert.equal(h.fill.style.transform, 'scaleX(1)');
  h.tick(500);
  assert.equal(h.top.textContent, 'Last\nDay'); assert.equal(h.bottom.textContent, 'Last\nDay');
  assert.equal(h.leaf.style.visibility, 'hidden'); assert.equal(h.frames.size, 0);
  h.calendar.commit(); assert.equal(h.committed(), 31);
}));

test('a mid-fold reversal preserves the visible angle and settles to the newest date', () => calendarHarness(h => {
  h.calendar.setDay(31); h.tick(40);
  assert.equal(h.leaf.style.visibility, 'visible');
  const before = h.pose(); h.calendar.setDay(1);
  assert.deepEqual(h.pose(), before);
  for (let index = 0; index < 24; index++) { h.tick(16); h.coherent(); }
  assert.equal(h.top.textContent, '1'); assert.equal(h.bottom.textContent, '1');
  assert.equal(h.leaf.style.visibility, 'hidden'); assert.equal(h.frames.size, 0);
}));

test('reduced motion, keyboard updates and disposal cancel a moving fold', () => calendarHarness(h => {
  h.calendar.setDay(9); h.tick(20);
  h.media.matches = true; h.motionChange();
  assert.equal(h.frames.size, 0);
  assert.equal(h.top.textContent, '9'); assert.equal(h.bottom.textContent, '9');
  h.calendar.setDay(31); assert.equal(h.top.textContent, 'Last\nDay'); assert.equal(h.frames.size, 0);
  h.media.matches = false; h.calendar.setDay(12, true);
  assert.equal(h.top.textContent, '12'); assert.equal(h.bottom.textContent, '12'); assert.equal(h.frames.size, 0);
  h.calendar.setDay(4); h.calendar.destroy(); h.calendar.setDay(20);
  assert.equal(h.frames.size, 0); assert.equal(h.top.textContent, '4');
}));

test('pointer tracking maps the calendar, thumb and fill directly to fractional slider input', () => calendarHarness(h => {
  h.calendar.beginDrag();
  assert.equal(h.range.step, 'any');
  for (let index = 0; index < 180; index++) {
    const value = 1 + ((index * 137) % 3000) / 100;
    h.tick(5); h.calendar.track(value); h.coherent();
    assert.equal(Number(h.range.value), value);
    assert.equal(h.calendar.value(), Math.round(value));
    assert.equal(h.fill.style.transform, `scaleX(${(value - 1) / 30})`);
    assert.equal(h.frames.size, 0, 'pointer tracking does not schedule a spring or queue old dates');
    if (h.leaf.style.visibility === 'visible') {
      const angle = Number(h.leaf.style.transform.match(/rotateX\((.*)deg\)/)[1]);
      assert.ok(Math.abs(angle + 180 * (value - Math.floor(value))) < .00001, 'the paper follows the current pointer phase on the same event');
    }
  }
}));

test('release commits the nearest day immediately and settles all three visuals within 160ms', () => calendarHarness(h => {
  h.calendar.beginDrag(); h.tick(10); h.calendar.track(14.36);
  const before = h.pose(); h.calendar.endDrag();
  assert.deepEqual(h.pose(), before, 'release starts at the exact tracked fold');
  assert.equal(h.committed(), 14); assert.equal(h.calendar.value(), 14);
  assert.equal(Number(h.range.value), 14.36, 'the thumb does not jump independently of the paper');
  h.tick(40); h.coherent();
  const position = Number(h.range.value);
  assert.ok(position >= 14 && position < 14.36);
  assert.equal(h.fill.style.transform, `scaleX(${(position - 1) / 30})`);
  h.tick(120);
  assert.equal(h.range.step, '1'); assert.equal(h.range.value, '14');
  assert.equal(h.top.textContent, '14'); assert.equal(h.bottom.textContent, '14');
  assert.equal(h.leaf.style.visibility, 'hidden'); assert.equal(h.frames.size, 0);
}));

test('a settling fold can be caught and reversed without restarting or leaving a stale frame', () => calendarHarness(h => {
  h.calendar.beginDrag(); h.tick(10); h.calendar.track(14.68); h.calendar.endDrag(); h.tick(25);
  const before = h.pose(), caught = Number(h.range.value);
  h.calendar.beginDrag();
  assert.deepEqual(h.pose(), before); assert.equal(h.frames.size, 0);
  h.tick(5); h.calendar.track(caught - .12); h.coherent();
  assert.equal(Number(h.range.value), caught - .12);
  h.calendar.endDrag(); h.tick(160);
  assert.equal(h.top.textContent, String(Math.round(caught - .12)));
  assert.equal(h.frames.size, 0);
}));

test('full sweeps, a held thumb and cancellation do not replay dates after release', () => calendarHarness(h => {
  h.calendar.beginDrag(); h.tick(10); h.calendar.track(31); h.calendar.endDrag();
  assert.equal(h.top.textContent, 'Last\nDay'); assert.equal(h.frames.size, 0);
  h.calendar.beginDrag(); h.tick(10); h.calendar.track(1); h.calendar.endDrag();
  assert.equal(h.top.textContent, '1'); assert.equal(h.frames.size, 0);
  h.calendar.beginDrag(); h.tick(10); h.calendar.track(14.4); h.tick(120); h.calendar.endDrag(); h.tick(1);
  assert.ok(Number(h.range.value) <= 14.4, 'holding still before release discards the old movement velocity');
  h.calendar.beginDrag(); h.calendar.track(20.7); h.calendar.endDrag(true);
  assert.equal(h.range.value, '21'); assert.equal(h.range.step, '1'); assert.equal(h.frames.size, 0);
}));

test('keyboard preparation and reduced motion preserve direct selection without decorative folds', () => calendarHarness(h => {
  h.calendar.beginDrag(); h.tick(10); h.calendar.track(14.6); h.calendar.endDrag();
  h.calendar.prepareKeyboard();
  assert.equal(h.range.step, '1'); assert.equal(h.range.value, '15'); assert.equal(h.frames.size, 0);
  h.calendar.setDay(16, true); h.calendar.commit(); assert.equal(h.committed(), 16);
  h.calendar.beginDrag(); h.media.matches = true; h.motionChange(); h.calendar.track(8.4);
  assert.equal(h.range.value, '8.4'); assert.equal(h.top.textContent, '8');
  assert.equal(h.leaf.style.visibility, 'hidden'); assert.equal(h.frames.size, 0);
  h.calendar.endDrag();
  assert.equal(h.range.step, '1'); assert.equal(h.range.value, '8'); assert.equal(h.committed(), 8);
}));
