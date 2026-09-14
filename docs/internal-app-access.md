# Public prototype and private data access

The public landing remains at `/`. The iOS app prototype at `/app` and all its subpages are publicly viewable by link without sign-in. The landing has no new navigation link to the prototype. Prototype pages retain noindex metadata.

`/design`, `/api/records` and `/api/skin` still require an account on the server-side `THREEFIG_INTERNAL_USER_IDS` allowlist. The value is a comma-separated list of exact Site-scoped authenticated user IDs stored as a production secret. Missing configuration denies personal storage access. Sites authenticates visitors and supplies trusted identity headers. Anonymous design-page requests go to sign-in; non-members go to `/app-access`. Private APIs return 401 for anonymous requests and 403 for non-members. Workspace account IDs are not interchangeable with Site-scoped sign-in IDs.

Public visitors can use the existing session-based prototype interactions and sample screens. Private record lists show empty states for visitors without access, and saving explains that an authorized account is needed. No anonymous fallback identity or shared health record store is used. Existing account records and photos are never included in the public prototype response.

Private pages are dynamic, non-cacheable and marked noindex. Existing per-user record and photo ownership checks remain in place. Public waitlist registration is unaffected.

To grant another teammate access, update the secret with the approved account IDs and deploy a saved version to activate the environment revision. Never commit account IDs or tokens into source.

## Local verification

Build the app, then run:

```sh
npm run start -- --port 4176 --var THREEFIG_INTERNAL_USER_IDS:threefig-qa-alpha
node --test tests/internal-access.test.mjs
node --experimental-strip-types --test tests/internal-policy.test.ts
```

These tests use synthetic local identities only. Production identity headers are supplied by Sites, not by browser clients.
