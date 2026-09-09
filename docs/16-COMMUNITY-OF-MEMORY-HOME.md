# 기억 중심 홈 — 2026-09-09

- 홈 순서: Hero → Shared Memories → Memories in Photographs → His Life → Teaching & Research → Visiting → 짧은 참여 안내.
- 대표사진·초점, 생애 11개 연보, 연구 및 學, 길 안내 내용은 유지했다.
- HomeMemories에서 공개 API를 한 번 호출하고 HomePhotos에 같은 결과를 전달한다. 홈의 별도 prefetch는 제거했다. 기존 no-store 정책 유지.
- 활성 pin 우선, 이후 기존 제출일 순서로 최대 5개. 실제 공개 자료가 적으면 그 수만 표시한다. 실명은 공개하지 않고 관계만 표시한다.
- 첫 글은 크게, 나머지 네 글은 편집형 격자. 모바일은 세로 흐름. 글-only는 사진 자리 없이 서체와 인용 표시를 사용한다.
- 홈 사진은 서로 다른 공개 글에서 한 장씩 최대 3장. 얼굴이 잘리지 않도록 contain으로 원본 구도를 보존한다.
- KR/EN 홈 안내와 CTA 적용. 사용자 본문은 번역하지 않는다. 상세/전체 추억은 기존 공용 /community 경로, 제출은 각 언어 /contribute와 /en/contribute 사용.
- 검증: 선택 로직 3개 테스트와 기존 공개 상태/휴지통 3개 함수 회귀 테스트 통과. 관련 lint 오류0(기존 img 방식 경고2), production build 성공.
- 로컬 전용 fixture로 5개, pin, 사진/글-only, KR/EN desktop/mobile 확인. fixture는 배포 콘텐츠에 포함되지 않는다. 페이지 로드당 memories 요청 1회 확인.
- Production: 공개 3편 표시, 비공개 테스트 글 2개 미노출, API200/no-store, 사진마다 서로 다른 상세 연결. KR/EN 모바일 가로 넘침 없음. 한국어 모바일 첫 추억 시작은 상단 약1132px. 기존 Hero, 연보11개, 學, 길 안내 보존 확인. 추억 상세와 영문 제출 화면 정상 연결.
- AWS/DB/Cognito/이미지 파이프라인/공개 정책 변경 없음. DB 자료 변경 없이 검증했다.
- 최종 배포: 6aa105367563748a19b9ef66.
