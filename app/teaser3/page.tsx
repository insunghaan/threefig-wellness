import type { Metadata } from "next";
import { Teaser3Hero } from "@/components/threefig/teaser3-hero";
import { SITE_URL } from "@/lib/threefig/site";
import "@/app/teaser3.css";

export const metadata: Metadata = {
  title: "3FIG – The Smart ring for skin wellness",
  description:
    "Meet 3FIG, a smart ring designed to turn sleep, stress and daily check-ins into your Skin Balance Score. Explore the patterns between your everyday habits and how your skin feels.",
  alternates: { canonical: `${SITE_URL}/teaser3` },
  robots: { index: false, follow: false },
};

export default function Teaser3Page() {
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
        href="/images/teaser3-mobile-poster.webp"
        type="image/webp"
      />
      <link
        rel="preload"
        as="image"
        href="/images/threefig-ring-cutout-tight.webp"
        type="image/webp"
      />
      <Teaser3Hero />
    </>
  );
}
