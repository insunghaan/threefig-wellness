"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, Menu, X } from "lucide-react";
import { getSimulatedWaitlistCount } from "@/lib/threefig/waitlist-counter";
import { Teaser6WaitlistDialog } from "./teaser6-waitlist-dialog";
import { ThreeFigButton } from "./threefig-button";
import { Teaser6Body } from "./teaser6-body";
import { Teaser6PrivacyDialog } from "./teaser6-privacy-dialog";
import { Teaser6ReviewBar } from "./teaser6-review-bar";

export function Teaser6Hero() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [stickyMenuOpen, setStickyMenuOpen] = useState(false);
  const [isLightSurface, setIsLightSurface] = useState(true);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState<boolean | null>(null);

  const finalCtaRef = useRef<HTMLDivElement | null>(null);
  const [emailDraft, setEmailDraft] = useState("");
  const triggerRef = useRef<HTMLElement | null>(null);

  const [hasScrolled, setHasScrolled] = useState(() => {
    if (typeof window !== "undefined") {
      return window.scrollY > 24;
    }
    return false;
  });
  const [hasNextSection, setHasNextSection] = useState(true);

  const mobileMediaRef = useRef<HTMLDivElement | null>(null);

  const [signupCount, setSignupCount] = useState<number | null>(() => {
    try {
      const initial = getSimulatedWaitlistCount();
      return typeof initial?.current === "number" ? initial.current : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 860px)");
    setIsMobileView(mql.matches);

    const onChange = (e: MediaQueryListEvent) => {
      setIsMobileView(e.matches);
    };

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchCount() {
      try {
        const res = await fetch("/api/waitlist/count", { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as { current?: number };
          if (isMounted && typeof data?.current === "number") {
            setSignupCount(data.current);
          }
        }
      } catch {
        // Retain initialized counter
      }
    }

    fetchCount();
    const interval = setInterval(fetchCount, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const target = mobileMediaRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setIsLightSurface(!entry.isIntersecting);
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -76px 0px",
        threshold: 0,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [isMobileView]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      setIsKeyboardOpen(false);
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    const vv = window.visualViewport;
    const handleResize = () => {
      if (vv) {
        setIsKeyboardOpen(vv.height < window.innerHeight * 0.75);
      }
    };

    if (vv) {
      vv.addEventListener("resize", handleResize);
    }

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      if (vv) {
        vv.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  const [isScienceOverlapping, setIsScienceOverlapping] = useState(false);
  const [isFinalCtaOverlapping, setIsFinalCtaOverlapping] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId: number | null = null;

    const checkVisibility = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;

      const atTop = y <= 24;
      setHasScrolled(!atTop);
      setIsScrolled(y > 40);
      setIsLightSurface(y > 300);

      const scienceBtn = document.querySelector<HTMLElement>("[data-science-cta]");
      if (scienceBtn) {
        const rect = scienceBtn.getBoundingClientRect();
        const dockTop = vh - 105;
        const dockBottom = vh;
        const overlaps = rect.bottom >= dockTop && rect.top <= dockBottom;
        setIsScienceOverlapping(overlaps);
      } else {
        setIsScienceOverlapping(false);
      }

      const benefitsBtn =
        document.querySelector<HTMLElement>("[data-benefits-cta]") ||
        finalCtaRef.current;
      if (benefitsBtn) {
        const rect = benefitsBtn.getBoundingClientRect();
        setIsFinalCtaOverlapping((prev) => {
          if (prev) {
            return rect.top < vh + 10;
          } else {
            return rect.top < vh - 50;
          }
        });
      } else {
        setIsFinalCtaOverlapping(false);
      }
    };

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(checkVisibility);
    };

    checkVisibility();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const handleScrollToNext = () => {
    setHasScrolled(true);
    const destination =
      document.getElementById("teaser6-content") ||
      document.querySelector("[data-scroll-destination]");

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (destination) {
      destination.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
      if (destination instanceof HTMLElement) {
        destination.setAttribute("tabIndex", "-1");
        destination.focus({ preventScroll: true });
      }
    } else {
      window.scrollBy({
        top: Math.min(window.innerHeight * 0.75, 450),
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }
  };

  const handleOpenWaitlist = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      if (e.currentTarget instanceof HTMLElement) {
        triggerRef.current = e.currentTarget;
      }
    } else if (typeof document !== "undefined") {
      triggerRef.current = (document.activeElement as HTMLElement) || null;
    }
    setDialogOpen(true);
  };

  const closeMenu = () => setMenuOpen(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setStickyMenuOpen(false);
    setMenuOpen(false);
    const elem = document.getElementById(targetId);
    if (elem) {
      const headerOffset = 70;
      const elementPosition = elem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setStickyMenuOpen(false);
    setMenuOpen(false);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const isAnyOverlayOpen =
    dialogOpen || privacyOpen || menuOpen || stickyMenuOpen || isKeyboardOpen;

  const showMobileCue = !hasScrolled && !isAnyOverlayOpen;
  const showMobileCta =
    hasScrolled &&
    !isAnyOverlayOpen &&
    !isScienceOverlapping &&
    !isFinalCtaOverlapping;

  const isDesktopCueVisible = hasNextSection && !hasScrolled && !dialogOpen;

  return (
    <div className="teaser6-root">
      {/* Internal Review Bar */}
      <Teaser6ReviewBar currentVersion="revision" />

      {/* Sticky Floating Header */}
      <header
        className={`teaser6-sticky-header ${isScrolled || stickyMenuOpen ? "is-scrolled" : "is-top"}`}
        aria-label="3fig Navigation Header"
      >
        <div className="teaser6-sticky-inner">
          <a
            href="/teaser6"
            onClick={handleLogoClick}
            className="teaser6-sticky-brand"
            aria-label="3fig Home"
          >
            <img
              src="/images/threefig-logo.png"
              alt="3fig"
              className="teaser6-sticky-logo-img"
              width={76}
              height={39}
            />
          </a>

          <nav className="teaser6-sticky-nav" aria-label="Main Navigation">
            <a href="#what-you-get" onClick={(e) => handleNavClick(e, "what-you-get")}>
              What you get
            </a>
            <a href="#how-it-works" onClick={(e) => handleNavClick(e, "how-it-works")}>
              How it works
            </a>
            <a href="#ring" onClick={(e) => handleNavClick(e, "ring")}>
              The ring
            </a>
            <a href="#science" onClick={(e) => handleNavClick(e, "science")}>
              Skin science
            </a>
            <a href="#faq" onClick={(e) => handleNavClick(e, "faq")}>
              FAQ
            </a>
          </nav>

          <div className="teaser6-sticky-right">
            <button
              type="button"
              className="teaser6-sticky-cta"
              onClick={handleOpenWaitlist}
              aria-label="Join the waitlist"
            >
              <span className="teaser6-sticky-cta-full">Join the waitlist</span>
              <span className="teaser6-sticky-cta-short">Join</span>
              <ArrowRight size={14} aria-hidden="true" />
            </button>

            <button
              type="button"
              className="teaser6-sticky-menu-btn"
              onClick={() => setStickyMenuOpen((prev) => !prev)}
              aria-label={stickyMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={stickyMenuOpen}
            >
              {stickyMenuOpen ? (
                <X size={20} aria-hidden="true" />
              ) : (
                <Menu size={20} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {stickyMenuOpen && (
          <nav className="teaser6-sticky-mobile-nav" aria-label="Mobile Navigation Drawer">
            <a href="#what-you-get" onClick={(e) => handleNavClick(e, "what-you-get")}>
              What you get
            </a>
            <a href="#how-it-works" onClick={(e) => handleNavClick(e, "how-it-works")}>
              How it works
            </a>
            <a href="#ring" onClick={(e) => handleNavClick(e, "ring")}>
              The ring
            </a>
            <a href="#science" onClick={(e) => handleNavClick(e, "science")}>
              Skin science
            </a>
            <a href="#faq" onClick={(e) => handleNavClick(e, "faq")}>
              FAQ
            </a>
            <button
              type="button"
              className="teaser6-sticky-mobile-nav-cta"
              onClick={() => {
                setStickyMenuOpen(false);
                handleOpenWaitlist();
              }}
            >
              Join the waitlist
            </button>
          </nav>
        )}
      </header>

      {/* DESKTOP SPLIT VIEWPORT */}
      <div className="teaser6-desktop-split">
        {/* Left Column: 55% Content */}
        <section className="teaser6-content-col" aria-label="3fig Introduction">
          <header className="teaser6-header">
            <Link href="/teaser6" className="teaser6-logo" aria-label="3fig Home">
              <img
                src="/images/threefig-logo.png"
                alt="3fig"
                className="teaser6-desktop-logo-img"
                width={102}
                height={52}
                fetchPriority="high"
              />
            </Link>
          </header>

          <div className="teaser6-content-group">
            <h1 className="teaser6-title tf-role-hero-title">
              <span className="teaser6-title-dark">See how your daily habits</span>
              <span className="teaser6-title-brown">relate to your skin.</span>
            </h1>

            <p className="teaser6-desc tf-role-body-lead">
              Meet 3FIG, the first smart ring focused on skin wellness. Continuous sleep, stress, and activity data from the ring pair with your daily skin check-ins to turn complex body signals into one clear Skin Balance insight.
            </p>

            {/* Inputs Highlight Badges */}
            <div className="teaser6-hero-inputs-badge" aria-label="Product inputs">
              <span className="teaser6-input-pill">Sleep insights</span>
              <span className="teaser6-input-pill-dot">•</span>
              <span className="teaser6-input-pill">Stress metrics</span>
              <span className="teaser6-input-pill-dot">•</span>
              <span className="teaser6-input-pill">Daily skin check-ins</span>
            </div>

            {/* Desktop CTA Row */}
            <div className="teaser6-cta-row">
              <ThreeFigButton
                variant="primary"
                className="teaser6-desktop-btn"
                onClick={handleOpenWaitlist}
                aria-label="Join the waitlist"
                ringAccessory={
                  <span className="teaser6-btn-ring-box">
                    <span className="teaser6-ring-float-wrapper">
                      <img
                        src="/images/threefig-ring-cutout-tight.webp"
                        alt=""
                        className="teaser6-btn-ring-img"
                        width={64}
                        height={45}
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                }
              >
                Join the waitlist
              </ThreeFigButton>
            </div>

            {/* Waitlist explicit offer & conditions */}
            <div className="teaser6-hero-offer-text">
              <p className="teaser6-offer-highlight">
                Get the app free for life + 20% off the ring at launch.
              </p>
              <p className="teaser6-offer-conditions">
                No payment required to join. Ring sold separately.
              </p>
            </div>

            {/* Desktop Scroll Cue */}
            {hasNextSection && (
              <div className="teaser6-desktop-cue-wrap">
                <button
                  type="button"
                  className={`teaser6-scroll-cue teaser6-scroll-cue-desktop${isDesktopCueVisible ? "" : " is-hidden"}`}
                  onClick={handleScrollToNext}
                  tabIndex={isDesktopCueVisible ? 0 : -1}
                  aria-hidden={!isDesktopCueVisible}
                  aria-label="Scroll to discover more content below"
                >
                  <span>Explore below</span>
                  <ArrowDown size={16} className="teaser6-scroll-cue-arrow" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: 45% Hero Image Panel */}
        <section className="teaser6-video-col" aria-label="3fig Smart Ring and Skin App">
          <img
            src="/images/newhero0928.png?v=0928v3"
            alt="3fig Smart Ring and Skin Balance app interface"
            className="teaser6-video teaser6-hero-image"
            width={1200}
            height={1500}
            fetchPriority="high"
          />
        </section>
      </div>

      {/* MOBILE VIEWPORT */}
      <div className="teaser6-mobile-wrap">
        <div className="teaser6-mobile-header-container">
          <header className="teaser6-mobile-header-row">
            <Link href="/teaser6" className="teaser6-mobile-logo" aria-label="3fig Home">
              <img
                src="/images/threefig-logo.png"
                alt="3fig"
                className="teaser6-mobile-logo-img"
                width={88}
                height={45}
                fetchPriority="high"
              />
            </Link>

            <button
              type="button"
              className="teaser6-mobile-menu-btn"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg
                  className="teaser6-menu-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg
                  className="teaser6-menu-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </header>

          {menuOpen && (
            <nav className="teaser6-mobile-nav" aria-label="Mobile Navigation">
              <a href="#what-you-get" onClick={(e) => handleNavClick(e, "what-you-get")}>
                What you get
              </a>
              <a href="#how-it-works" onClick={(e) => handleNavClick(e, "how-it-works")}>
                How it works
              </a>
              <a href="#ring" onClick={(e) => handleNavClick(e, "ring")}>
                The ring
              </a>
              <a href="#science" onClick={(e) => handleNavClick(e, "science")}>
                Skin science
              </a>
              <a href="#faq" onClick={(e) => handleNavClick(e, "faq")}>
                FAQ
              </a>
              <button
                type="button"
                className="teaser6-nav-cta-btn"
                onClick={() => {
                  closeMenu();
                  handleOpenWaitlist();
                }}
              >
                Join the waitlist
              </button>
            </nav>
          )}
        </div>

        <div className="teaser6-mobile-flex-spacer" aria-hidden="true" />

        {/* Mobile Headline & Description */}
        <div className="teaser6-mobile-content-group">
          <h1 className="teaser6-title tf-role-hero-title">
            <span className="teaser6-title-dark">See how your daily habits</span>
            <span className="teaser6-title-brown">relate to your skin.</span>
          </h1>

          <p className="teaser6-desc tf-role-body-lead">
            Meet 3FIG, the first smart ring focused on skin wellness. Continuous sleep, stress, and activity data pair with daily skin check-ins to reveal your Skin Balance Score.
          </p>

          <div className="teaser6-hero-inputs-badge" aria-label="Product inputs">
            <span className="teaser6-input-pill">Sleep insights</span>
            <span className="teaser6-input-pill-dot">•</span>
            <span className="teaser6-input-pill">Stress metrics</span>
            <span className="teaser6-input-pill-dot">•</span>
            <span className="teaser6-input-pill">Daily skin check-ins</span>
          </div>

          <div className="teaser6-mobile-inline-offer">
            <p className="teaser6-offer-highlight">
              App free for life + 20% off ring at launch.
            </p>
          </div>
        </div>

        {/* Bottom Image Section */}
        <section
          ref={mobileMediaRef}
          className="teaser6-mobile-media-col"
          data-theme="light"
          aria-label="3fig Smart Ring Preview"
        >
          <img
            src="/images/newhero0928.png?v=0928v3"
            alt="3fig Smart Ring and Skin Balance app"
            className="teaser6-video teaser6-hero-image"
            width={1200}
            height={1500}
            fetchPriority="high"
          />
        </section>
      </div>

      {/* Main Content Sections */}
      <Teaser6Body
        ref={finalCtaRef}
        onOpenWaitlist={handleOpenWaitlist}
        onOpenPrivacy={() => setPrivacyOpen(true)}
      />

      {/* Privacy Dialog */}
      <Teaser6PrivacyDialog
        open={privacyOpen}
        onOpenChange={setPrivacyOpen}
      />

      {/* Mobile Initial Scroll Cue */}
      <div
        className={`teaser6-mobile-cue-fixed${showMobileCue ? " is-visible" : " is-hidden"}`}
        aria-hidden={!showMobileCue}
      >
        <button
          type="button"
          className="teaser6-scroll-cue teaser6-scroll-cue-mobile"
          onClick={handleScrollToNext}
          tabIndex={showMobileCue ? 0 : -1}
          aria-label="Scroll to discover more content below"
        >
          <span>Explore below</span>
          <ArrowDown size={16} className="teaser6-scroll-cue-arrow" aria-hidden="true" />
        </button>
      </div>

      {/* Mobile Floating CTA Dock */}
      <aside
        className={`teaser6-mobile-dock${
          isLightSurface ? " is-light-surface" : " is-dark-surface"
        }${showMobileCta ? " is-revealed" : " is-collapsed"}`}
        aria-hidden={!showMobileCta}
        aria-label="Waitlist registration"
      >
        <div className="teaser6-mobile-dock-inner">
          <ThreeFigButton
            variant="overlay"
            className="teaser6-mobile-btn"
            onClick={handleOpenWaitlist}
            tabIndex={showMobileCta ? 0 : -1}
            aria-label="Join the waitlist"
            ringAccessory={
              <span className={`teaser6-mobile-ring-box${showMobileCta ? " is-active" : " is-paused"}`}>
                <span className="teaser6-ring-float-wrapper">
                  <img
                    src="/images/threefig-ring-cutout-tight.webp"
                    alt=""
                    className="teaser6-mobile-ring-img"
                    width={60}
                    height={42}
                    aria-hidden="true"
                  />
                </span>
              </span>
            }
          >
            Join the waitlist
          </ThreeFigButton>
        </div>
      </aside>

      {/* Interactive Waitlist Dialog */}
      <Teaser6WaitlistDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        emailDraft={emailDraft}
        onEmailDraftChange={setEmailDraft}
        triggerElement={triggerRef.current}
      />
    </div>
  );
}
