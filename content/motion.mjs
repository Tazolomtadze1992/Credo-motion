// Credo motion tokens: the curves, springs and durations shared by the flows
// and components. Values were tuned in the China transfer and Automatic
// payments studies (see docs/motion-guide.md); moving them here changed no
// behaviour. Timings that belong to one interaction (a handoff's exit delay,
// a gesture's release spring) stay with that interaction.

/** Cubic-bezier control points. */
export const curves = {
  // Strong ease-out: arrivals, Family-style handoffs, backdrop fades.
  easeOut: [.23, 1, .32, 1],
  // Faster settle: digit morphs and exits that should get out of the way.
  easeOutExpo: [.19, 1, .22, 1],
  // Gentle ease-out: press feedback, short fades and content moves.
  easeOutQuad: [.25, .46, .45, .94],
  // Tray presence: opening and closing a tray from the screen edge.
  drawer: [.32, .72, 0, 1],
  // Evenly paced label swaps (no front-loaded jump).
  textSwap: [.25, 1, .5, 1]
};

/** Critically damped springs; omega in rad/s (higher is faster, never bounces). */
export const springs = {
  // A tray resizing between steps.
  tray: { omega: 32.5 }
};

/** Durations in milliseconds. */
export const durations = {
  press: 150,          // press scale in and out
  digitMorph: 180,     // amount digits as you type
  textSwap: 300,       // button and status label swaps
  trayOpen: 320,
  trayClose: 240,
  backdropIn: 240,
  backdropOut: 200,
  reduced: 150,        // opacity-only replacement under reduced motion
  spinner: 700,        // one spinner revolution (twice as long under reduced motion)
  // Step handoff, the family default (plan 011 W7): the old step clears, the
  // new one arrives. China's tuned pairs are named exceptions (transitionProfile).
  handoffExit: 100,
  handoffEnter: 170
};

export const cubicBezier = name => `cubic-bezier(${curves[name].join(',')})`;

const kebab = name => name.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`);
// The same tokens as CSS custom properties, set once on <html>:
// --credo-ease-out, --credo-ease-drawer, --credo-duration-press, …
export const credoMotionStyle = {
  ...Object.fromEntries(Object.keys(curves).map(name => [`--credo-ease-${kebab(name).replace(/^ease-/, '')}`, cubicBezier(name)])),
  ...Object.fromEntries(Object.entries(durations).map(([name, ms]) => [`--credo-duration-${kebab(name)}`, `${ms}ms`]))
};
