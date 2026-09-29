import type { Metadata } from "next";
import { Teaser3Hero } from "@/components/threefig/teaser3-hero";
import { SITE_URL } from "@/lib/threefig/site";
import "@/app/teaser3.css";

export const metadata: Metadata = {
  title: "3fig – Skin Balance. Built from your body signals.",
  description:
    "Track sleep, stress signals, and recovery. Add a skin check-in. See your daily Skin Balance and the patterns behind it.",
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
        href="/images/teaser3/hero-ring-phone.webp"
        type="image/webp"
      />
      <link
        rel="preload"
        as="image"
        href="/images/teaser3/hero-ring-phone.jpg"
      />
      <Teaser3Hero />
    </>
  );
}
