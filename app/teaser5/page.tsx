import type { Metadata } from "next";
import { Teaser5Page } from "@/components/threefig/teaser5-page";
import { SITE_URL } from "@/lib/threefig/site";
import "@/app/teaser5.css";

export const metadata: Metadata = {
  title: "3fig – Skin, Understood From Within | The First Smart Ring for Skin Science",
  description:
    "While standard wearables count steps, 3fig captures continuous nocturnal biosignals from your finger to compute your daily Skin Balance Score.",
  alternates: { canonical: `${SITE_URL}/teaser5` },
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <link rel="preload" as="image" href="/images/threefig-logo.png" />
      <link rel="preload" as="image" href="/images/newhero0928.png?v=0928v3" />
      <main>
        <Teaser5Page />
      </main>
    </>
  );
}
