import Link from 'next/link';
import TransferStudy from '../../../components/TransferStudy';
import './transfers.css';

export const metadata = {
  title: 'China transfer · Credo Motion Lab',
  description: 'A continuous transfer tray: payment method, amount, review and result.'
};

export default function TransfersPage() {
  return <><Link className="transfer-back" href="/">← All studies</Link><TransferStudy /></>;
}
