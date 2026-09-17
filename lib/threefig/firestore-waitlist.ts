import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import type { GeoLocationData } from "./geolocation";
import type { Firestore } from "@google-cloud/firestore";
import { newWelcomeJob, OUTBOX, welcomeId } from "./welcome-outbox";

const require = createRequire(import.meta.url);

export type WaitlistRecord = {
  email: string;
  source: string;
  consent_version: string;
  created_at: string;
  delivered_at: string | null;
  geo_location?: GeoLocationData | null;
};

export type SaveWaitlistResult = {
  success: boolean;
  storage: "firestore" | "local-persistent";
  alreadyExisted: boolean;
};

const FALLBACK_DIR = path.join(process.cwd(), "data");
const FALLBACK_FILE = path.join(FALLBACK_DIR, "waitlist_signups.json");

// In-memory cache synced with persistent disk fallback
let localCache: Map<string, WaitlistRecord> | null = null;

function ensureFallbackLoaded(): Map<string, WaitlistRecord> {
  if (localCache) return localCache;
  localCache = new Map<string, WaitlistRecord>();
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const data = fs.readFileSync(FALLBACK_FILE, "utf-8");
      const list = JSON.parse(data) as WaitlistRecord[];
      for (const item of list) {
        if (item && item.email) {
          localCache.set(item.email.toLowerCase(), item);
        }
      }
    }
  } catch (err) {
    console.error("[3FIG Waitlist] Failed reading fallback waitlist file:", err);
  }
  return localCache;
}

function persistFallback(map: Map<string, WaitlistRecord>) {
  try {
    if (!fs.existsSync(FALLBACK_DIR)) {
      fs.mkdirSync(FALLBACK_DIR, { recursive: true });
    }
    const list = Array.from(map.values());
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("[3FIG Waitlist] Failed persisting fallback waitlist file:", err);
  }
}

// Lazy Firestore client initialization to prevent boot crashes if credentials/APIs are pending
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let firestoreInstance: any = null;
let firestoreInitFailed = false;

export function getFirestoreInstance(): Firestore | null {
  if (firestoreInitFailed) return null;
  if (firestoreInstance) return firestoreInstance;

  try {
    // Dynamically require to avoid bundling issues on edge/browser
    const { Firestore } = require("@google-cloud/firestore");
    const projectId =
      process.env.FIRESTORE_PROJECT_ID ||
      process.env.GOOGLE_CLOUD_PROJECT ||
      process.env.GCP_PROJECT ||
      process.env.FIREBASE_PROJECT_ID;

    const databaseId = process.env.FIRESTORE_DATABASE_ID;

    const config: Record<string, unknown> = {};
    if (projectId) config.projectId = projectId;
    if (databaseId && databaseId !== "(default)") config.databaseId = databaseId;

    firestoreInstance = new Firestore(config);
    return firestoreInstance;
  } catch (err) {
    console.warn("[3FIG Waitlist] Firestore client unavailable, using server persistent storage:", err);
    firestoreInitFailed = true;
    return null;
  }
}

function safeDocId(email: string): string {
  return encodeURIComponent(email.toLowerCase().trim());
}

/**
 * Inserts a new waitlist signup into server-side Firestore.
 * If Firestore is temporarily unavailable or pending API activation in the GCP project,
 * Local fallback is development-only. Cloud Run disk is ephemeral and must not
 * acknowledge a signup when its durable database is unavailable.
 */
export async function saveWaitlistSignup(
  email: string,
  source = "landing",
  consentVersion = "2026-09-10",
  geoLocation: GeoLocationData | null = null
): Promise<SaveWaitlistResult> {
  const normalizedEmail = email.toLowerCase().trim();
  const db = getFirestoreInstance();

  if (db) {
    try {
      const docRef = db.collection("waitlist_signups").doc(safeDocId(normalizedEmail));
      const record: WaitlistRecord = {
        email: normalizedEmail,
        source,
        consent_version: consentVersion,
        created_at: new Date().toISOString(),
        delivered_at: null,
        geo_location: geoLocation,
      };

      const alreadyExisted = await db.runTransaction(async tx => {
        const existing = await tx.get(docRef);
        if (existing.exists) return true;
        tx.create(docRef, record);
        if (process.env.THREEFIG_WELCOME_ENABLED === "true") {
          tx.create(db.collection(OUTBOX).doc(welcomeId(normalizedEmail)), newWelcomeJob(normalizedEmail));
        }
        return false;
      });
      if (alreadyExisted) return { success: true, storage: "firestore", alreadyExisted: true };

      // Also mirror to local persistent storage for redundant durability
      const local = ensureFallbackLoaded();
      local.set(normalizedEmail, record);
      persistFallback(local);

      return { success: true, storage: "firestore", alreadyExisted: false };
    } catch (firestoreError: unknown) {
      if (process.env.K_SERVICE || process.env.NODE_ENV === "production") {
        throw new Error("Waitlist storage temporarily unavailable", { cause: firestoreError });
      }
      const errMessage =
        firestoreError instanceof Error ? firestoreError.message : String(firestoreError);
      console.warn(
        `[3FIG Waitlist] Firestore save encountered error: ${errMessage}. Falling back to server-side durable storage.`
      );
    }
  }

  if (process.env.K_SERVICE || process.env.NODE_ENV === "production") {
    throw new Error("Waitlist storage temporarily unavailable");
  }

  // Server-side durable fallback
  const local = ensureFallbackLoaded();
  const alreadyExisted = local.has(normalizedEmail);
  if (!alreadyExisted) {
    const record: WaitlistRecord = {
      email: normalizedEmail,
      source,
      consent_version: consentVersion,
      created_at: new Date().toISOString(),
      delivered_at: null,
      geo_location: geoLocation,
    };
    local.set(normalizedEmail, record);
    persistFallback(local);
    console.log(`[3FIG Waitlist Local] Stored signup to durable server storage: ${normalizedEmail}`);
  }

  return { success: true, storage: "local-persistent", alreadyExisted };
}

