import { credoColorStyle } from '../../../content/colors';
import { credoTypographyStyle } from '../../../content/typography';
import MotionPreview from './MotionPreview';
import '../design-system.css';
import './motion.css';

export const metadata = {
  title: 'Motion · Credo Motion Lab',
  description: 'Credo motion tokens: curves, springs and durations.'
};

export default function MotionPage() {
  return <main className="credo-type-page" style={{ ...credoTypographyStyle, ...credoColorStyle }}>
    <header className="type-header">
      <h1>Motion</h1>
      <p>Shared curves, springs and durations from the China transfer and Automatic payments flows. JavaScript imports <code>content/motion.mjs</code>; CSS uses the <code>--credo-ease-*</code> and <code>--credo-duration-*</code> variables.</p>
    </header>
    <MotionPreview />
  </main>;
}
