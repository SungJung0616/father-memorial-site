'use client';
import { useEffect, useRef, useState } from 'react';

type Slide = { label: string; image?: string; focalX?: number; focalY?: number };
type HeroSettings = { heroes?: { url?: string; labelKo?: string; labelEn?: string; focalX?: number; focalY?: number }[] };

export default function HeroCarousel({language='ko'}:{language?:'ko'|'en'}){
  const defaults: Slide[] = language==='en' ? [
    { label: 'Portrait of Professor Young Hoon Jung', image: '/images/hero/jung-young-hoon-01.jpg', focalX: 64, focalY: 34 },
    { label: 'Professor Young Hoon Jung performing music with friends', image: '/images/hero/jung-young-hoon-02.jpg', focalX: 40, focalY: 50 },
    { label: 'Portrait 3 · Among friends' },
    { label: 'Portrait 4 · Teaching and research' },
    { label: 'Portrait 5 · A moment to remember' },
  ] : [
    { label: '정영훈 교수님 대표사진', image: '/images/hero/jung-young-hoon-01.jpg', focalX: 64, focalY: 34 },
    { label: '친구들과 함께 음악을 연주하시는 정영훈 교수님', image: '/images/hero/jung-young-hoon-02.jpg', focalX: 40, focalY: 50 },
    { label: '대표사진 3 · 친구들과 함께' },
    { label: '대표사진 4 · 가르침의 시간' },
    { label: '대표사진 5 · 기억하고 싶은 순간' },
  ];
  const [managedSlides,setManagedSlides]=useState<Slide[]|null>(null);
  const slides=managedSlides??defaults;
  const [current,setCurrent]=useState(0); const [paused,setPaused]=useState(false); const touchStart=useRef<number|null>(null);
  const activeCurrent=Math.min(current,slides.length-1);
  const move=(direction:number)=>setCurrent(index=>(index+direction+slides.length)%slides.length);
  useEffect(()=>{fetch('/api/site-settings').then(async response=>response.ok?await response.json() as HeroSettings:null).then(result=>{if(result?.heroes?.length)setManagedSlides(result.heroes.map(hero=>({label:language==='en'?(hero.labelEn||'Professor Young Hoon Jung'):(hero.labelKo||'정영훈 교수님 대표사진'),image:hero.url,focalX:hero.focalX,focalY:hero.focalY})));}).catch(()=>undefined);},[language]);
  useEffect(()=>{
    if(paused||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const timer=window.setInterval(()=>setCurrent(index=>(index+1)%slides.length),6000); return()=>window.clearInterval(timer);
  },[paused,slides.length]);
  return <div className="hero-carousel" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onTouchStart={event=>{touchStart.current=event.touches[0].clientX;setPaused(true);}} onTouchEnd={event=>{if(touchStart.current===null)return;const distance=event.changedTouches[0].clientX-touchStart.current;if(Math.abs(distance)>45)move(distance>0?-1:1);touchStart.current=null;setPaused(false);}}>
    <div className="hero-slides" aria-live="polite">{slides.map((slide,index)=><div key={`${slide.label}-${index}`} className={`hero-portrait hero-slide hero-slide-${index+1}${slide.image?' has-photo':''}${activeCurrent===index?' active':''}`} role="img" aria-label={slide.label}>{slide.image?<img className="hero-photo" src={slide.image} alt="" style={{objectPosition:`${slide.focalX??50}% ${slide.focalY??50}%`}}/>:<span>{slide.label}</span>}</div>)}</div>
    <div className="hero-carousel-controls"><button onClick={()=>move(-1)} aria-label={language==='en'?'Previous portrait':'이전 대표사진'}>‹</button><div>{slides.map((slide,index)=><button key={slide.label} className={activeCurrent===index?'active':''} onClick={()=>setCurrent(index)} aria-label={language==='en'?`View portrait ${index+1}`:`${index+1}번째 대표사진 보기`} aria-current={activeCurrent===index?'true':undefined}/>)}</div><button onClick={()=>move(1)} aria-label={language==='en'?'Next portrait':'다음 대표사진'}>›</button></div>
  </div>;
}
