'use client';

import { useRef, useState } from 'react';

export default function SaxophoneVideo({ language = 'ko' }: { language?: 'ko' | 'en' }) {
  const [opened, setOpened] = useState(false);
  const [posterIndex, setPosterIndex] = useState(0);
  const posters = ['https://i.ytimg.com/vi/zuJfpkJGUZI/maxresdefault.jpg', 'https://i.ytimg.com/vi/zuJfpkJGUZI/hqdefault.jpg', '/images/hero/jung-young-hoon-02.jpg'];
  const playButton = useRef<HTMLButtonElement>(null);
  const english = language === 'en';
  const close = () => {
    setOpened(false);
    requestAnimationFrame(() => playButton.current?.focus());
  };

  return <section className="sound-feature" id="his-own-sound" aria-labelledby="sound-title">
    <div className="sound-heading section-shell">
      <p className="section-kicker">In His Own Sound</p>
      <h2 id="sound-title" className={english ? undefined : 'sound-title-ko'}>{english ? <>In His<br /><em>Own Sound.</em></> : '그의 연주로 남은 순간'}</h2>
      <p className="sound-introduction">{english ? 'A moment preserved in music.' : '음악으로 간직한 한 순간.'}</p>
    </div>
    <div className="sound-stage" onKeyDown={event => { if (event.key === 'Escape' && opened) close(); }}>
      {opened ? <div className="sound-player">
        <iframe src={`https://www.youtube-nocookie.com/embed/zuJfpkJGUZI?rel=0&playsinline=1&hl=${english ? 'en' : 'ko'}`}
          title={english ? 'Young Hoon Jung — alto saxophone recording' : '정영훈 교수님 알토 색소폰 연주'}
          allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
      </div> : <button ref={playButton} className="sound-poster" onClick={() => setOpened(true)}
        aria-label={english ? 'Open the saxophone recording' : '색소폰 연주 영상 열기'} aria-controls="sound-player-caption">
        {/* Actual recording thumbnail; no player or YouTube script is requested before interaction. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={posters[posterIndex]}
          alt={english ? 'Young Hoon Jung playing the saxophone' : '색소폰을 연주하시는 정영훈 교수님'}
          loading="lazy" width="1280" height="720"
          onLoad={event => { if (event.currentTarget.naturalWidth < 320 && posterIndex < 2) setPosterIndex(posterIndex + 1); }}
          onError={() => { if (posterIndex < 2) setPosterIndex(posterIndex + 1); }} />
        <span className="sound-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l13-8Z" fill="currentColor" /></svg>
          <span>{english ? 'Watch the recording' : '연주 영상 보기'}</span></span>
      </button>}
    </div>
    <div className="sound-caption section-shell" id="sound-player-caption">
      <span>{english ? 'Young Hoon Jung · Alto saxophone' : '정영훈 · 알토 색소폰'}</span>
      <div>{opened && <button onClick={close}>{english ? 'Close recording' : '영상 닫기'}</button>}
        <a href="https://www.youtube.com/watch?v=zuJfpkJGUZI" target="_blank" rel="noopener noreferrer">{english ? 'Watch on YouTube ↗' : 'YouTube에서 보기 ↗'}</a></div>
    </div>
  </section>;
}
