import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
// Run only against a locally built Worker with the migration applied.
const base = process.env.THREEFIG_TEST_URL || "http://127.0.0.1:4173";
if (!["127.0.0.1", "localhost"].includes(new URL(base).hostname))
  throw new Error("Use a local Worker only.");
const headers = (user = "threefig-qa-alpha") => ({
  "oai-authenticated-user-id": user,
});
const get = (path, user) => fetch(base + path, { headers: headers(user) });
const post = async (path, body, extra = {}) => {
  const send = () =>
    fetch(base + path, {
      method: "POST",
      headers: { ...headers(), "Content-Type": "application/json", ...extra },
      body: JSON.stringify(body),
    });
  const response = await send();
  // Wrangler's local proxy may close its upstream connection after rejecting an
  // unread oversized body. Retry only its explicit Retry-After: 0 response,
  // preserving the original idempotency key; application errors are not retried.
  if (response.status === 503 && response.headers.get("retry-after") === "0") {
    await response.text();
    return send();
  }
  return response;
};
const remove = (path, user) =>
  fetch(base + path, { method: "DELETE", headers: headers(user) });

test("Records require identity, validate input, isolate users and survive a new request", async () => {
  assert.equal((await fetch(base + "/api/records?metric=energy")).status, 401);
  assert.equal((await fetch(base + "/api/skin")).status, 401);
  const id = crypto.randomUUID(),
    record = {
      id,
      metricId: "energy",
      value: 4,
      observedAt: new Date().toISOString(),
      note: "Synthetic integration test",
    };
  try {
    assert.equal(
      (
        await post("/api/records", record, {
          Origin: "https://outside.example",
        })
      ).status,
      403,
    );
    assert.equal(
      (await post("/api/records", { ...record, value: 99 })).status,
      400,
    );
    assert.equal(
      (await post("/api/records", { ...record, metricId: "hrv" })).status,
      400,
    );
    assert.equal(
      (await post("/api/records", { ...record, note: "x".repeat(10000) }))
        .status,
      413,
    );
    {
      const response = await post("/api/records", record);
      assert.equal(response.status, 201, await response.text());
    }
    {
      const response = await post("/api/records", record);
      assert.equal(response.status, 201, await response.text());
    }
    const own = await (await get("/api/records?metric=energy")).json();
    assert.equal(own.records.filter((r) => r.id === id).length, 1);
    assert.equal(own.records.find((r) => r.id === id).value, 4);
    assert.equal(
      (
        await (
          await get("/api/records?metric=energy", "threefig-qa-beta")
        ).json()
      ).records.some((r) => r.id === id),
      false,
    );
    await remove("/api/records/" + id, "threefig-qa-beta");
    assert.equal(
      (await (await get("/api/records?metric=energy")).json()).records.some(
        (r) => r.id === id,
      ),
      true,
    );
  } finally {
    assert.equal((await remove("/api/records/" + id)).status, 200);
  }
  assert.equal(
    (await (await get("/api/records?metric=energy")).json()).records.some(
      (r) => r.id === id,
    ),
    false,
  );
});

test("Private photo storage, duplicate save, owner-only reads and deletion", async () => {
  const fixture = process.env.THREEFIG_TEST_JPEG;
  assert.ok(fixture, "Set THREEFIG_TEST_JPEG to a synthetic JPEG fixture.");
  const bytes = await readFile(fixture),
    id = crypto.randomUUID();
  const record = {
    id,
    observedAt: new Date().toISOString(),
    area: "Left cheek",
    routine: "Before skincare",
    feeling: "3",
    note: "Synthetic integration test",
    analysis: {
      method: "photo-pixels-v1",
      colorVariation: 10,
      surfaceContrast: 2,
      brightness: 120,
      clippedFraction: 0,
      quality: "usable",
      width: 256,
      height: 256,
    },
  };
  const upload = async () => {
    const form = new FormData();
    form.append("record", JSON.stringify(record));
    form.append("photo", new Blob([bytes], { type: "image/jpeg" }), "test.jpg");
    return fetch(base + "/api/skin", {
      method: "POST",
      headers: headers(),
      body: form,
    });
  };
  try {
    assert.equal((await upload()).status, 201);
    assert.equal((await upload()).status, 200);
    const own = await (await get("/api/skin")).json();
    assert.equal(own.records.filter((r) => r.id === id).length, 1);
    const photo = await get("/api/skin/" + id + "/photo");
    assert.equal(photo.status, 200);
    assert.match(photo.headers.get("cache-control"), /private/);
    assert.deepEqual(
      new Uint8Array(await photo.arrayBuffer()),
      new Uint8Array(bytes),
    );
    assert.equal(
      (await fetch(base + "/api/skin/" + id + "/photo")).status,
      401,
    );
    assert.equal(
      (await get("/api/skin/" + id + "/photo", "threefig-qa-beta")).status,
      404,
    );
    assert.equal(
      (await (await get("/api/skin", "threefig-qa-beta")).json()).records.some(
        (r) => r.id === id,
      ),
      false,
    );
    await remove("/api/skin/" + id, "threefig-qa-beta");
    assert.equal((await get("/api/skin/" + id + "/photo")).status, 200);
  } finally {
    assert.equal((await remove("/api/skin/" + id)).status, 200);
  }
  assert.equal((await get("/api/skin/" + id + "/photo")).status, 404);
  assert.equal(
    (await (await get("/api/skin")).json()).records.some((r) => r.id === id),
    false,
  );
});
