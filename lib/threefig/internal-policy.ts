/** Exact account IDs only; an absent configuration never grants access. */
export function isInternalUser(id: string | null, allowedIds?: string): boolean {
  return !!id && (allowedIds ?? "").split(",").map((value) => value.trim()).filter(Boolean).includes(id);
}
