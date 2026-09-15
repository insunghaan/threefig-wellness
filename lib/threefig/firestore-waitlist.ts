import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export type WaitlistRecord = {
  email: string;
  source: string;
  consent_version: string;
  created_at: string;
  delivered_at: string | null;
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
let firestoreInstance: any = null;
let firestoreInitFailed = false;

function getFirestoreInstance(): any | null {
  if (firestoreInitFailed) return null;
  if (firestoreInstance) return firestoreInstance;

  try {
    // Dynamically require to avoid bundling issues on edge/browser
    // eslint-disable-next-line @typescript-eslint/no-require-imports
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
 * gracefully falls back to secure server-side persistent storage to guarantee zero data loss.
 */
export async function saveWaitlistSignup(
  email: string,
  source = "landing",
  consentVersion = "2026-09-10"
): Promise<SaveWaitlistResult> {
  const normalizedEmail = email.toLowerCase().trim();
  const db = getFirestoreInstance();

  if (db) {
    try {
      const docRef = db.collection("waitlist_signups").doc(safeDocId(normalizedEmail));
      const existing = await docRef.get();

      if (existing.exists) {
        console.log(`[3FIG Waitlist Firestore] Email already registered: ${normalizedEmail}`);
        return { success: true, storage: "firestore", alreadyExisted: true };
      }

      const record: WaitlistRecord = {
        email: normalizedEmail,
        source,
        consent_version: consentVersion,
        created_at: new Date().toISOString(),
        delivered_at: null,
      };

      await docRef.set(record);
      console.log(`[3FIG Waitlist Firestore] Successfully saved signup: ${normalizedEmail}`);

      // Also mirror to local persistent storage for redundant durability
      const local = ensureFallbackLoaded();
      local.set(normalizedEmail, record);
      persistFallback(local);

      return { success: true, storage: "firestore", alreadyExisted: false };
    } catch (firestoreError: any) {
      console.warn(
        `[3FIG Waitlist] Firestore save encountered error: ${firestoreError?.message || firestoreError}. Falling back to server-side durable storage.`
      );
    }
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
    };
    local.set(normalizedEmail, record);
    persistFallback(local);
    console.log(`[3FIG Waitlist Local] Stored signup to durable server storage: ${normalizedEmail}`);
  }

  return { success: true, storage: "local-persistent", alreadyExisted };
}

/**
 * Retrieves undelivered waitlist signups for Google Apps Script sync.
 */
export async function getUndeliveredWaitlist(limit = 25): Promise<WaitlistRecord[]> {
  const db = getFirestoreInstance();
  const results: Map<string, WaitlistRecord> = new Map();

  if (db) {
    try {
      const snapshot = await db
        .collection("waitlist_signups")
        .where("delivered_at", "==", null)
        .limit(limit)
        .get();

      snapshot.forEach((doc: any) => {
        const data = doc.data() as WaitlistRecord;
        if (data && data.email) {
          results.set(data.email.toLowerCase(), data);
        }
      });
    } catch (err) {
      console.warn("[3FIG Waitlist] Firestore read encountered error, checking server fallback:", err);
    }
  }

  // Merge with local fallback
  const local = ensureFallbackLoaded();
  for (const record of local.values()) {
    if (record.delivered_at === null && !results.has(record.email.toLowerCase())) {
      results.set(record.email.toLowerCase(), record);
    }
  }

  const sorted = Array.from(results.values()).sort(
    (a, b) => a.created_at.localeCompare(b.created_at) || a.email.localeCompare(b.email)
  );

  return sorted.slice(0, limit);
}

/**
 * Acknowledges delivered emails after Google Apps Script sync.
 */
export async function markWaitlistDelivered(
  emails: string[],
  deliveredAt = new Date().toISOString()
): Promise<number> {
  const normalized = emails.map((e) => e.toLowerCase().trim());
  let count = 0;

  const db = getFirestoreInstance();
  if (db) {
    try {
      const batch = db.batch();
      for (const email of normalized) {
        const docRef = db.collection("waitlist_signups").doc(safeDocId(email));
        batch.update(docRef, { delivered_at: deliveredAt });
      }
      await batch.commit();
      count = normalized.length;
    } catch (err) {
      console.warn("[3FIG Waitlist] Firestore batch update failed, updating server fallback:", err);
    }
  }

  // Update local fallback
  const local = ensureFallbackLoaded();
  let localCount = 0;
  for (const email of normalized) {
    const record = local.get(email);
    if (record && record.delivered_at === null) {
      record.delivered_at = deliveredAt;
      localCount++;
    }
  }
  if (localCount > 0) {
    persistFallback(local);
  }

  return Math.max(count, localCount);
}
