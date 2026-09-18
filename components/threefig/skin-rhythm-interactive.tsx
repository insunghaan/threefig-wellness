'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

interface InsightItem {
  id: string;
  quote: string;
  tag: string;
}

const INSIGHTS: InsightItem[] = [
  {
    id: 'sleep',
    quote: '“Steadier sleep, calmer skin.”',
    tag: 'Sleep & Steadiness',
  },
  {
    id: 'recovery',
    quote: '“Deeper recovery, clearer mornings.”',
    tag: 'Autonomic Recovery',
  },
  {
    id: 'temperature',
    quote: '“Temperature shifts forecast sensitivity.”',
    tag: 'Temperature Shifts',
  },
  {
    id: 'rhythm',
    quote: '“Consistent rhythm, radiant skin.”',
    tag: 'Circadian Balance',
  },
];

export function SkinRhythmInteractive() {
  const trackRef = useRef<HTMLElement>(null);
  const [targetProgress, setTargetProgress] = useState(0);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const [windowWidth, setWindowWidth] = useState(1200);

  // Touch drag state for mobile swipe
  const touchStartX = useRef<number | null>(null);

  // Resize listener to dynamically scale invisible arc curvature with screen width
  useEffect(() => {
    const updateDimensions = () => {
      setWindowWidth(window.innerWidth);
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Scroll listener tracking position within the scroll track
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (trackRef.current) {
            const rect = trackRef.current.getBoundingClientRect();
            const navHeight = window.innerWidth <= 768 ? 80 : 96;
            const totalScrollable = rect.height - (window.innerHeight - navHeight);
            if (totalScrollable > 0) {
              const currentScroll = navHeight - rect.top;
              const ratio = Math.max(0, Math.min(1, currentScroll / totalScrollable));
              setTargetProgress(ratio * (INSIGHTS.length - 1));
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth lerp RAF loop for buttery-smooth statement transitions
  useEffect(() => {
    let animId: number;
    const lerp = () => {
      setSmoothProgress((prev) => {
        const diff = targetProgress - prev;
        if (Math.abs(diff) < 0.002) return targetProgress;
        return prev + diff * 0.14;
      });
      animId = requestAnimationFrame(lerp);
    };

    animId = requestAnimationFrame(lerp);
    return () => cancelAnimationFrame(animId);
  }, [targetProgress]);

  // Jump to specific index when quote is clicked
  const goToIndex = useCallback((index: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const navHeight = window.innerWidth <= 768 ? 80 : 96;
    const totalScrollable = rect.height - (window.innerHeight - navHeight);
    const targetScroll = window.pageYOffset + rect.top - navHeight + (index / (INSIGHTS.length - 1)) * totalScrollable;
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    setTargetProgress(index);
  }, []);

  // Mobile swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diffX) > 40) {
      if (diffX < 0) {
        goToIndex(Math.min(INSIGHTS.length - 1, Math.round(smoothProgress) + 1));
      } else {
        goToIndex(Math.max(0, Math.round(smoothProgress) - 1));
      }
    }
    touchStartX.current = null;
  };

  const isMobile = windowWidth <= 768;
  // Arc radius proportional to the ring's macro curvature
  const arcRadius = isMobile ? Math.min(windowWidth * 0.95, 380) : Math.min(windowWidth * 0.62, 860);
  // Angular separation between consecutive statements ensuring natural spacing without collision
  const deltaAngle = isMobile ? 0.92 : 0.68;

  return (
    <section
      id="rhythm"
      ref={trackRef}
      className="skin-rhythm-scroll-track"
      aria-labelledby="rhythm-heading"
    >
      <div
        className="skin-rhythm-sticky-stage"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Subtle background glow atmosphere */}
        <div className="skin-rhythm-backdrop-glow" aria-hidden="true" />

        {/* 1. Top Header: Eyebrow, Headline, Subcopy */}
        <div className="skin-rhythm-header">
          <p className="skin-rhythm-eyebrow">SKIN RHYTHM</p>

          <h2 id="rhythm-heading" className="skin-rhythm-headline">
            3FIG learns what<br />
            <em>your skin responds to.</em>
          </h2>

          <p className="skin-rhythm-subcopy">
            Tell us how your skin feels. 3FIG quietly compares it with your sleep,
            recovery, and body signals over time.
          </p>
        </div>

        {/* 2. Middle Stage */}
        {/* 2A. Desktop: Statements flowing along curved concentric arc using SVG textPath */}
        <div className="skin-rhythm-statement-container skin-rhythm-desktop-only">
          <svg
            className="skin-rhythm-arc-svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="xMidYMid meet"
            aria-label="Skin Rhythm Statements"
          >
            <defs>
              {/* Desktop Arc: Apex at (600, 52), R=950 */}
              <path
                id="skin-rhythm-ring-curve"
                d="M -128 395 A 950 950 0 0 1 1328 395"
                fill="none"
              />
            </defs>
            {INSIGHTS.map((item, idx) => {
              const diff = idx - smoothProgress;
              const absDiff = Math.abs(diff);

              if (absDiff > 1.25) return null;

              // Desktop arc spacing: 50% is top apex
              const deltaPercent = 34;
              const startOffset = 50 + diff * deltaPercent;

              let opacity = 0;
              if (absDiff <= 0.2) {
                opacity = 1;
              } else if (absDiff < 0.95) {
                opacity = Math.max(0, 1 - Math.pow((absDiff - 0.2) / 0.75, 1.3));
              }

              return (
                <text
                  key={item.id}
                  className="skin-rhythm-curved-text"
                  style={{
                    opacity: opacity.toFixed(3),
                    cursor: absDiff > 0.3 ? 'pointer' : 'default',
                    pointerEvents: opacity > 0.35 ? 'auto' : 'none',
                  }}
                  onClick={() => goToIndex(idx)}
                  role="button"
                  tabIndex={0}
                  aria-label={item.quote}
                >
                  <textPath
                    href="#skin-rhythm-ring-curve"
                    xlinkHref="#skin-rhythm-ring-curve"
                    startOffset={`${startOffset.toFixed(2)}%`}
                    textAnchor="middle"
                  >
                    {item.quote}
                  </textPath>
                </text>
              );
            })}
          </svg>
        </div>

        {/* 2B. Mobile: Straight horizontal serif statement fading in/out one by one */}
        <div className="skin-rhythm-statement-container skin-rhythm-mobile-only">
          <div className="skin-rhythm-straight-stage">
            {INSIGHTS.map((item, idx) => {
              const diff = smoothProgress - idx;
              const absDiff = Math.abs(diff);

              // Single sentence at a time: cleanly fades away before next appears (no overlapping text)
              let opacity = 0;
              if (absDiff <= 0.15) {
                opacity = 1;
              } else if (absDiff < 0.48) {
                opacity = (0.48 - absDiff) / 0.33;
              }

              if (opacity <= 0.005) return null;

              // Subtle elegant vertical float: item floats up gently as user scrolls down
              const translateY = -diff * 12;

              return (
                <p
                  key={item.id}
                  className="skin-rhythm-straight-quote"
                  style={{
                    opacity: opacity.toFixed(3),
                    transform: `translate(-50%, -50%) translateY(${translateY.toFixed(1)}px)`,
                    pointerEvents: opacity > 0.5 ? 'auto' : 'none',
                  }}
                  onClick={() => goToIndex((idx + 1) % INSIGHTS.length)}
                  role="button"
                  tabIndex={0}
                  aria-label={item.quote}
                >
                  {item.quote}
                </p>
              );
            })}
          </div>
        </div>

        {/* 3. Bottom Stage: Macro ring with optical sensor, larger and flush to bottom horizontal line */}
        <div className="skin-rhythm-macro-ring-stage">
          <div className="skin-rhythm-sensor-glow-aura" aria-hidden="true" />
          <img
            src="/images/threefig-ring-sensor-macro-crop-seo-v1.webp"
            alt="3FIG Smart Ring worn on finger with active optical biometric sensor"
            className="skin-rhythm-macro-ring-img"
            loading="eager"
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
}

