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
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState('');

  async function fetchSettings() {
    const response = await fetch('/api/site-settings?admin=1', { cache: 'no-store' });
    const result = await response.json() as { heroes?: HeroItem[]; candidates?: HeroItem[]; error?: string };
    if (!response.ok) throw new Error(result.error || '대표사진을 불러오지 못했습니다.');
    return { heroes: result.heroes ?? [], candidates: result.candidates ?? [] };
  }

  useEffect(() => {
    fetchSettings().then(result => { setHeroes(result.heroes); setCandidates(result.candidates); }).catch(reason => setMessage(reason instanceof Error ? reason.message : '대표사진을 불러오지 못했습니다.')).finally(() => setLoading(false));
  }, []);

  function updateHero(index: number, update: Partial<HeroItem>) {
    setHeroes(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...update } : item));
    setDirty(true);
    setMessage('');
  }

  function setFocalPoint(index: number, event: React.MouseEvent<HTMLButtonElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    updateHero(index, {
      focalX: Math.round(((event.clientX - bounds.left) / bounds.width) * 100),
      focalY: Math.round(((event.clientY - bounds.top) / bounds.height) * 100),
    });
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= heroes.length) return;
    setHeroes(current => { const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next; });
    setDirty(true); setMessage('');
  }

  function add(candidate: HeroItem) {
    if (heroes.length >= 5) { setMessage('대표사진은 최대 5장까지 선택할 수 있습니다.'); return; }
    if (heroes.some(item => (item.key && item.key === candidate.key) || item.id === candidate.id)) { setMessage('이미 대표사진에 포함되어 있습니다.'); return; }
    setHeroes(current => [...current, candidate]); setDirty(true); setMessage('후보를 마지막 순서에 추가했습니다. 저장을 눌러 공개해 주세요.');
  }

  async function save() {
    if (!heroes.length) return;
    setSaving(true); setMessage('');
    try {
      const response = await fetch('/api/site-settings', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ heroes }) });
      const result = await response.json() as { heroes?: HeroItem[]; error?: string };
      if (!response.ok) throw new Error(result.error || '대표사진을 저장하지 못했습니다.');
      if (!result.heroes) throw new Error('저장 응답을 확인하지 못했습니다.');
      const confirmResponse = await fetch(`/api/site-settings?verify=${Date.now()}`, { cache: 'no-store' });
      const confirmed = await confirmResponse.json() as { heroes?: HeroItem[]; error?: string };
      if (!confirmResponse.ok || !confirmed.heroes?.length) throw new Error(confirmed.error || '공개 홈의 대표사진 설정을 확인하지 못했습니다.');
      setHeroes(confirmed.heroes); setDirty(false); setMessage('저장 후 공개 홈의 대표사진 설정을 다시 확인했습니다.');
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : '대표사진을 저장하지 못했습니다.'); }
    finally { setSaving(false); }
  }

  if (loading) return <section className="hero-manager"><p>대표사진을 불러오고 있습니다…</p></section>;
  return <section className="hero-manager">
    <div className="panel-heading"><div><span>최대 5장</span><h2>현재 대표사진과 순서</h2></div><strong>{heroes.length}장 사용 중</strong></div>
    <p className="hero-manager-intro">첫 번째 사진부터 홈 화면에 순서대로 나타납니다. 공개 승인된 사진을 후보로 추가한 뒤 순서를 바꾸고 저장하세요.</p>
    <div className="hero-current-list">{heroes.map((hero, index) => <article key={`${hero.id}-${index}`}>
      <button className="hero-focal-preview" type="button" onClick={event => setFocalPoint(index, event)} aria-label={`${index + 1}번째 사진 초점 위치 지정`}>
        <img src={hero.url} alt={hero.labelKo} style={{ objectPosition: `${hero.focalX ?? 50}% ${hero.focalY ?? 50}%` }} />
        <span className="hero-focal-marker" style={{ left: `${hero.focalX ?? 50}%`, top: `${hero.focalY ?? 50}%` }} aria-hidden="true" />
        <small>얼굴이나 중심을 눌러 초점을 지정하세요</small>
      </button>
      <div className="hero-fields"><span>{index + 1}번째</span><label>한글 사진 설명<input value={hero.labelKo} onChange={event => updateHero(index, { labelKo: event.target.value })} /></label><label>영문 사진 설명<input lang="en" value={hero.labelEn} onChange={event => updateHero(index, { labelEn: event.target.value })} /></label><div className="hero-focal-sliders"><label>좌우 초점 {Math.round(hero.focalX ?? 50)}%<input type="range" min="0" max="100" value={hero.focalX ?? 50} onChange={event => updateHero(index, { focalX: Number(event.target.value) })} /></label><label>상하 초점 {Math.round(hero.focalY ?? 50)}%<input type="range" min="0" max="100" value={hero.focalY ?? 50} onChange={event => updateHero(index, { focalY: Number(event.target.value) })} /></label></div></div>
      <div className="hero-order-actions"><button disabled={index === 0} onClick={() => move(index, -1)}>앞으로</button><button disabled={index === heroes.length - 1} onClick={() => move(index, 1)}>뒤로</button><button className="remove" disabled={heroes.length === 1} onClick={() => { setHeroes(current => current.filter((_, itemIndex) => itemIndex !== index)); setDirty(true); setMessage(''); }}>제외</button></div>
    </article>)}</div>
    <div className="hero-manager-save"><button onClick={save} disabled={saving || !heroes.length || !dirty}>{saving ? '저장하는 중…' : '대표사진 설정 저장'}</button><div>{dirty && <strong>● 저장되지 않은 변경사항</strong>}{message && <p role="status">{message}</p>}</div></div>
    <div className="panel-heading hero-candidate-heading"><div><span>공개 승인 자료</span><h2>대표사진 후보</h2></div><button onClick={onGoUpload}>새 사진 업로드</button></div>
    {candidates.length ? <div className="hero-candidate-grid">{candidates.map(candidate => <article key={candidate.id}><img src={candidate.url} alt={candidate.labelKo} /><div><strong>{candidate.labelKo}</strong><button onClick={() => add(candidate)}>대표사진에 추가</button></div></article>)}</div> : <div className="member-setup-note"><strong>추가 후보가 없습니다</strong><p>새 사진을 대량 업로드하고 게시물 관리에서 공개 승인하면 이곳의 후보 목록에 나타납니다.</p></div>}
  </section>;
}
