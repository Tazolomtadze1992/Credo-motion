import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { credoColorStyle } from '../../../../content/colors';
import { credoTypographyStyle } from '../../../../content/typography';
import { componentBySlug, components } from '../registry';
import ComponentGuide from '../guides';
import '../../design-system.css';
import '../components.css';
import '../component-page.css';

export const dynamicParams = false;
export function generateStaticParams() { return components.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }) {
  const item = componentBySlug((await params).slug);
  return { title: `${item?.title ?? 'Component'} · Credo Motion Lab`, description: item?.description };
}

// One template for every component: title, one line, spec, live states, usage.
export default async function ComponentPage({ params }) {
  const item = componentBySlug((await params).slug);
  if (!item) notFound();
  const { Preview } = item;
  return <main className="credo-type-page ds-component" style={{ ...credoTypographyStyle, ...credoColorStyle }}>
    <header className="ds-component__header">
      <p className="ds-component__crumb"><Link href="/design-system/components">Components</Link></p>
      <h1>{item.title}</h1>
      <p>{item.description}</p>
    </header>
    <p className="component-spec">{item.spec}</p>
    <Suspense><Preview /></Suspense>
    <ComponentGuide slug={item.slug} />
    <section className="ds-component__usage" aria-label="Used in">
      <h2>Used in</h2>
      {item.usedIn.length
        ? <ul>{item.usedIn.map(study => <li key={study.href}><Link href={study.href}>{study.title}</Link></li>)}</ul>
        : <p>Not used in a study yet.</p>}
    </section>
  </main>;
}
