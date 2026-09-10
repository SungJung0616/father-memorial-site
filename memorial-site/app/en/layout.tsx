import type { Metadata } from 'next';
import EnglishDocument from '../components/EnglishDocument';

export const metadata: Metadata = {
  title: 'In Memory of Professor Young Hoon Jung',
  description: 'A living archive where family, friends, students, and colleagues remember Professor Young Hoon Jung through stories and photographs.',
  openGraph: {
    title: 'In Memory of Professor Young Hoon Jung',
    description: 'A living archive of stories and photographs shared in memory of Professor Young Hoon Jung.',
    type: 'website',
  },
};

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <EnglishDocument>{children}</EnglishDocument>;
}
