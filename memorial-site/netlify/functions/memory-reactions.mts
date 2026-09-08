import { createHash } from 'node:crypto';
import { GetCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { documentClient, tableName, json, handleError } from './_shared.mts';

export default async function handler(request: Request) {
  try {
    if (!['GET', 'POST'].includes(request.method)) return json({ error: '지원하지 않는 요청입니다.' }, 405);
    if (request.method === 'POST' && request.headers.get('origin') && request.headers.get('origin') !== new URL(request.url).origin) return json({ error: '허용되지 않는 요청입니다.' }, 403);
    const input = request.method === 'GET' ? Object.fromEntries(new URL(request.url).searchParams) : await request.json() as Record<string, unknown>;
    const { id, visitorId, liked } = input;
    if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/i.test(id) || typeof visitorId !== 'string' || !/^[0-9a-f-]{36}$/i.test(visitorId)) return json({ error: '올바르지 않은 요청입니다.' }, 400);
    if (request.method === 'POST' && typeof liked !== 'boolean') return json({ error: '반응을 확인해 주세요.' }, 400);
    const db = documentClient(), TableName = tableName();
    const Key = { PK: `SUBMISSION#${id}`, SK: 'META' };
    const reactionKey = { PK: Key.PK, SK: `REACTION#${createHash('sha256').update(visitorId).digest('hex')}` };
    const read = async () => {
      const [post, reaction] = await Promise.all([
        db.send(new GetCommand({ TableName, Key, ConsistentRead: true })),
        db.send(new GetCommand({ TableName, Key: reactionKey, ConsistentRead: true })),
      ]);
      if (post.Item?.status !== 'PUBLISHED') return null;
      return { count: Number(post.Item.likeCount ?? 0), liked: reaction.Item?.liked === true };
    };
    const current = await read();
    if (!current) return json({ error: '공개된 추억을 찾을 수 없습니다.' }, 404);
    if (request.method === 'GET' || current.liked === liked) return json(current);
    try {
      await db.send(new TransactWriteCommand({ TransactItems: [
        { Update: { TableName, Key,
          UpdateExpression: 'ADD likeCount :delta',
          ConditionExpression: liked ? '#s = :published' : '#s = :published AND likeCount >= :one',
          ExpressionAttributeNames: { '#s': 'status' },
          ExpressionAttributeValues: { ':delta': liked ? 1 : -1, ':published': 'PUBLISHED', ...(!liked ? { ':one': 1 } : {}) },
        } },
        { Update: { TableName, Key: reactionKey,
          UpdateExpression: 'SET liked = :next',
          ConditionExpression: liked ? 'attribute_not_exists(liked) OR liked = :previous' : 'liked = :previous',
          ExpressionAttributeValues: { ':next': liked, ':previous': !liked },
        } },
      ] }));
    } catch (error) {
      // A duplicate/concurrent request may already have applied the desired state.
      const latest = await read();
      if (latest?.liked === liked) return json(latest);
      throw error;
    }
    return json(await read());
  } catch (error) { return handleError(error); }
}
export const config = { path: '/api/memory-reactions' };
