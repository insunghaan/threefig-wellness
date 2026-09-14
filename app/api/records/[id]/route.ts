import {
  ApiError,
  checkWrite,
  database,
  failure,
  json,
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
    if (!validId(id)) throw new ApiError(400, "Invalid record.");
    await database()
      .prepare("DELETE FROM signal_records WHERE id = ? AND user_id = ?")
      .bind(id, owner)
      .run();
    return json({ deleted: true });
  } catch (e) {
    return failure(e);
  }
}
