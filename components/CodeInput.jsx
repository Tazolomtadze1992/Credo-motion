import './code-input.css';

/**
 * Credo code input: one box per digit of a one-time code. The next empty box
 * is outlined; a digit pops in (scale .85 → 1, 180 ms easeOutExpo) as it is
 * typed. Display only: the flow's keypad edits `value`.
 */
export default function CodeInput({ value = '', length = 4, className = '' }) {
  return <div className={`credo-code ${className}`} role="status" aria-label={`${value.length} of ${length} digits entered`}>
    {Array.from({ length }, (_, index) => <span key={index} data-filled={index < value.length || undefined}
      data-active={index === value.length || undefined}>{value[index] ?? ''}</span>)}
  </div>;
}
