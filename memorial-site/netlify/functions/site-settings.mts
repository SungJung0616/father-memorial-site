import { GetObjectCommand } from '@aws-sdk/client-s3';
import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { documentClient, handleError, json, requireAdmin, requiredEnv, s3Client, tableName } from './_shared.mts';

type HeroItem = {
  id: string;
  source: 'static' | 's3';
  url?: string;
  key?: string;
  labelKo: string;
  labelEn: string;
  focalX?: number;
  focalY?: number;
};

const defaultHeroes: HeroItem[] = [
  { id: 'static-1', source: 'static', url: '/images/hero/jung-young-hoon-01.jpg', labelKo: '정영훈 교수님 대표사진', labelEn: 'Portrait of Professor Young Hoon Jung', focalX: 64, focalY: 34 },
  { id: 'static-2', source: 'static', url: '/images/hero/jung-young-hoon-02.jpg', labelKo: '친구들과 함께 음악을 연주하시는 정영훈 교수님', labelEn: 'Professor Young Hoon Jung performing music with friends', focalX: 40, focalY: 50 },
];

function cleanHero(value: unknown): HeroItem | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Partial<HeroItem>;
  const source = item.source === 's3' ? 's3' : item.source === 'static' ? 'static' : null;
  if (!source) return null;
  const key = String(item.key ?? '');
  const url = String(item.url ?? '');
  if (source === 's3' && !key.startsWith('published/')) return null;
  if (source === 'static' && !url.startsWith('/images/hero/')) return null;
  return {
    id: String(item.id ?? key ?? url).slice(0, 200), source,
    ...(source === 's3' ? { key } : { url }),
    labelKo: String(item.labelKo ?? '정영훈 교수님 대표사진').slice(0, 200),
    labelEn: String(item.labelEn ?? 'Professor Young Hoon Jung').slice(0, 200),
    focalX: Math.min(100, Math.max(0, Number(item.focalX ?? 50))),
    focalY: Math.min(100, Math.max(0, Number(item.focalY ?? 50))),
  };
}

async function withUrl(item: HeroItem) {
  if (item.source === 'static') return item;
  const url = await getSignedUrl(s3Client(), new GetObjectCommand({ Bucket: requiredEnv('MEMORIAL_S3_BUCKET'), Key: item.key }), { expiresIn: 60 * 60 });
  return { ...item, url };
}

async function isCurrentlyPublished(item: HeroItem, db: ReturnType<typeof documentClient>, table: string) {
  if (item.source === 'static') return true;
  const match = item.key?.match(/^published\/([0-9a-f-]{36})\//i);
  if (!match) return false;
  const result = await db.send(new GetCommand({ TableName: table, Key: { PK: `SUBMISSION#${match[1]}`, SK: 'META' } }));
  if (result.Item?.status !== 'PUBLISHED' || !Array.isArray(result.Item.publishedFiles)) return false;
  return result.Item.publishedFiles.some((file: { publishedKey?: string; type?: string }) => file.publishedKey === item.key && file.type?.startsWith('image/'));
}

async function validHeroes(items: HeroItem[], db: ReturnType<typeof documentClient>, table: string) {
  const validity = await Promise.all(items.map(item => isCurrentlyPublished(item, db, table)));
  return items.filter((_, index) => validity[index]);
}

export default async function handler(request: Request) {
  try {
    const db = documentClient();
    const table = tableName();
    const adminView = new URL(request.url).searchParams.get('admin') === '1';

    if (request.method === 'GET') {
      if (adminView) await requireAdmin(request);
      const result = await db.send(new GetCommand({ TableName: table, Key: { PK: 'CONFIG#SITE', SK: 'HERO' } }));
      const stored = Array.isArray(result.Item?.heroes) ? result.Item.heroes.map(cleanHero).filter(Boolean) as HeroItem[] : [];
      const activeStored = await validHeroes(stored, db, table);
      const heroes = await Promise.all((activeStored.length ? activeStored : defaultHeroes).map(withUrl));
      if (!adminView) return json({ heroes }, 200, { 'cache-control': 'public, max-age=60' });

      const published = await db.send(new QueryCommand({
        TableName: table, IndexName: 'GSI1', KeyConditionExpression: 'GSI1PK = :status',
        ExpressionAttributeValues: { ':status': 'STATUS#PUBLISHED' }, ScanIndexForward: false, Limit: 100,
      }));
      const candidates = (await Promise.all((published.Items ?? []).flatMap(item => (item.publishedFiles ?? []).filter((file: { type?: string }) => file.type?.startsWith('image/')).map(async (file: { publishedKey: string }, index: number) => ({
        id: `${item.submissionId}-${index}`, source: 's3' as const, key: file.publishedKey,
        url: await getSignedUrl(s3Client(), new GetObjectCommand({ Bucket: requiredEnv('MEMORIAL_S3_BUCKET'), Key: file.publishedKey }), { expiresIn: 20 * 60 }),
        labelKo: item.titleKo || '정영훈 교수님 대표사진', labelEn: 'Professor Young Hoon Jung', focalX: 50, focalY: 50,
      }))))) as HeroItem[];
      return json({ heroes, candidates });
    }

    if (request.method !== 'POST') return json({ error: '지원하지 않는 요청입니다.' }, 405);
    const admin = await requireAdmin(request);
    if (!admin.groups.some(group => ['admin', 'family'].includes(group))) return json({ error: '대표사진 관리 권한이 필요합니다.' }, 403);
    const body = await request.json() as { heroes?: unknown[] };
    const heroes = Array.isArray(body.heroes) ? body.heroes.map(cleanHero).filter(Boolean) as HeroItem[] : [];
    if (heroes.length < 1 || heroes.length > 5) return json({ error: '대표사진은 1장 이상 5장 이하로 선택해 주세요.' }, 400);
    const activeHeroes = await validHeroes(heroes, db, table);
    if (activeHeroes.length !== heroes.length) return json({ error: '현재 공개 승인 상태가 아닌 사진이 포함되어 있습니다. 목록을 새로 불러온 뒤 다시 저장해 주세요.' }, 409);
    const now = new Date().toISOString();
    await db.send(new PutCommand({ TableName: table, Item: { PK: 'CONFIG#SITE', SK: 'HERO', entityType: 'SITE_CONFIG', heroes, updatedAt: now, updatedBy: admin.email } }));
    return json({ ok: true, heroes: await Promise.all(heroes.map(withUrl)) });
  } catch (error) {
    return handleError(error);
  }
}

export const config = { path: '/api/site-settings' };
