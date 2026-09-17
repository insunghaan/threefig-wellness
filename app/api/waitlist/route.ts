import {
  ApiError,
  boundedBody,
  checkWrite,
  failure,
  json,
} from "@/lib/threefig/records-server";
import { saveWaitlistSignup } from "@/lib/threefig/firestore-waitlist";
import { resolveGeoLocation } from "@/lib/threefig/geolocation";

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

    const clientTimezone =
      typeof body.client_timezone === "string" ? body.client_timezone : null;
    const clientLanguage =
      typeof body.client_language === "string" ? body.client_language : null;

    const geoLocation = await resolveGeoLocation(request, {
      timezone: clientTimezone,
      language: clientLanguage,
    });

    await saveWaitlistSignup(email, "landing", "2026-09-10", geoLocation);

    return json({ message: "You’re in. Welcome to the 3FIG launch list." }, 201);
  } catch (error) {
    return failure(error);
  }
}
