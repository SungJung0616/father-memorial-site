# 이미지 성능 2차 — 파생 이미지 처리

## 확정 저장 구조

- `pending/`: 승인 전 임시 원본
- `published/`: 승인된 영구 original. 기존 파일을 이동·변경·삭제하지 않는다.
- `web/`: 상세보기와 대표사진용 WebP. 긴 변 2560px 이하, quality 82, 확대 금지.
- `thumb/`: 추억 목록과 사진첩용 WebP. 긴 변 640px 이하, quality 72, 확대 금지.

## 승인 후 처리 흐름

1. Netlify 승인 함수가 원본을 `pending/`에서 `published/`로 S3 Copy한다.
2. DynamoDB `publishedFiles`에 `publishedKey`와 이미지의 `processingStatus: QUEUED`를 저장한다.
3. 함수가 `MEMORIAL_IMAGE_QUEUE_URL`로 제출 ID를 전송한다.
4. SQS가 Image Processor Lambda를 한 제출물씩 호출한다.
5. Lambda가 `published/` 원본을 읽고 EXIF orientation을 반영한다.
6. `web/`, `thumb/` WebP를 만들며 EXIF/GPS를 포함하지 않는다.
7. 성공 시 파일 항목에 `webKey`, `thumbKey`, `processingStatus: READY`를 기록한다.
8. 실패 시 `processingStatus: FAILED`로 기록하고 SQS가 최대 3회 처리한 뒤 DLQ로 이동한다. 공개 화면은 계속 `publishedKey`를 사용한다.

## 필요한 AWS 리소스

- SQS `father-memorial-image-processing`
- SQS DLQ `father-memorial-image-processing-dlq`
- Lambda `father-memorial-image-processor` (Python 3.12, x86_64, 2048 MB, 120초)
- Lambda 실행 IAM Role `FatherMemorialImageProcessorRole`
- SQS → Lambda event source mapping, batch size 1, partial batch failure 사용

기존 S3 버킷과 DynamoDB 테이블은 그대로 사용한다. CloudFront는 이번 범위에 포함하지 않는다.

## 환경변수

기존 Netlify 환경변수에 다음 하나를 추가한다.

```text
MEMORIAL_IMAGE_QUEUE_URL=<CloudFormation ImageProcessingQueueUrl output>
```

Lambda에는 CloudFormation이 `MEMORIAL_S3_BUCKET`, `MEMORIAL_DYNAMODB_TABLE`을 설정한다. 키와 비밀번호는 문서나 Git에 기록하지 않는다.

## Lambda 패키지 만들기

`memorial-site/infra/image-processor/build.ps1`은 AWS Lambda용 manylinux x86_64 Pillow와 pillow-heif를 포함한 zip을 `infra/dist/image-processor.zip`에 만든다. zip을 기존 버킷의 `infrastructure/image-processor.zip`에 먼저 업로드한 뒤 CloudFormation을 갱신한다.

HEIC/HEIF는 `pillow-heif`의 Lambda 호환 네이티브 wheel로 해석한다. 원본 파일은 다시 저장하지 않으므로 원본 EXIF와 GPS는 `published/`에 보존된다.

## 기존 사진 backfill 안전장치

전체 backfill은 자동 실행하지 않는다.

```powershell
# 한 제출물 미리보기
pnpm images:backfill -- --submission-id <uuid>

# 한 제출물 실행
pnpm images:backfill -- --submission-id <uuid> --execute

# 전체 미리보기
pnpm images:backfill -- --all

# 전체 실행은 두 개의 명시적 확인 옵션이 모두 필요
pnpm images:backfill -- --all --execute --confirm-all
```

스크립트에는 AWS/테이블/SQS 환경변수가 필요하다. 운영 전체 실행 전 한 제출물로 결과와 비용을 확인한다.

## 호환성과 fallback

- 기존 DynamoDB 항목에는 새 필드가 없어도 된다.
- 새 필드가 없거나 `READY`가 아니면 `publishedKey`를 서명해 반환한다.
- HERO 설정에는 계속 원래 `publishedKey`만 저장하므로 기존 설정과 유효성 검사가 유지된다.
- HERO 응답을 만들 때 연결된 공개 파일의 `webKey`가 `READY`이면 그것을 표시하고, 아니면 원본을 표시한다.

## 운영 배포 상태 — 2026-09-08

- 서울 리전의 기존 상태를 먼저 확인했으며, 배포 전 동일 이름의 SQS 큐·DLQ·Lambda·실행 역할은 없었다.
- 기존 백엔드 스택을 수정하지 않고 `father-memorial-image-pipeline` 전용 CloudFormation 스택으로 분리 배포했다.
- 스택 상태: `CREATE_COMPLETE`
- Netlify 함수 환경에 `MEMORIAL_IMAGE_QUEUE_URL`을 설정했다.
- 제공된 JPEG 한 장으로 `pending/ → published/ → SQS → Lambda → web/ + thumb/ → DynamoDB READY` 흐름을 확인했다.
- 테스트 결과: 원본 245,114 bytes, web 80,882 bytes, thumb 11,732 bytes. 파생 파일은 `image/webp`이며 S3 사용자 메타데이터는 비어 있다.
- 공개 API는 목록에서 `thumb/`, 상세에서 `web/`을 반환했다.
- 처리 직후 일반 큐와 DLQ의 대기 메시지는 모두 0건이었다.
- 기존 공개 사진 backfill은 실행하지 않았다.
