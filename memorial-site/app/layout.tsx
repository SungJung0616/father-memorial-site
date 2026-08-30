import type { Metadata } from 'next';
import './globals.css';
import './extra.css';

export const metadata: Metadata = {
  title: '故 정영훈님을 기억하며',
  description: '정영훈 명예교수의 삶과 가르침, 사진과 추억을 함께 간직하는 온라인 추모 공간입니다.',
  openGraph: {
    title: '故 정영훈님을 기억하며',
    description: '정영훈 명예교수의 삶과 가르침, 사진과 추억을 함께 간직하는 온라인 추모 공간입니다.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '故 정영훈님을 기억하며',
    description: '정영훈 명예교수의 삶과 가르침, 사진과 추억을 함께 간직하는 온라인 추모 공간입니다.',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
