import type { Metadata } from "next";
import { Teaser4PageContent } from "@/components/threefig/teaser4-page-content";
import { SITE_URL } from "@/lib/threefig/site";
import "@/app/teaser4.css";

export const metadata: Metadata = {
  title: "3fig — Skin Balance. Built from your body signals.",
  description:
    "Track sleep, stress signals, and recovery. Add a skin check-in. See your daily Skin Balance and the patterns behind it.",
  alternates: { canonical: `${SITE_URL}/teaser4` },
  robots: { index: false, follow: false },
};

export default function Teaser4Page() {
  return (
    <>
      <link rel="preload" as="image" href="/review/assets/logo.png" />
      <link rel="preload" as="image" href="/review/assets/hero.png" />
      <Teaser4PageContent />
    </>
  );
}
