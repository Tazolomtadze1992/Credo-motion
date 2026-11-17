import { Icon, Row } from './UI';
import { RULES } from './data.mjs';

export default function CredoRule({ kind, choose, fields }) {
  return <>
    <h3 className="pp-section-title pp-question">როდის გინდა გადახდა?</h3>
    <div className="pp-rule-options">
      {Object.entries(RULES).map(([id, rule]) => <Row key={id} icon={rule.icon} title={rule.title} selected={kind === id} onClick={() => choose(id)}
        trailing={<span className="pp-radio" data-selected={kind === id}>{kind === id && <Icon name="check" size={12} />}</span>} />)}
    </div>
    {kind && <div className="pp-rule-fields" key={kind}>{fields}</div>}
  </>;
}
