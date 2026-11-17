'use client';

import { useEffect, useRef } from 'react';
import { createDialKit, createDialRoot, DialStore } from 'dialkit/vanilla';
import { createCredoTypographyStyle, receiptEditWeight, typography } from '../content/typography';

const roles = Object.entries(typography);
const ranges = {
  title: { size: [12, 26], leading: [16, 32] },
  option: { size: [11, 24], leading: [14, 32] },
  supporting: { size: [10, 20], leading: [12, 28] },
  'receipt-label': { size: [10, 20], leading: [12, 28] },
  'receipt-value': { size: [10, 20], leading: [12, 28] },
  action: { size: [11, 24], leading: [14, 32] },
  amount: { size: [24, 52], leading: [32, 64] },
  keypad: { size: [16, 36], leading: [20, 44] },
  code: { size: [18, 36], leading: [18, 44] },
  body: { size: [10, 20], leading: [14, 30] },
  display: { size: [48, 120], leading: [48, 120] },
  eyebrow: { size: [10, 20], leading: [12, 28] },
  badge: { size: [9, 17], leading: [12, 22] }
};
const caseOptions = caseLabel => [
  { value: 'none', label: caseLabel ?? 'As written' },
  'uppercase',
  'lowercase',
  { value: 'capitalize', label: 'Capitalize every word' }
];

const controls = Object.fromEntries(roles.map(([role, token]) => [token.name, {
  _collapsed: role !== 'title',
  'Size (px)': [token.size, ...ranges[role].size, 1],
  Weight: [token.weight, 100, 900, 50],
  ...(role === 'receipt-value' && { 'Edit weight': [receiptEditWeight, 100, 900, 50] }),
  'Line height (px)': [token.leading, ...ranges[role].leading, 1],
  'Letter spacing (%)': [(token.tracking ?? 0) * 100, -6, 10, 0.25],
  ...(!token.tabular && { Case: { type: 'select', options: caseOptions(token.caseLabel), default: token.textCase ?? 'none' } }),
  Italic: token.italic ?? false,
  ...(token.tabular && { 'Tabular figures': true })
}]));

const resetLabel = 'Reset typography';
controls[resetLabel] = { type: 'action' };
const panelId = 'credo-transfer-typography-v5';

function copySavedTypography() {
  try {
    const storage = window.localStorage;
    const key = `dialkit:${panelId}`;
    if (storage.getItem(key) !== null) return false;
    for (const suffix of ['-v4', '-v3', '-v2', '']) {
      const previous = storage.getItem(`dialkit:credo-transfer-typography${suffix}`);
      if (!previous) continue;
      storage.setItem(key, previous);
      return suffix || 'legacy';
    }
    return false;
  } catch {
    return false;
  }
}

export default function TransferTypographyPanel({ onOpenChange, phoneRef, controllerRef }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const phone = phoneRef.current;
    const imported = copySavedTypography();
    const panel = createDialKit('Typography', controls, {
      id: panelId,
      persist: true,
      onAction: action => {
        if (action === resetLabel) panel.resetValues();
      }
    });
    if (imported) {
      // Adopt the revised baseline while preserving named versions and their selection.
      const activeVersion = DialStore.getActivePresetId(panel.id);
      if (activeVersion) DialStore.clearActivePreset(panel.id);
      const { title, option, action, supporting } = typography;
      panel.setValues({
        ...(imported !== '-v4' && {
          ...Object.fromEntries([title, option].map(token => [token.name, {
            Case: token.textCase,
            ...(imported === 'legacy' && { 'Size (px)': token.size, Weight: token.weight, 'Line height (px)': token.leading })
          }])),
          [action.name]: { 'Size (px)': action.size, Weight: action.weight, 'Line height (px)': action.leading, Case: action.textCase }
        }),
        [supporting.name]: { 'Size (px)': supporting.size, Weight: supporting.weight, 'Line height (px)': supporting.leading }
      });
      if (activeVersion) DialStore.loadPreset(panel.id, activeVersion);
    }
    panel.setOpen(false);
    const root = createDialRoot({
      target: hostRef.current, position: 'bottom-right', defaultOpen: false, theme: 'light', onOpenChange
    });
    onOpenChange(false);
    let previousAmount;
    const unsubscribe = panel.subscribe(values => {
      const tunedRoles = Object.fromEntries(roles.map(([role, token]) => {
        const valuesForRole = values[token.name];
        return [role, {
          size: valuesForRole['Size (px)'],
          weight: valuesForRole.Weight,
          leading: valuesForRole['Line height (px)'],
          tracking: valuesForRole['Letter spacing (%)'] / 100,
          textCase: valuesForRole.Case,
          italic: valuesForRole.Italic,
          tabular: valuesForRole['Tabular figures']
        }];
      }));
      const styles = {
        ...createCredoTypographyStyle(tunedRoles),
        '--credo-type-receipt-edit-weight': String(values[typography['receipt-value'].name]['Edit weight'])
      };
      for (const [property, value] of Object.entries(styles)) {
        if (phone.style.getPropertyValue(property) !== value) phone.style.setProperty(property, value);
      }
      const amount = JSON.stringify(tunedRoles.amount);
      if (previousAmount && previousAmount !== amount) controllerRef.current?.fitPhone();
      previousAmount = amount;
    });
    return () => {
      unsubscribe();
      root.destroy();
      panel.destroy();
    };
  }, [phoneRef, controllerRef, onOpenChange]);

  return <aside className="transfer-typography" aria-label="Typography controls" ref={hostRef} />;
}
