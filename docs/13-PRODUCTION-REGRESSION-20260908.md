# 2026-09-08 production loading regression

## Evidence and scope

- Production community and admin pages remained at their initial loading text.
- Browser error: `ReferenceError: __webpack_require__ is not defined`, in `0736i-5kyog5v.js`, called by the Turbopack runtime.
- The served chunk contained Webpack-specific React Server DOM code. This is a client runtime mismatch; the exact dependency-install step that introduced it was not established.
- Direct HTTP public memories requests returned 200 before repair. Browser Network capture was not available through the current browser tool, so these are direct HTTP measurements, not a captured browser request trace.
- Netlify public-memories production logs (Last hour) returned “No results found for query”; no production function runtime exception was obtained. Absence of results does not prove absence of historical errors.
- Compared 905cebe with 11b859a: function external_node_modules and included_files settings for aws-jwt-verify were added. These were retained; no current dependency-resolution failure was reproduced in the APIs.

## Minimal repair

- Explicit `next build --webpack` in netlify.toml and package.json build:netlify.
- Reinstalled locked dependencies with lifecycle scripts disabled after the local installation failed to resolve build dependencies. Prior installation retained at `C:/Users/ncasa/AppData/Local/Temp/memorial-site-dependencies-backup-20260908` for recovery; no project data removed.
- Build and TypeScript passed. Local browser no longer threw the runtime exception and progressed beyond loading.
- Production deployment: `6aa08729e90cdcbc86ac18d5`.
- No AWS image resources, data, backfill, authentication code or image pipeline logic changed.

## Production verification

| Check | Result |
| --- | --- |
| GET /api/memories | 200, 468 ms (single request) |
| GET /api/memories?id=… | 200, 904 ms (single request) |
| GET /api/site-settings | 200 |
| Community list | Two published stories rendered |
| Story detail | Text and image rendered; naturalWidth positive |
| Photos | Both images loaded |
| Home hero | Images loaded; fresh browser tab reported no JS errors |
| GET /api/admin/session without login | 401 |
| GET /api/admin/submissions?status=PENDING without login | 401 |
| GET /api/admin/users without login | 401 |
| Admin login screen | Rendered normally, no stuck session-check text |
| Authenticated admin list, member API, valid token | Pending user re-login; existing browser session expired |

Do not describe authenticated regression checks as completed until the user logs in and they are tested. No credentials should be placed in this report.
