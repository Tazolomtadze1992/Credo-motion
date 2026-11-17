import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

// Spacing guard (phase 4, 2026-11-14). Margin, padding and gap in the two
// flows and the shared components must use a spacing token
// (--credo-space-*, --credo-tray-*, --credo-list-*). A raw px value is allowed
// only when it is listed below with its reason. To add one, say why here:
// "optical" (aligns ink by eye), "emphasis" (big-number steps, waiting for
// tray/emphasis-top), "page" (full-screen layout outside trays) or "component"
// (a component's own inner geometry).
const ALLOWED = [
  ['automatic-orders.css', '.ao-page-header', '54', 'page: below the status bar'],
  ['automatic-orders.css', '.ao-amount + .credo-amount__caption', '-4', 'optical: caption under the digits'],
  ['automatic-orders.css', '.ao-day .ap-day-control', '28', 'emphasis: calendar to slider'],
  ['automatic-orders.css', '.ao-checks', '9', 'component: checkbox row padding 12 minus the −3 mark nudge'],
  ['upload-slot.css', '.credo-upload__error svg', '3', 'optical: 12px alert icon on the 18px error line'],
  ['consent-list.css', '.credo-consent .credo-select', '-3', 'optical: mark on the label’s first line'],
  ['automatic-orders.css', '.ao-layer > .ao-receipt:first-child', '4', 'component: 24px logo inside a 32px receipt row'],
  ['automatic-orders.css', '.ao-pay-from__chevrons', '-2', 'optical: chevron ink on the gutter'],
  ['payment-stage.css', '.ap-day-control', '36', 'emphasis'],
  ['payment-stage.css', '.ap-slider input::-webkit-slider-thumb', '-13', 'component: centres the 32px thumb on the track'],
  ['transfers.css', '.transfer-review-summary', '-9', 'component: first label inside a 32px receipt row'],
  ['transfers.css', '.transfer-result-panel', '148', 'emphasis'],
  ['amount-display.css', '.credo-amount__caption', '2', 'optical'],
  ['search-field.css', '.credo-search', '40', 'component: list row icon column'],
  ['search-field.css', '.credo-search', '28', 'component: clear button size'],
  ['search-field.css', '.credo-search', '18', 'component: search icon size'],
  ['transfer-home.css', '.home-user p', '2', 'component: Figma Home greeting line gap'],
  ['transfer-home.css', '.home-card__digital', '6', 'component: Figma Home card badge padding'],
  ['transfer-home.css', '.home-offer', '2', 'component: Figma Home offer frame inset'],
  ['transfer-home.css', '.home-offer__badge', '6', 'component: Figma Home offer badge padding']
];

// Prototype controls around the phone, not product UI.
const LAB_CHROME = /\.(ap-stage|ap-tools|ap-holder|ap-status-bar|ao-tune|transfer-stage|transfer-tools|transfer-reset|transfer-timeline-toggle|phone-study-tools)(?![\w-]*[a-z])|\.ao-tune__/;

async function files() {
  const components = (await readdir(new URL('../components/', import.meta.url))).filter(name => name.endsWith('.css') && name !== 'iphone-frame.css').map(name => `components/${name}`);
  return ['app/studies/auto-lombard/auto-lombard.css', 'app/studies/automatic-orders/automatic-orders.css', 'app/studies/automatic-orders/payment-stage.css', 'app/studies/transfers/transfers.css', ...components];
}

export async function rawSpacing() {
  const found = [];
  for (const path of await files()) {
    const css = (await readFile(new URL(`../${path}`, import.meta.url), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '');
    for (const [, selectorText, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const selector = selectorText.trim().split(/\s+/).join(' ');
      if (LAB_CHROME.test(selector)) continue;
      for (const [, , value] of body.matchAll(/(?<![\w-])((?:margin|padding|gap|row-gap|column-gap)(?:-[a-z]+)?)\s*:\s*([^;]+)/g)) {
        const outsideVar = value.replace(/var\([^()]*\)/g, '');
        for (const [, px] of outsideVar.matchAll(/(?<![\w.-])(-?\d+(?:\.\d+)?)px/g))
          if (px !== '0') found.push([path.split('/').pop(), selector, px]);
      }
    }
  }
  return found;
}

test('flow and component spacing uses tokens, or a listed exception', async () => {
  const allowed = new Set(ALLOWED.map(([file, selector, px]) => `${file}|${selector}|${px}`));
  const unlisted = (await rawSpacing()).filter(([file, selector, px]) => !allowed.has(`${file}|${selector}|${px}`));
  assert.deepEqual(unlisted, [], 'use --credo-space-* / --credo-tray-* / --credo-list-*, or add the value to ALLOWED with a reason');
});

test('every listed exception still exists (remove it when the value goes)', async () => {
  const present = new Set((await rawSpacing()).map(([file, selector, px]) => `${file}|${selector}|${px}`));
  for (const [file, selector, px, reason] of ALLOWED) {
    assert.ok(present.has(`${file}|${selector}|${px}`), `stale exception: ${file} ${selector} ${px}px (${reason})`);
    assert.match(reason, /^(optical|emphasis|page|component)/);
  }
});
