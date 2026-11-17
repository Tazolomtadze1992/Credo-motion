const PATHS = {
  back: <path d="m14 6-6 6 6 6" />,
  next: <path d="m10 6 6 6-6 6" />,
  down: <path d="m6 9 6 6 6-6" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  bolt: <path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z" />,
  flame: <path d="M12 22c4 0 7-2.7 7-6.7 0-3.5-2-5.4-4-7.3-.2 2-1.2 2.8-2.2 3.6.6-3.6-1.2-6.4-3.5-8.6C9.6 8.5 5 10.5 5 15.3 5 19.3 8 22 12 22Z" />,
  drop: <path d="M12 3c3.4 4.1 6 7.1 6 11a6 6 0 0 1-12 0c0-3.9 2.6-6.9 6-11Z" />,
  wifi: <path d="M3 9a15 15 0 0 1 18 0M6 13a10 10 0 0 1 12 0m-9 4a5 5 0 0 1 6 0m-3 3h.01" />,
  search: <><circle cx="10.8" cy="10.8" r="5.8" /><path d="m15 15 4 4" /></>,
  check: <path d="m5 12 4 4 10-10" />,
  calendar: <><rect x="4" y="6" width="16" height="14" rx="3" /><path d="M8 4v4m8-4v4M4 11h16m-11 4h.01m3 0h.01m3 0h.01" /></>,
  wallet: <><rect x="3.5" y="6" width="17" height="12" rx="3" /><path d="M4 10h16m-12 4h3" /></>,
  repeat: <path d="M4 10V8a3 3 0 0 1 3-3h12m-4-3 4 3-4 3m5 6v2a3 3 0 0 1-3 3H5m4-3-4 3 4 3" />,
  edit: <><path d="m5 15-1 5 5-1L19 9l-4-4L5 15Zm8-8 4 4" /><path d="m15 5 1-1a2 2 0 0 1 3 0l1 1a2 2 0 0 1 0 3l-1 1" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" /></>,
  file: <><path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9l-6-6Z" /><path d="M13 3v6h6M9 13h6m-6 4h6" /></>,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9L12 3Z" />,
};

export function Icon({ name, size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{PATHS[name]}</svg>;
}

export function Mark({ icon, tone = 'accent' }) {
  return <span className="pp-mark" data-tone={tone}><Icon name={icon} /></span>;
}

export function Row({ icon, tone, title, subtitle, trailing, onClick, selected, className = '' }) {
  const content = <>
    {icon && <Mark icon={icon} tone={tone} />}
    <span className="pp-row-copy"><strong>{title}</strong>{subtitle && <small>{subtitle}</small>}</span>
    {trailing ?? (selected ? <Icon name="check" size={19} /> : onClick && <Icon name="next" size={17} />)}
  </>;
  const classes = `pp-row ${className}`;
  return onClick
    ? <button type="button" className={classes} aria-pressed={selected} onClick={onClick}>{content}</button>
    : <div className={classes}>{content}</div>;
}

export function Identity({ provider, number, name, edit }) {
  return <div className="pp-identity">
    <Mark icon={provider.icon} tone={provider.tone} />
    <span className="pp-row-copy"><strong>{provider.name}</strong><small>{name} · {number}</small></span>
    {edit && <button type="button" className="pp-icon-button" aria-label="აბონენტის ნომრის შეცვლა" onClick={edit}><Icon name="edit" size={17} /></button>}
  </div>;
}

export function Field({ label, value, onChange, onSubmit, placeholder, inputMode, suffix, error, autocomplete = 'off' }) {
  return <label className="pp-field">
    <span>{label}</span>
    <span className="pp-input-wrap">
      <input value={value} onChange={event => onChange(event.target.value)} onKeyDown={event => {
        if (event.key === 'Enter' && onSubmit) { event.preventDefault(); onSubmit(); }
      }} placeholder={placeholder} inputMode={inputMode} autoComplete={autocomplete} aria-invalid={Boolean(error)} />
      {suffix && <b aria-hidden="true">{suffix}</b>}
    </span>
    {error && <small role="alert">{error}</small>}
  </label>;
}

export function ValueRow({ label, value, onClick }) {
  if (onClick) return <button type="button" className="pp-value-row" onClick={onClick}><span>{label}</span><strong>{value}</strong><Icon name="next" size={15} /></button>;
  return <div className="pp-value-row"><span>{label}</span><strong>{value}</strong></div>;
}
