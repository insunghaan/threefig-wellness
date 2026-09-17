export type GeoLocationData = {
  country_code: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  client_timezone: string | null;
  client_language: string | null;
};

const IPV4_PATTERN =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const IPV6_PATTERN =
  /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

function isValidIp(ip: string): boolean {
  return IPV4_PATTERN.test(ip) || IPV6_PATTERN.test(ip);
}

function isPrivateIp(ip: string): boolean {
  if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.")) return true;
  if (ip.startsWith("172.")) {
    const parts = ip.split(".");
    const second = parseInt(parts[1], 10);
    if (!Number.isNaN(second) && second >= 16 && second <= 31) return true;
  }
  return false;
}

/**
 * Extracts client IP from standard proxy and Cloud Run headers.
 * Used internally for server-side lookup; client IP itself is not persisted in geo_location.
 */
export function extractClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp && isValidIp(firstIp)) return firstIp;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp && isValidIp(realIp.trim())) return realIp.trim();

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp && isValidIp(cfIp.trim())) return cfIp.trim();

  return null;
}

/**
 * Resolves approximate geolocation data server-side with a strict timeout.
 * - Stores minimized fields only (country_code, country, region, city, timezone).
 * - Never stores latitude, longitude, or raw IP in the geo_location payload.
 * - Guaranteed never to throw, ensuring waitlist signup resilience.
 */
export async function resolveGeoLocation(
  request: Request,
  clientHint?: { timezone?: string | null; language?: string | null }
): Promise<GeoLocationData> {
  const clientIp = extractClientIp(request);
  const clientTimezone = clientHint?.timezone?.trim() || null;
  const clientLanguage =
    clientHint?.language?.trim() ||
    request.headers.get("accept-language")?.split(",")[0]?.trim() ||
    null;

  const fallbackGeo: GeoLocationData = {
    country_code: null,
    country: null,
    region: null,
    city: null,
    timezone: clientTimezone,
    client_timezone: clientTimezone,
    client_language: clientLanguage,
  };

  if (!clientIp || isPrivateIp(clientIp)) {
    return fallbackGeo;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    // Using IP-API (public DNS/IP endpoint, strictly server-side, no credentials needed)
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(clientIp)}?fields=status,message,country,countryCode,region,regionName,city,timezone`,
      {
        signal: controller.signal,
        headers: { "User-Agent": "3FIG-Waitlist-Geo/1.0" },
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) return fallbackGeo;

    const data = (await res.json()) as {
      status?: string;
      country?: string;
      countryCode?: string;
      region?: string;
      regionName?: string;
      city?: string;
      timezone?: string;
    };

    if (data && data.status === "success") {
      return {
        country_code: data.countryCode || null,
        country: data.country || null,
        region: data.regionName || data.region || null,
        city: data.city || null,
        timezone: data.timezone || clientTimezone,
        client_timezone: clientTimezone,
        client_language: clientLanguage,
      };
    }
  } catch {
    // Graceful fallback on timeout or network error - never block waitlist signup
  }

  return fallbackGeo;
}
