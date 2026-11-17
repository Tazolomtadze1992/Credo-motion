import Link from 'next/link';
import { components } from './registry';
import '../overview.css';

export const metadata = {
  title: 'Components · Credo Motion Lab',
  description: 'Shared Credo components and their interaction states.'
};

// Index: one tile per component (name, one line, where it is used).
export default function ComponentsIndex() {
  return <main className="ds-overview">
    <header className="ds-overview__header">
      <h1>Components</h1>
      <p>{components.length} shared components, each with its states.</p>
    </header>
    <ul className="ds-index">
      {components.map(item => <li key={item.slug}>
        <Link className="ds-index__item" href={`/design-system/components/${item.slug}`}>
          <strong>{item.title}</strong>
          <span>{item.description}</span>
          <small>{item.usedIn.length ? item.usedIn.map(study => study.title).join(' · ') : 'Design system only'}</small>
        </Link>
      </li>)}
    </ul>
  </main>;
}
