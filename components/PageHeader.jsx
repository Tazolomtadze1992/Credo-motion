import Icon from './Icon';
import './page-header.css';

/**
 * Credo page header: a back control, a centred title (Tray title type) and an
 * empty slot that keeps the title centred. Pass `onBack` to make the back
 * control a real button; without it the chevron is decoration (prototypes).
 * Each screen positions the header (top offset, height, divider) with its own
 * class. `back={false}` leaves the slot empty for a tab's root screen
 * (Products); the title stays centred.
 */
export default function PageHeader({ title, onBack, back: showBack = true, backLabel = 'Back', className = '', ...props }) {
  const back = <Icon name="back" size="nav" />;
  return <header className={`credo-page-header ${className}`} {...props}>
    {!showBack ? <span className="credo-page-header__back" aria-hidden="true" />
      : onBack
      ? <button type="button" className="credo-page-header__back" aria-label={backLabel} onClick={onBack}>{back}</button>
      : <span className="credo-page-header__back" aria-hidden="true">{back}</span>}
    <h1 className="credo-page-header__title">{title}</h1>
    <span className="credo-page-header__end" aria-hidden="true" />
  </header>;
}
