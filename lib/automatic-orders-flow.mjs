// Automatic orders (Georgian source: ავტომატური დავალებები): a Family-style setup flow in one
// resizing tray. Pure data and navigation, so the rules are testable in Node.
// Copy, providers and fees are prototype stand-ins; see the study notes for
// the business rules still to confirm with the PO.

export const CATEGORIES = [
  { id: 'energy', name: 'Electricity', icon: 'lightning', tone: 'gold' },
  { id: 'gas', name: 'Gas', icon: 'flame', tone: 'purple' },
  { id: 'water', name: 'Water', icon: 'drop', tone: 'blue' },
  { id: 'internet', name: 'Internet & mobile', icon: 'wifi', tone: 'mint' }
];

export const PROVIDERS = [
  { id: 'telmico', category: 'energy', name: 'Telmico', logo: 'telmico.svg', alias: 'telmiko', demo: '492312312', subscriber: 'Nino Abashidze', address: '24 Vazha-Pshavela Ave', debt: '17.43' },
  { id: 'ep', category: 'energy', name: 'Energo-Pro Georgia', logo: 'energo-pro.png', alias: 'energo pro', demo: '120045781', subscriber: 'Ana Kiknadze', address: '12 Chavchavadze Ave', debt: '0.00' },
  { id: 'teg', category: 'gas', name: 'Tbilisi Energy', logo: 'tbilisi-energy.png', alias: 'tbilisi energy', demo: '247108035', subscriber: 'Giorgi Maisuradze', address: '8 Pekini Ave', debt: '32.10' },
  { id: 'gwp', category: 'water', name: 'GWP', logo: 'gwp.png', alias: 'georgian water and power', demo: '310228964', subscriber: 'Nino Abashidze', address: '24 Vazha-Pshavela Ave', debt: '6.80' },
  { id: 'magti', category: 'internet', name: 'Magti', logo: 'magti.png', alias: 'magticom', demo: '555010203', subscriber: 'Nino Abashidze', address: '24 Vazha-Pshavela Ave', debt: '25.00' },
  { id: 'silknet', category: 'internet', name: 'Silknet', logo: 'silknet.svg', alias: 'silknet', demo: '599887766', subscriber: 'Nino Abashidze', address: '24 Vazha-Pshavela Ave', debt: '0.00' }
];

export const TEMPLATES = [
  { id: 'home-power', label: 'Home electricity', provider: 'telmico', number: '492312312' },
  { id: 'home-water', label: 'Home water', provider: 'gwp', number: '310228964' }
];

export const ACCOUNTS = [
  { id: 'main', card: 'dark', name: 'Main account', from: 'from Main account', suffix: '4821', balance: '1,240.50 ₾' },
  { id: 'daily', card: 'blue', name: 'Everyday account', from: 'from Everyday account', suffix: '2094', balance: '386.20 ₾' }
];

export const AGREEMENTS = [
  'Processing of my personal data',
  'Processing of my bill and debt data',
  'Identity check with the Ministry of Internal Affairs'
];

export const MONTHLY_FEE = '1.00 ₾';
export const OTP_LENGTH = 4;
export const DEMO_OTP = '4721';
export const NUMBER_MIN = 6;
export const NUMBER_MAX = 12;
export const LAST_DAY = 31;

export const RULES = {
  bill: { title: 'When a bill arrives', icon: 'lightning' },
  monthly: { title: 'On a set day', icon: 'calendar' }
};

/**
 * The whole flow lives in one resizing tray, like the China transfer: each
 * step sets the tray's height, so short steps stay short. One decision per
 * step; the title sits in the tray header.
 */
export const STEPS = {
  picker: { title: 'New automatic payment' },
  templates: { title: 'Templates' },
  categories: { title: 'Categories' },
  providers: { title: null },
  number: { title: 'Subscriber number' },
  rule: { title: 'When should we pay?' },
  limit: { title: 'Pay up to' },
  amount: { title: 'Monthly amount' },
  day: { title: 'Payment day' },
  review: { title: 'Review' },
  account: { title: 'Pay from' },
  agreements: { title: 'Before you activate' },
  terms: { title: 'Terms and conditions' },
  otp: { title: 'Enter code' }
};

// Keypad steps hand off with a gentler scale, like the transfer keypad.
export const KEYPAD_STEPS = ['number', 'limit', 'amount', 'otp'];

/**
 * Move to a step. Review is the hub: returning to it (after an edit, the
 * account or the agreements) pops back to the existing review instead of
 * stacking a second one, so Back from review still retraces the setup path.
 */
export function go(stack, step) {
  const at = stack.indexOf(step);
  return step === 'review' && at >= 0 ? stack.slice(0, at + 1) : [...stack, step];
}
export const back = stack => stack.length > 1 ? stack.slice(0, -1) : stack;
export const current = stack => stack.at(-1);
export const afterRule = rule => rule === 'bill' ? 'limit' : 'amount';

export function editNumber(value, key) {
  if (key === 'backspace') return value.slice(0, -1);
  if (!/^\d$/.test(key) || value.length >= NUMBER_MAX) return value;
  return value + key;
}
export const formatNumber = value => value.replace(/(\d{3})(?=\d)/g, '$1 ');
export const validNumber = value => value.length >= NUMBER_MIN;

export function queryProviders(query, category) {
  const text = query.trim().toLowerCase();
  return PROVIDERS.filter(provider => text
    ? `${provider.name} ${provider.alias}`.toLowerCase().includes(text)
    : provider.category === category);
}

export const dayCopy = day => day >= LAST_DAY ? 'On the last day of each month' : `On day ${day} of each month`;
export const money = minorText => `${minorText} ₾`;

const shortDay = day => day >= LAST_DAY ? 'Last day of the month' : `Day ${day} of each month`;

/** Review is a plain receipt: label and value, nothing hidden behind a tap. */
export function reviewRows({ provider, number, rule, amountText, day }) {
  return [
    // One row for who: the subscriber number, then the provider (the screen shows its logo).
    { label: 'Subscriber', value: `${formatNumber(number)} · ${provider.name}`, number: formatNumber(number) },
    { label: 'Pays', value: rule === 'bill' ? 'When a bill arrives' : shortDay(day) },
    { label: rule === 'bill' ? 'Up to' : 'Amount', value: money(amountText) }
  ];
}

const twoDecimals = text => `${Number(String(text).replace(/,/g, '') || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₾`;

/** A created order as it appears in the list: what it pays, how often, how much. */
export function orderSummary({ provider, number, rule, amountText, day }) {
  return {
    id: `${provider.id}-${number}-${Date.now()}`,
    provider: provider.id,
    title: provider.name,
    subtitle: rule === 'bill' ? 'When billed' : day >= LAST_DAY ? 'Last day each month' : `Day ${day} each month`,
    amount: rule === 'bill' ? `up to ${twoDecimals(amountText)}` : twoDecimals(amountText),
    number
  };
}

/**
 * Step layers for the tray handoff. Phases: 'idle' (first render, shown, no
 * entry), 'in' (entering), 'rest' (arrived; set by the component), 'out' (leaving). Never deletes a leaving
 * layer here (it is dropped when its transition ends), and never reorders, so
 * a layer turned back keeps its DOM node and its transition retargets.
 */
export function nextLayers(list, step, newId, now = 0) {
  const leaving = list.find(layer => layer.step === step && layer.phase === 'out');
  // outAt lets the caller sweep a layer that left before it was visible (no
  // transition runs from 0 to 0, so no transitionend arrives).
  const rest = list.map(layer => layer === leaving ? { ...layer, phase: 'in', outAt: undefined, inAt: now }
    : layer.phase === 'out' ? layer : { ...layer, phase: 'out', outAt: now });
  return leaving ? rest : [...rest, { id: newId, step, phase: 'in', inAt: now }];
}
