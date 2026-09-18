import type { Metadata } from "next";
import Landing from "@/components/threefig/landing";
import { SITE_URL } from "@/lib/threefig/site";
export const metadata: Metadata = { alternates: { canonical: SITE_URL + "/" } };
const structuredData = {
  "@context": "https://schema.org", "@graph": [
    { "@type": "Organization", "@id": SITE_URL + "/#organization", name: "3FIG", url: SITE_URL + "/", logo: SITE_URL + "/apple-touch-icon.png" },
    { "@type": "WebSite", "@id": SITE_URL + "/#website", name: "3FIG", alternateName: "3fig", url: SITE_URL + "/", inLanguage: "en", publisher: { "@id": SITE_URL + "/#organization" } },
  ],
};
export default function Home() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} /><Landing /></>;
}
