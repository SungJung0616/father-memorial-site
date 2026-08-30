'use client';

import { useState } from 'react';

export default function MobileNav({language='ko'}:{language?:'ko'|'en'}){
  const [open,setOpen]=useState(false);
  const ko=language==='ko';
  return <><nav className="mobile-bottom-nav" aria-label={ko?'모바일 바로가기':'Mobile shortcuts'}>
    <a href="/community"><span aria-hidden="true">♥</span><strong>{ko?'추억 보기':'Memories'}</strong></a>
    <a href="/contribute"><span aria-hidden="true">＋</span><strong>{ko?'사진 올리기':'Share'}</strong></a>
    <a href="/community#notices"><span aria-hidden="true">●</span><strong>{ko?'모임·소식':'News'}</strong></a>
    <button type="button" onClick={()=>setOpen(true)} aria-expanded={open}><span aria-hidden="true">☰</span><strong>{ko?'더보기':'More'}</strong></button>
  </nav>{open&&<div className="mobile-menu-overlay" role="dialog" aria-modal="true" aria-label={ko?'전체 메뉴':'Full menu'}><button className="mobile-menu-close" onClick={()=>setOpen(false)} aria-label={ko?'메뉴 닫기':'Close menu'}>×</button><p>{ko?'故 정영훈님':'Professor Young Hoon Jung'}</p><nav><a href="/#life" onClick={()=>setOpen(false)}>{ko?'교수님의 삶':'His Life'}</a><a href="/#teaching" onClick={()=>setOpen(false)}>{ko?'가르침과 연구':'Teaching & Research'}</a><a href="/#directions" onClick={()=>setOpen(false)}>{ko?'묘소·성묘 안내':'Visiting His Resting Place'}</a><a href="/photos">{ko?'사진첩':'Photo Archive'}</a><a href={ko?'/en':'/'}>{ko?'English':'한국어'}</a></nav></div>}</>;
}
