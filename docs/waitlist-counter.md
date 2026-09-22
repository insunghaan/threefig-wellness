# 3FIG Waitlist Counter Integration Guide ('27/3,000')

이 문서는 3FIG 사이트의 대기열 카운터 연동 가이드입니다.
**시작: 2026년 9월 22일 23:40 KST (27명) ➔ 종료 목표: 2026년 9월 27일 14:00 KST (3,000명)** 일정에 맞추어 서버 기반의 불규칙 단조 증가(monotonic) 알고리즘 및 API가 구축되어 있습니다.

---

## 1. 배치된 카운터 위치 및 DOM 셀렉터

총 3곳의 주요 `Join early` 영역에 슬롯이 배치되어 있으며, 실시간으로 동일한 카운트를 공유합니다:

| 위치 | 대상 요소 셀렉터 | 기본 마크업 형태 | 설명 |
|---|---|---|---|
| **1. 스티키 헤더 (항시 노출)** | `.skin-header-counter-pill[data-waitlist-counter]` | `<span class="skin-header-counter-pill skin-waitlist-counter" data-waitlist-counter>{waitlistCount}</span>` | 스크롤 내내 상단에 고정되는 헤더의 `Join early` 버튼 내 뱃지 |
| **2. 히어로 섹션** | `.skin-hero-counter[data-waitlist-counter]` | `<div class="skin-hero-counter skin-waitlist-counter" data-waitlist-counter><span class="skin-counter-dot"></span><span>Founding spots: <strong class="skin-counter-val">{waitlistCount}</strong></span></div>` | 첫 화면 진입 시 Hero `Join early` 버튼 하단 |
| **3. 하단 사전등록 섹션 (메인)** | `#waitlist-counter`<br>또는 `.skin-signup-counter[data-waitlist-counter]` | `<div class="skin-signup-counter skin-waitlist-counter" id="waitlist-counter" data-waitlist-counter><span class="skin-counter-dot"></span><span>Limited founding spots: <strong class="skin-counter-val">{waitlistCount}</strong></span></div>` | 혜택 카드 바로 아래, 메인 `Join early` 버튼 상단 |

---

## 2. 서버 API 엔드포인트

### `GET /api/waitlist/count`
실시간으로 계산된 서버 측 카운트 값을 반환합니다:
```json
{
  "current": 27,
  "total": 3000,
  "formatted": "27/3,000",
  "timestamp": 1790088015000,
  "startTime": "2026-09-22T14:40:00.000Z",
  "targetTime": "2026-09-27T05:00:00.000Z"
}
```

---

## 3. 코드 모듈 활용

### `lib/threefig/waitlist-counter.ts`
```typescript
import { getSimulatedWaitlistCount, syncWaitlistCounters } from "@/lib/threefig/waitlist-counter";

// 1. 현재 시각 기준 카운트 조회
const { current, total, formatted } = getSimulatedWaitlistCount();

// 2. DOM 요소 자동 갱신
syncWaitlistCounters();
```
