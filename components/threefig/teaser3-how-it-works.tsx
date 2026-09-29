"use client";

import React, { useState, useRef, useId, useCallback } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

/* --------------------------------------------------------------------------
   UI OVERLAYS FOR HOW IT WORKS SLIDES
   One restrained, relevant UI preview per slide as specified in design reference
   -------------------------------------------------------------------------- */

/* Slide 01: Overnight Signals (Wear it) */
function Teaser3WearOverlay({ active }: { active: boolean }) {
  const metricRows = [
    { name: "Sleep rhythm", status: "TRACKED" },
    { name: "Resting HR & HRV", status: "TRACKED" },
    { name: "Temperature shifts", status: "TRACKED" },
  ];

  return (
    <div
      className={`teaser3-how-glass-overlay teaser3-how-wear-panel ${
        active ? "is-revealed" : ""
      }`}
    >
      <div className="teaser3-how-overlay-header">
        <span className="teaser3-how-overlay-title">OVERNIGHT SIGNALS</span>
        <span className="teaser3-how-overlay-live-dot" aria-hidden="true" />
      </div>

      <div className="teaser3-how-overlay-metrics-list">
        {metricRows.map((row) => (
          <div key={row.name} className="teaser3-how-overlay-metric-row">
            <span className="teaser3-how-overlay-metric-name">{row.name}</span>
            <span className="teaser3-how-overlay-metric-status">{row.status}</span>
          </div>
        ))}
      </div>

      <div className="teaser3-how-overlay-summary-card">
        <span className="teaser3-how-overlay-sleep-val">7h 42m asleep</span>
        <span className="teaser3-how-overlay-microcopy">Baseline building</span>
      </div>
    </div>
  );
}

/* Slide 02: Today's Skin (Check in) */
function Teaser3CheckInOverlay({ active }: { active: boolean }) {
  const options = ["Calm", "Dry", "Sensitive", "Irritated"];

  return (
    <div
      className={`teaser3-how-glass-overlay teaser3-how-checkin-panel ${
        active ? "is-revealed" : ""
      }`}
    >
      <div className="teaser3-how-overlay-header">
        <span className="teaser3-how-overlay-title">TODAY’S SKIN</span>
        <span className="teaser3-how-overlay-badge">Logged by you</span>
      </div>

      <div className="teaser3-how-overlay-prompt-block">
        <p className="teaser3-how-overlay-prompt-label">How does it feel?</p>
        <div className="teaser3-how-overlay-chips-grid">
          {options.map((opt) => {
            const isSelected = opt === "Calm";
            return (
              <div
                key={opt}
                className={`teaser3-how-overlay-chip ${
                  isSelected ? "is-selected" : ""
                }`}
              >
                {isSelected && (
                  <Check
                    size={11}
                    className="teaser3-how-overlay-chip-icon"
                    aria-hidden="true"
                  />
                )}
                <span>{opt}</span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="teaser3-how-overlay-footnote">Takes a few seconds.</p>
    </div>
  );
}

/* Slide 03: 7-Day Patterns (Connect it) */
function Teaser3ConnectOverlay({ active }: { active: boolean }) {
  const rawClipId = useId();
  const clipId = `t3-connect-clip-${rawClipId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

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
      className={`teaser3-how-glass-overlay teaser3-how-connect-panel ${
        active ? "is-revealed" : ""
      }`}
    >
      <div className="teaser3-how-overlay-header">
        <span className="teaser3-how-overlay-title">7-DAY PATTERNS</span>
        <span className="teaser3-how-overlay-badge">Interpreted</span>
      </div>

      <div className="teaser3-how-overlay-legend-row">
        <div className="teaser3-how-overlay-legend-item">
          <svg width="20" height="8" viewBox="0 0 20 8" aria-hidden="true">
            <line x1="0" y1="4" x2="20" y2="4" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="10" cy="4" r="2.5" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
          </svg>
          <span>Sleep rhythm</span>
        </div>
        <div className="teaser3-how-overlay-legend-item">
          <svg width="20" height="8" viewBox="0 0 20 8" aria-hidden="true">
            <line
              x1="0"
              y1="4"
              x2="20"
              y2="4"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeDasharray="3 2"
            />
            <circle cx="10" cy="4" r="2" fill="#FFFFFF" />
          </svg>
          <span>Skin comfort</span>
        </div>
      </div>

      <div className="teaser3-how-overlay-chart-wrap">
        <svg
          className="teaser3-how-overlay-chart-svg"
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

          <line x1="10" x2="214" y1="20" y2="20" className="teaser3-how-overlay-grid-line" />
          <line x1="10" x2="214" y1="42" y2="42" className="teaser3-how-overlay-grid-line" />
          <line x1="10" x2="214" y1="64" y2="64" className="teaser3-how-overlay-grid-line" />

          <path
            d={sleepPathD}
            className="teaser3-how-overlay-path-sleep"
            clipPath={`url(#${clipId})`}
          />
          <path
            d={skinPathD}
            className="teaser3-how-overlay-path-skin"
            strokeDasharray="4 3"
            clipPath={`url(#${clipId})`}
          />

          {sleepPoints.map(([cx, cy], i) => (
            <circle
              key={`sleep-${i}`}
              cx={cx}
              cy={cy}
              r="3"
              className="teaser3-how-overlay-ring-node"
            />
          ))}

          {skinPoints.map(([cx, cy], i) => (
            <circle
              key={`skin-${i}`}
              cx={cx}
              cy={cy}
              r="2.5"
              className="teaser3-how-overlay-dot-node"
            />
          ))}

          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <text
              key={i}
              x={16 + i * 32}
              y="80"
              textAnchor="middle"
              className="teaser3-how-overlay-axis-text"
            >
              {d}
            </text>
          ))}
        </svg>
      </div>

      <p className="teaser3-how-overlay-footnote">Body signals and check-ins aligned.</p>
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
    eyebrow: "BACKGROUND SENSING",
    title: "Track your body.",
    description: "Sleep, heart rate, HRV, temperature trends, and movement—measured quietly while you sleep and live.",
    imageSrc: "/images/threefig-pathway-01-sleep.webp",
    mobileImageSrc: "/images/teaser3/how-it-works-slide-01-mobile.png",
    imageAlt: "Resting calmly during sleep wearing the 3fig smart ring.",
    renderOverlay: (active) => <Teaser3WearOverlay active={active} />,
  },
  {
    id: "check-in",
    eyebrow: "DAILY LOG",
    title: "Log your skin.",
    description: "Note how your skin feels with a quick check-in. Add meal notes when you want more context.",
    imageSrc: "/images/threefig-pathway-04-rhythm.webp",
    mobileImageSrc: "/images/teaser3/how-it-works-slide-02-mobile.png",
    imageAlt: "Gentle morning reflection touching clean skin while wearing the 3fig ring.",
    renderOverlay: (active) => <Teaser3CheckInOverlay active={active} />,
  },
  {
    id: "connect",
    eyebrow: "SYNTHESIS",
    title: "See the connection.",
    description: "View your Skin Balance summary, compare trends, and choose a daily action to test.",
    imageSrc: "/images/threefig-balance-now-knit.webp",
    mobileImageSrc: "/images/teaser3/how-it-works-slide-03-mobile.png",
    imageAlt: "Relaxing at home in soft knitwear with the 3fig ring naturally visible.",
    renderOverlay: (active) => <Teaser3ConnectOverlay active={active} />,
  },
];

/* --------------------------------------------------------------------------
   MAIN TEASER 3 HOW IT WORKS COMPONENT
   -------------------------------------------------------------------------- */

export function Teaser3HowItWorks() {
  const [activeIdx, setActiveIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const isSwipingRef = useRef<boolean>(false);

  const scrollToSlide = useCallback((idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const slides = track.querySelectorAll<HTMLElement>(".teaser3-how-slide-card");
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
    const slides = track.querySelectorAll<HTMLElement>(".teaser3-how-slide-card");
    if (!slides.length) return;

    let closestIdx = 0;
    let minDiff = Infinity;
    slides.forEach((slide, idx) => {
      const targetLeft = slide.offsetLeft - track.offsetLeft - paddingLeft;
      const diff = Math.abs(targetLeft - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    if (closestIdx !== activeIdx) {
      setActiveIdx(closestIdx);
    }
  }, [activeIdx]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSlide();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSlide();
    }
  };

  return (
    <section
      id="how-it-works"
      className="teaser3-section teaser3-how-section"
      aria-labelledby="how-title"
    >
      <div className="teaser3-section-container">
        {/* Section Header */}
        <div className="teaser3-section-head">
          <p className="teaser3-eyebrow">HOW IT WORKS</p>
          <h2 id="how-title" className="teaser3-section-title">
            The ring measures. <br />
            <span className="teaser3-rose-accent">You add context.</span>
          </h2>
          <p className="teaser3-section-lead">
            3fig brings both together to help you understand your skin.
          </p>
        </div>

        {/* Carousel Region */}
        <div
          className="teaser3-how-carousel-wrap"
          role="region"
          aria-roledescription="carousel"
          aria-label="How it works sequence"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {/* Horizontal Track with Next Card Peek */}
          <div
            ref={trackRef}
            className="teaser3-how-track"
            onScroll={handleScroll}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {STORY_SLIDES.map((slide, i) => {
              const isActive = i === activeIdx;
              return (
                <div
                  key={slide.id}
                  className={`teaser3-how-slide-card ${
                    isActive ? "is-active" : ""
                  }`}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${STORY_SLIDES.length}: ${slide.title}`}
                >
                  {/* Photograph Background with Gradient Shading */}
                  <div className="teaser3-how-photo-wrap">
                    <Image
                      src={slide.imageSrc}
                      alt={slide.imageAlt}
                      fill
                      className={`teaser3-how-clean-photo teaser3-how-desktop-photo${
                        slide.id === "wear" ? " teaser3-how-desktop-photo-flipped" : ""
                      }`}
                      sizes="(max-width: 1200px) 75vw, 960px"
                      priority={i === 0}
                    />
                    {slide.mobileImageSrc && (
                      <Image
                        src={slide.mobileImageSrc}
                        alt={slide.imageAlt}
                        fill
                        className="teaser3-how-clean-photo teaser3-how-mobile-photo"
                        sizes="(max-width: 860px) 88vw, 380px"
                        priority={i === 0}
                      />
                    )}
                    <div className="teaser3-how-gradient-scrim" aria-hidden="true" />

                    {/* Desktop In-Photo Text Block (Lower-Left) */}
                    <div className="teaser3-how-desktop-caption">
                      <h3 className="teaser3-how-slide-title">{slide.title}</h3>
                      <p className="teaser3-how-slide-desc">{slide.description}</p>
                    </div>

                    {/* Mobile In-Photo Text Block (Top) */}
                    <div className="teaser3-how-mobile-caption">
                      <span className="teaser3-how-mobile-eyebrow">{slide.eyebrow}</span>
                      <h3 className="teaser3-how-slide-title">{slide.title}</h3>
                      <p className="teaser3-how-slide-desc">{slide.description}</p>
                    </div>

                    {/* Compact In-Photo UI Overlay (Desktop Lower-Right / Mobile Bottom) */}
                    <div className="teaser3-how-preview-container">
                      {slide.renderOverlay(isActive)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Arrow Controls beneath carousel */}
          <div className="teaser3-how-desktop-controls" aria-label="Slide navigation">
            <button
              type="button"
              className="teaser3-how-arrow-btn"
              onClick={prevSlide}
              disabled={activeIdx === 0}
              aria-label="Previous slide"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              type="button"
              className="teaser3-how-arrow-btn"
              onClick={nextSlide}
              disabled={activeIdx === STORY_SLIDES.length - 1}
              aria-label="Next slide"
            >
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Mobile Pagination Indicators beneath carousel */}
          <div
            className="teaser3-how-mobile-dots"
            role="tablist"
            aria-label="Slide navigation"
          >
            {STORY_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                className={`teaser3-how-mobile-dot ${
                  activeIdx === idx ? "is-active" : ""
                }`}
                aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                aria-selected={activeIdx === idx}
                onClick={() => scrollToSlide(idx)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
