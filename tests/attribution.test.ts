import { test } from "node:test";
import assert from "node:assert/strict";
import { captureAttribution, sanitizeAttribution } from "../lib/threefig/attribution.ts";
const now = Date.parse("2026-09-18T09:00:00Z");
test("first campaign survives direct return; later campaign only updates last touch", () => {
 const a = captureAttribution("https://3fig.io/?utm_source=instagram&utm_medium=paid_social&utm_content=sleep_a#updates", "https://instagram.com/p/test", null, now);
 assert.equal(a.first_touch.utm_source, "instagram");
 assert.equal(a.first_touch.referrer_host, "instagram.com");
 const direct = captureAttribution("https://3fig.io/", "", a, now + 1000);
 assert.deepEqual(direct, a);
 const b = captureAttribution("https://3fig.io/?utm_source=brevo&utm_medium=email", "", a, now + 2000);
 assert.equal(b.first_touch.utm_source, "instagram");
 assert.equal(b.last_touch.utm_source, "brevo");
});
test("expiry resets history and malformed or personal parameters are discarded", () => {
 const a = captureAttribution("https://3fig.io/?utm_source=someone%40example.com&email=private&ad_id=123&unknown=x", "https://example.com/private?email=secret", null, now);
 assert.equal(a.first_touch.utm_source, undefined);
 assert.equal(a.first_touch.ad_id, "123");
 assert.equal(JSON.stringify(a).includes("secret"), false);
 assert.equal(sanitizeAttribution(a, now + 91*86400000), null);
 assert.equal(sanitizeAttribution({ first_touch: { captured_at: "invalid" } }, now), null);
 assert.equal(sanitizeAttribution(a, now - 120000), null);
 const b = captureAttribution("https://3fig.io/", "", a, now + 91*86400000);
 assert.equal(b.first_touch.ad_id, undefined);
});
test("self navigation preserves attribution and referrer queries never persist", () => {
 const a = captureAttribution("https://3fig.io/?utm_campaign=launch", "", null, now);
 assert.deepEqual(captureAttribution("https://3fig.io/", "https://3fig.io/?email=secret", a, now + 1000), a);
});
