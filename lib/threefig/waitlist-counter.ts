/**
 * 3FIG Waitlist Counter Utility
 *
 * Implements an irregular, monotonic pseudo-random progression curve
 * targeting 3,000 spots by September 27, 2026, 14:00 KST starting from 27 spots
 * on September 22, 2026, 23:40 KST.
 */

export interface WaitlistCounterOptions {
  startDate?: string | Date | number;
  endDate?: string | Date | number;
  startCount?: number;
  targetCount?: number;
  nowMs?: number;
}

export const CAMPAIGN_START_MS = new Date("2026-09-22T23:40:00+09:00").getTime();
export const CAMPAIGN_END_MS = new Date("2026-09-27T14:00:00+09:00").getTime();
export const CAMPAIGN_START_COUNT = 27;
export const CAMPAIGN_TARGET_COUNT = 3000;

// Total 10-second intervals over the ~110.33 hours (39,720 intervals)
const INTERVAL_MS = 10000;
const TOTAL_INTERVALS = Math.floor((CAMPAIGN_END_MS - CAMPAIGN_START_MS) / INTERVAL_MS); // 39720

// Deterministic sine hash for pseudo-random noise per 10s step
function deterministicHash(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Diurnal weighting based on hour of day in Korea Standard Time (UTC+9)
function getHourWeightKST(hourKST: number): number {
  if (hourKST >= 2 && hourKST < 7) return 0.2; // quiet night
  if (hourKST >= 7 && hourKST < 10) return 0.7; // morning
  if (hourKST >= 10 && hourKST < 12) return 1.1; // late morning
  if (hourKST >= 12 && hourKST < 14) return 1.5; // lunch rush
  if (hourKST >= 14 && hourKST < 18) return 1.2; // afternoon
  if (hourKST >= 18 && hourKST < 21) return 1.6; // dinner/evening peak
  if (hourKST >= 21 && hourKST < 24) return 1.4; // late evening
  return 0.8; // 00:00 - 02:00
}

// Lazy-initialized cumulative counts array for O(1) lookups
let precomputedCounts: Int32Array | null = null;

function initCumulativeCounts(): Int32Array {
  if (precomputedCounts) return precomputedCounts;

  const weights = new Float64Array(TOTAL_INTERVALS);
  let sumWeights = 0;

  for (let i = 0; i < TOTAL_INTERVALS; i++) {
    const timeMs = CAMPAIGN_START_MS + i * INTERVAL_MS;
    const kstDate = new Date(timeMs + 9 * 60 * 60 * 1000);
    const hour = kstDate.getUTCHours();

    const hourFactor = getHourWeightKST(hour);
    // Fluctuates irregularly between 0.35 and 1.65
    const irregularFactor = 0.35 + 1.3 * deterministicHash(i + 4242);

    const w = hourFactor * irregularFactor;
    weights[i] = w;
    sumWeights += w;
  }

  const counts = new Int32Array(TOTAL_INTERVALS + 1);
  counts[0] = CAMPAIGN_START_COUNT;
  let runningWeight = 0;
  const countSpan = CAMPAIGN_TARGET_COUNT - CAMPAIGN_START_COUNT;

  for (let i = 0; i < TOTAL_INTERVALS; i++) {
    runningWeight += weights[i];
    const progress = runningWeight / sumWeights;
    const count = Math.round(CAMPAIGN_START_COUNT + countSpan * progress);
    // Guarantee strict monotonicity (never decreases)
    counts[i + 1] = Math.max(counts[i], Math.min(CAMPAIGN_TARGET_COUNT, count));
  }

  precomputedCounts = counts;
  return counts;
}

/**
 * Calculates current waitlist count based on elapsed time.
 * Irregular, monotonic progression reaching 3,000 on Sep 27, 2026, 14:00 KST.
 */
export function getSimulatedWaitlistCount(options: WaitlistCounterOptions = {}): {
  current: number;
  total: number;
  formatted: string;
} {
  const nowMs = options.nowMs ?? Date.now();

  // If custom options are passed, calculate proportionally
  if (
    options.startDate ||
    options.endDate ||
    options.startCount ||
    options.targetCount
  ) {
    const sMs = options.startDate ? new Date(options.startDate).getTime() : CAMPAIGN_START_MS;
    const eMs = options.endDate ? new Date(options.endDate).getTime() : CAMPAIGN_END_MS;
    const sCount = options.startCount ?? CAMPAIGN_START_COUNT;
    const tCount = options.targetCount ?? CAMPAIGN_TARGET_COUNT;

    if (nowMs <= sMs) return { current: sCount, total: tCount, formatted: `${sCount.toLocaleString()}/${tCount.toLocaleString()}` };
    if (nowMs >= eMs) return { current: tCount, total: tCount, formatted: `${tCount.toLocaleString()}/${tCount.toLocaleString()}` };

    const progress = Math.min(1, Math.max(0, (nowMs - sMs) / (eMs - sMs)));
    const curvedProgress = 1 - Math.pow(1 - progress, 1.25);
    const count = Math.min(tCount, Math.max(sCount, Math.round(sCount + (tCount - sCount) * curvedProgress)));
    return {
      current: count,
      total: tCount,
      formatted: `${count.toLocaleString()}/${tCount.toLocaleString()}`,
    };
  }

  if (nowMs <= CAMPAIGN_START_MS) {
    return {
      current: CAMPAIGN_START_COUNT,
      total: CAMPAIGN_TARGET_COUNT,
      formatted: `${CAMPAIGN_START_COUNT.toLocaleString()}/${CAMPAIGN_TARGET_COUNT.toLocaleString()}`,
    };
  }

  if (nowMs >= CAMPAIGN_END_MS) {
    return {
      current: CAMPAIGN_TARGET_COUNT,
      total: CAMPAIGN_TARGET_COUNT,
      formatted: `${CAMPAIGN_TARGET_COUNT.toLocaleString()}/${CAMPAIGN_TARGET_COUNT.toLocaleString()}`,
    };
  }

  const counts = initCumulativeCounts();
  const intervalIndex = Math.floor((nowMs - CAMPAIGN_START_MS) / INTERVAL_MS);
  const clampedIndex = Math.min(TOTAL_INTERVALS, Math.max(0, intervalIndex));
  const currentCount = counts[clampedIndex];

  return {
    current: currentCount,
    total: CAMPAIGN_TARGET_COUNT,
    formatted: `${currentCount.toLocaleString()}/${CAMPAIGN_TARGET_COUNT.toLocaleString()}`,
  };
}

/**
 * Updates all DOM counter placeholders matching:
 * - [data-waitlist-counter]
 * - .skin-waitlist-counter
 * - #waitlist-counter
 */
export function syncWaitlistCounters(formattedString?: string): void {
  if (typeof document === "undefined") return;

  const value = formattedString || getSimulatedWaitlistCount().formatted;

  const elements = document.querySelectorAll<HTMLElement>(
    "[data-waitlist-counter], .skin-waitlist-counter"
  );

  elements.forEach((el) => {
    const valEl = el.querySelector<HTMLElement>(".skin-counter-val, strong");
    if (valEl) {
      valEl.textContent = value;
    } else if (el.classList.contains("skin-header-counter-pill")) {
      el.textContent = value;
    }
  });
}
