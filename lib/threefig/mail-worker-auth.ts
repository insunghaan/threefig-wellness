/** Constant-time verification for the private mail retry worker. */
export async function hasWaitlistCredential(authorization: string | null, secret?: string) {
  if (!secret || secret.length < 32 || !authorization?.startsWith("Bearer ")) return false;
  const supplied = authorization.slice(7);
  if (supplied.length > 256) return false;
  const encode = new TextEncoder();
  const [a, b] = await Promise.all([supplied, secret].map(value =>
    crypto.subtle.digest("SHA-256", encode.encode(value)).then(bytes => new Uint8Array(bytes))));
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
  return difference === 0;
}
