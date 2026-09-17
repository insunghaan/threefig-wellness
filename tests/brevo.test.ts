import { test } from "node:test";
import assert from "node:assert/strict";
import { sendWelcome, welcomeConfig } from "../lib/threefig/brevo.ts";

const config = { apiKey: "test-not-a-real-key", replyTo: "team@example.com" };
test("welcome dispatch stays disabled until flag, secret and valid reply address exist", () => {
  assert.equal(welcomeConfig({}), null);
  assert.equal(welcomeConfig({ THREEFIG_WELCOME_ENABLED: "true", BREVO_API_KEY: "key" }), null);
  assert.equal(welcomeConfig({ THREEFIG_WELCOME_ENABLED: "true", BREVO_API_KEY: "key", THREEFIG_MAIL_REPLY_TO: "bad\naddress" }), null);
  assert.deepEqual(welcomeConfig({ THREEFIG_WELCOME_ENABLED: "true", BREVO_API_KEY: config.apiKey,
    THREEFIG_MAIL_REPLY_TO: config.replyTo }), config);
});
test("welcome uses verified sender, explicit recipient and no personal data in landing link", async () => {
  let body!: { sender: { email: string }; to: { email: string }[]; replyTo: { email: string };
    headers: { idempotencyKey: string }; htmlContent: string };
  const fakeFetch: typeof fetch = async (url, init) => {
    assert.equal(url, "https://api.brevo.com/v3/smtp/email");
    body = JSON.parse(String(init?.body));
    return Response.json({ messageId: "test-id" }, { status: 201 });
  };
  assert.deepEqual(await sendWelcome("qa@example.com", "job-id", config, fakeFetch),
    { status: "accepted", messageId: "test-id" });
  assert.equal(body.sender.email, "welcome@3fig.io");
  assert.deepEqual(body.to, [{ email: "qa@example.com" }]);
  assert.equal(body.replyTo.email, config.replyTo);
  assert.equal(body.headers.idempotencyKey, "job-id");
  assert.match(body.htmlContent, /https:\/\/3fig.io\//);
  assert.doesNotMatch(body.htmlContent, /qa@example.com|30%|20%/);
});
test("accepted, known rejection, throttling and uncertain delivery remain distinct", async () => {
  for (const [code, expected] of [[429, "retry"], [401, "failed"], [400, "failed"], [500, "uncertain"]] as const) {
    assert.equal((await sendWelcome("qa@example.com", "id", config,
      async () => new Response("private provider details", { status: code }))).status, expected);
  }
  assert.deepEqual(await sendWelcome("qa@example.com", "id", config, async () => { throw new Error("timeout"); }),
    { status: "uncertain", reason: "network_or_timeout" });
  assert.equal((await sendWelcome("qa@example.com", "id", config, async () => Response.json({}))).status, "uncertain");
});
