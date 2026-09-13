import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { LETTER_SEEN_KEY, memorialLetter, letterWasDismissed, rememberLetterDismissal } from '../app/lib/memorialLetter.ts';

test('letter preserves Korean paragraphs and keeps English separately', () => {
  assert.equal(memorialLetter.ko.length, 12);
  assert.equal(memorialLetter.ko[0], '그날의 진동과 울림은 아직도 제 가슴속에 남아 있습니다.');
  assert.equal(memorialLetter.ko.at(-1), '별은 떨어졌지만,\n그 빛은 아직 우리 곁에 남아 있습니다.');
  assert.equal(memorialLetter.en.length, memorialLetter.ko.length);
  assert.match(memorialLetter.en.at(-1), /its light is still here with us/);
});
test('dismissal persists without changing contribution data', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  assert.equal(letterWasDismissed(storage), false);
  rememberLetterDismissal(storage);
  assert.equal(letterWasDismissed(storage), true);
  assert.deepEqual([...values.keys()], [LETTER_SEEN_KEY]);
});
test('unavailable storage does not prevent dismissal', () => {
  const storage = { getItem() { throw Error('Unavailable'); }, setItem() { throw Error('Unavailable'); } };
  assert.equal(letterWasDismissed(storage), false);
  assert.doesNotThrow(() => rememberLetterDismissal(storage));
});
test('frontend uses accessible native dialog, session fallback and reduced motion', () => {
  const component = readFileSync(new URL('../app/components/MemorialLetter.tsx', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../app/components/memorial-letter.css', import.meta.url), 'utf8');
  assert.match(component, /aria-labelledby="memorial-letter-label"/);
  assert.match(component, /onCancel=\{remember\}/);
  assert.match(component, /sessionStorage/);
  assert.match(component, /node.showModal\(\);\s+node.scrollTop = 0/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /height: 100dvh/);
  assert.doesNotMatch(component, /<audio|fetch\(|autoplay/i);
});
