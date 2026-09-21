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

    const surveyRaw =
      body.survey && typeof body.survey === "object" && !Array.isArray(body.survey)
        ? (body.survey as Record<string, unknown>)
        : null;

    const survey = surveyRaw
      ? {
          gender: typeof surveyRaw.gender === "string" ? surveyRaw.gender.slice(0, 50) : undefined,
          age: typeof surveyRaw.age === "string" ? surveyRaw.age.slice(0, 50) : undefined,
          intended_user: typeof surveyRaw.intended_user === "string" ? surveyRaw.intended_user.slice(0, 50) : undefined,
          primary_feature: typeof surveyRaw.primary_feature === "string" ? surveyRaw.primary_feature.slice(0, 100) : undefined,
          subscription_preference: typeof surveyRaw.subscription_preference === "string" ? surveyRaw.subscription_preference.slice(0, 200) : undefined,
        }
      : null;

    const createdAt = new Date().toISOString();
    const result = await saveWaitlistSignup(
      email,
      "landing",
      "2026-09-10",
      geoLocation,
      sanitizeAttribution(body.attribution),
      survey
    );

    // Notify Slack for signups or survey submissions; never block user signup
    if (!result.alreadyExisted || survey) {
      // Await the initial attempt: Cloud Run can suspend work after responding.
      // The durable outbox survives failure; signup still succeeds once saved.
      const db = getFirestoreInstance();
      if (!result.alreadyExisted && db && process.env.THREEFIG_WELCOME_ENABLED === "true") {
        try { await dispatchWelcome(db, welcomeId(email)); }
        catch { console.warn("[3FIG Welcome] Dispatch failed; inspect outbox status."); }
      }
      try {
        await sendSlackWaitlistNotification({
          email,
          source: survey ? "landing-survey" : "landing",
          createdAt,
          geoLocation,
          survey,
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
