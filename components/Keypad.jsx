import Icon from './Icon';
import './keypad.css';

// Credo's numeric amount keypad: 1–9, decimal point, 0 and delete.
// Press feedback comes from the flow's pointer handling (`data-pointer-pressed`
// on the pressed button), like the other tappable Credo controls.
export const KEYPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'];

export const keypadKeyLabel = key => key === 'backspace' ? 'Delete digit' : key === '.' ? 'Decimal point' : key;

/**
 * @param {(key: string, event: MouseEvent) => void} onKey  called with '0'–'9', '.' or 'backspace'
 * @param {React.ReactNode} [deleteIcon]  a right-pointing chevron; it is rotated to point left
 * @param {(key: string) => object} [keyProps]  extra attributes per key (for example a
 *   showcase pressed state: `data-pointer-pressed`, or `data-preview-focus`)
 */
export default function Keypad({ onKey, label = 'Amount keypad', deleteIcon, disabled = false, keyProps, className = '' }) {
  return <div className={`credo-keypad ${className}`} role="group" aria-label={label}>
    {KEYPAD_KEYS.map(key => <button type="button" key={key} aria-label={keypadKeyLabel(key)} disabled={disabled} {...keyProps?.(key)} onClick={event => onKey?.(key, event)}>
      <span className="credo-keypad__visual">
        {key === 'backspace' ? <span className="credo-keypad__delete">{deleteIcon ?? <Icon name="chevron-right" size="nav" />}</span> : key}
      </span>
    </button>)}
  </div>;
}
