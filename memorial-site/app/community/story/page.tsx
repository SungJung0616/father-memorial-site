'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type Memory = {
  id: string;
  group: string;
  name: string;
  submittedAt: string;
  title: string;
  body: string;
  category: string;
  photos: { url: string; type: string }[];
};

function MemoryDetailContent() {
  const id = useSearchParams().get('id') ?? '';
  const [memory, setMemory] = useState<Memory | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/memories?id=${encodeURIComponent(id)}`)
      .then(async response => {
        const result = await response.json() as { memory?: Memory; error?: string };
        if (!response.ok || !result.memory) throw new Error(result.error || '추억을 찾을 수 없습니다.');
        setMemory(result.memory);
      })
      .catch(reason => setError(reason instanceof Error ? reason.message : '추억을 찾을 수 없습니다.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) return <main className="memory-detail-page"><section className="memory-detail-message"><h1>이 추억을 열 수 없습니다</h1><p>추억 번호가 없습니다.</p><Link href="/community">추억 이야기로 돌아가기</Link></section></main>;
  if (loading) return <main className="memory-detail-page"><p className="community-state">추억을 불러오고 있습니다…</p></main>;
  if (error || !memory) return <main className="memory-detail-page"><section className="memory-detail-message"><h1>이 추억을 열 수 없습니다</h1><p>{error}</p><Link href="/community">추억 이야기로 돌아가기</Link></section></main>;

  return <main className="memory-detail-page">
    <header><Link href="/community">← 추억 이야기</Link><Link href="/">故 정영훈님</Link></header>
    <article className="memory-detail-card">
      <div className="memory-detail-heading"><p>{memory.category || memory.group}</p><h1>{memory.title}</h1><div><span>{memory.name}</span><span>{memory.group}</span><time>{new Date(memory.submittedAt).toLocaleDateString('ko-KR')}</time></div></div>
      {memory.photos.length > 0 && <section className="memory-gallery" aria-label="추억 사진">
        <div className="memory-main-photo"><img src={memory.photos[selectedPhoto].url} alt={`${memory.title} 사진 ${selectedPhoto + 1}`} /></div>
        {memory.photos.length > 1 && <div className="memory-photo-thumbs">{memory.photos.map((photo, index) => <button className={selectedPhoto === index ? 'selected' : ''} key={`${photo.url}-${index}`} onClick={() => setSelectedPhoto(index)} aria-label={`${index + 1}번째 사진 보기`}><img src={photo.url} alt="" /></button>)}</div>}
      </section>}
      <div className="memory-story"><p>{memory.body || '사진과 함께 전해진 소중한 추억입니다.'}</p></div>
      <footer><button className={liked ? 'heart-button liked' : 'heart-button'} onClick={() => setLiked(value => !value)} aria-pressed={liked}>♥ <span>함께 기억합니다{liked ? ' 1' : ''}</span></button><Link href="/contribute">나도 추억 남기기</Link></footer>
    </article>
  </main>;
}

export default function MemoryDetailPage() {
  return <Suspense fallback={<main className="memory-detail-page"><p className="community-state">추억을 불러오고 있습니다…</p></main>}><MemoryDetailContent /></Suspense>;
}
