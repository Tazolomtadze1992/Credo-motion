import { Icon } from './UI';
import { RULES } from './data.mjs';

export default function AaveRule({ kind, choose, fields }) {
  return <>
    <div className="pp-aave-settings">{fields}</div>
    <div className="pp-timing-control" aria-label="გადახდის სიხშირე">
      {Object.entries(RULES).map(([id, rule]) => <button type="button" key={id} aria-pressed={kind === id} onClick={() => choose(id)}><Icon name={rule.icon} size={15} />{rule.short}</button>)}
    </div>
  </>;
}
