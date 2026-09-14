# Skin check-ins and signal histories

## Product intention

Keep Today quiet: exactly three actions. Deeper understanding lives one level below the four existing tabs. You gains two destinations, **Skin check-in** and **Your signals**. Age and Rhythm link directly to relevant histories. Each destination has a clear return path; no metric requires opening a modal to reach its history.

## Skin journey — implemented

`You → Skin check-in → Take a skin photo → Choose area → Photo observations → Save → Record detail`

Camera access starts after **Open camera**. The app requests the front camera where available, shows a live preview, captures one still, and stops camera tracks on capture, cancellation, or leaving the screen. A native camera file input is the fallback; the photo library works on desktop and mobile. Permission or format failures explain how to choose another photo.

The person selects a square skin patch using horizontal and vertical controls, identifies left cheek, right cheek, forehead, or chin, and adds before/after-skincare conditions, optional comfort (1–5), and a note. Only the chosen patch is analyzed. Analysis runs locally, before any upload. The original photograph is not uploaded. **Save photo & observations** stores a resized JPEG patch and metadata in the private account; encoding creates a fresh image without copying original EXIF metadata.

The saved record shows the photograph, date, area, conditions, subjective comfort, note, and observed image values. History can be filtered by area. Compare offers two date selectors, side-by-side images, and changes only for records from the same area, routine and method, usable exposure, and mean luminance within 25 units. Different conditions still allow visual comparison with an explanation that numerical changes are omitted. This rule is a conservative interface heuristic, not a validated correction for lighting.

### What the analysis measures

| Output | Implemented calculation | Interpretation |
| --- | --- | --- |
| Photo color variation | Mean of the standard deviations of the three RGB channels in the 256×256 selected patch | Color variation in this image, sensitive to light, makeup, focus, camera processing and the selected area |
| Photo surface contrast | Mean absolute luminance difference between horizontal and vertical neighboring pixels | Light-and-dark image detail; not a pore, wrinkle or smoothness score |
| Exposure check | Fraction of pixels with luminance below 4 or above 251; limited above 15% | Potential detail lost in near-black or near-white pixels; ordinary dark skin is not treated as a fault |
| Skin comfort | Optional self-report, 1–5 | The person’s experience, not inferred from their image |

The implementation does not detect disease, infer hydration or elasticity, estimate skin age, identify a person, use an external AI service, or feed skin photos into 3FIG Age. It does real image processing, not fabricated AI outputs. Meaningful future skin-condition inference requires selecting and evaluating a vision model across skin tones, cameras, lighting and relevant concerns, with calibration, uncertainty, consent and deletion behavior defined before release. Face/skin segmentation, matched framing overlays, longitudinal image alignment and validated concern-specific analysis are possible later stages; they are not claimed as shipped.

Photo guidance uses even lighting, focus and removal of makeup, consistent with the [American Academy of Dermatology’s photo guidance](https://www.aad.org/public/fad/digital-health/taking-pictures-skin). Mobile file capture is a browser hint with platform-dependent support, as described by [MDN’s capture reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/capture); the app also supplies explicit live capture and library selection.

## Signal detail template — implemented

`You → Your signals → Category → Signal → Trend / History`

Each detail offers **7 / 30 / 90 days**, a latest entry, dated chart points and a keyboard-accessible date selector, period average/count, the immediately preceding equal-length period, a dated history, method disclosure and related signals. Missing observations remain gaps. The example window is fixed at September 10, 2026. Personal windows use today. Dates are stored in UTC; period boundaries and displayed history dates use UTC consistently. Sleep times crossing midnight stay continuous on the chart.

Example trends and actual saved records occupy explicit, separate views. No example point is mixed into a personal trend. Wearable and 3FIG-estimate histories are examples until an actual integration exists. Manual-entry metrics support a bounded form, explicit save, error recovery and deletion. Photo-derived metrics use saved skin observations, filter by area and exclude photos with incompatible conditions from numerical trends. Skin comfort can include manual entries and saved photo comfort.

| Group | Detail pages | Current personal input |
| --- | --- | --- |
| Your longer view | 3FIG Age | Example history; no model inference |
| Sleep | Time asleep, bedtime variation, night wake-ups, sleep time, wake time | Wearable integration pending |
| Heart | Resting heart rate, heart rate variability | Wearable integration pending |
| Movement | Daily steps, active minutes | Wearable integration pending |
| Recovery | Night temperature shift, recovery | Temperature example; recovery self-report |
| How you feel | Energy, mood, fatigue | Self-report |
| Body context | Weight, systolic pressure, diastolic pressure, cycle notes | Optional manual input |
| Skin | Photo color variation, photo surface contrast, skin comfort | Saved photo descriptors and optional comfort |

There are 22 detail destinations. Labels, units, precision, valid ranges, source, explanations and related routes are centralized in `lib/threefig/metrics.ts`. Ranges validate data entry; they are not clinical reference intervals. Changes are described neutrally, without an invented health rating or causal explanation. The hub is optional, so the primary daily experience does not become a metric dashboard.

## Storage and controls

D1 stores user-scoped signal and skin metadata; private R2 stores selected JPEG patches. The server trusts only the identity header supplied by Sites dispatch, requires identity on every endpoint, scopes queries and file retrieval/deletion to that identity, uses prepared statements, validates bounded payloads, checks cross-origin writes, and returns private/no-store responses. The browser receives photo content only through its authenticated photo route. There is no anonymous fallback identity in production.

Records survive navigation, reload and browser-session closure. API lists currently return the latest 1,000 entries per signal and 500 photos per account; pagination/export are future scale work. Deleting a skin record removes its database record and stored image, with a repeatable cleanup path. Individual manual entries can be removed in their history. Prototype profile/journal/reminder state remains session-scoped; resetting that session deliberately preserves separately saved photos and signal entries. The Privacy screen explains both stores and links to their management screens.

The prototype is publicly viewable by link; personal record persistence remains restricted to authorized accounts. Its persistence is functional, but no clinical validation, hardware validation, real notification delivery or external AI processing is claimed.

## States and responsive behavior

New flows include loading, empty history, denied/unavailable camera, unsupported/oversized photo, invalid input, failed analysis, failed save with retained draft, missing/deleted record, insufficient comparison history and incompatible conditions. Long forms stay in the existing app scroll region. Entry and deletion dialogs use the shared device-bounded portal, with fixed close access, internal scrolling, focus trapping and Escape support. No new top-level tab or extra Today action is introduced.
