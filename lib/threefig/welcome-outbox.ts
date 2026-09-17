import { createHash, randomUUID } from "node:crypto";
import type { Firestore } from "@google-cloud/firestore";
import { sendWelcome, welcomeConfig } from "./brevo.ts";

export const OUTBOX = "threefig_welcome_outbox";
export function welcomeId(email: string) {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

export function newWelcomeJob(email: string) {
  return { email, status: "pending", next_attempt_at: Date.now(), attempts: 0,
    idempotency_key: randomUUID(), created_at: new Date().toISOString() };
}

/** Transactional claim prevents parallel requests from sending the same job twice. */
export async function dispatchWelcome(db: Firestore, id: string) {
  const config = welcomeConfig();
  if (!config) return "disabled";
  const now = Date.now();
  const ref = db.collection(OUTBOX).doc(id);
  const quota = db.collection("threefig_mail_quota").doc(new Date(now).toISOString().slice(0, 10));
  const claim = await db.runTransaction(async tx => {
    const snapshot = await tx.get(ref);
    const job = snapshot.data();
    if (!job || job.status !== "pending" || job.next_attempt_at > now) return null;
    const daily = await tx.get(quota);
    const attempts = Number(daily.data()?.attempts ?? 0);
    // Leave headroom below Brevo's 300/day account-wide cap; their quota is authoritative.
    if (attempts >= 280) return null;
    tx.set(quota, { attempts: attempts + 1 });
    tx.update(ref, { status: "sending", started_at: now, attempts: job.attempts + 1 });
    return job;
  });
  if (!claim) return "skipped";
  const result = await sendWelcome(claim.email, claim.idempotency_key, config);
  await ref.update(result.status === "accepted"
    ? { status: "accepted", accepted_at: new Date().toISOString(), message_id: result.messageId }
    : { status: result.status === "retry" ? "pending" : result.status,
      reason: result.reason, next_attempt_at: now + 60 * 60 * 1000 });
  // A crash after sending leaves 'sending', intentionally never auto-resubmitted.
  return result.status;
}

/** Protected worker endpoint can be scheduled; no historical signups are backfilled. */
export async function dispatchPendingWelcome(db: Firestore) {
  const jobs = await db.collection(OUTBOX).where("status", "==", "pending")
    .orderBy("next_attempt_at").limit(10).get();
  const counts: Record<string, number> = {};
  for (const job of jobs.docs) {
    const status = await dispatchWelcome(db, job.id);
    counts[status] = (counts[status] ?? 0) + 1;
  }
  return counts;
}
