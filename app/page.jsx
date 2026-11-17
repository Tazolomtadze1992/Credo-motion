import Link from 'next/link';
import { studies } from '../content/studies';

// Home: a heading and the studies as screens. Images are captures of each
// study's first screen (public/assets/studies, 600 px wide).
export default function Home() {
  return <main className="lab-home">
    <header className="lab-home__header">
      <h1>Credo Motion Lab</h1>
      <p>{studies.length} studies</p>
    </header>
    <ul className="lab-home__grid">
      {studies.map(study => <li key={study.href}>
        <Link className="lab-tile" href={study.href}>
          <span className="lab-tile__screen"><img src={study.image} alt="" width="600" height="1311" loading="lazy" /></span>
          <span className="lab-tile__title">{study.title}</span>
        </Link>
      </li>)}
    </ul>
  </main>;
}
