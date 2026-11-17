import Icon from './Icon';
import CardArt from './CardArt';
import './account-field.css';

/**
 * Credo account field: where money comes from, on a quiet card. A small card
 * image, a label over the account name, the balance, and up/down chevrons
 * that open the account picker. Sits at the top of a review, above the
 * receipt rows.
 */
export default function AccountField({ label = 'From', name, amount, onClick, className = '', ...props }) {
  return <button type="button" className={`credo-account-field ${className}`} onClick={onClick} {...props}>
    <CardArt size="field" />
    <span className="credo-account-field__text"><small>{label}</small><span>{name}</span></span>
    {amount && <span className="credo-account-field__amount">{amount}</span>}
    <Icon name="select" size="content" className="credo-account-field__chevrons" />
  </button>;
}
