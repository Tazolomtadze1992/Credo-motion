// Component pages, in sidebar order. Kept apart from the design-system
// registry so the sidebar does not load every component preview.
export const componentList = [
  ['account-field', 'Account Field'], ['amount-display', 'Amount Display'], ['card-art', 'Card Art'],
  ['code-input', 'Code Input'], ['consent-list', 'Consent List'], ['keypad', 'Keypad'], ['list-row', 'List Row'], ['option-card', 'Option Card'],
  ['page-header', 'Page Header'], ['primary-button', 'Primary Button'], ['product-card', 'Product Card'],
  ['receipt-rows', 'Receipt Rows'], ['search-field', 'Search Field'],
  ['secondary-button', 'Secondary Button'], ['segmented-control', 'Segmented Control'], ['tray', 'Tray'],
  ['upload-slot', 'Upload Slot']
].map(([slug, title]) => ({ slug, title }));
