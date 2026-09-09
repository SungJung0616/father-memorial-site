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
  publishedFiles?: StoredFile[];
  titleKo?: string; memoryKo?: string; category?: string; adminNote?: string;
  originalSubmission?: { sharing: string; consent: Submission['consent']; contributor: Submission['contributor'] };
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
      if (!['PENDING', 'FAMILY', 'PUBLISHED', 'REJECTED', 'TRASH'].includes(status)) return json({ error: '상태 값이 올바르지 않습니다.' }, 400);
      if (status === 'TRASH' && !admin.groups.includes('admin')) return json({ error: '휴지통은 최고 관리자만 확인할 수 있습니다.' }, 403);
      const result = await db.send(new QueryCommand({
        TableName: table,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :status',
        ExpressionAttributeValues: { ':status': `STATUS#${status}` },
        ScanIndexForward: false,
        Limit: 100,
      }));
      const keys = (result.Items ?? []).map(item => ({ PK: item.PK, SK: item.SK }));
      const fresh = await Promise.all(keys.map(Key => db.send(new GetCommand({ TableName: table, Key, ConsistentRead: true }))));
      const items = fresh.map(result => result.Item).filter(Boolean) as Submission[];
      return json({ submissions: await Promise.all(items.filter(item => item.status === status).map(withPreviews)) });
    }

    if (request.method !== 'POST') return json({ error: '지원하지 않는 요청입니다.' }, 405);
    if (!admin.groups.some(group => ['admin', 'family'].includes(group))) return json({ error: '최종 승인 권한이 필요합니다.' }, 403);
    const body = await request.json() as { submissionId?: string; action?: string; title?: string; memory?: string; category?: string; name?: string; relationship?: string; sharing?: string; adminNote?: string; publicationConfirmed?: boolean; pinStartsAt?: string; pinEndsAt?: string };
    const submissionId = String(body.submissionId ?? '');
    if (!/^[0-9a-f-]{36}$/i.test(submissionId)) return json({ error: '제출 번호가 올바르지 않습니다.' }, 400);
    if (!['approve', 'reject', 'family', 'pin', 'unpin', 'edit', 'trash', 'restore'].includes(String(body.action))) return json({ error: '검토 작업이 올바르지 않습니다.' }, 400);
    if (['trash', 'restore'].includes(String(body.action)) && !admin.groups.includes('admin')) return json({ error: '휴지통 이동과 복구는 최고 관리자만 가능합니다.' }, 403);
    const current = await db.send(new GetCommand({ TableName: table, Key: { PK: `SUBMISSION#${submissionId}`, SK: 'META' }, ConsistentRead: true }));
    const item = current.Item as Submission | undefined;
    if (!item) return json({ error: '제출물을 찾을 수 없습니다.' }, 404);
    if (item.status === 'TRASH' && body.action !== 'restore') return json({ error: '휴지통에서 먼저 복구해 주세요.' }, 409);
    const original = item.originalSubmission ?? { sharing: item.sharing, consent: item.consent, contributor: item.contributor };
    const now = new Date().toISOString();
    if (body.action === 'trash' || body.action === 'restore') {
      if (body.action === 'restore' && item.status !== 'TRASH') return json({ error: '휴지통 게시물만 복구할 수 있습니다.' }, 409);
      // Restore privately: never silently republish deleted content.
      const nextStatus = body.action === 'trash' ? 'TRASH' : 'FAMILY';
      await db.send(new UpdateCommand({
        TableName: table, Key: { PK: item.PK, SK: item.SK },
        UpdateExpression: 'SET #status = :next, GSI1PK = :gsi, updatedAt = :now, reviewedBy = :actor, originalSubmission = if_not_exists(originalSubmission, :original)',
        ConditionExpression: '#status = :previous', ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':next': nextStatus, ':gsi': `STATUS#${nextStatus}`, ':now': now, ':actor': admin.email, ':previous': item.status, ':original': original },
      }));
      return json({ ok: true, status: nextStatus });
    }
    if (body.action === 'edit') {
      if (typeof body.title !== 'string' || body.title.length > 200 || typeof body.memory !== 'string' || body.memory.length > 5000 || (!item.files.length && !body.memory.trim())) return json({ error: '제목은 200자, 본문은 5000자 이내이며 사진 없는 글에는 본문이 필요합니다.' }, 400);
      const name = body.name ?? item.contributor.name;
      const relationship = body.relationship ?? item.contributor.relationship;
      const sharing = body.sharing ?? item.sharing;
      const category = body.category ?? item.category ?? '';
      const adminNote = body.adminNote ?? item.adminNote ?? '';
      if (typeof name !== 'string' || name.length > 80 || typeof relationship !== 'string' || relationship.length > 100 || !['review', 'family'].includes(sharing) || typeof category !== 'string' || category.length > 100 || typeof adminNote !== 'string' || adminNote.length > 2000) return json({ error: '입력한 정보의 형식 또는 길이를 확인해 주세요.' }, 400);
      await db.send(new UpdateCommand({
        TableName: table, Key: { PK: item.PK, SK: item.SK },
        UpdateExpression: 'SET titleKo = :title, memoryKo = :memory, contributor = :contributor, sharing = :sharing, category = :category, adminNote = :note, originalSubmission = if_not_exists(originalSubmission, :original), updatedAt = :now, reviewedBy = :actor',
        ConditionExpression: '#status = :previous',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':title': body.title, ':memory': body.memory, ':previous': item.status, ':contributor': { ...item.contributor, name, relationship }, ':sharing': sharing, ':category': category, ':note': adminNote, ':original': original, ':now': now, ':actor': admin.email },
      }));
      return json({ ok: true, title: body.title, memory: body.memory });
    }
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
    if (body.action === 'approve' && item.status === 'PUBLISHED') return json({ error: '이미 공개된 게시물입니다.' }, 409);
    if (body.action === 'approve') {
      const hasOriginalConsent = original.sharing === 'review' && original.consent.providerRights && (!item.files.length || original.consent.peopleNotice);
      if (!hasOriginalConsent && (body.publicationConfirmed !== true || !item.adminNote?.trim())) return json({ error: '원본 공개 동의가 부족합니다. 추가 동의 확인 내용을 관리자 메모에 저장하고 공개 동의를 확인해 주세요.' }, 400);
    }
    const nextStatus = body.action === 'approve' ? 'PUBLISHED' : body.action === 'family' ? 'FAMILY' : 'REJECTED';
    let publishedFiles: StoredFile[] | undefined;
    if (body.action === 'approve' && !item.publishedFiles) {
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
      ':title': String(body.title ?? item.titleKo ?? '').slice(0, 200),
      ':memory': String(body.memory ?? item.memoryKo ?? item.contributor.memory ?? '').slice(0, 5000),
      ':category': String(body.category ?? item.category ?? '').slice(0, 100),
      ':pending': item.status,
      ':original': original,
    };
    let update = 'SET #status = :status, GSI1PK = :gsi, updatedAt = :updated, reviewedAt = :updated, reviewedBy = :reviewedBy, titleKo = :title, memoryKo = :memory, category = :category, originalSubmission = if_not_exists(originalSubmission, :original)';
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
    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') return json({ error: '다른 관리자가 상태를 변경했습니다. 새로고침 후 다시 시도해 주세요.' }, 409);
    return handleError(error);
  }
}

export const config = { path: '/api/admin/submissions' };
