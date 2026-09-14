export * as schema from "./schema";

export function getDb() {
  console.warn("[3FIG DB] Cloudflare D1 is unavailable in standard Node.js / Cloud Run environment.");
  return null;
}


