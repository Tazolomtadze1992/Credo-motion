// Portfolio fixtures only. No banking API, exchange rate or fee is represented.
export const CURRENCY = 'USD';
export const CURRENCY_SYMBOL = '$';
export const MAX_AMOUNT = 50_000;
export const RECIPIENT_NAME = 'David Sarajishvili';
export const PRESETS = [20, 50, 100, 200, 500];
export const SHEET_HEIGHT = 676;
export const VIEWS = {
  options: { title: 'How would you transfer?', height: 378 },
  china: { title: 'Select the payment method', height: 262, back: true },
  amount: { title: 'Choose amount', height: 402, back: true, action: 'continue' },
  custom: { title: 'Custom amount', height: 612, back: true, money: true, action: 'continue' },
  review: { title: 'Review transfer', height: 350, back: true, receipt: true, action: 'confirm' },
  processing: { title: 'Transfer status', height: 314, receipt: true, status: true, action: 'sending' },
  success: { title: 'Transfer status', height: 314, receipt: true, status: true, action: 'done' },
  failure: { title: 'Transfer unsuccessful', height: 500, context: true, money: true, action: 'retry' },
  pending: { title: 'Transfer pending', height: 500, context: true, money: true, action: 'check' }
};
export const VIEW_KEYS = Object.keys(VIEWS);
export const METHODS = {
  alipay: { label: 'Alipay', asset: 'alipay' },
  wechat: { label: 'WechatPay', asset: 'wechat' }
};

export function backTarget(view, origin = 'amount') {
  return { china: 'options', amount: 'china', custom: 'amount', review: origin }[view] ?? null;
}

function parseMinor(value) {
  const [whole, fraction = ''] = String(value).split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}

export function amountToMinor(value) {
  if (!/^\d{1,6}(\.\d{0,2})?$/.test(String(value))) return 0;
  const minor = parseMinor(value);
  return minor <= MAX_AMOUNT * 100 ? minor : 0;
}

export function editAmount(value, key) {
  if (key === 'clear') return '0';
  if (key === 'backspace') return value.slice(0, -1) || '0';
  if (key === '.') return value.includes('.') ? value : `${value}.`;
  if (!/^\d$/.test(key)) return value;
  const next = value === '0' ? key : value + key;
  return /^\d{1,6}(\.\d{0,2})?$/.test(next) && parseMinor(next) <= MAX_AMOUNT * 100 ? next : value;
}

export function formatInput(value) {
  const [whole, fraction] = value.split('.');
  const number = Number(whole).toLocaleString('en-US');
  return fraction === undefined ? number : `${number}.${fraction}`;
}

export function formatAmount(minor) {
  return (minor / 100).toLocaleString('en-US', { minimumFractionDigits: minor % 100 ? 2 : 0, maximumFractionDigits: 2 });
}

// An independent simulated response drives state; motion completion never does.
export function simulateTransfer({ method, amountMinor, outcome, signal, delay = 1600 }) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException('Aborted', 'AbortError')); return; }
    const onAbort = () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve({ method, amountMinor, status: outcome, reference: 'DEMO-001' });
    }, delay);
    signal.addEventListener('abort', onAbort, { once: true });
  });
}
