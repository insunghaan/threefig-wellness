import type { Metadata } from "next";
import { Teaser6ConceptPage } from "@/components/threefig/teaser6-concept-page";
import { SITE_URL } from "@/lib/threefig/site";
import "@/app/teaser6-concept.css";

export const metadata: Metadata = {
  title: "3FIG – Skin Wellness Smart Ring (Concept)",
  description:
    "Understand your skin from within. 3FIG pairs smart ring biometric tracking with daily check-ins to compute your Skin Balance Score.",
  alternates: { canonical: `${SITE_URL}/teaser6/concept` },
  robots: { index: false, follow: false },
};

export default function Teaser6ConceptRoute() {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/images/threefig-logo.png"
      />
      <link
        rel="preload"
        as="image"
        href="/images/teaser2-ring-still-life.webp"
        type="image/webp"
      />
      <Teaser6ConceptPage />
    </>
  );
}
