"use client";

import React, { useRef, useState, useEffect } from "react";

/* ------------------------------------------------------------
   MEET 3FIG SECTION: SINGLE PHONE WITH SCROLL PEEK & INTERACTION
   - Landing (scrollY ~ 0): ONLY the top of the phone peeks into hero viewport
   - On Scroll: Phone translates slightly downward & scales down
   - Behind the phone: Copy ("MEET 3FIG", "Your Skin Balance...") fades in
   ------------------------------------------------------------ */

export function Teaser3MeetIntro() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 860);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const el = sectionRef.current;
          if (el) {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const scrollY = window.scrollY || window.pageYOffset || 0;

            // Strict zero check for initial landing
            if (scrollY < 12) {
              setScrollProgress(0);
            } else {
              // As the section enters active viewport, progress goes 0 -> 1
              const start = windowHeight * 0.82;
              const end = windowHeight * 0.20;
              const progress = Math.min(Math.max((start - rect.top) / (start - end), 0), 1);
              setScrollProgress(progress);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Motion calculations:
  // - Initial state (scrollProgress = 0):
  //     phoneTranslateY = 0, phoneScale = 1.02, copyOpacity = 0 (completely hidden)
  // - Scrolled state (scrollProgress = 1):
  //     phoneTranslateY = +100px (desktop) / +68px (mobile), phoneScale = 0.92, copyOpacity = 1
  const maxTranslate = isMobile ? 68 : 105;
  const phoneTranslateY = scrollProgress * maxTranslate;
  const phoneScale = 1.02 - scrollProgress * 0.10;
  const copyOpacity = Math.min(Math.max((scrollProgress - 0.15) / 0.7, 0), 1);
  const copyTranslateY = (1 - copyOpacity) * 24;

  return (
    <section
      ref={sectionRef}
      id="meet-3fig"
      className="teaser3-section teaser3-meet-section"
      aria-labelledby="meet-title"
    >
      <div className="teaser3-meet-container">
        <div className="teaser3-meet-stage">
          {/* Header Block: Positioned behind/above phone, revealed as phone moves down */}
          <div
            className="teaser3-meet-header"
            style={{
              opacity: copyOpacity,
              transform: `translate3d(0, ${copyTranslateY}px, 0)`,
            }}
          >
            <p className="teaser3-eyebrow">MEET 3FIG</p>
            <h2 id="meet-title" className="teaser3-meet-title">
              Your Skin Balance. <br />
              <span className="teaser3-rose-accent">The data behind it.</span>
            </h2>
            <p className="teaser3-meet-desc">
              See your daily score alongside ring measurements and skin check-ins.
            </p>
          </div>

          {/* Visual Block: Single Phone peeking at the top of this section */}
          <div className="teaser3-meet-visual">
            <div
              className="teaser3-meet-phone-wrapper"
              style={{
                transform: `translate3d(0, ${phoneTranslateY}px, 0) scale(${phoneScale})`,
              }}
            >
              <picture>
                <source srcSet="/images/teaser3/meet-phone-single.webp" type="image/webp" />
                <img
                  src="/images/teaser3/meet-phone-single.png"
                  alt="3fig Skin Balance mobile app preview showing daily score 78 and habits"
                  className="teaser3-meet-phone-img"
                  width={768}
                  height={1024}
                  loading="eager"
                  decoding="async"
                />
              </picture>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
