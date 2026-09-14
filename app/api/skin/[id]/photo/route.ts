import {
  ApiError,
  database,
  failure,
  photos,
  userId,
  validId,
} from "@/lib/threefig/records-server";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const owner = userId(request),
      { id } = await params;
    if (!validId(id)) throw new ApiError(404, "Photo not found.");
    const row = await database()
      .prepare(
        "SELECT photo_key FROM skin_records WHERE id = ? AND user_id = ?",
      )
      .bind(id, owner)
      .first<{ photo_key: string }>();
    if (!row) throw new ApiError(404, "Photo not found.");
    const file = await photos().get(row.photo_key);
    if (!file) throw new ApiError(404, "Photo not found.");
    return new Response(file.body, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": 'inline; filename="skin-check-in.jpg"',
      },
    });
  } catch (e) {
    return failure(e);
  }
}
