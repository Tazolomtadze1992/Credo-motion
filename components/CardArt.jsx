import './card-art.css';

/**
 * Credo card art: a small card image with a two-circle network mark, drawn in
 * CSS so it scales cleanly. One drawing at three sizes:
 * `chip` 20 × 13 (inside a receipt value), `thumb` 40 × 26 (a list row's
 * leading slot), `field` 44 × 28.6 (the Account field).
 * `finish` is the card colour: 'dark' or 'blue'. Stand-ins until real Credo
 * card artwork exists.
 */
export default function CardArt({ size = 'chip', finish = 'dark', className = '' }) {
  return <span className={`credo-card-art ${className}`} data-size={size} data-finish={finish} aria-hidden="true" />;
}
