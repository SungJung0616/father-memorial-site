import { InitiateAuthCommand, RespondToAuthChallengeCommand } from '@aws-sdk/client-cognito-identity-provider';
import { authCookie, cognitoClient, handleError, json, requiredEnv } from './_shared.mts';

function authResponse(result: { AuthenticationResult?: { IdToken?: string; RefreshToken?: string }; ChallengeName?: string; Session?: string }) {
  if (result.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
    return json({ requiresNewPassword: true, session: result.Session });
  }
  const idToken = result.AuthenticationResult?.IdToken;
  if (!idToken) return json({ error: '로그인 정보를 확인해 주세요.' }, 401);
  const headers = new Headers();
  for (const cookie of authCookie(idToken, result.AuthenticationResult?.RefreshToken)) headers.append('set-cookie', cookie);
  return json({ ok: true }, 200, headers);
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') return json({ error: 'POST 요청만 허용됩니다.' }, 405);
  try {
    const body = await request.json() as { email?: string; password?: string; newPassword?: string; session?: string };
    const email = String(body.email ?? '').trim().toLowerCase();
    const clientId = requiredEnv('MEMORIAL_COGNITO_CLIENT_ID');
    if (!email || !body.password) return json({ error: '이메일과 비밀번호를 입력해 주세요.' }, 400);
    const client = cognitoClient();
    if (body.newPassword && body.session) {
      const result = await client.send(new RespondToAuthChallengeCommand({
        ClientId: clientId,
        ChallengeName: 'NEW_PASSWORD_REQUIRED',
        Session: body.session,
        ChallengeResponses: { USERNAME: email, NEW_PASSWORD: body.newPassword },
      }));
      return authResponse(result);
    }
    const result = await client.send(new InitiateAuthCommand({
      ClientId: clientId,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: { USERNAME: email, PASSWORD: body.password },
    }));
    return authResponse(result);
  } catch (error) {
    if (error instanceof Error && ['NotAuthorizedException', 'UserNotFoundException', 'PasswordResetRequiredException'].includes(error.name)) {
      return json({ error: '이메일 또는 비밀번호를 확인해 주세요.' }, 401);
    }
    return handleError(error);
  }
}

export const config = { path: '/api/admin/login' };
