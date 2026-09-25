"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { captureBrowserAttribution, type Attribution } from "@/lib/threefig/attribution";
import { trackEvent } from "./analytics";
import { ArrowRight, Menu, X } from "lucide-react";
import { Teaser2ValueSection } from "./teaser2-value-section";
import { Teaser2HowItWorks } from "./teaser2-how-it-works";
import { Teaser2Science } from "./teaser2-science";
import { Teaser2Testimonials } from "./teaser2-testimonials";
import { Teaser2Faq } from "./teaser2-faq";
import { Teaser2WaitlistDialog } from "./teaser2-waitlist-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import "@/app/teaser2.css";

export default function Teaser2Landing() {
  const attribution = useRef<Attribution | null>(null);
  const signupStarted = useRef(false);

  useEffect(() => {
    attribution.current = captureBrowserAttribution();
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showFloatingCta, setShowFloatingCta] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const heroRef = useRef<HTMLElement | null>(null);
  const benefitRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;

    const handleScrollOrResize = () => {
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

    handleScrollOrResize();
    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, []);

  function openWaitlist(
    placement: "header" | "hero" | "brand_moment" | "ring" | "signup" | "mobile_floating"
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
    <div className="teaser2-page teaser2-standalone">
      <a className="skin-skip" href="#main">
        Skip to content
      </a>

      {/* ============================================================
          HEADER
          ============================================================ */}
      <header
        className={`teaser2-header ${
          isScrolled || menuOpen ? "is-scrolled" : "is-top"
        }`}
      >
        <div className="teaser2-header-inner">
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
            className={menuOpen ? "teaser2-nav is-open" : "teaser2-nav"}
            aria-label="Main navigation"
          >
            <a href="#value" onClick={closeMenu}>What you get</a>
            <a href="#how-it-works" onClick={closeMenu}>How it works</a>
            <a href="#ring" onClick={closeMenu}>The ring</a>
            <a href="#science" onClick={closeMenu}>Skin science</a>
            <a href="#faq" onClick={closeMenu}>FAQ</a>
          </nav>

          <div className="teaser2-header-right">
            <button
              className="teaser2-header-cta"
              type="button"
              onClick={() => openWaitlist("header")}
            >
              <span className="skin-border-beam" aria-hidden="true" />
              <span className="teaser2-cta-text-full">Claim Free Lifetime Access</span>
              <span className="teaser2-cta-text-short">Free Lifetime Access</span>
              <ArrowRight size={15} />
            </button>

            <button
              className="teaser2-menu-btn"
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <main id="main">
        {/* ============================================================
            01 — HERO (FULL VIEWPORT, SOLID COLOR PLACEHOLDER)
            ============================================================ */}
        <section className="teaser2-hero" ref={heroRef}>
          {/* Future desktop & mobile cover photography slots into this container */}
          <div className="teaser2-hero-bg" aria-hidden="true" />

          <div className="teaser2-hero-content">
            <p className="teaser2-eyebrow">THE SKIN WELLNESS RING</p>
            <h1 className="teaser2-hero-title">
              The smart ring.<br />
              <em>For skin wellness.</em>
            </h1>
            <p className="teaser2-hero-lead">
              Sleep, recovery, and your skin check-ins — one clearer picture of what your skin responds to.
            </p>

            <div className="teaser2-hero-actions">
              <button
                className="teaser2-hero-btn"
                type="button"
                onClick={() => openWaitlist("hero")}
              >
                <span className="skin-border-beam" aria-hidden="true" />
                <span>Claim Free Lifetime Access</span>
                <ArrowRight size={18} />
              </button>

              <p className="teaser2-hero-microcopy">
                Membership free for life. Ring sold separately.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================
            02 — PRODUCT EXPERIENCE (HORIZONTAL SLIDER)
            ============================================================ */}
        <Teaser2ValueSection />

        {/* ============================================================
            03 — HOW IT WORKS (HORIZONTAL SLIDER)
            ============================================================ */}
        <Teaser2HowItWorks />

        {/* ============================================================
            04 — MID-PAGE BRAND MOMENT (TYPOGRAPHIC COLOR FIELD RESET)
            ============================================================ */}
        <section className="teaser2-brand-moment-section" aria-label="Brand reflection">
          <div className="teaser2-brand-moment-content">
            <h2 className="teaser2-brand-moment-title">
              Life happens.<br />
              <em>Skin notices.</em>
            </h2>
            <p className="teaser2-brand-moment-lead">
              3FIG helps you notice what tends to come with it.
            </p>
            <div className="teaser2-brand-moment-actions">
              <button
                className="teaser2-brand-moment-btn"
                type="button"
                onClick={() => openWaitlist("brand_moment")}
              >
                <span className="skin-border-beam" aria-hidden="true" />
                <span>Claim Free Lifetime Access</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================
            05 — HARDWARE (IMAGE-LED COMPOSITION)
            ============================================================ */}
        <section id="ring" className="teaser2-hardware-section" aria-labelledby="ring-title">
          <div className="teaser2-hardware-container">
            <div className="teaser2-hardware-media">
              <img
                src="/images/teaser2-ring-still-life.webp"
                alt="Polished silver 3FIG smart ring standing upright on sculptural dark charcoal stone"
                className="teaser2-hardware-img"
                loading="eager"
                decoding="sync"
                width={744}
                height={952}
              />
            </div>
            <div className="teaser2-hardware-copy">
              <p className="teaser2-eyebrow">THE SENSING FOUNDATION</p>
              <h2 id="ring-title" className="teaser2-section-title">
                Always on.<br />
                <em>Never in the way.</em>
              </h2>
              <p className="teaser2-section-lead">
                Featherlight titanium engineered for effortless 24/7 wear.
              </p>

              <div className="teaser2-hardware-benefits">
                <div className="teaser2-hardware-benefit-item">
                  <strong>Sleep-friendly</strong>
                  <span>Discreet sensors with zero screen or vibration to disturb your rest.</span>
                </div>
                <div className="teaser2-hardware-benefit-item">
                  <strong>Everyday-ready</strong>
                  <span>Water-resistant titanium built for daily showers and workouts.</span>
                </div>
                <div className="teaser2-hardware-benefit-item">
                  <strong>Quiet by design</strong>
                  <span>Continuous background sensing with multi-day battery life.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            06 — SCIENCE (EDITORIAL LINKS)
            ============================================================ */}
        <Teaser2Science />

        {/* ============================================================
            07 — TESTIMONIALS (EARLY VOICES)
            ============================================================ */}
        <Teaser2Testimonials />

        {/* ============================================================
            08 — FAQ (QUIET UTILITY)
            ============================================================ */}
        <Teaser2Faq />

        {/* ============================================================
            09 — FINAL CTA (CONVERSION MOMENT)
            ============================================================ */}
        <section id="updates" className="teaser2-final-section" aria-labelledby="conversion-title">
          <div className="teaser2-final-motion" aria-hidden="true">
            <span className="teaser2-final-light teaser2-final-light-a" />
            <span className="teaser2-final-light teaser2-final-light-b" />
          </div>
          <div className="teaser2-final-content">
            <p className="teaser2-eyebrow">FOUNDING MEMBER ACCESS</p>
            <h2 id="conversion-title" className="teaser2-final-title">
              Your membership.<br />
              <em>Free for life.</em>
            </h2>
            <p className="teaser2-final-lead">
              Join early and keep your 3FIG membership free for life.
            </p>

            <div className="teaser2-final-actions" ref={benefitRef}>
              <button
                type="button"
                className="teaser2-final-btn"
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

      {/* ============================================================
          FOOTER (FULL-WIDTH EDGE-TO-EDGE)
          ============================================================ */}
      <footer className="teaser2-footer">
        <div className="teaser2-footer-inner">
          <button
            type="button"
            className="teaser2-footer-privacy-btn"
            onClick={() => setPrivacyOpen(true)}
          >
            Privacy &amp; Analytics
          </button>
          <span className="teaser2-footer-copyright">© 2026 3FIG</span>
        </div>
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

      {/* Dedicated Waitlist Dialog with 2-step registration & hidden 20% exit offer */}
      <Teaser2WaitlistDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
