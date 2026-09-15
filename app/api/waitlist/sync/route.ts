import { ApiError, boundedBody, failure, json } from "@/lib/threefig/records-server";
import { acknowledgedEmails, hasWaitlistCredential } from "@/lib/threefig/waitlist-sync";
import { getUndeliveredWaitlist, markWaitlistDelivered } from "@/lib/threefig/firestore-waitlist";

async function authorize(request: Request) {
  if (!await hasWaitlistCredential(request.headers.get("authorization"), process.env.THREEFIG_WAITLIST_SYNC_TOKEN))
    throw new ApiError(401, "Unauthorized.");
}

export async function GET(request: Request) {
  try {
    await authorize(request);
    const records = await getUndeliveredWaitlist(25);
    return json({ records });
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
    const acknowledged = await markWaitlistDelivered(emails, new Date().toISOString());
    return json({ acknowledged });
  } catch (error) { return failure(error); }
}
