'use client';
import { useState } from 'react';

type UploadTicket = { url: string; key: string; contentType: string };
type UploadResponse = { submissionId?: string; uploads?: UploadTicket[]; manifest?: UploadTicket; contributor?: {name:string;relationship:string;memory:string}; sharing?: string; error?: string };

export default function ContributePage(){
  const [step,setStep]=useState(1); const [done,setDone]=useState(false); const [sharing,setSharing]=useState('review');
  const [files,setFiles]=useState<File[]>([]); const [consent,setConsent]=useState(false); const [peopleConsent,setPeopleConsent]=useState(false);
  const [name,setName]=useState(''); const [relationship,setRelationship]=useState(''); const [memory,setMemory]=useState('');
  const [uploading,setUploading]=useState(false); const [error,setError]=useState('');

  async function submit(){
    if(!consent||!peopleConsent){setError('두 가지 동의 내용을 모두 확인해 주세요.');return;}
    if(files.length===0){setError('보낼 사진이나 영상을 한 개 이상 선택해 주세요.');setStep(1);return;}
    setUploading(true);setError('');
    try{
      const response=await fetch('/api/create-upload-url',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({files:files.map(file=>({name:file.name,type:file.type,size:file.size})),sharing,contributor:{name,relationship,memory}})});
      const result=await response.json() as UploadResponse; if(!response.ok||!result.uploads)throw new Error(result.error||'업로드 준비에 실패했습니다.');
      await Promise.all(result.uploads.map((ticket,index)=>fetch(ticket.url,{method:'PUT',headers:{'content-type':ticket.contentType},body:files[index]}).then(upload=>{if(!upload.ok)throw new Error('파일 전송에 실패했습니다.');})));
      if(!result.manifest)throw new Error('추억 정보 저장을 준비하지 못했습니다.');
      const manifestBody={version:1,submissionId:result.submissionId,submittedAt:new Date().toISOString(),sharing:result.sharing,contributor:result.contributor,consent:{providerRights:true,peopleNotice:true},files:result.uploads.map((ticket,index)=>({key:ticket.key,originalName:files[index].name,type:files[index].type,size:files[index].size}))};
      const manifestUpload=await fetch(result.manifest.url,{method:'PUT',headers:{'content-type':result.manifest.contentType},body:JSON.stringify(manifestBody)}); if(!manifestUpload.ok)throw new Error('추억 정보 저장에 실패했습니다.');
      setDone(true);
    }catch(reason){setError(reason instanceof Error?reason.message:'잠시 후 다시 시도해 주세요.');}finally{setUploading(false);}
  }

  if(done)return <main className="contribute-page"><section className="contribute-shell thank-you" role="status"><span className="success-mark" aria-hidden="true">✓</span><p className="success-kicker">전송 완료</p><h1>사진과 추억을<br/>잘 받았습니다.</h1><p><strong>{files.length}개의 파일이 안전하게 전달되었습니다.</strong><br/>바로 공개되지 않으며 가족이 내용을 확인한 뒤 선택하신 방식으로 보관하거나 게시합니다.</p><div className="success-actions"><a href="/community">추억 이야기로 돌아가기</a><button onClick={()=>{setDone(false);setStep(1);setFiles([]);setConsent(false);setPeopleConsent(false);}}>사진 더 보내기</button></div></section></main>;
  return <main className="contribute-page"><a className="contribute-back" href="/community">← 추억 이야기로 돌아가기</a><section className="contribute-shell">
    <p className="section-kicker">1분이면 충분합니다</p><h1>사진과 추억 보내기</h1><div className="step-indicator" aria-label={`3단계 중 ${step}단계`}><span className={step>=1?'active':''}>1 사진</span><span className={step>=2?'active':''}>2 추억</span><span className={step>=3?'active':''}>3 확인</span></div>
    {step===1&&<div className="contribute-step"><h2>사진을 선택해 주세요</h2><p>한 번에 최대 10개의 사진이나 영상을 선택할 수 있습니다.</p><label className="large-file-button">＋ 사진 선택하기<input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime" multiple onChange={event=>{const chosen=Array.from(event.target.files??[]);if(chosen.length>10){setError('한 번에 최대 10개까지 선택할 수 있습니다.');setFiles([]);}else{setFiles(chosen);setError('');}}}/></label>{files.length>0&&<p><strong>{files.length}개</strong>의 파일을 선택했습니다.</p>}{error&&<p role="alert">{error}</p>}<button disabled={files.length===0} onClick={()=>setStep(2)}>다음</button></div>}
    {step===2&&<div className="contribute-step"><h2>아시는 이야기를 적어주세요</h2><label>성함<input value={name} onChange={event=>setName(event.target.value)} placeholder="성함을 입력해 주세요" /></label><label>교수님과의 인연<select value={relationship} onChange={event=>setRelationship(event.target.value)}><option value="" disabled>선택해 주세요</option><option>가족·친지</option><option>친구</option><option>제자</option><option>교수·학계 동료</option><option>기타</option></select></label><label>추억 이야기 <span>선택사항</span><textarea rows={5} value={memory} onChange={event=>setMemory(event.target.value)} placeholder="언제, 어디에서 찍은 사진인지 또는 기억나는 이야기를 적어주세요" /></label><div className="step-buttons"><button className="quiet" onClick={()=>setStep(1)}>이전</button><button onClick={()=>setStep(3)}>다음</button></div></div>}
    {step===3&&<div className="contribute-step consent-step"><h2>어떻게 전달할까요?</h2><label className="sharing-choice"><input type="radio" name="sharing" checked={sharing==='review'} onChange={()=>setSharing('review')}/><span><strong>사이트 공개를 요청합니다</strong>가족이 사진 속 인물과 내용을 확인한 뒤 공개합니다.</span></label><label className="sharing-choice"><input type="radio" name="sharing" checked={sharing==='family'} onChange={()=>setSharing('family')}/><span><strong>가족에게만 전달합니다</strong>공개하지 않고 가족 자료로만 보관합니다.</span></label><label className="consent"><input type="checkbox" checked={consent} onChange={event=>setConsent(event.target.checked)}/> 이 사진을 제공할 권한이 있으며, 제 얼굴이 있다면 선택한 방식으로 사용하는 것에 동의합니다.</label><label className="consent"><input type="checkbox" checked={peopleConsent} onChange={event=>setPeopleConsent(event.target.checked)}/> 함께 나온 분들의 공개 여부를 확인했거나, 확인하지 못한 분이 있음을 가족에게 알리겠습니다.</label><div className="privacy-note"><strong>사진은 바로 공개되지 않습니다.</strong><span>가족 관리자가 공개 가능 여부를 먼저 확인합니다.</span></div>{error&&<p role="alert">{error}</p>}<div className="step-buttons"><button className="quiet" disabled={uploading} onClick={()=>setStep(2)}>이전</button><button disabled={uploading} onClick={submit}>{uploading?'안전하게 보내는 중…':'가족에게 보내기'}</button></div></div>}
  </section></main>;
}
