import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "./theme.css";
import "./landing.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://threefig-wellness-jn3fn5lewq-uc.a.run.app";

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
        url: "/images/threefig-hero-amber.jpg",
        width: 1024,
        height: 576,
        alt: "3FIG – The skin wellness ring",
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
    images: ["/images/threefig-hero-amber.jpg"],
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

        {/* Microsoft Clarity */}
        <Script id="clarity-script" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "yi66k74lc9");
          `}
        </Script>

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-1689JHD6V6"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-1689JHD6V6');
          `}
        </Script>
      </body>
    </html>
  );
}