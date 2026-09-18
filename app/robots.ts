import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/threefig/site";
export default function robots(): MetadataRoute.Robots {
  // Keep prototype pages crawlable so their existing noindex can be read.
  return { rules: { userAgent: "*", allow: "/", disallow: "/api/" }, sitemap: SITE_URL + "/sitemap.xml" };
}
