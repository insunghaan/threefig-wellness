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

export default async function Teaser4Page({
  searchParams,
}: {
  searchParams?: Promise<{ signup?: string; join?: string }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const initialOpen = sp?.signup === "1" || sp?.join === "1";

  return (
    <>
      <link rel="preload" as="image" href="/review/assets/logo.png" />
      <link rel="preload" as="image" href="/images/teaser4/hero-ring-phone.webp" type="image/webp" />
      <link rel="preload" as="image" href="/images/teaser4/hero-ring-phone.jpg" />
      <link rel="preload" as="image" href="/images/teaser4/modal-aside-desktop.webp" type="image/webp" />
      <link rel="preload" as="image" href="/images/teaser4/modal-banner-mobile.webp" type="image/webp" />
      <Teaser4PageContent initialOpen={initialOpen} />
    </>
  );
}
