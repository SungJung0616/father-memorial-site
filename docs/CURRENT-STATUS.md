# 정영훈 교수님 추모 사이트 — Current Status

상태 기준일: 2026-09-09  
문서 역할: 현재 GitHub 저장소와 production 구현을 기준으로 한 source of truth 및 인수인계 문서

## 서비스 기준 정보

- Production: https://father-memorial-test.netlify.app
- GitHub: `SungJung0616/father-memorial-site`
- 기본 branch: `codex/memorial-site`
- 사이트 목적: **Community of Memory / Living Archive**
- 핵심 철학: 가족이 일방적으로 생애를 보여주는 전시관을 넘어, 가족·친구·제자·동료가 각자의 기억을 나누며 정영훈 교수님의 여러 모습을 함께 발견하고 오래 보존하는 공간이다.
- 기존 생애, 연구, 사진, 장지 안내는 없애지 않고 사람들의 추억을 이해하기 위한 archive/background로 유지한다.

## 현재 public site

### 홈페이지

현재 순서는 다음과 같다.

1. Hero
2. Shared Memories / 함께 기억하는 정영훈
3. Memories in Photographs / 사진으로 만나는 기억
4. His Life / 아버님의 삶
5. Teaching & Research / 가르침과 연구
6. Visiting His Resting Place / 아버님 찾아가는 길
7. 짧은 Share a Memory 안내

- 한국어 `/`와 영어 `/en`을 제공한다.
- Hero에는 최대 5장의 관리자 대표사진, 한영 설명, 순서 및 초점 위치가 반영된다.
- Shared Memories는 기존 공개 추억 API를 한 번 호출해 활성 고정 글을 우선하고, 남는 자리를 최근 공개 글로 채워 최대 5편을 표시한다.
- 첫 추억은 크게, 나머지는 편집형 구성으로 표시하며 모바일에서는 세로 흐름으로 바뀐다.
- 사진이 없는 글에는 가짜 이미지나 빈 placeholder를 만들지 않고 본문과 인용 부호를 중심으로 표시한다.
- Memories in Photographs는 같은 공개 데이터에서 서로 다른 게시물의 대표사진을 한 장씩, 최대 3장 사용한다.
- HomeMemories와 HomePhotos는 동일한 public memories 응답을 공유해 중복 API 요청을 피한다.

### 추억과 사진

- `/community`: 공개 승인된 추억 목록. 고정 게시물 우선, 이후 최근 순으로 표시한다.
- `/community/story?id=<id>`: 공개 추억 상세 및 여러 사진 보기.
- `/photos`, `/en/photos`: 공개 게시물의 사진을 모아 보여주며 원래 추억 상세로 연결한다.
- 영어 전용 `/en/community`와 `/en/community/story` 파일은 없다. 동일한 데이터와 화면 구조를 재사용하는 공용 route이며, 영어 흐름은 `/community?lang=en`과 `/community/story?id=<id>&lang=en`으로 UI 언어를 유지한다.
- 사용자가 제출한 제목과 본문은 자동 번역하지 않고 저장된 원문을 그대로 표시한다.
- `FAMILY`와 `TRASH`, 승인 전 자료는 공개 목록·상세·사진첩·홈에 나타나지 않는다.

### 추억 제출

- 한국어 `/contribute`, 영어 `/en/contribute`를 제공한다.
- 흐름은 `1 추억 → 2 사진(선택) → 3 확인`이다.
- 추억 내용은 필수이고 제목과 사진은 선택이다.
- 작성자, 관계, 공개 요청과 필요한 비공개 연락 정보를 구분해 받는다.
- `files: []`인 text-only memory도 저장되어 관리자 검토함에 나타나며 승인 후 목록과 상세에서 정상 표시된다.
- text-only 제출은 S3 업로드나 이미지 처리 큐를 호출하지 않는다.
- 사진이 있는 제출만 기존 `pending → approval → published → web/thumb` 흐름을 사용한다.

### 하트

- 로그인하지 않은 방문자도 하트를 누를 수 있다.
- 브라우저의 방문자 ID는 localStorage에 보관하고 서버에는 해시된 반응 키를 사용한다.
- DynamoDB transaction과 조건부 atomic update로 게시물의 `likeCount`와 방문자 반응 상태를 함께 저장한다.
- 목록과 상세는 같은 영구 저장 count를 읽으며 새로고침 뒤에도 유지된다.
- 공개 상태인 게시물에만 반응할 수 있다.

### 그 밖의 공개 콘텐츠

- 생애 연보와 가족 확인 약력
- 가르침과 연구의 흐름 및 가족 보관 이력서 기반 대표 논문 10편
- 공개 추억 사진첩
- 천안공원 무학지구입구에서 백합 38까지의 한영 사진 안내
- 모바일 하단 바로가기와 PC 로그인 진입점

## 현재 admin

관리자 화면은 `/admin`이며 기존 Amazon Cognito 인증을 사용한다.

### 역할

- `admin`: 모든 관리자 기능, 회원 관리, 권한 변경, 휴지통 확인·이동·복구.
- `family`: 게시물 편집, 대량 업로드, 공개 승인, 가족 보관, 대표사진 관리. 휴지통과 회원 관리는 불가.
- `reviewer`: 자료와 정보를 검토한다. 최종 공개 승인, 대표사진 변경, 회원 관리는 불가.
- 화면 숨김뿐 아니라 Netlify Function에서 JWT와 역할을 다시 검증한다.

### 게시물 관리

- 상태: `PENDING`, `FAMILY`, `PUBLISHED`, `REJECTED`, `TRASH`.
- 제목, 추억 내용, 작성자 비공개 정보, 관계, 현재 공개 요청, 사진 분류와 관리자 메모를 수정하고 저장할 수 있다.
- 제출자의 최초 공개 요청과 동의는 `originalSubmission`에 별도로 보존하며 관리자 현재 설정과 구분한다.
- `Public ↔ Family Only` 전환을 지원한다. Family Only 전환 시 모든 public surface에서 제외된다.
- 재공개 시 기존 `published/web/thumb` 키를 재사용하며 이미 공개했던 사진을 다시 업로드하거나 재처리하지 않는다.
- 삭제 기본 동작은 영구 삭제가 아닌 `TRASH` 이동이다. 관리자만 확인하고 FAMILY 상태로 복구할 수 있으며 자동 재공개하지 않는다.
- 휴지통 이동 시 S3 원본 및 파생 이미지, 대표사진 설정, 하트 정보는 삭제하지 않는다.
- 공개 글의 고정 시작·종료 시간을 설정하거나 고정을 해제할 수 있다.

### 사진 대량 업로드

- 별도 관리자 메뉴에서 여러 파일을 선택하고 10개 단위 제출 묶음으로 순차 전송한다.
- 브라우저가 같은 업로드 선택 안의 SHA-256 완전 중복을 걸러낸다.
- 업로드 결과는 즉시 공개하지 않고 승인 대기 또는 가족 보관 흐름을 거친다.

### Hero management

- 공개 승인된 사진에서 최대 5장을 선택한다.
- 앞/뒤 순서, 한국어 `labelKo`, 영어 `labelEn`, 기존 `focalX/focalY`를 관리한다.
- 홈과 유사한 미리보기에서 사진을 눌러 초점을 지정하거나 슬라이더로 조절할 수 있다.
- 저장되지 않은 변경사항을 표시하고, 저장 후 공개 설정을 다시 조회해 반영 여부를 확인한다.
- 게시물이 비공개·삭제·승인 취소되면 연결된 사진만 Hero에서 제외한다. 유효한 관리자 사진이 모두 없을 때 기본 Hero로 fallback한다.

### Cognito member management

- `admin`만 회원 목록, 상태와 현재 역할을 확인할 수 있다.
- 이메일 초대, `admin/family/reviewer` 역할 지정·변경, 초대 재전송, 비밀번호 재설정 시작, 비활성화·재활성화를 지원한다.
- 새 사용자는 Cognito 임시 로그인 정보를 받은 후 첫 로그인에서 본인 비밀번호를 설정한다.
- 관리자가 실제 비밀번호를 입력·조회·저장하지 않는다.
- 마지막 활성 admin의 권한 제거·비활성화와 자기 계정 비활성화를 서버에서 막는다.

## 저장 및 배포 구조

### GitHub와 Netlify

- GitHub 기본 branch `codex/memorial-site`가 현재 source다.
- Netlify가 Next.js static output과 Netlify Functions를 production에 배포한다.
- Production build는 Webpack을 명시해 실행한다. 이 설정은 과거 client runtime mismatch 회귀를 막기 위해 유지한다.
- Netlify Functions는 공개 추억·하트·업로드·관리자 게시물·Hero 설정·Cognito 회원 관리 API를 제공한다.
- 공개 추억 API는 `no-store`이며 오래된 브라우저 5분 캐시를 사용하지 않는다.

### AWS

- 리전: `ap-northeast-2` (서울).
- Amazon S3: 비공개 미디어 버킷, 퍼블릭 액세스 차단, SSE-S3, 버전 관리 사용.
- Amazon DynamoDB: `father-memorial-content`, 온디맨드 과금과 시점 복구 사용.
- Amazon Cognito: 기존 User Pool과 `admin/family/reviewer` 그룹 사용.
- 이미지 처리: 전용 SQS, DLQ, Python 3.12 Lambda 스택을 사용한다.
- Netlify Functions는 환경변수로 AWS 리전, 버킷, 테이블, Cognito, 이미지 큐에 연결한다. 실제 키와 비밀번호는 코드·문서·Git에 기록하지 않는다.
- CloudFront는 현재 연결하지 않았다.

### 이미지 저장 구조

- `pending/`: 승인 전 임시 원본.
- `published/`: 승인된 영구 original. 승인 시 S3 Copy를 사용하며 원본을 resize·재압축하지 않는다.
- `web/`: 상세 및 Hero용 WebP. 긴 변 최대 2560px, quality 82, 확대하지 않음.
- `thumb/`: 목록 및 사진첩용 WebP. 긴 변 최대 640px, quality 72, 확대하지 않음.
- 파생본은 EXIF orientation을 적용하고 EXIF/GPS를 제거한다. `published/` original은 EXIF를 포함한 원본 그대로 보존한다.
- 파생 처리 실패 또는 기존 자료에 `webKey/thumbKey`가 없으면 `publishedKey`로 자동 fallback한다.
- 기존 공개 사진의 전체 backfill은 실행하지 않았다.

## 완료된 범위

- Community of Memory / Living Archive 중심 홈 hierarchy와 KR/EN 홈.
- 공개 추억 목록·상세, pin 우선 표시, text-only 표시.
- 게시물별 사진을 재사용하는 홈 사진 및 전체 사진첩.
- 사진 선택형 추억 제출과 사진 없는 글 제출.
- 관리자 검토·편집·공개·가족 보관·휴지통·복구 및 원본 동의 보존.
- DynamoDB에 영구 저장되는 하트.
- 대표사진 최대 5장, 순서·한영 설명·초점·공개 유효성 관리.
- Cognito 회원 초대·역할·상태 관리와 서버 권한 검증.
- S3 original 보존 및 SQS/Lambda `web/thumb` 자동 이미지 처리.
- 생애, 연구, 사진, 장지 안내의 한영 public content.
- 영어 홈에서 추억 목록·상세·사진첩·제출로 이동할 때 영어 UI 문맥 유지.

## 아직 남은 작업 / Later

- 실제 가족 사진과 추억 콘텐츠를 지속적으로 선별·보강한다.
- 기존 `published/` 사진 전체의 `web/thumb` backfill은 아직 실행하지 않는다. 준비된 스크립트로 한 게시물씩 검증한 후 별도 승인 아래 진행한다.
- CloudFront 연결은 보류 상태다.
- 크롭·보정·압축본까지 찾는 AI 유사 사진 검사는 구현하지 않았다. 현재는 업로드 선택 안의 byte-identical 파일만 브라우저에서 제외한다.
- AI 앨범 분류, 얼굴 인식, 자동 촬영 시기 분류는 구현하지 않았다.
- 고정 앨범·인물·연도별 탐색과 고급 검색은 구현하지 않았다.
- 사용자 memory 본문의 자동 번역과 관리자 번역 검토 workflow는 구현하지 않았다.
- 댓글, 답글, 팔로우, 채팅과 같은 SNS 기능은 현재 목적과 범위에 포함하지 않는다.
- 영구 삭제는 구현하지 않았다. 보존 우선 원칙에 따라 휴지통과 복구만 제공한다.

## 중요한 데이터 보호 원칙

- 개인정보, 연락처, 작성자 실명과 미승인 사진은 public API와 화면에 노출하지 않는다.
- 방문자 제출은 가족 또는 권한 있는 관리자가 검토·승인하기 전 공개하지 않는다.
- `FAMILY`와 `TRASH`는 공개 홈, 목록, 상세, 사진첩, Hero 후보에서 제외한다.
- 공개 취소 후 새 API 접근은 즉시 차단한다. 이미 발급된 signed image URL은 최대 1시간 유효할 수 있고 이미 다운로드된 사본은 회수할 수 없다.
- 원본 파일은 비공개 S3에 보존하고 public 화면은 가능한 경우 메타데이터를 제거한 web/thumb 파생본을 사용한다.
- 휴지통 이동은 S3 파일 삭제가 아니다. 영구 삭제는 별도 정책과 명시적 승인 없이 수행하지 않는다.
- S3 버전 관리와 DynamoDB 시점 복구를 유지하고 가족도 별도 원본 백업을 보관한다.
- 실제 비밀번호, AWS 액세스 키와 개인 연락처는 코드·문서·로그·Git 기록에 넣지 않는다.
- 확인되지 않은 생애 정보, 사진 속 인물·날짜·장소와 AI 추정값을 사실로 공개하지 않는다.
