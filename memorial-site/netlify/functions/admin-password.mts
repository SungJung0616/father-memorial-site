import { ConfirmForgotPasswordCommand, ForgotPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient, handleError, json, requiredEnv } from './_shared.mts';

export default async function handler(request: Request) {
  if (request.method !== 'POST') return json({ error: 'POST 요청만 허용됩니다.' }, 405);
  try {
    const body = await request.json() as { action?: string; email?: string; code?: string; newPassword?: string };
    const email = String(body.email ?? '').trim().toLowerCase();
    if (!email) return json({ error: '관리자 이메일을 입력해 주세요.' }, 400);
    const client = cognitoClient();
    const clientId = requiredEnv('MEMORIAL_COGNITO_CLIENT_ID');

    if (body.action === 'request') {
      await client.send(new ForgotPasswordCommand({ ClientId: clientId, Username: email }));
      return json({ ok: true, message: '등록된 이메일로 확인 코드를 보냈습니다.' });
    }
    if (body.action === 'confirm') {
      const code = String(body.code ?? '').trim();
      const newPassword = String(body.newPassword ?? '');
      if (!code || !newPassword) return json({ error: '확인 코드와 새 비밀번호를 입력해 주세요.' }, 400);
      await client.send(new ConfirmForgotPasswordCommand({ ClientId: clientId, Username: email, ConfirmationCode: code, Password: newPassword }));
      return json({ ok: true, message: '새 비밀번호가 설정되었습니다. 이제 로그인해 주세요.' });
    }
    return json({ error: '요청 종류가 올바르지 않습니다.' }, 400);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'CodeMismatchException') return json({ error: '확인 코드가 올바르지 않습니다.' }, 400);
      if (error.name === 'ExpiredCodeException') return json({ error: '확인 코드가 만료되었습니다. 새 코드를 요청해 주세요.' }, 400);
      if (error.name === 'InvalidPasswordException') return json({ error: '영문 대·소문자와 숫자를 포함해 10자 이상으로 설정해 주세요.' }, 400);
      if (['UserNotFoundException', 'LimitExceededException'].includes(error.name)) return json({ error: '코드를 보낼 수 없습니다. 잠시 후 다시 시도해 주세요.' }, 400);
    }
    return handleError(error);
  }
}

export const config = { path: '/api/admin/password' };
