'use client';
import { useEffect, useRef, useState } from 'react';

const slides = [
  '대표사진 1 · 공유 대표 이미지',
  '대표사진 2 · 가족과 함께',
  '대표사진 3 · 친구들과 함께',
  '대표사진 4 · 가르침의 시간',
  '대표사진 5 · 기억하고 싶은 순간',
];

export default function HeroCarousel(){
  const [current,setCurrent]=useState(0); const [paused,setPaused]=useState(false); const touchStart=useRef<number|null>(null);
  const move=(direction:number)=>setCurrent(index=>(index+direction+slides.length)%slides.length);
  useEffect(()=>{
    if(paused||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const timer=window.setInterval(()=>move(1),6000); return()=>window.clearInterval(timer);
  },[paused]);
  return <div className="hero-carousel" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onTouchStart={event=>{touchStart.current=event.touches[0].clientX;setPaused(true);}} onTouchEnd={event=>{if(touchStart.current===null)return;const distance=event.changedTouches[0].clientX-touchStart.current;if(Math.abs(distance)>45)move(distance>0?-1:1);touchStart.current=null;setPaused(false);}}>
    <div className="hero-slides" aria-live="polite">{slides.map((label,index)=><div key={label} className={`hero-portrait hero-slide hero-slide-${index+1}${current===index?' active':''}`} role="img" aria-label={label}><span>{label}</span></div>)}</div>
    <div className="hero-carousel-controls"><button onClick={()=>move(-1)} aria-label="이전 대표사진">‹</button><div>{slides.map((label,index)=><button key={label} className={current===index?'active':''} onClick={()=>setCurrent(index)} aria-label={`${index+1}번째 대표사진 보기`} aria-current={current===index?'true':undefined}/>)}</div><button onClick={()=>move(1)} aria-label="다음 대표사진">›</button></div>
  </div>;
}
