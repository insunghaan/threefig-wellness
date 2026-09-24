"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import Link from "next/link";
import { captureBrowserAttribution, type Attribution } from "@/lib/threefig/attribution";
import { trackEvent } from "./analytics";
import {
  Activity,
  ArrowRight,
  BatteryMedium,
  Check,
  HeartPulse,
  Menu,
  MoonStar,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Waves,
  X,
} from "lucide-react";
import { Teaser2ValueSection } from "./teaser2-value-section";
import { Teaser2HowItWorks } from "./teaser2-how-it-works";
import { Teaser2Science } from "./teaser2-science";
import { Teaser2Faq } from "./teaser2-faq";
import { Teaser2WaitlistDialog } from "./teaser2-waitlist-dialog";
import {
  getSimulatedWaitlistCount,
  syncWaitlistCounters,
} from "@/lib/threefig/waitlist-counter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import "@/app/teaser2.css";

const hardwareFeatures = [
  { icon: MoonStar, label: "Sleep & circadian sensing", note: "Continuous overnight metrics" },
  { icon: HeartPulse, label: "Resting heart rate & HRV", note: "Continuous optical sensor" },
  { icon: Thermometer, label: "Relative temperature shifts", note: "Baseline deviation tracking" },
  { icon: Activity, label: "Daily activity & recovery", note: "Integrated motion sensors" },
  { icon: ShieldCheck, label: "Featherlight titanium", note: "Comfortable for 24/7 wear" },
  { icon: BatteryMedium, label: "Multi-day battery life", note: "Discreet interior charging" },
];

export default function Teaser2Landing() {
  const attribution = useRef<Attribution | null>(null);
  const signupStarted = useRef(false);
  const submitting = useRef(false);

  useEffect(() => {
    attribution.current = captureBrowserAttribution();
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [waitlistCount, setWaitlistCount] = useState<string>("-/3,000");
  const [showFloatingCta, setShowFloatingCta] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const heroRef = useRef<HTMLElement | null>(null);
  const benefitRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;

    const handleScrollOrIntersect = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);

      const heroRect = heroEl.getBoundingClientRect();
      const isPastHero = heroRect.bottom <= 70;

      let isBenefitReached = false;
      if (benefitRef.current) {
        const benefitRect = benefitRef.current.getBoundingClientRect();
        isBenefitReached = benefitRect.top <= window.innerHeight;
      }

      setShowFloatingCta(isPastHero && !isBenefitReached);
    };

    handleScrollOrIntersect();
    window.addEventListener("scroll", handleScrollOrIntersect, { passive: true });
    window.addEventListener("resize", handleScrollOrIntersect, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScrollOrIntersect);
      window.removeEventListener("resize", handleScrollOrIntersect);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchServerCount() {
      try {
        const res = await fetch("/api/waitlist/count", { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as { formatted?: string };
          if (mounted && data?.formatted) {
            setWaitlistCount(data.formatted);
            syncWaitlistCounters(data.formatted);
            return;
          }
        }
      } catch {
        // Fallback
      }
      if (mounted) {
        const fallback = getSimulatedWaitlistCount().formatted;
        setWaitlistCount(fallback);
        syncWaitlistCounters(fallback);
      }
    }

    fetchServerCount();
    const interval = setInterval(fetchServerCount, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  function openWaitlist(
    placement: "header" | "hero" | "ring" | "signup" | "mobile_floating"
  ) {
    setDialogOpen(true);
    trackEvent("cta_click", { placement });
    if (!signupStarted.current) {
      signupStarted.current = true;
      trackEvent("signup_start", { placement });
    }
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="skin-site teaser2-page teaser2-standalone">
      <a className="skin-skip" href="#main">
        Skip to content
      </a>

      {/* HEADER */}
      <header
        className={`skin-header-wrap teaser2-header ${
          isScrolled || menuOpen ? "is-scrolled" : "is-top"
        }`}
      >
        <div className="skin-header">
          <Link
            href="/teaser2"
            aria-label="3FIG home"
            className="teaser2-header-brand"
            onClick={closeMenu}
          >
            <div className="teaser2-logo-stage">
              <img
                src="/images/threefig-logo-white.png"
                alt="3fig"
                className="teaser2-logo-white"
                width="70"
                height="36"
              />
              <img
                src="/images/threefig-logo.png"
                alt="3fig"
                className="teaser2-logo-black"
                width="70"
                height="36"
              />
            </div>
          </Link>

          <nav
            className={menuOpen ? "skin-nav is-open" : "skin-nav"}
            aria-label="Main navigation"
          >
            <a href="#value" onClick={closeMenu}>What you get</a>
            <a href="#how-it-works" onClick={closeMenu}>How it works</a>
            <a href="#ring" onClick={closeMenu}>The ring</a>
            <a href="#science" onClick={closeMenu}>Skin science</a>
            <a href="#faq" onClick={closeMenu}>FAQ</a>
          </nav>

          <button
            className="skin-header-cta"
            type="button"
            onClick={() => openWaitlist("header")}
          >
            <span className="skin-border-beam" aria-hidden="true" />
            <span>Claim Free Lifetime Access</span>
            <span className="skin-header-counter-pill skin-waitlist-counter" data-waitlist-counter>
              {waitlistCount}
            </span>
            <ArrowRight size={16} />
          </button>

          <button
            className="skin-menu"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main id="main">
        {/* ============================================================
            01 — HERO
            ============================================================ */}
        <section className="skin-hero" ref={heroRef}>
          <picture>
            <source
              media="(max-width: 820px)"
              srcSet="/images/threefig-hero-mobile.png"
              width={576}
              height={1024}
            />
            <img
              className="skin-hero-image"
              src="/images/threefig-hero-master.png"
              alt="A model extending her hand toward the camera, with a polished 3FIG smart ring in focus against warm amber light"
              fetchPriority="high"
              width={1024}
              height={576}
            />
          </picture>

          <div className="skin-hero-copy">
            <p className="skin-kicker">THE SKIN WELLNESS RING</p>
            <h1 className="teaser2-hero-title">
              The smart ring.<br />
              <em>For skin wellness.</em>
            </h1>
            <p className="skin-hero-lead">
              Sleep, recovery, and your skin check-ins — one clearer picture of what your skin responds to.
            </p>

            <div className="teaser2-hero-benefit-pill">
              <Sparkles size={16} aria-hidden="true" />
              <span>Free lifetime membership for early access.</span>
            </div>

            <div className="skin-hero-actions">
              <button
                className="skin-button"
                type="button"
                onClick={() => openWaitlist("hero")}
              >
                <span className="skin-border-beam" aria-hidden="true" />
                <span>Claim Free Lifetime Access</span>
                <ArrowRight size={18} />
              </button>

              <p className="teaser2-hero-microcopy">
                Membership is free for life. Ring sold separately.
              </p>

              <div className="skin-hero-counter skin-waitlist-counter" data-waitlist-counter>
                <span className="skin-counter-dot" aria-hidden="true" />
                <span>Founding spots: <strong className="skin-counter-val">{waitlistCount}</strong></span>
              </div>
            </div>
          </div>

          <a className="skin-hero-scroll" href="#value">
            See what you get <span>↓</span>
          </a>
        </section>

        {/* ============================================================
            02 — WHAT YOU ACTUALLY GET (PRODUCT VALUE)
            ============================================================ */}
        <Teaser2ValueSection />

        {/* ============================================================
            03 — HOW IT WORKS (WEAR. CHECK IN. CONNECT.)
            ============================================================ */}
        <Teaser2HowItWorks />

        {/* ============================================================
            04 — THE RING (HARDWARE)
            ============================================================ */}
        <section id="ring" className="skin-ring-section" aria-labelledby="ring-title">
          <div
            className="skin-ring-photo"
            role="img"
            aria-label="A polished black smart ring balanced on dark sculptural stone"
          />
          <div className="skin-ring-copy">
            <p className="skin-kicker">THE SENSING FOUNDATION</p>
            <h2 id="ring-title">
              Always on.<br />
              <em>Never in the way.</em>
            </h2>
            <p>
              The ring is the sensing layer. 3FIG is the interpretation layer. Crafted in featherlight titanium with multi-day battery life, 3FIG tracks physiological baselines 24/7 so your skin’s story becomes legible.
            </p>

            <div className="skin-signal-grid">
              {hardwareFeatures.map(({ icon: Icon, label, note }) => (
                <div key={label} className="skin-signal-item">
                  <div className="skin-signal-item-header">
                    <Icon className="skin-signal-icon" size={20} strokeWidth={1.8} aria-hidden="true" />
                    <strong className="skin-signal-label">{label}</strong>
                  </div>
                  <span className="skin-signal-note">{note}</span>
                </div>
              ))}
            </div>

            <div className="skin-ring-cta">
              <button
                className="skin-button"
                type="button"
                onClick={() => openWaitlist("ring")}
              >
                <span className="skin-border-beam" aria-hidden="true" />
                <span>Claim Free Lifetime Access</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================
            05 — SKIN SCIENCE / TRUST
            ============================================================ */}
        <Teaser2Science />

        {/* ============================================================
            06 — FAQ
            ============================================================ */}
        <Teaser2Faq />

        {/* ============================================================
            07 — FINAL CONVERSION
            ============================================================ */}
        <section id="updates" className="skin-updates" aria-labelledby="conversion-title">
          <div className="skin-update-motion" aria-hidden="true">
            <span className="skin-update-light skin-update-light-a" />
            <span className="skin-update-light skin-update-light-b" />
            <span className="skin-update-light skin-update-light-c" />
          </div>
          <div className="skin-update-content">
            <p className="skin-kicker">FOUNDING MEMBER ACCESS</p>
            <h2 id="conversion-title">
              Your membership.<br />
              <em>Free for life.</em>
            </h2>
            <p>
              Join early and keep your 3FIG membership free for life.
            </p>

            <div
              className="skin-early-benefits"
              role="group"
              aria-label="Pre-registration founding member perk: Lifetime membership"
              ref={benefitRef}
            >
              <article className="skin-benefit-card skin-benefit-featured" data-featured="true">
                <span className="skin-benefit-pill">Founding Member Perk</span>
                <span className="skin-benefit-icon" aria-hidden="true">
                  <Sparkles size={24} />
                </span>
                <div>
                  <span className="skin-benefit-eyebrow">LIFETIME MEMBERSHIP</span>
                  <strong>Free 3FIG membership for life as an early member.</strong>
                </div>
              </article>
            </div>

            <div className="skin-signup-wrap">
              <div
                className="skin-signup-counter skin-waitlist-counter"
                id="waitlist-counter"
                data-waitlist-counter
              >
                <span className="skin-counter-dot" aria-hidden="true" />
                <span>Limited founding spots: <strong className="skin-counter-val">{waitlistCount}</strong></span>
              </div>
              <button
                type="button"
                className="skin-signup-btn"
                onClick={() => openWaitlist("signup")}
              >
                <span className="skin-border-beam" aria-hidden="true" />
                <span>Claim Free Lifetime Access</span>
                <ArrowRight size={18} />
              </button>
              <p className="teaser2-final-microcopy">
                Ring sold separately.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Floating CTA Bar */}
      <div
        className={`skin-mobile-floating-bar${
          showFloatingCta && !menuOpen && !dialogOpen ? " is-visible" : ""
        }`}
        aria-hidden={!showFloatingCta || menuOpen || dialogOpen}
      >
        <div
          className="skin-mobile-floating-counter skin-waitlist-counter"
          data-waitlist-counter
          onClick={() => openWaitlist("mobile_floating")}
          role="button"
          tabIndex={showFloatingCta && !menuOpen && !dialogOpen ? 0 : -1}
          aria-label="Limited founding spots"
        >
          <span className="skin-counter-dot" aria-hidden="true" />
          <span>Limited founding spots: <strong className="skin-counter-val">{waitlistCount}</strong></span>
        </div>
        <button
          className="skin-mobile-floating-btn"
          type="button"
          onClick={() => openWaitlist("mobile_floating")}
          tabIndex={showFloatingCta && !menuOpen && !dialogOpen ? 0 : -1}
          aria-label="Claim Free Lifetime Access"
        >
          <span className="skin-border-beam" aria-hidden="true" />
          <span>Claim Free Lifetime Access</span>
          <ArrowRight size={18} />
        </button>
      </div>

      <footer className="skin-footer">
        <p className="skin-footer-copy">Your skin. Your signals. One clearer story.</p>
        <span className="skin-footer-copyright">© 2026 3FIG</span>
      </footer>

      {/* Privacy Dialog */}
      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="fig-dialog skin-privacy-dialog">
          <DialogTitle>Your inbox. Your call.</DialogTitle>
          <DialogDescription>
            Join the launch list and we’ll keep your email only to send occasional 3FIG product updates. We never sell it. Leave anytime.
          </DialogDescription>
          <p>
            We use Google Analytics and Microsoft Clarity to understand website usage, and the Meta Pixel to measure visits and successful new waitlist registrations from our ads. We do not include your email address in Meta event parameters.
          </p>
          <p>
            3FIG supports everyday wellness. It does not diagnose, prevent or treat medical conditions.
          </p>
        </DialogContent>
      </Dialog>

      {/* Teaser 2 Dedicated Waitlist Dialog with 2-step registration & hidden 20% exit offer */}
      <Teaser2WaitlistDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultEmail={email}
      />
    </div>
  );
}
