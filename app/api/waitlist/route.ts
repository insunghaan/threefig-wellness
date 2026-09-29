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

function extractUtmCampaign(attribution: unknown, body: Record<string, unknown>): string | null {
  if (attribution && typeof attribution === "object") {
    const attr = attribution as Record<string, unknown>;
    const lastTouch = attr.last_touch && typeof attr.last_touch === "object" ? (attr.last_touch as Record<string, unknown>) : null;
    if (typeof lastTouch?.utm_campaign === "string" && lastTouch.utm_campaign.trim()) {
      return lastTouch.utm_campaign.trim();
    }
    const firstTouch = attr.first_touch && typeof attr.first_touch === "object" ? (attr.first_touch as Record<string, unknown>) : null;
    if (typeof firstTouch?.utm_campaign === "string" && firstTouch.utm_campaign.trim()) {
      return firstTouch.utm_campaign.trim();
    }
    if (typeof attr.utm_campaign === "string" && attr.utm_campaign.trim()) {
      return attr.utm_campaign.trim();
    }
    if (typeof attr.campaign === "string" && attr.campaign.trim()) {
      return attr.campaign.trim();
    }
  }

  if (body.attribution && typeof body.attribution === "object" && body.attribution !== attribution) {
    const rawAttr = body.attribution as Record<string, unknown>;
    const rawLast = rawAttr.last_touch && typeof rawAttr.last_touch === "object" ? (rawAttr.last_touch as Record<string, unknown>) : null;
    if (typeof rawLast?.utm_campaign === "string" && rawLast.utm_campaign.trim()) {
      return rawLast.utm_campaign.trim();
    }
    const rawFirst = rawAttr.first_touch && typeof rawAttr.first_touch === "object" ? (rawAttr.first_touch as Record<string, unknown>) : null;
    if (typeof rawFirst?.utm_campaign === "string" && rawFirst.utm_campaign.trim()) {
      return rawFirst.utm_campaign.trim();
    }
    if (typeof rawAttr.utm_campaign === "string" && rawAttr.utm_campaign.trim()) {
      return rawAttr.utm_campaign.trim();
    }
    if (typeof rawAttr.campaign === "string" && rawAttr.campaign.trim()) {
      return rawAttr.campaign.trim();
    }
  }

  if (typeof body.utm_campaign === "string" && body.utm_campaign.trim()) {
    return body.utm_campaign.trim();
  }

  return null;
}

function extractUtmSource(attribution: unknown, body: Record<string, unknown>): string | null {
  if (attribution && typeof attribution === "object") {
    const attr = attribution as Record<string, unknown>;
    const lastTouch = attr.last_touch && typeof attr.last_touch === "object" ? (attr.last_touch as Record<string, unknown>) : null;
    if (typeof lastTouch?.utm_source === "string" && lastTouch.utm_source.trim()) {
      return lastTouch.utm_source.trim();
    }
    const firstTouch = attr.first_touch && typeof attr.first_touch === "object" ? (attr.first_touch as Record<string, unknown>) : null;
    if (typeof firstTouch?.utm_source === "string" && firstTouch.utm_source.trim()) {
      return firstTouch.utm_source.trim();
    }
    if (typeof attr.utm_source === "string" && attr.utm_source.trim()) {
      return attr.utm_source.trim();
    }
  }

  if (body.attribution && typeof body.attribution === "object" && body.attribution !== attribution) {
    const rawAttr = body.attribution as Record<string, unknown>;
    const rawLast = rawAttr.last_touch && typeof rawAttr.last_touch === "object" ? (rawAttr.last_touch as Record<string, unknown>) : null;
    if (typeof rawLast?.utm_source === "string" && rawLast.utm_source.trim()) {
      return rawLast.utm_source.trim();
    }
    const rawFirst = rawAttr.first_touch && typeof rawAttr.first_touch === "object" ? (rawAttr.first_touch as Record<string, unknown>) : null;
    if (typeof rawFirst?.utm_source === "string" && rawFirst.utm_source.trim()) {
      return rawFirst.utm_source.trim();
    }
    if (typeof rawAttr.utm_source === "string" && rawAttr.utm_source.trim()) {
      return rawAttr.utm_source.trim();
    }
  }

  if (typeof body.utm_source === "string" && body.utm_source.trim()) {
    return body.utm_source.trim();
  }

  return null;
}

function resolveSignupSource(
  attribution: unknown,
  body: Record<string, unknown>,
  isSurvey: boolean
): string {
  const campaign = extractUtmCampaign(attribution, body);
  if (campaign) {
    return campaign;
  }

  const utmSource = extractUtmSource(attribution, body);
  if (utmSource) {
    return utmSource;
  }

  if (typeof body.source === "string" && body.source.trim()) {
    return body.source.trim();
  }

  return isSurvey ? "landing-survey" : "landing";
}

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
          ...(typeof surveyRaw.gender === "string" && surveyRaw.gender.trim()
            ? { gender: surveyRaw.gender.trim().slice(0, 50) }
            : {}),
          ...(typeof surveyRaw.age === "string" && surveyRaw.age.trim()
            ? { age: surveyRaw.age.trim().slice(0, 50) }
            : {}),
          ...(typeof surveyRaw.intended_user === "string" && surveyRaw.intended_user.trim()
            ? { intended_user: surveyRaw.intended_user.trim().slice(0, 50) }
            : {}),
          ...(typeof surveyRaw.primary_feature === "string" && surveyRaw.primary_feature.trim()
            ? { primary_feature: surveyRaw.primary_feature.trim().slice(0, 100) }
            : {}),
          ...(typeof surveyRaw.subscription_preference === "string" && surveyRaw.subscription_preference.trim()
            ? { subscription_preference: surveyRaw.subscription_preference.trim().slice(0, 200) }
            : {}),
        }
      : null;

    const createdAt = new Date().toISOString();
    const sanitizedAttribution = sanitizeAttribution(body.attribution);
    const source = resolveSignupSource(sanitizedAttribution, body, Boolean(survey));

    const result = await saveWaitlistSignup(
      email,
      source,
      "2026-09-10",
      geoLocation,
      sanitizedAttribution,
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
          source,
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
