declare namespace Cloudflare {
  interface Env {
    THREEFIG_INTERNAL_USER_IDS?: string;
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}
