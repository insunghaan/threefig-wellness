import { test } from "node:test";
import assert from "node:assert/strict";
import { isInternalUser } from "../lib/threefig/internal-policy.ts";

test("private app fails closed without a configured, authenticated account", () => {
  assert.equal(isInternalUser(null, "owner"), false);
  assert.equal(isInternalUser("owner"), false);
  assert.equal(isInternalUser("owner", " , "), false);
});

test("allowlist accepts only complete account IDs", () => {
  assert.equal(isInternalUser("owner", " owner, teammate "), true);
  assert.equal(isInternalUser("teammate", " owner, teammate "), true);
  assert.equal(isInternalUser("own", "owner"), false);
  assert.equal(isInternalUser("visitor", "owner"), false);
  assert.equal(isInternalUser("OWNER", "owner"), false);
});
