// Auto lombard study (plan 007): data and pure flow helpers. Demo data only.
import { springs } from '../content/motion.mjs';
import { EDITOR_OMEGA } from './transfer-motion.mjs';

// Products tab: one colourful card per product, like Family's wallets
// (user request 2026-11-16). Each product owns a colour (category/* roles).
// `short` is the one-line card name (Family's cards never wrap); trays keep `name`.
export const PRODUCTS = [
  { id: 'accounts', name: 'Accounts and cards', short: 'Accounts', icon: 'wallet', color: 'ink', balance: '5,752.00 ₾' },
  { id: 'loans', name: 'Loans and installments', short: 'Loans', icon: 'hand-coins', color: 'blue', balance: '1,752.00 ₾' },
  { id: 'deposits', name: 'Deposits', short: 'Deposits', icon: 'piggy-bank', color: 'green', balance: '55,752.00 ₾' },
  { id: 'credit', name: 'Credit card', short: 'Credit card', icon: 'card', color: 'coral', balance: '2,752.00 ₾' },
  { id: 'limit', name: 'Installment limit', short: 'Installments', icon: 'shopping-bag', color: 'violet', balance: '2,456.00 ₾' },
  { id: 'insurance', name: 'Insurance', short: 'Insurance', icon: 'shield', color: 'teal', balance: '400.00 ₾' }
];

// New product: categories (same order as Products), then loan types, then car loans.
export const CATEGORIES = PRODUCTS.map(item => ({ ...item, glyph: item.id }));  // same order, glyphs and colours as the Products cards
// Each list item carries its glyph (New product lists, user request 2026-11-16:
// Family's option cards). Sub-lists take their parent's colour: every loan type
// and car loan is Loans blue (user decision 2026-11-17).
export const LOANS = [
  { id: 'digital', name: 'Digital loan', icon: 'smartphone', glyph: 'digital', color: 'blue' },
  { id: 'car', name: 'Car loan', icon: 'car', glyph: 'car', color: 'blue' },
  { id: 'student', name: 'Student loan', icon: 'graduation-cap', glyph: 'student', color: 'blue' },
  { id: 'startup', name: 'Startup loan', icon: 'rocket', glyph: 'startup', color: 'blue' },
  { id: 'mortgage', name: 'Mortgage', icon: 'home', glyph: 'mortgage', color: 'blue' },
  { id: 'history', name: 'Credit history repair', icon: 'file', glyph: 'history', color: 'blue' }
];
// Only Auto lombard has a subtitle: the term may be unfamiliar (user decision 2026-11-16).
export const CAR_LOANS = [
  { id: 'new', name: 'New car', icon: 'car', glyph: 'car', color: 'blue' },
  { id: 'used', name: 'Used car', icon: 'car-front', glyph: 'used', color: 'blue' },
  { id: 'lombard', name: 'Auto lombard', icon: 'hand-coins', glyph: 'lombard', color: 'blue', subtitle: 'Money against your car' }
];

// "You will need": three things, in the order they are needed, each with its
// own illustration (art: certificate, car, camera) and one line on why.
// Titles only, no second line (user 2026-11-17).
export const NEEDS = [
  { icon: 'file', text: 'Car registration certificate' },
  { icon: 'car', text: 'Your car, in good light' },
  { icon: 'camera', text: 'Your phone camera' }
];

export const INSURERS = [
  { id: 'aldagi', name: 'Aldagi', logo: 'insurer-aldagi.png', rate: '0.78%' },
  { id: 'imedi', name: 'Imedi L', logo: 'insurer-imedi.png', rate: '0.78%' },
  { id: 'euronis', name: 'Euronis', logo: 'insurer-euronis.png', rate: '0.78%' }
];

// Ten photos, as in the current flow: six outside, four inside. The VIN photo
// keeps the user's VIN guide (photos path only).
export const PHOTOS = [
  { id: 'front', group: 'outside', label: 'Front' },
  { id: 'back', group: 'outside', label: 'Back' },
  { id: 'left', group: 'outside', label: 'Left side' },
  { id: 'right', group: 'outside', label: 'Right side' },
  { id: 'engine', group: 'outside', label: 'Engine' },
  { id: 'trunk', group: 'outside', label: 'Trunk' },
  { id: 'cabin', group: 'inside', label: 'Front seats' },
  { id: 'rear', group: 'inside', label: 'Back seats' },
  { id: 'dashboard', group: 'inside', label: 'Dashboard, engine on' },
  { id: 'vin', group: 'inside', label: 'VIN', guide: 'vin' }
];

export const CONSENTS = [
  'Processing of my personal data',
  'Checking my data with the Ministry of Internal Affairs',
  'Checking the debtors’ register',
  'Checking my tax debts',
  'Checking my credit history with Creditinfo'
];

export const TERMS = [6, 12, 18, 24, 36, 48];  // months, demo range (user decision 2026-11-16)
export const AMOUNT_MIN = 500, AMOUNT_MAX = 20000;
export const ANNUAL_RATE = 0.24;
export const DEMO_OTP = '4721', OTP_LENGTH = 4;

/** Effective annual rate from the nominal one, compounded monthly. */
export const effectiveRate = (annual = ANNUAL_RATE) => (1 + annual / 12) ** 12 - 1;

/** Monthly annuity payment in GEL for an amount in GEL. */
export function monthlyPayment(amount, months, annual = ANNUAL_RATE) {
  if (!(amount > 0) || !(months > 0)) return 0;
  const r = annual / 12;
  return amount * r / (1 - (1 + r) ** -months);
}

export const formatGel = value => `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₾`;
export const formatPercent = value => `${(value * 100).toFixed(2)}%`;

export const amountInRange = value => value >= AMOUNT_MIN && value <= AMOUNT_MAX;

/** Stack navigation: forward pushes, back pops (never below the first screen). */
export const go = (stack, screen) => [...stack, screen];
export const back = stack => stack.length > 1 ? stack.slice(0, -1) : stack;
export const current = stack => stack[stack.length - 1];
/** Return to an earlier screen in the stack (an edit from the review returns to it). */
export const returnTo = (stack, screen) => {
  const index = stack.lastIndexOf(screen);
  return index < 0 ? stack : stack.slice(0, index + 1);
};

// Loaded when the tray opens (plan 010 G4, user 2026-11-17): the three guide
// pictures and the demo photo the upload slots fill with, so none of them
// paints after its step or its done state has arrived.
export const PRELOAD_IMAGES = ['guide-id.jpg', 'guide-video.jpg', 'guide-vin.jpg', 'car-photo.jpg'];

// Tray spring per move (plan 010 G5). Show your car <-> Car photos is the
// longest move in any flow (462 px). Recorded on 2026-11-17, it matched China's
// Custom amount <-> Review before China's fix, so it gets the same ω 42 (user:
// "Yes, the 462 px move"). Every other move keeps the shared tray spring.
const FAST_MOVES = [['method', 'photos']];
export function trayOmega(from, to) {
  return FAST_MOVES.some(([a, b]) => (from === a && to === b) || (from === b && to === a)) ? EDITOR_OMEGA : springs.tray.omega;
}
