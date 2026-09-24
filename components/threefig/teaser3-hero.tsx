"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getSimulatedWaitlistCount } from "@/lib/threefig/waitlist-counter";
import { Teaser3WaitlistDialog } from "./teaser3-waitlist-dialog";
import { ThreeFigButton } from "./threefig-button";

export function Teaser3Hero() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signupCount, setSignupCount] = useState<number | null>(() => {
    try {
      const initial = getSimulatedWaitlistCount();
      return typeof initial?.current === "number" ? initial.current : null;
    } catch {
      return null;
    }
  });

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

  const handleOpenWaitlist = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setDialogOpen(true);
  };

  const closeMenu = () => setMenuOpen(false);

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
                    <img
                      src="/images/threefig-ring-cutout-tight.webp"
                      alt=""
                      className="teaser3-btn-ring-img"
                      width={64}
                      height={45}
                      aria-hidden="true"
                    />
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
          </div>
        </section>

        {/* Right Column: 45% Hero Video */}
        <section className="teaser3-video-col" aria-label="3FIG Smart Ring Video Preview">
          <video
            className="teaser3-video"
            src="/video/newhero03.mp4"
            poster="/images/teaser3-desktop-poster.webp"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          />
        </section>
      </div>

      {/* ====================================================================
          MOBILE VIEWPORT (Stacked: White Copy Top + 4:5 Media Bottom)
          ==================================================================== */}
      <div className="teaser3-mobile-wrap">
        {/* Top White Section */}
        <section className="teaser3-mobile-top">
          {/* Mobile Header Row: Logo with Coral Dot + 3-line Menu Button */}
          <header className="teaser3-mobile-header-row">
            <Link href="/teaser3" className="teaser3-mobile-logo" aria-label="3FIG Home">
              <img
                src="/images/threefig-logo-coral.png"
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

          {/* Mobile Title & Description */}
          <div className="teaser3-mobile-content-group">
            <h1 className="teaser3-title tf-role-hero-title">
              <span className="teaser3-title-dark">The smart ring</span>
              <span className="teaser3-title-brown">for skin wellness</span>
            </h1>

            <p className="teaser3-desc tf-role-body-lead">
              Meet 3FIG, a smart ring designed to turn sleep, stress and daily check-ins into your Skin Balance Score. Explore the patterns between your everyday habits and how your skin feels.
            </p>
          </div>
        </section>

        {/* Bottom Media Section (Full-width, close to 4:5 ratio) */}
        <section className="teaser3-mobile-media-col" aria-label="3FIG Video Preview">
          <video
            className="teaser3-video"
            src="/video/newhero03.mp4"
            poster="/images/teaser3-mobile-poster.webp"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          />

          {/* Horizontally Overlaid Mobile CTA Row (Anchored to media bottom) */}
          <div className="teaser3-mobile-cta-row">
            <ThreeFigButton
              variant="overlay"
              className="teaser3-mobile-btn"
              onClick={handleOpenWaitlist}
              aria-label="Count me in"
              ringAccessory={
                <span className="teaser3-mobile-ring-box">
                  <img
                    src="/images/threefig-ring-cutout-tight.webp"
                    alt=""
                    className="teaser3-mobile-ring-img"
                    width={60}
                    height={42}
                    aria-hidden="true"
                  />
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
        </section>
      </div>

      {/* Interactive Waitlist Dialog */}
      <Teaser3WaitlistDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
