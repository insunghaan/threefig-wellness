# 3FIG Waitlist Counter Integration Guide ('27/3,000')

이 문서는 팀원분이 작성하실 **"7일간 3,000명까지 랜덤하게 카운팅하여 채워주는 JavaScript 함수"**를 웹페이지에 연동하기 위한 DOM 슬롯 규격 및 가이드입니다.

---

## 1. 배치된 카운터 위치 및 DOM 셀렉터

방문자에게 지속적으로 노출되면서도 자연스럽게 어우러지도록 총 3곳의 주요 `Join early` 영역에 슬롯이 준비되어 있습니다.

| 위치 | 대상 요소 셀렉터 | 기본 마크업 형태 | 설명 |
|---|---|---|---|
| **1. 스티키 헤더 (항시 노출)** | `.skin-header-counter-pill[data-waitlist-counter]` | `<span class="skin-header-counter-pill skin-waitlist-counter" data-waitlist-counter>27/3,000</span>` | 스크롤 내내 상단에 고정되는 헤더의 `Join early` 버튼 내 뱃지 (방문자에게 계속 노출) |
| **2. 하단 사전등록 섹션 (메인)** | `#waitlist-counter`<br>또는 `.skin-signup-counter[data-waitlist-counter]` | `<div class="skin-signup-counter skin-waitlist-counter" id="waitlist-counter" data-waitlist-counter><span class="skin-counter-dot"></span><span>Limited founding spots: <strong class="skin-counter-val">27/3,000</strong></span></div>` | 혜택 카드 바로 아래, 메인 `Join early` 버튼 상단 |
| **3. 히어로 섹션** | `.skin-hero-counter[data-waitlist-counter]` | `<div class="skin-hero-counter skin-waitlist-counter" data-waitlist-counter><span class="skin-counter-dot"></span><span>Founding spots: <strong class="skin-counter-val">27/3,000</strong></span></div>` | 첫 화면 진입 시 Hero `Join early` 버튼 옆 |

---

## 2. JavaScript 코드 연동 방법

### 방법 A: 간단한 쿼리 셀렉터로 값 일괄 업데이트 (권장)
팀원분이 작성하시는 JS 함수 내부에서 아래와 같이 모든 슬롯의 텍스트를 일괄 갱신하실 수 있습니다:

```javascript
function updateWaitlistDisplay(currentCount, totalCount = 3000) {
  const formatted = `${currentCount.toLocaleString()}/${totalCount.toLocaleString()}`;
  
  // 1. 헤더 뱃지 갱신
  const headerPill = document.querySelector('.skin-header-counter-pill');
  if (headerPill) headerPill.textContent = formatted;

  // 2. 히어로 및 하단 섹션 내부 텍스트 갱신
  document.querySelectorAll('.skin-waitlist-counter .skin-counter-val, #waitlist-counter strong').forEach(el => {
    el.textContent = formatted;
  });
}
```

### 방법 B: `lib/threefig/waitlist-counter.ts` 모듈 활용
프로젝트 내부에 준비된 `syncWaitlistCounters` 함수를 직접 호출하셔도 됩니다:

```typescript
import { syncWaitlistCounters, getSimulatedWaitlistCount } from '@/lib/threefig/waitlist-counter';

// 7일간의 곡선 계산값으로 즉시 자동 동기화
syncWaitlistCounters();

// 또는 계산된 특정 문자열로 직접 동기화
syncWaitlistCounters('142/3,000');
```

---

## 3. 7일 카운팅 알고리즘 예시 (참고용)

```javascript
/**
 * 시작일로부터 7일간 27에서 3000까지 유기적으로 증가하는 카운트 계산
 */
function get7DayCount(startDate = new Date('2026-09-22T00:00:00Z'), target = 3000, start = 27) {
  const durationMs = 7 * 24 * 60 * 60 * 1000;
  const elapsed = Math.max(0, Date.now() - startDate.getTime());
  const progress = Math.min(1, elapsed / durationMs);

  // 자연스러운 증가 곡선 (ease-out)
  const curved = 1 - Math.pow(1 - progress, 1.35);
  
  // 랜덤 지터(약간의 흔들림) 추가 가능
  const count = Math.floor(start + (target - start) * curved);
  return Math.min(target, Math.max(start, count));
}
```
