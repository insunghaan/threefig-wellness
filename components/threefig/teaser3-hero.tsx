"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, Menu, X } from "lucide-react";
import { getSimulatedWaitlistCount } from "@/lib/threefig/waitlist-counter";
import { Teaser3WaitlistDialog } from "./teaser3-waitlist-dialog";
import { ThreeFigButton } from "./threefig-button";
import { Teaser3Body } from "./teaser3-body";
import { Teaser3PrivacyDialog } from "./teaser3-privacy-dialog";

export function Teaser3Hero() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [stickyMenuOpen, setStickyMenuOpen] = useState(false);
  const [isLightSurface, setIsLightSurface] = useState(true);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState<boolean | null>(null);

  const finalCtaRef = useRef<HTMLDivElement | null>(null);

  // Email draft and selected offer preserved above popup content across reopens
  const [emailDraft, setEmailDraft] = useState("");
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Scroll discovery cue & floating CTA lifecycle
  // If page restores at an already-scrolled position (>24px), activate hasScrolled immediately without flash
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

  // Track active viewport (mobile vs desktop)
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 860px)");
    setIsMobileView(mql.matches);

    const onChange = (e: MediaQueryListEvent) => {
      setIsMobileView(e.matches);
    };

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Fetch simulated waitlist count on intervals
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

  // Contrast observer: determines if mobile dock is over dark video or light background
  useEffect(() => {
    const target = mobileMediaRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // If the hero video intersects the dock's bottom area, dock is over dark surface
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



  // Conceal dock when virtual keyboard appears or input is focused
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

  // Scroll discovery cue contract & detection
  // Active by default for immediate user discovery
  useEffect(() => {
    const checkNext = () => {
      // Keep active by default; if developer explicitly sets false, respect it
      const forceHide = (window as unknown as { __hideTeaser3ScrollCue?: boolean }).__hideTeaser3ScrollCue;
      if (forceHide) {
        setHasNextSection(false);
      } else {
        setHasNextSection(true);
      }
    };

    checkNext();
    if (typeof window !== "undefined") {
      (window as unknown as { __setTeaser3NextContentAvailable?: (val: boolean) => void }).__setTeaser3NextContentAvailable = (val: boolean) => {
        setHasNextSection(val);
      };
    }
  }, []);

  // Coordinated Mobile Visibility Controller
  // Tracks scroll depth, collision avoidance with 'Explore Skin Science' & final inline signup, and modal/menu states
  const [isScienceOverlapping, setIsScienceOverlapping] = useState(false);
  const [isFinalCtaOverlapping, setIsFinalCtaOverlapping] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId: number | null = null;

    const checkVisibility = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;

      // 1. Initial Hero landing vs Scrolled state (restores cue if user scrolls back to top)
      const atTop = y <= 24;
      setHasScrolled(!atTop);
      setIsScrolled(y > 40);
      setIsLightSurface(y > 300);

      // 2. Track Collision with "Explore Skin Science" ([data-science-cta])
      const scienceBtn = document.querySelector<HTMLElement>("[data-science-cta]");
      if (scienceBtn) {
        const rect = scienceBtn.getBoundingClientRect();
        // Floating dock zone: bottom 0 to ~95px from window bottom with 15px buffer
        const dockTop = vh - 105;
        const dockBottom = vh;
        // Suppress if the science button vertically overlaps the floating dock zone
        const overlaps = rect.bottom >= dockTop && rect.top <= dockBottom;
        setIsScienceOverlapping(overlaps);
      } else {
        setIsScienceOverlapping(false);
      }

      // 3. Track Collision with Final Inline Benefits CTA ([data-benefits-cta])
      const benefitsBtn =
        document.querySelector<HTMLElement>("[data-benefits-cta]") ||
        finalCtaRef.current;
      if (benefitsBtn) {
        const rect = benefitsBtn.getBoundingClientRect();
        // Hide before it collides: once the top of the benefits button enters within 60px of the dock
        // With hysteresis to eliminate flicker during fast scrolling
        setIsFinalCtaOverlapping((prev) => {
          if (prev) {
            // Restore only if scrolled back down/up far away from viewport bottom
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

    // Initial check on mount
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
      document.getElementById("teaser3-content") ||
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
      // Smoothly scroll down so user immediately experiences discovery motion
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

  // Any open menu, dialog, or modal suppresses the floating dock
  const isAnyOverlayOpen =
    dialogOpen || privacyOpen || menuOpen || stickyMenuOpen || isKeyboardOpen;

  // Coordinated Mobile States:
  // - Initial landing (!hasScrolled): Show centered scroll cue only, hide CTA
  // - After scroll (hasScrolled): Reveal floating CTA dock, hide scroll cue
  // - Suppress CTA when colliding with 'Explore Skin Science' or final inline signup
  // - Suppress CTA when any menu or dialog is open
  const showMobileCue = !hasScrolled && !isAnyOverlayOpen;
  const showMobileCta =
    hasScrolled &&
    !isAnyOverlayOpen &&
    !isScienceOverlapping &&
    !isFinalCtaOverlapping;

  // Desktop States:
  // - CTA is always visible
  // - Cue is visible initially and hides after scroll (>24px) or during dialog
  const isDesktopCueVisible = hasNextSection && !hasScrolled && !dialogOpen;

  return (
    <div className="teaser3-root">
      {/* ====================================================================
          STICKY FLOATING HEADER
          Appears on scroll-down (both desktop and mobile), hides at top
          ==================================================================== */}
      <header
        className={`teaser3-sticky-header ${isScrolled || stickyMenuOpen ? "is-scrolled" : "is-top"}`}
        aria-label="3fig Navigation Header"
      >
        <div className="teaser3-sticky-inner">
          <a
            href="/teaser3"
            onClick={handleLogoClick}
            className="teaser3-sticky-brand"
            aria-label="3fig Home"
          >
            <img
              src="/images/threefig-logo.png"
              alt="3fig"
              className="teaser3-sticky-logo-img"
              width={76}
              height={39}
            />
          </a>

          <nav className="teaser3-sticky-nav" aria-label="Main Navigation">
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

          <div className="teaser3-sticky-right">
            <button
              type="button"
              className="teaser3-sticky-cta"
              onClick={handleOpenWaitlist}
              aria-label="Get early access"
            >
              <span className="teaser3-sticky-cta-full">Get early access</span>
              <span className="teaser3-sticky-cta-short">Get early access</span>
              <ArrowRight size={14} aria-hidden="true" />
            </button>

            <button
              type="button"
              className="teaser3-sticky-menu-btn"
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

        {/* Mobile Dropdown Navigation for Sticky Header */}
        {stickyMenuOpen && (
          <nav className="teaser3-sticky-mobile-nav" aria-label="Mobile Navigation Drawer">
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
              className="teaser3-sticky-mobile-nav-cta"
              onClick={() => {
                setStickyMenuOpen(false);
                handleOpenWaitlist();
              }}
            >
              Get early access
            </button>
          </nav>
        )}
      </header>
      {/* ====================================================================
          DESKTOP VIEWPORT (Split 55% Content / 45% Video)
          ==================================================================== */}
      <div className="teaser3-desktop-split">
        {/* Left Column: 55% Content */}
        <section className="teaser3-content-col" aria-label="3fig Introduction">
          <header className="teaser3-header">
            <Link href="/teaser3" className="teaser3-logo" aria-label="3fig Home">
              <img
                src="/images/threefig-logo.png"
                alt="3fig"
                className="teaser3-desktop-logo-img"
                width={102}
                height={52}
                fetchPriority="high"
              />
            </Link>
          </header>

          <div className="teaser3-content-group">
            <h1 className="teaser3-title tf-role-hero-title">
              <span className="teaser3-title-dark">Skin Balance.</span>
              <span className="teaser3-title-brown">Built from your body signals.</span>
            </h1>

            <p className="teaser3-desc tf-role-body-lead">
              Track sleep, stress signals, and recovery. Add a skin check-in. See your daily Skin Balance and the patterns behind it.
            </p>

            {/* Desktop CTA Row: Solid-Black Pill Button + Plain Text Waitlist Count */}
            <div className="teaser3-cta-row">
              <ThreeFigButton
                variant="primary"
                className="teaser3-desktop-btn"
                onClick={handleOpenWaitlist}
                aria-label="Get early access"
              >
                Get early access
              </ThreeFigButton>
            </div>
          </div>
        </section>

        {/* Right Column: 45% Hero Image Panel */}
        <section className="teaser3-video-col" aria-label="3fig Smart Ring Preview">
          <picture className="teaser3-hero-picture">
            <source type="image/webp" srcSet="/images/teaser3/hero-ring-phone.webp" />
            <img
              src="/images/teaser3/hero-ring-phone.jpg"
              alt="3fig Smart Ring and Skin Balance app"
              className="teaser3-video teaser3-hero-image"
              width={910}
              height={1024}
              fetchPriority="high"
              decoding="async"
            />
          </picture>
        </section>
      </div>

      {/* ====================================================================
          MOBILE VIEWPORT: Viewport-aware Flex Column Structure
          ==================================================================== */}
      <div className="teaser3-mobile-wrap">
        {/* Mobile Header: Logo near top, all-black logo */}
        <div className="teaser3-mobile-header-container">
          <header className="teaser3-mobile-header-row">
            <Link href="/teaser3" className="teaser3-mobile-logo" aria-label="3fig Home">
              <img
                src="/images/threefig-logo.png"
                alt="3fig"
                className="teaser3-mobile-logo-img"
                width={88}
                height={45}
                fetchPriority="high"
              />
            </Link>

            <button
              type="button"
              className="teaser3-mobile-menu-btn"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg
                  className="teaser3-menu-icon"
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
                  className="teaser3-menu-icon"
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

          {/* Mobile Navigation Drawer / Dropdown */}
          {menuOpen && (
            <nav className="teaser3-mobile-nav" aria-label="Mobile Navigation">
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
                className="teaser3-nav-cta-btn"
                onClick={() => {
                  closeMenu();
                  handleOpenWaitlist();
                }}
              >
                Get early access
              </button>
            </nav>
          )}
        </div>

        {/* Flexible Space: Absorbs extra vertical space between header & copy on tall screens */}
        <div className="teaser3-mobile-flex-spacer" aria-hidden="true" />

        {/* Mobile Headline & Description in Normal Flow */}
        <div className="teaser3-mobile-content-group">
          <h1 className="teaser3-title tf-role-hero-title">
            <span className="teaser3-title-dark">Skin Balance.</span>
            <span className="teaser3-title-brown">Built from your body signals.</span>
          </h1>

          <p className="teaser3-desc tf-role-body-lead">
            Track sleep, stress signals, and recovery. Add a skin check-in. See your daily Skin Balance and the patterns behind it.
          </p>

          {/* Mobile Hero Landing CTA: Left-aligned between copy and image */}
          <div className="teaser3-mobile-hero-cta-wrap">
            <ThreeFigButton
              variant="primary"
              className="teaser3-mobile-hero-cta-btn"
              onClick={handleOpenWaitlist}
              aria-label="Get early access"
            >
              Get early access
            </ThreeFigButton>
          </div>
        </div>

        {/* Bottom Image Section: 4:5 aspect ratio, meets viewport bottom on tall screens */}
        <section
          ref={mobileMediaRef}
          className="teaser3-mobile-media-col"
          data-theme="light"
          aria-label="3fig Smart Ring Preview"
        >
          <picture className="teaser3-hero-picture">
            <source type="image/webp" srcSet="/images/teaser3/hero-ring-phone.webp" />
            <img
              src="/images/teaser3/hero-ring-phone.jpg"
              alt="3fig Smart Ring and Skin Balance app"
              className="teaser3-video teaser3-hero-image"
              width={910}
              height={1024}
              fetchPriority="high"
              decoding="async"
            />
          </picture>
        </section>
      </div>

      {/* ====================================================================
          BELOW-THE-HERO BODY CONTENT (SECTIONS A THROUGH I)
          Migrated from Teaser2 and redesigned to match Teaser3 visual identity
          ==================================================================== */}
      <Teaser3Body
        ref={finalCtaRef}
        onOpenWaitlist={handleOpenWaitlist}
        onOpenPrivacy={() => setPrivacyOpen(true)}
      />

      {/* Privacy & Analytics Dialog */}
      <Teaser3PrivacyDialog
        open={privacyOpen}
        onOpenChange={setPrivacyOpen}
      />

      {/* ====================================================================
          COORDINATED MOBILE OVERLAYS: Fixed to Viewport Bottom
          - Floating CTA dock (slides up after scroll)
          ==================================================================== */}

      {/* Mobile Floating CTA Dock (Slides upward after scroll) */}
      <aside
        className={`teaser3-mobile-dock${
          isLightSurface ? " is-light-surface" : " is-dark-surface"
        }${showMobileCta ? " is-revealed" : " is-collapsed"}`}
        aria-hidden={!showMobileCta}
        aria-label="Waitlist registration"
      >
        <div className="teaser3-mobile-dock-inner">
          <ThreeFigButton
            variant="overlay"
            className="teaser3-mobile-btn"
            onClick={handleOpenWaitlist}
            tabIndex={showMobileCta ? 0 : -1}
            aria-label="Get early access"
          >
            Get early access
          </ThreeFigButton>
        </div>
      </aside>

      {/* Interactive Waitlist Dialog with preserved draft, offer, and trigger focus */}
      <Teaser3WaitlistDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        emailDraft={emailDraft}
        onEmailDraftChange={setEmailDraft}
        selectedOffer={selectedOffer}
        onOfferSelect={setSelectedOffer}
        triggerElement={triggerRef.current}
      />
    </div>
  );
}
