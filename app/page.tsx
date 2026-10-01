import type { Metadata } from "next";
import Script from "next/script";
import { Teaser3Hero } from "@/components/threefig/teaser3-hero";
import { SITE_URL } from "@/lib/threefig/site";
import "@/app/teaser3.css";

export const metadata: Metadata = {
  title: "3fig – Skin Balance. Built from your body signals.",
  description:
    "Track sleep, stress signals, and recovery. Add a skin check-in. See your daily Skin Balance and the patterns behind it.",
  alternates: { canonical: `${SITE_URL}/` },
  robots: { index: true, follow: true },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "3FIG",
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/apple-touch-icon.png`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "3FIG",
      alternateName: "3fig",
      url: `${SITE_URL}/`,
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function Home() {
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <Script
        id="openai-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `!function(w,d,s,u){if(w.oaiq)return;var q=function(){q.q.push(arguments)};q.q=[];w.oaiq=q;var j=d.createElement(s);j.async=1;j.src=u;var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(j,f);}(window,document,"script","https://bzrcdn.openai.com/sdk/oaiq.min.js");if(!window._oaiqInitialized){window._oaiqInitialized=true;oaiq("init",{pixelId:"R4AXx2xC3cKDDpCqHMqkE8",debug:true});}`,
        }}
      />
      <Teaser3Hero logoHref="/" initialSource="main_waitlist" />
    </>
  );
}
