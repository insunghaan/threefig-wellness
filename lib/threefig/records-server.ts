import { isInternalUser } from "./internal-policy";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type WaitlistRow = {
  email: string;
  source: string;
  consent_version: string;
  created_at: string;
  delivered_at: string | null;
};

type SignalRow = {
  id: string;
  user_id: string;
  metric_id: string;
  value: number;
  observed_at: string;
  note: string;
  created_at: string;
};

type SkinRow = {
  id: string;
  user_id: string;
  observed_at: string;
  area: string;
  feeling: string;
  routine: string;
  note: string;
  photo_key: string;
  analysis: string;
  created_at: string;
};

// Standalone in-memory persistence for Google Cloud / Node.js runtime
const waitlistTable = new Map<string, WaitlistRow>();
const signalRecordsTable = new Map<string, SignalRow>();
const skinRecordsTable = new Map<string, SkinRow>();
const photoBucket = new Map<string, { bytes: Uint8Array; contentType: string }>();

class MockPreparedStatement {
  private sql: string;
  private args: unknown[] = [];

  constructor(sql: string) {
    this.sql = sql;
  }

  bind(...args: unknown[]) {
    this.args = args;
    return this;
  }

  async run(): Promise<{ meta: { changes: number } }> {
    const trimmed = this.sql.trim();
    if (trimmed.startsWith("INSERT INTO waitlist_signups")) {
      const [email, source, consent_version, created_at] = this.args as [string, string, string, string];
      if (!waitlistTable.has(email)) {
        waitlistTable.set(email, {
          email,
          source: source || "landing",
          consent_version: consent_version || "2026-09-10",
          created_at: created_at || new Date().toISOString(),
          delivered_at: null,
        });
        console.log(`[3FIG Waitlist] Stored new waitlist signup: ${email}`);
        return { meta: { changes: 1 } };
      }
      return { meta: { changes: 0 } };
    }
    if (trimmed.startsWith("UPDATE waitlist_signups SET delivered_at = ?")) {
      const deliveredAt = this.args[0] as string;
      const emails = this.args.slice(1) as string[];
      let count = 0;
      for (const email of emails) {
        const row = waitlistTable.get(email);
        if (row && row.delivered_at === null) {
          row.delivered_at = deliveredAt;
          count++;
        }
      }
      return { meta: { changes: count } };
    }
    if (trimmed.startsWith("INSERT INTO signal_records")) {
      const [id, user_id, metric_id, value, observed_at, note, created_at] = this.args as [string, string, string, number, string, string, string];
      if (!signalRecordsTable.has(id)) {
        signalRecordsTable.set(id, { id, user_id, metric_id, value, observed_at, note, created_at });
        return { meta: { changes: 1 } };
      }
      return { meta: { changes: 0 } };
    }
    if (trimmed.startsWith("DELETE FROM signal_records")) {
      const [id, user_id] = this.args as [string, string];
      const record = signalRecordsTable.get(id);
      if (record && record.user_id === user_id) {
        signalRecordsTable.delete(id);
        return { meta: { changes: 1 } };
      }
      return { meta: { changes: 0 } };
    }
    if (trimmed.startsWith("INSERT INTO skin_records")) {
      const [id, user_id, observed_at, area, feeling, routine, note, photo_key, analysis, created_at] = this.args as [string, string, string, string, string, string, string, string, string, string];
      if (!skinRecordsTable.has(id)) {
        skinRecordsTable.set(id, { id, user_id, observed_at, area, feeling, routine, note, photo_key, analysis, created_at });
        return { meta: { changes: 1 } };
      }
      return { meta: { changes: 0 } };
    }
    if (trimmed.startsWith("DELETE FROM skin_records")) {
      const [id, user_id] = this.args as [string, string];
      const record = skinRecordsTable.get(id);
      if (record && record.user_id === user_id) {
        skinRecordsTable.delete(id);
        return { meta: { changes: 1 } };
      }
      return { meta: { changes: 0 } };
    }
    return { meta: { changes: 0 } };
  }

  async all<T = Record<string, unknown>>(): Promise<{ results: T[] }> {
    const trimmed = this.sql.trim();
    if (trimmed.includes("FROM waitlist_signups")) {
      const results: WaitlistRow[] = [];
      for (const row of waitlistTable.values()) {
        if (row.delivered_at === null) {
          results.push(row);
        }
      }
      results.sort((a, b) => a.created_at.localeCompare(b.created_at) || a.email.localeCompare(b.email));
      return { results: results.slice(0, 25) as unknown as T[] };
    }
    if (trimmed.includes("FROM signal_records")) {
      const [user_id, metric_id] = this.args as [string, string];
      const results: Array<{ id: string; metricId: string; value: number; observedAt: string; note: string }> = [];
      for (const row of signalRecordsTable.values()) {
        if (row.user_id === user_id && row.metric_id === metric_id) {
          results.push({
            id: row.id,
            metricId: row.metric_id,
            value: row.value,
            observedAt: row.observed_at,
            note: row.note,
          });
        }
      }
      results.sort((a, b) => b.observedAt.localeCompare(a.observedAt));
      return { results: results.slice(0, 1000) as unknown as T[] };
    }
    if (trimmed.includes("FROM skin_records")) {
      const [user_id] = this.args as [string];
      const results: Array<{ id: string; observedAt: string; area: string; feeling: string; routine: string; note: string; analysis: string }> = [];
      for (const row of skinRecordsTable.values()) {
        if (row.user_id === user_id) {
          results.push({
            id: row.id,
            observedAt: row.observed_at,
            area: row.area,
            feeling: row.feeling,
            routine: row.routine,
            note: row.note,
            analysis: row.analysis,
          });
        }
      }
      results.sort((a, b) => b.observedAt.localeCompare(a.observedAt));
      return { results: results.slice(0, 500) as unknown as T[] };
    }
    return { results: [] };
  }

  async first<T = Record<string, unknown>>(): Promise<T | null> {
    const trimmed = this.sql.trim();
    if (trimmed.includes("FROM signal_records WHERE id = ? AND user_id = ?")) {
      const [id, user_id] = this.args as [string, string];
      const row = signalRecordsTable.get(id);
      if (row && row.user_id === user_id) {
        return { id: row.id } as unknown as T;
      }
      return null;
    }
    if (trimmed.includes("FROM skin_records WHERE id = ? AND user_id = ?")) {
      const [id, user_id] = this.args as [string, string];
      const row = skinRecordsTable.get(id);
      if (row && row.user_id === user_id) {
        if (trimmed.includes("photo_key")) {
          return { photo_key: row.photo_key } as unknown as T;
        }
        return { id: row.id } as unknown as T;
      }
      return null;
    }
    return null;
  }
}

export function database() {
  return {
    prepare(sql: string) {
      return new MockPreparedStatement(sql);
    },
  };
}

export function photos() {
  return {
    async put(key: string, data: ArrayBuffer | Uint8Array, options?: { httpMetadata?: { contentType?: string } }) {
      const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
      photoBucket.set(key, { bytes, contentType: options?.httpMetadata?.contentType || "image/jpeg" });
    },
    async get(key: string) {
      const entry = photoBucket.get(key);
      if (!entry) return null;
      return {
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(entry.bytes);
            controller.close();
          },
        }),
      };
    },
    async delete(key: string) {
      photoBucket.delete(key);
    },
  };
}

export function userId(request: Request) {
  const id = request.headers.get("oai-authenticated-user-id");
  if (!id)
    throw new ApiError(401, "Sign in to save and view your private records.");
  if (!isInternalUser(id, process.env.THREEFIG_INTERNAL_USER_IDS))
    throw new ApiError(403, "This workspace is private.");
  return id;
}
export function checkWrite(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    throw new ApiError(
      403,
      "This request could not be verified. Reload and try again.",
    );
  }

  const origin = request.headers.get("origin");
  if (origin) {
    const host =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      new URL(request.url).host;

    try {
      const originUrl = new URL(origin);
      const originHost = originUrl.host;
      const requestHostname = host.split(":")[0];
      const originHostname = originUrl.hostname;

      const isSameHost = originHost === host || originHostname === requestHostname;
      const isLoopback =
        (originHostname === "localhost" || originHostname === "127.0.0.1") &&
        (requestHostname === "localhost" || requestHostname === "127.0.0.1");
      const isDirectMatch = origin === new URL(request.url).origin;

      if (!isSameHost && !isLoopback && !isDirectMatch) {
        throw new ApiError(
          403,
          "This request could not be verified. Reload and try again.",
        );
      }
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(
        403,
        "This request could not be verified. Reload and try again.",
      );
    }
  }
}
export const json = (data: unknown, status = 200) =>
  Response.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
export function failure(error: unknown) {
  if (error instanceof ApiError)
    return json({ error: error.message }, error.status);
  console.error(
    "[3FIG records] Storage operation failed",
    error instanceof Error ? error.name : "Unknown error",
  );
  return json(
    { error: "We couldn’t complete that request. Please try again." },
    503,
  );
}
export async function boundedBody(request: Request, max: number) {
  const declared = Number(request.headers.get("content-length"));
  if (declared > max) {
    await request.body?.cancel();
    throw new ApiError(413, "This file is too large. Choose a smaller photo.");
  }
  if (!request.body) throw new ApiError(400, "The request is empty.");
  const reader = request.body.getReader(),
    parts: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > max) {
      await reader.cancel();
      throw new ApiError(413, "This file is too large.");
    }
    parts.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const p of parts) {
    bytes.set(p, offset);
    offset += p.length;
  }
  return new Response(bytes, {
    headers: {
      "Content-Type": request.headers.get("content-type") || "application/json",
    },
  });
}
export function validId(id: unknown): id is string {
  return (
    typeof id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id,
    )
  );
}
export function validDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    Date.parse(value) <= Date.now() + 86400000 &&
    Date.parse(value) >= Date.parse("2000-01-01")
  );
}
export function textField(value: unknown, max: number) {
  if (typeof value !== "string" || value.length > max)
    throw new ApiError(400, "Please shorten the note and try again.");
  return value;
}
export function photoKey(owner: string, id: string) {
  return `skin/${encodeURIComponent(owner)}/${id}.jpg`;
}
