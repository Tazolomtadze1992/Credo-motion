import Icon from './Icon';
import './search-field.css';

/**
 * Credo search field: a quiet 44 px field with a search icon, the input, and a
 * clear button once there is text. Controlled: pass `value` and `onChange`
 * (receives the new string).
 */
export default function SearchField({ value, onChange, placeholder = 'Search', label = placeholder, clearLabel = 'Clear search', className = '' }) {
  return <label className={`credo-search ${className}`}>
    <Icon name="search" size="small" />
    <input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} aria-label={label} />
    {value && <button type="button" aria-label={clearLabel} onClick={() => onChange('')}><Icon name="close" size="small" /></button>}
  </label>;
}
