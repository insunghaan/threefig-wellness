import type { Metadata } from "next";
import { Teaser4Hero } from "@/components/threefig/teaser4-hero";
import { SITE_URL } from "@/lib/threefig/site";
import "@/app/teaser4.css";

export const metadata: Metadata = {
  title: "3fig – The Smart ring for skin wellness (Version 1 Revision)",
  description:
    "Meet 3fig, a smart ring designed to turn sleep, stress and daily check-ins into your Skin Balance Score. Explore the patterns between your everyday habits and how your skin feels.",
  alternates: { canonical: `${SITE_URL}/teaser4` },
  robots: { index: false, follow: false },
};

export default function Teaser4Page() {
  return (
    <>
      <link rel="preload" as="image" href="/images/threefig-logo.png" />
      <link rel="preload" as="image" href="/images/newhero0928.png?v=0928v3" />
      <link rel="preload" as="image" href="/images/threefig-ring-cutout-tight.webp" type="image/webp" />
      <Teaser4Hero />
    </>
  );
}
