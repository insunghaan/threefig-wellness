import type { Metadata } from "next";
import { Teaser6Hero } from "@/components/threefig/teaser6-hero";
import { SITE_URL } from "@/lib/threefig/site";
import "@/app/teaser6.css";

export const metadata: Metadata = {
  title: "3FIG – Skin Wellness Smart Ring (Revision)",
  description:
    "See how your daily habits relate to your skin. 3FIG pairs smart ring sleep and stress tracking with daily check-ins to reveal your Skin Balance Score.",
  alternates: { canonical: `${SITE_URL}/teaser6` },
  robots: { index: false, follow: false },
};

export default function Teaser6Page() {
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
        href="/images/newhero0928.png?v=0928v3"
      />
      <link
        rel="preload"
        as="image"
        href="/images/threefig-ring-cutout-tight.webp"
        type="image/webp"
      />
      <Teaser6Hero />
    </>
  );
}
