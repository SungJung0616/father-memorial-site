# 데이터 모델

## Photo

```yaml
id: uuid
file_original: private-storage-path
file_web: public-or-signed-url
title_ko: string
title_en: string
description_ko: text
description_en: text
translation_status: draft | reviewed | published
primary_category_id: uuid
tags: [uuid]
people: [uuid]
date_taken: date | null
date_precision: exact | month | year | decade | unknown
place_ko: string | null
place_en: string | null
source_person_id: uuid | null
source_credit: string | null
consent_status: pending | confirmed | restricted | withdrawn
visibility: public | unlisted | members | family | private
moderation_status: submitted | reviewing | approved | rejected | archived
related_memory_ids: [uuid]
related_event_ids: [uuid]
created_at: datetime
updated_at: datetime
```

## Category

```yaml
id: uuid
slug: string
name_ko: string
name_en: string
parent_id: uuid | null
sort_order: integer
is_active: boolean
```

초기 카테고리 트리:

```text
friends
  sunlim-middle-school
  kyunggi-high-school
  snu-pharmacy
  huam-dong
  other-friends
family
students
academia
events
funeral-memorial
```

## Tag

태그는 사진을 복수 관계로 탐색하기 위해 사용한다.

```yaml
id: uuid
slug: string
name_ko: string
name_en: string
tag_type: school | neighborhood | career_period | organization | event | relationship | custom
```

## Person

```yaml
id: uuid
display_name_ko: string
display_name_en: string | null
relationship_ko: string | null
relationship_en: string | null
privacy_level: public | name_only | private
```

## Memory

```yaml
id: uuid
author_display_name: string
author_relationship_ko: string | null
author_relationship_en: string | null
body_ko: text
body_en: text
translation_status: draft | reviewed | published
photo_ids: [uuid]
visibility: public | unlisted | members | family | private
moderation_status: submitted | reviewing | approved | rejected | archived
pinned: boolean
pin_starts_at: datetime | null
pin_ends_at: datetime | null
pinned_by: admin_user_id | null
```

## HeroSlide

홈 첫 화면의 대표사진 슬라이드는 최대 5장으로 제한한다.

```yaml
id: uuid
photo_id: uuid
sort_order: integer # 1..5
caption_ko: string | null
caption_en: string | null
is_active: boolean
is_social_preview: boolean # 한 장만 true
created_at: datetime
updated_at: datetime
```

## 구현 원칙

- 한글과 영문은 별도 필드로 저장하고 화면에서 선택한 언어를 표시한다.
- 영문이 아직 없으면 승인된 한국어 원문을 보여주고 번역 준비 중임을 표시한다.
- 카테고리와 태그는 코드에 고정하지 않고 관리자가 데이터로 추가·정렬한다.
- `pending/`은 승인 전 임시 원본, `published/`는 승인된 영구 원본으로 사용한다. 승인 과정에서 원본을 변환하지 않는다.
- 승인된 이미지에는 선택 필드 `webKey`, `thumbKey`, `processingStatus`를 `publishedFiles`의 각 파일에 기록한다.
- `processingStatus`는 `QUEUED | READY | FAILED | NOT_CONFIGURED | NOT_APPLICABLE`이며, 파생 키는 `READY`일 때만 공개 화면에서 사용한다.
- `web/`과 `thumb/`은 EXIF 방향을 반영한 메타데이터 없는 WebP 파생본이며, 없거나 실패하면 `publishedKey` 원본으로 자동 대체한다.
- 콘텐츠 삭제 요청에 대응할 수 있도록 제공자·동의·승인 기록을 남긴다.
- 대표사진은 최대 5장이고 관리자가 순서·설명·활성 상태를 변경한다.
- 공개 승인된 사진 파일 하나를 추억 이야기와 사진첩이 함께 참조하며 화면별로 파일을 복제하지 않는다.
- 고정 게시물은 시작·종료 시간을 저장하고 유효한 기간에만 일반 게시물보다 먼저 표시한다.
