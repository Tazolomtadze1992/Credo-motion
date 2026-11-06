import Link from 'next/link';
import AutomaticPaymentsStudy from '../../../components/AutomaticPaymentsStudy';
import '../transfers/transfers.css';
import './automatic-payments.css';

export const metadata = {
  title: 'Automatic payments · Credo Motion Lab',
  description: 'A continuous payment tray and a tactile monthly calendar.'
};
export default function AutomaticPaymentsPage() {
  return <><Link href="/" className="ap-back">← All studies</Link><AutomaticPaymentsStudy /></>;
}
