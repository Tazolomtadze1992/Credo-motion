import Link from 'next/link';
import { credoColorStyle, colorTokens } from '../../content/colors';
import { credoTypographyStyle } from '../../content/typography';
import { curves } from '../../content/motion.mjs';
import Icon from '../../components/Icon';
import PrimaryButton from '../../components/PrimaryButton';
import { SelectMark } from '../../components/ListRow';
import './overview.css';

export const metadata = {
  title: 'Design system · Credo Motion Lab',
  description: 'Credo foundations and components, as used in the motion studies.'
};

// Small previews built from the real tokens and components, so the tiles stay
// true when the system changes.
const TypePreview = () => <div className="ds-o-type">
  <span style={{ font: 'var(--credo-type-title)' }}>How would you transfer?</span>
  <span style={{ font: 'var(--credo-type-option)' }}>Account Number</span>
  <span style={{ font: 'var(--credo-type-supporting)', color: 'var(--credo-color-text-secondary)' }}>Bills above this are skipped</span>
</div>;

// Distinct colours only (the secondary label shares the primary start's #1E6E91).
const SWATCHES = ['accent/solid', 'highlight/solid', 'success/solid', 'danger/icon', 'success/subtle', 'text/strong', 'text/secondary', 'bg/subtle'];
const ColorPreview = () => <div className="ds-o-colors">
  {SWATCHES.filter(role => colorTokens[role]).map(role => <span key={role} style={{ background: colorTokens[role].hex }} title={role} />)}
</div>;

function MotionPreview() {
  const [x1, y1, x2, y2] = curves.easeOut;
  const p = (x, y) => `${8 + x * 104} ${88 - y * 80}`;
  return <svg className="ds-o-curve" viewBox="0 0 120 96" aria-hidden="true">
    <path className="ds-o-curve__axis" d="M8 88H112M8 88V8" />
    <path className="ds-o-curve__line" d={`M${p(0, 0)} C${p(x1, y1)} ${p(x2, y2)} ${p(1, 1)}`} />
  </svg>;
}

// Spacing: the scale as bars.
const SpacingPreview = () => <div className="ds-o-space">{[4, 8, 12, 16, 24, 32, 40].map(v => <span key={v} style={{ width: v * 2 }} />)}</div>;

const ICONS = ['transfer', 'card', 'bank', 'wallet', 'calendar', 'search', 'lightning', 'wifi', 'drop', 'flame', 'globe', 'lock'];
const IconPreview = () => <div className="ds-o-icons">{ICONS.map(name => <Icon key={name} name={name} size="content" />)}</div>;

const ComponentPreview = () => <div className="ds-o-components">
  <PrimaryButton tabIndex={-1} aria-hidden="true">Continue</PrimaryButton>
  <div className="ds-o-components__marks"><SelectMark selected /><SelectMark /><SelectMark selected shape="square" /></div>
</div>;

// Patterns: three tray steps, one decision each.
const PatternPreview = () => <div className="ds-o-steps"><span /><span /><span /></div>;

const TILES = [
  { href: '/design-system/typography', title: 'Typography', text: 'Inter roles from tray titles to keypad digits.', preview: <TypePreview /> },
  { href: '/design-system/colors', title: 'Colors', text: 'Semantic colour roles with contrast checked.', preview: <ColorPreview /> },
  { href: '/design-system/motion', title: 'Motion', text: 'Curves, springs and durations shared by the flows.', preview: <MotionPreview /> },
  { href: '/design-system/spacing', title: 'Spacing', text: 'A 4px scale and the tray and list roles built on it.', preview: <SpacingPreview /> },
  { href: '/design-system/icons', title: 'Icons', text: 'One icon set in six size tiers.', preview: <IconPreview /> },
  { href: '/design-system/patterns', title: 'Patterns', text: 'Tray flows, closing, copy, selection and motion handoffs.', preview: <PatternPreview /> },
  { href: '/design-system/components', title: 'Components', text: 'Buttons, rows, trays and inputs with their states.', preview: <ComponentPreview /> }
];

export default function DesignSystemOverview() {
  return <main className="ds-overview" style={{ ...credoTypographyStyle, ...credoColorStyle }}>
    <header className="ds-overview__header">
      <h1>Design system</h1>
      <p>Credo foundations and components, as used in the motion studies.</p>
    </header>
    <ul className="ds-overview__grid">
      {TILES.map(tile => <li key={tile.href}>
        <Link className="ds-tile" href={tile.href}>
          <span className="ds-tile__preview" aria-hidden="true">{tile.preview}</span>
          <span className="ds-tile__copy"><strong>{tile.title}</strong><span>{tile.text}</span></span>
        </Link>
      </li>)}
    </ul>
  </main>;
}
