'use client';
import { useEffect, useRef, useState } from 'react';
function AttachmentPreview({file}:{file:File}) {
 const imageRef=useRef<HTMLImageElement>(null), videoRef=useRef<HTMLVideoElement>(null);
 useEffect(()=>{const value=URL.createObjectURL(file); const node=imageRef.current||videoRef.current; if(node)node.src=value; return()=>URL.revokeObjectURL(value);},[file]);
 return <figure>{file.type.startsWith('video/') ? <video ref={videoRef} controls style={{maxWidth:'100%',maxHeight:220}}/> : <img ref={imageRef} alt={file.name} style={{maxWidth:'100%',maxHeight:220,objectFit:'contain'}}/>}<figcaption>{file.name}</figcaption></figure>;
}
type UploadTicket = { url: string; key: string; contentType: string };
type UploadResponse = { submissionId?: string; uploads?: UploadTicket[]; manifest?: UploadTicket; contributor?: {name:string;relationship:string;memory:string}; sharing?: string; error?: string };
export default function ContributeForm({language='ko'}:{language?:'ko'|'en'}) {
 const en=language==='en', t=(ko:string,english:string)=>en?english:ko;
 const relationshipOptions = [
  {value:'가족',ko:'가족',en:'Family'}, {value:'친구',ko:'친구',en:'Friend'},
  {value:'제자',ko:'제자',en:'Student'}, {value:'동료',ko:'동료',en:'Colleague'},
  {value:'교수·학계',ko:'교수·학계',en:'Academic / Professional'}, {value:'기타',ko:'기타',en:'Other'},
 ];
 const relationshipLabel = (value:string) => relationshipOptions.find(option=>option.value===value)?.[en?'en':'ko'] || value || '—';
 const [step,setStep]=useState(1), [done,setDone]=useState(false), [sharing,setSharing]=useState('review');
 const [files,setFiles]=useState<File[]>([]), [consent,setConsent]=useState(false), [peopleConsent,setPeopleConsent]=useState(false);
 const [name,setName]=useState(''),[relationship,setRelationship]=useState(''),[memory,setMemory]=useState(''),[title,setTitle]=useState('');
 const [uploading,setUploading]=useState(false),[progress,setProgress]=useState(''),[error,setError]=useState('');
 const [textId]=useState(()=>crypto.randomUUID());
   async function submit(){
    if(!consent){setError(t('필수 동의 내용을 확인해 주세요.','Please confirm that you have the right to share this contribution.'));return;}
    if(files.length>0&&!peopleConsent){setError(t('사진·영상 속 인물에 관한 동의 내용을 확인해 주세요.','Please confirm the permission notice for people shown in the photographs or videos.'));return;}
    if(!memory.trim()){setError(t('추억 내용을 입력해 주세요.', 'Please share a memory.'));setStep(1);return;}
    setUploading(true);setError('');
    try{
      if (!files.length) {
        setProgress(t('추억을 저장하고 있습니다…','Saving your memory…'));
        const response = await fetch('/api/complete-submission', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ submissionId: textId, sharing, title, contributor: {name,relationship,memory}, consent: {providerRights: consent, peopleNotice: false}, files: [] }), signal: AbortSignal.timeout(20000) });
        if (!response.ok) throw new Error(t('추억을 저장하지 못했습니다. 다시 시도해 주세요.', 'Unable to save your memory. Please try again.'));
        setDone(true); return;
      }
      setProgress(t('업로드를 준비하고 있습니다…','Preparing your upload…'));
      const response=await fetch('/api/create-upload-url',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({files:files.map(file=>({name:file.name,type:file.type,size:file.size})),sharing,contributor:{name,relationship,memory}})});
      const result=await response.json() as UploadResponse; if(!response.ok||!result.uploads)throw new Error(en?'We could not prepare the upload. Please check the file type and size, then try again.':result.error||'업로드 준비에 실패했습니다.');
      setProgress(t('파일을 전송하고 있습니다…',`Uploading ${files.length === 1 ? '1 file' : `${files.length} files`}…`));
      await Promise.all(result.uploads.map((ticket,index)=>fetch(ticket.url,{method:'PUT',headers:{'content-type':ticket.contentType},body:files[index]}).then(upload=>{if(!upload.ok)throw new Error(t('파일 전송에 실패했습니다.','A file could not be uploaded. Please try again.'));})));
      if(!result.manifest)throw new Error(t('추억 정보 저장을 준비하지 못했습니다.','We could not prepare your memory for saving. Please try again.'));
      const manifestBody={title,version:1,submissionId:result.submissionId,submittedAt:new Date().toISOString(),sharing:result.sharing,contributor:result.contributor,consent:{providerRights:true,peopleNotice:true},files:result.uploads.map((ticket,index)=>({key:ticket.key,originalName:files[index].name,type:files[index].type,size:files[index].size}))};
      setProgress(t('추억을 저장하고 있습니다…','Saving your memory…'));
      const manifestUpload=await fetch(result.manifest.url,{method:'PUT',headers:{'content-type':result.manifest.contentType},body:JSON.stringify(manifestBody)}); if(!manifestUpload.ok)throw new Error(t('추억 정보 저장에 실패했습니다.','We could not save your memory. Please try again.'));
      const complete=await fetch('/api/complete-submission',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(manifestBody)});
      const completeResult=await complete.json() as {error?:string}; if(!complete.ok)throw new Error(en?'We could not send your memory to the family review queue. Please try again.':completeResult.error||'가족 검토함 등록에 실패했습니다.');
      setDone(true);
    }catch(reason){setError(reason instanceof Error?reason.message:t('잠시 후 다시 시도해 주세요.','Something went wrong. Please try again.'));}finally{setUploading(false);setProgress('');}
  }


 if(done)return <main className="contribute-page" lang={language}><section className="contribute-shell thank-you" role="status"><span className="success-mark">✓</span><h1>{t('소중한 추억을 잘 받았습니다.','Thank you for sharing your memory.')}</h1><p>{t('바로 공개되지 않으며 가족이 내용을 확인한 뒤 선택하신 방식으로 보관하거나 게시합니다.','Your submission will be reviewed by the family before it is shared or kept privately, according to your choice.')}</p><a href={en?'/community?lang=en':'/community'}>{t('추억 이야기로 돌아가기','Return to memories')}</a></section></main>;
 return <main className="contribute-page" lang={language}><a className="contribute-back" href={en?'/community?lang=en':'/community'}>{t('← 추억 이야기','← Memories')}</a><a href={en?'/contribute':'/en/contribute'}>{en?'한국어':'English'}</a><section className="contribute-shell">
 <h1>{t('추억 보내기','Share a Memory')}</h1><div className="step-indicator"><span className={step>=1?'active':''}>{t('1 추억','1 Memory')}</span><span className={step>=2?'active':''}>{t('2 사진 (선택)','2 Photos (optional)')}</span><span className={step>=3?'active':''}>{t('3 확인','3 Review')}</span></div>
 {step===1&&<div className="contribute-step"><h2>{t('아버님과의 추억을 들려주세요','Share your memories of Professor Jung')}</h2><p>{t('함께했던 순간, 기억에 남는 이야기, 전하고 싶은 말을 자유롭게 남겨주세요. 사진이 없어도 괜찮습니다. 기억만 들려주셔도 소중히 간직하겠습니다.','Tell us about a moment you shared, a story you remember, or something you would like to say. No photograph is needed—your memories are a precious gift in themselves.')}</p>
 <label>{t('작성자 이름 (관리자만 확인)','Your name (visible only to the family administrators)')}<input value={name} maxLength={80} onChange={e=>setName(e.target.value)}/></label>
 <label>{t('아버님과의 관계','Your connection to Professor Jung')}<select value={relationship} onChange={e=>setRelationship(e.target.value)}><option value="">{t('선택해 주세요','Please select')}</option>{relationshipOptions.map(option=><option key={option.value} value={option.value}>{en?option.en:option.ko}</option>)}</select></label>
 <p>{t('관계·제목·추억 내용은 가족 승인 후 공개될 수 있습니다. 이름은 공개하지 않습니다.','Your connection, title and memory may be published after family review. Your name will not be shown publicly.')}</p>
 <label>{t('제목 (선택사항)','Title (optional)')}<input value={title} maxLength={200} onChange={e=>setTitle(e.target.value)}/></label>
 <label>{t('추억 내용 (필수)','Your memory (required)')}<textarea rows={7} required maxLength={5000} value={memory} onChange={e=>setMemory(e.target.value)}/></label>
 <button onClick={()=>{if(!memory.trim()){setError(t('추억 내용을 입력해 주세요.','Please share a memory.'));return;}setError('');setStep(2);}}>{t('다음','Continue')}</button></div>}
 {step===2&&<div className="contribute-step"><h2>{t('함께 남기고 싶은 사진이 있으신가요?','Would you like to include any photographs?')}</h2><p>{t('사진이나 영상이 있다면 함께 보내주세요. 사진 없이 추억만 보내셔도 됩니다.','You are welcome to include photographs or videos, or simply share your words.')}</p><p className="upload-guidance">{t('지원 형식: JPEG, PNG, WebP, HEIC/HEIF, MP4, MOV. 최대 10개이며 사진은 파일당 25MB, 영상은 파일당 500MB까지 가능합니다.','Supported formats: JPEG, PNG, WebP, HEIC/HEIF, MP4 and MOV. You may add up to 10 files; photographs may be up to 25 MB each and videos up to 500 MB each.')}</p><label className="large-file-button">{t('사진·영상 선택 (최대 10개)','Choose photos or videos (up to 10)')}<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime" onChange={e=>{const chosen=Array.from(e.target.files??[]);e.target.value='';if(chosen.length>10){setError(t('최대 10개까지 선택해 주세요.','Please choose no more than 10 files.'));return;}setFiles(chosen);setError('');}}/></label><ul>{files.map((f,i)=><li key={i}>{f.name} <button onClick={()=>setFiles(current=>current.filter((_,j)=>j!==i))}>{t('제거','Remove')}</button></li>)}</ul><div className="step-buttons"><button className="quiet" onClick={()=>setStep(1)}>{t('이전','Back')}</button><button onClick={()=>{setError('');setStep(3);}}>{files.length?t('다음','Continue'):t('사진 없이 계속하기','Continue without photos')}</button></div></div>}
 {step===3&&<div className="contribute-step consent-step"><h2>{t('보내기 전에 확인해 주세요','Review your memory')}</h2><dl><dt>{t('작성자 (비공개)','Name (private)')}</dt><dd>{name||'—'}</dd><dt>{t('관계','Connection')}</dt><dd>{relationshipLabel(relationship)}</dd><dt>{t('제목','Title')}</dt><dd>{title||t('제목 없음','Untitled')}</dd><dt>{t('추억 내용','Memory')}</dt><dd style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{memory}</dd><dt>{t('첨부 파일','Attachments')}</dt><dd>{files.length?files.map(f=>f.name).join(', '):t('사진 없이 글만 보냅니다.','Words only—no attachments.')}</dd></dl>
 {files.map((file,index)=><AttachmentPreview key={index} file={file}/>)}
 <p>{t('가족의 확인 후 추모 공간에 공개될 수 있습니다.','Your memory may be shared in this memorial space after review by the family.')}</p>
 <label className="sharing-choice"><input type="radio" checked={sharing==='review'} onChange={()=>setSharing('review')}/>{t('사이트 공개를 요청합니다','Request publication on the memorial site')}</label><label className="sharing-choice"><input type="radio" checked={sharing==='family'} onChange={()=>setSharing('family')}/>{t('가족에게만 전달합니다','Share privately with the family')}</label>
 <label className="consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>{t('이 글과 첨부 자료를 제공할 권한이 있으며 선택한 방식으로 전달하는 데 동의합니다.','I have the right to share this text and any attachments, and agree to the sharing option selected above.')}</label>
 {files.length>0&&<label className="consent"><input type="checkbox" checked={peopleConsent} onChange={e=>setPeopleConsent(e.target.checked)}/>{t('함께 나온 분들의 공개 여부를 확인했거나, 확인하지 못한 분이 있음을 가족에게 알리겠습니다.','I have checked permission with people shown, or will let the family know whose permission still needs to be confirmed.')}</label>}
 <div className="step-buttons"><button className="quiet" disabled={uploading} onClick={()=>setStep(2)}>{t('이전','Back')}</button><button disabled={uploading} onClick={submit}>{uploading?t('보내는 중…','Sending…'):t('가족에게 보내기','Send to the family')}</button></div></div>}
 {progress&&<p role="status" aria-live="polite">{progress}</p>}
 {error&&<p role="alert">{error}</p>}
 </section></main>;
}
