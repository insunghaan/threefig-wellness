export type WelcomeConfig = { apiKey: string; replyTo: string };
export type SendResult =
  | { status: "accepted"; messageId: string }
  | { status: "retry"; reason: string }
  | { status: "failed" | "uncertain"; reason: string };

export function welcomeConfig(env = process.env): WelcomeConfig | null {
  if (env.THREEFIG_WELCOME_ENABLED !== "true") return null;
  const apiKey = env.BREVO_API_KEY?.trim();
  const replyTo = env.THREEFIG_MAIL_REPLY_TO?.trim();
  if (!apiKey || !replyTo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo)) return null;
  return { apiKey, replyTo };
}

export const welcomeSubject = "You're on the list. Welcome to 3FIG.";
const siteUrl = "https://3fig.io/?utm_source=brevo&utm_medium=email&utm_campaign=waitlist_welcome";
export const welcomeText = `You're on the list.\n\nYour request to join the 3FIG waitlist has been received. Thank you for joining us.\n\nThere is nothing else you need to do right now.\n\nVisit 3FIG: ${siteUrl}\n\nYou received this confirmation because this email address was used to join the 3FIG waitlist. If this wasn't you, or you would like to leave the list, reply to this email and let us know.`;
export const welcomeHtml = `<!doctype html><html lang="en"><body style="margin:0;background:#f8f7f8;color:#302b34;font-family:Arial,sans-serif"><table role="presentation" width="100%"><tr><td align="center" style="padding:40px 16px"><table role="presentation" width="600" style="max-width:600px;width:100%"><tr><td style="padding:24px;font-size:30px;text-align:center">3FIG</td></tr><tr><td style="background:#65446f;color:white;border-radius:24px;padding:40px 28px;text-align:center"><h1 style="font-family:Georgia,serif;font-weight:400">You're on the list.</h1><p style="line-height:1.8">Your request to join the 3FIG waitlist has been received.<br>Thank you for joining us.</p><p style="line-height:1.8">There is nothing else you need to do right now.</p><a href="${siteUrl.replaceAll("&", "&amp;")}" style="display:inline-block;margin-top:20px;padding:14px 24px;background:#f8f1f7;color:#44384b;border-radius:24px;text-decoration:none">Visit 3FIG</a></td></tr><tr><td style="padding:24px;font-size:12px;line-height:1.8;text-align:center">You received this confirmation because this email address was used to join the 3FIG waitlist. If this wasn't you, or you would like to leave the list, reply to this email and let us know.</td></tr></table></td></tr></table></body></html>`;

/** API acceptance is not inbox delivery. Ambiguous outcomes require reconciliation. */
export async function sendWelcome(
  email: string, idempotencyKey: string, config: WelcomeConfig, fetcher: typeof fetch = fetch,
): Promise<SendResult> {
  let response: Response;
  try {
    response = await fetcher("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": config.apiKey, "Content-Type": "application/json", Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        sender: { name: "3FIG", email: "welcome@3fig.io" },
        to: [{ email }], replyTo: { email: config.replyTo, name: "3FIG" },
        subject: welcomeSubject, htmlContent: welcomeHtml, textContent: welcomeText,
        headers: { idempotencyKey }, tags: ["waitlist-welcome-v1"],
      }),
    });
  } catch { return { status: "uncertain", reason: "network_or_timeout" }; }
  if (response.status === 429) return { status: "retry", reason: "rate_limit" };
  // Never log Brevo bodies: they can contain email addresses or account information.
  if (!response.ok) return {
    status: response.status >= 500 ? "uncertain" : "failed", reason: `http_${response.status}`,
  };
  try {
    const body = await response.json();
    if (typeof body.messageId === "string" && body.messageId)
      return { status: "accepted", messageId: body.messageId };
  } catch { /* Brevo may have accepted the message even if parsing failed. */ }
  return { status: "uncertain", reason: "missing_message_id" };
}
