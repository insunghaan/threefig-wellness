/** A separate, read/ack-only credential for the waitlist Google automation. */
export async function hasWaitlistCredential(authorization: string | null, secret?: string) {
  if (!secret || secret.length < 32 || !authorization?.startsWith("Bearer ")) return false;
  const supplied = authorization.slice(7);
  if (supplied.length > 256) return false;
  const encode = new TextEncoder();
  const [a, b] = await Promise.all([supplied, secret].map(value =>
    crypto.subtle.digest("SHA-256", encode.encode(value)).then(bytes => new Uint8Array(bytes))));
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
  return difference === 0;
}

export function acknowledgedEmails(body: unknown): string[] | null {
  if (!body || typeof body !== "object" || !("emails" in body)) return null;
  const emails = body.emails;
  if (!Array.isArray(emails) || !emails.length || emails.length > 25) return null;
  if (!emails.every(email => typeof email === "string" && email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email === email.trim().toLowerCase())) return null;
  return [...new Set(emails)];
}
