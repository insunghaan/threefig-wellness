import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/threefig/site";
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL + "/" }];
}
