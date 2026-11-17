'use client';

// Shared tray-flow mechanics, moved unchanged from the Automatic orders study
// (2026-11-16) so other flows reuse them: the tray reveal spring (plan 005),
// the interruptible step handoff (plan 004) and the footer action whose label
// morphs. Class names keep their ao- prefix; flows import automatic-orders.css.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { TextMorph } from 'torph/react';
import PrimaryButton, { PrimaryButtonCheck, PrimaryButtonSpinner } from './PrimaryButton';
import { cubicBezier, durations, springs } from '../content/motion.mjs';
import { footerSpace, px } from '../content/spacing.mjs';
import { sampleSurface } from '../lib/transfer-motion.mjs';
import { nextLayers } from '../lib/automatic-orders-flow.mjs';

export const SCREEN_HEIGHT = 852;
export const TRAY_MAX = SCREEN_HEIGHT - 64;
export const HEAD = px('tray', 'header');      // header (79) + divider (1), as in China
const FOOTER_SPACE = footerSpace();      // 56px action + action-gap 16 + home-inset 34
const BOTTOM_INSET = px('tray', 'home-inset');
export const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Input source: keyboard-initiated actions are instant ----------
   China's rule (TransferStudy instantInput; plan 011 W2): a step change, tray
   resize, open or close that a key started does not animate. The returned ref
   is true after a key press inside `rootRef` and false after a pointer press,
   both seen in the capture phase before any click handler runs. */
export function useInputSource(rootRef) {
  const keyboard = useRef(false);
  useEffect(() => {
    const root = rootRef.current; if (!root) return;
    const onKey = () => { keyboard.current = true; };
    const onPointer = () => { keyboard.current = false; };
    root.addEventListener('keydown', onKey, true);
    root.addEventListener('pointerdown', onPointer, true);
    return () => { root.removeEventListener('keydown', onKey, true); root.removeEventListener('pointerdown', onPointer, true); };
  }, [rootRef]);
  return keyboard;
}

/* A step change removes (or makes inert) the step that held focus, which sent
   focus to <body>, where Escape no longer reaches the tray. After each step
   change, focus returns to the tray surface if it left it (plan 011 W2). */
export function useKeepFocus(surfaceRef, step, open) {
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      const surface = surfaceRef.current;
      if (surface && !surface.contains(document.activeElement)) surface.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [surfaceRef, step, open]);
}

/* ---------- Tray reveal: a critically damped spring to the content ----------
   China's mechanism (plan 005): the surface stays TRAY_MAX tall and is revealed
   with clip-path; the header, divider and body ride the top edge with
   transform, so no frame re-lays out the tray. The body is clipped at the
   footer line (it jumps up when a step gains its button and glides down on
   the tray spring when the button goes) and a 16px feather softens the cut, so content never shows around
   the button while the tray is still growing.
   `omega` (optional) overrides the spring for the current move, read on every frame, so a flow can give one
   long move a faster spring (China's ω 42 exception; auto lombard plan 010 G5). Default: springs.tray.
   `instant` (optional, a ref from useInputSource): while true, the tray jumps to its height (plan 011 W2). */
export function useTrayHeight(surfaceRef, innerRef, { head, footer, fixed, max = TRAY_MAX, rounded = false, omega = springs.tray.omega, instant: instantRef }) {
  const spring = useRef({ value: 0, velocity: 0, target: 0, frame: 0, last: 0 });
  const reserve = useRef({ value: BOTTOM_INSET, velocity: 0, target: BOTTOM_INSET });
  const options = useRef(null);
  options.current = { head, footer, fixed, max, rounded, omega, instantRef };
  const paint = useCallback(() => {
    const surface = surfaceRef.current; if (!surface) return;
    const value = spring.current.value, f = reserve.current.value;
    const o = TRAY_MAX - value;
    // Corners square up as the tray reaches the top of the screen.
    const r = options.current.rounded ? 24 * Math.max(0, Math.min(1, (SCREEN_HEIGHT - value) / 56)) : 24;
    surface.style.clipPath = `inset(${o}px 0px 0px round ${r}px ${r}px 0px 0px)`;
    const shift = `translateY(${o}px)`;
    for (const selector of ['.ao-head', '.ao-head__divider', '.ao-body']) { const part = surface.querySelector(selector); if (part) part.style.transform = shift; }
    const body = surface.querySelector('.ao-body');
    if (body) body.style.clipPath = `inset(0px 0px ${o + f}px 0px)`;
    const feather = surface.querySelector('.ao-feather');
    if (feather) feather.style.transform = `translateY(${TRAY_MAX - f - 16}px)`;
  }, [surfaceRef]);
  const tick = useCallback(now => {
    const s = spring.current, f = reserve.current;
    const seconds = Math.min(.05, (now - s.last) / 1000);
    const omega = options.current.omega;
    const sample = sampleSurface(s.value, s.velocity, s.target, seconds, omega);
    const line = sampleSurface(f.value, f.velocity, f.target, seconds, omega);
    s.last = now; s.value = sample.value; s.velocity = sample.velocity;
    f.value = line.value; f.velocity = line.velocity;
    if (!sample.moving) { s.value = s.target; s.velocity = 0; }
    if (!line.moving) { f.value = f.target; f.velocity = 0; }
    paint();
    s.frame = sample.moving || line.moving ? requestAnimationFrame(tick) : 0;
  }, [paint]);
  const measure = useCallback(instant => {
    const inner = innerRef.current; if (!inner) return;
    const o = options.current;
    const target = o.fixed ?? Math.min(o.max, o.head + inner.offsetHeight + (o.footer ? FOOTER_SPACE : BOTTOM_INSET));
    const s = spring.current, f = reserve.current;
    s.target = target; f.target = o.footer ? FOOTER_SPACE : BOTTOM_INSET;
    // Gaining a button: the line moves up at once (the button is fading in over
    // it). Losing one: the line glides down with the tray spring.
    if (f.target > f.value) { f.value = f.target; f.velocity = 0; }
    if (instant || o.instantRef?.current || reducedMotion()) {
      cancelAnimationFrame(s.frame); s.frame = 0;
      s.value = target; s.velocity = 0; f.value = f.target; f.velocity = 0; paint(); return;
    }
    if (!s.frame) { s.last = performance.now(); s.frame = requestAnimationFrame(tick); }
  }, [innerRef, paint, tick]);
  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => measure(false));
    observer.observe(innerRef.current);
    const s = spring.current;
    return () => { observer.disconnect(); cancelAnimationFrame(s.frame); };
  }, [innerRef, measure]);
  useLayoutEffect(() => { measure(false); }, [footer, fixed, measure]);
  return { measure, spring };
}

/* ---------- Step handoff (Family): outgoing clears, incoming arrives ----------
   CSS transitions on --ao-w, so a quick reversal turns a layer around from
   where it is (plan 004). Leaving layers are dropped when their fade ends.
   `instantRef` (optional, from useInputSource): a step change made from the
   keyboard swaps the step at once, with no handoff (plan 011 W2). */
export function useLayers(step, resetKey, instantRef) {
  const [layers, setLayers] = useState([{ id: 0, step, phase: 'idle' }]);
  const id = useRef(0), shown = useRef(step), reset = useRef(resetKey);
  useLayoutEffect(() => {
    if (reset.current !== resetKey) {
      reset.current = resetKey; shown.current = step;
      setLayers([{ id: ++id.current, step, phase: 'idle' }]);
      return;
    }
    if (shown.current === step) return;
    shown.current = step;
    if (instantRef?.current) { setLayers([{ id: ++id.current, step, phase: 'idle' }]); return; }
    setLayers(list => nextLayers(list, step, ++id.current, performance.now()));
    // Safety sweep, a little after the 170 ms fade: drops leaving layers that
    // never fired transitionend (turned away while still at 0).
    const sweep = setTimeout(() => setLayers(list => {
      const now = performance.now();
      // Leaving layers that never fired transitionend are dropped; arrived
      // ones settle to 'rest' (transition events do not fire in a hidden tab).
      const next = list.flatMap(layer => layer.phase === 'out' && now - layer.outAt >= 240 ? []
        : layer.phase === 'in' && now - layer.inAt >= 240 ? [{ ...layer, phase: 'rest' }] : [layer]);
      return next.length === list.length && next.every((layer, index) => layer === list[index]) ? list : next;
    }), 260);
    return () => clearTimeout(sweep);
  }, [step, resetKey, instantRef]);
  const drop = (layerId, event) => {
    if (event.target !== event.currentTarget || event.propertyName !== '--ao-w') return;
    // A leaving layer is removed; an arrived one settles to 'rest', which drops
    // its scale(1) / blur(0) so it is not drawn as its own pixel-snapped layer
    // (that shifted its content up to half a device pixel off the tray header).
    setLayers(list => list.flatMap(layer => layer.id !== layerId ? [layer]
      : layer.phase === 'out' ? [] : layer.phase === 'in' ? [{ ...layer, phase: 'rest' }] : [layer]));
  };
  return [layers, drop];
}

export function Layers({ layers, drop, render, className = 'ao-layer', keypadSteps = [] }) {
  return layers.map(layer => <div key={layer.id} className={className} data-phase={layer.phase} data-step={layer.step}
    data-keypad={keypadSteps.includes(layer.step) || undefined} inert={layer.phase === 'out' || undefined}
    aria-hidden={layer.phase === 'out' || undefined}
    onTransitionEnd={event => drop(layer.id, event)}>{render(layer.step)}</div>);
}

/* ---------- Footer action: one persistent button whose label morphs ---------- */
export function Action({ action }) {
  const state = action?.success ? 'done' : action?.busy ? 'busy' : 'idle';
  return <div className="ao-footer" data-shown={Boolean(action) || undefined}>
    <PrimaryButton className="ao-action" blend variant={action?.busy || action?.success ? 'secondary' : 'primary'}
      busy={action?.busy} success={action?.success} disabled={!action || action.disabled} onClick={action?.onClick}
      tabIndex={action ? undefined : -1} aria-hidden={!action || undefined}>
      <span className="ao-action__status" data-state={state} aria-hidden="true">
        <PrimaryButtonSpinner className="ao-action__spinner" /><PrimaryButtonCheck className="ao-action__check" pathClassName="ao-action__tick" />
      </span>
      <TextMorph as="span" className="ao-action__label" duration={durations.textSwap} ease={cubicBezier('textSwap')} respectReducedMotion>
        {action?.label ?? ' '}
      </TextMorph>
    </PrimaryButton>
  </div>;
}
