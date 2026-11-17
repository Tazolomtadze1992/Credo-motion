import './primary-button.css';

export function PrimaryButtonSpinner({ className = '' }) {
  return <svg className={`credo-primary-spinner ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a9 9 0 0 1 9 9" />
  </svg>;
}

export function PrimaryButtonCheck({ className = '', pathClassName }) {
  return <svg className={`credo-primary-check ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="currentColor" />
    <path className={pathClassName} pathLength="100" d="m7.5 12 3 3 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

export default function PrimaryButton({
  children,
  className = '',
  visualClassName = '',
  surfaceClassName = '',
  type = 'button',
  busy = false,
  disabled = false,
  success = false,
  variant = 'primary',
  blend = false,
  ...props
}) {
  return <button
    {...props}
    className={`credo-primary-button ${className}`}
    data-variant={variant === 'primary' ? undefined : variant}
    type={type}
    disabled={disabled || busy}
    aria-busy={busy || undefined}
    data-busy={busy || undefined}
    data-success={success || undefined}
    data-blend={blend || undefined}
  >
    <span className={`credo-primary-button__visual ${visualClassName}`}>
      <span className={`credo-primary-button__surface ${surfaceClassName}`}>
        {children}
      </span>
    </span>
  </button>;
}
