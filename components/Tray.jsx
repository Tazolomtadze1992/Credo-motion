import Icon from './Icon';
import { trayCloseAction } from '../lib/tray-close.mjs';
import './tray.css';

/** The round 40px icon button used for a tray's close and back actions. */
export function TrayIconButton({ className = '', children, ...props }) {
  return <button type="button" className={`credo-tray__icon-button ${className}`} {...props}>{children}</button>;
}

/**
 * Credo's bottom tray shell: header (optional leading control, title, close),
 * divider, body and footer. Geometry and motion stay with each flow: pass the
 * flow's classes for the parts its motion controller positions.
 *
 * `title` is the h2 content (one title, or stacked titles a flow crossfades).
 * `headerStart` is an optional leading control, usually a back TrayIconButton.
 * The round X (navigation-and-closing pattern): pass `onClose` always, and
 * `onBack` whenever there is a previous step. With `onBack` the X steps back
 * and is labelled "Back"; on the first step it closes. Trays have no back chevron.
 * `footer` renders after the body (the primary action, announcements).
 * Any other props (role, aria-*, ref, handlers, data-*) go on the <section>.
 */
export default function Tray({
  className = '', title, titleClassName = '', headerClassName = '', headerStart,
  onClose, onBack, closeLabel = 'Close', backLabel = 'Back', closeIcon, closeClassName = '',
  dividerClassName = '', bodyClassName = '', footer, children, ...props
}) {
  const close = trayCloseAction({ onBack, onClose, backLabel, closeLabel });
  return <section className={`credo-tray ${className}`} {...props}>
    <header className={`credo-tray__header ${headerClassName}`}>
      {headerStart}
      <h2 className={`credo-tray__title ${titleClassName}`}>{title}</h2>
      {close && <TrayIconButton className={`credo-tray__close ${closeClassName}`} data-action={close.kind} aria-label={close.label} onClick={close.onClick}>{closeIcon ?? <Icon name="close" size="small" className="credo-tray__close-icon" />}</TrayIconButton>}
    </header>
    <div className={`credo-tray__divider ${dividerClassName}`} aria-hidden="true" />
    <div className={`credo-tray__body ${bodyClassName}`}>{children}</div>
    {footer}
  </section>;
}
