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
```

## 구현 원칙

- 한글과 영문은 별도 필드로 저장하고 화면에서 선택한 언어를 표시한다.
- 영문이 아직 없으면 승인된 한국어 원문을 보여주고 번역 준비 중임을 표시한다.
- 카테고리와 태그는 코드에 고정하지 않고 관리자가 데이터로 추가·정렬한다.
- 업로드 원본은 비공개 저장소에 보존하고, 승인된 웹용 사본만 공개한다.
- 콘텐츠 삭제 요청에 대응할 수 있도록 제공자·동의·승인 기록을 남긴다.

