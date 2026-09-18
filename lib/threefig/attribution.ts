export const CAMPAIGN_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id", "campaign_id", "adset_id", "ad_id"] as const;
export type Touch = { captured_at: string; landing_path: string; referrer_host: string } & Partial<Record<typeof CAMPAIGN_KEYS[number], string>>;
export type Attribution = { first_touch: Touch; last_touch: Touch };
export const ATTRIBUTION_KEY = "3fig-attribution-v1";
const MAX_AGE = 90 * 24 * 60 * 60 * 1000;
function token(value: unknown): string | undefined {
  return typeof value === "string" && /^[a-zA-Z0-9_.~-]{1,100}$/.test(value) ? value : undefined;
}
function cleanTouch(value: unknown, now: number): Touch | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const time = typeof row.captured_at === "string" ? Date.parse(row.captured_at) : NaN;
  if (!Number.isFinite(time) || time > now + 60000 || now - time > MAX_AGE) return null;
  const touch: Touch = { captured_at: new Date(time).toISOString(), landing_path: "/", referrer_host: "" };
  if (typeof row.referrer_host === "string" && /^[a-zA-Z0-9.-]{1,253}$/.test(row.referrer_host)) touch.referrer_host = row.referrer_host.toLowerCase();
  for (const key of CAMPAIGN_KEYS) { const v = token(row[key]); if (v) touch[key] = v; }
  return touch;
}
export function sanitizeAttribution(value: unknown, now = Date.now()): Attribution | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const first = cleanTouch(row.first_touch, now), last = cleanTouch(row.last_touch, now);
  return first && last && first.captured_at <= last.captured_at ? { first_touch: first, last_touch: last } : null;
}
export function captureAttribution(href: string, referrer: string, previous: unknown, now = Date.now()): Attribution {
  const url = new URL(href);
  let referrerHost = "";
  try { const ref = new URL(referrer); if (ref.hostname !== url.hostname && ref.hostname !== "www.3fig.io") referrerHost = ref.hostname; } catch {}
  const current: Touch = { captured_at: new Date(now).toISOString(), landing_path: "/", referrer_host: referrerHost };
  for (const key of CAMPAIGN_KEYS) { const value = token(url.searchParams.get(key)); if (value) current[key] = value; }
  const old = sanitizeAttribution(previous, now);
  if (!old) return { first_touch: current, last_touch: current };
  // Direct returns keep the last known campaign/referral; first touch expires after 90 days.
  return { first_touch: old.first_touch, last_touch: CAMPAIGN_KEYS.some(key => current[key]) || referrerHost ? current : old.last_touch };
}
export function readAttribution(): Attribution | null {
  try { return sanitizeAttribution(JSON.parse(localStorage.getItem(ATTRIBUTION_KEY) || "null")); } catch { return null; }
}
export function captureBrowserAttribution(): Attribution {
  const value = captureAttribution(window.location.href, document.referrer, readAttribution());
  try { localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(value)); } catch {}
  return value;
}
