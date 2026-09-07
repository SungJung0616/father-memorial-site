import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);
const VIDEO_TYPES = new Set(['video/mp4', 'video/quicktime']);
const MAX_PHOTO_BYTES = 25 * 1024 * 1024;
const MAX_VIDEO_BYTES = 500 * 1024 * 1024;

type UploadFile = { name?: string; type?: string; size?: number };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function safeName(name: string) {
  const extension = name.toLowerCase().match(/\.[a-z0-9]{1,8}$/)?.[0] ?? '';
  return `${crypto.randomUUID()}${extension}`;
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') return json({ error: 'POST 요청만 허용됩니다.' }, 405);
  if (process.env.UPLOAD_API_ENABLED !== 'true') {
    return json({ error: '업로드 기능을 준비 중입니다.' }, 503);
  }

  const bucket = process.env.AWS_S3_MEDIA_BUCKET;
  const region = process.env.AWS_S3_REGION;
  if (!bucket || !region) return json({ error: '서버 저장소 설정이 완료되지 않았습니다.' }, 503);

  let files: UploadFile[];
  try {
    const body = await request.json() as { files?: UploadFile[] };
    files = body.files ?? [];
  } catch {
    return json({ error: '요청 형식이 올바르지 않습니다.' }, 400);
  }

  if (!Array.isArray(files) || files.length < 1 || files.length > 10) {
    return json({ error: '한 번에 1개부터 10개까지 선택해 주세요.' }, 400);
  }

  for (const file of files) {
    const type = file.type ?? '';
    const size = file.size ?? 0;
    const limit = VIDEO_TYPES.has(type) ? MAX_VIDEO_BYTES : MAX_PHOTO_BYTES;
    if ((!PHOTO_TYPES.has(type) && !VIDEO_TYPES.has(type)) || size < 1 || size > limit) {
      return json({ error: `${file.name ?? '파일'}의 형식 또는 크기를 확인해 주세요.` }, 400);
    }
  }

  const client = new S3Client({ region });
  const uploads = await Promise.all(files.map(async (file) => {
    const key = `pending/${new Date().toISOString().slice(0, 10)}/${safeName(file.name ?? 'upload')}`;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: file.type,
      Metadata: { originalname: encodeURIComponent((file.name ?? 'upload').slice(0, 180)) },
    });
    return {
      key,
      url: await getSignedUrl(client, command, { expiresIn: 10 * 60 }),
      contentType: file.type,
    };
  }));

  return json({ uploads });
}

export const config = { path: '/api/create-upload-url' };
