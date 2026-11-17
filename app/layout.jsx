import { credoMotionStyle } from '../content/motion.mjs';
import { credoSpacingStyle } from '../content/spacing.mjs';
import './globals.css';
import './lab-shell.css';
import LabSidebar from './LabSidebar';
import 'dialkit/vanilla/styles.css';

export const metadata = {
  title: 'Credo Motion Lab',
  description: 'Interactive motion studies for Credo Bank experiences.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{ ...credoMotionStyle, ...credoSpacingStyle }}>
      <body><div className="lab-shell"><LabSidebar /><div className="lab-main">{children}</div></div></body>
    </html>
  );
}
