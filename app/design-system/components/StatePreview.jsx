'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

// The component workbench: a state switcher (kept in the URL), a canvas and a
// one-line description. Arrow keys step the preview last pointed at or
// focused; H hides every switcher (for clean screenshots).
const arrowDirections = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 };
let activePreview = '__state';

function selectState(param, id) {
  const url = new URL(window.location.href);
  url.searchParams.set(param, id);
  window.history.replaceState(null, '', url);
}

/**
 * @param {string} param  URL search parameter holding the selected state id
 * @param {{label: string, states: {id: string, label: string, detail: string}[]}[]} groups
 * @param {(active: object) => React.ReactNode} children  renders the canvas for a state
 */
export default function StatePreview({ param, name, groups, canvasHeight = 172, children }) {
  const states = groups.flatMap(group => group.states);
  const requestedState = useSearchParams().get(param);
  const active = states.find(state => state.id === requestedState) ?? states[0];
  const [hideSwitcher, setHideSwitcher] = useState(false);
  const height = typeof canvasHeight === 'function' ? canvasHeight(active) : canvasHeight;
  const rootRef = useRef(null);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
        event.target.closest?.('input, textarea, select, [contenteditable]')) return;
      if (event.key.toLowerCase() === 'h') {
        setHideSwitcher(hidden => !hidden);
      } else if (arrowDirections[event.key] && activePreview === param) {
        event.preventDefault();
        const next = (states.indexOf(active) + arrowDirections[event.key] + states.length) % states.length;
        selectState(param, states[next].id);
      }
    }
    const claim = () => { activePreview = param; };
    const root = rootRef.current;
    root?.addEventListener('pointerdown', claim);
    root?.addEventListener('focusin', claim);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      root?.removeEventListener('pointerdown', claim);
      root?.removeEventListener('focusin', claim);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [active, param, states]);

  return <div className="component-workbench" ref={rootRef}>
    <div className="component-layout" data-hide-switcher={hideSwitcher || undefined}>
      <nav className="component-switcher" aria-label={`${name} states`}>
        {groups.map(group => <div key={group.label} role="group" aria-label={group.label}>
          <span className="component-switcher__group">{group.label}</span>
          {group.states.map(state => <button type="button" key={state.id} aria-pressed={active.id === state.id} onClick={() => selectState(param, state.id)}>{state.label}</button>)}
        </div>)}
      </nav>
      <label className="component-select">
        <span>State</span>
        <select value={active.id} onChange={event => selectState(param, event.target.value)}>
          {groups.map(group => <optgroup key={group.label} label={group.label}>
            {group.states.map(state => <option key={state.id} value={state.id}>{state.label}</option>)}
          </optgroup>)}
        </select>
      </label>
      <div className="component-stage" style={height === 172 ? undefined : { gridTemplateRows: `${height}px minmax(44px, auto)` }}>
        <div className="component-canvas">{children(active)}</div>
        <p className="component-state-detail" aria-live="polite">{active.detail}</p>
      </div>
    </div>
  </div>;
}
