'use client';
import { useEffect, useRef, useState } from 'react';
import { invalidatePublicMemories } from '../lib/publicMemories';

function visitor() {
  const key = 'memorial-reaction-visitor';
  let id = localStorage.getItem(key);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id); }
  return id;
}
export default function MemoryHeart({ id, initialCount = 0 }: { id: string; initialCount?: number }) {
  const [state, setState] = useState({ count: initialCount, liked: false });
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch(`/api/memory-reactions?id=${id}&visitorId=${visitor()}`, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error();
        const result = await response.json() as { count: number; liked: boolean };
        if (active) { setState(result); setReady(true); }
      } catch { if (active) setError('하트를 불러오지 못했습니다. 새로고침해 주세요.'); }
    }
    void load(); return () => { active = false; };
  }, [id]);
  async function toggle() {
    if (lock.current || !ready) return;
    lock.current = true; setBusy(true); setError('');
    const previous = state;
    setState({ liked: !state.liked, count: state.count + (state.liked ? -1 : 1) });
    try {
      const response = await fetch('/api/memory-reactions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, visitorId: visitor(), liked: !previous.liked }), signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error();
      setState(await response.json() as { count: number; liked: boolean });
      invalidatePublicMemories();
    } catch { setState(previous); setError('저장하지 못했습니다. 다시 눌러 주세요.'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <div><button className={state.liked ? 'heart-button liked' : 'heart-button'} disabled={!ready || busy} onClick={toggle} aria-label={state.liked ? '하트 취소' : '하트 누르기'} aria-pressed={state.liked}>♥ <span>{state.count}</span></button>{error && <small role="alert">{error}</small>}</div>;
}
