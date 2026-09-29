import Link from 'next/link';
import MySpaceStudy from '../../../components/MySpaceStudy';
import './my-space.css';

export const metadata = {
  title: 'My Space · Credo Motion Lab',
  description: 'An interactive study of the My Space savings transition.'
};

export default function MySpacePage() {
  return <><Link className="myspace-back" href="/">← All studies</Link><MySpaceStudy /></>;
}
