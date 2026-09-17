import { test } from "node:test";
import assert from "node:assert/strict";
import type { Firestore } from "@google-cloud/firestore";
import { dispatchWelcome, newWelcomeJob, welcomeId, OUTBOX } from "../lib/threefig/welcome-outbox.ts";

type Row = Record<string, unknown>;
function fakeDatabase(initial: Record<string, Row>) {
  const rows = new Map(Object.entries(initial));
  type Ref = { key: string; update: (value: Row) => Promise<void> };
  let lock = Promise.resolve();
  const db = {
    collection: (name: string) => ({ doc: (id: string): Ref => ({ key: `${name}/${id}`,
      update: async value => { rows.set(`${name}/${id}`, { ...rows.get(`${name}/${id}`), ...value }); } }) }),
    runTransaction: async (callback: (tx: {
      get: (ref: Ref) => Promise<{ data: () => Row | undefined }>;
      set: (ref: Ref, data: Row) => void;
      update: (ref: Ref, data: Row) => void;
    }) => Promise<unknown>) => {
      const previous = lock;
      let release!: () => void;
      lock = new Promise<void>(resolve => { release = resolve; });
      await previous;
      try { return await callback({
        get: async ref => ({ data: () => rows.get(ref.key) }),
        set: (ref, data) => { rows.set(ref.key, data); },
        update: (ref, data) => { rows.set(ref.key, { ...rows.get(ref.key), ...data }); },
      }); } finally { release(); }
    },
  };
  return { db: db as unknown as Firestore, rows };
}

test("concurrent delivery claims, quotas and ambiguous outcomes", async t => {
  const previous = { ...process.env };
  const originalFetch = globalThis.fetch;
  process.env.THREEFIG_WELCOME_ENABLED = "true";
  process.env.BREVO_API_KEY = "test-key";
  process.env.THREEFIG_MAIL_REPLY_TO = "reply@example.com";
  t.after(() => { process.env = previous; globalThis.fetch = originalFetch; });
  const email = "qa@example.com";
  const id = welcomeId(email);
  const key = `${OUTBOX}/${id}`;
  assert.equal(id, welcomeId(" QA@EXAMPLE.COM "));

  await t.test("two concurrent attempts send only one request; accepted jobs never resend", async () => {
    const { db, rows } = fakeDatabase({ [key]: newWelcomeJob(email) });
    let calls = 0;
    globalThis.fetch = async () => { calls++; return Response.json({ messageId: "test" }); };
    const statuses = await Promise.all([dispatchWelcome(db, id), dispatchWelcome(db, id)]);
    assert.deepEqual(statuses.sort(), ["accepted", "skipped"]);
    assert.equal(calls, 1);
    assert.equal(rows.get(key)?.status, "accepted");
    assert.equal(await dispatchWelcome(db, id), "skipped");
    assert.equal(calls, 1);
  });
  await t.test("daily cap leaves job pending without contacting provider", async () => {
    const quota = `threefig_mail_quota/${new Date().toISOString().slice(0, 10)}`;
    const { db, rows } = fakeDatabase({ [key]: newWelcomeJob(email), [quota]: { attempts: 280 } });
    globalThis.fetch = async () => { throw new Error("should not call"); };
    assert.equal(await dispatchWelcome(db, id), "skipped");
    assert.equal(rows.get(key)?.status, "pending");
  });
  await t.test("429 waits before retry; network uncertainty does not auto-resend", async () => {
    const { db, rows } = fakeDatabase({ [key]: newWelcomeJob(email) });
    globalThis.fetch = async () => new Response(null, { status: 429 });
    assert.equal(await dispatchWelcome(db, id), "retry");
    assert.equal(await dispatchWelcome(db, id), "skipped");
    rows.set(key, newWelcomeJob(email));
    globalThis.fetch = async () => { throw new Error("lost response"); };
    assert.equal(await dispatchWelcome(db, id), "uncertain");
    assert.equal(await dispatchWelcome(db, id), "skipped");
  });
});
