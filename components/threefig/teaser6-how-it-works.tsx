"use client";

import React, { useState, useRef, useId, useCallback } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

/* --------------------------------------------------------------------------
   UI OVERLAYS FOR HOW IT WORKS SLIDES
   -------------------------------------------------------------------------- */

/* Slide 01: Overnight Signals (Ring Tracks) */
function Teaser6WearOverlay({ active }: { active: boolean }) {
  const metricRows = [
    { name: "Sleep stages & rhythm", status: "TRACKED" },
    { name: "HRV & Resting HR", status: "TRACKED" },
    { name: "Finger temperature trends", status: "TRACKED" },
  ];

  return (
    <div
      className={`teaser6-how-glass-overlay teaser6-how-wear-panel ${
        active ? "is-revealed" : ""
      }`}
    >
      <div className="teaser6-how-overlay-header">
        <span className="teaser6-how-overlay-title">RING SIGNALS</span>
        <span className="teaser6-how-overlay-live-dot" aria-hidden="true" />
      </div>

      <div className="teaser6-how-overlay-metrics-list">
        {metricRows.map((row) => (
          <div key={row.name} className="teaser6-how-overlay-metric-row">
            <span className="teaser6-how-overlay-metric-name">{row.name}</span>
            <span className="teaser6-how-overlay-metric-status">{row.status}</span>
          </div>
        ))}
      </div>

      <div className="teaser6-how-overlay-summary-card">
        <span className="teaser6-how-overlay-sleep-val">7h 42m recorded</span>
        <span className="teaser6-how-overlay-microcopy">Automatic background sensing</span>
      </div>
    </div>
  );
}

/* Slide 02: Daily Skin Check-in (You Record) */
function Teaser6CheckInOverlay({ active }: { active: boolean }) {
  const options = ["Calm", "Dry", "Sensitive", "Irritated"];

  return (
    <div
      className={`teaser6-how-glass-overlay teaser6-how-checkin-panel ${
        active ? "is-revealed" : ""
      }`}
    >
      <div className="teaser6-how-overlay-header">
        <span className="teaser6-how-overlay-title">DAILY SKIN LOG</span>
        <span className="teaser6-how-overlay-badge">10-sec check-in</span>
      </div>

      <div className="teaser6-how-overlay-prompt-block">
        <p className="teaser6-how-overlay-prompt-label">How does your skin feel today?</p>
        <div className="teaser6-how-overlay-chips-grid">
          {options.map((opt) => {
            const isSelected = opt === "Calm";
            return (
              <div
                key={opt}
                className={`teaser6-how-overlay-chip ${
                  isSelected ? "is-selected" : ""
                }`}
              >
                {isSelected && (
                  <Check
                    size={11}
                    className="teaser6-how-overlay-chip-icon"
                    aria-hidden="true"
                  />
                )}
                <span>{opt}</span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="teaser6-how-overlay-footnote">Quick observations anchor your data.</p>
    </div>
  );
}

/* Slide 03: Synthesis (App Correlates) */
function Teaser6ConnectOverlay({ active }: { active: boolean }) {
  const rawClipId = useId();
  const clipId = `t6-connect-clip-${rawClipId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const sleepPoints: [number, number][] = [
    [16, 54],
    [48, 44],
    [80, 54],
    [112, 38],
    [144, 42],
    [176, 24],
    [208, 28],
  ];

  const skinPoints: [number, number][] = [
    [16, 62],
    [48, 54],
    [80, 56],
    [112, 46],
    [144, 43],
    [176, 33],
    [208, 38],
  ];

  const sleepPathD = "M 16,54 L 48,44 L 80,54 L 112,38 L 144,42 L 176,24 L 208,28";
  const skinPathD = "M 16,62 L 48,54 L 80,56 L 112,46 L 144,43 L 176,33 L 208,38";

  return (
    <div
      className={`teaser6-how-glass-overlay teaser6-how-connect-panel ${
        active ? "is-revealed" : ""
      }`}
    >
      <div className="teaser6-how-overlay-header">
        <span className="teaser6-how-overlay-title">APP SYNTHESIS</span>
        <span className="teaser6-how-overlay-badge">Correlated</span>
      </div>

      <div className="teaser6-how-overlay-legend-row">
        <div className="teaser6-how-overlay-legend-item">
          <svg width="20" height="8" viewBox="0 0 20 8" aria-hidden="true">
            <line x1="0" y1="4" x2="20" y2="4" stroke="#ff5c38" strokeWidth="1.8" />
            <circle cx="10" cy="4" r="2.5" stroke="#ff5c38" strokeWidth="1.8" fill="#ffffff" />
          </svg>
          <span>Sleep recovery</span>
        </div>
        <div className="teaser6-how-overlay-legend-item">
          <svg width="20" height="8" viewBox="0 0 20 8" aria-hidden="true">
            <line
              x1="0"
              y1="4"
              x2="20"
              y2="4"
              stroke="#10b981"
              strokeWidth="1.8"
              strokeDasharray="3 2"
            />
            <circle cx="10" cy="4" r="2" fill="#10b981" />
          </svg>
          <span>Skin comfort</span>
        </div>
      </div>

      <div className="teaser6-how-overlay-chart-wrap">
        <svg
          className="teaser6-how-overlay-chart-svg"
          viewBox="0 0 224 84"
          aria-hidden="true"
        >
          <defs>
            <clipPath id={clipId}>
              <rect
                x="0"
                y="0"
                width={active ? "224" : "0"}
                height="84"
                style={{
                  transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            </clipPath>
          </defs>

          <line x1="10" x2="214" y1="20" y2="20" className="teaser6-how-overlay-grid-line" stroke="rgba(255,255,255,0.15)" strokeDasharray="2 3" />
          <line x1="10" x2="214" y1="42" y2="42" className="teaser6-how-overlay-grid-line" stroke="rgba(255,255,255,0.15)" strokeDasharray="2 3" />
          <line x1="10" x2="214" y1="64" y2="64" className="teaser6-how-overlay-grid-line" stroke="rgba(255,255,255,0.15)" strokeDasharray="2 3" />

          <path
            d={sleepPathD}
            stroke="#ff5c38"
            strokeWidth="1.8"
            fill="none"
            clipPath={`url(#${clipId})`}
          />
          <path
            d={skinPathD}
            stroke="#10b981"
            strokeWidth="1.8"
            strokeDasharray="4 3"
            fill="none"
            clipPath={`url(#${clipId})`}
          />

          {sleepPoints.map(([cx, cy], i) => (
            <circle
              key={`sleep-${i}`}
              cx={cx}
              cy={cy}
              r="2.8"
              fill="#ffffff"
              stroke="#ff5c38"
              strokeWidth="1.8"
            />
          ))}

          {skinPoints.map(([cx, cy], i) => (
            <circle
              key={`skin-${i}`}
              cx={cx}
              cy={cy}
              r="2.4"
              fill="#10b981"
            />
          ))}

          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
            <text
              key={i}
              x={16 + i * 32}
              y="80"
              textAnchor="middle"
              className="teaser6-how-overlay-axis-text"
              fill="rgba(255,255,255,0.7)"
              fontSize="10"
            >
              {d.charAt(0)}
            </text>
          ))}
        </svg>
      </div>

      <p className="teaser6-how-overlay-footnote">Body metrics pair with your skin logs.</p>
    </div>
  );
}

/* --------------------------------------------------------------------------
   SLIDE DATA DEFINITION
   -------------------------------------------------------------------------- */

interface StorySlide {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  imageSrc: string;
  mobileImageSrc?: string;
  imageAlt: string;
  renderOverlay: (active: boolean) => React.ReactNode;
}

const STORY_SLIDES: StorySlide[] = [
  {
    id: "wear",
    eyebrow: "CONTINUOUS RING SENSING",
    title: "Wear the ring.",
    description: "The ring tracks sleep stages, HRV, and body temperature through day and night.",
    imageSrc: "/images/threefig-pathway-01-sleep.webp",
    mobileImageSrc: "/images/teaser3/how-it-works-slide-01-mobile.png",
    imageAlt: "Resting calmly during sleep wearing the 3fig smart ring.",
    renderOverlay: (active) => <Teaser6WearOverlay active={active} />,
  },
  {
    id: "check-in",
    eyebrow: "DAILY SKIN LOG",
    title: "Check in your skin.",
    description: "A 10-second morning check-in captures texture, oiliness, and barrier comfort.",
    imageSrc: "/images/threefig-pathway-04-rhythm.webp",
    mobileImageSrc: "/images/teaser3/how-it-works-slide-02-mobile.png",
    imageAlt: "Gentle morning reflection touching clean skin while wearing the 3fig ring.",
    renderOverlay: (active) => <Teaser6CheckInOverlay active={active} />,
  },
  {
    id: "connect",
    eyebrow: "APP SYNTHESIS",
    title: "See the connection.",
    description: "The app synthesizes vital signs and skin logs into your daily Skin Balance Score.",
    imageSrc: "/images/threefig-balance-now-knit.webp",
    mobileImageSrc: "/images/teaser3/how-it-works-slide-03-mobile.png",
    imageAlt: "Relaxing at home in soft knitwear with the 3fig ring naturally visible.",
    renderOverlay: (active) => <Teaser6ConnectOverlay active={active} />,
  },
];

/* --------------------------------------------------------------------------
   MAIN TEASER 6 HOW IT WORKS COMPONENT
   -------------------------------------------------------------------------- */

export function Teaser6HowItWorks() {
  const [activeIdx, setActiveIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const isSwipingRef = useRef<boolean>(false);

  const scrollToSlide = useCallback((idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const slides = track.querySelectorAll<HTMLElement>(".teaser6-how-slide-card");
    if (slides[idx]) {
      const paddingLeft = parseFloat(
        window.getComputedStyle(track).paddingLeft || "0"
      );
      const targetLeft = slides[idx].offsetLeft - track.offsetLeft - paddingLeft;
      track.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: "smooth",
      });
      setActiveIdx(idx);
    }
  }, []);

  const prevSlide = useCallback(() => {
    const target = Math.max(0, activeIdx - 1);
    scrollToSlide(target);
  }, [activeIdx, scrollToSlide]);

  const nextSlide = useCallback(() => {
    const target = Math.min(STORY_SLIDES.length - 1, activeIdx + 1);
    scrollToSlide(target);
  }, [activeIdx, scrollToSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isSwipingRef.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isSwipingRef.current) return;
    isSwipingRef.current = false;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 35) {
      if (deltaX < 0 && activeIdx < STORY_SLIDES.length - 1) {
        nextSlide();
      } else if (deltaX > 0 && activeIdx > 0) {
        prevSlide();
      }
    }
  };

  const handleScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const paddingLeft = parseFloat(
      window.getComputedStyle(track).paddingLeft || "0"
    );
    const scrollLeft = track.scrollLeft;
    const slides = track.querySelectorAll<HTMLElement>(".teaser6-how-slide-card");
    if (!slides.length) return;

    let closestIdx = 0;
    let minDistance = Infinity;

    slides.forEach((slide, idx) => {
      const slideLeft = slide.offsetLeft - track.offsetLeft - paddingLeft;
      const distance = Math.abs(slideLeft - scrollLeft);
      if (distance < minDistance) {
        minDistance = distance;
        closestIdx = idx;
      }
    });

    if (closestIdx !== activeIdx) {
      setActiveIdx(closestIdx);
    }
  }, [activeIdx]);

  return (
    <section
      id="how-it-works"
      className="teaser6-section teaser6-how-section"
      aria-labelledby="how-it-works-title"
    >
      <div className="teaser6-section-container">
        {/* Section Header */}
        <div className="teaser6-how-header-row">
          <div className="teaser6-how-header-text">
            <p className="teaser6-eyebrow">HOW IT WORKS</p>
            <h2 id="how-it-works-title" className="teaser6-section-title">
              Wear it. Check in. <br />
              <span className="teaser6-rose-accent">Connect the dots.</span>
            </h2>
            <p className="teaser6-section-lead">
              3FIG combines passive smart ring tracking with short daily observations to give your skin routine real context.
            </p>
          </div>

          {/* Desktop Arrow Controls */}
          <div className="teaser6-how-desktop-arrows" aria-hidden="true">
            <button
              type="button"
              className="teaser6-how-nav-arrow"
              onClick={prevSlide}
              disabled={activeIdx === 0}
              aria-label="Previous step"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              className="teaser6-how-nav-arrow"
              onClick={nextSlide}
              disabled={activeIdx === STORY_SLIDES.length - 1}
              aria-label="Next step"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Slides Track */}
        <div
          ref={trackRef}
          className="teaser6-how-track"
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="region"
          aria-label="How 3fig works steps"
        >
          {STORY_SLIDES.map((slide, idx) => {
            const isActive = idx === activeIdx;

            return (
              <article
                key={slide.id}
                className={`teaser6-how-slide-card ${isActive ? "is-active" : ""}`}
                aria-label={`Step ${idx + 1}: ${slide.title}`}
              >
                {/* Media Container with Adaptive Pictures */}
                <div className="teaser6-how-media-wrap">
                  <picture>
                    {slide.mobileImageSrc && (
                      <source
                        media="(max-width: 640px)"
                        srcSet={slide.mobileImageSrc}
                      />
                    )}
                    <Image
                      src={slide.imageSrc}
                      alt={slide.imageAlt}
                      fill
                      className="teaser6-how-slide-img"
                      sizes="(max-width: 768px) 85vw, 420px"
                      priority={idx === 0}
                    />
                  </picture>

                  {/* Glassmorphic Live UI Preview Overlay */}
                  {slide.renderOverlay(isActive)}
                </div>

                {/* Text Content */}
                <div className="teaser6-how-text-block">
                  <span className="teaser6-how-step-eyebrow">
                    0{idx + 1} — {slide.eyebrow}
                  </span>
                  <h3 className="teaser6-how-slide-title">{slide.title}</h3>
                  <p className="teaser6-how-slide-desc">{slide.description}</p>
                </div>
              </article>
            );
          })}
        </div>

        {/* Mobile Indicator Row */}
        <div className="teaser6-how-mobile-footer" aria-hidden="true">
          <div className="teaser6-how-indicators">
            {STORY_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                className={`teaser6-how-dot ${idx === activeIdx ? "is-active" : ""}`}
                onClick={() => scrollToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
