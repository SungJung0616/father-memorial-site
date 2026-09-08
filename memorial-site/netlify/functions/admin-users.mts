import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  AdminGetUserCommand,
  AdminRemoveUserFromGroupCommand,
  AdminResetUserPasswordCommand,
  ListUsersCommand,
  ListUsersInGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { cognitoAdminClient, handleError, json, requireAdmin, requiredEnv } from './_shared.mts';

const roles = ['admin', 'family', 'reviewer'] as const;
type Role = typeof roles[number];
type GroupUser = { Username?: string; Enabled?: boolean };

function isRole(value: unknown): value is Role {
  return roles.includes(String(value) as Role);
}

function attribute(attributes: { Name?: string; Value?: string }[] | undefined, name: string) {
  return attributes?.find(item => item.Name === name)?.Value ?? '';
}

async function usersInGroup(groupName: Role) {
  const client = cognitoAdminClient();
  const userPoolId = requiredEnv('MEMORIAL_COGNITO_USER_POOL_ID');
  const users: GroupUser[] = [];
  let nextToken: string | undefined;
  do {
    const result = await client.send(new ListUsersInGroupCommand({ UserPoolId: userPoolId, GroupName: groupName, Limit: 60, NextToken: nextToken }));
    users.push(...(result.Users ?? []));
    nextToken = result.NextToken;
  } while (nextToken);
  return users;
}

async function roleMemberships() {
  const entries = await Promise.all(roles.map(async role => [role, await usersInGroup(role)] as const));
  const membership = new Map<string, Role[]>();
  for (const [role, users] of entries) {
    for (const user of users) {
      if (!user.Username) continue;
      membership.set(user.Username, [...(membership.get(user.Username) ?? []), role]);
    }
  }
  return membership;
}

async function listUsers() {
  const client = cognitoAdminClient();
  const userPoolId = requiredEnv('MEMORIAL_COGNITO_USER_POOL_ID');
  const users = [];
  let paginationToken: string | undefined;
  do {
    const result = await client.send(new ListUsersCommand({ UserPoolId: userPoolId, Limit: 60, PaginationToken: paginationToken }));
    users.push(...(result.Users ?? []));
    paginationToken = result.PaginationToken;
  } while (paginationToken);
  const memberships = await roleMemberships();
  return users.map(user => ({
    username: user.Username ?? '',
    email: attribute(user.Attributes, 'email'),
    enabled: Boolean(user.Enabled),
    status: user.UserStatus ?? 'UNKNOWN',
    role: memberships.get(user.Username ?? '')?.find(role => roles.includes(role)) ?? null,
    createdAt: user.UserCreateDate?.toISOString() ?? '',
    updatedAt: user.UserLastModifiedDate?.toISOString() ?? '',
  })).sort((left, right) => left.email.localeCompare(right.email));
}

async function assertTarget(username: string) {
  const result = await cognitoAdminClient().send(new AdminGetUserCommand({
    UserPoolId: requiredEnv('MEMORIAL_COGNITO_USER_POOL_ID'),
    Username: username,
  }));
  return {
    username: result.Username ?? username,
    email: attribute(result.UserAttributes, 'email'),
    enabled: Boolean(result.Enabled),
  };
}

async function assertAdminWillRemain(targetUsername: string) {
  const admins = await usersInGroup('admin');
  const targetIsAdmin = admins.some(user => user.Username === targetUsername);
  const enabledAdmins = admins.filter(user => user.Enabled !== false);
  if (targetIsAdmin && enabledAdmins.length <= 1) {
    throw new Error('LAST_ADMIN');
  }
}

function cognitoError(error: unknown) {
  if (!(error instanceof Error)) return null;
  if (error.message === 'LAST_ADMIN') return json({ error: '마지막 관리자의 권한은 변경하거나 비활성화할 수 없습니다.' }, 409);
  if (error.name === 'UsernameExistsException') return json({ error: '이미 등록된 이메일입니다.' }, 409);
  if (error.name === 'UserNotFoundException') return json({ error: '사용자를 찾을 수 없습니다.' }, 404);
  if (error.name === 'InvalidParameterException') return json({ error: '현재 계정 상태에서는 이 작업을 진행할 수 없습니다.' }, 409);
  if (error.name === 'TooManyRequestsException' || error.name === 'LimitExceededException') return json({ error: '요청이 많습니다. 잠시 후 다시 시도해 주세요.' }, 429);
  return null;
}

export default async function handler(request: Request) {
  try {
    const actor = await requireAdmin(request);
    if (!actor.groups.includes('admin')) return json({ error: '회원 관리는 최고 관리자만 사용할 수 있습니다.' }, 403);
    if (request.method === 'GET') return json({ users: await listUsers() });
    if (request.method !== 'POST') return json({ error: '지원하지 않는 요청입니다.' }, 405);

    const body = await request.json() as { action?: string; email?: string; username?: string; role?: string };
    const action = String(body.action ?? '');
    const userPoolId = requiredEnv('MEMORIAL_COGNITO_USER_POOL_ID');
    const client = cognitoAdminClient();

    if (action === 'invite') {
      const email = String(body.email ?? '').trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: '올바른 이메일 주소를 입력해 주세요.' }, 400);
      if (!isRole(body.role)) return json({ error: '권한을 선택해 주세요.' }, 400);
      const created = await client.send(new AdminCreateUserCommand({
        UserPoolId: userPoolId,
        Username: email,
        DesiredDeliveryMediums: ['EMAIL'],
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'email_verified', Value: 'true' },
        ],
      }));
      const username = created.User?.Username;
      if (!username) throw new Error('사용자 초대 결과에 사용자 번호가 없습니다.');
      await client.send(new AdminAddUserToGroupCommand({ UserPoolId: userPoolId, Username: username, GroupName: body.role }));
      return json({ ok: true, message: '초대 메일을 보냈습니다. 사용자는 첫 로그인에서 새 비밀번호를 설정합니다.' }, 201);
    }

    const username = String(body.username ?? '').trim();
    if (!username || username.length > 128) return json({ error: '사용자 번호가 올바르지 않습니다.' }, 400);
    const target = await assertTarget(username);
    const isSelf = target.username === actor.username || Boolean(target.email && target.email === actor.email);

    if (action === 'role') {
      if (!isRole(body.role)) return json({ error: '권한을 선택해 주세요.' }, 400);
      const memberships = await roleMemberships();
      const currentRoles = memberships.get(target.username) ?? [];
      if (currentRoles.includes('admin') && body.role !== 'admin') await assertAdminWillRemain(target.username);
      if (!currentRoles.includes(body.role)) {
        await client.send(new AdminAddUserToGroupCommand({ UserPoolId: userPoolId, Username: target.username, GroupName: body.role }));
      }
      for (const role of currentRoles) {
        if (role !== body.role) await client.send(new AdminRemoveUserFromGroupCommand({ UserPoolId: userPoolId, Username: target.username, GroupName: role }));
      }
      return json({ ok: true, message: '사용자 권한을 변경했습니다. 다음 로그인부터 새 권한이 적용됩니다.' });
    }

    if (action === 'resend') {
      await client.send(new AdminCreateUserCommand({ UserPoolId: userPoolId, Username: target.username, MessageAction: 'RESEND', DesiredDeliveryMediums: ['EMAIL'] }));
      return json({ ok: true, message: '새 임시 로그인 정보가 담긴 초대 메일을 다시 보냈습니다.' });
    }
    if (action === 'reset') {
      await client.send(new AdminResetUserPasswordCommand({ UserPoolId: userPoolId, Username: target.username }));
      return json({ ok: true, message: '사용자의 이메일로 비밀번호 재설정 코드를 보냈습니다.' });
    }
    if (action === 'disable') {
      if (isSelf) return json({ error: '현재 로그인한 자기 계정은 비활성화할 수 없습니다.' }, 409);
      await assertAdminWillRemain(target.username);
      await client.send(new AdminDisableUserCommand({ UserPoolId: userPoolId, Username: target.username }));
      return json({ ok: true, message: '사용자를 비활성화했습니다.' });
    }
    if (action === 'enable') {
      await client.send(new AdminEnableUserCommand({ UserPoolId: userPoolId, Username: target.username }));
      return json({ ok: true, message: '사용자를 다시 활성화했습니다.' });
    }
    return json({ error: '요청 종류가 올바르지 않습니다.' }, 400);
  } catch (error) {
    return cognitoError(error) ?? handleError(error);
  }
}

export const config = { path: '/api/admin/users' };
