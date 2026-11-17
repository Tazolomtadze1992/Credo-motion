import Link from 'next/link';
import { patterns } from '../../../content/patterns';
import '../overview.css';

export const metadata = {
  title: 'Patterns · Credo Motion Lab',
  description: 'Rules that span components: tray flows, closing, copy, selection and motion handoffs.'
};

export default function PatternsIndex() {
  return <main className="ds-overview">
    <header className="ds-overview__header">
      <h1>Patterns</h1>
      <p>Rules that span components. Decided rules are followed without asking.</p>
    </header>
    <ul className="ds-index">
      {patterns.map(pattern => {
        const decided = pattern.practices.filter(practice => practice.status === 'decided').length;
        return <li key={pattern.slug}>
          <Link className="ds-index__item" href={`/design-system/patterns/${pattern.slug}`}>
            <strong>{pattern.title}</strong>
            <span>{pattern.description}</span>
            <small>{decided} decided · {pattern.practices.length - decided} proposed</small>
          </Link>
        </li>;
      })}
    </ul>
  </main>;
}
