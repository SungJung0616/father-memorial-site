import type { PublicMemory } from './publicMemories';

// The public API has already checked visibility and whether each pin is active.
export function selectHomeMemories(items: PublicMemory[]) {
  return [...items].sort((a, b) => Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned)) || Date.parse(b.submittedAt) - Date.parse(a.submittedAt)).slice(0, 5);
}

export function selectHomePhotos(items: PublicMemory[]) {
  return items.filter(item => item.photos.length > 0).slice(0, 3).map(memory => ({ ...memory.photos[0], memory }));
}
