export type PublicMemory = {
  id: string;
  group: string;
  submittedAt: string;
  title: string;
  body: string;
  category: string;
  photos: { url: string; type: string }[];
  isPinned?: boolean;
  likeCount?: number;
};

const CACHE_KEY = 'memorial-public-memories-v1';
let pendingList: Promise<PublicMemory[]> | null = null;
export function invalidatePublicMemories() {
  try { sessionStorage.removeItem(CACHE_KEY); } catch { /* Storage may be unavailable. */ }
  pendingList = null;
}

export async function loadPublicMemories(): Promise<PublicMemory[]> {
  if (pendingList) return pendingList;

  pendingList = fetch(`/api/memories?refresh=${Date.now()}`, { cache: 'no-store' })
    .then(async response => {
      const result = await response.json() as { memories?: PublicMemory[]; error?: string };
      if (!response.ok) throw new Error(result.error || '추억을 불러오지 못했습니다.');
      const memories = result.memories ?? [];
      return memories;
    })
    .finally(() => { pendingList = null; });

  return pendingList;
}

export async function loadPublicMemory(id: string): Promise<PublicMemory> {
  const response = await fetch(`/api/memories?id=${encodeURIComponent(id)}&refresh=${Date.now()}`, { cache: 'no-store' });
  const result = await response.json() as { memory?: PublicMemory; error?: string };
  if (!response.ok || !result.memory) throw new Error(result.error || '추억을 찾을 수 없습니다.');
  return result.memory;
}

export function prefetchPublicMemories() {
  void loadPublicMemories().catch(() => undefined);
}
