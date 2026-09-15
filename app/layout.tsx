import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "./theme.css";
import "./landing.css";

export const metadata: Metadata = {
  title: "3FIG – The skin wellness ring",
  description:
    "3FIG connects sleep, food and stress with how your skin feels, turning everyday signals into one clearer next move.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
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

        <Script id="clarity-script" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "yi66k74lc9");
          `}
        </Script>
      </body>
    </html>
  );
}
