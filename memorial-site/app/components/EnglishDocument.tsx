'use client';

import { useEffect } from 'react';

export default function EnglishDocument({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = 'en';
    return () => { document.documentElement.lang = 'ko'; };
  }, []);

  return children;
}
