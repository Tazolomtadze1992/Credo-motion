function linearRgb(hex) {
  return hex.slice(1).match(/../g).map(channel => {
    const value = parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
}

function toOklch(hex, alpha) {
  const [r, g, b] = linearRgb(hex);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const lightness = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const labB = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  const chroma = Math.hypot(a, labB);
  const hue = chroma < 0.00001 ? 0 : (Math.atan2(labB, a) * 180 / Math.PI + 360) % 360;
  return `oklch(${+lightness.toFixed(5)} ${+chroma.toFixed(5)} ${+hue.toFixed(3)}${alpha === undefined ? '' : ` / ${alpha}`})`;
}

export function contrastRatio(foreground, background) {
  const luminance = hex => {
    const [r, g, b] = linearRgb(hex);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [low, high] = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
  return (high + 0.05) / (low + 0.05);
}

/* ---------- Tier 1: primitives (plan 009, Phase A, 2026-11-16) ----------
   Seven OKLCH ramps (violet and teal added 2026-11-17 for the product cards), named by hue and step, never used in components directly.
   Built with oklch-skill and better-colors: one hue per ramp; the brand 500s
   are pinned exactly (coral #FC6250, blue #1E6E91, green #2E734B); light steps
   0.045 apart; vividness peaks at 500 and never exceeds it; every step inside
   sRGB. Red (danger) sits 15° from the coral so errors don't read as brand.
   Each entry: [step, L, C, H, hex]. Hex is the sRGB value for Figma and tests. */
export const RAMP_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const rampData = {
  coral: [
    [50, 0.975, 0.012, 29.48, '#FFF4F2'],
    [100, 0.93, 0.035, 29.48, '#FFE0DA'],
    [200, 0.885, 0.06, 29.48, '#FECBC2'],
    [300, 0.82, 0.101, 29.48, '#FFAB9E'],
    [400, 0.756, 0.146, 29.48, '#FF8978'],
    [500, 0.692, 0.192, 29.48, '#FC6250'],
    [600, 0.601, 0.172, 29.48, '#D34D3E'],
    [700, 0.511, 0.153, 29.48, '#AD392D'],
    [800, 0.421, 0.13, 29.48, '#86281E'],
    [900, 0.33, 0.105, 29.48, '#601811'],
    [950, 0.24, 0.076, 29.48, '#3C0C07']
  ],
  blue: [
    [50, 0.975, 0.007, 232.094, '#F2F8FB'],
    [100, 0.93, 0.018, 232.094, '#DDEAF2'],
    [200, 0.885, 0.036, 232.094, '#C2DEED'],
    [300, 0.82, 0.059, 232.094, '#9ECCE4'],
    [400, 0.664, 0.078, 232.094, '#609CBB'],
    [500, 0.508, 0.092, 232.094, '#1E6E91'],
    [600, 0.454, 0.083, 232.094, '#175E7C'],
    [700, 0.401, 0.073, 232.094, '#134E68'],
    [800, 0.347, 0.062, 232.094, '#0F3F54'],
    [900, 0.294, 0.05, 232.094, '#0C3041'],
    [950, 0.24, 0.036, 232.094, '#0B222D']
  ],
  gray: [
    [50, 0.976, 0, 0, '#F7F7F7'],
    [100, 0.94, 0, 0, '#EBEBEB'],
    [200, 0.908, 0, 0, '#E0E0E0'],
    [300, 0.8, 0, 0, '#BEBEBE'],
    [400, 0.7, 0, 0, '#9E9E9E'],
    [500, 0.6, 0, 0, '#808080'],
    [600, 0.508, 0, 0, '#656565'],
    [700, 0.41, 0, 0, '#4A4A4A'],
    [800, 0.33, 0, 0, '#353535'],
    [900, 0.28, 0, 0, '#292929'],
    [950, 0.205, 0, 0, '#171717']
  ],
  red: [
    [50, 0.975, 0.012, 14.48, '#FFF4F4'],
    [100, 0.93, 0.035, 14.48, '#FFDFE0'],
    [200, 0.885, 0.061, 14.48, '#FFC9CD'],
    [300, 0.82, 0.102, 14.48, '#FFA9AF'],
    [400, 0.72, 0.176, 14.48, '#FF6E82'],
    [500, 0.62, 0.237, 14.48, '#F31C58'],
    [600, 0.544, 0.214, 14.48, '#CE0A47'],
    [700, 0.468, 0.187, 14.48, '#A90038'],
    [800, 0.392, 0.156, 14.48, '#85012A'],
    [900, 0.316, 0.126, 14.48, '#62001D'],
    [950, 0.24, 0.095, 14.48, '#410110']
  ],
  green: [
    [50, 0.975, 0.007, 155.206, '#F3F8F5'],
    [100, 0.93, 0.018, 155.206, '#DFECE3'],
    [200, 0.885, 0.037, 155.206, '#C7E1CF'],
    [300, 0.82, 0.061, 155.206, '#A5D0B3'],
    [400, 0.66, 0.08, 155.206, '#69A17D'],
    [500, 0.5, 0.095, 155.206, '#2E734B'],
    [600, 0.448, 0.085, 155.206, '#266240'],
    [700, 0.396, 0.075, 155.206, '#1F5235'],
    [800, 0.344, 0.064, 155.206, '#19432A'],
    [900, 0.292, 0.052, 155.206, '#133320'],
    [950, 0.24, 0.037, 155.206, '#102417']
  ],
  // Category ramps (2026-11-17): the product card colours pinned at 500, on the
  // blue ramp's lightness curve so every 500 sits at about 0.51.
  violet: [
    [50, 0.975, 0.011, 294.95, '#F7F5FE'],
    [100, 0.93, 0.03, 294.95, '#E9E4FA'],
    [200, 0.885, 0.06, 294.95, '#DBD2FD'],
    [300, 0.82, 0.098, 294.95, '#C8B8FD'],
    [400, 0.664, 0.13, 294.95, '#9A82DA'],
    [500, 0.509, 0.154, 294.95, '#6E4EB3'],
    [600, 0.455, 0.138, 294.95, '#5E429A'],
    [700, 0.402, 0.122, 294.95, '#4E3682'],
    [800, 0.348, 0.103, 294.95, '#3F2C69'],
    [900, 0.295, 0.083, 294.95, '#302251'],
    [950, 0.24, 0.06, 294.95, '#221838']
  ],
  teal: [
    [50, 0.975, 0.005, 181.988, '#F3F8F7'],
    [100, 0.93, 0.014, 181.988, '#DEEBE8'],
    [200, 0.885, 0.029, 181.988, '#C5E0DA'],
    [300, 0.82, 0.048, 181.988, '#A3CFC6'],
    [400, 0.664, 0.064, 181.988, '#65A196'],
    [500, 0.509, 0.076, 181.988, '#277469'],
    [600, 0.455, 0.068, 181.988, '#216359'],
    [700, 0.402, 0.06, 181.988, '#1A534B'],
    [800, 0.348, 0.051, 181.988, '#15433C'],
    [900, 0.295, 0.041, 181.988, '#11332E'],
    [950, 0.24, 0.029, 181.988, '#0E2420']
  ]
};
export const ramps = Object.fromEntries(Object.entries(rampData).map(([name, steps]) => [name, steps.map(([step, L, C, H, hex]) => ({
  name, step, L, C, H, hex, value: `oklch(${L} ${C} ${H})`
}))]));
const rampStep = ref => { const [name, step] = ref.split('-'); return ramps[name]?.find(item => item.step === Number(step)); };
const rampVar = ref => `--credo-${ref}`;

/* ---------- Tier 2: roles (plan 009, Phase B, 2026-11-16) ----------
   Named by job in the better-colors grammar: bg/text/border/icon, then
   accent (brand blue), highlight (brand coral), success and danger, each with
   subtle/border/solid/text. Each role points at a ramp step ('gray-600') or,
   for white, black and the category colours, holds its own value. */
export const colorGroups = [
  ['Backgrounds', [
    ['bg/page', '#FFFFFF', 'Screen behind the tray'],
    ['bg/surface', '#FFFFFF', 'Trays and cards'],
    ['bg/subtle', 'gray-50', 'Tiles, option cards, close button'],
    ['bg/overlay', '#000000', 'Dim behind the tray', { alpha: 0.45 }]
  ]],
  ['Borders', [
    ['border/separator', 'gray-50', 'Line under the tray title'],
    ['border/subtle', 'gray-100', 'Chips and list separators'],
    ['border/default', 'gray-200', 'Unselected select mark'],
    ['border/strong', 'gray-500', '3:1 outline · unused'],
    ['border/focus', 'blue-500', 'Keyboard focus']
  ]],
  ['Text and icons', [
    ['text/strong', 'gray-950', 'Titles and amounts'],
    ['text/primary', 'gray-900', 'Body text and values'],
    ['text/secondary', 'gray-600', 'Labels, hints, descriptions'],
    ['text/disabled', 'gray-300', 'Placeholders'],
    ['text/on-accent', '#FFFFFF', 'Text on solid fills'],
    ['icon/secondary', 'gray-500', 'Close, chevrons, pending']
  ]],
  ['Accent (blue)', [
    ['accent/subtle', 'blue-50', 'Secondary button, search field'],
    ['accent/subtle-strong', 'blue-100', 'List row icon circle'],
    ['accent/solid', 'blue-500', 'Button gradient start, selected marks'],
    ['accent/text', 'blue-500', 'Secondary button label, icons']
  ]],
  ['Highlight (coral)', [
    ['highlight/border', 'coral-600', 'Selected amount ring'],
    ['highlight/solid', 'coral-700', 'Button gradient end'],
    ['highlight/text', 'coral-700', 'Text actions such as Edit']
  ]],
  ['Success and danger', [
    ['success/subtle', 'green-100', 'Success surface, Fast badge'],
    ['success/solid', 'green-500', 'Completed action'],
    ['success/text', 'green-600', 'Fast badge text'],
    ['danger/subtle', 'red-50', 'Error icon surface'],
    ['danger/icon', 'red-500', 'Error icon'],
    ['danger/text', 'red-700', 'Error messages']
  ]],
  // Decided (auto lombard, 2026-11-17): a categorical palette for the product
  // cards. One lightness (~0.51) so no card outweighs another and white text
  // passes 4.5:1 on all of them. Every card colour is a ramp step: blue, green
  // and coral are the brand ramps; violet and teal have their own ramps.
  // Rules: the Product colours pattern (content/patterns.js).
  ['Category colours', [
    ['category/ink', 'gray-900', 'Accounts and cards'],
    ['category/blue', 'blue-500', 'Loans and installments'],
    ['category/green', 'green-500', 'Deposits'],
    ['category/coral', 'coral-700', 'Credit card'],
    ['category/violet', 'violet-500', 'Installment limit and car loans'],
    ['category/teal', 'teal-500', 'Insurance']
  ]]
].map(([name, entries]) => [name, entries.map(([role, source, use, options = {}]) => {
  const step = source.startsWith('#') ? null : rampStep(source);
  if (!source.startsWith('#') && !step) throw new Error(`Unknown ramp step ${source} for ${role}`);
  return step
    ? { role, ref: source, hex: step.hex, use, value: step.value }
    : { role, ref: null, hex: source, use, alpha: options.alpha, value: toOklch(source, options.alpha) };
})]);

export const colorTokens = Object.fromEntries(colorGroups.flatMap(([, tokens]) => tokens.map(token => [token.role, token])));
const property = role => `--credo-color-${role.replaceAll('/', '-')}`;
const literal = ({ hex, alpha }) => `--credo-palette-${hex.slice(1).toLowerCase()}${alpha === undefined ? '' : `-${alpha * 100}`}`;
const tokens = Object.values(colorTokens);
export const primaryButtonDisabledOpacity = 0.45;
export const credoColorStyle = {
  // Primitives: every ramp step as --credo-<hue>-<step>.
  ...Object.fromEntries(Object.values(ramps).flat().map(item => [rampVar(`${item.name}-${item.step}`), item.value])),
  // Literal values (white, black, category colours).
  ...Object.fromEntries(tokens.filter(token => !token.ref).map(token => [literal(token), token.value])),
  // Roles point at a primitive.
  ...Object.fromEntries(tokens.map(token => [property(token.role), `var(${token.ref ? rampVar(token.ref) : literal(token)})`])),
  // Component tier (documented exceptions): the gradients mix two roles.
  // The button keeps today's sRGB interpolation (a brand look; plan 009 decision 5).
  '--credo-color-button-primary-bg': 'linear-gradient(209.002716deg, var(--credo-color-accent-solid) -141.51%, var(--credo-color-highlight-solid) 108.14%)',
  '--credo-action-primary-disabled-opacity': primaryButtonDisabledOpacity,
  '--credo-color-inline-action-text': 'linear-gradient(90deg, var(--credo-color-accent-solid), var(--credo-color-highlight-solid))'
};
