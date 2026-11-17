// Tray presence for every flow (plan 011 W6): the tray slides from the bottom
// edge on the drawer curve and the backdrop fades on easeOut. Under reduced
// motion the tray fades instead, on `ease` (opacity changes use ease). The
// values were the same in China, Automatic orders and Auto lombard; only the
// reduced-motion easing had drifted (drawer in two flows), so it is one
// helper now. Returns [slide, dim] so each flow keeps its own finish handling.
import { cubicBezier, durations } from '../content/motion.mjs';

export function presenceKeyframes({ height, opening, reduce }) {
  const fade = opening ? [0, 1] : [1, 0];
  const along = opening ? [`translateY(${height}px)`, 'translateY(0px)'] : ['translateY(0px)', `translateY(${height}px)`];
  return {
    tray: reduce ? fade.map(opacity => ({ opacity })) : along.map(transform => ({ transform })),
    backdrop: fade.map(opacity => ({ opacity }))
  };
}

export function presenceTiming({ opening, reduce }) {
  const fill = opening ? 'auto' : 'forwards';
  return {
    tray: { duration: reduce ? durations.reduced : opening ? durations.trayOpen : durations.trayClose,
      easing: reduce ? 'ease' : cubicBezier('drawer'), fill },
    backdrop: { duration: reduce ? durations.reduced : opening ? durations.backdropIn : durations.backdropOut,
      easing: cubicBezier('easeOut'), fill }
  };
}

export function animateTrayPresence({ tray, backdrop, height, opening, reduce }) {
  const frames = presenceKeyframes({ height, opening, reduce });
  const timing = presenceTiming({ opening, reduce });
  return [tray.animate(frames.tray, timing.tray), backdrop.animate(frames.backdrop, timing.backdrop)];
}
