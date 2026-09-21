import type { GeoLocationData } from "./geolocation";

export type SlackWaitlistNotificationParams = {
  email: string;
  source: string;
  createdAt: string;
  geoLocation?: GeoLocationData | null;
  survey?: {
    gender?: string;
    age?: string;
    intended_user?: string;
    primary_feature?: string;
    subscription_preference?: string;
  } | null;
};

/**
 * Formats a location string from available geolocation components.
 * e.g. "Ashburn, Virginia, United States" or "United States" or "Unknown"
 */
function formatLocation(geo?: GeoLocationData | null): string {
  if (!geo) return "Unknown";
  const parts: string[] = [];
  if (geo.city) parts.push(geo.city);
  if (geo.region) parts.push(geo.region);
  if (geo.country) parts.push(geo.country);
  else if (geo.country_code) parts.push(geo.country_code);

  return parts.length > 0 ? parts.join(", ") : "Unknown";
}

/**
 * Sends a Slack notification via Incoming Webhook when a new waitlist signup occurs.
 *
 * Requirements:
 * - Reads webhook URL strictly from process.env.SLACK_WAITLIST_WEBHOOK_URL
 * - Guaranteed never to throw or block waitlist signups
 * - Enforces a strict 2.5-second timeout
 */
export async function sendSlackWaitlistNotification(
  params: SlackWaitlistNotificationParams
): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WAITLIST_WEBHOOK_URL?.trim();

  if (!webhookUrl) {
    // Webhook not configured in current environment; graceful no-op
    return false;
  }

  const locationStr = formatLocation(params.geoLocation);
  const tzStr =
    params.geoLocation?.timezone ||
    params.geoLocation?.client_timezone ||
    "Unknown";

  const lines = [
    "*[3FIG] New Waitlist Signup*",
    `• *Email:* \`${params.email}\``,
    `• *Location:* ${locationStr}`,
    `• *Timezone:* ${tzStr}`,
    `• *Source:* ${params.source}`,
    `• *Signed up:* ${params.createdAt}`,
  ];

  if (params.survey) {
    lines.push(
      "• *Survey Responses:*",
      `  - *Gender:* ${params.survey.gender || "Not answered"}`,
      `  - *Age:* ${params.survey.age || "Not answered"}`,
      `  - *User:* ${params.survey.intended_user || "Not answered"}`,
      `  - *Key Feature:* ${params.survey.primary_feature || "Not answered"}`,
      `  - *Budget:* ${params.survey.subscription_preference || "Not answered"}`
    );
  }

  lines.push(`• *Environment:* 3FIG (Production)`);
  const messageText = lines.join("\n");

  const payload = {
    text: `New 3FIG Waitlist Signup: ${params.email} (${locationStr})`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "✨ New 3FIG Waitlist Signup",
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: messageText,
        },
      },
    ],
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(
        `[3FIG Slack Notification] Webhook returned HTTP ${res.status}: ${res.statusText}`
      );
      return false;
    }

    return true;
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.warn(`[3FIG Slack Notification] Failed to deliver Slack message: ${errMsg}`);
    return false;
  }
}
