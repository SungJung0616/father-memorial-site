'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import MemoryHeart from '../components/MemoryHeart';
import { loadPublicMemories, type PublicMemory } from '../lib/publicMemories';

const relationshipEn: Record<string, string> = {
  '가족': 'Family', '가족·친지': 'Family', '친구': 'Friend', '제자': 'Student', '동료': 'Colleague',
  '교수·학계': 'Colleague', '기타': 'A shared connection', '추억': 'A shared memory',
};

function CommunityContent() {
  const en = useSearchParams()?.get('lang') === 'en';
  const [memories, setMemories] = useState<PublicMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(8);
  const home = en ? '/en' : '/';
  const contribute = en ? '/en/contribute' : '/contribute';

  useEffect(() => {
    loadPublicMemories()
      .then(setMemories)
      .catch(reason => setError(en ? 'We could not load the memories. Please refresh to try again.' : (reason instanceof Error ? reason.message : '추억을 불러오지 못했습니다.')))
      .finally(() => setLoading(false));
  }, [en]);

  const relation = (value: string) => en ? relationshipEn[value] || value : value;
  const storyHref = (id: string) => `/community/story?id=${encodeURIComponent(id)}${en ? '&lang=en' : ''}`;

  return <main className="community-page" lang={en ? 'en' : 'ko'}>
    <header>
      <Link href={home}>{en ? '← In Memory of Professor Jung' : '← 故 정영훈님'}</Link>
      <div><p className="section-kicker">{en ? 'REMEMBERING TOGETHER' : '함께 기억합니다'}</p><h1>{en ? 'Shared Memories' : '추억 이야기'}</h1><p>{en ? 'Take your time with the photographs and stories shared by family, friends, students, and colleagues.' : '가족과 친구, 제자들이 남긴 사진과 이야기를 한 편씩 천천히 만나보세요.'}</p></div>
      <Link className="community-write" href={contribute}>{en ? 'Share a Memory' : '추억 보내기'}</Link>
    </header>

    <div className="feed-heading" id="memories"><div><p>MEMORY BOARD</p><h2>{en ? 'Recent Memories' : '최근 추억'}</h2></div><Link href={en ? '/en/photos' : '/photos'}>{en ? 'View All Photos' : '전체 사진 보기'}</Link></div>
    {loading && <p className="community-state">{en ? 'Gathering shared memories…' : '추억을 불러오고 있습니다…'}</p>}
    {error && <p className="community-state" role="alert">{error}</p>}
    {!loading && !error && memories.length === 0 && <section className="community-empty"><h2>{en ? 'No memories have been published yet' : '아직 공개된 추억이 없습니다'}</h2><p>{en ? 'Memories appear here after the family has reviewed and approved them.' : '보내주신 사진과 이야기는 가족이 확인하고 공개를 승인한 뒤 이곳에 나타납니다.'}</p><Link href={contribute}>{en ? 'Share a Memory' : '사진과 추억 보내기'}</Link></section>}

    <section className="community-feed" aria-label={en ? 'Published memories' : '공개된 추억 목록'}>
      {memories.slice(0, visible).map(memory => <article className={memory.isPinned ? 'memory-card pinned' : 'memory-card'} key={memory.id}>
        <Link className="memory-card-link" style={!memory.photos.length ? {gridTemplateColumns:'1fr'} : undefined} href={storyHref(memory.id)} aria-label={en ? `Read ${memory.title}` : `${memory.title} 전체 내용 보기`}>
          {memory.photos[0] && <div className="memory-card-cover"><img src={memory.photos[0].url} alt="" /></div>}
          <div className="memory-card-copy">
            <div className="post-meta"><span>{memory.isPinned ? (en ? '📌 Featured Memory' : '📌 중요 소식') : relation(memory.category || memory.group)}</span><span>{new Date(memory.submittedAt).toLocaleDateString(en ? 'en-US' : 'ko-KR')}</span></div>
            <h2>{memory.title}</h2>
            <p>{memory.body || (en ? 'A cherished moment shared in photographs.' : '사진과 함께 전해진 소중한 추억입니다.')}</p>
            <strong>{en ? 'Read the Memory' : '전체 이야기 보기'} <span aria-hidden="true">→</span></strong>
          </div>
        </Link>
        <div className="post-footer"><MemoryHeart id={memory.id} initialCount={memory.likeCount} language={en ? 'en' : 'ko'} /><span>{en ? 'Reviewed by the family' : '가족 확인 완료'}</span></div>
      </article>)}
    </section>
    {visible < memories.length && <button className="load-more" onClick={() => setVisible(value => value + 8)}>{en ? 'View More Memories' : '추억 더 보기'}</button>}
    <Link className="community-mobile-write" href={contribute}>{en ? '+ Share a Memory' : '＋ 추억 보내기'}</Link>
  </main>;
}

export default function CommunityPage() {
  return <Suspense fallback={<main className="community-page"><p className="community-state">Loading…</p></main>}><CommunityContent /></Suspense>;
}
