import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../app/components/TeachingResearch.tsx', import.meta.url), 'utf8');
const publications = source.split('const publications: PublicationRecord[] = [')[1].split('\n];')[0];
const patents = source.split('const patents = [')[1].split('\n];')[0];

test('retains the ten family-CV records and adds only two sourced synthesis studies', () => {
  assert.equal((publications.match(/year: '/g) ?? []).length, 12);
  assert.equal((publications.match(/source: 'https:\/\/doi.org\//g) ?? []).length, 2);
  assert.doesNotMatch(publications, /rhodium/i);
  assert.match(source, /const featured = \[9, 4, 0\]/);
  assert.match(publications, /Palladium\(II\)-Catalyzed Isomerization/);
  assert.equal((publications.match(/In Su Kim/g) ?? []).length, 2);
  assert.match(publications, /10\.3390\/molecules27082603/);
  assert.match(publications, /10\.1016\/j\.carres\.2023\.108746/);
});

test('patents use verified grant identifiers and publication dates, not application numbers', () => {
  assert.equal((patents.match(/number: '/g) ?? []).length, 3);
  for (const number of ['KR102078528B1', 'US6831061B2', 'US6255517B1']) assert.match(patents, new RegExp(number));
  for (const date of ['2020-02-19', '2004-12-14', '2001-07-03']) assert.match(patents, new RegExp(date));
  assert.doesNotMatch(patents, /US6887882B2|10-2018-0045283/);
});

test('bilingual labels, dynamic expansion and original author credits are present', () => {
  assert.match(source, /publications\.length/);
  assert.match(source, /Selected Patents/);
  assert.match(source, /특허로 남은 연구/);
  assert.match(source, /item\.authors/);
  assert.match(source, /item\.englishTitle/);
  assert.match(source, /Grant publication/);
  assert.match(source, /등록공보 발행/);
  assert.doesNotMatch(source, /yhjung@|prboggu@/);
});
