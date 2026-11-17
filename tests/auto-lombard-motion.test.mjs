import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Plan 010 (auto lombard motion), built 2026-11-17 at the user's request ("Yes, build G1–G3").
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('G1: "You will need" has no stagger of its own; the step handoff is its entrance', () => {
  assert.doesNotMatch(read('app/studies/auto-lombard/auto-lombard.css'), /al-need|\.al-needs/);
  assert.doesNotMatch(read('components/AutoLombardStudy.jsx'), /'--i'/);
});

test('G2: upload states move with interruptible transitions, only the spinner uses keyframes', () => {
  const css = read('components/upload-slot.css');
  assert.deepEqual(css.match(/@keyframes [\w-]+/g), ['@keyframes credo-upload-spin']);
  assert.match(css, /@starting-style/);
  // The done check uses SelectMark's motion: 200 ms textSwap, 60 ms after the photo.
  assert.match(css, /__mark \{ transition: transform 200ms var\(--credo-ease-text-swap\) 60ms, opacity 140ms var\(--credo-ease-text-swap\) 60ms/);
  assert.match(css, /__image \{ transition: opacity var\(--credo-duration-handoff-enter\) var\(--credo-ease-out\)/);
  assert.match(css, /background-color 150ms ease, box-shadow 150ms ease/);
  // Entries only run after a state change on screen, so Back does not replay them.
  assert.match(read('components/UploadSlot.jsx'), /data-live=\{live \|\| undefined\}/);
});

test('G3: a new Product Card badge fades in and grows from its corner', () => {
  // The study no longer shows the badge (user 2026-11-17); the component keeps the entry.
  assert.doesNotMatch(read('components/AutoLombardStudy.jsx'), /'Under review'/);
  const css = read('components/product-card.css');
  assert.match(css, /@starting-style \{ \.credo-product-card__badge \{ opacity: 0; transform: scale\(\.9\); \} \}/);
  assert.match(css, /__badge \{ transform-origin: top right; transition: opacity 240ms var\(--credo-ease-out\), transform 240ms/);
});

test('G4: every guide picture and demo photo loads when the tray opens', async () => {
  const { PRELOAD_IMAGES } = await import('../lib/auto-lombard-flow.mjs');
  const used = [...read('components/AutoLombardStudy.jsx').matchAll(/asset\('([\w-]+\.jpg)'\)/g)].map(match => match[1]);
  assert.deepEqual([...new Set(used)].sort(), [...PRELOAD_IMAGES].sort());
  assert.match(read('components/AutoLombardStudy.jsx'), /setOpen\(true\);\n\s+preloadImages\(PRELOAD_IMAGES\.map\(asset\)\)/);
});

test('G4: each image is requested once per page', async () => {
  const { preloadImages } = await import('../lib/preload-images.mjs');
  const made = [];
  const fake = () => { const image = { decode: () => Promise.resolve() }; made.push(image); return image; };
  assert.deepEqual(preloadImages(['/a.jpg', '/b.jpg'], fake), ['/a.jpg', '/b.jpg']);
  assert.deepEqual(preloadImages(['/a.jpg', '/b.jpg'], fake), []);
  assert.deepEqual(made.map(image => image.src), ['/a.jpg', '/b.jpg']);
});

test('G5: only Show your car ↔ Car photos gets China’s faster tray spring', async () => {
  const { trayOmega } = await import('../lib/auto-lombard-flow.mjs');
  const { springs } = await import('../content/motion.mjs');
  const { EDITOR_OMEGA } = await import('../lib/transfer-motion.mjs');
  assert.equal(trayOmega('method', 'photos'), EDITOR_OMEGA);
  assert.equal(trayOmega('photos', 'method'), EDITOR_OMEGA);
  for (const [from, to] of [['method', 'film'], ['start', 'amount'], ['amount', 'insurance'], ['photos', 'review'], ['photos', 'vin'], [null, 'category']]) {
    assert.equal(trayOmega(from, to), springs.tray.omega, `${from} → ${to}`);
  }
  // The shared hook defaults to the tray spring, so Automatic orders is unchanged.
  assert.match(read('components/TrayFlow.jsx'), /omega = springs\.tray\.omega, instant: instantRef \}\) \{/);
});

test('every text link taps at 44px without changing its layout', () => {
  assert.match(read('app/studies/automatic-orders/automatic-orders.css'), /\.ao-link::before \{[^}]*height: 44px/);
  assert.match(read('app/studies/auto-lombard/auto-lombard.css'), /\.al-edit::before \{[^}]*height: 44px/);
  assert.match(read('app/studies/transfers/transfers.css'), /\.transfer-edit-amount::before \{[^}]*height: max\(44px/);
});
