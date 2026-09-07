'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import AdminBulkUpload from './AdminBulkUpload';

type AdminUser = { email: string; groups: string[] };
type SubmissionFile = { key: string; originalName: string; type: string; size: number; previewUrl?: string; publishedKey?: string };
type Submission = {
  submissionId: string; status: string; sharing: string; submittedAt: string;
  contributor: { name: string; relationship: string; memory: string };
  consent: { providerRights: boolean; peopleNotice: boolean };
  files: SubmissionFile[]; titleKo?: string; memoryKo?: string; category?: string;
};

const statusLabels: Record<string, string> = { PENDING: '승인 대기', FAMILY: '가족 보관', PUBLISHED: '공개 완료', REJECTED: '공개하지 않음' };

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [email, setEmail] = useState('sung.gpslgx@gmail.com');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [challengeSession, setChallengeSession] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [resetRequested, setResetRequested] = useState(false);
  const [status, setStatus] = useState('PENDING');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [memory, setMemory] = useState('');
  const [category, setCategory] = useState('');

  const loadSubmissions = useCallback(async (nextStatus: string) => {
    setLoading(true); setMessage('');
    try {
      const response = await fetch(`/api/admin/submissions?status=${nextStatus}`);
      if (response.status === 401) { setUser(null); return; }
      const result = await response.json() as { submissions?: Submission[]; error?: string };
      if (!response.ok) throw new Error(result.error || '검토함을 불러오지 못했습니다.');
      setSubmissions(result.submissions ?? []); setSelected(null);
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : '검토함을 불러오지 못했습니다.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetch('/api/admin/session').then(async response => {
      if (response.ok) { const result = await response.json() as { user: AdminUser }; setUser(result.user); await loadSubmissions('PENDING'); }
    }).finally(() => setChecking(false));
  }, [loadSubmissions]);

  async function login(event: FormEvent) {
    event.preventDefault(); setLoggingIn(true); setLoginError('');
    try {
      const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password, newPassword: newPassword || undefined, session: challengeSession || undefined }) });
      const result = await response.json() as { error?: string; requiresNewPassword?: boolean; session?: string };
      if (!response.ok) throw new Error(result.error || '로그인하지 못했습니다.');
      if (result.requiresNewPassword) { setChallengeSession(result.session || ''); return; }
      const sessionResponse = await fetch('/api/admin/session');
      const sessionResult = await sessionResponse.json() as { user?: AdminUser; error?: string };
      if (!sessionResponse.ok || !sessionResult.user) throw new Error(sessionResult.error || '로그인을 확인하지 못했습니다.');
      setUser(sessionResult.user); await loadSubmissions('PENDING'); setPassword(''); setNewPassword('');
    } catch (reason) { setLoginError(reason instanceof Error ? reason.message : '로그인하지 못했습니다.'); }
    finally { setLoggingIn(false); }
  }

  async function resetPassword(event: FormEvent) {
    event.preventDefault(); setLoggingIn(true); setLoginError('');
    try {
      const action = resetRequested ? 'confirm' : 'request';
      const response = await fetch('/api/admin/password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action, email, code: resetCode, newPassword }) });
      const result = await response.json() as { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error || '비밀번호를 재설정하지 못했습니다.');
      if (action === 'request') { setResetRequested(true); setLoginError(result.message || '이메일로 확인 코드를 보냈습니다.'); }
      else { setResetMode(false); setResetRequested(false); setResetCode(''); setPassword(''); setNewPassword(''); setLoginError(result.message || '새 비밀번호가 설정되었습니다.'); }
    } catch (reason) { setLoginError(reason instanceof Error ? reason.message : '비밀번호를 재설정하지 못했습니다.'); }
    finally { setLoggingIn(false); }
  }

  async function logout() { await fetch('/api/admin/session', { method: 'DELETE' }); setUser(null); setSubmissions([]); }
  function choose(item: Submission) { setSelected(item); setTitle(item.titleKo || ''); setMemory(item.memoryKo || item.contributor.memory || ''); setCategory(item.category || ''); setMessage(''); }

  async function review(action: 'approve' | 'family' | 'reject') {
    if (!selected) return;
    const label = action === 'approve' ? '공개 승인' : action === 'family' ? '가족 전용 보관' : '공개하지 않음';
    if (!window.confirm(`이 제출물을 ‘${label}’ 상태로 변경할까요?`)) return;
    setLoading(true); setMessage('');
    try {
      const response = await fetch('/api/admin/submissions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ submissionId: selected.submissionId, action, title, memory, category }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || '처리하지 못했습니다.');
      setMessage(`${label} 처리가 완료되었습니다.`); await loadSubmissions(status);
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : '처리하지 못했습니다.'); }
    finally { setLoading(false); }
  }

  if (checking) return <main className="admin-login"><section><p>관리자 전용</p><h1>로그인을 확인하고 있습니다</h1></section></main>;
  if (!user) return <main className="admin-login"><form onSubmit={resetMode ? resetPassword : login}>
    <Link href="/">← 공개 사이트로 돌아가기</Link><p>가족 관리자 전용</p><h1>{resetMode ? '관리자 비밀번호 재설정' : '사이트 관리 로그인'}</h1>
    <label>이메일<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="username" required /></label>
    {resetMode ? <>{resetRequested && <label>이메일 확인 코드<input value={resetCode} onChange={event => setResetCode(event.target.value)} inputMode="numeric" autoComplete="one-time-code" required /></label>}{resetRequested && <label>새 비밀번호<input type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} autoComplete="new-password" minLength={10} required /><small>영문 대·소문자와 숫자를 포함해 10자 이상 입력해 주세요.</small></label>}</> : <><label>{challengeSession ? '현재 임시 비밀번호' : '비밀번호'}<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required /></label>{challengeSession && <label>새 비밀번호<input type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} autoComplete="new-password" minLength={10} required /><small>영문 대·소문자와 숫자를 포함해 10자 이상 입력해 주세요.</small></label>}</>}
    {loginError && <p className="admin-error" role="status">{loginError}</p>}
    <button disabled={loggingIn}>{loggingIn ? '확인 중…' : resetMode ? (resetRequested ? '새 비밀번호 저장' : '이메일로 확인 코드 받기') : (challengeSession ? '새 비밀번호 설정하고 로그인' : '로그인')}</button>
    <button className="admin-login-secondary" type="button" onClick={() => { setResetMode(value => !value); setResetRequested(false); setResetCode(''); setNewPassword(''); setLoginError(''); }}>{resetMode ? '로그인으로 돌아가기' : '임시 비밀번호가 만료되었거나 비밀번호를 잊으셨나요?'}</button>
  </form></main>;

  return <main className="admin-page">
    <aside className="admin-sidebar"><Link className="admin-brand" href="/">정영훈 교수님<br /><span>사이트 관리</span></Link><nav>{Object.entries(statusLabels).map(([value, label]) => <button key={value} className={status === value ? 'active' : ''} onClick={() => { setStatus(value); loadSubmissions(value); }}>{label}</button>)}</nav><Link className="back-site" href="/">← 공개 사이트 보기</Link></aside>
    <section className="admin-workspace">
      <header><div><p>실제 관리자 검토함</p><h1>{statusLabels[status]}</h1></div><div className="admin-account"><strong>{user.email}</strong><button onClick={logout}>로그아웃</button></div></header>
      <AdminBulkUpload onComplete={() => { setStatus('PENDING'); return loadSubmissions('PENDING'); }} />
      {message && <div className="admin-notice" role="status">{message}</div>}
      <div className="admin-review-layout">
        <section className="submission-list"><div className="panel-heading"><div><span>자료</span><h2>{loading ? '불러오는 중…' : `${submissions.length}건`}</h2></div><button onClick={() => loadSubmissions(status)} disabled={loading}>새로고침</button></div>{!loading && submissions.length === 0 && <p className="empty-state">이 상태의 제출물이 없습니다.</p>}{submissions.map(item => <button className={selected?.submissionId === item.submissionId ? 'submission-card selected' : 'submission-card'} key={item.submissionId} onClick={() => choose(item)}><span className="submission-thumb">{item.files[0]?.previewUrl && item.files[0].type.startsWith('image/') ? <img src={item.files[0].previewUrl} alt="제출된 사진 미리보기" /> : '파일'}</span><span><strong>{item.contributor.name || '이름 없음'}</strong><small>{item.contributor.relationship || '관계 미입력'} · {new Date(item.submittedAt).toLocaleDateString('ko-KR')}</small><em>{item.files.length}개 파일</em></span></button>)}</section>
        <section className="submission-detail">{selected ? <><div className="panel-heading"><div><span>검토</span><h2>{selected.contributor.name || '이름 없음'}</h2></div><strong>{statusLabels[selected.status]}</strong></div><div className="admin-photo-strip">{selected.files.map((file, index) => file.previewUrl && file.type.startsWith('image/') ? <img key={file.key} src={file.previewUrl} alt={`제출 사진 ${index + 1}`} /> : <div key={file.key}>{file.originalName}</div>)}</div><dl className="submission-facts"><div><dt>인연</dt><dd>{selected.contributor.relationship || '미입력'}</dd></div><div><dt>공개 요청</dt><dd>{selected.sharing === 'review' ? '사이트 공개 요청' : '가족에게만 전달'}</dd></div><div><dt>동의</dt><dd>{selected.consent.providerRights && selected.consent.peopleNotice ? '두 항목 확인' : '추가 확인 필요'}</dd></div></dl><label>공개 제목<input value={title} onChange={event => setTitle(event.target.value)} placeholder="예: 아버지 은퇴식 날의 가족사진" /></label><label>추억 이야기<textarea rows={6} value={memory} onChange={event => setMemory(event.target.value)} /></label><label>사진 분류<select value={category} onChange={event => setCategory(event.target.value)}><option value="">분류 선택</option><option>가족</option><option>친구</option><option>제자</option><option>교수·학계</option><option>행사</option></select></label>{selected.status === 'PENDING' && <div className="moderation-actions"><button onClick={() => review('reject')} disabled={loading}>공개하지 않음</button><button onClick={() => review('family')} disabled={loading}>가족 전용 보관</button><button className="approve" onClick={() => review('approve')} disabled={loading}>공개 승인</button></div>}</> : <div className="empty-state"><strong>제출물을 선택해 주세요</strong><p>왼쪽 목록에서 사진을 선택하면 내용과 동의를 확인할 수 있습니다.</p></div>}</section>
      </div>
    </section>
  </main>;
}
