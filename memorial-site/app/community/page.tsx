'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MemoryHeart from '../components/MemoryHeart';
import { loadPublicMemories, type PublicMemory } from '../lib/publicMemories';

export default function CommunityPage() {
  const [memories, setMemories] = useState<PublicMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(8);

  useEffect(() => {
    loadPublicMemories()
      .then(setMemories)
      .catch(reason => setError(reason instanceof Error ? reason.message : '추억을 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  return <main className="community-page">
    <header>
      <Link href="/">← 故 정영훈님</Link>
      <div><p className="section-kicker">함께 기억합니다</p><h1>추억 이야기</h1><p>가족과 친구, 제자들이 남긴 사진과 이야기를 한 편씩 천천히 만나보세요.</p></div>
      <Link className="community-write" href="/contribute">추억 보내기</Link>
    </header>

    <div className="feed-heading" id="memories"><div><p>MEMORY BOARD</p><h2>최근 추억</h2></div><Link href="/photos">전체 사진 보기</Link></div>
    {loading && <p className="community-state">추억을 불러오고 있습니다…</p>}
    {error && <p className="community-state" role="alert">{error}</p>}
    {!loading && !error && memories.length === 0 && <section className="community-empty"><h2>아직 공개된 추억이 없습니다</h2><p>보내주신 사진과 이야기는 가족이 확인하고 공개를 승인한 뒤 이곳에 나타납니다.</p><Link href="/contribute">사진과 추억 보내기</Link></section>}

    <section className="community-feed" aria-label="공개된 추억 목록">
      {memories.slice(0, visible).map(memory => <article className={memory.isPinned ? 'memory-card pinned' : 'memory-card'} key={memory.id}>
        <Link className="memory-card-link" style={!memory.photos.length ? {gridTemplateColumns:'1fr'} : undefined} href={`/community/story?id=${encodeURIComponent(memory.id)}`} aria-label={`${memory.title} 전체 내용 보기`}>
          {memory.photos[0] && <div className="memory-card-cover"><img src={memory.photos[0].url} alt="" /></div>}
          <div className="memory-card-copy">
            <div className="post-meta"><span>{memory.isPinned ? '📌 중요 소식' : (memory.category || memory.group)}</span><span>{new Date(memory.submittedAt).toLocaleDateString('ko-KR')}</span></div>
            <h2>{memory.title}</h2>
            <p>{memory.body || '사진과 함께 전해진 소중한 추억입니다.'}</p>
            <strong>전체 이야기 보기 <span aria-hidden="true">→</span></strong>
          </div>
        </Link>
        <div className="post-footer"><MemoryHeart id={memory.id} initialCount={memory.likeCount} /><span>가족 확인 완료</span></div>
      </article>)}
    </section>
    {visible < memories.length && <button className="load-more" onClick={() => setVisible(value => value + 8)}>추억 더 보기</button>}
    <Link className="community-mobile-write" href="/contribute">＋ 추억 보내기</Link>
  </main>;
}
