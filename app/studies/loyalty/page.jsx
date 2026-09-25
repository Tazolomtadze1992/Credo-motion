import Link from 'next/link';
import LoyaltyStudy from '../../../components/LoyaltyStudy';
import './loyalty.css';

export const metadata = {
  title: 'Loyalty program · Credo Motion Lab',
  description: 'Interactive loyalty tab transition study.'
};

export default function LoyaltyPage() {
  return <><Link className="study-back" href="/">← All studies</Link><LoyaltyStudy /></>;
}
