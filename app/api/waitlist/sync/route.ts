import { env } from "cloudflare:workers";
import { ApiError, boundedBody, database, failure, json } from "@/lib/threefig/records-server";
import { acknowledgedEmails, hasWaitlistCredential } from "@/lib/threefig/waitlist-sync";

async function authorize(request: Request) {
  if (!await hasWaitlistCredential(request.headers.get("authorization"), env.THREEFIG_WAITLIST_SYNC_TOKEN))
    throw new ApiError(401, "Unauthorized.");
}

export async function GET(request: Request) {
  try {
    await authorize(request);
    const records = await database().prepare(
      "SELECT email, source, consent_version, created_at FROM waitlist_signups WHERE delivered_at IS NULL ORDER BY created_at, email LIMIT 25",
    ).all();
    return json({ records: records.results });
  } catch (error) { return failure(error); }
}

export async function POST(request: Request) {
  try {
    await authorize(request);
    let body: unknown;
    try { body = await (await boundedBody(request, 16384)).json(); }
    catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, "Invalid acknowledgement.");
    }
    const emails = acknowledgedEmails(body);
    if (!emails) throw new ApiError(400, "Invalid acknowledgement.");
    const result = await database().prepare(
      `UPDATE waitlist_signups SET delivered_at = ? WHERE delivered_at IS NULL AND email IN (${emails.map(() => "?").join(",")})`,
    ).bind(new Date().toISOString(), ...emails).run();
    return json({ acknowledged: result.meta.changes });
  } catch (error) { return failure(error); }
}
