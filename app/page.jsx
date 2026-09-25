import Link from 'next/link';
import { studies } from '../content/studies';

export default function Home() {
  return (
    <main className="lab-home">
      <div className="lab-home__content">
        <p className="lab-home__eyebrow">Motion studies / {String(studies.length).padStart(3, '0')}</p>
        <h1>Credo Motion Lab</h1>
        <p className="lab-home__intro">Interaction studies for moments that deserve a little more care. Each study is interactive, with timing controls you can explore yourself.</p>
        <div className="study-list">
          {studies.map(study => <Link className="study-card" href={study.href} key={study.href}>
            <span className="study-card__number">{study.number}</span>
            <span className="study-card__copy"><strong>{study.title}</strong><span>{study.description}</span></span>
            <span className="study-card__arrow" aria-hidden="true">↗</span>
          </Link>)}
        </div>
        <p className="lab-home__footer">More studies will appear here as they are ready.</p>
      </div>
    </main>
  );
}
