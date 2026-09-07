'use client';

import { useState } from 'react';

type UploadTicket = { url: string; key: string; contentType: string };
type UploadResponse = { submissionId?: string; uploads?: UploadTicket[]; manifest?: UploadTicket; error?: string };
const BATCH_SIZE = 10;

export default function AdminBulkUpload({ onComplete }: { onComplete: () => void | Promise<void> }) {
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [message, setMessage] = useState('');

  async function uploadBatch(batch: File[]) {
    const contributor = { name: '관리자 대량 업로드', relationship: '가족', memory: note };
    const response = await fetch('/api/create-upload-url', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ files: batch.map(file => ({ name: file.name, type: file.type, size: file.size })), sharing: 'review', contributor }) });
    const result = await response.json() as UploadResponse;
    if (!response.ok || !result.uploads || !result.manifest || !result.submissionId) throw new Error(result.error || '업로드 준비에 실패했습니다.');
    await Promise.all(result.uploads.map((ticket, index) => fetch(ticket.url, { method: 'PUT', headers: { 'content-type': ticket.contentType }, body: batch[index] }).then(upload => { if (!upload.ok) throw new Error(`${batch[index].name} 전송에 실패했습니다.`); })));
    const manifestBody = { version: 1, submissionId: result.submissionId, submittedAt: new Date().toISOString(), sharing: 'review', contributor, consent: { providerRights: true, peopleNotice: true }, files: result.uploads.map((ticket, index) => ({ key: ticket.key, originalName: batch[index].name, type: batch[index].type, size: batch[index].size })) };
    const manifestUpload = await fetch(result.manifest.url, { method: 'PUT', headers: { 'content-type': result.manifest.contentType }, body: JSON.stringify(manifestBody) });
    if (!manifestUpload.ok) throw new Error('업로드 목록 저장에 실패했습니다.');
    const complete = await fetch('/api/complete-submission', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(manifestBody) });
    const completeResult = await complete.json() as { error?: string };
    if (!complete.ok) throw new Error(completeResult.error || '관리자 검토함 등록에 실패했습니다.');
  }

  async function startUpload() {
    if (!files.length || !confirmed) return;
    setUploading(true); setCompleted(0); setMessage('');
    let finished = 0;
    try {
      for (let start = 0; start < files.length; start += BATCH_SIZE) {
        const batch = files.slice(start, start + BATCH_SIZE);
        await uploadBatch(batch);
        finished += batch.length;
        setCompleted(finished);
      }
      setMessage(`${files.length}개 파일을 승인 대기함에 안전하게 저장했습니다.`);
      setFiles([]); setNote(''); setConfirmed(false);
      await onComplete();
    } catch (reason) {
      setMessage(reason instanceof Error ? `${finished}개 완료 후 중단: ${reason.message}` : '업로드 중 문제가 발생했습니다.');
    } finally { setUploading(false); }
  }

  return <section className="admin-bulk-upload">
    <div className="panel-heading"><div><span>관리자 전용</span><h2>사진 대량 업로드</h2></div><strong>{files.length ? `${files.length}개 선택` : '비공개 저장'}</strong></div>
    <p>사진과 영상을 한꺼번에 선택하면 10개씩 안전하게 나누어 승인 대기함에 저장합니다. 업로드만으로 공개되지는 않습니다.</p>
    <label className="admin-bulk-picker">＋ 사진·영상 여러 개 선택<input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime" multiple disabled={uploading} onChange={event => { setFiles(Array.from(event.target.files ?? [])); setCompleted(0); setMessage(''); }} /></label>
    {files.length > 0 && <div className="admin-bulk-summary"><strong>{files.length}개 파일</strong><span>{files.slice(0, 3).map(file => file.name).join(' · ')}{files.length > 3 ? ` 외 ${files.length - 3}개` : ''}</span></div>}
    <label>사진 묶음 메모 <span>선택사항</span><textarea rows={3} value={note} disabled={uploading} onChange={event => setNote(event.target.value)} placeholder="예: 아버지 컴퓨터에서 옮긴 학창 시절 사진" /></label>
    <label className="admin-bulk-consent"><input type="checkbox" checked={confirmed} disabled={uploading} onChange={event => setConfirmed(event.target.checked)} /> 공개 전 사진 속 인물과 초상권을 관리자 검토함에서 확인하겠습니다.</label>
    {uploading && <div className="admin-upload-progress" role="status"><progress max={files.length} value={completed} /><span>{completed} / {files.length}개 저장 완료</span></div>}
    {message && <p className="admin-bulk-message" role="status">{message}</p>}
    <button className="admin-bulk-start" disabled={!files.length || !confirmed || uploading} onClick={startUpload}>{uploading ? '사진을 안전하게 저장하는 중…' : '승인 대기함에 업로드'}</button>
  </section>;
}
