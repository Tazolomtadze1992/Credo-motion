import './product-card.css';

const CATEGORY = /^(ink|blue|green|coral|violet|teal)$/;

/**
 * Credo product card (Family's wallets; added 2026-11-17 from the auto lombard
 * study): one product on Products. A solid card in the product's category
 * colour, a white glyph top-left, then the name and one detail at the bottom.
 * The whole card is the tap target; without onClick it renders as a static div.
 *
 * `icon` is the glyph (<ProductGlyph name=… />); `color` is a category name
 * (ink, blue, green, coral, violet, teal); `detail` is one quieter line such
 * as the balance; `badge` is an optional short status. Lay cards out with
 * ProductCards (two columns, 12px gap).
 */
export default function ProductCard({ icon, color = 'blue', title, detail, badge, onClick, className = '', ...props }) {
  const fill = CATEGORY.test(color) ? `var(--credo-color-category-${color})` : color;
  const visual = <span className="credo-product-card__visual" style={{ '--product-color': fill }}>
    {icon}
    {badge && <span className="credo-product-card__badge">{badge}</span>}
    <span className="credo-product-card__text"><strong>{title}</strong>{detail && <span>{detail}</span>}</span>
  </span>;
  // Without onClick the card is a static specimen: a div, so it never looks tappable to assistive tech.
  if (!onClick) return <div className={`credo-product-card ${className}`} {...props}>{visual}</div>;
  return <button type="button" className={`credo-product-card ${className}`} onClick={onClick} {...props}>{visual}</button>;
}

/** Product cards in two columns with the standard 12px gap. */
export function ProductCards({ className = '', children, ...props }) {
  return <div className={`credo-product-cards ${className}`} {...props}>{children}</div>;
}
