"use client";

import React, { useState, useRef, useId } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, Moon } from "lucide-react";

/* ------------------------------------------------------------
   UI OVERLAY 01: OVERNIGHT SIGNALS & DAILY RHYTHM (WEAR)
   ------------------------------------------------------------ */
function WearOverlay({ active }: { active: boolean }) {
  const metricRows = [
    { name: "Sleep rhythm", status: "Tracked" },
    { name: "Resting HR & HRV", status: "Tracked" },
    { name: "Temperature shifts", status: "Tracked" },
  ];

  return (
    <div className={`teaser3-story-stack teaser3-stack-wear ${active ? "is-active" : ""}`}>
      {/* Primary: Overnight Signals */}
      <div className="teaser3-story-panel teaser3-panel-wear-primary">
        <div className="teaser3-panel-header">
          <span className="teaser3-panel-title">OVERNIGHT SIGNALS</span>
          <span className="teaser3-panel-live-dot" aria-hidden="true" />
        </div>

        <div className="teaser3-metrics-list">
          {metricRows.map((row, idx) => (
            <div
              key={row.name}
              className="teaser3-metric-row"
              style={{
                transitionDelay: active ? `${0.2 + idx * 0.08}s` : "0s",
              }}
            >
              <span className="teaser3-metric-name">{row.name}</span>
              <span className="teaser3-metric-status">{row.status}</span>
            </div>
          ))}
        </div>

        <div className="teaser3-summary-card">
          <div className="teaser3-summary-info">
            <span className="teaser3-summary-label">Overnight sleep</span>
            <strong className="teaser3-summary-value">7h 42m asleep</strong>
          </div>
          <span className="teaser3-summary-note">Building your baseline.</span>
        </div>
      </div>

      {/* Secondary: Daily Rhythm */}
      <div className="teaser3-story-panel teaser3-panel-wear-secondary">
        <div className="teaser3-panel-header">
          <span className="teaser3-panel-title">DAILY RHYTHM</span>
          <span className="teaser3-panel-badge">24-hour</span>
        </div>

        <div className="teaser3-rhythm-strip">
          <div className="teaser3-rhythm-item">
            <span className="teaser3-rhythm-label">Sleep</span>
            <strong className="teaser3-rhythm-value">7h 42m</strong>
          </div>
          <div className="teaser3-rhythm-divider" aria-hidden="true" />
          <div className="teaser3-rhythm-item">
            <span className="teaser3-rhythm-label">Recovery</span>
            <strong className="teaser3-rhythm-value">Steady</strong>
          </div>
          <div className="teaser3-rhythm-divider" aria-hidden="true" />
          <div className="teaser3-rhythm-item">
            <span className="teaser3-rhythm-label">Movement</span>
            <strong className="teaser3-rhythm-value">On track</strong>
          </div>
        </div>

        <p className="teaser3-panel-footnote">Signals build context across your day.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   UI OVERLAY 02: TODAY'S SKIN & DAILY CONTEXT (CHECK IN)
   ------------------------------------------------------------ */
function CheckInOverlay({ active }: { active: boolean }) {
  const options = ["Calm", "Dry", "Sensitive", "Irritated"];

  return (
    <div className={`teaser3-story-stack teaser3-stack-checkin ${active ? "is-active" : ""}`}>
      {/* Primary: Today's Skin */}
      <div className="teaser3-story-panel teaser3-panel-checkin-primary">
        <div className="teaser3-panel-header">
          <span className="teaser3-panel-title">TODAY’S SKIN</span>
          <span className="teaser3-panel-badge">Logged by you</span>
        </div>

        <div className="teaser3-prompt-block">
          <p className="teaser3-prompt-label">How does it feel?</p>
          <div className="teaser3-chips-grid">
            {options.map((opt, idx) => {
              const isSelected = opt === "Calm";
              return (
                <div
                  key={opt}
                  className={`teaser3-chip ${isSelected ? "is-selected" : ""}`}
                  style={{
                    transitionDelay: active ? `${0.2 + idx * 0.06}s` : "0s",
                  }}
                >
                  {isSelected && <Check size={12} className="teaser3-chip-icon" aria-hidden="true" />}
                  <span>{opt}</span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="teaser3-panel-footnote">Takes a few seconds.</p>
      </div>

      {/* Secondary: Daily Context */}
      <div className="teaser3-story-panel teaser3-panel-checkin-secondary">
        <div className="teaser3-panel-header">
          <span className="teaser3-panel-title">DAILY CONTEXT</span>
          <span className="teaser3-panel-badge">Optional</span>
        </div>

        <div className="teaser3-context-row">
          <span className="teaser3-context-label">Anything worth noting?</span>
          <span className="teaser3-context-tag">Late meal</span>
        </div>

        <p className="teaser3-panel-footnote">Add context only when it matters.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   UI OVERLAY 03: 7-DAY PATTERNS & TONIGHT'S MOVE (CONNECT)
   ------------------------------------------------------------ */
function ConnectOverlay({ active }: { active: boolean }) {
  const rawClipId = useId();
  const clipId = `teaser3-how-clip-${rawClipId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

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
    <div className={`teaser3-story-stack teaser3-stack-connect ${active ? "is-active" : ""}`}>
      {/* Primary: 7-Day Patterns */}
      <div className="teaser3-story-panel teaser3-panel-connect-primary">
        <div className="teaser3-panel-header">
          <span className="teaser3-panel-title">7-DAY PATTERNS</span>
          <span className="teaser3-panel-badge">Interpreted</span>
        </div>

        <div className="teaser3-legend-row">
          <div className="teaser3-legend-item">
            <svg width="22" height="10" viewBox="0 0 22 10" aria-hidden="true">
              <line x1="0" y1="5" x2="22" y2="5" stroke="#1e1e1e" strokeWidth="1.8" />
              <circle cx="11" cy="5" r="3" stroke="#1e1e1e" strokeWidth="1.8" fill="#ffffff" />
            </svg>
            <span>Sleep consistency</span>
          </div>
          <div className="teaser3-legend-item">
            <svg width="22" height="10" viewBox="0 0 22 10" aria-hidden="true">
              <line x1="0" y1="5" x2="22" y2="5" stroke="#633a29" strokeWidth="1.8" strokeDasharray="3 3" />
              <circle cx="11" cy="5" r="3" fill="#633a29" />
            </svg>
            <span>Skin comfort</span>
          </div>
        </div>

        <div className="teaser3-how-chart-wrap">
          <svg className="teaser3-how-chart-svg" viewBox="0 0 256 108" aria-hidden="true">
            <defs>
              <clipPath id={clipId}>
                <rect
                  x="0"
                  y="0"
                  width={active ? "256" : "0"}
                  height="108"
                  style={{
                    transition: "width 1s cubic-bezier(0.16, 1, 0.3, 1) 0.28s",
                  }}
                />
              </clipPath>
            </defs>

            <line x1="12" x2="244" y1="24" y2="24" className="teaser3-chart-grid" />
            <line x1="12" x2="244" y1="50" y2="50" className="teaser3-chart-grid" />
            <line x1="12" x2="244" y1="76" y2="76" className="teaser3-chart-grid" />

            <path
              d={sleepPathD}
              className="teaser3-chart-path-sleep"
              clipPath={`url(#${clipId})`}
            />
            <path
              d={skinPathD}
              className="teaser3-chart-path-skin"
              strokeDasharray="4 3"
              clipPath={`url(#${clipId})`}
            />

            {sleepPoints.map(([cx, cy], i) => (
              <circle
                key={`sleep-${i}`}
                cx={cx}
                cy={cy}
                r="3.5"
                className="teaser3-chart-node-sleep"
                style={{
                  opacity: active ? 1 : 0,
                  transition: `opacity 0.3s ease ${0.4 + i * 0.06}s`,
                }}
              />
            ))}

            {skinPoints.map(([cx, cy], i) => (
              <circle
                key={`skin-${i}`}
                cx={cx}
                cy={cy}
                r="3"
                className="teaser3-chart-node-skin"
                style={{
                  opacity: active ? 1 : 0,
                  transition: `opacity 0.3s ease ${0.45 + i * 0.06}s`,
                }}
              />
            ))}

            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <text
                key={i}
                x={20 + i * 36}
                y="98"
                textAnchor="middle"
                className="teaser3-chart-axis-label"
              >
                {d}
              </text>
            ))}
          </svg>
        </div>

        <p className="teaser3-panel-footnote">
          When sleep holds steady, morning skin comfort tends to stay more resilient.
        </p>
      </div>

      {/* Secondary: Tonight's Move */}
      <div className="teaser3-story-panel teaser3-panel-connect-secondary">
        <div className="teaser3-panel-header">
          <span className="teaser3-panel-title">TONIGHT’S MOVE</span>
          <div className="teaser3-time-tag">
            <Moon size={12} aria-hidden="true" />
            <span>10:20 PM</span>
          </div>
        </div>

        <h4 className="teaser3-move-headline">
          Wind down 20 mins earlier tonight.
        </h4>
        <p className="teaser3-move-reason">
          A steadier bedtime may support a more consistent recovery pattern.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   STORY SLIDES DEFINITIONS
   ------------------------------------------------------------ */
interface StorySlide {
  id: string;
  stepNumber: string;
  themeLabel: string;
  headline: string;
  bodyCopy: string;
  imageSrc: string;
  imageAlt: string;
  renderOverlay: (active: boolean) => React.ReactNode;
}

const STORY_SLIDES: StorySlide[] = [
  {
    id: "wear",
    stepNumber: "01",
    themeLabel: "BACKGROUND SENSING",
    headline: "Wear it.",
    bodyCopy:
      "3FIG quietly tracks supported body signals while you sleep, move, and go about your day.",
    imageSrc: "/images/threefig-pathway-01-sleep.webp",
    imageAlt:
      "A calm waking morning scene with an adult woman resting naturally on linen bedding, the 3FIG smart ring comfortably visible.",
    renderOverlay: (active) => <WearOverlay active={active} />,
  },
  {
    id: "check-in",
    stepNumber: "02",
    themeLabel: "SKIN CHECK-IN",
    headline: "Check in.",
    bodyCopy:
      "A few quick taps capture how your skin feels today — without turning your routine into homework.",
    imageSrc: "/images/threefig-pathway-04-rhythm.webp",
    imageAlt:
      "An intimate self-reflection moment with clean morning sunlight touching healthy skin, wearing the 3FIG ring naturally.",
    renderOverlay: (active) => <CheckInOverlay active={active} />,
  },
  {
    id: "connect",
    stepNumber: "03",
    themeLabel: "PATTERN INSIGHT",
    headline: "Connect it.",
    bodyCopy:
      "3FIG brings your body signals and skin check-ins together to help meaningful patterns stand out.",
    imageSrc: "/images/threefig-balance-now-knit.webp",
    imageAlt:
      "A calm evening winding down at home, resting comfortably in soft knitwear with the 3FIG ring naturally visible.",
    renderOverlay: (active) => <ConnectOverlay active={active} />,
  },
];

/* ------------------------------------------------------------
   MAIN SECTION: HOW IT WORKS
   ------------------------------------------------------------ */
export function Teaser3HowItWorks() {
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const prevSlide = () => {
    setActiveSlide((curr) => Math.max(0, curr - 1));
  };

  const nextSlide = () => {
    setActiveSlide((curr) => Math.min(STORY_SLIDES.length - 1, curr + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
  };

  const current = STORY_SLIDES[activeSlide];

  return (
    <section id="how-it-works" className="teaser3-section teaser3-how-section" aria-labelledby="how-title">
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

        {/* Step Navigation Tabs */}
        <div className="teaser3-how-nav" role="tablist" aria-label="Story steps">
          {STORY_SLIDES.map((slide, idx) => {
            const isActive = activeSlide === idx;
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`story-panel-${slide.id}`}
                id={`story-tab-${slide.id}`}
                className={`teaser3-how-tab ${isActive ? "is-active" : ""}`}
                onClick={() => setActiveSlide(idx)}
              >
                <span className="teaser3-how-tab-num">{slide.stepNumber}</span>
                <span className="teaser3-how-tab-label">{slide.headline}</span>
              </button>
            );
          })}
        </div>

        {/* Active Story Stage */}
        <div
          className="teaser3-how-stage"
          id={`story-panel-${current.id}`}
          role="tabpanel"
          aria-labelledby={`story-tab-${current.id}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Stage Media Container */}
          <div className="teaser3-how-media-container">
            <Image
              src={current.imageSrc}
              alt={current.imageAlt}
              fill
              className="teaser3-how-image"
              sizes="(max-width: 860px) 100vw, 900px"
              priority={activeSlide === 0}
            />
            {/* Subtle Gradient Veil for Text Contrast */}
            <div className="teaser3-how-veil" aria-hidden="true" />

            {/* Interface Overlay Elements */}
            <div className="teaser3-how-overlay-wrap">
              {current.renderOverlay(true)}
            </div>
          </div>

          {/* Story Explanation Footer */}
          <div className="teaser3-how-meta">
            <div className="teaser3-how-meta-text">
              <span className="teaser3-how-theme">{current.themeLabel}</span>
              <h3 className="teaser3-how-headline">{current.headline}</h3>
              <p className="teaser3-how-desc">{current.bodyCopy}</p>
            </div>

            {/* Prev / Next Controls */}
            <div className="teaser3-how-controls" aria-label="Step carousel controls">
              <button
                type="button"
                className="teaser3-how-control-btn"
                onClick={prevSlide}
                disabled={activeSlide === 0}
                aria-label="Previous step"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="teaser3-how-step-dots" role="presentation">
                {STORY_SLIDES.map((_, i) => (
                  <span
                    key={i}
                    className={`teaser3-how-dot ${i === activeSlide ? "is-active" : ""}`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <button
                type="button"
                className="teaser3-how-control-btn"
                onClick={nextSlide}
                disabled={activeSlide === STORY_SLIDES.length - 1}
                aria-label="Next step"
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
