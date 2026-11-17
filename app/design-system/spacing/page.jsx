import { credoColorStyle } from '../../../content/colors';
import { credoTypographyStyle } from '../../../content/typography';
import { scale, roles, px, BUTTON_HEIGHT } from '../../../content/spacing.mjs';
import '../design-system.css';
import './spacing.css';

export const metadata = {
  title: 'Spacing · Credo Motion Lab',
  description: 'Credo spacing tokens: a 4px scale and the layout roles trays and lists use.'
};

const Tag = ({ status }) => <span className="sp-tag" data-status={status}>{status === 'decided' ? 'Decided' : 'Proposed'}</span>;

// A tray drawn from the role tokens, so the picture changes when a token does.
function TrayAnatomy() {
  const header = px('tray', 'header'), top = px('tray', 'content-top'), gap = px('list', 'row-gap');
  const toAction = px('tray', 'content-to-action'), home = px('tray', 'home-inset'), gutter = px('tray', 'gutter');
  const rows = [0, 1, 2].map(i => header + top + i * (40 + gap));
  const contentEnd = rows[2] + 40, buttonTop = contentEnd + toAction, height = buttonTop + BUTTON_HEIGHT + home;
  const band = (y, h, label, kind) => <div className="sp-band" data-kind={kind} style={{ top: y, height: h }}><span>{label}</span></div>;
  return <figure className="sp-anatomy">
    <div className="sp-tray" style={{ height, '--g': `${gutter}px` }}>
      <div className="sp-tray__title" style={{ top: px('tray', 'close-inset') + 20 - 9 }}>Review</div>
      <div className="sp-tray__close" style={{ top: px('tray', 'close-inset') }} />
      <div className="sp-tray__divider" style={{ top: header - 1 }} />
      {rows.map(y => <div key={y} className="sp-tray__row" style={{ top: y }}><i /><b /></div>)}
      <div className="sp-tray__button" style={{ top: buttonTop }} />
      {band(header, top, `content-top ${top}`, roles.tray['content-top'].status)}
      {band(contentEnd, toAction, `content-to-action ${toAction}`, roles.tray['content-to-action'].status)}
      {band(buttonTop + BUTTON_HEIGHT, home, `home-inset ${home}`, roles.tray['home-inset'].status)}
      {band(rows[0] + 40, gap, `row-gap ${gap}`, roles.list['row-gap'].status)}
      <div className="sp-gutter" />
      <div className="sp-gutter sp-gutter--right" />
    </div>
    <figcaption>Drawn from the tokens. Green bands are decided, amber are proposed. The side bands are the {gutter}px gutter.</figcaption>
  </figure>;
}

export default function SpacingPage() {
  return <main className="credo-type-page" style={{ ...credoTypographyStyle, ...credoColorStyle }}>
    <header className="type-header">
      <h1>Spacing</h1>
      <p>A 4px scale and the layout roles built on it. Screens use roles (<code>--credo-tray-content-top</code>), roles point at the scale (<code>--credo-space-4</code>). JavaScript imports <code>content/spacing.mjs</code>. Both flows and the shared components use these tokens.</p>
    </header>

    <section>
      <h2 className="sp-h2">Tray anatomy</h2>
      <TrayAnatomy />
    </section>

    <section>
      <h2 className="sp-h2">Scale <Tag status="decided" /></h2>
      <p className="sp-note">Steps of 4px. These seven sizes cover almost all spacing in both flows today (24, 12, 8, 16 and 4 are the most used).</p>
      <ul className="sp-scale">{Object.entries(scale).map(([n, value]) => <li key={n}>
        <code>space-{n}</code><span className="sp-scale__value">{value}px</span><span className="sp-scale__bar" style={{ width: value * 4 }} />
      </li>)}</ul>
    </section>

    {Object.entries(roles).map(([group, items]) => <section key={group}>
      <h2 className="sp-h2">{group === 'tray' ? 'Tray roles' : 'List roles'}</h2>
      <table className="sp-table">
        <thead><tr><th>Token</th><th>Value</th><th>Use</th><th>Status</th></tr></thead>
        <tbody>{Object.entries(items).map(([name, token]) => <tr key={name}>
          <td><code>{group}/{name}</code></td>
          <td>{token.px == null ? 'Not set' : `${token.px}px`}{token.step ? <small> space-{token.step}</small> : null}</td>
          <td>{token.use}</td>
          <td><Tag status={token.status} /><small className="sp-source">{token.source}</small></td>
        </tr>)}</tbody>
      </table>
    </section>)}

    <section>
      <h2 className="sp-h2">How it’s checked</h2>
      <p className="sp-note">A test (<code>tests/spacing-guard.test.mjs</code>) fails when a margin, padding or gap in either flow or a shared component uses a raw pixel value. The few that stay raw are listed there, each with its reason: optical, emphasis, page or component. <code>scripts/measure-tray-spacing.js</code> measures the open tray step in the browser to what you see.</p>
    </section>

    <section>
      <h2 className="sp-h2">Rules</h2>
      <ul className="sp-rules">
        <li><Tag status="decided" /><span>Measure to what you see: a row’s icon, a field’s fill, the top of the letters, not a line box or hit area.</span></li>
        <li><Tag status="decided" /><span>A tray step’s first visible content starts 16px below the divider.</span></li>
        <li><Tag status="decided" /><span>Use a role when one fits; use the scale for spacing inside a component; never a raw number.</span></li>
        <li><Tag status="decided" /><span>Optical adjustments (a −3px nudge to align a mark with text) stay as named, commented exceptions, not tokens.</span></li>
      </ul>
    </section>
  </main>;
}
