'use client';
import Link from 'next/link';
import type { PublicMemory } from '../lib/publicMemories';
import { selectHomePhotos } from '../lib/homeMemorySelection';
export default function HomePhotos({ language = 'ko', items, status }: { language?: 'ko' | 'en'; items: PublicMemory[]; status: 'loading' | 'ready' | 'error' }) {
  const en = language === 'en';
  const photos = selectHomePhotos(items);
  return <section className="photo-section" id="photos"><div className="section-shell"><div className="section-heading"><div><p className="section-kicker">Memories in Photographs</p><h2>{en ? 'Memories in Photographs' : '사진으로 만나는 기억'}</h2></div><Link className="text-link" href={en ? '/en/photos' : '/photos'}>{en ? 'View All Photos →' : '전체 사진 보기 →'}</Link></div>
    {status === 'loading' && <p role="status">{en ? 'Loading photographs…' : '사진을 불러오고 있습니다…'}</p>}
    {status === 'error' && <p role="alert">{en ? 'Unable to load photographs. Please refresh the page.' : '사진을 불러오지 못했습니다. 새로고침해 주세요.'}</p>}
    {status === 'ready' && !photos.length && <p>{en ? 'Photographs will appear here after family approval.' : '가족이 공개 승인한 사진이 이곳에 표시됩니다.'}</p>}
    <div className="album-grid">{photos.map(photo => <Link className="album-card" key={photo.memory.id} href={`/community/story?id=${encodeURIComponent(photo.memory.id)}`}><img src={photo.url} alt={photo.memory.title} loading="lazy" style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'contain', display: 'block' }} /><h3>{photo.memory.title}</h3><p>{en ? 'Read the memory →' : '추억 이야기 보기 →'}</p></Link>)}</div>
  </div></section>;
}
