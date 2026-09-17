import { test } from "node:test";
import assert from "node:assert/strict";
import { hasWaitlistCredential } from "../lib/threefig/mail-worker-auth.ts";

test("mail retry worker fails closed and accepts only its exact dedicated secret", async () => {
  const key = "a".repeat(64);
  assert.equal(await hasWaitlistCredential(null, key), false);
  assert.equal(await hasWaitlistCredential(`Bearer ${key}`), false);
  assert.equal(await hasWaitlistCredential(`Bearer ${key}`, "short"), false);
  assert.equal(await hasWaitlistCredential(`Bearer ${key}x`, key), false);
  assert.equal(await hasWaitlistCredential(`Bearer ${key}`, key), true);
});
