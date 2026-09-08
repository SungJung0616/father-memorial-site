export type PublicMemory = {
  id: string;
  group: string;
  submittedAt: string;
  title: string;
  body: string;
  category: string;
  photos: { url: string; type: string }[];
  isPinned?: boolean;
};

const CACHE_KEY = 'memorial-public-memories-v1';
const CACHE_LIFETIME_MS = 5 * 60 * 1000;
let pendingList: Promise<PublicMemory[]> | null = null;

type MemoryCache = { savedAt: number; memories: PublicMemory[] };

function readCache(): MemoryCache | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null') as MemoryCache | null;
    if (!cached || !Array.isArray(cached.memories) || Date.now() - cached.savedAt > CACHE_LIFETIME_MS) return null;
    return cached;
  } catch {
    return null;
  }
}

function saveCache(memories: PublicMemory[]) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), memories } satisfies MemoryCache));
  } catch {
    // Private browsing or a full browser store should not prevent the page loading.
  }
}

export async function loadPublicMemories(): Promise<PublicMemory[]> {
  const cached = readCache();
  if (cached) return cached.memories;
  if (pendingList) return pendingList;

  pendingList = fetch('/api/memories')
    .then(async response => {
      const result = await response.json() as { memories?: PublicMemory[]; error?: string };
      if (!response.ok) throw new Error(result.error || '추억을 불러오지 못했습니다.');
      const memories = result.memories ?? [];
      saveCache(memories);
      return memories;
    })
    .finally(() => { pendingList = null; });

  return pendingList;
}

export async function loadPublicMemory(id: string): Promise<PublicMemory> {
  const cached = readCache()?.memories.find(memory => memory.id === id);
  if (cached) return cached;

  const response = await fetch(`/api/memories?id=${encodeURIComponent(id)}`);
  const result = await response.json() as { memory?: PublicMemory; error?: string };
  if (!response.ok || !result.memory) throw new Error(result.error || '추억을 찾을 수 없습니다.');
  return result.memory;
}

export function prefetchPublicMemories() {
  void loadPublicMemories().catch(() => undefined);
}
