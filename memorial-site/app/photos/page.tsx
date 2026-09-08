'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Memory = { id: string; title: string; body: string; category: string; group: string; submittedAt: string; photos: { url: string; type: string }[] };
const filters = ['전체', '가족', '친구', '제자', '교수·학계', '행사'];

export default function PhotosPage(){
  const [memories,setMemories]=useState<Memory[]>([]);
  const [filter,setFilter]=useState('전체');
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  useEffect(()=>{fetch('/api/memories').then(async response=>{const result=await response.json() as {memories?:Memory[];error?:string};if(!response.ok)throw new Error(result.error||'사진을 불러오지 못했습니다.');setMemories(result.memories??[]);}).catch(reason=>setError(reason instanceof Error?reason.message:'사진을 불러오지 못했습니다.')).finally(()=>setLoading(false));},[]);
  const visible=memories.filter(memory=>filter==='전체'||memory.category===filter||memory.group===filter).flatMap(memory=>memory.photos.map((photo,index)=>({...photo,id:`${memory.id}-${index}`,memoryId:memory.id,title:memory.title,body:memory.body,category:memory.category||memory.group,submittedAt:memory.submittedAt})));
  return <main className="photos-page"><header><Link href="/">← 故 정영훈님</Link><div><p className="section-kicker">사진으로 보는 삶</p><h1>사진첩</h1><p>가족이 공개 승인한 추억 속 사진을 한곳에서 봅니다. 같은 사진 자료가 추억 이야기와 사진첩에 함께 연결됩니다.</p></div><Link href="/contribute">사진 보내기</Link></header>
    <nav className="photo-tabs" aria-label="사진 분류">{filters.map(value=><button key={value} className={filter===value?'selected':''} onClick={()=>setFilter(value)}>{value}</button>)}</nav>
    {loading&&<p className="community-state">사진을 불러오고 있습니다…</p>}{error&&<p className="community-state" role="alert">{error}</p>}
    {!loading&&!error&&visible.length===0&&<section className="community-empty"><h2>{filter==='전체'?'아직 공개된 사진이 없습니다':`${filter} 분류의 사진이 없습니다`}</h2><p>승인된 추억에 포함된 사진이 이곳에 함께 나타납니다.</p><Link href="/contribute">사진과 추억 보내기</Link></section>}
    <section className="published-photo-grid" aria-label="공개 사진 목록">{visible.map(photo=><Link href={`/community/story?id=${encodeURIComponent(photo.memoryId)}`} key={photo.id}><img src={photo.url} alt={photo.title}/><div><span>{photo.category}</span><h2>{photo.title}</h2><p>{photo.body||'사진과 함께 전해진 소중한 추억입니다.'}</p></div></Link>)}</section>
  </main>;
}
