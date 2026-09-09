'use client';

import { useState } from 'react';
import { invalidatePublicMemories } from '../lib/publicMemories';
import './post-editor.css';

type Consent = { providerRights: boolean; peopleNotice: boolean };
type Contributor = { name: string; relationship: string; memory: string };
type Action = 'edit' | 'approve' | 'family' | 'reject' | 'trash' | 'restore';
export type EditablePost = {
  submissionId: string; status: string; sharing: string; contributor: Contributor; consent: Consent;
  titleKo?: string; memoryKo?: string; category?: string; adminNote?: string;
  originalSubmission?: { sharing: string; consent: Consent; contributor: Contributor };
  files: { key: string; type: string; originalName: string; previewUrl?: string }[];
};

export default function PostEditor({ item, groups, onChanged }: { item: EditablePost; groups: string[]; onChanged: () => Promise<void> }) {
  const [title, setTitle] = useState(item.titleKo ?? '');
  const [memory, setMemory] = useState(item.memoryKo ?? item.contributor.memory ?? '');
  const [name, setName] = useState(item.contributor.name ?? '');
  const [relationship, setRelationship] = useState(item.contributor.relationship ?? '');
  const [sharing, setSharing] = useState(item.sharing);
  const [category, setCategory] = useState(item.category ?? '');
  const [adminNote, setAdminNote] = useState(item.adminNote ?? '');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<Exclude<Action, 'edit'> | null>(null);
  const canEdit = groups.some(group => ['admin', 'family'].includes(group));
  const isAdmin = groups.includes('admin');
  const original = item.originalSubmission ?? item;
  const originalAllowsPublic = original.sharing === 'review' && original.consent.providerRights && (!item.files.length || original.consent.peopleNotice);
  const fields = { title, memory, name, relationship, sharing, category, adminNote };
  const initial = { title: item.titleKo ?? '', memory: item.memoryKo ?? item.contributor.memory ?? '', name: item.contributor.name ?? '', relationship: item.contributor.relationship ?? '', sharing: item.sharing, category: item.category ?? '', adminNote: item.adminNote ?? '' };
  const dirty = JSON.stringify(fields) !== JSON.stringify(initial);

  async function send(action: string, data: object = {}) {
    const response = await fetch('/api/admin/submissions', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ submissionId: item.submissionId, action, ...data }), signal: AbortSignal.timeout(30000),
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) throw new Error(result.error || '처리하지 못했습니다.');
  }
  const prompts = {
      approve: '제출자의 원본 공개 요청과 동의를 확인하셨나요? 이 글을 사이트에 공개합니다.',
      family: '공개 사이트에서 숨기고 가족 보관으로 변경할까요? 기존 사진 URL은 최대 1시간 유효합니다.',
      reject: '공개하지 않음으로 변경할까요?',
      trash: '휴지통으로 이동할까요? 사이트에서는 숨겨지며 사진 파일은 삭제하지 않습니다.',
      restore: '가족 보관으로 복구할까요? 자동으로 공개되지는 않습니다.',
  };
  function requestAction(action: Action) {
    if (action === 'edit') void perform(action);
    else setConfirmAction(action);
  }
  async function perform(action: Action) {
    setConfirmAction(null);
    setBusy(true); setMessage('');
    try {
      if (action === 'edit' || (dirty && !['trash', 'restore'].includes(action))) await send('edit', fields);
      if (action !== 'edit') await send(action, { publicationConfirmed: confirmed });
      invalidatePublicMemories();
      await onChanged();
    } catch (error) { setMessage(error instanceof Error ? error.message : '저장에 실패했습니다. 다시 시도해 주세요.'); }
    finally { setBusy(false); }
  }

  return <section aria-label="게시물 정보 수정">
    <div className="admin-photo-strip">{item.files.map((file, index) => file.previewUrl && file.type.startsWith('image/') ? <img key={file.key} src={file.previewUrl} alt={`제출 사진 ${index + 1}`} /> : <div key={file.key}>{file.originalName}</div>)}</div>
    <section className="post-original" aria-label="원본 제출 기록">
      <h3>원본 제출 기록 · 수정되지 않는 기록</h3>
      <p>작성자: {original.contributor.name || '미입력'} · 인연: {original.contributor.relationship || '미입력'}</p>
      <p>공개 요청: {original.sharing === 'review' ? '사이트 공개 요청' : '가족에게만 전달'}</p>
      <p>제공 권한 동의: {original.consent.providerRights ? '확인' : '미확인'} · 인물·개인정보 안내: {original.consent.peopleNotice ? '확인' : '미확인'}{!item.files.length && ' (사진 없는 글에는 필수 아님)'}</p>
      <small>기존 글은 최초 관리 수정 시점의 제출 기록을 보존합니다. 관리자 메모는 공개되지 않습니다.</small>
    </section>
    <fieldset disabled={!canEdit || busy || item.status === 'TRASH'} className="post-edit-fields">
      <legend>현재 관리자 설정</legend>
      <label>작성자 · 관리자에게만 표시<input value={name} maxLength={80} onChange={event => setName(event.target.value)} /></label>
      <label>아버님과의 인연 / 관계<input list="post-relationships" value={relationship} maxLength={100} onChange={event => setRelationship(event.target.value)} /><datalist id="post-relationships">{['가족', '친구', '제자', '동료', '기타'].map(value => <option key={value} value={value} />)}</datalist></label>
      <label>현재 공개 요청<select value={sharing} onChange={event => setSharing(event.target.value)}><option value="review">사이트 공개 요청</option><option value="family">가족에게만 전달</option></select></label>
      <small>공개 요청을 수정해도 게시 상태는 바뀌지 않습니다. 아래 공개 / 가족 보관 버튼으로 변경해 주세요.</small>
      <label>공개 제목<input value={title} maxLength={200} onChange={event => setTitle(event.target.value)} /></label>
      <label>추억 이야기<textarea rows={6} value={memory} maxLength={5000} onChange={event => setMemory(event.target.value)} /></label>
      <label>사진 분류<input list="post-categories" value={category} maxLength={100} onChange={event => setCategory(event.target.value)} /><datalist id="post-categories">{['가족', '친구', '제자', '교수·학계', '행사'].map(value => <option key={value} value={value} />)}</datalist></label>
      <label>관리자 메모 / 정정 사유 · 비공개<textarea rows={3} value={adminNote} maxLength={2000} onChange={event => setAdminNote(event.target.value)} placeholder="추가 공개 동의를 확인한 경위나 정정 사유를 기록해 주세요." /></label>
      <p role="status">{dirty ? '저장되지 않은 변경사항이 있습니다.' : '저장된 내용입니다.'}</p>
      <div className="moderation-actions"><button className="approve" disabled={!dirty} onClick={() => requestAction('edit')}>{busy ? '처리 중…' : '변경사항 저장'}</button></div>
    </fieldset>
    {canEdit && item.status !== 'TRASH' && <section className="post-visibility">
      <h3>공개 상태 변경</h3>
      <p>가족 보관은 관리자 공간에서만 열람합니다. 공개를 취소해도 기존 사진 URL은 최대 1시간 유효하며 이미 다운로드한 파일은 회수되지 않습니다.</p>
      {item.status !== 'PUBLISHED' && <><p>원본 기록: {originalAllowsPublic ? '사이트 공개 요청과 필수 동의가 확인되었습니다.' : '공개 요청 또는 필수 동의가 부족합니다. 추가 동의 내용을 위 메모에 기록해 주세요.'}</p><label><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} /> 원본 기록을 검토하고 필요한 공개 동의를 확인했습니다.</label></>}
      <div className="moderation-actions">
        {item.status !== 'FAMILY' && <button disabled={busy} onClick={() => requestAction('family')}>가족만 · 가족 보관</button>}
        {item.status === 'PENDING' && <button disabled={busy} onClick={() => requestAction('reject')}>공개하지 않음</button>}
        {item.status !== 'PUBLISHED' && <button className="approve" disabled={busy || !confirmed || (!originalAllowsPublic && !adminNote.trim())} onClick={() => requestAction('approve')}>공개 · Public</button>}
      </div>
    </section>}
    {isAdmin && <div className="moderation-actions">{item.status === 'TRASH' ? <button disabled={busy} onClick={() => requestAction('restore')}>가족 보관으로 복구</button> : <button disabled={busy} onClick={() => requestAction('trash')}>휴지통으로 이동</button>}</div>}
    {confirmAction && <section className="post-confirm" role="alertdialog" aria-labelledby="post-confirm-title" aria-describedby="post-confirm-description">
      <h3 id="post-confirm-title">게시물 상태 변경 확인</h3><p id="post-confirm-description">{prompts[confirmAction]}</p>
      <div className="moderation-actions"><button onClick={() => setConfirmAction(null)}>취소</button><button className="approve" onClick={() => perform(confirmAction)}>확인하고 진행</button></div>
    </section>}
    {message && <p className="admin-error" role="alert">{message}</p>}
  </section>;
}
