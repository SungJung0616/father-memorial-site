'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

type Role = 'admin' | 'family' | 'reviewer';
type ManagedUser = {
  username: string;
  email: string;
  enabled: boolean;
  status: string;
  role: Role | null;
  createdAt: string;
  updatedAt: string;
};

const roleLabels: Record<Role, string> = { admin: '관리자', family: '가족 매니저', reviewer: '검토 도우미' };
const statusLabels: Record<string, string> = {
  FORCE_CHANGE_PASSWORD: '첫 로그인 대기',
  CONFIRMED: '사용 중',
  RESET_REQUIRED: '비밀번호 재설정 필요',
  UNCONFIRMED: '이메일 확인 대기',
  ARCHIVED: '보관됨',
  COMPROMISED: '보안 확인 필요',
  UNKNOWN: '상태 확인 필요',
};

export default function MemberManager({ currentEmail }: { currentEmail: string }) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('family');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/users');
      const result = await response.json() as { users?: ManagedUser[]; error?: string };
      if (!response.ok) throw new Error(result.error || '사용자 목록을 불러오지 못했습니다.');
      setUsers(result.users ?? []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '사용자 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  async function request(body: Record<string, string>, confirmation?: string) {
    if (confirmation && !window.confirm(confirmation)) return false;
    const key = body.username ? `${body.action}:${body.username}` : body.action;
    setWorking(key); setMessage(''); setError('');
    try {
      const response = await fetch('/api/admin/users', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const result = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error || '회원 작업을 완료하지 못했습니다.');
      setMessage(result.message || '처리가 완료되었습니다.');
      await load();
      return true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '회원 작업을 완료하지 못했습니다.');
      return false;
    } finally {
      setWorking('');
    }
  }

  async function invite(event: FormEvent) {
    event.preventDefault();
    const invited = await request({ action: 'invite', email: email.trim(), role }, `${email.trim()} 주소로 ${roleLabels[role]} 초대를 보낼까요?`);
    if (invited) setEmail('');
  }

  async function changeRole(user: ManagedUser, nextRole: Role) {
    if (user.role === nextRole) return;
    await request({ action: 'role', username: user.username, role: nextRole }, `${user.email}의 권한을 ${roleLabels[nextRole]}(으)로 변경할까요?`);
  }

  return <section className="member-management">
    <div className="panel-heading"><div><span>COGNITO 계정</span><h2>회원과 권한 관리</h2></div><button onClick={load} disabled={loading}>새로고침</button></div>
    <p className="member-security-note">관리자는 비밀번호를 만들거나 볼 수 없습니다. Cognito가 임시 로그인 정보를 이메일로 보내며, 초대받은 분이 첫 로그인에서 본인의 새 비밀번호를 설정합니다.</p>

    <form className="member-invite" onSubmit={invite}>
      <div><strong>새 사용자 초대</strong><span>이메일과 역할만 지정합니다.</span></div>
      <label>이메일<input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="family@example.com" autoComplete="off" required /></label>
      <label>권한<select value={role} onChange={event => setRole(event.target.value as Role)}><option value="family">가족 매니저</option><option value="reviewer">검토 도우미</option><option value="admin">관리자</option></select></label>
      <button disabled={working === 'invite'}>{working === 'invite' ? '초대하는 중…' : '초대 메일 보내기'}</button>
    </form>

    {message && <div className="admin-notice" role="status">{message}</div>}
    {error && <div className="member-error" role="alert">{error}</div>}

    <div className="member-role-grid">
      <article><strong>관리자</strong><p>회원과 권한, 사이트 설정을 포함한 모든 관리자 기능을 사용합니다.</p></article>
      <article><strong>가족 매니저</strong><p>대량 업로드, 게시물 관리, 공개 승인과 대표사진 관리를 담당합니다.</p></article>
      <article><strong>검토 도우미</strong><p>자료와 정보를 검토·수정하지만 최종 공개 승인과 대표사진 변경은 할 수 없습니다.</p></article>
    </div>

    <div className="member-list-heading"><strong>현재 사용자</strong><span>{loading ? '불러오는 중…' : `${users.length}명`}</span></div>
    {!loading && users.length === 0 && <p className="empty-state">등록된 사용자가 없습니다.</p>}
    <div className="member-user-list">
      {users.map(user => {
        const self = user.email.toLowerCase() === currentEmail.toLowerCase();
        const busy = working.endsWith(`:${user.username}`);
        return <article key={user.username} className={!user.enabled ? 'disabled' : ''}>
          <div className="member-user-summary">
            <strong>{user.email || '이메일 없음'}{self && <small>내 계정</small>}</strong>
            <span className={user.enabled ? 'member-status active' : 'member-status'}>{user.enabled ? statusLabels[user.status] || user.status : '비활성화됨'}</span>
          </div>
          <label>현재 권한<select value={user.role ?? ''} onChange={event => changeRole(user, event.target.value as Role)} disabled={busy}><option value="" disabled>권한 없음</option><option value="admin">관리자</option><option value="family">가족 매니저</option><option value="reviewer">검토 도우미</option></select></label>
          <div className="member-user-actions">
            {user.status === 'FORCE_CHANGE_PASSWORD' && <button onClick={() => request({ action: 'resend', username: user.username }, `${user.email}에게 새 임시 로그인 정보를 다시 보낼까요?`)} disabled={busy}>초대 재전송</button>}
            {user.status !== 'FORCE_CHANGE_PASSWORD' && <button onClick={() => request({ action: 'reset', username: user.username }, `${user.email}의 비밀번호 재설정 절차를 시작할까요?`)} disabled={busy}>비밀번호 재설정</button>}
            {user.enabled ? <button className="danger" onClick={() => request({ action: 'disable', username: user.username }, `${user.email} 계정을 비활성화할까요? 다시 활성화할 때까지 로그인할 수 없습니다.`)} disabled={busy || self}>{self ? '내 계정 보호됨' : '비활성화'}</button> : <button onClick={() => request({ action: 'enable', username: user.username }, `${user.email} 계정을 다시 활성화할까요?`)} disabled={busy}>다시 활성화</button>}
          </div>
        </article>;
      })}
    </div>
  </section>;
}
