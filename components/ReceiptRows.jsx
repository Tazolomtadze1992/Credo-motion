import './receipt-rows.css';

/**
 * Credo receipt rows: a label on the left and its value on the right, 32px
 * apart (the China transfer review). Values are plain text unless the flow
 * passes a control in `value`.
 *
 * @param {{ label: React.ReactNode, value: React.ReactNode, className?: string, key?: string }[]} rows
 */
export default function ReceiptRows({ rows, className = '', ...props }) {
  return <dl className={`credo-receipt ${className}`} {...props}>
    {rows.map(row => <div key={row.key ?? String(row.label)} className={`credo-receipt__row ${row.className ?? ''}`}>
      <dt>{row.label}</dt><dd>{row.value}</dd>
    </div>)}
  </dl>;
}
