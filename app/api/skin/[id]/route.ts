import {
  ApiError,
  checkWrite,
  database,
  failure,
  json,
  photoKey,
  photos,
  userId,
  validId,
} from "@/lib/threefig/records-server";
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const owner = userId(request);
    checkWrite(request);
    const { id } = await params;
    if (!validId(id)) throw new ApiError(400, "Invalid photo record.");
    const db = database(),
      bucket = photos();
    await db
      .prepare("DELETE FROM skin_records WHERE id = ? AND user_id = ?")
      .bind(id, owner)
      .run();
    await bucket.delete(photoKey(owner, id));
    return json({ deleted: true });
  } catch (e) {
    return failure(e);
  }
}
