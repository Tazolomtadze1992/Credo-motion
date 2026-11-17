import './option-card.css';

/**
 * Credo option card (Family's option cards; added 2026-11-16 from the auto
 * lombard study): one choice in a list of choices. A light grey container,
 * a 48px circle in the item's colour with a white glyph, the title and an
 * optional line. The whole card is the tap target, so it has no chevron.
 *
 * `icon` is the glyph (for products, <ProductGlyph name=… size={24} />);
 * `color` is a product colour name (ink, blue, green, coral, violet, teal)
 * or any CSS colour. Stack cards with OptionCards (12px gap).
 */
export default function OptionCard({ icon, color = 'blue', title, subtitle, onClick, className = '', ...props }) {
  const fill = /^(ink|blue|green|coral|violet|teal)$/.test(color) ? `var(--credo-color-category-${color})` : color;
  return <button type="button" className={`credo-option ${className}`} onClick={onClick} {...props}>
    <span className="credo-option__visual">
      <span className="credo-option__icon" style={{ '--option-color': fill }} aria-hidden="true">{icon}</span>
      <span className="credo-option__text"><strong>{title}</strong>{subtitle && <span>{subtitle}</span>}</span>
    </span>
  </button>;
}

/** A stack of option cards with the standard 12px gap. */
export function OptionCards({ className = '', children, ...props }) {
  return <div className={`credo-options ${className}`} {...props}>{children}</div>;
}
