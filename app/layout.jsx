import './globals.css';
import 'dialkit/vanilla/styles.css';

export const metadata = {
  title: 'Credo Motion Lab',
  description: 'Interactive motion studies for Credo Bank experiences.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
