'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { navigation } from '../content/navigation';

/**
 * One sidebar on every page (Geist-style): studies, design-system pages and
 * components, the current page highlighted. Below 900 px it becomes a drawer
 * behind a menu button.
 */
export default function LabSidebar() {
  const pathname = usePathname();
  const [hash, setHash] = useState('');
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const read = () => setHash(window.location.hash);
    read(); window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);
  useEffect(() => { setOpen(false); }, [pathname, hash]);
  useEffect(() => {
    if (!open) return;
    const close = event => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);
  const current = href => {
    const [path, anchor] = href.split('#');
    return path === pathname && (!anchor || `#${anchor}` === hash);
  };
  return <>
    <button type="button" className="lab-menu" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}>
      <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M3 6h14M3 10h14M3 14h14" /></svg>
    </button>
    <div className="lab-scrim" data-open={open || undefined} onClick={() => setOpen(false)} aria-hidden="true" />
    <nav className="lab-sidebar" data-open={open || undefined} aria-label="Credo Motion Lab">
      <Link className="lab-sidebar__home" href="/" aria-current={pathname === '/' ? 'page' : undefined}>
        <span className="lab-sidebar__mark" aria-hidden="true" />Credo Motion Lab
      </Link>
      {navigation.map(group => <div className="lab-sidebar__group" key={group.label}>
        <p className="lab-sidebar__label">{group.label}</p>
        <ul>{group.items.map(item => <li key={item.href}>
          <Link href={item.href} aria-current={current(item.href) ? 'page' : undefined}
            onClick={() => { const anchor = item.href.split('#')[1]; if (anchor) setHash(`#${anchor}`); }}>{item.title}</Link>
        </li>)}</ul>
      </div>)}
    </nav>
  </>;
}
