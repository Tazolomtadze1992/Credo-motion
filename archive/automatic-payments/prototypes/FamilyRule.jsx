import { Row } from './UI';
import { RULES } from './data.mjs';

export default function FamilyRule({ kind, choose, fields, editing }) {
  if (editing) return <div className="pp-family-setting">
    <h3>{kind === 'bill' ? 'დააწესე ლიმიტი' : 'დაგეგმე გადახდა'}</h3>
    {fields}
  </div>;
  return <div className="pp-family-choices">
    {Object.entries(RULES).map(([id, rule]) => <Row key={id} icon={rule.icon} title={rule.title} subtitle={rule.description} onClick={() => choose(id)} />)}
  </div>;
}
