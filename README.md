# 3FIG

**Three things. Just for today.**

A premium wellness concept for women in midlife: a responsive consumer landing page and a connected, high-fidelity mobile prototype. No decorative photographs, stock assets, fruit illustrations, reward mechanics, or primary metric dashboard. User-selected skin photos appear only in the optional skin check-in flow. Visuals combine airy display typography, a faint color wash, translucent glass panels, the original ring concept, and an accessible SVG rhythm dial.

## Run locally

Requires Node.js 22.13 or newer.

```sh
npm run install:ci
npm run dev
```

Open http://localhost:5173. The project uses React 19, TypeScript, and Next.js App Router conventions through Vinext/Vite, with the supplied Cloudflare-compatible Sites starter. Styling is in `app/globals.css` and `app/theme.css`; the supplied Radix/shadcn primitives handle dialogs, tabs, checkboxes, radio choices, and switches. No new package dependency was needed.

```sh
npx tsc --noEmit
npm run build
```

## Product logic

Body signals → personal baseline → 3FIG Age + 3FIG Rhythm → Today’s 3 → everyday behavior → further body signals.

- **3FIG Age:** an illustrative wellness estimate of the age a long-term health pattern resembles. It is not a validated biological age, diagnosis, hormone measurement, or disease prediction. The proposed model would evaluate sustained evidence rather than fluctuating daily. No real inference runs in this prototype.
- **3FIG Rhythm:** suggested windows change slowly; actual-day events change as life happens. Outer bands display suggested timing and inner dots display actual events. Both also have textual schedules. Three weeks is a first view, not a definitive chronotype.
- **Today’s 3:** exactly three calm actions, with optional explanations. Completion changes the abstract form from translucent to gently defined. At 3/3: “That’s enough for today.” There are no streaks or additional goals.
- **Journal:** optional mood, tags, and a short note. Journal context is an association, never evidence of causation or a diagnosis. The pattern insight describes an illustrative history of entries, not a new finding from a single submission.

## Routes

| Route         | Purpose                                                                                                                                                                      |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`           | Responsive landing page with ten sections including the footer, interactive Today preview, rhythm views, ring finishes, science disclosures, and early-access prototype form |
| `/app`        | First launch, short onboarding, simulated ring connection, calibration, restrained first Age reveal, first Rhythm reveal, then Today                                         |
| `/app/today`  | Three actions, expandable reasons, 0–3 completion, optional journal                                                                                                          |
| `/app/age`    | One age estimate and an optional explanation with three contributors                                                                                                         |
| `/app/rhythm` | Suggested / Your day / Together views, textual timing, explanation of a sustained rhythm update                                                                              |
| `/app/you`    | Sample profile, journal, pattern insight, ring settings, reminder preference, privacy, and replay                                                                            |
| `/app/you/ring` | Ring finish, simulated connection, battery, sync feedback, and supported-signal details |
| `/app/you/profile` | Editable calendar age, interests, and optional context with an explicit Save action |
| `/app/you/notifications` | Reminder preference and time, saved for this session |
| `/app/you/privacy` | Data handling details and confirmed session reset |
| `/app/journal` | Today's saved entry, optional editing, and a link to pattern context |
| `/app/insights` | Full pattern explanation and a return path to the journal |
| `/design`     | Internal tokens, typography, four organic states, live control examples, rhythm visualization, and voice                                                                     |

## Prototype walkthrough

1. Open `/app`, then **Begin with you**.
2. Enter calendar age, choose interests, optionally add context, and connect the demo ring.
3. Begin calibration on day 3. The clearly labeled preview controls advance to days 10, 20, and 21.
4. On day 21, open the first Age reveal (44.7), then the first Rhythm, then Today’s 3. No age is shown during signup or calibration.
5. Complete one action, expand an explanation, and complete all three. Uncheck an action to reverse it.
6. Open Age → **Why has my Age changed?** → expand contributors or method details.
7. Open Rhythm and compare suggested windows with the actual day. See why a longer-term rhythm was adjusted.
8. Add an optional journal entry. Save, reopen to edit, or view the pattern insight.
9. Open You to change age/interests, ring finish/connection, or the local reminder preference.
10. Use **Revisit your first three weeks** to clear the app state and replay. Desktop review controls also offer the established sample day.

Explicit app menu links always open the selected screen using the established sample profile, including during an unfinished onboarding preview. `/app` preserves the first-launch journey. These are alternative concept checkpoints. This prevents an unfinished calibration from making working menus appear unresponsive.

All route links use ordinary document navigation through `components/threefig/navigation.tsx`. The pinned Vinext production runtime threw an RSC navigation error with `next/link`, even though development navigation worked. State updates are persisted synchronously before navigation so a completed action or saved setting survives an immediate route change. Production checks must use the built Worker, not only the Vite development server.

## Mock data and state

`lib/threefig/mock-data.ts` is the central example-data layer. Alex is 48, with current Age 44.7, prior established-profile estimate 45.3, improving sleep consistency, stable resting heart patterns, and somewhat lower movement. Suggested sleep is 11:10 PM; actual sleep is 11:50 PM. The two entry points are alternative concept checkpoints: a first-reveal journey and an already-established daily profile with sample update history, rather than a real time series.

`lib/threefig/state.tsx` manages calibration stage/day, age context, interests, optional context, action completion, journal, ring status/finish, and reminder preference/time in React context. State survives route changes and reloads using `sessionStorage` under `3fig-prototype-v1`. The sample Age and timelines are fixed illustrative inputs; changing calendar age updates comparison copy, not an invented health algorithm. The landing phone has independent, reversible demo completion state.

Storage failures gracefully fall back to memory. Closing the browser session normally clears session data; restored tabs can follow the browser’s own restoration behavior. **Clear session & start again** resets app state explicitly. The early-access form uses a separate `3fig-interest` session key and is deliberately labeled as a concept form. It does not create a real waitlist, send email, or make a network request. Reminder preferences do not schedule notifications. Ring connections are simulated.

## Code structure

- `app/page.tsx`, `app/app/**`, `app/design/page.tsx`: route entry points and metadata.
- `components/threefig/landing.tsx`: navigation, hero, live Today preview.
- `components/threefig/landing-sections.tsx`: Age, Rhythm, Today’s 3, calibration narrative, change, ring, science, early access, footer.
- `components/threefig/app-prototype.tsx`: shared device shell, onboarding state machine, daily screens, accessible dialogs, journal, and You navigation.
- `components/threefig/app-subpages.tsx`: complete Ring, Profile, Reminder, Privacy, Journal, and Pattern screens.
- `components/threefig/app-dialog.tsx`: shared dialog portal inside the app device, bounded overlay, independently scrollable content, close control, and focus restoration.
- `components/threefig/navigation.tsx`: native anchors and document navigation shared by all routes.
- `components/threefig/visuals.tsx`: wordmark, organic completion form, metallic ring, and data-driven 24-hour dial.
- `components/threefig/design-system.tsx`: internal design-system page using the same production components.
- `lib/threefig/mock-data.ts`: coherent fixed fixtures.
- `lib/threefig/state.tsx`: session-scoped state provider.
- `lib/threefig/integrations.ts`: typed future wearable and interpretation boundaries.
- `app/globals.css`: shared tokens, component styles, responsive recomposition, focus states, reduced-motion support.
- `components/ui`: supplied accessible UI primitives, unchanged.
- `.openai/hosting.json`, `build`, `scripts`, `vite.config.ts`: supplied Sites/Cloudflare build and hosting support.

## Skin and signal expansion

You now links to **Skin check-in** and **Your signals**. Skin capture supports camera/library input, an adjustable skin patch, real local image measurements, explicit private saving, a photo history and same-condition comparison. It does not infer skin age or medical conditions. All 22 signal pages offer 7/30/90-day trends, equal previous-period comparisons, dated history, method and source details, and related signals. Personal entries are separate from illustrative wearable data.

New routes: `/app/signals`, `/app/signals/[metric]`, `/app/skin`, `/app/skin/capture`, `/app/skin/history`, `/app/skin/compare`, and `/app/skin/record/[id]`. D1 and private R2 persist manual records and selected photo patches by authenticated Sites identity. Apply the checked-in Drizzle migration before local storage testing. Public API requests without the dispatcher identity are rejected. No identity bypass is included in the shipped app.

The complete screen plan, metric inventory, analysis method and future model boundary are in [docs/PRODUCT-EXPANSION.md](docs/PRODUCT-EXPANSION.md). Implementation: `skin-screens.tsx`, `signal-screens.tsx`, `lib/threefig/skin.ts`, `metrics.ts`, `use-records.ts`, and the `/api/skin` and `/api/records` routes.

```sh
node --experimental-strip-types --test tests/data-logic.test.ts
# Built local Worker + migrated DB + non-personal JPEG fixture:
THREEFIG_TEST_JPEG=/absolute/path/to/synthetic.jpg node --test tests/records-api.test.mjs
```

## Future integrations

Implement `WearableAdapter` in `lib/threefig/integrations.ts` per hardware provider. Only report measurements in its supported-signal list, preserve source/quality/timestamps, handle missing observations, and request actual permissions. Feed normalized data to a separately evaluated `WellnessInterpretationService`; keep personal-baseline readiness and sufficient sustained evidence as gates before returning an Age or suggested rhythm. Its action contract returns exactly three items.

Replace fixtures at the data boundary, not in presentational components. A real release needs a validated method, evidence-quality rules, appropriate consent and secure health-data storage, time-zone/date handling, an actual subscription endpoint, real notification scheduling, and hardware confirmation. The Science section intentionally reserves space for verified research references; no citations are fabricated.

## Design and accessibility

Pearl and plum form the base. A faint, heavily diffused apricot, rose and lavender wash connects the screens; Instrument Serif gives headings an airy rhythm; state is also communicated by text, shape, and accessible control state. Desktop layouts recompose into single-column mobile sections. On phones the app uses the full viewport, while desktop shows one scrollable device. App dialogs and their backdrops are constrained to that device with a 12px inset. Long content scrolls inside the panel while its close button stays visible. The device can shrink on short mobile viewports. Dialogs trap focus, support Escape, and restore focus. Forms use labels, age and email validation, native semantics, and useful focus styles. Reduced motion disables transitions and reveal animations. Text schedules accompany the SVG dial.

## Verification performed

TypeScript validation and the Sites production build pass. The menu repair was verified against the actual built Worker served locally, including all thirteen routes, every onboarding/calibration checkpoint, both reveals, immediate action persistence across routes, 3/3 completion, all six detail screens, profile/context saving, ring disconnect/reconnect/sync, reminder time persistence, journal save/reopen, and pattern transitions. Mobile checks used exact 390×667 and 320×568 CSS-pixel frames. Journal and Age dialog bounds were measured against the device; journal content was scrolled to its save action; Rhythm and pattern panels were visually reviewed. Native navigation, mobile menu closure, and the design page were exercised without new production-runtime errors. See `docs/QA.md` for the regression checklist. This is prototype interaction review, not clinical or hardware validation.

The September 2026 reference redesign is documented in [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md). The live `/design` page presents the same tokens, fonts, surface treatments and interactive controls as the app.
