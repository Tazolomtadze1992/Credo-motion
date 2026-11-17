import Link from 'next/link';
import { notFound } from 'next/navigation';
import { patternBySlug, patterns } from '../../../../content/patterns';
import { componentList } from '../../../../content/component-list';
import Practices from '../../Practices';
import '../../design-system.css';
import '../../components/component-page.css';

export const dynamicParams = false;
export function generateStaticParams() { return patterns.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }) {
  const pattern = patternBySlug((await params).slug);
  return { title: `${pattern?.title ?? 'Pattern'} · Credo Motion Lab`, description: pattern?.description };
}

const componentTitle = slug => componentList.find(item => item.slug === slug)?.title ?? slug;

// One template for every pattern: what it is, how it works, the rules, links.
export default async function PatternPage({ params }) {
  const pattern = patternBySlug((await params).slug);
  if (!pattern) notFound();
  return <main className="credo-type-page ds-component">
    <header className="ds-component__header">
      <p className="ds-component__crumb"><Link href="/design-system/patterns">Patterns</Link></p>
      <h1>{pattern.title}</h1>
      <p>{pattern.description}</p>
    </header>
    {pattern.sections.map(section => <section className="ds-guide__example" key={section.title}>
      <h2>{section.title}</h2>
      <p>{section.text}</p>
    </section>)}
    <Practices practices={pattern.practices} />
    <section className="ds-component__usage" aria-label="Components">
      <h2>Components</h2>
      <ul>{pattern.components.map(slug => <li key={slug}><Link href={`/design-system/components/${slug}`}>{componentTitle(slug)}</Link></li>)}</ul>
    </section>
    <section className="ds-component__usage ds-component__usage--tight" aria-label="Seen in">
      <h2>Seen in</h2>
      <ul>{pattern.usedIn.map(study => <li key={study.href}><Link href={study.href}>{study.title}</Link></li>)}</ul>
    </section>
  </main>;
}
