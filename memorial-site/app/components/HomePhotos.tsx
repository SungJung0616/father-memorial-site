'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadPublicMemories, type PublicMemory } from '../lib/publicMemories';
export default function HomePhotos({ language = 'ko' }: { language?: 'ko' | 'en' }) {
  const en = language === 'en';
  const [items, setItems] = useState<PublicMemory[]>([]);
  const [status, setStatus] = useState('loading');
  useEffect(() => { loadPublicMemories().then(data => { setItems(data); setStatus('ready'); }).catch(() => setStatus('error')); }, []);
  const photos = items.flatMap(item => item.photos.map((photo, index) => ({ ...photo, memory: item, index }))).slice(0, 3);
  return <section className="photo-section" id="photos"><div className="section-shell"><div className="section-heading"><div><p className="section-kicker">Life in photos</p><h2>{en ? 'Moments We Remember' : '사진으로 보는 삶'}</h2></div><Link className="text-link" href={en ? '/en/photos' : '/photos'}>{en ? 'View All Photos →' : '전체 사진 보기 →'}</Link></div>
    {status === 'loading' && <p role="status">{en ? 'Loading photographs…' : '사진을 불러오고 있습니다…'}</p>}
    {status === 'error' && <p role="alert">{en ? 'Unable to load photographs. Please refresh the page.' : '사진을 불러오지 못했습니다. 새로고침해 주세요.'}</p>}
    {status === 'ready' && !photos.length && <p>{en ? 'Photographs will appear here after family approval.' : '가족이 공개 승인한 사진이 이곳에 표시됩니다.'}</p>}
    <div className="album-grid">{photos.map(photo => <Link className="album-card" key={`${photo.memory.id}-${photo.index}`} href={`/community/story?id=${encodeURIComponent(photo.memory.id)}`}><img src={photo.url} alt={photo.memory.title} loading="lazy" style={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', display: 'block' }} /><h3>{photo.memory.title}</h3><p>{en ? 'Read the memory →' : '추억 이야기 보기 →'}</p></Link>)}</div>
  </div></section>;
}
