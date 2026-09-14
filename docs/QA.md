# Menu and dialog regression review

Reviewed 2026-09-10 against the built Sites Worker, served with `npm run start -- --port 4173`. The previous deployed site reproduced a `next/link` RSC navigation exception when selecting Age from the landing phone. The repaired version uses ordinary anchors and synchronous session persistence.

| Area | Checks performed | Result |
| --- | --- | --- |
| Route navigation | Landing → Age; all four app tabs; all six You destinations; detail back links; landing mobile menu; design page | Pass |
| Entry points | Direct Age link during unfinished calibration opens Age; `/app` continues the first-launch journey | Pass |
| Today | Expand action reason, complete one, immediately leave and return, complete all three | Pass |
| Age | Estimate screen and explanation; Escape closes and restores trigger focus | Pass |
| Rhythm | Suggested / Your day / Together; explanation popup | Pass |
| Profile | Save age 49, Energy interest, Feeling warmer context; immediately return to You | Pass |
| Ring | Gold finish, disconnect, disabled sync, reconnect, successful sample sync feedback | Pass |
| Reminders | Enable, save 21:30, return to You, reopen to verify the time | Pass |
| Journal | Save Good mood and a note from a 320px dialog; reopen saved entry; transition to pattern | Pass |
| Pattern | Dedicated explanation screen, journal link, and post-save dialog | Pass |
| Privacy | Full data details, bounded clear-session confirmation, cancel returns focus to the trigger, confirm resets to welcome | Pass |
| First launch | All five onboarding steps, simulated connection, days 3/10/20/21, Age reveal, Rhythm reveal, Today | Pass |
| Runtime | TypeScript and Sites build; no new local production browser errors | Pass |

Exact mobile sizes were provided by local review-only iframes because the browser's viewport override reported doubled dimensions. The fixture is outside the shipped site. Each iframe was checked at its actual DOM width, not the requested browser override size.

- At 390×667, the journal panel was inside the app device with a 12px horizontal inset, and its content exceeded its scroll area without enlarging the panel.
- At 320×568, the journal panel was also contained, with internal scrolling to the note and save button; the page had no horizontal overflow.
- At 320px, Age dialog containment was measured; Rhythm and pattern dialogs were visually checked within the phone.
- On desktop, Age and Journal dialogs remained within the 400px device. The backdrop stayed inside the device as well.

Test data is synthetic and local. Ring connectivity, wellness estimates, and notifications remain explicitly simulated.

## Skin and signal expansion — 2026-09-10

Validated the built Worker with D1 and R2 enabled and the generated migration applied. A local-only review proxy supplied two synthetic identities for API isolation and a third identity for browser walkthroughs. This proxy and image fixtures are outside the shipped project; production has no test identity fallback.

- Eight deterministic logic tests pass: actual pixel variation, clipping without a dark-skin threshold, malformed pixel buffers, crop boundaries, comparison compatibility, equal nonoverlapping time windows, all 22 metric definitions and links, and midnight time formatting.
- Two API integration suites pass: identity required, invalid and oversized input rejection, cross-origin writes rejected, save/retrieve/delete, duplicate save, cross-user list/read/delete isolation, private JPEG retrieval and physical photo deletion. The test harness retries only Wrangler's explicit `503 / Retry-After: 0` proxy interruption after a rejected large request, retaining the same idempotency key. Application errors are not retried by the test. Normal browser saves succeeded on the first request.
- All 27 new static/detail destinations (five skin/hub routes plus 22 metrics) return complete HTML. Saved UUID photo detail routes were exercised separately.
- Browser walkthrough: upload a synthetic 600×800 PNG, move both crop controls by keyboard, choose comfort and a note, run real analysis (11.1 RGB units and 0.1 luma units for this fixture), save, revisit the record and history, add a second photo, open same-area side-by-side comparison, and inspect record links. No real personal photograph was used.
- At 390×667, the crop image was 240×320 within a 390px document; review, analysis, save and compare controls remained within the app scroll area. At 320×568, the manual-entry dialog measured x=12–308 and y=54–556 within the device x=0–320 and y=42–568, with internal scrolling to Save. The document width stayed 320px.
- At 320px, save an Energy=4 entry and note, switch example/personal views, select 7/30/90-day periods, inspect a selected historical chart date, reopen actual history and confirm deletion. The saved record stayed separate from example data. New deletion confirmations use the same bounded dialog provider.
- TypeScript, whitespace checks and production build pass. Physical camera permission/capture was not activated on the user's device during QA; that hardware/browser path remains a device acceptance check. Upload uses the same crop/analysis/save pipeline.

The new product plan is in `docs/PRODUCT-EXPANSION.md`. This is functional storage and interface validation, not clinical or camera-hardware validation.
