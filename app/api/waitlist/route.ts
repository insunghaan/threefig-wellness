import {
  ApiError,
  boundedBody,
  checkWrite,
  database,
  failure,
  json,
} from "@/lib/threefig/records-server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    checkWrite(request);

    let body: Record<string, unknown>;
    try {
      const parsed = await (await boundedBody(request, 2048)).json();
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Invalid body");
      }
      body = parsed as Record<string, unknown>;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, "Please check your email and try again.");
    }

    if (typeof body.company === "string" && body.company.trim()) {
      return json({ message: "You’re on the list." }, 201);
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
      throw new ApiError(400, "Enter a valid email address.");
    }

    await database()
      .prepare(
        "INSERT INTO waitlist_signups (email, source, consent_version, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(email) DO NOTHING",
      )
      .bind(email, "landing", "2026-09-10", new Date().toISOString())
      .run();

    return json({ message: "You’re in. Welcome to the 3FIG launch list." }, 201);
  } catch (error) {
    return failure(error);
  }
}
