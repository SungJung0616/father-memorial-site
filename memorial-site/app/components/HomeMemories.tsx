'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import HomePhotos from './HomePhotos';
import MemoryHeart from './MemoryHeart';
import { loadPublicMemories, type PublicMemory } from '../lib/publicMemories';
import { selectHomeMemories } from '../lib/homeMemorySelection';
import './home-memories.css';

export default function HomeMemories({ language = 'ko' }: { language?: 'ko' | 'en' }) {
  const en = language === 'en';
  const [items, setItems] = useState<PublicMemory[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    let active = true;
    loadPublicMemories().then(data => { if (active) { setItems(data); setStatus('ready'); } }).catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, []);
  const memories = selectHomeMemories(items);
  const contribute = en ? '/en/contribute' : '/contribute';
  const allMemories = en ? '/community?lang=en' : '/community';
  const connection = (value: string) => en ? ({ '가족': 'Family', '가족·친지': 'Family', '친구': 'Friend', '제자': 'Student', '동료': 'Colleague', '교수·학계': 'Colleague', '기타': 'A shared connection', '추억': 'A shared memory' } as Record<string, string>)[value] || value : value;
  const memoryCard = (memory: PublicMemory, featured = false) => {
    const storyHref = `/community/story?id=${encodeURIComponent(memory.id)}${en ? '&lang=en' : ''}`;
    return <article key={memory.id} className={`shared-story${featured ? ' shared-feature' : ' shared-secondary'}${memory.photos.length ? ' with-photo' : ' words-only'}`}>
    <div className="shared-story-layout">
      <Link className="shared-media-link" href={storyHref} aria-label={memory.title}>
      <div className="shared-story-media">
        {memory.photos[0] ? <img className="shared-story-photo" src={memory.photos[0].url} alt="" loading="lazy" /> : <span className="shared-quote" aria-hidden="true">“</span>}
      </div>
      </Link>
      <div className="shared-heart-row"><MemoryHeart id={memory.id} initialCount={memory.likeCount} language={language} /></div>
      <Link className="shared-copy-link" href={storyHref}>
      <div className="shared-story-copy"><p className="shared-connection">{connection(memory.group)}</p><h3>{memory.title}</h3>
        <p className="shared-excerpt">{memory.body || (en ? 'A moment remembered in photographs.' : '사진으로 전해진 소중한 순간입니다.')}</p>
        <div className="shared-story-end"><span>{en ? 'Read the Memory' : '이야기 읽기'} <span aria-hidden="true">→</span></span></div>
      </div>
      </Link>
    </div>
  </article>;
  };
  return <>
    <section className="shared-memories section-shell" id="shared-memories" aria-labelledby="shared-heading">
      <header className="shared-intro"><p className="section-kicker">SHARED MEMORIES</p><h2 id="shared-heading">{en ? 'Remembering Young Hoon' : '함께 기억하는 정영훈'}</h2><p>{en ? <>A father to his family. A friend, teacher, and colleague to so many.<br />Through the memories we share, we discover the many ways he touched our lives.</> : <>가족에게는 아버지로, 누군가에게는 친구와 스승, 동료로.<br />서로 다른 기억 속에 남아 있는 정영훈의 이야기를 함께 나눕니다.</>}</p></header>
      {status === 'loading' && <p role="status">{en ? 'Gathering shared memories…' : '함께 나눈 추억을 불러오고 있습니다…'}</p>}
      {status === 'error' && <p role="alert">{en ? 'We could not load the memories. Please refresh to try again.' : '추억을 불러오지 못했습니다. 새로고침해 주세요.'}</p>}
      {status === 'ready' && memories.length === 0 && <p>{en ? 'Memories will appear here after the family has reviewed them. You are welcome to share yours.' : '가족이 확인한 추억이 이곳에 모입니다. 당신의 기억도 들려주세요.'}</p>}
      {memories.length > 0 && <div className="shared-editorial">
        {memoryCard(memories[0], true)}
        {memories.length > 1 && <div className="shared-secondary-grid">{memories.slice(1).map(memory => memoryCard(memory))}</div>}
      </div>}
      <div className="shared-closing"><Link className="text-link" href={allMemories}>{en ? 'View All Memories →' : '모든 추억 보기 →'}</Link><div><p>{en ? 'Has a memory come to mind? Your words are welcome, with or without a photograph.' : '떠오르는 기억이 있으신가요? 사진 없이 글만 남겨주셔도 좋습니다.'}</p><Link className="text-link" href={contribute}>{en ? 'Share Your Memory →' : '나의 추억 나누기 →'}</Link></div></div>
    </section>
    <HomePhotos language={language} items={items} status={status} />
  </>;
}
