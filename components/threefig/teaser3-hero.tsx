"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { getSimulatedWaitlistCount } from "@/lib/threefig/waitlist-counter";
import { Teaser3WaitlistDialog } from "./teaser3-waitlist-dialog";
import { ThreeFigButton } from "./threefig-button";

export function Teaser3Hero() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLightSurface, setIsLightSurface] = useState(false);
  const [isHandoffHidden, setIsHandoffHidden] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState<boolean | null>(null);

  // Email draft and selected offer preserved above popup content across reopens
  const [emailDraft, setEmailDraft] = useState("");
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Scroll discovery cue contract & lifecycle
  const [hasScrolled, setHasScrolled] = useState(false);
  const [hasNextSection, setHasNextSection] = useState(true);

  const desktopVideoRef = useRef<HTMLVideoElement | null>(null);
  const mobileVideoRef = useRef<HTMLVideoElement | null>(null);
  const mobileMediaRef = useRef<HTMLDivElement | null>(null);

  const [signupCount, setSignupCount] = useState<number | null>(() => {
    try {
      const initial = getSimulatedWaitlistCount();
      return typeof initial?.current === "number" ? initial.current : null;
    } catch {
      return null;
    }
  });

  // Track active viewport (mobile vs desktop) to prevent duplicate downloads
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

  // Video playback management: pause when offscreen or tab is hidden, resume when visible
  useEffect(() => {
    const activeVideo = isMobileView ? mobileVideoRef.current : desktopVideoRef.current;
    if (!activeVideo) return;

    const handleVisibility = () => {
      if (document.hidden) {
        activeVideo.pause();
      } else {
        activeVideo.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            activeVideo.play().catch(() => {});
          } else {
            activeVideo.pause();
          }
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(activeVideo);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      observer.disconnect();
    };
  }, [isMobileView]);

  // Pause background hero playback while modal is open, resume when closed and appropriate
  useEffect(() => {
    const activeVideo = isMobileView ? mobileVideoRef.current : desktopVideoRef.current;
    if (!activeVideo) return;

    if (dialogOpen) {
      activeVideo.pause();
    } else {
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!prefersReduced && !document.hidden) {
        activeVideo.play().catch(() => {});
      }
    }
  }, [dialogOpen, isMobileView]);

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

  // Benefits CTA handoff observer: hides persistent dock when inline [data-benefits-cta] is visible
  useEffect(() => {
    let obs: IntersectionObserver | null = null;

    const setupObserver = () => {
      const target = document.querySelector("[data-benefits-cta]");
      if (!target) return;

      if (obs) obs.disconnect();

      obs = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            setIsHandoffHidden(entry.isIntersecting);
          }
        },
        {
          root: null,
          rootMargin: "0px 0px -76px 0px",
          threshold: [0, 0.2],
        }
      );

      obs.observe(target);
    };

    setupObserver();

    // Check periodically or on DOM mutations in case the benefits section mounts later
    const mutObs = new MutationObserver(() => {
      setupObserver();
    });
    mutObs.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (obs) obs.disconnect();
      mutObs.disconnect();
    };
  }, []);

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

  // Track scroll threshold (24px) - dismiss cue for remainder of visit
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.scrollY > 24) {
      setHasScrolled(true);
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > 24) {
        setHasScrolled(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToNext = () => {
    setHasScrolled(true);
    const destination =
      document.getElementById("teaser3-content") ||
      document.querySelector("[data-scroll-destination]");

    if (destination) {
      destination.scrollIntoView({ behavior: "smooth" });
      if (destination instanceof HTMLElement) {
        destination.setAttribute("tabIndex", "-1");
        destination.focus({ preventScroll: true });
      }
    } else {
      // Smoothly scroll down so user immediately experiences discovery motion
      window.scrollBy({
        top: Math.min(window.innerHeight * 0.75, 450),
        behavior: "smooth",
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

  // Floating dock is hidden if waitlist dialog is open, handoff target is in view, or keyboard is open
  const isDockHidden = dialogOpen || isHandoffHidden || isKeyboardOpen;
  const isCueVisible = hasNextSection && !hasScrolled && !dialogOpen;

  return (
    <div className="teaser3-root">
      {/* ====================================================================
          DESKTOP VIEWPORT (Split 55% Content / 45% Video)
          ==================================================================== */}
      <div className="teaser3-desktop-split">
        {/* Left Column: 55% Content */}
        <section className="teaser3-content-col" aria-label="3FIG Introduction">
          <header className="teaser3-header">
            <Link href="/teaser3" className="teaser3-logo" aria-label="3FIG Home">
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
              <span className="teaser3-title-dark">The smart ring</span>
              <span className="teaser3-title-brown">for skin wellness</span>
            </h1>

            <p className="teaser3-desc tf-role-body-lead">
              Meet 3FIG, a smart ring designed to turn sleep, stress and daily check-ins into your Skin Balance Score. Explore the patterns between your everyday habits and how your skin feels.
            </p>

            {/* Desktop CTA Row: Solid-Black Pill Button + Plain Text Waitlist Count */}
            <div className="teaser3-cta-row">
              <ThreeFigButton
                variant="primary"
                className="teaser3-desktop-btn"
                onClick={handleOpenWaitlist}
                aria-label="Count me in"
                ringAccessory={
                  <span className="teaser3-btn-ring-box">
                    <span className="teaser3-ring-float-wrapper">
                      <img
                        src="/images/threefig-ring-cutout-tight.webp"
                        alt=""
                        className="teaser3-btn-ring-img"
                        width={64}
                        height={45}
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                }
              >
                Count me in
              </ThreeFigButton>

              {signupCount !== null && (
                <span className="teaser3-count-text">
                  {signupCount.toLocaleString()} on the waitlist.
                </span>
              )}
            </div>

            {/* Desktop Scroll-Discovery Cue: 20-24px below CTA/count row, left-aligned */}
            {hasNextSection && (
              <div className="teaser3-desktop-cue-wrap">
                <button
                  type="button"
                  className={`teaser3-scroll-cue${isCueVisible ? "" : " is-hidden"}`}
                  onClick={handleScrollToNext}
                  tabIndex={isCueVisible ? 0 : -1}
                  aria-hidden={!isCueVisible}
                  aria-label="Scroll to discover more content below"
                >
                  <span>A little more below</span>
                  <ArrowDown size={15} className="teaser3-scroll-cue-arrow" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: 45% Hero Video Panel */}
        <section className="teaser3-video-col" aria-label="3FIG Smart Ring Video Preview">
          <video
            ref={desktopVideoRef}
            className="teaser3-video"
            poster="/images/teaser3-desktop-poster.webp"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
            suppressHydrationWarning
          >
            {isMobileView === false && (
              <source src="/video/teaser3-hero-desktop.mp4" type="video/mp4" />
            )}
          </video>
        </section>
      </div>

      {/* ====================================================================
          MOBILE VIEWPORT: Viewport-aware Flex Column Structure
          ==================================================================== */}
      <div className="teaser3-mobile-wrap">
        {/* Mobile Header: Logo near top, all-black logo */}
        <div className="teaser3-mobile-header-container">
          <header className="teaser3-mobile-header-row">
            <Link href="/teaser3" className="teaser3-mobile-logo" aria-label="3FIG Home">
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
              <a href="/#experience" onClick={closeMenu}>Skin Rhythm</a>
              <a href="/#inputs" onClick={closeMenu}>The inputs</a>
              <a href="/#ring" onClick={closeMenu}>The ring</a>
              <a href="/#evidence" onClick={closeMenu}>The science</a>
              <button
                type="button"
                className="teaser3-nav-cta-btn"
                onClick={() => {
                  closeMenu();
                  handleOpenWaitlist();
                }}
              >
                Claim Free Lifetime Access
              </button>
            </nav>
          )}
        </div>

        {/* Flexible Space: Absorbs extra vertical space between header & copy on tall screens */}
        <div className="teaser3-mobile-flex-spacer" aria-hidden="true" />

        {/* Mobile Headline & Description in Normal Flow */}
        <div className="teaser3-mobile-content-group">
          <h1 className="teaser3-title tf-role-hero-title">
            <span className="teaser3-title-dark">The smart ring</span>
            <span className="teaser3-title-brown">for skin wellness</span>
          </h1>

          <p className="teaser3-desc tf-role-body-lead">
            Meet 3FIG, a smart ring designed to turn sleep, stress and daily check-ins into your Skin Balance Score. Explore the patterns between your everyday habits and how your skin feels.
          </p>
        </div>

        {/* Bottom Video Section: 4:5 aspect ratio, meets viewport bottom on tall screens */}
        <section
          ref={mobileMediaRef}
          className="teaser3-mobile-media-col"
          data-theme="dark"
          aria-label="3FIG Video Preview"
        >
          <video
            ref={mobileVideoRef}
            className="teaser3-video"
            poster="/images/teaser3-mobile-poster.webp"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
            suppressHydrationWarning
          >
            {isMobileView === true && (
              <source src="/video/teaser3-hero-mobile.mp4" type="video/mp4" />
            )}
          </video>
        </section>
      </div>

      {/* ====================================================================
          PERSISTENT MOBILE CTA DOCK: Fixed to Viewport Bottom
          ==================================================================== */}
      <aside
        className={`teaser3-mobile-dock${
          isLightSurface ? " is-light-surface" : " is-dark-surface"
        }${isDockHidden ? " is-hidden" : ""}`}
        aria-hidden={isDockHidden}
        aria-label="Waitlist registration"
      >
        {/* Mobile Scroll-Discovery Cue: 12-16px ABOVE fixed CTA dock, left-aligned */}
        {hasNextSection && (
          <div
            className={`teaser3-mobile-cue-wrap${isCueVisible && !isDockHidden ? "" : " is-hidden"}`}
            aria-hidden={!isCueVisible || isDockHidden}
          >
            <button
              type="button"
              className="teaser3-scroll-cue"
              onClick={handleScrollToNext}
              tabIndex={isCueVisible && !isDockHidden ? 0 : -1}
              aria-label="Scroll to discover more content below"
            >
              <span>A little more below</span>
              <ArrowDown size={15} className="teaser3-scroll-cue-arrow" aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="teaser3-mobile-dock-inner">
          <ThreeFigButton
            variant="overlay"
            className="teaser3-mobile-btn"
            onClick={handleOpenWaitlist}
            tabIndex={isDockHidden ? -1 : 0}
            aria-label="Count me in"
            ringAccessory={
              <span className="teaser3-mobile-ring-box">
                <span className="teaser3-ring-float-wrapper">
                  <img
                    src="/images/threefig-ring-cutout-tight.webp"
                    alt=""
                    className="teaser3-mobile-ring-img"
                    width={60}
                    height={42}
                    aria-hidden="true"
                  />
                </span>
              </span>
            }
          >
            Count me in
          </ThreeFigButton>

          {signupCount !== null && (
            <span className="teaser3-mobile-count-text">
              {signupCount.toLocaleString()} on the waitlist.
            </span>
          )}
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
