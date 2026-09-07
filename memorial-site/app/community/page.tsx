'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Memory={id:string;group:string;name:string;submittedAt:string;title:string;body:string;category:string;photos:{url:string;type:string}[]};

export default function CommunityPage(){
  const [memories,setMemories]=useState<Memory[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(''); const [liked,setLiked]=useState<Record<string,boolean>>({}); const [visible,setVisible]=useState(6);
  useEffect(()=>{fetch('/api/memories').then(async response=>{const result=await response.json() as {memories?:Memory[];error?:string};if(!response.ok)throw new Error(result.error||'추억을 불러오지 못했습니다.');setMemories(result.memories??[]);}).catch(reason=>setError(reason instanceof Error?reason.message:'추억을 불러오지 못했습니다.')).finally(()=>setLoading(false));},[]);
  return <main className="community-page">
    <header><Link href="/">← 故 정영훈님</Link><div><p className="section-kicker">함께 기억합니다</p><h1>추억 이야기</h1><p>사진과 이야기를 편하게 보고, 아시는 내용을 함께 보태주세요.</p></div><Link className="community-write" href="/contribute">추억 보내기</Link></header>
    <section className="family-notices" id="notices" aria-label="중요한 소식"><article className="family-notice"><span>📌 가족이 전하는 소식</span><h2>함께 기억해 주시는 모든 분께 감사드립니다</h2><p>사진과 추억은 가족이 확인한 뒤 정성껏 이 공간에 담겠습니다.</p></article><article className="meeting-notice"><span>📅 다음 모임</span><h2>가을 성묘 모임 준비 중</h2><p>날짜와 장소는 가족 확인 후 알려드리겠습니다.</p></article></section>
    <div className="feed-heading"><h2>최근 추억</h2><a href="/photos">사진첩 보기</a></div>
    {loading&&<p className="community-state">추억을 불러오고 있습니다…</p>}{error&&<p className="community-state" role="alert">{error}</p>}{!loading&&!error&&memories.length===0&&<section className="community-empty"><h2>첫 번째 추억을 기다리고 있습니다</h2><p>보내주신 사진과 이야기는 가족 확인 후 이곳에 나타납니다.</p><Link href="/contribute">사진과 추억 보내기</Link></section>}
    <section className="community-feed">{memories.slice(0,visible).map(memory=><article key={memory.id}><div className="post-meta"><span>{memory.category||memory.group}</span><span>{memory.name} · {new Date(memory.submittedAt).toLocaleDateString('ko-KR')}</span></div>{memory.photos[0]&&<img className="feed-photo-image" src={memory.photos[0].url} alt={memory.title}/>}<h2>{memory.title}</h2>{memory.body&&<p>{memory.body}</p>}<div className="post-footer"><button className={liked[memory.id]?'heart-button liked':'heart-button'} onClick={()=>setLiked(current=>({...current,[memory.id]:!current[memory.id]}))} aria-pressed={!!liked[memory.id]}>♥ <span>함께 기억합니다{liked[memory.id]?' 1':''}</span></button><span>가족 확인 완료</span></div></article>)}</section>
    {visible<memories.length&&<button className="load-more" onClick={()=>setVisible(value=>value+6)}>추억 더 보기</button>}<Link className="community-mobile-write" href="/contribute">＋ 추억 보내기</Link>
  </main>;
}
