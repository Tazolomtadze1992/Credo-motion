import { SelectMark } from './ListRow';
import './consent-list.css';

/**
 * Credo consent list: square SelectMark per agreement, each unticked until the
 * person ticks it (decided Selection rules). Moved from Automatic orders
 * (2026-11-16) so other flows share it. The flow keeps the action disabled
 * until every required box is ticked.
 */
export default function ConsentList({ items, checked, onChange, className = '' }) {
  return <div className={`credo-consents ${className}`}>{items.map((text, index) => <label key={text} className="credo-consent">
    <input type="checkbox" checked={checked[index]} onChange={event => onChange(index, event.target.checked)} />
    <SelectMark selected={checked[index]} shape="square" /><span>{text}</span>
  </label>)}</div>;
}
