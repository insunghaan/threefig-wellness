import { ApiError, failure, json } from "@/lib/threefig/records-server";
import { getFirestoreInstance } from "@/lib/threefig/firestore-waitlist";
import { hasWaitlistCredential } from "@/lib/threefig/mail-worker-auth";
import { dispatchPendingWelcome } from "@/lib/threefig/welcome-outbox";

export async function POST(request: Request) {
  try {
    if (!await hasWaitlistCredential(request.headers.get("authorization"), process.env.THREEFIG_MAIL_WORKER_TOKEN))
      throw new ApiError(401, "Unauthorized.");
    const db = getFirestoreInstance();
    if (!db) throw new ApiError(503, "Storage unavailable.");
    return json({ results: await dispatchPendingWelcome(db) });
  } catch (error) { return failure(error); }
}
