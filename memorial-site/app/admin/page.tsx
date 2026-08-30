'use client';
import { useState } from 'react';

const tasks=[
  {count:24,label:'승인 기다리는 사진',detail:'공개 동의와 인물을 확인해 주세요'},
  {count:8,label:'AI 시기 제안',detail:'앨범과 촬영 시기를 확인해 주세요'},
  {count:5,label:'새로운 추억·댓글',detail:'게시하기 전에 내용을 확인해 주세요'},
  {count:2,label:'가족 확인 필요',detail:'초상 공개 여부가 불분명합니다'},
];

export default function AdminPage(){const [role,setRole]=useState('가족 관리자');return <main className="admin-page"><aside className="admin-sidebar"><a className="admin-brand" href="/">정영훈 교수님<br/><span>사이트 관리</span></a><nav><a className="active" href="#today">오늘 할 일</a><a href="#photos">사진·AI 정리</a><a href="#posts">추억·댓글</a><a href="#managers">검토 매니저</a><a href="#settings">사이트 설정</a></nav><a className="back-site" href="/">← 공개 사이트 보기</a></aside><section className="admin-workspace"><header><div><p>관리자 전용</p><h1>오늘 할 일</h1></div><label className="role-switch">화면 권한<select value={role} onChange={e=>setRole(e.target.value)}><option>최고 관리자</option><option>가족 관리자</option><option>검토 매니저</option></select></label></header><div className="admin-notice">현재는 화면 예시입니다. 실제 로그인·저장·AI 분석은 AWS 연결 단계에서 활성화됩니다.</div><section className="task-grid" id="today">{tasks.map(task=><article key={task.label}><strong>{task.count}</strong><h2>{task.label}</h2><p>{task.detail}</p><button>확인하기</button></article>)}</section><section className="editor-panel" id="photos"><div className="panel-heading"><div><span>AI</span><h2>사진 자동정리 제안</h2></div><button>전체 제안 보기</button></div><div className="ai-review-row"><div className="admin-photo-placeholder">사진</div><div><span className="confidence">신뢰도 82%</span><h3>1990년대 · 성균관대학교 연구실</h3><p>근거: 같은 촬영일 사진 16장, 현수막의 학교명, 확인된 인물 정보</p></div><div className="review-actions"><button>수정</button><button className="approve">확정</button></div></div></section><section className="editor-panel" id="managers"><div className="panel-heading"><div><span>권한</span><h2>검토 매니저</h2></div><button>매니저 초대</button></div><div className="manager-list"><p><strong>경기고 앨범 담당</strong><span>김○○ · 사진 정보만 검토</span></p><p><strong>성균관대 제자 담당</strong><span>이○○ · 인물·시기·설명 검토</span></p></div><small>검토 매니저에게 연락처, 정확한 GPS, 가족 전용 사진과 영구 삭제 권한은 보이지 않습니다.</small></section></section></main>}
