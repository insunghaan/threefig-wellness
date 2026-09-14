declare namespace Cloudflare {
  interface Env {
    THREEFIG_INTERNAL_USER_IDS?: string;
    THREEFIG_WAITLIST_SYNC_TOKEN?: string;
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}
