import { CopyObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { documentClient, handleError, json, requireAdmin, requiredEnv, s3Client, tableName } from './_shared.mts';

type ProcessingStatus = 'QUEUED' | 'READY' | 'FAILED' | 'NOT_APPLICABLE' | 'NOT_CONFIGURED';
type StoredFile = { key: string; originalName: string; type: string; size: number; publishedKey?: string; webKey?: string; thumbKey?: string; processingStatus?: ProcessingStatus };
type Submission = {
  PK: string; SK: string; submissionId: string; status: string; sharing: string; submittedAt: string;
  contributor: { name: string; relationship: string; memory: string };
  consent: { providerRights: boolean; peopleNotice: boolean };
  files: StoredFile[];
  pinned?: boolean; pinStartsAt?: string; pinEndsAt?: string;
};

async function withPreviews(item: Submission) {
  const client = s3Client();
  const bucket = requiredEnv('MEMORIAL_S3_BUCKET');
  return {
    ...item,
    files: await Promise.all((item.files ?? []).map(async file => ({
      ...file,
      previewUrl: await getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: file.key }), { expiresIn: 20 * 60 }),
    }))),
  };
}

export default async function handler(request: Request) {
  try {
    const admin = await requireAdmin(request);
    const db = documentClient();
    const table = tableName();
    if (request.method === 'GET') {
      const status = new URL(request.url).searchParams.get('status')?.toUpperCase() ?? 'PENDING';
      if (!['PENDING', 'FAMILY', 'PUBLISHED', 'REJECTED'].includes(status)) return json({ error: '상태 값이 올바르지 않습니다.' }, 400);
      const result = await db.send(new QueryCommand({
        TableName: table,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :status',
        ExpressionAttributeValues: { ':status': `STATUS#${status}` },
        ScanIndexForward: false,
        Limit: 100,
      }));
      return json({ submissions: await Promise.all((result.Items as Submission[] ?? []).map(withPreviews)) });
    }

    if (request.method !== 'POST') return json({ error: '지원하지 않는 요청입니다.' }, 405);
    if (!admin.groups.some(group => ['admin', 'family'].includes(group))) return json({ error: '최종 승인 권한이 필요합니다.' }, 403);
    const body = await request.json() as { submissionId?: string; action?: string; title?: string; memory?: string; category?: string; pinStartsAt?: string; pinEndsAt?: string };
    const submissionId = String(body.submissionId ?? '');
    if (!/^[0-9a-f-]{36}$/i.test(submissionId)) return json({ error: '제출 번호가 올바르지 않습니다.' }, 400);
    if (!['approve', 'reject', 'family', 'pin', 'unpin'].includes(String(body.action))) return json({ error: '검토 작업이 올바르지 않습니다.' }, 400);
    const current = await db.send(new GetCommand({ TableName: table, Key: { PK: `SUBMISSION#${submissionId}`, SK: 'META' } }));
    const item = current.Item as Submission | undefined;
    if (!item) return json({ error: '제출물을 찾을 수 없습니다.' }, 404);
    if (body.action === 'pin' || body.action === 'unpin') {
      if (item.status !== 'PUBLISHED') return json({ error: '공개 완료된 게시물만 고정할 수 있습니다.' }, 409);
      const now = new Date().toISOString();
      if (body.action === 'unpin') {
        await db.send(new UpdateCommand({ TableName: table, Key: { PK: item.PK, SK: item.SK }, UpdateExpression: 'SET updatedAt = :updated, pinnedBy = :reviewedBy REMOVE pinned, pinStartsAt, pinEndsAt', ExpressionAttributeValues: { ':updated': now, ':reviewedBy': admin.email } }));
        return json({ ok: true, pinned: false });
      }
      const starts = body.pinStartsAt && !Number.isNaN(Date.parse(body.pinStartsAt)) ? new Date(body.pinStartsAt).toISOString() : now;
      const ends = body.pinEndsAt && !Number.isNaN(Date.parse(body.pinEndsAt)) ? new Date(body.pinEndsAt).toISOString() : undefined;
      if (ends && Date.parse(ends) <= Date.parse(starts)) return json({ error: '고정 종료일은 시작일보다 뒤여야 합니다.' }, 400);
      await db.send(new UpdateCommand({ TableName: table, Key: { PK: item.PK, SK: item.SK }, UpdateExpression: 'SET pinned = :pinned, pinStartsAt = :starts, pinEndsAt = :ends, pinnedAt = :updated, pinnedBy = :reviewedBy, updatedAt = :updated', ExpressionAttributeValues: { ':pinned': true, ':starts': starts, ':ends': ends || null, ':updated': now, ':reviewedBy': admin.email } }));
      return json({ ok: true, pinned: true, pinStartsAt: starts, pinEndsAt: ends || '' });
    }
    if (item.status !== 'PENDING') return json({ error: '이미 처리된 제출물입니다.' }, 409);

    const now = new Date().toISOString();
    const nextStatus = body.action === 'approve' ? 'PUBLISHED' : body.action === 'family' ? 'FAMILY' : 'REJECTED';
    let publishedFiles: StoredFile[] | undefined;
    if (body.action === 'approve') {
      const s3 = s3Client();
      const bucket = requiredEnv('MEMORIAL_S3_BUCKET');
      publishedFiles = await Promise.all(item.files.map(async (file, index) => {
        const extension = file.key.match(/\.[a-z0-9]{1,8}$/i)?.[0] ?? '';
        const publishedKey = `published/${submissionId}/${String(index + 1).padStart(3, '0')}${extension}`;
        const encodedSource = `${bucket}/${file.key.split('/').map(encodeURIComponent).join('/')}`;
        await s3.send(new CopyObjectCommand({ Bucket: bucket, CopySource: encodedSource, Key: publishedKey, ContentType: file.type, MetadataDirective: 'REPLACE' }));
        return {
          ...file,
          publishedKey,
          processingStatus: file.type.startsWith('image/') ? (process.env.MEMORIAL_IMAGE_QUEUE_URL ? 'QUEUED' : 'NOT_CONFIGURED') : 'NOT_APPLICABLE',
        };
      }));
    }

    const names: Record<string, string> = { '#status': 'status' };
    const values: Record<string, unknown> = {
      ':status': nextStatus,
      ':gsi': `STATUS#${nextStatus}`,
      ':updated': now,
      ':reviewedBy': admin.email,
      ':title': String(body.title ?? '').slice(0, 200),
      ':memory': String(body.memory ?? item.contributor.memory ?? '').slice(0, 5000),
      ':category': String(body.category ?? '').slice(0, 100),
      ':pending': 'PENDING',
    };
    let update = 'SET #status = :status, GSI1PK = :gsi, updatedAt = :updated, reviewedAt = :updated, reviewedBy = :reviewedBy, titleKo = :title, memoryKo = :memory, category = :category';
    if (publishedFiles) { update += ', publishedFiles = :publishedFiles'; values[':publishedFiles'] = publishedFiles; }
    await db.send(new UpdateCommand({
      TableName: table,
      Key: { PK: item.PK, SK: item.SK },
      UpdateExpression: update,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ConditionExpression: '#status = :pending',
    }));
    let imageProcessingQueued = false;
    let imageProcessingWarning = '';
    if (body.action === 'approve' && publishedFiles?.some(file => file.type.startsWith('image/'))) {
      const queueUrl = process.env.MEMORIAL_IMAGE_QUEUE_URL;
      if (queueUrl) {
        try {
          const queue = new SQSClient({ region: requiredEnv('MEMORIAL_AWS_REGION'), credentials: { accessKeyId: requiredEnv('MEMORIAL_AWS_ACCESS_KEY_ID'), secretAccessKey: requiredEnv('MEMORIAL_AWS_SECRET_ACCESS_KEY') } });
          await queue.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: JSON.stringify({ submissionId }) }));
          imageProcessingQueued = true;
        } catch (queueError) {
          console.error('Image processing queue failed; published originals remain available.', queueError);
          publishedFiles = publishedFiles.map(file => file.type.startsWith('image/') ? { ...file, processingStatus: 'FAILED' } : file);
          try {
            await db.send(new UpdateCommand({ TableName: table, Key: { PK: item.PK, SK: item.SK }, UpdateExpression: 'SET publishedFiles = :publishedFiles', ExpressionAttributeValues: { ':publishedFiles': publishedFiles } }));
          } catch (statusError) {
            console.error('Could not mark image queue failure.', statusError);
          }
          imageProcessingWarning = '파생 이미지 처리를 예약하지 못해 원본 이미지로 공개되었습니다.';
        }
      } else {
        imageProcessingWarning = '이미지 처리 큐가 설정되지 않아 원본 이미지로 공개되었습니다.';
      }
    }
    return json({ ok: true, status: nextStatus, imageProcessingQueued, imageProcessingWarning });
  } catch (error) {
    return handleError(error);
  }
}

export const config = { path: '/api/admin/submissions' };
