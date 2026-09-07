import { GetObjectCommand } from '@aws-sdk/client-s3';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { documentClient, handleError, json, requiredEnv, s3Client, tableName } from './_shared.mts';

export default async function handler(request: Request) {
  if (request.method !== 'GET') return json({ error: 'GET 요청만 허용됩니다.' }, 405);
  try {
    const result = await documentClient().send(new QueryCommand({
      TableName: tableName(),
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :status',
      ExpressionAttributeValues: { ':status': 'STATUS#PUBLISHED' },
      ScanIndexForward: false,
      Limit: 50,
    }));
    const s3 = s3Client();
    const bucket = requiredEnv('MEMORIAL_S3_BUCKET');
    const memories = await Promise.all((result.Items ?? []).map(async item => ({
      id: item.submissionId,
      group: item.contributor?.relationship || '추억',
      name: item.contributor?.name || '익명',
      submittedAt: item.submittedAt,
      title: item.titleKo || '함께 나누는 추억',
      body: item.memoryKo || item.contributor?.memory || '',
      category: item.category || '',
      photos: await Promise.all((item.publishedFiles ?? []).filter((file: {type?: string}) => file.type?.startsWith('image/')).map(async (file: {publishedKey: string; type: string}) => ({
        url: await getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: file.publishedKey }), { expiresIn: 60 * 60 }),
        type: file.type,
      }))),
    })));
    return json({ memories }, 200, { 'cache-control': 'public, max-age=60' });
  } catch (error) {
    return handleError(error);
  }
}

export const config = { path: '/api/memories' };
