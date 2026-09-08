'use client';

import { useEffect } from 'react';
import { prefetchPublicMemories } from '../lib/publicMemories';

export default function MemoryPrefetch() {
  useEffect(() => {
    const windowWithIdle = window as Window & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (windowWithIdle.requestIdleCallback) {
      const id = windowWithIdle.requestIdleCallback(prefetchPublicMemories, { timeout: 2000 });
      return () => windowWithIdle.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(prefetchPublicMemories, 800);
    return () => window.clearTimeout(id);
  }, []);

  return null;
}
