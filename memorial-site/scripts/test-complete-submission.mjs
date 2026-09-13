// Offline launch regressions: no real AWS writes, credentials or published data.
import { mock, test } from 'node:test';
import assert from 'node:assert/strict';

let saved;
let heads = 0;
mock.module('../netlify/functions/_shared.mts', { namedExports: {
  documentClient: () => ({ send: async command => { saved = command.input.Item; return {}; } }),
  tableName: () => 'test-content', requiredEnv: () => 'test-bucket',
  s3Client: () => ({ send: async () => { heads++; return {}; } }),
  json: (data, status = 200) => new Response(JSON.stringify(data), { status }),
  handleError: error => { throw error; },
} });
const { default: complete } = await import('../netlify/functions/complete-submission.mts');
const id = '33333333-3333-4333-8333-333333333333';
const original = 'Professor Jung’s teaching — “a lasting memory.”\n\nIt is a student\'s original contribution.';
const payload = { submissionId: id, sharing: 'review', title: 'TEST — original English', contributor: { name: 'TEST', relationship: '교수·학계', memory: original }, consent: { providerRights: true, peopleNotice: false }, files: [] };
const submit = data => complete(new Request('https://example.invalid/api/complete-submission', { method: 'POST', body: JSON.stringify(data) }));

test('text-only public request stays PENDING, preserves English, and never touches S3', async () => {
  const response = await submit(payload);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, 'PENDING');
  assert.equal(saved.GSI1PK, 'STATUS#PENDING');
  assert.equal(saved.contributor.memory, original);
  assert.equal(saved.titleKo, payload.title);
  assert.deepEqual(saved.files, []);
  assert.equal(heads, 0);
});
test('photo public request validates existing upload and remains PENDING', async () => {
  const response = await submit({ ...payload, consent: { providerRights: true, peopleNotice: true }, files: [{ key: `pending/2026/${id}/test.jpg`, originalName: 'test.jpg', type: 'image/jpeg', size: 100 }] });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, 'PENDING');
  assert.equal(heads, 1);
  assert.equal(saved.files.length, 1);
});
test('missing content or required consent is rejected; private choice stays FAMILY', async () => {
  assert.equal((await submit({ ...payload, contributor: { memory: ' ' } })).status, 400);
  assert.equal((await submit({ ...payload, consent: { providerRights: false } })).status, 400);
  assert.equal((await submit({ ...payload, sharing: 'family' })).status, 200);
  assert.equal(saved.status, 'FAMILY');
});
