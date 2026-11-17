import { colorGroups, colorTokens, contrastRatio, credoColorStyle, ramps } from '../../../content/colors';
import { credoTypographyStyle } from '../../../content/typography';
import { PRODUCTS } from '../../../lib/auto-lombard-flow.mjs';
import ProductGlyph from '../../../components/ProductGlyph';
import ProductCard, { ProductCards } from '../../../components/ProductCard';
import '../design-system.css';
import './colors.css';

export const metadata = {
  title: 'Colors · Credo Motion Lab',
  description: 'Credo colour ramps in OKLCH and the roles that point at them.'
};

const RAMP_NOTES = {
  coral: 'Highlight · 500 is #FC6250',
  blue: 'Accent · 500 is #1E6E91',
  gray: 'Neutral',
  red: 'Danger',
  green: 'Success · 500 is #2E734B',
  violet: 'Category · 500 is #6E4EB3',
  teal: 'Category · 500 is #277469'
};

// Tier 1: the ramps. White or black label per step, whichever measures higher.
function Ramps() {
  return Object.entries(ramps).map(([name, steps]) => <section className="color-ramp" key={name} aria-label={`${name} ramp`}>
    <h3>{name}<small>{RAMP_NOTES[name]}</small></h3>
    <ol className="color-ramp__steps">{steps.map(item => {
      const light = contrastRatio('#FFFFFF', item.hex) >= contrastRatio('#000000', item.hex);
      return <li key={item.step} style={{ '--swatch': item.value, color: light ? '#fff' : '#000' }}>
        <strong>{item.step}</strong>
        <code>{item.hex}</code>
      </li>;
    })}</ol>
  </section>);
}

const CATEGORY_GROUP = 'Category colours';

// Tier 2: the roles, one row each. Category colours have their own section.
function Roles() {
  return colorGroups.filter(([name]) => name !== CATEGORY_GROUP).map(([name, tokens]) => <section className="color-roles" key={name}>
    <h3>{name}</h3>
    <ul>
      {tokens.map(({ role, ref, hex, alpha, value, use }) => <li key={role}>
        <span className="color-roles__swatch" style={{ '--swatch': value }} aria-hidden="true" />
        <strong>{role}</strong>
        <code>{ref ?? `${hex}${alpha !== undefined ? ` · ${alpha * 100}%` : ''}`}</code>
        <small>{use}</small>
      </li>)}
    </ul>
  </section>);
}

// The product cards as they appear on Products: one colour per product.
function Categories() {
  return <ProductCards className="color-categories">
    {PRODUCTS.map(product => {
      const token = colorTokens[`category/${product.color}`];
      return <ProductCard key={product.id} icon={<ProductGlyph name={product.id} />} color={product.color}
        title={product.short} detail={`category/${product.color} · ${token.ref ?? token.hex}`} />;
    })}
  </ProductCards>;
}

export default function ColorsPage() {
  return <main className="credo-type-page" style={{ ...credoTypographyStyle, ...credoColorStyle }}>
    <header className="type-header">
      <h1>Colors</h1>
      <p>Components use roles. Roles point at ramp steps.</p>
    </header>
    <section className="type-scale" aria-labelledby="color-ramps">
      <h2 id="color-ramps">Ramps</h2>
      <Ramps />
    </section>
    <section className="type-scale" aria-labelledby="color-roles">
      <h2 id="color-roles">Roles</h2>
      <Roles />
    </section>
    <section className="type-scale" aria-labelledby="color-categories">
      <h2 id="color-categories">Category</h2>
      <p>One colour per product, all at the same lightness. Names are white; details are white at 75%. Rules are in the <a href="/design-system/patterns/product-colours">Product colours</a> pattern.</p>
      <Categories />
    </section>
  </main>;
}
