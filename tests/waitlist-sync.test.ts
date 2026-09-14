import { test } from "node:test";
import assert from "node:assert/strict";
import { hasWaitlistCredential, acknowledgedEmails } from "../lib/threefig/waitlist-sync.ts";

test("waitlist export fails closed and accepts only its exact dedicated secret", async () => {
  const key = "a".repeat(64);
  assert.equal(await hasWaitlistCredential(null, key), false);
  assert.equal(await hasWaitlistCredential(`Bearer ${key}`), false);
  assert.equal(await hasWaitlistCredential(`Bearer ${key}`, "short"), false);
  assert.equal(await hasWaitlistCredential(`Bearer ${key}x`, key), false);
  assert.equal(await hasWaitlistCredential(`Bearer ${key}`, key), true);
});

test("acknowledgements are bounded, deduplicated, and reject malformed keys", () => {
  assert.deepEqual(acknowledgedEmails({ emails: ["a@example.com", "a@example.com"] }), ["a@example.com"]);
  for (const body of [null, {}, { emails: [] }, { emails: ["a@example.com\n"] },
    { emails: ["A@example.com"] }, { emails: [42] }, { emails: Array(26).fill("a@example.com") }])
    assert.equal(acknowledgedEmails(body), null);
});
