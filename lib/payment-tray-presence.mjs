import { easeContent } from './transfer-motion.mjs';
import { PAYMENT_SHEET } from './automatic-payments-motion.mjs';

// Presence moves the complete tray. Its internal surface/content clocks remain
// independent, so entry never clips a separately arriving keypad or CTA.
export const PAYMENT_PRESENCE = { enterMs: 300, exitMs: 220, dimMs: 180, reducedMs: 120 };
const ENTER = [.32, .72, 0, 1];
const EXIT = [.19, 1, .22, 1];
const FADE = [.25, .46, .45, .94];
const clamp = value => Math.max(0, Math.min(1, value));
const mix = (from, to, amount) => from + (to - from) * amount;

export function createPaymentPresence({ layer, sheet, backdrop, onPresent }) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let open = true, present = true, disposed = false, frame = 0;
  let pose = { y: 0, alpha: 1, dim: 1 }, animation = null;
  function paint() {
    layer.style.transform = `translateY(${pose.y}px)`;
    layer.style.opacity = String(pose.alpha);
    backdrop.style.opacity = String(pose.dim);
  }
  function visibility(value) {
    layer.hidden = backdrop.hidden = !value;
    if (present !== value) { present = value; onPresent(value); }
  }
  function travel() {
    // The canvas stays fixed even while a hidden ancestor reports zero layout
    // height. Its current inset still accounts for a reset or interrupted resize.
    const inset = Number(sheet.style.clipPath.match(/inset\(([\d.]+)px/)?.[1]) || 0;
    return Math.max(1, PAYMENT_SHEET.canvas - inset) + 1;
  }
  function sample(now) {
    if (!animation) return false;
    const { from, to, start, duration, fadeMs, ease } = animation;
    const elapsed = now - start;
    const move = easeContent(clamp(elapsed / Math.max(1, duration)), ease);
    const fade = easeContent(clamp(elapsed / Math.max(1, fadeMs)), FADE);
    pose = { y: mix(from.y, to.y, move), alpha: mix(from.alpha, to.alpha, fade), dim: mix(from.dim, to.dim, fade) };
    return elapsed < Math.max(duration, fadeMs);
  }
  function finish() {
    pose = { ...animation.to }; animation = null; paint();
    if (!open) visibility(false);
  }
  function tick(now) {
    frame = 0;
    if (sample(now)) { paint(); frame = requestAnimationFrame(tick); }
    else finish();
  }
  function setOpen(next, instant = false) {
    if (disposed) return;
    if (next === open && !instant) return;
    const now = performance.now(), distance = travel();
    if (animation) sample(now);
    cancelAnimationFrame(frame); frame = 0;
    // A fully closed tray may have been reset to another height offscreen.
    // Reversing an in-progress exit instead preserves its captured visible pose.
    if (next && !present) pose = { y: reduced.matches ? 0 : distance, alpha: reduced.matches ? 0 : 1, dim: 0 };
    open = next;
    const to = { y: reduced.matches || next ? 0 : distance, alpha: reduced.matches && !next ? 0 : 1, dim: Number(next) };
    if (instant) {
      animation = null; pose = to; paint(); visibility(next); return;
    }
    if (reduced.matches) pose.y = 0;
    const remaining = reduced.matches ? Math.abs(to.alpha - pose.alpha) : Math.min(1, Math.abs(to.y - pose.y) / distance);
    const duration = reduced.matches ? PAYMENT_PRESENCE.reducedMs * remaining : (next ? PAYMENT_PRESENCE.enterMs : PAYMENT_PRESENCE.exitMs) * remaining;
    const fadeMs = (reduced.matches ? PAYMENT_PRESENCE.reducedMs : PAYMENT_PRESENCE.dimMs) * Math.max(Math.abs(to.dim - pose.dim), Math.abs(to.alpha - pose.alpha));
    animation = { from: { ...pose }, to, start: now, duration, fadeMs, ease: next ? ENTER : EXIT };
    paint(); visibility(true);
    if (!duration && !fadeMs) finish();
    else frame = requestAnimationFrame(tick);
  }
  function motionChanged() { setOpen(open, true); }
  reduced.addEventListener('change', motionChanged);
  paint();
  return { setOpen, isPresent: () => present,
    destroy() { disposed = true; cancelAnimationFrame(frame); reduced.removeEventListener('change', motionChanged); }
  };
}
