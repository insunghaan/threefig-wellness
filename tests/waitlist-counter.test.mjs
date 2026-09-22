import test from "node:test";
import assert from "node:assert/strict";
import {
  getSimulatedWaitlistCount,
  CAMPAIGN_START_MS,
  CAMPAIGN_END_MS,
  CAMPAIGN_START_COUNT,
  CAMPAIGN_TARGET_COUNT,
} from "../lib/threefig/waitlist-counter.ts";

test("waitlist counter matches boundary conditions", () => {
  // At or before start
  const beforeStart = getSimulatedWaitlistCount({ nowMs: CAMPAIGN_START_MS - 10000 });
  assert.equal(beforeStart.current, 27);
  assert.equal(beforeStart.total, 3000);
  assert.equal(beforeStart.formatted, "27/3,000");

  const atStart = getSimulatedWaitlistCount({ nowMs: CAMPAIGN_START_MS });
  assert.equal(atStart.current, 27);

  // At or after end
  const atEnd = getSimulatedWaitlistCount({ nowMs: CAMPAIGN_END_MS });
  assert.equal(atEnd.current, 3000);
  assert.equal(atEnd.formatted, "3,000/3,000");

  const afterEnd = getSimulatedWaitlistCount({ nowMs: CAMPAIGN_END_MS + 86400000 });
  assert.equal(afterEnd.current, 3000);
});

test("waitlist counter is strictly monotonic non-decreasing over campaign duration", () => {
  let prev = 27;
  // Test every 1 minute over the entire 6,620 minutes
  const totalMinutes = Math.floor((CAMPAIGN_END_MS - CAMPAIGN_START_MS) / 60000);
  let zeroDeltas = 0;
  let nonZeroDeltas = 0;

  for (let m = 0; m <= totalMinutes; m += 1) {
    const time = CAMPAIGN_START_MS + m * 60000;
    const { current } = getSimulatedWaitlistCount({ nowMs: time });
    assert.ok(current >= prev, `Counter decreased from ${prev} to ${current} at minute ${m}`);
    if (m > 0) {
      if (current === prev) zeroDeltas++;
      else nonZeroDeltas++;
    }
    prev = current;
  }

  assert.equal(prev, 3000);
  // Irregularity: both zero deltas and non-zero deltas should exist
  assert.ok(zeroDeltas > 1000, `Expected many minutes with no changes (+0), got ${zeroDeltas}`);
  assert.ok(nonZeroDeltas > 1000, `Expected many minutes with changes (+1 or +2), got ${nonZeroDeltas}`);
});
