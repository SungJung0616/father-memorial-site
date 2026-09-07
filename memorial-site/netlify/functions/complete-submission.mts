import { HeadObjectCommand } from '@aws-sdk/client-s3';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { documentClient, handleError, json, requiredEnv, s3Client, tableName } from './_shared.mts';

type SubmittedFile = { key?: string; originalName?: string; type?: string; size?: number };

export default async function handler(request: Request) {
  if (request.method !== 'POST') return json({ error: 'POST 요청만 허용됩니다.' }, 405);
  try {
    const body = await request.json() as {
      submissionId?: string;
      submittedAt?: string;
      sharing?: string;
      contributor?: { name?: string; relationship?: string; memory?: string };
      consent?: { providerRights?: boolean; peopleNotice?: boolean };
      files?: SubmittedFile[];
    };
    const submissionId = String(body.submissionId ?? '');
    const files = Array.isArray(body.files) ? body.files : [];
    if (!/^[0-9a-f-]{36}$/i.test(submissionId) || files.length < 1 || files.length > 10) return json({ error: '제출 정보가 올바르지 않습니다.' }, 400);
    if (!body.consent?.providerRights || !body.consent?.peopleNotice) return json({ error: '필수 동의가 확인되지 않았습니다.' }, 400);
    const expected = `pending/`;
    if (files.some(file => !String(file.key ?? '').startsWith(expected) || !String(file.key ?? '').includes(`/${submissionId}/`))) {
      return json({ error: '파일 경로가 올바르지 않습니다.' }, 400);
    }

    const bucket = requiredEnv('MEMORIAL_S3_BUCKET');
    const s3 = s3Client();
    await Promise.all(files.map(file => s3.send(new HeadObjectCommand({ Bucket: bucket, Key: String(file.key) }))));
    const submittedAt = body.submittedAt && !Number.isNaN(Date.parse(body.submittedAt)) ? body.submittedAt : new Date().toISOString();
    const status = body.sharing === 'family' ? 'FAMILY' : 'PENDING';
    const item = {
      PK: `SUBMISSION#${submissionId}`,
      SK: 'META',
      GSI1PK: `STATUS#${status}`,
      GSI1SK: submittedAt,
      entityType: 'SUBMISSION',
      submissionId,
      status,
      sharing: body.sharing === 'family' ? 'family' : 'review',
      submittedAt,
      updatedAt: submittedAt,
      contributor: {
        name: String(body.contributor?.name ?? '').slice(0, 80),
        relationship: String(body.contributor?.relationship ?? '').slice(0, 80),
        memory: String(body.contributor?.memory ?? '').slice(0, 5000),
      },
      consent: { providerRights: true, peopleNotice: true },
      files: files.map(file => ({
        key: String(file.key),
        originalName: String(file.originalName ?? '').slice(0, 255),
        type: String(file.type ?? '').slice(0, 100),
        size: Number(file.size ?? 0),
      })),
    };
    await documentClient().send(new PutCommand({
      TableName: tableName(),
      Item: item,
      ConditionExpression: 'attribute_not_exists(PK)',
    }));
    return json({ ok: true, submissionId, status });
  } catch (error) {
    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') return json({ ok: true, duplicate: true });
    return handleError(error);
  }
}

export const config = { path: '/api/complete-submission' };
