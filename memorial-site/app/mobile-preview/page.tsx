'use client';

import { useState } from 'react';

export default function MobilePreviewPage(){
  const [language,setLanguage]=useState<'ko'|'en'>('ko');
  return <main className="mobile-preview-page"><header><div><p>휴대폰 화면 미리보기</p><h1>390 × 844</h1></div><div className="preview-language"><button className={language==='ko'?'selected':''} onClick={()=>setLanguage('ko')}>한국어</button><button className={language==='en'?'selected':''} onClick={()=>setLanguage('en')}>English</button></div></header><div className="phone-frame"><div className="phone-speaker"/><iframe key={language} src={language==='ko'?'/':'/en'} title={language==='ko'?'한국어 모바일 미리보기':'English mobile preview'}/></div><p className="preview-note">프레임 안을 스크롤하면 전체 휴대폰 화면을 확인할 수 있습니다.</p></main>;
}
