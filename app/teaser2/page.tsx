import type { Metadata } from "next";
import Teaser2Landing from "@/components/threefig/teaser2-landing";
import { SITE_URL } from "@/lib/threefig/site";

export const metadata: Metadata = {
  title: "3FIG – The skin wellness ring",
  description:
    "3FIG connects sleep, food and stress with how your skin feels, turning everyday signals into one clearer next move.",
  alternates: { canonical: SITE_URL + "/teaser2" },
  robots: { index: false, follow: false },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": SITE_URL + "/#organization",
      name: "3FIG",
      url: SITE_URL + "/",
      logo: SITE_URL + "/apple-touch-icon.png",
    },
    {
      "@type": "WebSite",
      "@id": SITE_URL + "/#website",
      name: "3FIG",
      alternateName: "3fig",
      url: SITE_URL + "/teaser2",
      inLanguage: "en",
      publisher: { "@id": SITE_URL + "/#organization" },
    },
  ],
};

export default function Teaser2Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <Teaser2Landing />
    </>
  );
}
