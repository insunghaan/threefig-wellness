"use client";
import { useEffect, useState } from "react";
import Script from "next/script";
import { CAMPAIGN_KEYS } from "@/lib/threefig/attribution";
type AnalyticsWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; threefigAnalyticsReady?: boolean };
export function trackEvent(name: "cta_click" | "signup_start" | "generate_lead", params: Record<string, string> = {}) {
  if (typeof window === "undefined" || window.location.hostname !== "3fig.io" || window.location.pathname !== "/") return;
  const target = window as AnalyticsWindow;
  target.dataLayer ||= [];
  target.gtag ||= function () {
    // Use the standard gtag arguments queue.
    // eslint-disable-next-line prefer-rest-params
    target.dataLayer!.push(arguments);
  };
  target.gtag("event", name, { ...params, product: "3fig", landing_version: "20260918" });
}
export function Analytics() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (window.location.hostname !== "3fig.io" || window.location.pathname !== "/") return;
    const target = window as AnalyticsWindow;
    if (!target.threefigAnalyticsReady) {
      target.dataLayer ||= [];
      target.gtag ||= function () {
    // Use the standard gtag arguments queue.
    // eslint-disable-next-line prefer-rest-params
    target.dataLayer!.push(arguments);
  };
      target.gtag("js", new Date());
      const clean = new URL("https://3fig.io/");
      const source = new URL(window.location.href);
      for (const key of CAMPAIGN_KEYS) {
        const value = source.searchParams.get(key);
        if (value && /^[a-zA-Z0-9_.~-]{1,100}$/.test(value)) clean.searchParams.set(key, value);
      }
      let referrer = "";
      try { referrer = new URL(document.referrer).origin + "/"; } catch {}
      target.gtag("config", "G-1689JHD6V6", { page_location: clean.href, page_referrer: referrer });
      target.threefigAnalyticsReady = true;
    }
    setEnabled(true);
  }, []);
  if (!enabled) return null;
  return <>
    <Script src="https://www.googletagmanager.com/gtag/js?id=G-1689JHD6V6" strategy="afterInteractive" />
    <Script id="clarity-script" strategy="afterInteractive">{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","yi66k74lc9");`}</Script>
  </>;
}
