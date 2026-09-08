'use client';

import { useEffect, useState } from 'react';

type HeroItem = {
  id: string; source: 'static' | 's3'; url: string; key?: string;
  labelKo: string; labelEn: string; focalX?: number; focalY?: number;
};

export default function HeroManager({ onGoUpload }: { onGoUpload: () => void }) {
  const [heroes, setHeroes] = useState<HeroItem[]>([]);
  const [candidates, setCandidates] = useState<HeroItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/site-settings?admin=1').then(async response => {
      const result = await response.json() as { heroes?: HeroItem[]; candidates?: HeroItem[]; error?: string };
      if (!response.ok) throw new Error(result.error || '대표사진을 불러오지 못했습니다.');
      setHeroes(result.heroes ?? []); setCandidates(result.candidates ?? []);
    }).catch(reason => setMessage(reason instanceof Error ? reason.message : '대표사진을 불러오지 못했습니다.')).finally(() => setLoading(false));
  }, []);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= heroes.length) return;
    setHeroes(current => { const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next; });
  }

  function add(candidate: HeroItem) {
    if (heroes.length >= 5) { setMessage('대표사진은 최대 5장까지 선택할 수 있습니다.'); return; }
    if (heroes.some(item => (item.key && item.key === candidate.key) || item.id === candidate.id)) { setMessage('이미 대표사진에 포함되어 있습니다.'); return; }
    setHeroes(current => [...current, candidate]); setMessage('후보를 마지막 순서에 추가했습니다. 저장을 눌러 공개해 주세요.');
  }

  async function save() {
    if (!heroes.length) return;
    setSaving(true); setMessage('');
    try {
      const response = await fetch('/api/site-settings', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ heroes }) });
      const result = await response.json() as { heroes?: HeroItem[]; error?: string };
      if (!response.ok) throw new Error(result.error || '대표사진을 저장하지 못했습니다.');
      setHeroes(result.heroes ?? heroes); setMessage('대표사진 순서와 선택을 공개 사이트에 저장했습니다.');
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : '대표사진을 저장하지 못했습니다.'); }
    finally { setSaving(false); }
  }

  if (loading) return <section className="hero-manager"><p>대표사진을 불러오고 있습니다…</p></section>;
  return <section className="hero-manager">
    <div className="panel-heading"><div><span>최대 5장</span><h2>현재 대표사진과 순서</h2></div><strong>{heroes.length}장 사용 중</strong></div>
    <p className="hero-manager-intro">첫 번째 사진부터 홈 화면에 순서대로 나타납니다. 공개 승인된 사진을 후보로 추가한 뒤 순서를 바꾸고 저장하세요.</p>
    <div className="hero-current-list">{heroes.map((hero, index) => <article key={`${hero.id}-${index}`}>
      <img src={hero.url} alt={hero.labelKo} style={{ objectPosition: `${hero.focalX ?? 50}% ${hero.focalY ?? 50}%` }} />
      <div><span>{index + 1}번째</span><input aria-label={`${index + 1}번째 사진 설명`} value={hero.labelKo} onChange={event => setHeroes(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, labelKo: event.target.value } : item))} /></div>
      <div className="hero-order-actions"><button disabled={index === 0} onClick={() => move(index, -1)}>앞으로</button><button disabled={index === heroes.length - 1} onClick={() => move(index, 1)}>뒤로</button><button className="remove" disabled={heroes.length === 1} onClick={() => setHeroes(current => current.filter((_, itemIndex) => itemIndex !== index))}>제외</button></div>
    </article>)}</div>
    <div className="hero-manager-save"><button onClick={save} disabled={saving || !heroes.length}>{saving ? '저장하는 중…' : '대표사진 순서 저장'}</button>{message && <p role="status">{message}</p>}</div>
    <div className="panel-heading hero-candidate-heading"><div><span>공개 승인 자료</span><h2>대표사진 후보</h2></div><button onClick={onGoUpload}>새 사진 업로드</button></div>
    {candidates.length ? <div className="hero-candidate-grid">{candidates.map(candidate => <article key={candidate.id}><img src={candidate.url} alt={candidate.labelKo} /><div><strong>{candidate.labelKo}</strong><button onClick={() => add(candidate)}>대표사진에 추가</button></div></article>)}</div> : <div className="member-setup-note"><strong>추가 후보가 없습니다</strong><p>새 사진을 대량 업로드하고 게시물 관리에서 공개 승인하면 이곳의 후보 목록에 나타납니다.</p></div>}
  </section>;
}
