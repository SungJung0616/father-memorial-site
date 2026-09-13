# Public Launch Final QA — 2026-09-12

Production tested: https://father-memorial-test.netlify.app

Application revision tested: `f1b6b4df8af7475f8355a40b35982ec202245f2b`
Scope: launch verification and documentation only; no redesign, AWS changes or real-post edits.

## Production observations

- KR and EN homepage, shared-memory detail, community list, photos, research/publication expansion, visiting directions and contribution screens were inspected directly in production.
- English home/detail/list/photos/contribution links retain English UI through the existing `lang=en` community routes. Original Korean contributions and Korean map-search labels remain intentionally unchanged.
- Desktop screenshots and a production 390 × 844 mobile iframe were inspected. Home and contribution review measured `clientWidth == scrollWidth` (375px inside the scrollbar-bearing mobile frame). The photo-category bar scrolls locally without page-wide overflow.
- Public route HTTP checks: `/`, `/en`, `/community`, `/community?lang=en`, `/photos`, `/en/photos`, `/visiting`, `/en/visiting`, `/contribute`, `/en/contribute` all returned 200.
- Public API returned nine approved memories, without contributor names, contact details or original consent. Its cache policy is `no-store`.
- All 37 public photograph URLs passed signed **GET** range reads. A preliminary HEAD check was not valid for GET-signed URLs and is not treated as an image failure.
- A public memory heart was added, verified after reload, then removed to restore the original count.
- English desktop text-only and photo submissions reached the English success screen; mobile English text-only submission also reached that screen. All test content is clearly marked TEST and was sent using the publication-review choice. No test item was approved or deleted.
- English body punctuation and paragraph breaks were preserved on review. Offline handler tests additionally verify byte-for-byte string preservation in the saved record and PENDING status; no production test was published merely to check rendering.
- Public API still returned the same nine approved items after these submissions. Two earlier PENDING QA IDs returned 404 on the public detail API.
- Unauthenticated `/api/admin/submissions`, `/api/admin/users` and `/api/admin/session` returned 401. No administrator or member details were returned.
- YouTube loaded only after interaction. Desktop production playback advanced to 35.9 seconds and mobile English playback to 16.2 seconds, both with `readyState: 4`, `paused: false`; close removed the player. KR and EN mobile menus opened with the expected language-aware destinations. The external Watch on YouTube link remains available independently of iframe playback.
- Fast/deep-link visits did not block on the saxophone entrance. Its asset-load/error/timeout and reduced-motion branches passed offline tests.
- Captured site console logs showed no application errors during inspected English submission and video journeys.

## Checks

- TypeScript `tsc --noEmit`: passed.
- Production `next build --webpack`: passed; all 14 static pages generated.
- ESLint: zero errors; 17 existing `@next/next/no-img-element` warnings.
- 13 regression tests: passed, including text/photo submission status and consent, original English preservation, no S3 calls for text-only, pin selection, public withdrawal/trash/restore, and entrance/video contracts.
- Module-mocked tests require `--experimental-test-module-mocks`; an initial run without that flag failed in the test runner, not the application. Re-run with the flag passed.

## Boundaries and minor items

- No approved text-only item was present in the production data snapshot. Its public lifecycle was tested offline; production TEST contributions remain unapproved to protect the archive.
- Mobile checks used a real narrow production iframe, not a physical iPhone/Android device. Slow-network entrance and system reduced-motion preference were tested via the isolated controller, not changed on the user's computer.
- YouTube is a third-party service and can be blocked by a visitor's network/browser. External playback is the existing fallback; no artificial outage or browser-security bypass was introduced.
- The nested mobile-preview browser log captured one `MutationObserver.observe` TypeError after iframe/video interactions, with no source URL or stack. No first-party source uses MutationObserver, and the directly tested production English tab logged no errors. Playback, close and submission succeeded. Its origin is unconfirmed; it is recorded rather than attributed to application code or hidden.
- The KR mobile “모임·소식” shortcut currently opens `/community#notices`, but there is no matching notices section. It opens the usable memory list, not a 404. A terminology/navigation cleanup is a later, non-blocking item.
- The selected new Netlify name has not been activated. The existing production address is the verified launch address.
- No launch-blocking application bug was found; application code and production deployment were therefore left unchanged. README, this QA record, current-status additions and offline submission regressions are the only repository changes.

## Verdict

**READY WITH MINOR ISSUES** — the verified current address can be shared. The minor navigation wording and pending address rename do not prevent reading or contributing safely.
