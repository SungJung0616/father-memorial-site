import { GetObjectCommand } from '@aws-sdk/client-s3';
import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { documentClient, handleError, json, requiredEnv, s3Client, tableName } from './_shared.mts';

type PublishedItem = {
  submissionId?: string;
  status?: string;
  likeCount?: number;
  submittedAt?: string;
  titleKo?: string;
  memoryKo?: string;
  category?: string;
  contributor?: { name?: string; relationship?: string; memory?: string };
  publishedFiles?: { publishedKey: string; webKey?: string; thumbKey?: string; processingStatus?: string; type: string }[];
  pinned?: boolean;
  pinStartsAt?: string;
  pinEndsAt?: string;
};

const publicCacheHeaders = {
  'cache-control': 'no-store',
  'netlify-cdn-cache-control': 'no-store',
};

export default async function handler(request: Request) {
  if (request.method !== 'GET') return json({ error: 'GET 요청만 허용됩니다.' }, 405);
  try {
    const requestedId = new URL(request.url).searchParams.get('id') ?? '';
    if (requestedId && !/^[0-9a-f-]{36}$/i.test(requestedId)) return json({ error: '추억 번호가 올바르지 않습니다.' }, 400);
    const s3 = s3Client();
    const bucket = requiredEnv('MEMORIAL_S3_BUCKET');
    const toMemory = async (item: PublishedItem, imageVariant: 'thumb' | 'web') => ({
      id: item.submissionId,
      likeCount: item.likeCount ?? 0,
      group: item.contributor?.relationship || '추억',
      submittedAt: item.submittedAt,
      title: item.titleKo || '함께 나누는 추억',
      body: item.memoryKo ?? item.contributor?.memory ?? '',
      category: item.category || '',
      pinned: Boolean(item.pinned),
      pinStartsAt: item.pinStartsAt || '',
      pinEndsAt: item.pinEndsAt || '',
      photos: await Promise.all((item.publishedFiles ?? []).filter(file => file.type?.startsWith('image/')).map(async file => {
        const derivedKey = imageVariant === 'web' ? file.webKey : file.thumbKey;
        const key = file.processingStatus === 'READY' && derivedKey ? derivedKey : file.publishedKey;
        return {
          url: await getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 60 * 60 }),
          type: key === file.publishedKey ? file.type : 'image/webp',
        };
      })),
    });

    if (requestedId) {
      const result = await documentClient().send(new GetCommand({
        TableName: tableName(),
        Key: { PK: `SUBMISSION#${requestedId}`, SK: 'META' },
        ConsistentRead: true,
      }));
      const item = result.Item as PublishedItem | undefined;
      if (!item || item.status !== 'PUBLISHED') return json({ error: '공개된 추억을 찾을 수 없습니다.' }, 404);
      return json({ memory: await toMemory(item, 'web') }, 200, publicCacheHeaders);
    }

    const result = await documentClient().send(new QueryCommand({
      TableName: tableName(),
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :status',
      ExpressionAttributeValues: { ':status': 'STATUS#PUBLISHED' },
      ScanIndexForward: false,
      Limit: 50,
    }));
    const now = Date.now();
    const isActivePin = (item: PublishedItem) => Boolean(item.pinned) && (!item.pinStartsAt || Date.parse(item.pinStartsAt) <= now) && (!item.pinEndsAt || Date.parse(item.pinEndsAt) >= now);
    // GSI reads are eventually consistent: never publish stale index contents after withdrawal.
    const keys = (result.Items ?? []).map(item => ({ PK: item.PK, SK: item.SK }));
    const table = tableName();
    const fresh = await Promise.all(keys.map(Key => documentClient().send(new GetCommand({ TableName: table, Key, ConsistentRead: true }))));
    const items = (fresh.map(result => result.Item).filter(Boolean) as PublishedItem[]).filter(item => item.status === 'PUBLISHED').sort((a, b) => Number(isActivePin(b)) - Number(isActivePin(a)) || Date.parse(b.submittedAt || '') - Date.parse(a.submittedAt || ''));
    const memories = await Promise.all(items.map(async item => ({ ...(await toMemory(item, 'thumb')), isPinned: isActivePin(item) })));
    return json({ memories }, 200, publicCacheHeaders);
  } catch (error) {
    return handleError(error);
  }
}

export const config = { path: '/api/memories' };
