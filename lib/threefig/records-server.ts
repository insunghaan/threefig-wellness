import { env } from "cloudflare:workers";
import { isInternalUser } from "./internal-policy";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function database() {
  if (!env.DB)
    throw new ApiError(
      503,
      "Records are temporarily unavailable. Your draft has not been lost.",
    );
  return env.DB;
}
export function photos() {
  if (!env.BUCKET)
    throw new ApiError(
      503,
      "Photo storage is temporarily unavailable. Please try again.",
    );
  return env.BUCKET;
}
export function userId(request: Request) {
  const id = request.headers.get("oai-authenticated-user-id");
  if (!id)
    throw new ApiError(401, "Sign in to save and view your private records.");
  if (!isInternalUser(id, env.THREEFIG_INTERNAL_USER_IDS))
    throw new ApiError(403, "This workspace is private.");
  return id;
}
export function checkWrite(request: Request) {
  const origin = request.headers.get("origin");
  if (
    (origin && origin !== new URL(request.url).origin) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new ApiError(
      403,
      "This request could not be verified. Reload and try again.",
    );
}
export const json = (data: unknown, status = 200) =>
  Response.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
export function failure(error: unknown) {
  if (error instanceof ApiError)
    return json({ error: error.message }, error.status);
  console.error(
    "[3FIG records] Storage operation failed",
    error instanceof Error ? error.name : "Unknown error",
  );
  return json(
    { error: "We couldn’t complete that request. Please try again." },
    503,
  );
}
export async function boundedBody(request: Request, max: number) {
  const declared = Number(request.headers.get("content-length"));
  if (declared > max) {
    await request.body?.cancel();
    throw new ApiError(413, "This file is too large. Choose a smaller photo.");
  }
  if (!request.body) throw new ApiError(400, "The request is empty.");
  const reader = request.body.getReader(),
    parts: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > max) {
      await reader.cancel();
      throw new ApiError(413, "This file is too large.");
    }
    parts.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const p of parts) {
    bytes.set(p, offset);
    offset += p.length;
  }
  return new Response(bytes, {
    headers: {
      "Content-Type": request.headers.get("content-type") || "application/json",
    },
  });
}
export function validId(id: unknown): id is string {
  return (
    typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id,
    )
  );
}
export function validDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    Date.parse(value) <= Date.now() + 86400000 &&
    Date.parse(value) >= Date.parse("2000-01-01")
  );
}
export function textField(value: unknown, max: number) {
  if (typeof value !== "string" || value.length > max)
    throw new ApiError(400, "Please shorten the note and try again.");
  return value;
}
export function photoKey(owner: string, id: string) {
  return `skin/${encodeURIComponent(owner)}/${id}.jpg`;
}
