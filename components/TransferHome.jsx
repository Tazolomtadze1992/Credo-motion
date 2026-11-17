import './transfer-home.css';

// The Credo home screen behind the China transfer tray (Figma "Home", node
// 63:3281 in the design-system file; English copy by the user's choice,
// 2026-11-16). Static demo content: only Transfer is live, and it opens the tray.
const asset = name => `/assets/home/${name}`;

const ACTIONS = [
  ['add-money.svg', 'Add money'],
  ['transfer.svg', 'Transfer'],
  ['zap.svg', 'Fast transfer'],
  ['mobile-top-up.svg', 'Mobile top-up']
];
const UPCOMING = [
  ['installment.svg', 'Installment', '45.00 ₾', 'In 2 days'],
  ['fee.svg', 'Service fee', '5.00 ₾', 'In 3 days']
];
const OFFERS = [
  { images: ['offer-car-insurance-1.png', 'offer-car-insurance-2.png'], badge: '-20%', tone: 'positive', label: 'Car insurance', selected: true },
  { images: ['offer-car-loan-1.png', 'offer-car-loan-2.png'], badge: 'Cashback', tone: 'primary', label: 'Car loan' },
  { images: ['offer-nikora-1.png', 'offer-nikora-2.png', 'offer-nikora-3.png'], badge: 'Loyalty', tone: 'informative', label: 'Pay at Nikora' },
  { images: ['offer-mastercard-1.png', 'offer-mastercard-2.png'], badge: 'Cashback', tone: 'primary', label: 'Mastercard offer' }
];
const TABS = [
  ['tab-home.svg', 'Home'],
  ['tab-products.svg', 'Products'],
  ['tab-operations.svg', 'Operations'],
  ['tab-finances.svg', 'Finances'],
  ['tab-more.svg', 'More']
];

const Img = ({ name, size, className = '' }) => <img className={className} src={asset(name)} alt="" width={size} height={size} draggable="false" />;

/** @param {{ onTransfer: (event: React.MouseEvent) => void }} props */
export default function TransferHome({ onTransfer }) {
  return <div className="home">
    <img className="home-backdrop" src={asset('background.svg')} alt="" width="390" height="600" draggable="false" />

    <header className="home-nav">
      <div className="home-user">
        <img className="home-avatar" src={asset('avatar.png')} alt="" width="40" height="40" draggable="false" />
        <p><span>Hello</span><strong>Giorgi</strong></p>
      </div>
      <div className="home-nav__buttons" aria-hidden="true">
        <span className="home-circle"><Img name="search.svg" size="20" /></span>
        <span className="home-circle"><Img name="chat.svg" size="20" /></span>
        <span className="home-circle home-circle--whatsapp"><Img name="whatsapp.svg" size="20" /></span>
      </div>
    </header>

    <div className="home-content">
      <div className="home-top">
      <section className="home-balance" aria-label="My money">
        <span>My money</span>
        <p><strong>••••••</strong><Img name="eye.svg" size="20" /></p>
      </section>

      <div className="home-cards">
        <div className="home-cards__row">
          <article className="home-card">
            <div className="home-card__top">
              <p className="home-card__name">Salary<Img name="star.svg" size="12" /></p>
              <span className="home-card__digital">Digital</span>
            </div>
            <div className="home-card__money">
              <strong>2,500.00 ₾</strong>
              <div className="home-card__chips"><span>300.00₾</span><span>200.00$</span><span>400.00€</span></div>
              <p className="home-card__number">•••• 1234<img src={asset('mastercard.svg')} alt="" width="19" height="12" draggable="false" /></p>
            </div>
          </article>
          <div className="home-card-request" aria-hidden="true"><Img name="add-card.svg" size="24" /><span>Request a card</span></div>
        </div>
        <img className="home-dots" src={asset('carousel-dots.svg')} alt="" width="32" height="8" draggable="false" />
      </div>

      <nav className="home-actions" aria-label="Quick actions">
        {ACTIONS.map(([icon, label]) => {
          const live = label === 'Transfer';
          return <button key={label} type="button" className="home-action" onClick={live ? onTransfer : undefined} disabled={!live} aria-disabled={!live || undefined}>
            <span className="home-action__circle"><Img name={icon} size="20" /></span>
            <span>{label}</span>
          </button>;
        })}
      </nav>
      </div>

      <div className="home-sheet">
        <section className="home-panel home-upcoming" aria-label="Upcoming payments">
          <h2>Upcoming payments</h2>
          {UPCOMING.map(([icon, title, amount, due]) => <div className="home-transaction" key={title}>
            <span className="home-transaction__icon"><Img name={icon} size="20" /></span>
            <span className="home-transaction__text"><span><span>{title}</span><b>{amount}</b></span><small>{due}</small></span>
          </div>)}
          <p className="home-link">See all</p>
        </section>

        <section className="home-panel home-offers" aria-label="Offers">
          <h2>Offers</h2>
          <div className="home-offers__row">
            {OFFERS.map(offer => <div className="home-offer" data-selected={offer.selected || undefined} key={offer.label}>
              <div className="home-offer__inner">
                {offer.images.map(image => <img key={image} src={asset(image)} alt="" draggable="false" />)}
                <span className="home-offer__shade" />
                <span className="home-offer__badge" data-tone={offer.tone}>{offer.badge}</span>
                <span className="home-offer__label">{offer.label}</span>
              </div>
            </div>)}
          </div>
        </section>
      </div>
    </div>

    <nav className="home-tabs" aria-hidden="true">
      {TABS.map(([icon, label]) => <span className="home-tab" key={label}><Img name={icon} size="20" /><span>{label}</span></span>)}
    </nav>
  </div>;
}
