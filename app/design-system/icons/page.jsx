import { credoColorStyle } from '../../../content/colors';
import { credoTypographyStyle } from '../../../content/typography';
import Icon, { ICONS, ICON_SIZES } from '../../../components/Icon';
import '../design-system.css';
import './icons.css';

export const metadata = {
  title: 'Icons · Credo Motion Lab',
  description: 'Credo icon names and the library glyph behind each one.'
};

const groups = [
  ['Navigation', ['back', 'chevron-right', 'chevron-down', 'close', 'more']],
  ['Actions', ['add', 'check', 'edit', 'search', 'repeat', 'transfer']],
  ['Objects', ['bank', 'card', 'globe', 'wallet', 'calendar', 'file', 'lock', 'home', 'products']],
  ['Status and Services', ['info', 'star', 'lightning', 'flame', 'drop', 'wifi']]
];

export default function IconsPage() {
  return <main className="credo-type-page" style={{ ...credoTypographyStyle, ...credoColorStyle }}>
    <header className="type-header">
      <h1>Icons</h1>
      <p>Use Credo names: <code>{'<Icon name="close" />'}</code>. Lucide draws them for now; changing library means editing one map.</p>
    </header>
    <section className="icon-group" aria-labelledby="icon-sizes">
      <h2 id="icon-sizes">Sizes</h2>
      <ul className="icon-sizes">
        {Object.entries(ICON_SIZES).map(([tier, { size, stroke, use }]) => <li key={tier}>
          <span className="icon-sizes__samples">{['close', 'back', 'chevron-right'].map(name => <Icon key={name} name={name} size={tier} />)}</span>
          <strong>{tier}</strong>
          <span>{size} px · {stroke} px stroke</span>
          <small>{use}</small>
        </li>)}
      </ul>
    </section>
    {groups.map(([title, names]) => <section key={title} className="icon-group" aria-labelledby={`icons-${title}`}>
      <h2 id={`icons-${title}`}>{title}</h2>
      <ul className="icon-grid">
        {names.map(name => <li key={name}>
          <span className="icon-grid__glyph"><Icon name={name} /></span>
          <span className="icon-grid__name">{name}</span>
          <span className="icon-grid__source">{ICONS[name].displayName}</span>
        </li>)}
      </ul>
    </section>)}
    <p className="icon-note">Gallery shown at the content size (24 / 2). Strokes stay heavy at small sizes, as measured in Family. Colour follows text. Decorative by default; pass <code>label</code> when the icon is the only content.</p>
  </main>;
}
