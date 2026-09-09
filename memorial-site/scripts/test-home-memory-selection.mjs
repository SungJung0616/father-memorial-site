import assert from 'node:assert/strict';
import { test } from 'node:test';
import { selectHomeMemories, selectHomePhotos } from '../app/lib/homeMemorySelection.ts';
const items = Array.from({ length: 7 }, (_, i) => ({ id: String(i), submittedAt: `2026-09-0${7-i}`, isPinned: i === 6, title: 'A memory', group: 'Friend', body: 'Words worth keeping', category: '', likeCount: i * 100, photos: i % 2 ? [] : [{ url: 'one.jpg' }, { url: 'two.jpg' }] }));
test('five public results: active pin first, then newest; never rank by hearts', () => {
  assert.deepEqual(selectHomeMemories(items).map(x => x.id), ['6', '0', '1', '2', '3']);
  assert.equal(items[0].id, '0', 'do not mutate the shared API result');
  assert(selectHomeMemories(items).some(x => !x.photos.length));
});
test('photographs come from different memories, one per memory', () => {
  const photos = selectHomePhotos(items);
  assert.equal(photos.length, 3);
  assert.equal(new Set(photos.map(x => x.memory.id)).size, 3);
  assert(photos.every(x => x.url === 'one.jpg'));
});
test('few and empty results never produce placeholders', () => {
  assert.equal(selectHomeMemories(items.slice(0, 2)).length, 2);
  assert.equal(selectHomeMemories([]).length, 0);
  assert.equal(selectHomePhotos([items[1]]).length, 0);
});
