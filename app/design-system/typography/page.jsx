import { credoTypefaceName, credoTypographyStyle, receiptEditWeight, typography } from '../../../content/typography';
import { credoColorStyle } from '../../../content/colors';
import { ACTION_COPY, VIEWS } from '../../../lib/transfer-flow.mjs';
import PrimaryButton from '../../../components/PrimaryButton';
import '../design-system.css';

export const metadata = {
  title: 'Typography · Credo Motion Lab',
  description: 'The typography roles used in the China Transfer study.'
};

function MethodPicker() {
  return <article className="type-specimen">
    <h3 className="type-specimen__label">Method picker</h3>
    <div className="type-tray">
      <div className="type-tray__header">
        <p className="type-title">{VIEWS.china.title}</p>
        <span className="type-close" aria-hidden="true"><img src="/assets/transfers/close.svg" alt="" /></span>
      </div>
      <ul className="type-methods">
        {[['alipay', 'Alipay'], ['wechat', 'WechatPay']].map(([icon, name]) =>
          <li className="type-option" key={icon}>
            <img src={`/assets/transfers/${icon}.png`} alt="" width="40" height="40" />
            <span>{name}</span>
            <img className="type-chevron" src="/assets/transfers/chevron.svg" alt="" width="20" height="20" />
          </li>
        )}
      </ul>
    </div>
  </article>;
}

function Receipt() {
  return <article className="type-specimen">
    <h3 className="type-specimen__label">{VIEWS.review.title}</h3>
    <div className="type-tray">
      <div className="type-tray__header">
        <p className="type-title">{VIEWS.review.title}</p>
        <span className="type-close" aria-hidden="true"><img src="/assets/transfers/close.svg" alt="" /></span>
      </div>
      <dl className="type-receipt">
        <div>
          <dt className="type-supporting">Amount</dt>
          <dd className="type-receipt-value"><span className="credo-inline-action">Edit</span><strong>$1,234.56</strong></dd>
        </div>
        <div><dt className="type-supporting">Recipient</dt><dd className="type-receipt-value">David Sarajishvili</dd></div>
        <div><dt className="type-supporting">Pay with</dt><dd className="type-receipt-value">Alipay</dd></div>
      </dl>
      <PrimaryButton>{ACTION_COPY.confirm}</PrimaryButton>
    </div>
  </article>;
}

export default function DesignSystemPage() {
  return <main className="credo-type-page" style={{ ...credoTypographyStyle, ...credoColorStyle }}>
    <header className="type-header">
      <h1>Typography</h1>
      <p>Credo’s text roles, applied to the China Transfer flow.</p>
    </header>

    <section aria-labelledby="in-context">
      <h2 id="in-context">In context</h2>
      <div className="type-specimens">
        <MethodPicker />
        <Receipt />
      </div>
    </section>

    <section className="type-scale" aria-labelledby="text-styles">
      <h2 id="text-styles">Text styles</h2>
      <p>{credoTypefaceName}. Specs show size, line height, weight and letter spacing.</p>
      <dl className="type-roles">
        {Object.entries(typography).map(([role, token]) => <div key={role}>
          <dt>
            <strong>{token.name}</strong>
            <small>{token.size} / {token.leading} px · {token.weight}{token.italic && ' italic'}</small>
            {token.caseLabel && <small>{token.caseLabel}</small>}
            {role === 'receipt-value' && <small>Edit weight {receiptEditWeight}</small>}
            <small>Letter spacing {token.tracking
              ? `${token.tracking * 100}% · ${token.tracking * token.size} px at ${token.size} px`
              : '0 px'}</small>
          </dt>
          <dd>
            <span className={`type-${role}`}>{token.sample}</span>
            <small>{token.use}</small>
          </dd>
        </div>)}
      </dl>
    </section>
  </main>;
}
