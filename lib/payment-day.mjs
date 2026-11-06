import { sampleSurface } from './transfer-motion.mjs';

// The final position means the actual final day, including shorter months.
export const LAST_DAY = 31;
export const clampDay = value => Math.max(1, Math.min(LAST_DAY, Math.round(Number(value) || 1)));
export const calendarCopy = day => clampDay(day) === LAST_DAY ? 'Last\nDay' : String(clampDay(day));
export const dayDescription = day => clampDay(day) === LAST_DAY ? 'On the last day of every month' : `On day ${clampDay(day)} of every month`;
export const dayProgress = day => (clampDay(day) - 1) / (LAST_DAY - 1);

const RELEASE = { omega: 75, maxMs: 160, maxVelocity: 8 };
const clampPosition = value => Math.max(1, Math.min(LAST_DAY, Number(value) || 1));
const positionProgress = value => (value - 1) / (LAST_DAY - 1);

export function createCalendar({ root, range, fill, description, onCommit }) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const top = root.querySelector('[data-calendar-top]');
  const bottom = root.querySelector('[data-calendar-bottom]');
  const leaf = root.querySelector('[data-calendar-leaf]');
  const front = leaf.querySelector('[data-front-copy]');
  const back = leaf.querySelector('[data-back-copy]');
  const shades = [...leaf.querySelectorAll('[data-leaf-shade]')];
  let day = 1, position = 1, velocity = 0, previous = 0, frame = 0, disposed = false;
  let dragging = false, gestureSettle = false, releaseStart = 0, lastInput = 0;
  const show = (node, value) => {
    const copy = calendarCopy(value), last = String(value === LAST_DAY);
    if (node.textContent !== copy) node.textContent = copy;
    if (node.dataset.last !== last) node.dataset.last = last;
  };
  function render() {
    const lower = Math.floor(position), upper = Math.ceil(position), phase = position - lower;
    if (media.matches || phase < .0001 || phase > .9999) {
      const value = media.matches ? day : Math.round(position);
      show(top, value); show(bottom, value);
      leaf.style.visibility = 'hidden';
      return;
    }
    // One interval, one physical sheet. Reversing the position reverses the same
    // angle; no competing leaves or direction-dependent changes of origin.
    show(top, upper); show(bottom, lower);
    show(front, lower); show(back, upper);
    leaf.style.transform = `rotateX(${-180 * phase}deg)`;
    leaf.style.visibility = 'visible';
    shades.forEach(shade => { shade.style.opacity = String(Math.sin(Math.PI * phase) * .12); });
  }
  function publish(value = position) {
    range.value = String(value);
    range.setAttribute('aria-valuetext', dayDescription(day));
    fill.style.transform = `scaleX(${positionProgress(value)})`;
    description.textContent = dayDescription(day);
  }
  function sample(now) {
    if (now - releaseStart >= RELEASE.maxMs) { position = day; velocity = 0; previous = now; return false; }
    const state = sampleSurface(position, velocity, day, (now - previous) / 1000, RELEASE.omega);
    position = clampPosition(state.value);
    velocity = position === state.value ? state.velocity : 0;
    previous = now;
    return state.moving && (position !== day || velocity !== 0);
  }
  function paint(now) {
    frame = 0;
    const moving = sample(now);
    if (gestureSettle) publish();
    render();
    if (moving && !disposed) frame = requestAnimationFrame(paint);
    else if (gestureSettle) settle();
  }
  function settle() {
    cancelAnimationFrame(frame); frame = 0;
    dragging = gestureSettle = false;
    position = day; velocity = 0; previous = performance.now();
    range.step = '1'; publish(day); render();
  }
  function beginDrag() {
    if (disposed || dragging) return;
    const now = performance.now();
    if (frame) sample(now);
    cancelAnimationFrame(frame); frame = 0;
    dragging = true; gestureSettle = false; velocity = 0;
    previous = lastInput = now;
    // Native pointer tracking stays continuous. Integer stepping is restored
    // after release; keyboard input always uses native whole-day steps.
    range.step = 'any'; publish(); render();
  }
  function track(value) {
    if (disposed || !dragging) return;
    const now = performance.now(), next = clampPosition(value), seconds = (now - lastInput) / 1000;
    velocity = seconds > 0 ? (next - position) / seconds : 0;
    position = next; day = clampDay(next); previous = lastInput = now;
    // No spring, queue or React update while the pointer is down.
    publish(); render();
  }
  function endDrag(instant = false) {
    if (disposed || !dragging) return;
    dragging = false; day = clampDay(position);
    const now = performance.now(), distance = day - position;
    onCommit(day);
    if (instant || media.matches || Math.abs(distance) < .0001) { settle(); return; }
    if (now - lastInput > 80) velocity = 0;
    velocity = Math.max(-RELEASE.maxVelocity, Math.min(RELEASE.maxVelocity, velocity));
    if (velocity * distance > 0) velocity = Math.sign(velocity) * Math.min(Math.abs(velocity), RELEASE.omega * Math.abs(distance));
    gestureSettle = true; releaseStart = previous = now;
    publish(); render();
    frame = requestAnimationFrame(paint);
  }
  function setDay(value, instant = false) {
    if (disposed) return;
    const now = performance.now();
    if (frame) sample(now);
    cancelAnimationFrame(frame); frame = 0;
    dragging = gestureSettle = false;
    day = clampDay(value); range.step = '1'; publish(day);
    if (instant || media.matches) { settle(); return; }
    releaseStart = previous = now;
    render();
    if (position !== day || velocity !== 0) frame = requestAnimationFrame(paint);
  }
  function motionChanged() {
    if (dragging) render();
    else settle();
  }
  media.addEventListener('change', motionChanged);
  setDay(1, true);
  return { setDay, beginDrag, track, endDrag, prepareKeyboard: settle, value: () => day,
    commit() { onCommit(day); }, settle,
    destroy() { disposed = true; settle(); media.removeEventListener('change', motionChanged); } };
}
