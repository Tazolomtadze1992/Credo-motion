'use client';

import { useRef, useState } from 'react';
import { cubicBezier, curves, durations, springs } from '../../../content/motion.mjs';
import { sampleSurface } from '../../../lib/transfer-motion.mjs';

// Each curve plays at the duration it is used with, so the demo is honest.
const CURVES = [
  ['easeOut', 'out', durations.backdropIn, 'All tray content changes (one curve across the flow), arrivals, backdrop fades, the recent-transfer reveal.'],
  ['easeOutExpo', 'out-expo', durations.digitMorph, 'Amount digits as you type, and exits that should get out of the way.'],
  ['easeOutQuad', 'out-quad', durations.press, 'Press feedback on keys, rows and buttons; short fades and content moves.'],
  ['drawer', 'drawer', durations.trayOpen, 'Opening and closing a tray from the screen edge.'],
  ['textSwap', 'text-swap', durations.textSwap, 'Button and status label swaps (Torph). Evenly paced, no jump at the start.']
];

const DURATIONS = [
  ['press', 'Press scale in and out'], ['digitMorph', 'Amount digits as you type'], ['textSwap', 'Button and status label swaps'],
  ['trayOpen', 'Tray slides up'], ['trayClose', 'Tray slides down'], ['backdropIn', 'Backdrop dims'], ['backdropOut', 'Backdrop clears'],
  ['reduced', 'Opacity-only replacement under reduced motion'], ['spinner', 'One spinner revolution']
];
const kebab = name => name.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`);

function bezierPath([x1, y1, x2, y2]) {
  const s = 100;
  return `M0 ${s} C${x1 * s} ${s - y1 * s} ${x2 * s} ${s - y2 * s} ${s} 0`;
}

// Critically damped spring from 0 to 1; returns [seconds, value] samples.
function springSamples(omega) {
  const points = [];
  for (let step = 0; step <= 90; step++) points.push([step * .005, sampleSurface(0, 0, 1, step * .005, omega).value]);
  return points;
}

export default function MotionPreview() {
  const [slow, setSlow] = useState(false);
  const dots = useRef({});
  const springDot = useRef(null);
  const factor = slow ? 4 : 1;

  function play(names) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    for (const name of names) {
      const dot = dots.current[name];
      const [, , ms] = CURVES.find(([key]) => key === name);
      if (!dot) continue;
      const travel = dot.parentElement.clientWidth - 8 - dot.clientWidth;
      dot.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${travel}px)` }],
        { duration: reduce ? 0 : ms * factor, easing: cubicBezier(name), fill: 'forwards' });
    }
  }
  function playSpring() {
    const dot = springDot.current; if (!dot) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const travel = dot.parentElement.clientWidth - 8 - dot.clientWidth;
    let start = null;
    const frame = now => {
      start ??= now;
      const seconds = reduce ? 1 : (now - start) / 1000 / factor;
      const { value, moving } = sampleSurface(0, 0, 1, seconds, springs.tray.omega);
      dot.style.transform = `translateX(${value * travel}px)`;
      if (moving && !reduce) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  const samples = springSamples(springs.tray.omega);
  const settle = samples.find(([, v]) => v > .995)?.[0];

  return <>
    <div className="motion-toolbar">
      <button type="button" onClick={() => { play(CURVES.map(([key]) => key)); playSpring(); }}>Play all</button>
      <label><input type="checkbox" checked={slow} onChange={event => setSlow(event.target.checked)} /> Slow ×4</label>
    </div>

    <section aria-labelledby="motion-curves">
      <h2 id="motion-curves">Curves</h2>
      <ul className="motion-grid">
        {CURVES.map(([key, css, ms, use]) => <li key={key}>
          <svg className="motion-plot" viewBox="-6 -6 112 112" aria-hidden="true">
            <path d="M0 100 L100 0" className="motion-plot__linear" />
            <path d={bezierPath(curves[key])} className="motion-plot__curve" />
          </svg>
          <div className="motion-card__body">
            <strong>{key}</strong>
            <code>--credo-ease-{css}</code>
            <span className="motion-values">[{curves[key].join(', ')}] · shown at {ms} ms</span>
            <p>{use}</p>
            <button type="button" className="motion-track" onClick={() => play([key])} aria-label={`Play ${key}`}>
              <span ref={node => { dots.current[key] = node; }} className="motion-dot" />
            </button>
          </div>
        </li>)}
      </ul>
    </section>

    <section aria-labelledby="motion-springs">
      <h2 id="motion-springs">Springs</h2>
      <ul className="motion-grid">
        <li>
          <svg className="motion-plot" viewBox="-6 -6 112 112" aria-hidden="true">
            <path d="M0 100 L100 0" className="motion-plot__linear" />
            <path className="motion-plot__curve" d={`M${samples.map(([t, v]) => `${(t / .45 * 100).toFixed(2)} ${(100 - v * 100).toFixed(2)}`).join(' L')}`} />
          </svg>
          <div className="motion-card__body">
            <strong>tray</strong>
            <code>springs.tray.omega</code>
            <span className="motion-values">ω {springs.tray.omega} rad/s · critically damped · 99.5% at {Math.round(settle * 1000)} ms</span>
            <p>A tray resizing between steps. Never overshoots, and keeps its speed when a new step interrupts it.</p>
            <button type="button" className="motion-track" onClick={playSpring} aria-label="Play tray spring">
              <span ref={springDot} className="motion-dot" />
            </button>
          </div>
        </li>
      </ul>
    </section>

    <section aria-labelledby="motion-durations">
      <h2 id="motion-durations">Durations</h2>
      <table className="motion-table">
        <tbody>
          {DURATIONS.map(([key, use]) => <tr key={key}>
            <th scope="row">{key}</th>
            <td>{durations[key]} ms</td>
            <td><code>--credo-duration-{kebab(key)}</code></td>
            <td>{use}</td>
          </tr>)}
        </tbody>
      </table>
    </section>
  </>;
}
