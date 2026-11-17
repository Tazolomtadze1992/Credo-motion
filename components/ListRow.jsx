import Icon from './Icon';
import './list-row.css';

/**
 * Credo's list row: a 40px leading icon or logo, a title (optionally with a
 * subtitle), an optional badge and a trailing control (a chevron by default;
 * pass `trailing={false}` for none). With `onClick` the row is a button with
 * the shared press feedback (`data-pointer-pressed` from the flow).
 *
 * The leading circle is Credo blue for every row (`tone` is ignored); logos
 * and avatars keep their own colours.
 *
 * Options added for the auto lombard study (2026-11-16, Proposed):
 * - `plain`: information, not a choice. The icon has no circle and uses the
 *   secondary icon colour, so it never looks tappable.
 * - `value`: a figure on the right (balance, rate), in the receipt value type.
 * - `size="large"`: a taller option row for a big choice with a subtitle.
 */
export default function ListRow({ leading, tone, plain = false, value, size, children, subtitle, badge, trailing, onClick, className = '', ...props }) {
  const leadingClass = `credo-row__leading${tone ? ` credo-row__leading--${tone}` : ''}`;
  const contents = <>
    {leading != null && <span className={leadingClass}>{leading}</span>}
    {subtitle == null
      ? <span className="credo-row__title">{children}</span>
      : <span className="credo-row__title credo-row__title--stacked">{children}<small className="credo-row__subtitle">{subtitle}</small></span>}
    {badge}
    {value != null && <span className="credo-row__value">{value}</span>}
    {trailing !== false && !(plain && trailing == null) && <span className="credo-row__trailing">{trailing ?? <Icon name="chevron-right" size="trailing" />}</span>}
  </>;
  const classes = `credo-row${plain ? ' credo-row--plain' : ''}${size === 'large' ? ' credo-row--large' : ''}`;
  return onClick
    ? <button className={`${classes} credo-row--interactive ${className}`} type="button" onClick={onClick} {...props}><span className="credo-row__visual">{contents}</span></button>
    : <div className={`${classes} ${className}`} {...props}><span className="credo-row__visual">{contents}</span></div>;
}

/**
 * A stack of list rows with Credo's standard 12px gap (China tray lists, the
 * design system). Use it wherever rows are stacked so spacing never depends on
 * a flow's own container. `as` picks the element (div by default).
 */
export function ListRows({ as: Tag = 'div', className = '', children, ...props }) {
  return <Tag className={`credo-row-list ${className}`} {...props}>{children}</Tag>;
}

/**
 * Round selection mark for a row's `trailing` (Family's choose-chains mark in
 * Credo blue): an outline circle; when selected, a filled circle with the
 * check grows from the centre (200 ms on the textSwap curve, the fit to the
 * Family video) and shrinks back faster when deselected. `shape="square"`
 * is the consent checkbox (rounded square); round is pick-one.
 */
export function SelectMark({ selected, shape = 'round' }) {
  return <span className="credo-select" data-selected={selected || undefined} data-shape={shape} aria-hidden="true">
    {/* Family's check, traced from their video: a longer short arm and a
        corner just left of centre (not the library check). Its stroked bounds
        are centred in the circle (x 5.8–20.2, y 7.9–18.5 of 26). The round mark
        is drawn in a 40 px box, the same box as the tray's X button, so both
        round to the same device pixels at any zoom. */}
    <span className="credo-select__fill">{shape === 'round'
      ? <svg viewBox="-7 -7 40 40" width="40" height="40" aria-hidden="true"><path d="M7.1 13.2 11.4 17.2 18.9 9.2" /></svg>
      : <svg viewBox="0 0 26 26" width="26" height="26" aria-hidden="true"><path d="M7.1 13.2 11.4 17.2 18.9 9.2" /></svg>}</span>
  </span>;
}
