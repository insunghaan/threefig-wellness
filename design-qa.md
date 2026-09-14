# 3FIG — Quiet color and glass QA

final result: passed

Reviewed September 10, 2026 after the user rejected the previous image-heavy treatment. This report supersedes the earlier Soft light assessment. The user's correction is the acceptance brief: palette only, barely perceptible highly blurred backgrounds, no repeated bitmap, original fig restored, rounder glass cards and glass bottom navigation.

## Visual truth and evidence

- Primary color reference: `/var/folders/7c/zzv9yz4x1hv7l6t1c8j25v0c0000gn/T/codex-clipboard-95ec7116-daca-48b9-8f86-e6e85b656827.png`, 579×1011 pixels.
- Card reference: `/var/folders/7c/zzv9yz4x1hv7l6t1c8j25v0c0000gn/T/codex-clipboard-40b86df8-3754-410e-8f6a-479e8b6dd9b6.png`, 726×965 pixels.
- Color reference: `/var/folders/7c/zzv9yz4x1hv7l6t1c8j25v0c0000gn/T/codex-clipboard-e07691a1-c96a-4d76-98b0-583a7aa97666.png`, 705×383 pixels.
- Original fig source: unchanged `OrganicForm` component and its original geometry, highlights, rotation and opacity in `app/globals.css`. Only the palette and progressive blur are supplied by the theme.
- Implementation: final local production Worker on port 4173, through a temporary QA fixture proxy on port 4174. The proxy is outside the project and deployment.
- Implementation screenshot path: browser capture returned native inline images, not filesystem paths. Evidence is retained in this task's CUA outputs; no screenshot file is claimed.
- Full-view comparison: native capture titled **은은한 컬러 적용과 원래 fig 복원 최종 비교**, from `/compare`. Source and current Today appear together in one 1640×1740 pixel capture, both in 390×840 CSS slots at 2× density. Source is contained with its white margin/device frame; implementation includes the established preview header. This comparison judges palette relationships, translucent edges and visual calm. Matching the reference's strong saturation or unrelated canvas content would violate the user's latest instructions.
- Additional native evidence: before-change You capture; after-change 390×780 Today and 320×568 You/Skin; 320px open journal; completed fig; desktop landing at 1440×1000 CSS px, displayed at 0.65 scale. Paired mobile captures are 1520×1630 pixels, 2× density.
- Focused region review: the journal, complete action cards, fig surface and bottom navigation are legible in the mobile captures. Their computed styles and bounds were additionally read from the rendered DOM.

## Findings and correction history

1. **[P1, resolved] Repeated image and visible background crops.** The previous theme repeated one generated image in the device, hero, cards, rhythm dial and design guide. Removed every runtime reference and removed the rejected JPG. The final landing, Today, You and Skin captures show a continuous, low-contrast color wash without imagery or crop boundaries.
2. **[P1, resolved] Original fig replaced by a blurred image circle.** Removed the circular-image override. Restored the original asymmetric radius, nested highlights, opacity and rotation. Rendered radius is `51% 49% 44% 56% / 63% 42% 58% 37%`. The 0/3 capture is softly blurred; the 3/3 capture has a defined surface and visible inner highlight. All three actions update the completion state.
3. **[P1, resolved] White boxes instead of glass.** Major cards now share transparent layered fill, 32px backdrop blur, an inset highlight and a thin light rim. The footer navigation uses the same material with its own subtle shadow and translucent active pill. The final captures visibly show the background color through the panels.
4. **[P2, resolved] Corners insufficiently rounded.** Main panel radii are 36–40px; nav and dialog radii are 40px. The 320px journal capture confirms rounder corners without changing its 12px device inset.

The previous iteration's acceptance did not reflect the user's intended restraint. The revised comparison uses the user's explicit correction as the source of truth. No actionable P0/P1/P2 finding remains against that brief.

## Five fidelity surfaces

| Surface | Result |
| --- | --- |
| Typography | Existing Instrument Serif and Helvetica hierarchy retained. Headlines and action labels remain readable. No bitmap text or changes to content hierarchy. |
| Layout and spacing | Existing mobile/desktop structure retained. Restored fig has its original proportions rather than a flattened image. All three action cards and the nav fit the 390×780 initial viewport. Small-screen detail contents scroll normally. |
| Color and materials | Pearl base `#F7F8FA`; broad lavender, rose and peach fields at 18–22% alpha, blurred 65–100px. Stronger color is confined to the fig and semantic accents. Glass cards use white 60%→18%, backdrop blur and highlighted edges. |
| Image/asset fidelity | No decorative raster backgrounds or repeated images. The rejected asset is deleted. The user's explicit request to preserve the original code-native fig and use only CSS color treatment governs this correction. Personal skin photos and the original ring remain intact. |
| Copy and content | No product-flow copy or sample-data disclosures changed. The internal design guide now describes the actual faint background, restored fig and glass tokens. |

## Verification

- Actual 390px document width equals scroll width; no horizontal overflow in the checked Today viewport.
- Journal on a 320×568 viewport: device x0–320/y42–568; dialog x12–308/y54–556, 296×502. Radius40px; computed backdrop filter `blur(40px) saturate(1.2)`. Close remains visible and contents scroll inside the panel.
- Footer computed backdrop filter: `blur(32px) saturate(1.35)`. Active link remains explicit through color, shape and `aria-current`.
- Today checkboxes exercised from 1→0→1→2→3. Completion survives native Today navigation. The final state has no blur and preserves the original fig shape.
- Journal open/close and You→Skin navigation exercised after the material change.
- Desktop landing visually checked; no decorative image, hard color boundary, overflow or clipped primary action.
- TypeScript, production build and diff whitespace checks pass. No package dependency, API, database, camera processing, metric calculation or routing changes.
- The prior targeted ESLint finding in unchanged journal effect logic remains outside this presentation correction; lint is not claimed as passing.

## Implementation checklist

- [x] Remove rejected background image and all runtime consumers.
- [x] Make background color faint and heavily diffused.
- [x] Restore original fig and verify clarity progression.
- [x] Apply real backdrop glass to cards, dialogs and bottom navigation.
- [x] Increase panel radii and preserve mobile popup containment.
- [x] Compare rendered mobile and desktop views; validate production build.

## Landing iPhone proportion follow-up

The user requested a shorter iPhone-shaped hero preview. The previous content-sized frame measured 275×721.77px at the checked desktop viewport (2.62 height/width). The new frame uses 9:19.5 and width-based internal sizing; the desktop frame measures 304×658.66px. A decorative Dynamic Island and Lucide status icons replace the text-symbol status bar. All existing preview actions remain interactive.

Final production-preview checks at 390px and 320px: frame sizes 280×606.66px and 257.63×558.19px, respectively. Frame scroll height equals client height (599px and 550px); no clipped internal content. Both sample checkboxes updated to 1/3. Native screenshots show the three cards and glass footer fitting inside the phone. Mobile hero stage no longer carries a 620px minimum height, and its surrounding vertical gaps are reduced. The narrow hero footer caption stacks to avoid colliding text. App screens and the restored fig geometry are unchanged. TypeScript and production build pass.

## Landing containment and notch follow-up

Removed the decorative hero notch at the user's request, retaining the iPhone proportions and status icons. Fixed the Age card's absolute-positioned note and disclaimer: the previous disclaimer extended 9px below its card, and the note overlapped the number labels. Both now occupy normal grid rows, with wrapping text and content-driven card height.

Landing feature columns can shrink below their intrinsic text widths. Action rows reserve separate columns for the index, wrapping title and arrow. Rhythm tabs and legends wrap within available space; the existing ring artwork scales proportionally within its glass card; science disclosure icons and footer links remain inside their containers.

Production Worker QA at 320px, 390px and 1440px found no horizontal page overflow or out-of-bounds text in Age, rhythm, action, learning, ring, science and copy containers. All four science disclosures opened successfully on both mobile sizes; warm-gold selection updated the ring. At 390px the Age card measures 335.44×325.66px and its disclaimer has 30px of space below it. Native CUA captures titled **모바일 Age 카드 전체 내용 확인**, **링 카드와 작은 화면 실행 카드 확인**, **모바일 펼침 설명과 모든 하단 카드 넘침 검사**, **주차별 설명 및 랜딩 푸터 줄바꿈 확인** and **1440px 데스크톱 카드·텍스트 경계 검증** document the rendered results. Screenshots are retained inline in this task, not claimed as local files. TypeScript, production build and diff whitespace checks pass.

## Centered landing content follow-up

The user's wide-screen screenshot showed the hero copy pushed toward the left edge and the phone far to the right, with different alignment from the header and following sections. Reference: `/var/folders/7c/zzv9yz4x1hv7l6t1c8j25v0c0000gn/T/codex-clipboard-5c3b7f6a-7c26-4082-b9ac-2d238cbb9b88.png`.

All eleven landing regions now use the same centered 1120px content area, with fluid minimum gutters. The hero no longer has an extra outer margin or asymmetric stage padding; its column gap is capped at 80px, and feature/science gaps at 72px. Backgrounds and section dividers still span the viewport. Below 761px, the content area is capped at 560px; hero text, actions and phone share the center line.

Production-preview screenshots reviewed at approximately 2043px, 1440px, 820px, 390px and 320px. In the wide iframe the rendered layout viewport rounds to 2044px: the header, hero, Age, rhythm, actions, learning, change, ring, science, early-access and footer all measure 1120px inside identical x462–1582 content edges. Mobile phone centers measure x195 at 390px and x160 at 320px. No horizontal page or checked text overflow appeared at any of the five sizes. Native evidence is retained in captures titled **와이드 화면의 중앙 정렬 결과**, **820px 태블릿 중앙 배치와 줄바꿈 검증**, **390px·320px 모바일 히어로 및 텍스트 검증**, **1440px 하단 카드 중앙 배치 검증** and **와이드 화면 하단 콘텐츠와 텍스트 최종 검증**. The production build and diff whitespace checks pass. This follow-up changes only landing CSS and this QA record.

## Compact centered hero follow-up

The user requested that the hero itself gather more tightly in the center. Added a dedicated `hero-content` wrapper capped at 848px, with a 304px phone column and a 32–48px gap. Removed the peripheral vertical annotation. The lower hero caption uses the same centered width. Other landing sections retain their shared 1120px content area.

The final wide production preview measures an 848px group centered at x1022 in a 2044px layout viewport: copy x598–1094, phone x1142–1446, exactly 48px apart. At 820px the group is centered at x410 with a 32.78px gap and no text overflow. At 390px and 320px, group and phone centers are x195 and x160 respectively; phone scroll height equals client height (599px), and both sample checkboxes update to 1/3. Native evidence: **히어로 848px 중앙 묶음 최종 시각 확인**, **모바일 중앙 정렬과 히어로 체크 동작 검증**, and **820px 히어로 넘침과 중앙 위치 확인**. The production server was restarted after rebuilding to ensure the new component and styles were loaded. Production build and diff whitespace checks pass.
