/** Best practices with Decided / Proposed tags (components and patterns). */
export default function Practices({ practices }) {
  return <section className="ds-guide__practices">
    <h2>Best practices</h2>
    <ul>{practices.map(({ status, text, source }) => <li className="ds-guide__practice" data-status={status} key={text}>
      <span className="ds-guide__tag">{status === 'decided' ? 'Decided' : 'Proposed'}</span>
      <span>{text}{source && <small> · {source}</small>}</span>
    </li>)}</ul>
  </section>;
}
