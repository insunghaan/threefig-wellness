import {
  ApiError,
  boundedBody,
  checkWrite,
  failure,
  json,
} from "@/lib/threefig/records-server";
import { getFirestoreInstance, saveWaitlistSignup } from "@/lib/threefig/firestore-waitlist";
import { dispatchWelcome, welcomeId } from "@/lib/threefig/welcome-outbox";
import { resolveGeoLocation } from "@/lib/threefig/geolocation";
import { sendSlackWaitlistNotification } from "@/lib/threefig/slack-notification";

import { sanitizeAttribution } from "@/lib/threefig/attribution";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    checkWrite(request);

    let body: Record<string, unknown>;
    try {
      const parsed = await (await boundedBody(request, 8192)).json();
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Invalid body");
      }
      body = parsed as Record<string, unknown>;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, "Please check your email and try again.");
    }

    if (typeof body.company === "string" && body.company.trim()) {
      return json({ message: "You’re on the list.", created: false }, 201);
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

    const createdAt = new Date().toISOString();
    const result = await saveWaitlistSignup(email, "landing", "2026-09-10", geoLocation, sanitizeAttribution(body.attribution));

    // Only notify Slack for genuinely new signups; never block user signup
    if (!result.alreadyExisted) {
      // Await the initial attempt: Cloud Run can suspend work after responding.
      // The durable outbox survives failure; signup still succeeds once saved.
      const db = getFirestoreInstance();
      if (db && process.env.THREEFIG_WELCOME_ENABLED === "true") {
        try { await dispatchWelcome(db, welcomeId(email)); }
        catch { console.warn("[3FIG Welcome] Dispatch failed; inspect outbox status."); }
      }
      try {
        await sendSlackWaitlistNotification({
          email,
          source: "landing",
          createdAt,
          geoLocation,
        });
      } catch (slackErr) {
        console.warn("[3FIG Waitlist] Non-blocking Slack notification error:", slackErr);
      }
    }

    return json({ message: "You’re in. Welcome to the 3FIG launch list.", created: !result.alreadyExisted }, 201);
  } catch (error) {
    return failure(error);
  }
}
