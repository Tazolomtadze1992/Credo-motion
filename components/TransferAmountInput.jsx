'use client';

import { TextMorph } from 'torph/react';

// The real, keypad-controlled input remains the accessible value. Torph only
// owns the visible layer, following Numora's input-overlay integration pattern.
export default function TransferAmountInput({ value, label, active, animate }) {
  return <div className="transfer-amount-input">
    <div aria-hidden="true" className="transfer-amount-display">
      <TextMorph className="transfer-amount-morph" as="span" cursorIndex={value.length}
        duration={180} ease="cubic-bezier(0.19,1,0.22,1)" disabled={!animate}
        respectReducedMotion>{value}</TextMorph>
    </div>
    <input aria-label={label} value={value} readOnly inputMode="none"
      tabIndex={active ? 0 : -1} />
  </div>;
}
