'use client';

import { useEffect, useRef } from 'react';
import { startSaxophoneEntrance } from '../lib/saxophoneEntrance';

/** A loading indicator, never a timed introduction or a prerequisite to reading. */
export default function SaxophoneEntrance({ language = 'ko' }: { language?: 'ko' | 'en' }) {
  const entrance = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = entrance.current;
    const image = document.querySelector<HTMLImageElement>('.hero-slide.active .hero-photo');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (panel) return startSaxophoneEntrance(panel, image, motion, window);
  }, []);

  return <div ref={entrance} className="saxophone-entrance" hidden aria-hidden="true">
    <div className="saxophone-entrance-mark">
      <svg viewBox="0 0 160 220" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path className="saxophone-outline" pathLength="1" d="M53 25h16c13 0 20 8 20 21v102c0 13 5 21 14 21s15-9 15-22v-17l-12-21 38-14-9 30v25c0 30-12 48-33 48-23 0-36-19-36-47V49c0-5-2-7-7-7H45l8-17Z" />
          <path d="m42 27-9-5 4-7 17 10M73 64h14M73 85h14M73 106h14M73 127h14M107 109l31-11M110 117l25-9" />
          <circle cx="77" cy="70" r="3" /><circle cx="77" cy="91" r="3" /><circle cx="77" cy="112" r="3" /><circle cx="77" cy="133" r="3" />
        </g>
      </svg>
      <p>Young Hoon Jung</p><span>{language === 'en' ? 'A Life Remembered' : '함께 기억하는 삶'}</span>
    </div>
  </div>;
}
