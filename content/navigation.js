import { studies } from './studies';
import { componentList as components } from './component-list';
import { patterns } from './patterns';

/** The lab's one navigation, shown in the sidebar on every page. */
export const navigation = [
  { label: 'Studies', items: studies.map(study => ({ title: study.title, href: study.href })) },
  { label: 'Design system', items: [
    { title: 'Overview', href: '/design-system' },
    { title: 'Typography', href: '/design-system/typography' },
    { title: 'Colors', href: '/design-system/colors' },
    { title: 'Motion', href: '/design-system/motion' },
    { title: 'Spacing', href: '/design-system/spacing' },
    { title: 'Icons', href: '/design-system/icons' }
  ] },
  { label: 'Patterns', items: patterns.map(pattern => ({ title: pattern.title, href: `/design-system/patterns/${pattern.slug}` })) },
  { label: 'Components', items: components.map(item => ({ title: item.title, href: `/design-system/components/${item.slug}` })) }
];
