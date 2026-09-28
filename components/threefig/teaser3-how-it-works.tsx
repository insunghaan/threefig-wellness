"use client";

import React, { useState, useRef, useId, useCallback, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, Moon } from "lucide-react";

/* --------------------------------------------------------------------------
   UI OVERLAYS FOR HOW IT WORKS SLIDES
   -------------------------------------------------------------------------- */

/* Slide 01: Overnight Signals (Wear) */
function Teaser3WearOverlay({ active }: { active: boolean }) {
  const metricRows = [
    { name: "Sleep rhythm", status: "Tracked" },
    { name: "Resting HR & HRV", status: "Tracked" },
    { name: "Temperature shifts", status: "Tracked" },
  ];

  return (
    <div className={`teaser3-how-overlay-stack teaser3-how-wear-stack ${active ? "is-revealed" : ""}`}>
      {/* Primary: Overnight Signals */}
      <div className="teaser3-how-glass-overlay teaser3-how-wear-primary">
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
          <div className="teaser3-how-overlay-sleep-time">
            <span className="teaser3-how-overlay-sleep-label">Overnight sleep</span>
            <strong className="teaser3-how-overlay-sleep-val">7h 42m asleep</strong>
          </div>
          <span className="teaser3-how-overlay-microcopy">Building your baseline.</span>
        </div>
      </div>

      {/* Secondary: Daily Rhythm */}
      <div className="teaser3-how-glass-overlay teaser3-how-wear-secondary">
        <div className="teaser3-how-overlay-header">
          <span className="teaser3-how-overlay-title">DAILY RHYTHM</span>
          <span className="teaser3-how-overlay-badge">24-hour</span>
        </div>

        <div className="teaser3-how-wear-rhythm-strip">
          <div className="teaser3-how-wear-rhythm-item">
            <span className="teaser3-how-wear-rhythm-label">Sleep</span>
            <strong className="teaser3-how-wear-rhythm-val">7h 42m</strong>
          </div>
          <div className="teaser3-how-wear-rhythm-divider" aria-hidden="true" />
          <div className="teaser3-how-wear-rhythm-item">
            <span className="teaser3-how-wear-rhythm-label">Recovery</span>
            <strong className="teaser3-how-wear-rhythm-val">Steady</strong>
          </div>
          <div className="teaser3-how-wear-rhythm-divider" aria-hidden="true" />
          <div className="teaser3-how-wear-rhythm-item">
            <span className="teaser3-how-wear-rhythm-label">Movement</span>
            <strong className="teaser3-how-wear-rhythm-val">On track</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Slide 02: Today's Skin (Check In) */
function Teaser3CheckInOverlay({ active }: { active: boolean }) {
  const options = ["Calm", "Dry", "Sensitive", "Irritated"];

  return (
    <div className={`teaser3-how-overlay-stack teaser3-how-checkin-stack ${active ? "is-revealed" : ""}`}>
      {/* Primary: Today's Skin */}
      <div className="teaser3-how-glass-overlay teaser3-how-checkin-primary">
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
                <div key={opt} className={`teaser3-how-overlay-chip ${isSelected ? "is-selected" : ""}`}>
                  {isSelected && <Check size={12} className="teaser3-how-overlay-chip-icon" aria-hidden="true" />}
                  <span>{opt}</span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="teaser3-how-overlay-footnote">Takes a few seconds.</p>
      </div>

      {/* Secondary: Daily Context */}
      <div className="teaser3-how-glass-overlay teaser3-how-checkin-secondary">
        <div className="teaser3-how-overlay-header">
          <span className="teaser3-how-overlay-title">DAILY CONTEXT</span>
          <span className="teaser3-how-overlay-badge">Optional</span>
        </div>

        <div className="teaser3-how-checkin-context-row">
          <span className="teaser3-how-checkin-context-label">Anything worth noting?</span>
          <span className="teaser3-how-checkin-context-tag">Late meal</span>
        </div>
      </div>
    </div>
  );
}

/* Slide 03: Pattern Insight + Tonight's Move (Connect) */
function Teaser3ConnectOverlay({ active }: { active: boolean }) {
  const rawClipId = useId();
  const clipId = `t3-connect-clip-${rawClipId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const sleepPoints: [number, number][] = [
    [20, 68],
    [56, 56],
    [92, 68],
    [128, 48],
    [164, 52],
    [200, 30],
    [236, 36],
  ];

  const skinPoints: [number, number][] = [
    [20, 78],
    [56, 68],
    [92, 70],
    [128, 58],
    [164, 54],
    [200, 42],
    [236, 48],
  ];

  const sleepPathD = "M 20,68 L 56,56 L 92,68 L 128,48 L 164,52 L 200,30 L 236,36";
  const skinPathD = "M 20,78 L 56,68 L 92,70 L 128,58 L 164,54 L 200,42 L 236,48";

  return (
    <div className={`teaser3-how-overlay-stack teaser3-how-connect-stack ${active ? "is-revealed" : ""}`}>
      {/* Primary: 7-Day Patterns */}
      <div className="teaser3-how-glass-overlay teaser3-how-connect-primary">
        <div className="teaser3-how-overlay-header">
          <span className="teaser3-how-overlay-title">7-DAY PATTERNS</span>
          <span className="teaser3-how-overlay-badge">Interpreted</span>
        </div>

        <div className="teaser3-how-overlay-legend-row">
          <div className="teaser3-how-overlay-legend-item">
            <svg width="24" height="10" viewBox="0 0 24 10" aria-hidden="true">
              <line x1="0" y1="5" x2="24" y2="5" stroke="#FFFFFF" strokeWidth="1.8" />
              <circle cx="12" cy="5" r="3" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
            </svg>
            <span>Sleep consistency</span>
          </div>
          <div className="teaser3-how-overlay-legend-item">
            <svg width="24" height="10" viewBox="0 0 24 10" aria-hidden="true">
              <line x1="0" y1="5" x2="24" y2="5" stroke="#FFFFFF" strokeWidth="1.8" strokeDasharray="3 3" />
              <circle cx="12" cy="5" r="3" fill="#FFFFFF" />
            </svg>
            <span>Skin comfort</span>
          </div>
        </div>

        <div className="teaser3-how-overlay-chart-wrap">
          <svg className="teaser3-how-overlay-chart-svg" viewBox="0 0 256 108" aria-hidden="true">
            <defs>
              <clipPath id={clipId}>
                <rect
                  x="0"
                  y="0"
                  width={active ? "256" : "0"}
                  height="108"
                  style={{
                    transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />
              </clipPath>
            </defs>

            <line x1="12" x2="244" y1="24" y2="24" className="teaser3-how-overlay-grid-line" />
            <line x1="12" x2="244" y1="50" y2="50" className="teaser3-how-overlay-grid-line" />
            <line x1="12" x2="244" y1="76" y2="76" className="teaser3-how-overlay-grid-line" />

            <path d={sleepPathD} className="teaser3-how-overlay-path-sleep" clipPath={`url(#${clipId})`} />
            <path d={skinPathD} className="teaser3-how-overlay-path-skin" strokeDasharray="5 4" clipPath={`url(#${clipId})`} />

            {sleepPoints.map(([cx, cy], i) => (
              <circle key={`sleep-${i}`} cx={cx} cy={cy} r="3.5" className="teaser3-how-overlay-ring-node" />
            ))}

            {skinPoints.map(([cx, cy], i) => (
              <circle key={`skin-${i}`} cx={cx} cy={cy} r="3.2" className="teaser3-how-overlay-dot-node" />
            ))}

            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <text key={i} x={20 + i * 36} y="98" textAnchor="middle" className="teaser3-how-overlay-axis-text">
                {d}
              </text>
            ))}
          </svg>
        </div>
      </div>

      {/* Secondary: Tonight's Move */}
      <div className="teaser3-how-glass-overlay teaser3-how-connect-secondary">
        <div className="teaser3-how-overlay-header">
          <span className="teaser3-how-overlay-title">TONIGHT’S MOVE</span>
          <div className="teaser3-how-overlay-time-tag">
            <Moon size={12} aria-hidden="true" />
            <span>10:20 PM</span>
          </div>
        </div>

        <h4 className="teaser3-how-overlay-move-title">Wind down 20 mins earlier tonight.</h4>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   SLIDE DATA DEFINITION
   -------------------------------------------------------------------------- */

interface StorySlide {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

const STORY_SLIDES: StorySlide[] = [
  {
    id: "wear",
    title: "Wear it.",
    description: "Wear it through sleep and everyday life.",
    imageSrc: "/images/threefig-pathway-01-sleep.webp",
    imageAlt: "Resting calmly during sleep wearing the 3FIG smart ring.",
  },
  {
    id: "check-in",
    title: "Check in.",
    description: "A few taps to log how your skin feels.",
    imageSrc: "/images/threefig-pathway-04-rhythm.webp",
    imageAlt: "Gentle morning reflection touching clean skin while wearing the 3FIG ring.",
  },
  {
    id: "connect",
    title: "Connect it.",
    description: "See your body signals and skin check-ins together.",
    imageSrc: "/images/threefig-balance-now-knit.webp",
    imageAlt: "Relaxing at home in soft knitwear with the 3FIG ring naturally visible.",
  },
];

/* --------------------------------------------------------------------------
   MAIN TEASER 3 HOW IT WORKS COMPONENT
   -------------------------------------------------------------------------- */

export function Teaser3HowItWorks() {
  const [activeIdx, setActiveIdx] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scrollToSlide = useCallback((idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const slides = track.querySelectorAll<HTMLElement>(".teaser3-how-slide-card");
    if (slides[idx]) {
      slides[idx].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
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

  const handleScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const scrollLeft = track.scrollLeft;
    const slides = track.querySelectorAll<HTMLElement>(".teaser3-how-slide-card");
    if (!slides.length) return;

    let closestIdx = 0;
    let minDiff = Infinity;
    slides.forEach((slide, idx) => {
      const diff = Math.abs(slide.offsetLeft - track.offsetLeft - scrollLeft);
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

  const current = STORY_SLIDES[activeIdx];

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
            Wear. Check in. <span className="teaser3-title-accent">Connect.</span>
          </h2>
          <p className="teaser3-section-lead">
            Ring data and your skin check-ins, brought together.
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
          {/* Horizontal Track: Starts precisely aligned with container left edge, peeking on the right */}
          <div
            ref={trackRef}
            className="teaser3-how-track"
            onScroll={handleScroll}
          >
            {STORY_SLIDES.map((slide, i) => (
              <div
                key={slide.id}
                className={`teaser3-how-slide-card ${i === activeIdx ? "is-active" : ""}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${STORY_SLIDES.length}: ${slide.title}`}
              >
                {/* Photograph with inserted UI Component Overlay */}
                <div className="teaser3-how-photo-wrap">
                  <Image
                    src={slide.imageSrc}
                    alt={slide.imageAlt}
                    fill
                    className="teaser3-how-clean-photo"
                    sizes="(max-width: 860px) 90vw, (max-width: 1200px) 75vw, 920px"
                    priority={i === 0}
                  />

                  {/* UI Overlays inserted directly onto the image */}
                  {slide.id === "wear" && <Teaser3WearOverlay active={i === activeIdx} />}
                  {slide.id === "check-in" && <Teaser3CheckInOverlay active={i === activeIdx} />}
                  {slide.id === "connect" && <Teaser3ConnectOverlay active={i === activeIdx} />}
                </div>

                {/* Mobile-only inline caption (optional for stacked context) */}
                <div className="teaser3-how-mobile-caption">
                  <h3 className="teaser3-how-slide-title">{slide.title}</h3>
                  <p className="teaser3-how-slide-desc">{slide.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Unified Caption Bar + Arrow-Only Pagination (Web & Mobile) */}
          <div className="teaser3-how-caption-row" aria-live="polite">
            <div className="teaser3-how-text-block">
              <h3 className="teaser3-how-slide-title">{current.title}</h3>
              <p className="teaser3-how-slide-desc">{current.description}</p>
            </div>

            {/* Unified Arrow-Only Navigation Controls */}
            <div className="teaser3-how-nav-controls" aria-label="Slide navigation">
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
          </div>
        </div>
      </div>
    </section>
  );
}
