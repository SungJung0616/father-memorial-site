'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadPublicMemories, type PublicMemory } from '../../lib/publicMemories';
const filters = ['전체', '가족', '친구', '제자', '교수·학계', '행사'];

export default function PhotosPage(){
  const [memories,setMemories]=useState<PublicMemory[]>([]);
  const [filter,setFilter]=useState('전체');
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  useEffect(()=>{loadPublicMemories().then(setMemories).catch(reason=>setError(reason instanceof Error?reason.message:'Unable to load photographs. Please refresh.')).finally(()=>setLoading(false));},[]);
  const visible=memories.filter(memory=>filter==='전체'||memory.category===filter||memory.group===filter).flatMap(memory=>memory.photos.map((photo,index)=>({...photo,id:`${memory.id}-${index}`,memoryId:memory.id,title:memory.title,body:memory.body,category:memory.category||memory.group,submittedAt:memory.submittedAt})));
  return <main className="photos-page" lang="en"><header><Link href="/en">← In Memory of Professor Jung</Link><div><p className="section-kicker">Life in Photos</p><h1>Photo Archive</h1><p>Photographs from memories reviewed and shared by the family are gathered here. Each photograph remains connected to the story in which it was contributed.</p></div><Link href="/en/contribute">Share a Memory</Link></header>
    <nav className="photo-tabs" aria-label="Photo categories">{filters.map(value=><button key={value} className={filter===value?'selected':''} onClick={()=>setFilter(value)}>{({ '전체': 'All', '가족': 'Family', '친구': 'Friends', '제자': 'Students', '교수·학계': 'Colleagues', '행사': 'Events' } as Record<string,string>)[value]}</button>)}</nav>
    {loading&&<p className="community-state">Loading photographs…</p>}{error&&<p className="community-state" role="alert">{error}</p>}
    {!loading&&!error&&visible.length===0&&<section className="community-empty"><h2>{filter==='전체'?'No photographs have been published yet':'No photographs in this category yet'}</h2><p>Photographs will appear here after family approval.</p><Link href="/en/contribute">Share a Memory</Link></section>}
    <section className="published-photo-grid" aria-label="Published photographs">{visible.map(photo=><Link href={`/community/story?id=${encodeURIComponent(photo.memoryId)}&lang=en`} key={photo.id}><img src={photo.url} alt={photo.title}/><div><span>{({ '가족': 'Family', '가족·친지': 'Family', '친구': 'Friends', '친구분들': 'Friends', '제자': 'Students', '동료': 'Colleagues', '교수·학계': 'Academic / Professional', '학교': 'Academic Life', '행사': 'Events' } as Record<string,string>)[photo.category] || 'Memories'}</span><h2>{photo.title}</h2><p>{photo.body||'A cherished memory shared with this photograph.'}</p></div></Link>)}</section>
  </main>;
}
