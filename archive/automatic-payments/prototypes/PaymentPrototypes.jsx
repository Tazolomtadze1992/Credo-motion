'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import PaymentFlow from './PaymentFlow';

const VARIANTS = [
  { id: 'credo', label: 'Credo' },
  { id: 'family', label: 'Family' },
  { id: 'aave', label: 'Aave' },
];

export default function PaymentPrototypes({ statusAssets }) {
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [replay, setReplay] = useState(0);
  const highlight = useRef(null);
  const buttons = useRef([]);

  useLayoutEffect(() => {
    const url = new URL(location.href);
    const params = url.protocol === 'file:' ? new URLSearchParams(url.hash.slice(1)) : url.searchParams;
    const requested = Number(params.get('v'));
    if (Number.isInteger(requested) && requested >= 1 && requested <= VARIANTS.length) setActive(requested - 1);
    let nextFrame;
    const frame = requestAnimationFrame(() => { nextFrame = requestAnimationFrame(() => setReady(true)); });
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(nextFrame); };
  }, []);

  useLayoutEffect(() => {
    function moveHighlight() {
      const button = buttons.current[active];
      highlight.current.style.width = `${button.offsetWidth}px`;
      highlight.current.style.transform = `translateX(${button.offsetLeft}px)`;
    }
    moveHighlight();
    window.addEventListener('resize', moveHighlight);
    return () => window.removeEventListener('resize', moveHighlight);
  }, [active]);

  function select(index) {
    const url = new URL(location.href);
    if (index === active) setReplay(value => value + 1);
    else setActive(index);
    if (url.protocol === 'file:') url.hash = `v=${index + 1}`;
    else url.searchParams.set('v', index + 1);
    history.replaceState(null, '', url);
  }

  useEffect(() => {
    function keydown(event) {
      if (event.defaultPrevented || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable ||
        event.metaKey || event.ctrlKey || event.altKey) return;
      const number = Number(event.key);
      if (number >= 1 && number <= VARIANTS.length) select(number - 1);
      else if (event.key === 'ArrowRight') select((active + 1) % VARIANTS.length);
      else if (event.key === 'ArrowLeft') select((active - 1 + VARIANTS.length) % VARIANTS.length);
      else if (event.key.toLowerCase() === 'r') setReplay(value => value + 1);
    }
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  }, [active]);

  return <main className="pp-workbench" data-variant={VARIANTS[active].id}>
    <nav className="proto-picker" data-position="top" data-ready={ready ? '' : undefined} aria-label="Prototype variants">
      <span ref={highlight} className="proto-picker-highlight" aria-hidden="true" />
      {VARIANTS.map((variant, index) => <button key={variant.id} ref={node => { buttons.current[index] = node; }}
        type="button" className="proto-picker-item" data-active={active === index ? '' : undefined}
        aria-current={active === index ? 'true' : undefined} onClick={() => select(index)}>{variant.label}</button>)}
      <span className="proto-picker-divider" aria-hidden="true" />
      <button type="button" className="proto-picker-item proto-picker-replay" aria-label="Replay animation (R)" onClick={() => setReplay(value => value + 1)}>↻</button>
    </nav>
    <PaymentFlow key={`${active}-${replay}`} variant={VARIANTS[active].id} statusAssets={statusAssets} />
  </main>;
}
