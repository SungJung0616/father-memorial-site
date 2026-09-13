# Remembering Young Hoon

정영훈 교수님을 함께 기억하는 **Community of Memory / Living Archive**.

> 기억은 함께 나눌수록 오래 남습니다.
>
> We keep his memory alive by sharing our own.

가족·친구·제자·동료가 추억과 사진을 나누고, 가족의 검토를 거쳐 오래 보존하는 추모 공간입니다. A memorial archive of stories, photographs, scholarship and music, shared by those who knew Professor Young Hoon Jung.

## Visit

- [한국어 production](https://remembering-young-hoon.netlify.app/)
- [English production](https://remembering-young-hoon.netlify.app/en)
- [English: Share a Memory](https://remembering-young-hoon.netlify.app/en/contribute)

The production address changed to `remembering-young-hoon.netlify.app` on September 13, 2026. The existing Netlify site, deployment, environment configuration, and content were retained. S3 upload CORS now includes the new origin; use the new address for sharing. The old Netlify subdomain is not a guaranteed redirect.

## What is available

- KR/EN homepage: Hero → Shared Memories → Memories in Photographs → In His Own Sound → His Life → Teaching & Research → Visiting His Resting Place → invitation to contribute.
- Public memories, individual stories and photographs; pinned public memories first, then recent contributions. No popularity ranking.
- Persistent hearts, with no visitor login required.
- Memory-first submission: **Memory → Photos (optional) → Review**. Words-only contributions are welcome.
- Click-to-load saxophone recording, no autoplay, with an external YouTube fallback. The entrance does not delay completed loading and respects reduced motion.
- English community UI uses `/community?lang=en` and `/community/story?id=…&lang=en`. Submitted writing remains in its original language.

## Family administration

The authenticated `/admin` area supports review, metadata editing, Public / Family Only changes, pin scheduling, Hero photographs and focal points, and Cognito member management.

- `admin`: all management, including Trash / Restore and members.
- `family`: edit, approve, family storage, bulk upload and Hero management; not Trash or member management.
- `reviewer`: review without final publication or member-management authority.

Roles are checked on the server. Original submission consent is preserved separately from current administrative settings. Restore returns an item to Family Only, not automatic publication.

## Repository and deployment

```text
memorial-site/
  app/                 Next.js / React public and admin interfaces
  netlify/functions/   Public, submission and authenticated management APIs
  scripts/             Regression tests and operational scripts
  public/              Approved static assets
docs/                  Decisions, handoff and verification records
```

Current working/default branch: `codex/memorial-site`.
Netlify serves a Next.js Webpack static export plus Netlify Functions. AWS provides private S3 media, DynamoDB content, Cognito authentication and the existing SQS/Lambda image processor.

## Local development and checks

Use a compatible Node.js runtime (package engine: `>=22.13.0`) and pnpm. Module-mocked regression tests were verified with Node 24 and require the experimental test-module-mocks flag.

```sh
cd memorial-site
pnpm install --frozen-lockfile
pnpm dev
pnpm exec tsc --noEmit
pnpm lint
node --experimental-test-module-mocks --test scripts/test-*.mjs
pnpm build:netlify
```

`pnpm build:netlify` is the production build (`next build --webpack`); it is intentionally different from the default vinext build. Production APIs require operator-managed environment configuration. Never commit credentials or copy production secrets into examples.

## Data protection

- Public requests are saved **PENDING** until family approval; private requests are saved **FAMILY**. Neither is automatically public.
- Public surfaces expose only approved memories; PENDING, FAMILY and TRASH are excluded. Public API responses omit private contributor names, contact details and consent records.
- Text-only submission does not upload to S3 or enqueue image processing.
- Images follow `pending/ → published/ original → web/ + thumb/`. Originals are preserved; generated public WebP derivatives remove EXIF/GPS. Legacy originals remain the fallback where derivatives are unavailable.
- Trash is recoverable and does not delete S3 originals or derivatives. Permanent deletion is not implemented.
- Public APIs use `no-store`. Previously issued image URLs can remain valid for up to one hour after withdrawal.
- Contributions are not automatically translated. Do not invent biographical facts, dates, people or locations.
- Photos and memorial content are not a general-purpose asset library; reuse requires permission.

## Documentation

- [Current production status / handoff](docs/CURRENT-STATUS.md)
- [Public Launch Final QA — 2026-09-12](docs/17-PUBLIC-LAUNCH-QA.md)
- [Post management](docs/15-POST-MANAGEMENT.md)
- [Image pipeline](docs/12-IMAGE-PIPELINE.md)
- [Notion project hub](https://www.notion.so/3ca5389c4d398106ad98f6b09c227010) — workspace access may be required; linking does not make private project notes public.

## Later, not part of the launch

More family-selected content, optional legacy-image backfill and the selected URL rename remain separate operational work. Automatic translation, comments/chat, face recognition, advanced album search and permanent deletion are not part of the current experience.
