import './segmented-control.css';

/**
 * Credo segmented control: two or more views of one list (for example
 * Transfers | Payments). A pill slides under the chosen segment and the label
 * colours swap on the same 240 ms ease-out; under reduced motion it moves at
 * once. `options` is [{ id, label }]; `value` is the chosen id.
 */
export default function SegmentedControl({ options, value, onChange, label, className = '', ...props }) {
  const index = Math.max(0, options.findIndex(option => option.id === value));
  return <div className={`credo-segments ${className}`} role="tablist" aria-label={label}
    style={{ '--credo-segments-count': options.length, '--credo-segments-index': index }} {...props}>
    <span className="credo-segments__pill" aria-hidden="true" />
    {options.map(option => <button key={option.id} type="button" role="tab" aria-selected={option.id === value}
      onClick={() => onChange?.(option.id)}>{option.label}</button>)}
  </div>;
}
