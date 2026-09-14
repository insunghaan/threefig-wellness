import { metricById } from "@/lib/threefig/metrics";
import {
  ApiError,
  boundedBody,
  checkWrite,
  database,
  failure,
  json,
  textField,
  userId,
  validDate,
  validId,
} from "@/lib/threefig/records-server";
export async function GET(request: Request) {
  try {
    const owner = userId(request),
      metricId = new URL(request.url).searchParams.get("metric");
    if (!metricId || !metricById(metricId))
      throw new ApiError(400, "Choose an available signal.");
    const rows = await database()
      .prepare(
        "SELECT id, metric_id AS metricId, value, observed_at AS observedAt, note FROM signal_records WHERE user_id = ? AND metric_id = ? ORDER BY observed_at DESC LIMIT 1000",
      )
      .bind(owner, metricId)
      .all();
    return json({
      records: rows.results.map((r) => ({ ...r, source: "manual" })),
    });
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  try {
    const owner = userId(request);
    checkWrite(request);
    let body: Record<string, unknown>;
    try {
      const parsed = await (await boundedBody(request, 8192)).json();
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
        throw new Error("Invalid body");
      body = parsed as Record<string, unknown>;
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(400, "This record could not be read.");
    }
    const m = metricById(
      typeof body.metricId === "string" ? body.metricId : "",
    );
    if (
      !m ||
      m.source !== "You" ||
      !validId(body.id) ||
      !validDate(body.observedAt) ||
      typeof body.value !== "number" ||
      !Number.isFinite(body.value) ||
      body.value < m.min ||
      body.value > m.max ||
      (m.precision === 0 && !Number.isInteger(body.value))
    )
      throw new ApiError(400, "Check the value and date before saving.");
    const note = textField(body.note ?? "", 500);
    await database()
      .prepare(
        "INSERT INTO signal_records (id, user_id, metric_id, value, observed_at, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING",
      )
      .bind(
        body.id,
        owner,
        m.id,
        body.value,
        new Date(body.observedAt).toISOString(),
        note,
        new Date().toISOString(),
      )
      .run();
    const saved = await database()
      .prepare("SELECT id FROM signal_records WHERE id = ? AND user_id = ?")
      .bind(body.id, owner)
      .first();
    if (!saved)
      throw new ApiError(409, "Please reopen the form and try again.");
    return json({ id: body.id }, 201);
  } catch (e) {
    return failure(e);
  }
}
