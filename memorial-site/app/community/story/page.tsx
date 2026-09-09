'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import MemoryHeart from '../../components/MemoryHeart';
import { useSearchParams } from 'next/navigation';
import { loadPublicMemory, type PublicMemory } from '../../lib/publicMemories';

const relationshipEn: Record<string, string> = {
  '가족': 'Family', '가족·친지': 'Family', '친구': 'Friend', '제자': 'Student', '동료': 'Colleague',
  '교수·학계': 'Colleague', '기타': 'A shared connection', '추억': 'A shared memory',
};

function MemoryDetailContent() {
  const params = useSearchParams();
  const id = params?.get('id') ?? '';
  const en = params?.get('lang') === 'en';
  const [memory, setMemory] = useState<PublicMemory | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const community = en ? '/community?lang=en' : '/community';
  const home = en ? '/en' : '/';
  const contribute = en ? '/en/contribute' : '/contribute';

  useEffect(() => {
    if (!id) return;
    loadPublicMemory(id)
      .then(setMemory)
      .catch(reason => setError(en ? 'This memory could not be found.' : (reason instanceof Error ? reason.message : '추억을 찾을 수 없습니다.')))
      .finally(() => setLoading(false));
  }, [id, en]);

  const relation = (value: string) => en ? relationshipEn[value] || value : value;
  if (!id) return <main className="memory-detail-page" lang={en ? 'en' : 'ko'}><section className="memory-detail-message"><h1>{en ? 'This memory cannot be opened' : '이 추억을 열 수 없습니다'}</h1><p>{en ? 'The memory reference is missing.' : '추억 번호가 없습니다.'}</p><Link href={community}>{en ? 'Return to Shared Memories' : '추억 이야기로 돌아가기'}</Link></section></main>;
  if (loading) return <main className="memory-detail-page" lang={en ? 'en' : 'ko'}><p className="community-state">{en ? 'Opening the memory…' : '추억을 불러오고 있습니다…'}</p></main>;
  if (error || !memory) return <main className="memory-detail-page" lang={en ? 'en' : 'ko'}><section className="memory-detail-message"><h1>{en ? 'This memory cannot be opened' : '이 추억을 열 수 없습니다'}</h1><p>{error}</p><Link href={community}>{en ? 'Return to Shared Memories' : '추억 이야기로 돌아가기'}</Link></section></main>;

  return <main className="memory-detail-page" lang={en ? 'en' : 'ko'}>
    <header><Link href={community}>{en ? '← Shared Memories' : '← 추억 이야기'}</Link><Link href={home}>{en ? 'Professor Young Hoon Jung' : '故 정영훈님'}</Link></header>
    <article className="memory-detail-card">
      <div className="memory-detail-heading"><p>{relation(memory.category || memory.group)}</p><h1>{memory.title}</h1><div><span>{relation(memory.group)}</span><time>{new Date(memory.submittedAt).toLocaleDateString(en ? 'en-US' : 'ko-KR')}</time></div></div>
      {memory.photos.length > 0 && <section className="memory-gallery" aria-label={en ? 'Memory photographs' : '추억 사진'}>
        <div className="memory-main-photo"><img src={memory.photos[selectedPhoto].url} alt={en ? `${memory.title}, photograph ${selectedPhoto + 1}` : `${memory.title} 사진 ${selectedPhoto + 1}`} /></div>
        {memory.photos.length > 1 && <div className="memory-photo-thumbs">{memory.photos.map((photo, index) => <button className={selectedPhoto === index ? 'selected' : ''} key={`${photo.url}-${index}`} onClick={() => setSelectedPhoto(index)} aria-label={en ? `View photograph ${index + 1}` : `${index + 1}번째 사진 보기`}><img src={photo.url} alt="" /></button>)}</div>}
      </section>}
      <div className="memory-story"><p>{memory.body || (en ? 'A cherished moment shared in photographs.' : '사진과 함께 전해진 소중한 추억입니다.')}</p></div>
      <footer><MemoryHeart id={memory.id} initialCount={memory.likeCount} language={en ? 'en' : 'ko'} /><Link href={contribute}>{en ? 'Share Your Memory' : '나도 추억 남기기'}</Link></footer>
    </article>
  </main>;
}

export default function MemoryDetailPage() {
  return <Suspense fallback={<main className="memory-detail-page"><p className="community-state">Loading…</p></main>}><MemoryDetailContent /></Suspense>;
}
