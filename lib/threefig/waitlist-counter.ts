/**
 * 3FIG Waitlist Counter Utility
 *
 * Provides helper functions to calculate simulated founding member progress
 * and synchronize DOM counter placeholders across the page.
 */

export interface WaitlistCounterOptions {
  startDate?: string | Date; // Launch or campaign start date (ISO string or Date)
  durationDays?: number; // Total duration to reach target (default: 7)
  startCount?: number; // Initial count on day 0 (default: 27)
  targetCount?: number; // Final target count (default: 3000)
}

/**
 * Calculates current waitlist count based on elapsed time over durationDays.
 * Uses an organic growth curve (ease-out curve) with deterministic monotonic progression.
 */
export function getSimulatedWaitlistCount(options: WaitlistCounterOptions = {}): {
  current: number;
  total: number;
  formatted: string;
} {
  const {
    startDate = "2026-09-22T00:00:00Z",
    durationDays = 7,
    startCount = 27,
    targetCount = 3000,
  } = options;

  const startMs = new Date(startDate).getTime();
  const nowMs = Date.now();
  const totalMs = durationDays * 24 * 60 * 60 * 1000;
  const elapsedMs = Math.max(0, nowMs - startMs);

  const progress = Math.min(1, elapsedMs / totalMs);

  // Organic ease-out growth curve:
  const curvedProgress = 1 - Math.pow(1 - progress, 1.35);

  const rawCount = Math.floor(
    startCount + (targetCount - startCount) * curvedProgress
  );

  const clampedCount = Math.min(targetCount, Math.max(startCount, rawCount));

  return {
    current: clampedCount,
    total: targetCount,
    formatted: `${clampedCount.toLocaleString()}/${targetCount.toLocaleString()}`,
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
