// Credo spacing tokens. Two layers:
// 1. A 4px scale (the raw sizes the flows already use: 4, 8, 12, 16, 24, 32, 40).
// 2. Layout roles: what a value is for (tray side padding, content top, …).
//    Screens and components use roles; roles point at the scale.
// Values come from the 2026-11-14 spacing audit of the China transfer and
// Automatic orders flows. Adding this file changed no layout: phase 2 moves
// the flows onto these tokens. JavaScript imports the numbers; CSS uses
// --credo-space-* and --credo-<group>-<role> (set once on <html>).
//
// status: 'decided' = the user decided it (with date); 'proposed' = waiting for
// the user. The scale, names and every role were approved on 2026-11-14.

/** The scale. Keys are steps of 4px: space-4 = 16px. */
export const scale = { 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32, 10: 40 };

const step = n => ({ step: n, px: scale[n] });

/** Layout roles, grouped. `px` is the value; `step` is its place on the scale (null when it is a fixed device or layout size). */
export const roles = {
  tray: {
    gutter: { ...step(6), use: 'Left and right padding of tray content, header and footer.', status: 'decided', source: 'both flows today; approved 2026-11-14' },
    header: { step: null, px: 80, use: 'Header height including the divider (79 + 1). The title is centred on the close button.', status: 'decided', source: 'both flows today; approved 2026-11-14' },
    'close-inset': { step: null, px: 20, use: 'Close button distance from the tray’s top edge.', status: 'decided', source: 'both flows today; approved 2026-11-14' },
    'content-top': { ...step(4), use: 'Divider to the first visible content: a row’s icon, a field’s fill, the top of the letters.', status: 'decided', source: '2026-11-14, compared with Family' },
    'content-to-action': { ...step(6), use: 'Last content to the footer button.', status: 'decided', source: '24–32px, 2026-11-14' },
    'content-to-action-reading': { ...step(10), use: 'Last paragraph of running text (terms) to the footer button.', status: 'decided', source: 'Terms, 2026-11-14' },
    'action-gap': { ...step(4), use: 'Space the footer reserves above the button.', status: 'decided', source: 'both flows today; approved 2026-11-14' },
    'home-inset': { step: null, px: 34, use: 'Button to the bottom edge, clear of the home indicator. A device value.', status: 'decided', source: 'iPhone home indicator; approved 2026-11-14' },
    'emphasis-top': { ...step(8), use: 'Divider to the big number on a step built around one (amount, subscriber number, payment day, custom amount): twice content-top, so it reads as deliberate.', status: 'decided', source: 'approved 2026-11-14 (was 22–30px)' }
  },
  list: {
    'row-gap': { ...step(3), use: 'Space between list rows.', status: 'decided', source: 'already --credo-row-gap; approved 2026-11-14' },
    'row-inset': { ...step(1), use: 'A 48px row’s padding above its 40px leading. Steps subtract it so the icon, not the row, lands on content-top.', status: 'decided', source: 'List row; approved 2026-11-14' }
  }
};

/** Footer space a tray keeps below its content when the step has a button (56px button). */
export const BUTTON_HEIGHT = 56;
export const footerSpace = () => BUTTON_HEIGHT + roles.tray['action-gap'].px + roles.tray['home-inset'].px;

/** Flat px lookup: px('tray', 'content-top') → 16. */
export const px = (group, role) => roles[group][role].px;

// CSS custom properties, set once on <html>:
// --credo-space-4: 16px … and --credo-tray-content-top: 16px …
export const credoSpacingStyle = {
  ...Object.fromEntries(Object.entries(scale).map(([n, value]) => [`--credo-space-${n}`, `${value}px`])),
  ...Object.fromEntries(Object.entries(roles).flatMap(([group, items]) => Object.entries(items)
    .filter(([, token]) => token.px != null)
    .map(([name, token]) => [`--credo-${group}-${name}`, token.step ? `var(--credo-space-${token.step})` : `${token.px}px`])))
};
