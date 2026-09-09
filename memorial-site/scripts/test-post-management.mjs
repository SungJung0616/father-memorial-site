// Isolated handler regressions. No AWS/network writes or real credentials.
import { mock, test } from 'node:test';
import assert from 'node:assert/strict';

const table = 'test-content';
const records = new Map();
let copies = 0;
const db = { async send(command) {
  const p = command.input;
  if (command.constructor.name === 'GetCommand') return { Item: structuredClone(records.get(p.Key.PK)) };
  if (command.constructor.name === 'QueryCommand') return { Items: [...records.values()].map(structuredCloneSafe) }; // deliberately stale GSI
  if (command.constructor.name === 'BatchGetCommand') {
    assert.equal(p.RequestItems[table].ConsistentRead, true);
    return { Responses: { [table]: p.RequestItems[table].Keys.map(key => structuredCloneSafe(records.get(key.PK))).filter(Boolean) } };
  }
  if (command.constructor.name === 'UpdateCommand') {
    const item = records.get(p.Key.PK);
    const v = p.ExpressionAttributeValues;
    const expected = v[':previous'] ?? v[':pending'];
    if (expected && item.status !== expected) throw Object.assign(new Error('conflict'), { name: 'ConditionalCheckFailedException' });
    // Execute the fields used by management handlers, retaining unrelated metadata.
    const mapping = { ':title': 'titleKo', ':memory': 'memoryKo', ':contributor': 'contributor', ':sharing': 'sharing', ':category': 'category', ':note': 'adminNote', ':gsi': 'GSI1PK', ':publishedFiles': 'publishedFiles' };
    for (const [key, field] of Object.entries(mapping)) if (key in v) item[field] = structuredCloneSafe(v[key]);
    if (v[':next'] || v[':status']) item.status = v[':next'] ?? v[':status'];
    if (v[':original'] && !item.originalSubmission) item.originalSubmission = structuredCloneSafe(v[':original']);
    return {};
  }
  throw new Error(`Unexpected command ${command.constructor.name}`);
} };
function structuredCloneSafe(value) { return structuredClone(value); }
mock.module('../netlify/functions/_shared.mts', { namedExports: {
  documentClient: () => db, tableName: () => table, requiredEnv: () => 'test',
  s3Client: () => ({ send: async () => { copies++; return {}; } }),
  requireAdmin: async request => ({ email: 'test-admin', groups: [request.headers.get('x-test-role') || 'admin'] }),
  json: (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers }),
  handleError: error => { throw error; },
} });
mock.module('@aws-sdk/s3-request-presigner', { namedExports: { getSignedUrl: async (_client, command) => `https://example.invalid/${command.input.Key}` } });
const { default: manage } = await import('../netlify/functions/admin-submissions.mts');
const { default: publicApi } = await import('../netlify/functions/public-memories.mts');
const { default: heroApi } = await import('../netlify/functions/site-settings.mts');
async function action(id, action, fields = {}, role = 'admin') {
  return manage(new Request('https://example.invalid/api/admin/submissions', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-role': role }, body: JSON.stringify({ submissionId: id, action, ...fields }) }));
}
async function visible(id, expected) {
  const detail = await publicApi(new Request(`https://example.invalid/api/memories?id=${id}`));
  assert.equal(detail.status, expected ? 200 : 404);
  const list = await publicApi(new Request('https://example.invalid/api/memories'));
  assert.equal(list.headers.get('cache-control'), 'no-store');
  assert.equal((await list.json()).memories.some(item => item.id === id), expected);
}

for (const photo of [false, true]) test(`management lifecycle: ${photo ? 'photo' : 'text-only'}`, async () => {
  const id = photo ? '11111111-1111-4111-8111-111111111111' : '22222222-2222-4222-8222-222222222222';
  const key = `SUBMISSION#${id}`;
  const files = photo ? [{ key: `pending/${id}/photo.jpg`, originalName: 'photo.jpg', type: 'image/jpeg', size: 100 }] : [];
  const publishedFiles = files.map(file => ({ ...file, publishedKey: `published/${id}/001.jpg`, webKey: `web/${id}/001.webp`, thumbKey: `thumb/${id}/001.webp`, processingStatus: 'READY' }));
  const original = { contributor: { name: 'original author', relationship: '가족', memory: 'original memory' }, consent: { providerRights: true, peopleNotice: photo }, sharing: 'review' };
  records.set(key, { PK: key, SK: 'META', submissionId: id, status: 'PUBLISHED', ...structuredClone(original), files, publishedFiles, titleKo: 'original title', likeCount: 9, pinned: true });
  assert.equal((await action(id, 'edit', { title: 'edited', memory: 'updated memory', name: 'corrected author', relationship: '친구', category: '행사', sharing: 'family', adminNote: 'corrected after confirmation', consent: { providerRights: false } })).status, 200);
  assert.deepEqual(records.get(key).originalSubmission, original);
  assert.deepEqual(records.get(key).consent, original.consent);
  assert.equal(records.get(key).contributor.relationship, '친구');
  await visible(id, true);
  assert.equal((await action(id, 'family', {}, 'family')).status, 200);
  await visible(id, false);
  if (photo) {
    records.set('CONFIG#SITE', { heroes: [{ id: 'selected', source: 's3', key: publishedFiles[0].publishedKey, labelKo: 'test', labelEn: 'test' }] });
    const heroes = await (await heroApi(new Request('https://example.invalid/api/site-settings'))).json();
    assert.equal(heroes.heroes.some(hero => hero.id === 'selected'), false);
    records.delete('CONFIG#SITE');
  }
  assert.equal((await action(id, 'approve', { publicationConfirmed: true }, 'family')).status, 200);
  await visible(id, true);
  assert.equal((await action(id, 'trash', {}, 'family')).status, 403);
  assert.equal((await action(id, 'edit', { title: 'bad', memory: 'bad' }, 'reviewer')).status, 403);
  assert.equal((await action(id, 'trash')).status, 200);
  await visible(id, false);
  const denied = await manage(new Request('https://example.invalid/api/admin/submissions?status=TRASH', { headers: { 'x-test-role': 'family' } }));
  assert.equal(denied.status, 403);
  assert.equal((await action(id, 'restore')).status, 200);
  assert.equal(records.get(key).status, 'FAMILY');
  await visible(id, false);
  assert.deepEqual(records.get(key).publishedFiles, publishedFiles);
  assert.equal(records.get(key).likeCount, 9);
  assert.equal(copies, 0, 'republish/restore must not copy or process existing images');
  assert.equal((await action(id, 'approve', { publicationConfirmed: true })).status, 200);
  await visible(id, true);
});

test('supplemental consent required without original public request', async () => {
  const id = '33333333-3333-4333-8333-333333333333';
  const key = `SUBMISSION#${id}`;
  records.set(key, { PK: key, SK: 'META', submissionId: id, status: 'FAMILY', sharing: 'family', contributor: { name: 'private', relationship: '가족', memory: 'private' }, consent: { providerRights: true, peopleNotice: false }, files: [], publishedFiles: [] });
  assert.equal((await action(id, 'approve', { publicationConfirmed: true })).status, 400);
  assert.equal((await action(id, 'edit', { title: '', memory: 'private', sharing: 'review', adminNote: 'Confirmed additional permission with contributor' })).status, 200);
  assert.equal((await action(id, 'approve')).status, 400);
  assert.equal((await action(id, 'approve', { publicationConfirmed: true })).status, 200);
  assert.equal(records.get(key).originalSubmission.sharing, 'family');
});
