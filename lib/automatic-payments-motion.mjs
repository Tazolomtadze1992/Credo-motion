import { sampleSurface, easeContent } from './transfer-motion.mjs';

export const PAYMENT_SHEET = { canvas: 676, amount: 636, day: 512, omega: 32.5 };
export const PAYMENT_HANDOFF = { exitMs: 100, enterMs: 160, enterDelay: 30, titleExitMs: 60, titleEnterMs: 100 };
const CONTENT_SECONDS = (PAYMENT_HANDOFF.enterDelay + PAYMENT_HANDOFF.enterMs) / 1000;
const HEADER_SECONDS = (PAYMENT_HANDOFF.titleExitMs + PAYMENT_HANDOFF.titleEnterMs) / 1000;
const EXIT_EASE = [.19, 1, .22, 1];
const ENTER_EASE = [.25, .46, .45, .94];
const keys = ['amount', 'day'];
const offsetFor = view => PAYMENT_SHEET.canvas - PAYMENT_SHEET[view];
const clamp = x => Math.max(0, Math.min(1, x));
const lerp = (a, b, p) => a + (b - a) * p;
const resting = mode => ({
  panels: Object.fromEntries(keys.map(key => [key, { alpha: Number(key === mode), y: offsetFor(key), scale: 1 }])),
  titles: Object.fromEntries(keys.map(key => [key, { alpha: Number(key === mode), y: 0 }])),
  back: Number(mode === 'day')
});
const track = (from, to, duration, delay = 0, ease = ENTER_EASE) => ({ from: { ...from }, to, duration, delay, ease });
function sampleTrack(t, ms) {
  const p = t.duration ? easeContent(clamp((ms - t.delay) / t.duration), t.ease) : Number(ms >= t.delay);
  const result = Object.fromEntries(Object.keys(t.to).map(key => [key, lerp(t.from[key], t.to[key], p)]));
  if (t.travelEase) result.y = lerp(t.from.y, t.to.y, easeContent(clamp((ms - t.delay) / t.duration), t.travelEase));
  if (t.fade) result.alpha = sampleTrack(t.fade, ms).alpha;
  return result;
}
function handoff(pose, next, offset, reduced = false) {
  const { exitMs, enterMs, enterDelay, titleExitMs, titleEnterMs } = PAYMENT_HANDOFF;
  const outgoing = next === 'day' ? 'amount' : 'day';
  const direction = next === 'day' ? 1 : -1;
  const panels = {};
  for (const key of keys) {
    const from = { ...pose.panels[key] }, entering = key === next;
    if (entering && from.alpha < .00001) {
      from.y = reduced ? offsetFor(next) : Math.max(offset, offsetFor(next)) + direction * 8;
      from.scale = reduced ? 1 : .97;
    }
    panels[key] = entering
      ? track(from, { alpha: 1, y: offsetFor(next), scale: 1 }, enterMs * (1 - from.alpha), reduced ? 0 : enterDelay * pose.panels[outgoing].alpha)
      : track(from, { alpha: 0, y: reduced ? from.y : from.y - direction * 8, scale: reduced ? 1 : 1.02 }, exitMs * from.alpha, 0, EXIT_EASE);
    if (entering && next === 'amount' && from.alpha < .00001 && !reduced) {
      // The taller keypad must reach its bottom-safe position before becoming
      // readable. Travel leads the fade, with no per-key stagger or CTA movement.
      panels[key].travelEase = EXIT_EASE;
      panels[key].fade = track({ alpha: 0 }, { alpha: 1 }, enterMs - enterDelay, panels[key].delay + enterDelay);
    }
  }
  const titleExit = reduced ? 0 : titleExitMs * pose.titles[outgoing].alpha;
  const titles = {};
  for (const key of keys) {
    const from = { ...pose.titles[key] }, entering = key === next;
    if (entering && from.alpha < .00001) from.y = reduced ? 0 : direction * 12;
    titles[key] = entering
      ? track(from, { alpha: 1, y: 0 }, (reduced ? enterMs : titleEnterMs) * (1 - from.alpha), titleExit)
      : track(from, { alpha: 0, y: reduced ? 0 : -direction * 12 }, titleExit);
  }
  const back = track({ alpha: pose.back }, { alpha: Number(next === 'day') }, titleEnterMs * Math.abs(Number(next === 'day') - pose.back), next === 'day' ? titleExit : 0);
  const all = [...Object.values(panels), ...Object.values(titles), back];
  return { panels, titles, back, duration: Math.max(...all.map(t => t.delay + t.duration)) };
}
function sampleHandoff(animation, contentMs, headerMs = contentMs) {
  return {
    panels: Object.fromEntries(keys.map(key => [key, sampleTrack(animation.panels[key], contentMs)])),
    titles: Object.fromEntries(keys.map(key => [key, sampleTrack(animation.titles[key], headerMs)])),
    back: sampleTrack(animation.back, headerMs).alpha
  };
}

export function createPaymentTray({ sheet, onView, onTimeline }) {
  const panels = Object.fromEntries(keys.map(key => [key, sheet.querySelector(`[data-ap-panel="${key}"]`)]));
  const masks = Object.fromEntries(keys.map(key => [key, sheet.querySelector(`[data-ap-mask="${key}"]`)]));
  const header = sheet.querySelector('.ap-sheet-header');
  const divider = sheet.querySelector('.ap-divider');
  const titles = [...sheet.querySelectorAll('[data-ap-title]')];
  const back = sheet.querySelector('.ap-sheet-back');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let mode = 'amount', state = { value: offsetFor(mode), velocity: 0, target: offsetFor(mode) };
  let pose = resting(mode), animation = null, start = 0, previous = 0, frame = 0;
  let preview = false, visible = false, disposed = false, timeline = null, dock = null, makeTimeline = null;
  let pair = ['amount', 'day'];
  function paint() {
    sheet.style.clipPath = `inset(${state.value}px 0 0 round 24px)`;
    header.style.transform = divider.style.transform = `translateY(${state.value}px)`;
    for (const key of keys) {
      const node = panels[key], p = pose.panels[key];
      node.style.opacity = String(p.alpha);
      node.style.visibility = p.alpha > .00001 ? 'visible' : 'hidden';
      node.style.transform = `translateY(${p.y}px)`;
      node.querySelector('.ap-panel-body').style.transform = reduced.matches ? 'none' : `scale(${p.scale})`;
      // Each scene owns its aperture. The resizing header no longer cuts through
      // the outgoing amount or the bottom keypad row during its short fade.
      masks[key].style.clipPath = `inset(${p.y + 94}px 0 106px)`;
    }
    titles.forEach(node => {
      const p = pose.titles[node.dataset.apTitle];
      node.style.opacity = String(p.alpha);
      node.style.visibility = p.alpha > .00001 ? 'visible' : 'hidden';
      node.style.transform = reduced.matches ? 'none' : `translateY(${p.y}px)`;
      node.style.filter = 'none';
    });
    back.style.opacity = String(pose.back);
    back.style.visibility = pose.back > .00001 ? 'visible' : 'hidden';
  }
  function tick(now) {
    frame = 0;
    const surface = sampleSurface(state.value, state.velocity, state.target, (now - previous) / 1000, PAYMENT_SHEET.omega);
    state.value = surface.value; state.velocity = surface.velocity; previous = now;
    const elapsed = now - start;
    if (animation) pose = sampleHandoff(animation, elapsed);
    paint();
    if (!disposed && (surface.moving || (animation && elapsed < animation.duration))) frame = requestAnimationFrame(tick);
  }
  function select(view) { if (mode !== view) { mode = view; onView(view); } }
  function setView(next, instant = false) {
    if (disposed || !keys.includes(next)) return;
    const old = mode;
    if (old === next && !preview && !instant) return;
    timeline?.pause(); preview = false;
    cancelAnimationFrame(frame); frame = 0;
    if (old !== next) { pair = [old, next]; setupTimeline(); }
    state.target = offsetFor(next); start = previous = performance.now();
    if (instant) {
      state.value = state.target; state.velocity = 0; pose = resting(next); animation = null;
    } else {
      if (reduced.matches) {
        state.value = state.target; state.velocity = 0;
        pose = resting(next); pose.panels[next].alpha = pose.titles[next].alpha = 0;
      }
      animation = handoff(pose, next, state.value, reduced.matches);
      pose = sampleHandoff(animation, 0);
    }
    select(next); paint();
    if (!instant) frame = requestAnimationFrame(tick);
  }
  function setupTimeline() {
    if (!makeTimeline) return;
    timeline?.destroy(); timeline = makeTimeline(...pair);
    timeline.subscribe(values => {
      if (disposed || !visible) return;
      preview = true; cancelAnimationFrame(frame); frame = 0;
      const [from, to] = pair;
      const s = sampleSurface(offsetFor(from), 0, offsetFor(to), Number(values.surface.current.progress) * .4, PAYMENT_SHEET.omega);
      state.value = s.value; state.velocity = s.velocity;
      const a = handoff(resting(from), to, offsetFor(from));
      pose = sampleHandoff(a, Number(values.content.current.progress) * CONTENT_SECONDS * 1000, Number(values.header.current.progress) * HEADER_SECONDS * 1000);
      select(pose.panels[to].alpha >= pose.panels[from].alpha ? to : from);
      if (reduced.matches) { state.value = offsetFor(mode); state.velocity = 0; pose = resting(mode); }
      paint();
    }, false);
  }
  async function init() {
    const { createDialTimeline, createDialTimelineRoot } = await import('dialkit/vanilla');
    if (disposed) return;
    makeTimeline = (from, to) => createDialTimeline(`${from === 'amount' ? 'Amount → Payment day' : 'Payment day → Amount'}`, {
      duration: .4,
      surface: { at: 0, duration: .4, from: { progress: 0 }, to: { progress: 1 }, transition: { type: 'easing', duration: .4, ease: [0, 0, 1, 1] } },
      content: { at: 0, duration: CONTENT_SECONDS, from: { progress: 0 }, to: { progress: 1 }, transition: { type: 'easing', duration: CONTENT_SECONDS, ease: [0, 0, 1, 1] } },
      header: { at: 0, duration: HEADER_SECONDS, from: { progress: 0 }, to: { progress: 1 }, transition: { type: 'easing', duration: HEADER_SECONDS, ease: [0, 0, 1, 1] } }
    }, { autoplay: false, persist: false, id: `credo-autopay-${from}-${to}-handoff-v2` });
    setupTimeline();
    dock = createDialTimelineRoot({ theme: 'light', defaultVisible: visible, defaultOpen: true,
      onVisibilityChange: value => { if (visible !== value) toggleTimeline(); } });
  }
  function toggleTimeline() {
    visible = !visible; dock?.setVisible(visible); onTimeline(visible);
    if (visible) timeline?.seek(mode === pair[0] ? 0 : .4);
    else if (preview) setView(mode);
  }
  function frameKey(e) {
    if (!visible || !timeline || ![',', '.'].includes(e.key) || e.defaultPrevented || e.target.closest('input')) return;
    e.preventDefault(); timeline.pause(); timeline.seek(Math.max(0, Math.min(.4, timeline.values.time + (e.key === '.' ? 1 : -1) / 60)));
  }
  function motionChanged() { setView(mode, true); }
  reduced.addEventListener('change', motionChanged); document.addEventListener('keydown', frameKey);
  paint(); init();
  return { setView, toggleTimeline, pause() { cancelAnimationFrame(frame); frame = 0; },
    destroy() { disposed = true; cancelAnimationFrame(frame); timeline?.destroy(); dock?.destroy(); reduced.removeEventListener('change', motionChanged); document.removeEventListener('keydown', frameKey); } };
}
