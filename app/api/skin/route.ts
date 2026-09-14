import {
  skinAreas,
  skinRoutines,
  type PhotoAnalysis,
} from "@/lib/threefig/skin";
import {
  ApiError,
  boundedBody,
  checkWrite,
  database,
  failure,
  json,
  photoKey,
  photos,
  textField,
  userId,
  validDate,
  validId,
} from "@/lib/threefig/records-server";
export async function GET(request: Request) {
  try {
    const owner = userId(request);
    const rows = await database()
      .prepare(
        "SELECT id, observed_at AS observedAt, area, feeling, routine, note, analysis FROM skin_records WHERE user_id = ? ORDER BY observed_at DESC LIMIT 500",
      )
      .bind(owner)
      .all();
    return json({
      records: rows.results.map((r) => ({
        ...r,
        analysis: JSON.parse(r.analysis as string),
        photoUrl: `/api/skin/${r.id}/photo`,
      })),
    });
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  try {
    const owner = userId(request);
    checkWrite(request);
    const form = await (await boundedBody(request, 1024 * 1024)).formData(),
      file = form.get("photo");
    let meta;
    try {
      meta = JSON.parse(String(form.get("record")));
    } catch {
      throw new ApiError(400, "The photo details could not be read.");
    }
    if (!meta || typeof meta !== "object")
      throw new ApiError(400, "Review the photo details and try again.");
    const a = meta.analysis as PhotoAnalysis;
    if (
      !validId(meta.id) ||
      !validDate(meta.observedAt) ||
      !skinAreas.includes(meta.area) ||
      !skinRoutines.includes(meta.routine) ||
      !["1", "2", "3", "4", "5", ""].includes(meta.feeling) ||
      !a ||
      a.method !== "photo-pixels-v1" ||
      !["usable", "limited"].includes(a.quality) ||
      a.width !== 256 ||
      a.height !== 256 ||
      ![a.colorVariation, a.surfaceContrast, a.brightness].every(
        (v) => Number.isFinite(v) && v >= 0 && v <= 255,
      ) ||
      !Number.isFinite(a.clippedFraction) ||
      a.clippedFraction < 0 ||
      a.clippedFraction > 1
    )
      throw new ApiError(400, "Review the photo details and try again.");
    const note = textField(meta.note ?? "", 500);
    if (
      !(file instanceof File) ||
      file.type !== "image/jpeg" ||
      file.size > 800000 ||
      file.size < 100
    )
      throw new ApiError(
        400,
        "Choose a prepared JPEG photo smaller than 800 KB.",
      );
    const bytes = await file.arrayBuffer(),
      head = new Uint8Array(bytes);
    if (head[0] !== 255 || head[1] !== 216 || head[2] !== 255)
      throw new ApiError(400, "That file is not a valid JPEG photo.");
    const db = database(),
      bucket = photos();
    const existing = await db
      .prepare("SELECT id FROM skin_records WHERE id = ? AND user_id = ?")
      .bind(meta.id, owner)
      .first();
    if (existing) return json({ id: meta.id });
    const key = photoKey(owner, meta.id);
    await bucket.put(key, bytes, {
      httpMetadata: { contentType: "image/jpeg" },
    });
    try {
      await db
        .prepare(
          "INSERT INTO skin_records (id,user_id,observed_at,area,feeling,routine,note,photo_key,analysis,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
        )
        .bind(
          meta.id,
          owner,
          new Date(meta.observedAt).toISOString(),
          meta.area,
          meta.feeling,
          meta.routine,
          note,
          key,
          JSON.stringify(a),
          new Date().toISOString(),
        )
        .run();
    } catch (error) {
      await bucket.delete(key);
      throw error;
    }
    return json({ id: meta.id }, 201);
  } catch (e) {
    return failure(e);
  }
}
