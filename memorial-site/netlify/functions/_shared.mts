import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

export function json(body: unknown, status = 200, headers: HeadersInit = {}) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set('content-type', 'application/json; charset=utf-8');
  if (!responseHeaders.has('cache-control')) responseHeaders.set('cache-control', 'no-store');
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders,
  });
}

export function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} 환경변수가 없습니다.`);
  return value;
}

export function awsCredentials() {
  return {
    accessKeyId: requiredEnv('MEMORIAL_AWS_ACCESS_KEY_ID'),
    secretAccessKey: requiredEnv('MEMORIAL_AWS_SECRET_ACCESS_KEY'),
  };
}

export function awsRegion() {
  return requiredEnv('MEMORIAL_AWS_REGION');
}

export function s3Client() {
  return new S3Client({ region: awsRegion(), credentials: awsCredentials() });
}

export function documentClient() {
  return DynamoDBDocumentClient.from(new DynamoDBClient({ region: awsRegion(), credentials: awsCredentials() }), {
    marshallOptions: { removeUndefinedValues: true },
  });
}

export function cognitoClient() {
  return new CognitoIdentityProviderClient({ region: awsRegion() });
}

export function tableName() {
  return requiredEnv('MEMORIAL_DYNAMODB_TABLE');
}

function cookies(request: Request) {
  return Object.fromEntries((request.headers.get('cookie') ?? '').split(';').map(part => part.trim()).filter(Boolean).map(part => {
    const index = part.indexOf('=');
    return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
  }));
}

export function authCookie(idToken: string, refreshToken?: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const headers = [
    `memorial_id_token=${encodeURIComponent(idToken)}; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=3600`,
  ];
  if (refreshToken) headers.push(`memorial_refresh_token=${encodeURIComponent(refreshToken)}; Path=/api; HttpOnly${secure}; SameSite=Strict; Max-Age=2592000`);
  return headers;
}

export function clearAuthCookies() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return [
    `memorial_id_token=; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=0`,
    `memorial_refresh_token=; Path=/api; HttpOnly${secure}; SameSite=Strict; Max-Age=0`,
  ];
}

export async function requireAdmin(request: Request) {
  const token = cookies(request).memorial_id_token;
  if (!token) throw new Error('UNAUTHORIZED');
  const verifier = CognitoJwtVerifier.create({
    userPoolId: requiredEnv('MEMORIAL_COGNITO_USER_POOL_ID'),
    clientId: requiredEnv('MEMORIAL_COGNITO_CLIENT_ID'),
    tokenUse: 'id',
  });
  try {
    const payload = await verifier.verify(token);
    const groups = Array.isArray(payload['cognito:groups']) ? payload['cognito:groups'] : [];
    if (!groups.some(group => ['admin', 'family', 'reviewer'].includes(String(group)))) throw new Error('UNAUTHORIZED');
    return { email: String(payload.email ?? payload['cognito:username'] ?? ''), groups: groups.map(String) };
  } catch {
    throw new Error('UNAUTHORIZED');
  }
}

export function handleError(error: unknown) {
  if (error instanceof Error && error.message === 'UNAUTHORIZED') return json({ error: '관리자 로그인이 필요합니다.' }, 401);
  console.error(error);
  return json({ error: '서버 처리 중 문제가 발생했습니다.' }, 500);
}
