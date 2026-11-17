'use client';

import { TextMorph } from 'torph/react';
import { cubicBezier, durations } from '../content/motion.mjs';
import './amount-display.css';

// The real, keypad-controlled input remains the accessible value. Torph only
// owns the visible layer, following Numora's input-overlay integration pattern.
function AmountInput({ value, label, active, animate }) {
  return <div className="credo-amount__input">
    <div aria-hidden="true" className="credo-amount__display">
      <TextMorph className="credo-amount__morph" as="span" cursorIndex={value.length}
        duration={durations.digitMorph} ease={cubicBezier('easeOutExpo')} disabled={!animate}
        respectReducedMotion>{value}</TextMorph>
    </div>
    <input aria-label={label} value={value} readOnly inputMode="none"
      tabIndex={active ? 0 : -1} />
  </div>;
}

/**
 * Credo's large amount: currency symbol plus the morphing value, with an
 * optional caption under it (for example the maximum amount).
 * `value` is the already formatted string ("2,508.5").
 * `size="large"` is for full screens, where the tray size reads small
 * (user request 2026-11-16, Proposed): 1.4× the amount type. Trays keep the
 * default size.
 */
export default function AmountDisplay({ value, currency = '$', label, active = false, animate = false, compact, caption, size, className = '' }) {
  const isCompact = compact ?? value.length > 8;
  return <>
    <div className={`credo-amount ${className}`} data-compact={isCompact ? '' : undefined} data-size={size === 'large' ? 'large' : undefined}>
      <span className="credo-amount__number"><span className="credo-amount__currency">{currency}</span><AmountInput value={value} label={label} active={active} animate={animate} /></span>
    </div>
    {caption != null && <span className="credo-amount__caption">{caption}</span>}
  </>;
}
