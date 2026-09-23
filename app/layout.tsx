import type { Metadata } from "next";
import { Analytics } from "@/components/threefig/analytics";
import { SITE_URL } from "@/lib/threefig/site";
import "./globals.css";
import "./theme.css";
import "./landing.css";

const siteUrl = SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "3FIG – The skin wellness ring",
  description:
    "3FIG connects sleep, food and stress with how your skin feels, turning everyday signals into one clearer next move.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "3FIG – The skin wellness ring",
    description:
      "3FIG connects sleep, food and stress with how your skin feels, turning everyday signals into one clearer next move.",
    url: siteUrl,
    siteName: "3FIG",
    images: [
      {
        url: "/images/threefig-og.png",
        width: 1200,
        height: 630,
        alt: "3FIG – The Smart ring for Skin wellness.",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "3FIG – The skin wellness ring",
    description:
      "3FIG connects sleep, food and stress with how your skin feels, turning everyday signals into one clearer next move.",
    images: ["/images/threefig-og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}

        <Analytics />
      </body>
    </html>
  );
}