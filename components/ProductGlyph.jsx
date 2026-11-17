// Filled white product glyphs for the Products cards (Family's wallets use
// solid glyphs, not outline icons; user review 2026-11-16). 24 px grid.
const GLYPHS = {
  accounts: <path fillRule="evenodd" d="M5 4h12a2 2 0 0 1 2 2v1.5H5.6a.6.6 0 0 0 0 1.2H20a2 2 0 0 1 2 2V18a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Zm12.2 10a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4Z" />,
  loans: <><rect x="2" y="15.5" width="15" height="5" rx="2.5" /><rect x="4.5" y="9.5" width="15" height="5" rx="2.5" /><rect x="7" y="3.5" width="15" height="5" rx="2.5" /></>,
  deposits: <path fillRule="evenodd" d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 4.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm0 2.7a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6Z" />,
  credit: <path fillRule="evenodd" d="M5 4.5h14a3 3 0 0 1 3 3v.8H2v-.8a3 3 0 0 1 3-3Zm-3 6.3h20v5.7a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-5.7Zm3.5 4.2a.9.9 0 0 0 0 1.8h4a.9.9 0 0 0 0-1.8h-4Z" />,
  limit: <><path d="M6.2 8h11.6l1.1 10.9a2.3 2.3 0 0 1-2.3 2.6H7.4a2.3 2.3 0 0 1-2.3-2.6L6.2 8Z" /><path d="M9 9V6.8a3 3 0 0 1 6 0V9" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></>,
  insurance: <path d="M12 2.2 20 5.3v6.2c0 5-3.4 8.9-8 10.3-4.6-1.4-8-5.3-8-10.3V5.3l8-3.1Z" />,
  // Loan types and car loans (New product lists use the same glyph family).
  digital: <path fillRule="evenodd" d="M8.5 2h7A2.5 2.5 0 0 1 18 4.5v15a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 6 19.5v-15A2.5 2.5 0 0 1 8.5 2Zm2 15.6a.9.9 0 0 0 0 1.8h3a.9.9 0 0 0 0-1.8h-3Z" />,
  car: <path fillRule="evenodd" d="M4.3 11.2 6.2 6.6A2.6 2.6 0 0 1 8.6 5h6.8a2.6 2.6 0 0 1 2.4 1.6l1.9 4.6A3 3 0 0 1 22 14v2.6a1.2 1.2 0 0 1-1.2 1.2h-.9a2.8 2.8 0 0 1-5.5 0H9.6a2.8 2.8 0 0 1-5.5 0h-.9A1.2 1.2 0 0 1 2 16.6V14a3 3 0 0 1 2.3-2.8Zm3.1-.4h9.2l-1.3-3.2a1 1 0 0 0-.9-.6H9.6a1 1 0 0 0-.9.6l-1.3 3.2Z" />,
  used: <path fillRule="evenodd" d="M5 9.2 6.6 5.4A2 2 0 0 1 8.4 4.2h7.2a2 2 0 0 1 1.8 1.2L19 9.2h1a1 1 0 0 1 1 1v1.1h-1v6.2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1H8v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6.2H3v-1.1a1 1 0 0 1 1-1h1Zm2.3 0h9.4l-1.1-2.9H8.4L7.3 9.2ZM7.2 12.3a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8Zm9.6 0a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8Z" />,
  student: <><path d="M12 3.5 2 8.6l10 5.1 8-4.1v5.9h2V8.6L12 3.5Z" /><path d="M6 12.3v3.9c0 1.8 2.7 3.3 6 3.3s6-1.5 6-3.3v-3.9l-6 3.1-6-3.1Z" /></>,
  startup: <path fillRule="evenodd" d="M12 2c3.1 2.1 5 5.6 5 9.6v3.2l2.2 3.4h-4.4L13.8 20h-3.6l-1-1.8H4.8L7 14.8v-3.2C7 7.6 8.9 4.1 12 2Zm0 6.2a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2Z" />,
  mortgage: <path d="M12 3 2.5 11.2H5V20a1 1 0 0 0 1 1h4v-5.8h4V21h4a1 1 0 0 0 1-1v-8.8h2.5L12 3Z" />,
  history: <path fillRule="evenodd" d="M6.5 2H14l5.5 5.5v12A2.5 2.5 0 0 1 17 22H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2ZM8 11.6v1.8h8v-1.8H8Zm0 4v1.8h5v-1.8H8Z" />
};
GLYPHS.lombard = GLYPHS.loans;
GLYPHS.new = GLYPHS.car;

export default function ProductGlyph({ name, size = 26 }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false">{GLYPHS[name]}</svg>;
}
