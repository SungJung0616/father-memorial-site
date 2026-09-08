'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function MobileNav({ language = 'ko' }: { language?: 'ko' | 'en' }) {
  const [open, setOpen] = useState(false);
  const ko = language === 'ko';
  const close = () => setOpen(false);

  return <>
    <nav className="mobile-bottom-nav" aria-label={ko ? '모바일 바로가기' : 'Mobile shortcuts'}>
      <Link href="/community"><span aria-hidden="true">♥</span><strong>{ko ? '추억 보기' : 'Memories'}</strong></Link>
      <Link href="/contribute"><span aria-hidden="true">＋</span><strong>{ko ? '사진 올리기' : 'Share'}</strong></Link>
      <Link href="/community#notices"><span aria-hidden="true">●</span><strong>{ko ? '모임·소식' : 'News'}</strong></Link>
      <button type="button" onClick={() => setOpen(true)} aria-expanded={open}><span aria-hidden="true">☰</span><strong>{ko ? '더보기' : 'More'}</strong></button>
    </nav>
    {open && <div className="mobile-menu-overlay" role="dialog" aria-modal="true" aria-label={ko ? '전체 메뉴' : 'Full menu'}>
      <button className="mobile-menu-close" onClick={close} aria-label={ko ? '메뉴 닫기' : 'Close menu'}>×</button>
      <p>{ko ? '故 정영훈님' : 'Professor Young Hoon Jung'}</p>
      <nav>
        <Link href="/#life" onClick={close}>{ko ? '교수님의 삶' : 'His Life'}</Link>
        <Link href="/#teaching" onClick={close}>{ko ? '가르침과 연구' : 'Teaching & Research'}</Link>
        <Link href="/#directions" onClick={close}>{ko ? '묘소·성묘 안내' : 'Visiting His Resting Place'}</Link>
        <Link href="/photos">{ko ? '사진첩' : 'Photo Archive'}</Link>
        <Link href="/admin">{ko ? '로그인' : 'Sign In'}</Link>
        <Link href={ko ? '/en' : '/'}>{ko ? 'English' : '한국어'}</Link>
      </nav>
    </div>}
  </>;
}
