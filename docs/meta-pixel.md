# Meta Pixel — 3FIG waitlist

Pixel ID: `2935955493422843`.

The integration is based on the full GitHub source at `fb228c02d07bb05cdabc17c066ae705c290675a7`, including the updated skin-balance visuals and survey signup. It does not replace that source with an older local checkout.

## Events

- `PageView`: once per landing document initialization on `https://3fig.io/`.
- `Lead`: only after a successful `/api/waitlist` response with `created === true`. The same condition sends the existing GA `generate_lead` event.
- Returning registrants, failed requests and blocked duplicate form submissions do not produce another conversion.
- `trackSingle` targets this pixel explicitly. Calls queue before the Meta SDK loads.
- Browser-only integration. No Conversions API, server token, or purchase event is configured.
- Preview hosts and `/app/**`, `/design`, and teaser routes are excluded. No global noscript image is added because the shared layout also serves the private prototype.
- Automatic pixel configuration is disabled. Explicit Lead parameters contain only `content_name: "3FIG waitlist"`; email, survey answers and health metrics are not added. Standard browser pixel request metadata remains part of the Meta SDK behavior.
- Meta event failures must not fail the already-saved registration.

The privacy dialog now names Meta Pixel and the explicit event purpose. If automatic advanced matching is configured in Meta Events Manager, review that setting separately; it is not enabled by this implementation.

## Validation

- `node --test tests/marketing.test.mjs`: server creation/duplicate/bot/failure logic, GA sanitization, Meta initialization/queue/privacy/scope/failure handling.
- `node node_modules/typescript/bin/tsc --noEmit`.
- Targeted ESLint on the pixel helper, analytics component and survey dialog.
- `npm run build` (Next.js production build).
- Browser test on the production build with mocked waitlist responses and intercepted SDK: both signup entry points × new/duplicate/error, plus rapid double submission. Expected GA/Meta conversion counts confirmed, with no actual registration, email or analytics requests sent.

## Activation after deployment

In Meta Events Manager, select dataset/pixel `2935955493422843`, open Test Events and visit `https://3fig.io/` in an unblocked browser. Confirm PageView for the intended dataset. A real Lead requires a genuinely new saved waitlist registration; reusing an existing address deliberately does not trigger it. Do not count local mocked tests as proof of live Meta receipt.
