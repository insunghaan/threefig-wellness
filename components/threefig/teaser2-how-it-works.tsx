"use client";

import React, { useState, useRef, useId, useEffect } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Moon,
} from "lucide-react";

/* ------------------------------------------------------------
   UI OVERLAY 01: OVERNIGHT SIGNALS (WEAR)
   ------------------------------------------------------------ */
function WearOverlayUI({ active }: { active: boolean }) {
  const metricRows = [
    { name: "Sleep rhythm", status: "Tracked" },
    { name: "Resting HR & HRV", status: "Tracked" },
    { name: "Temperature shifts", status: "Tracked" },
  ];

  return (
    <div className={`teaser2-rail-stack teaser2-wear-stack ${active ? "is-revealed" : ""}`}>
      {/* Primary: Overnight Signals */}
      <div className="teaser2-rail-glass-overlay teaser2-wear-primary">
        <div className="teaser2-overlay-header">
          <span className="teaser2-overlay-title">OVERNIGHT SIGNALS</span>
          <span className="teaser2-overlay-live-dot" aria-hidden="true" />
        </div>

        <div className="teaser2-overlay-metrics-list">
          {metricRows.map((row, idx) => (
            <div
              key={row.name}
              className="teaser2-overlay-metric-row"
              style={{
                transitionDelay: active ? `${0.22 + idx * 0.08}s` : "0s",
              }}
            >
              <span className="teaser2-overlay-metric-name">{row.name}</span>
              <span className="teaser2-overlay-metric-status">{row.status}</span>
            </div>
          ))}
        </div>

        <div
          className="teaser2-overlay-summary-card"
          style={{ transitionDelay: active ? "0.48s" : "0s" }}
        >
          <div className="teaser2-overlay-sleep-time">
            <span className="teaser2-overlay-sleep-label">Overnight sleep</span>
            <strong className="teaser2-overlay-sleep-val">7h 42m asleep</strong>
          </div>
          <span className="teaser2-overlay-microcopy">Building your baseline.</span>
        </div>
      </div>

      {/* Secondary: Daily Rhythm */}
      <div
        className="teaser2-rail-glass-overlay teaser2-wear-secondary"
        style={{ transitionDelay: active ? "0.42s" : "0s" }}
      >
        <div className="teaser2-overlay-header">
          <span className="teaser2-overlay-title">DAILY RHYTHM</span>
          <span className="teaser2-overlay-badge">24-hour</span>
        </div>

        <div className="teaser2-wear-rhythm-strip">
          <div className="teaser2-wear-rhythm-item">
            <span className="teaser2-wear-rhythm-label">Sleep</span>
            <strong className="teaser2-wear-rhythm-val">7h 42m</strong>
          </div>
          <div className="teaser2-wear-rhythm-divider" aria-hidden="true" />
          <div className="teaser2-wear-rhythm-item">
            <span className="teaser2-wear-rhythm-label">Recovery</span>
            <strong className="teaser2-wear-rhythm-val">Steady</strong>
          </div>
          <div className="teaser2-wear-rhythm-divider" aria-hidden="true" />
          <div className="teaser2-wear-rhythm-item">
            <span className="teaser2-wear-rhythm-label">Movement</span>
            <strong className="teaser2-wear-rhythm-val">On track</strong>
          </div>
        </div>

        <p className="teaser2-overlay-footnote">Signals build context across your day.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   UI OVERLAY 02: TODAY'S SKIN (CHECK IN)
   ------------------------------------------------------------ */
function CheckInOverlayUI({ active }: { active: boolean }) {
  const options = ["Calm", "Dry", "Sensitive", "Irritated"];

  return (
    <div className={`teaser2-rail-stack teaser2-checkin-stack ${active ? "is-revealed" : ""}`}>
      {/* Primary: Today's Skin */}
      <div className="teaser2-rail-glass-overlay teaser2-checkin-primary">
        <div className="teaser2-overlay-header">
          <span className="teaser2-overlay-title">TODAY’S SKIN</span>
          <span className="teaser2-overlay-badge">Logged by you</span>
        </div>

        <div className="teaser2-overlay-prompt-block">
          <p className="teaser2-overlay-prompt-label">How does it feel?</p>
          <div className="teaser2-overlay-chips-grid">
            {options.map((opt, idx) => {
              const isSelected = opt === "Calm";
              return (
                <div
                  key={opt}
                  className={`teaser2-overlay-chip ${isSelected ? "is-selected" : ""}`}
                  style={{
                    transitionDelay: active ? `${0.22 + idx * 0.06}s` : "0s",
                  }}
                >
                  {isSelected && <Check size={12} className="teaser2-overlay-chip-icon" aria-hidden="true" />}
                  <span>{opt}</span>
                </div>
              );
            })}
          </div>
        </div>

        <p
          className="teaser2-overlay-footnote"
          style={{ transitionDelay: active ? "0.48s" : "0s" }}
        >
          Takes a few seconds.
        </p>
      </div>

      {/* Secondary: Daily Context */}
      <div
        className="teaser2-rail-glass-overlay teaser2-checkin-secondary"
        style={{ transitionDelay: active ? "0.42s" : "0s" }}
      >
        <div className="teaser2-overlay-header">
          <span className="teaser2-overlay-title">DAILY CONTEXT</span>
          <span className="teaser2-overlay-badge">Optional</span>
        </div>

        <div className="teaser2-checkin-context-row">
          <span className="teaser2-checkin-context-label">Anything worth noting?</span>
          <span className="teaser2-checkin-context-tag">Late meal</span>
        </div>

        <p className="teaser2-overlay-footnote">Add context only when it matters.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   UI OVERLAY 03: PATTERN INSIGHT & TONIGHT'S MOVE (CONNECT)
   ------------------------------------------------------------ */
function ConnectOverlayUI({ active }: { active: boolean }) {
  const rawClipId = useId();
  const clipId = `how-connect-clip-${rawClipId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

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
    <div className={`teaser2-rail-stack teaser2-connect-stack ${active ? "is-revealed" : ""}`}>
      {/* Primary: 7-Day Patterns */}
      <div className="teaser2-rail-glass-overlay teaser2-connect-primary">
        <div className="teaser2-overlay-header">
          <span className="teaser2-overlay-title">7-DAY PATTERNS</span>
          <span className="teaser2-overlay-badge">Interpreted</span>
        </div>

        <div className="teaser2-overlay-legend-row">
          <div className="teaser2-overlay-legend-item">
            <svg width="24" height="10" viewBox="0 0 24 10" aria-hidden="true">
              <line x1="0" y1="5" x2="24" y2="5" stroke="#FFFFFF" strokeWidth="1.8" />
              <circle cx="12" cy="5" r="3" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
            </svg>
            <span>Sleep consistency</span>
          </div>
          <div className="teaser2-overlay-legend-item">
            <svg width="24" height="10" viewBox="0 0 24 10" aria-hidden="true">
              <line x1="0" y1="5" x2="24" y2="5" stroke="#FFFFFF" strokeWidth="1.8" strokeDasharray="3 3" />
              <circle cx="12" cy="5" r="3" fill="#FFFFFF" />
            </svg>
            <span>Skin comfort</span>
          </div>
        </div>

        <div className="teaser2-overlay-chart-wrap">
          <svg className="teaser2-overlay-chart-svg" viewBox="0 0 256 108" aria-hidden="true">
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

            {/* Reference dashed guidelines */}
            <line x1="12" x2="244" y1="24" y2="24" className="teaser2-overlay-grid-line" />
            <line x1="12" x2="244" y1="50" y2="50" className="teaser2-overlay-grid-line" />
            <line x1="12" x2="244" y1="76" y2="76" className="teaser2-overlay-grid-line" />

            {/* Solid Sleep curve with open rings */}
            <path
              d={sleepPathD}
              className="teaser2-overlay-path-sleep"
              clipPath={`url(#${clipId})`}
            />

            {/* Dashed Skin curve with solid dots */}
            <path
              d={skinPathD}
              className="teaser2-overlay-path-skin"
              strokeDasharray="5 4"
              clipPath={`url(#${clipId})`}
            />

            {/* Open sleep nodes */}
            {sleepPoints.map(([cx, cy], i) => (
              <circle
                key={`sleep-${i}`}
                cx={cx}
                cy={cy}
                r="3.5"
                className="teaser2-overlay-ring-node"
                style={{
                  opacity: active ? 1 : 0,
                  transition: `opacity 0.3s ease ${0.4 + i * 0.06}s`,
                }}
              />
            ))}

            {/* Solid skin nodes */}
            {skinPoints.map(([cx, cy], i) => (
              <circle
                key={`skin-${i}`}
                cx={cx}
                cy={cy}
                r="3.2"
                className="teaser2-overlay-dot-node"
                style={{
                  opacity: active ? 1 : 0,
                  transition: `opacity 0.3s ease ${0.45 + i * 0.06}s`,
                }}
              />
            ))}

            {/* Weekdays */}
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <text
                key={i}
                x={20 + i * 36}
                y="98"
                textAnchor="middle"
                className="teaser2-overlay-axis-text"
              >
                {d}
              </text>
            ))}
          </svg>
        </div>

        <p className="teaser2-overlay-footnote">
          When sleep holds steady, morning skin comfort tends to stay more resilient.
        </p>
      </div>

      {/* Secondary: Tonight's Move */}
      <div
        className="teaser2-rail-glass-overlay teaser2-connect-secondary"
        style={{ transitionDelay: active ? "0.45s" : "0s" }}
      >
        <div className="teaser2-overlay-header">
          <span className="teaser2-overlay-title">TONIGHT’S MOVE</span>
          <div className="teaser2-overlay-time-tag">
            <Moon size={12} aria-hidden="true" />
            <span>10:20 PM</span>
          </div>
        </div>

        <h4 className="teaser2-overlay-move-title">
          Wind down 20 mins earlier tonight.
        </h4>
        <p className="teaser2-overlay-move-reason">
          A steadier bedtime may support a more consistent recovery pattern.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   SIMPLIFIED MOBILE UI OVERLAYS (SINGLE-SURFACE DESIGN)
   - Wear: 1 compact signals component with integrated summary
   - Check-in: 1 compact check-in component with integrated context row
   - Connect: 1 merged Pattern + Action component
   ------------------------------------------------------------ */

/* Mobile 01: Overnight Signals (Wear) */
function MobileWearOverlayUI({ active }: { active: boolean }) {
  const metricRows = [
    { name: "Sleep rhythm", status: "TRACKED" },
    { name: "Resting HR & HRV", status: "TRACKED" },
    { name: "Temperature shifts", status: "TRACKED" },
  ];

  return (
    <div className={`teaser2-mobile-single-card teaser2-m-wear-card ${active ? "is-revealed" : ""}`}>
      <div className="teaser2-m-card-header">
        <span className="teaser2-m-card-title">OVERNIGHT SIGNALS</span>
        <span className="teaser2-overlay-live-dot" aria-hidden="true" />
      </div>

      <div className="teaser2-m-metrics-list">
        {metricRows.map((row, idx) => (
          <div
            key={row.name}
            className="teaser2-m-metric-row"
            style={{ transitionDelay: active ? `${0.18 + idx * 0.07}s` : "0s" }}
          >
            <span className="teaser2-m-metric-name">{row.name}</span>
            <span className="teaser2-m-metric-status">{row.status}</span>
          </div>
        ))}
      </div>

      <div
        className="teaser2-m-wear-bottom"
        style={{ transitionDelay: active ? "0.42s" : "0s" }}
      >
        <div className="teaser2-m-wear-sleep-stat">
          <strong className="teaser2-m-wear-sleep-val">7h 42m asleep</strong>
        </div>
        <span className="teaser2-m-wear-baseline">Baseline building</span>
      </div>
    </div>
  );
}

/* Mobile 02: Today's Skin (Check In) */
function MobileCheckInOverlayUI({ active }: { active: boolean }) {
  const options = ["Calm", "Dry", "Sensitive", "Irritated"];

  return (
    <div className={`teaser2-mobile-single-card teaser2-m-checkin-card ${active ? "is-revealed" : ""}`}>
      <div className="teaser2-m-card-header">
        <span className="teaser2-m-card-title">TODAY’S SKIN</span>
        <span className="teaser2-overlay-badge">Logged by you</span>
      </div>

      <div className="teaser2-m-prompt-block">
        <p className="teaser2-m-prompt-label">How does it feel?</p>
        <div className="teaser2-m-chips-grid">
          {options.map((opt, idx) => {
            const isSelected = opt === "Calm";
            return (
              <div
                key={opt}
                className={`teaser2-m-chip ${isSelected ? "is-selected" : ""}`}
                style={{ transitionDelay: active ? `${0.18 + idx * 0.06}s` : "0s" }}
              >
                {isSelected && (
                  <Check size={12} className="teaser2-m-chip-icon" aria-hidden="true" />
                )}
                <span>{opt}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="teaser2-m-context-integrated-row"
        style={{ transitionDelay: active ? "0.42s" : "0s" }}
      >
        <span className="teaser2-m-context-label">Context</span>
        <span className="teaser2-m-context-tag">Late meal</span>
      </div>
    </div>
  );
}

/* Mobile 03: Pattern Insight + Tonight's Move (Connect) */
function MobileConnectOverlayUI({ active }: { active: boolean }) {
  const rawClipId = useId();
  const clipId = `m-connect-clip-${rawClipId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const sleepPoints: [number, number][] = [
    [16, 44],
    [48, 36],
    [80, 44],
    [112, 30],
    [144, 33],
    [176, 18],
    [208, 22],
  ];

  const skinPoints: [number, number][] = [
    [16, 50],
    [48, 43],
    [80, 45],
    [112, 37],
    [144, 35],
    [176, 27],
    [208, 31],
  ];

  const sleepPathD = "M 16,44 L 48,36 L 80,44 L 112,30 L 144,33 L 176,18 L 208,22";
  const skinPathD = "M 16,50 L 48,43 L 80,45 L 112,37 L 144,35 L 176,27 L 208,31";

  return (
    <div className={`teaser2-mobile-single-card teaser2-m-connect-card ${active ? "is-revealed" : ""}`}>
      {/* Upper Section: Pattern Insight */}
      <div className="teaser2-m-card-header">
        <span className="teaser2-m-card-title">PATTERN INSIGHT</span>
        <div className="teaser2-m-legend-row">
          <div className="teaser2-m-legend-item">
            <span className="teaser2-m-legend-line-solid" />
            <span>Sleep</span>
          </div>
          <div className="teaser2-m-legend-item">
            <span className="teaser2-m-legend-line-dashed" />
            <span>Skin</span>
          </div>
        </div>
      </div>

      <div className="teaser2-m-chart-wrap">
        <svg className="teaser2-m-chart-svg" viewBox="0 0 224 74" aria-hidden="true">
          <defs>
            <clipPath id={clipId}>
              <rect
                x="0"
                y="0"
                width={active ? "224" : "0"}
                height="74"
                style={{ transition: "width 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.22s" }}
              />
            </clipPath>
          </defs>

          {/* Reference gridlines */}
          <line x1="10" x2="214" y1="16" y2="16" className="teaser2-overlay-grid-line" />
          <line x1="10" x2="214" y1="38" y2="38" className="teaser2-overlay-grid-line" />

          {/* Curves */}
          <path d={sleepPathD} className="teaser2-overlay-path-sleep" clipPath={`url(#${clipId})`} />
          <path d={skinPathD} className="teaser2-overlay-path-skin" strokeDasharray="4 3" clipPath={`url(#${clipId})`} />

          {/* Nodes */}
          {sleepPoints.map(([cx, cy], i) => (
            <circle
              key={`m-sl-${i}`}
              cx={cx}
              cy={cy}
              r="2.6"
              className="teaser2-overlay-ring-node"
              style={{
                opacity: active ? 1 : 0,
                transition: `opacity 0.25s ease ${0.35 + i * 0.05}s`,
              }}
            />
          ))}
          {skinPoints.map(([cx, cy], i) => (
            <circle
              key={`m-sk-${i}`}
              cx={cx}
              cy={cy}
              r="2.4"
              className="teaser2-overlay-dot-node"
              style={{
                opacity: active ? 1 : 0,
                transition: `opacity 0.25s ease ${0.4 + i * 0.05}s`,
              }}
            />
          ))}

          {/* Weekday axis */}
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <text key={i} x={16 + i * 32} y="68" textAnchor="middle" className="teaser2-overlay-axis-text">
              {d}
            </text>
          ))}
        </svg>
      </div>

      <p className="teaser2-m-pattern-caption">
        Sleep consistency and skin comfort moved together this week.
      </p>

      {/* Divider */}
      <div className="teaser2-m-card-divider" aria-hidden="true" />

      {/* Action Focal Point */}
      <div className="teaser2-m-move-section">
        <div className="teaser2-m-move-header">
          <span className="teaser2-m-card-title">TONIGHT’S MOVE</span>
          <div className="teaser2-m-time-tag">
            <Moon size={11} aria-hidden="true" />
            <span>10:20 PM</span>
          </div>
        </div>

        <h4 className="teaser2-m-move-headline">
          Wind down 20 mins earlier.
        </h4>
        <p className="teaser2-m-move-subtext">
          A steadier bedtime may support a more consistent recovery pattern.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   STORY SLIDE DATA
   ------------------------------------------------------------ */
interface StorySlide {
  id: string;
  stepNumber: string;
  themeLabel: string;
  headline: string;
  bodyCopy: string;
  mobileBodyCopy?: string;
  imageSrc: string;
  imageAlt: string;
  uiOverlay: (active: boolean) => React.ReactNode;
  mobileUiOverlay?: (active: boolean) => React.ReactNode;
}

const STORY_SLIDES: StorySlide[] = [
  {
    id: "wear",
    stepNumber: "01",
    themeLabel: "BACKGROUND SENSING",
    headline: "Wear it.",
    bodyCopy:
      "3FIG quietly tracks supported body signals while you sleep, move, and go about your day.",
    mobileBodyCopy:
      "3FIG quietly tracks supported body signals while you sleep, move, and go about your day.",
    imageSrc: "/images/threefig-pathway-01-sleep.webp",
    imageAlt:
      "A calm waking morning scene with an adult woman resting naturally on linen bedding, the 3FIG smart ring comfortably visible.",
    uiOverlay: (active) => <WearOverlayUI active={active} />,
    mobileUiOverlay: (active) => <MobileWearOverlayUI active={active} />,
  },
  {
    id: "check-in",
    stepNumber: "02",
    themeLabel: "SKIN CHECK-IN",
    headline: "Check in.",
    bodyCopy:
      "A few quick taps capture how your skin feels today — without turning your routine into homework.",
    mobileBodyCopy:
      "A few quick taps capture how your skin feels today.",
    imageSrc: "/images/threefig-pathway-04-rhythm.webp",
    imageAlt:
      "An intimate self-reflection moment with clean morning sunlight touching healthy skin, wearing the 3FIG ring naturally.",
    uiOverlay: (active) => <CheckInOverlayUI active={active} />,
    mobileUiOverlay: (active) => <MobileCheckInOverlayUI active={active} />,
  },
  {
    id: "connect",
    stepNumber: "03",
    themeLabel: "PATTERN INSIGHT",
    headline: "Connect it.",
    bodyCopy:
      "3FIG brings your body signals and skin check-ins together to help meaningful patterns stand out.",
    mobileBodyCopy:
      "3FIG brings your body signals and skin check-ins together to help meaningful patterns stand out.",
    imageSrc: "/images/threefig-balance-now-knit.webp",
    imageAlt:
      "A calm evening winding down at home, resting comfortably in soft knitwear with the 3FIG ring naturally visible.",
    uiOverlay: (active) => <ConnectOverlayUI active={active} />,
    mobileUiOverlay: (active) => <MobileConnectOverlayUI active={active} />,
  },
];

/* ------------------------------------------------------------
   MAIN SECTION COMPONENT: HOW IT WORKS
   ------------------------------------------------------------ */
export function Teaser2HowItWorks() {
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const prevSlide = () => {
    setActiveSlide((curr) => Math.max(0, curr - 1));
  };

  const nextSlide = () => {
    setActiveSlide((curr) => Math.min(STORY_SLIDES.length - 1, curr + 1));
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      prevSlide();
    } else if (e.key === "ArrowRight") {
      nextSlide();
    }
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  const currentSlide = STORY_SLIDES[activeSlide];

  return (
    <section
      id="how-it-works"
      className="teaser2-how-section"
      aria-labelledby="how-heading"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Section Header (Outside of slider, non-scrolling) */}
      <div className="teaser2-section-head">
        <p className="teaser2-eyebrow">HOW IT WORKS</p>
        <h2 id="how-heading" className="teaser2-section-title">
          Wear. Check in. Connect.
        </h2>
        <p className="teaser2-section-lead">
          Ring data and your skin check-ins, brought together.
        </p>
      </div>

      {/* ============================================================
          DESKTOP & TABLET: HORIZONTAL STORY RAIL
          Visual layout: PREVIEW CARD | LARGE ACTIVE SLIDE (75-80%) | PREVIEW CARD
          ============================================================ */}
      <div className="teaser2-story-rail-viewport">
        <div
          className="teaser2-story-rail-track"
          style={{
            transform: `translateX(calc(50% - (var(--story-slide-w) / 2) - ${activeSlide} * (var(--story-slide-w) + var(--story-slide-gap))))`,
          }}
        >
          {STORY_SLIDES.map((slide, idx) => {
            const isActive = activeSlide === idx;

            return (
              <div
                key={slide.id}
                className={`teaser2-story-slide ${isActive ? "is-active" : "is-preview"}`}
                onClick={() => {
                  if (!isActive) setActiveSlide(idx);
                }}
                role={isActive ? "region" : "button"}
                tabIndex={isActive ? -1 : 0}
                aria-label={
                  isActive
                    ? `Active story ${slide.stepNumber}: ${slide.headline}`
                    : `View story ${slide.stepNumber}: ${slide.headline}`
                }
                onKeyDown={(e) => {
                  if (!isActive && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    setActiveSlide(idx);
                  }
                }}
              >
                {/* Background Photography Layer */}
                <div className="teaser2-slide-media-wrap" style={{ position: "absolute", inset: 0 }}>
                  <Image
                    src={slide.imageSrc}
                    alt={slide.imageAlt}
                    fill
                    sizes="(max-width: 900px) 90vw, 980px"
                    className="teaser2-slide-img"
                    priority
                  />
                  <div className="teaser2-slide-scrim" aria-hidden="true" />
                </div>

                {/* Content Layer */}
                <div className="teaser2-slide-inner">
                  {/* Story Editorial Copy */}
                  <div className="teaser2-slide-editorial">
                    <span className="teaser2-slide-theme">{slide.themeLabel}</span>
                    <h3 className="teaser2-slide-headline">{slide.headline}</h3>
                    <p className="teaser2-slide-body">{slide.bodyCopy}</p>
                  </div>

                  {/* Supporting UI Overlay */}
                  <div className="teaser2-slide-ui-container">
                    {slide.uiOverlay(isActive)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================
          MOBILE: ONE POLISHED STORY CARD AT A TIME (FULL USABLE WIDTH)
          - Exactly one slide visible (zero peek left/right)
          - Natural sizing to content (no wasteful empty height)
          - Hardware-accelerated sliding on swipe & arrow clicks
          ============================================================ */}
      <div
        className="teaser2-story-mobile-wrap"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="teaser2-story-mobile-viewport">
          <div
            className="teaser2-story-mobile-track"
            data-active-slide={activeSlide}
          >
            {STORY_SLIDES.map((slide, idx) => {
              const isActive = activeSlide === idx;

              return (
                <div
                  key={slide.id}
                  className={`teaser2-how-mobile-slide ${isActive ? "is-active" : ""}`}
                  aria-hidden={!isActive}
                >
                  {/* Background Photography Layer */}
                  <div className="teaser2-mobile-media-wrap">
                    <Image
                      src={slide.imageSrc}
                      alt={slide.imageAlt}
                      fill
                      sizes="(max-width: 600px) 100vw, 540px"
                      className="teaser2-slide-img"
                      priority
                    />
                    <div className="teaser2-mobile-scrim" aria-hidden="true" />
                  </div>

                  {/* Content Layer: Natural vertical flow without empty gaps */}
                  <div className="teaser2-mobile-content">
                    <div className="teaser2-mobile-editorial">
                      <span className="teaser2-slide-theme">{slide.themeLabel}</span>
                      <h3 className="teaser2-slide-headline">{slide.headline}</h3>
                      <p className="teaser2-slide-body">
                        {slide.mobileBodyCopy || slide.bodyCopy}
                      </p>
                    </div>

                    <div className="teaser2-mobile-ui-slot">
                      {slide.mobileUiOverlay ? slide.mobileUiOverlay(isActive) : slide.uiOverlay(isActive)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================
          CAROUSEL CONTROLS: ARROWS ONLY
          Restrained, visitor-controlled, minimal, stable layout
          ============================================================ */}
      <div className="teaser2-rail-controls-bar">
        <div className="teaser2-rail-arrows-group">
          <button
            type="button"
            className={`teaser2-rail-arrow-btn ${activeSlide === 0 ? "is-disabled" : ""}`}
            onClick={prevSlide}
            disabled={activeSlide === 0}
            aria-label="Previous story"
          >
            <ArrowLeft size={18} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className={`teaser2-rail-arrow-btn ${
              activeSlide === STORY_SLIDES.length - 1 ? "is-disabled" : ""
            }`}
            onClick={nextSlide}
            disabled={activeSlide === STORY_SLIDES.length - 1}
            aria-label="Next story"
          >
            <ArrowRight size={18} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </section>
  );
}
