export const credoTypefaceName = 'Inter';
const credoTypeface = `"${credoTypefaceName}", "Helvetica Neue", Arial, sans-serif`;

export const typography = {
  title: { name: 'Tray title', size: 18, leading: 18, weight: 550, textCase: 'none', caseLabel: 'Title case', sample: 'Select the Payment Method', use: 'Tray titles and result headings' },
  option: { name: 'Option label', size: 15, leading: 15, weight: 550, textCase: 'none', caseLabel: 'Title case', sample: 'International Transfer', use: 'Transfer choices, payment methods and preset amounts' },
  body: { name: 'Body text', size: 17, leading: 24, weight: 450, sample: 'Your bill is paid on the day it arrives, up to the limit you set.', use: 'Text that wraps to several lines: terms, longer explanations' },
  supporting: { name: 'Supporting text', size: 15, leading: 20, weight: 450, sample: 'Review your details and try again.', use: 'Receipt field names, amount hints and result instructions' },
  'receipt-label': { name: 'Receipt label', size: 14, leading: 14, weight: 400, sample: 'Recipient', use: 'Review labels: same size as the value, one weight lighter, secondary colour' },
  'receipt-value': { name: 'Receipt value', size: 14, leading: 14, weight: 500, sample: 'David Sarajishvili', use: 'Review amount, recipient, payment method and Edit' },
  action: { name: 'Primary action', size: 18, leading: 18, weight: 550, textCase: 'none', caseLabel: 'Title case', sample: 'Confirm Transfer', use: 'The main button and its processing and success labels' },
  amount: { name: 'Amount display', size: 40, leading: 52, weight: 600, tracking: 0.02, tabular: true, sample: '1,234.56', use: 'Custom amount and large totals in pending or failure states' },
  keypad: { name: 'Keypad number', size: 24, leading: 28, weight: 400, tabular: true, sample: '1   2   3', use: 'Numeric input keys' },
  display: { name: 'Display number', size: 80, leading: 80, weight: 700, tracking: -0.025, tabular: true, sample: '15', use: 'The day on the Payment day calendar' },
  eyebrow: { name: 'Eyebrow', size: 16, leading: 20, weight: 600, tracking: 0.094, textCase: 'uppercase', caseLabel: 'Uppercase', sample: 'On the', use: 'Small uppercase labels, such as the calendar header' },
  code: { name: 'Code digit', size: 26, leading: 26, weight: 600, tabular: true, sample: '4 7 2 1', use: 'One-time code boxes' },
  badge: { name: 'Compact badge', size: 13, leading: 16, weight: 500, italic: true, textCase: 'uppercase', sample: 'Fast', use: 'The speed badge on Transfer to China' }
};

export function createCredoTypographyStyle(roles = typography) {
  return Object.fromEntries([
    ['--credo-typeface', credoTypeface],
    ...Object.entries(roles).flatMap(([role, { size, leading, weight, italic, tracking = 0, textCase = 'none', tabular }]) => [
      [`--credo-type-${role}`, `${italic ? 'italic ' : ''}${weight} ${size}px/${leading}px var(--credo-typeface)`],
      [`--credo-type-${role}-size`, `${size}px`],
      [`--credo-type-${role}-weight`, String(weight)],
      [`--credo-type-${role}-leading`, `${leading}px`],
      [`--credo-type-${role}-tracking`, `${tracking}em`],
      [`--credo-type-${role}-case`, textCase],
      [`--credo-type-${role}-numbers`, tabular ? 'tabular-nums' : 'normal']
    ]),
    // Inline actions (China's Edit, the Terms link) use the receipt type at this weight.
    ['--credo-type-receipt-edit-weight', String(receiptEditWeight)]
  ]);
}

export const receiptEditWeight = 600;
export const credoTypographyStyle = {
  ...createCredoTypographyStyle(),
  '--credo-type-receipt-edit-weight': receiptEditWeight
};
