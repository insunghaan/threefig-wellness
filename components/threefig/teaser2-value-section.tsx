"use client";

import React, { useRef, useState, useEffect, useId } from "react";

/* ------------------------------------------------------------
   LIGHTWEIGHT HOOK FOR TRIGGERING MOTION ON VIEWPORT ENTRY
   ------------------------------------------------------------ */
function useInView(options: IntersectionObserverInit = { threshold: 0.15, rootMargin: "100px" }) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.unobserve(el);
      }
    }, options);

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, inView] as const;
}

/* ------------------------------------------------------------
   01. COMPONENT 01 — SKIN BALANCE
   Translucent Frosted Glass Plaque (Reference: media_1790307698273.jpg)
   ------------------------------------------------------------ */
export function SkinBalanceUI({ isActive }: { isActive?: boolean }) {
  const [ref, inView] = useInView({ threshold: 0.25 });
  const animated = Boolean(inView || isActive);

  return (
    <div
      ref={ref}
      className={`teaser2-glass-card teaser2-glass-balance ${
        animated ? "is-animated" : ""
      }`}
    >
      <div className="teaser2-glass-header">
        <span className="teaser2-glass-title">SKIN BALANCE</span>
        <span className="teaser2-glass-pill">Illustrative preview</span>
      </div>

      <div className="teaser2-glass-score-row">
        <div className="teaser2-glass-num-group">
          <span className="teaser2-glass-big-score">82</span>
          <span className="teaser2-glass-scale">/ 100</span>
        </div>
        <div className="teaser2-glass-status-tag">
          <span className="teaser2-glass-status-dot" aria-hidden="true" />
          <span>Balanced</span>
        </div>
      </div>

      <div
        className="teaser2-glass-meter-bar"
        role="meter"
        aria-label="Illustrative Skin Balance score"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={82}
      >
        <div
          className="teaser2-glass-meter-fill"
          style={{ width: animated ? "82%" : "0%" }}
        />
      </div>

      <p className="teaser2-glass-footnote">
        A simple view of the patterns across your supported signals and skin check-ins.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------
   02. COMPONENT 02 — 7-DAY PATTERNS
   Translucent Frosted Glass Plaque (Reference: media_1790307698280.jpg)
   ------------------------------------------------------------ */
export function PatternUI({ isActive }: { isActive?: boolean }) {
  const [ref, inView] = useInView({ threshold: 0.25 });
  const animated = Boolean(inView || isActive);

  const sleepPoints: [number, number][] = [
    [24, 75],
    [68, 62],
    [114, 76],
    [160, 52],
    [206, 56],
    [252, 30],
    [296, 36],
  ];

  const skinPoints: [number, number][] = [
    [24, 85],
    [68, 74],
    [114, 78],
    [160, 64],
    [206, 60],
    [252, 44],
    [296, 50],
  ];

  const sleepPathD = "M 24,75 L 68,62 L 114,76 L 160,52 L 206,56 L 252,30 L 296,36";
  const skinPathD = "M 24,85 L 68,74 L 114,78 L 160,64 L 206,60 L 252,44 L 296,50";

  const rawClipId = useId();
  const clipId = `chart-clip-${rawClipId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <div
      ref={ref}
      className={`teaser2-glass-card teaser2-glass-patterns ${
        animated ? "is-animated" : ""
      }`}
    >
      <div className="teaser2-glass-header">
        <span className="teaser2-glass-title">7-DAY PATTERNS</span>
        <span className="teaser2-glass-pill">Illustrative preview</span>
      </div>

      <div className="teaser2-glass-legend-row">
        <div className="teaser2-glass-legend-item">
          <svg width="30" height="12" viewBox="0 0 30 12" className="teaser2-glass-legend-svg" aria-hidden="true">
            <line x1="0" y1="6" x2="30" y2="6" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="15" cy="6" r="3.5" stroke="#FFFFFF" strokeWidth="2" fill="none" />
          </svg>
          <span>Sleep consistency</span>
        </div>
        <div className="teaser2-glass-legend-item">
          <svg width="30" height="12" viewBox="0 0 30 12" className="teaser2-glass-legend-svg" aria-hidden="true">
            <line x1="0" y1="6" x2="30" y2="6" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx="15" cy="6" r="3.5" fill="#FFFFFF" />
          </svg>
          <span>Skin comfort</span>
        </div>
      </div>

      <div className="teaser2-glass-chart-wrap">
        <svg
          className="teaser2-glass-svg"
          viewBox="0 0 320 132"
          role="img"
          aria-label="7-day sleep consistency and skin comfort correlation graph"
        >
          <defs>
            <clipPath id={clipId}>
              <rect
                x="0"
                y="0"
                width={animated ? "320" : "0"}
                height="132"
                style={{
                  transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.25s",
                }}
              />
            </clipPath>
          </defs>

          {/* Subtle horizontal reference dashed lines */}
          <line x1="16" x2="304" y1="26" y2="26" className="teaser2-glass-grid-line" />
          <line x1="16" x2="304" y1="56" y2="56" className="teaser2-glass-grid-line" />
          <line x1="16" x2="304" y1="86" y2="86" className="teaser2-glass-grid-line" />

          {/* Sleep curve (solid line with open rings) */}
          <path
            d={sleepPathD}
            className="teaser2-glass-path-sleep"
            clipPath={`url(#${clipId})`}
          />

          {/* Skin comfort curve (dashed line with solid dots) */}
          <path
            d={skinPathD}
            className="teaser2-glass-path-skin"
            strokeDasharray="5 4"
            clipPath={`url(#${clipId})`}
          />

          {/* Sleep Open Rings */}
          {sleepPoints.map(([cx, cy], i) => (
            <circle
              key={`sleep-${i}`}
              cx={cx}
              cy={cy}
              r="4.5"
              className="teaser2-glass-ring-node"
              style={{
                opacity: animated ? 1 : 0,
                transform: animated ? "scale(1)" : "scale(0)",
                transformOrigin: `${cx}px ${cy}px`,
                transition: `all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.35 + i * 0.09}s`,
              }}
            />
          ))}

          {/* Skin Solid Dots */}
          {skinPoints.map(([cx, cy], i) => (
            <circle
              key={`skin-${i}`}
              cx={cx}
              cy={cy}
              r="4"
              className="teaser2-glass-dot-node"
              style={{
                opacity: animated ? 1 : 0,
                transform: animated ? "scale(1)" : "scale(0)",
                transformOrigin: `${cx}px ${cy}px`,
                transition: `all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.45 + i * 0.09}s`,
              }}
            />
          ))}

          {/* Weekday markers */}
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <text
              key={i}
              x={24 + i * 45.3}
              y="120"
              textAnchor="middle"
              className="teaser2-glass-axis-text"
              style={{
                opacity: animated ? 1 : 0,
                transition: "opacity 0.4s ease 0.2s",
              }}
            >
              {d}
            </text>
          ))}
        </svg>
      </div>

      <p className="teaser2-glass-footnote">
        When sleep holds steady, morning skin comfort stays resilient.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------
   03. COMPONENT 03 — TONIGHT’S MOVE
   Translucent Frosted Glass Plaque (Reference: media_1790307698277.jpg)
   ------------------------------------------------------------ */
export function NextMoveUI({ isActive }: { isActive?: boolean }) {
  const [ref, inView] = useInView({ threshold: 0.25 });
  const animated = Boolean(inView || isActive);

  return (
    <div
      ref={ref}
      className={`teaser2-glass-card teaser2-glass-move ${
        animated ? "is-animated" : ""
      }`}
    >
      <div className="teaser2-glass-header">
        <span className="teaser2-glass-title">TONIGHT’S MOVE</span>
        <span className="teaser2-glass-pill">Personalized</span>
      </div>

      <div className="teaser2-glass-move-panel">
        <div className="teaser2-glass-time-row">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="teaser2-glass-moon"
            aria-hidden="true"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          <span className="teaser2-glass-time-text">10:20 PM</span>
        </div>
        <h4 className="teaser2-glass-recommendation">
          Shift wind-down 20 mins earlier tonight.
        </h4>
        <p className="teaser2-glass-rationale">
          Your recovery pattern may benefit from a steadier bedtime.
        </p>
      </div>

      <p className="teaser2-glass-footnote">
        One realistic adjustment to support cellular recovery before bed.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------
   MAIN SECTION COMPONENT
   ------------------------------------------------------------ */

const storyData = [
  {
    id: "balance",
    num: "01",
    eyebrow: "01 / KNOW WHERE YOU ARE",
    title: "Know where you are.",
    subtitle: "Your Skin Balance, at a glance.",
    desc: "See a simple view of how your supported signals and skin check-ins are lining up.",
  },
  {
    id: "patterns",
    num: "02",
    eyebrow: "02 / SEE WHAT CHANGED",
    title: "See what changed.",
    subtitle: "Notice patterns across your days.",
    desc: "Spot small shifts over time and see what may be moving together.",
  },
  {
    id: "move",
    num: "03",
    eyebrow: "03 / KNOW WHAT TO TRY",
    title: "Know what to try.",
    subtitle: "One small move. Not ten.",
    desc: "Get one useful suggestion based on the patterns 3FIG is helping you notice.",
  },
];

export function Teaser2ValueSection() {
  const [mobileActiveIdx, setMobileActiveIdx] = useState(0);
  const mobileTrackRef = useRef<HTMLDivElement | null>(null);

  const handleMobileScroll = () => {
    const el = mobileTrackRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const slideWidth = el.offsetWidth * 0.86;
    const newIdx = Math.round(scrollLeft / slideWidth);
    if (newIdx !== mobileActiveIdx && newIdx >= 0 && newIdx < storyData.length) {
      setMobileActiveIdx(newIdx);
    }
  };

  const scrollToMobileSlide = (idx: number) => {
    const el = mobileTrackRef.current;
    if (!el) return;
    const targetChild = el.children[idx] as HTMLElement;
    if (targetChild) {
      targetChild.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
      setMobileActiveIdx(idx);
    }
  };

  return (
    <section id="value" className="teaser2-value-section" aria-labelledby="value-heading">
      {/* Editorial Section Header */}
      <div className="teaser2-section-head">
        <p className="teaser2-eyebrow">WHAT YOU GET</p>
        <h2 id="value-heading" className="teaser2-section-title">
          One clear view.<br />
          <em>One useful next move.</em>
        </h2>
      </div>

      {/* ============================================================
          DESKTOP: LARGE ALTERNATING EDITORIAL SPLIT STORIES
          ============================================================ */}
      <div className="teaser2-value-desktop-stories">
        {/* Story 01: Text Left, UI Right */}
        <div className="teaser2-split-row teaser2-split-text-left">
          <div className="teaser2-split-copy">
            <p className="teaser2-story-eyebrow">01 / KNOW WHERE YOU ARE</p>
            <h3 className="teaser2-story-title">Know where you are.</h3>
            <p className="teaser2-story-subtitle">Your Skin Balance, at a glance.</p>
            <p className="teaser2-story-desc">
              See a simple view of how your supported signals and skin check-ins are lining up.
            </p>
          </div>
          <div className="teaser2-split-visual">
            <div className="teaser2-stage-box teaser2-stage-balance">
              <SkinBalanceUI />
            </div>
          </div>
        </div>

        {/* Story 02: UI Left, Text Right (Alternating) */}
        <div className="teaser2-split-row teaser2-split-ui-left">
          <div className="teaser2-split-visual">
            <div className="teaser2-stage-box teaser2-stage-patterns">
              <PatternUI />
            </div>
          </div>
          <div className="teaser2-split-copy">
            <p className="teaser2-story-eyebrow">02 / SEE WHAT CHANGED</p>
            <h3 className="teaser2-story-title">See what changed.</h3>
            <p className="teaser2-story-subtitle">Notice patterns across your days.</p>
            <p className="teaser2-story-desc">
              Spot small shifts over time and see what may be moving together.
            </p>
          </div>
        </div>

        {/* Story 03: Text Left, UI Right */}
        <div className="teaser2-split-row teaser2-split-text-left">
          <div className="teaser2-split-copy">
            <p className="teaser2-story-eyebrow">03 / KNOW WHAT TO TRY</p>
            <h3 className="teaser2-story-title">Know what to try.</h3>
            <p className="teaser2-story-subtitle">One small move. Not ten.</p>
            <p className="teaser2-story-desc">
              Get one useful suggestion based on the patterns 3FIG is helping you notice.
            </p>
          </div>
          <div className="teaser2-split-visual">
            <div className="teaser2-stage-box teaser2-stage-move">
              <NextMoveUI />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          MOBILE: CLEAN HORIZONTAL SCROLL-SNAP CAROUSEL
          Each slide owns its own text + UI inside square stage box
          ============================================================ */}
      <div className="teaser2-value-mobile-carousel">
        <div
          className="teaser2-mobile-track"
          ref={mobileTrackRef}
          onScroll={handleMobileScroll}
          role="region"
          aria-label="Product experience stories"
        >
          {storyData.map((item, idx) => (
            <div
              key={item.id}
              className={`teaser2-mobile-slide ${
                mobileActiveIdx === idx ? "is-active" : ""
              }`}
            >
              <div className="teaser2-mobile-slide-header">
                <span className="teaser2-mobile-slide-num">{item.num}</span>
                <h3 className="teaser2-mobile-slide-title">{item.title}</h3>
                <p className="teaser2-mobile-slide-subtitle">{item.subtitle}</p>
                <p className="teaser2-mobile-slide-desc">{item.desc}</p>
              </div>
              <div className="teaser2-mobile-slide-ui">
                <div className={`teaser2-stage-box teaser2-stage-${item.id}`}>
                  {item.id === "balance" && (
                    <SkinBalanceUI isActive={mobileActiveIdx === idx} />
                  )}
                  {item.id === "patterns" && (
                    <PatternUI isActive={mobileActiveIdx === idx} />
                  )}
                  {item.id === "move" && (
                    <NextMoveUI isActive={mobileActiveIdx === idx} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Consistent Pagination Indicators */}
        <div className="teaser2-slider-pagination" role="tablist" aria-label="Stories pagination">
          {storyData.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={mobileActiveIdx === idx}
              aria-label={`Story ${idx + 1}: ${item.title}`}
              className={`teaser2-page-indicator ${
                mobileActiveIdx === idx ? "is-active" : ""
              }`}
              onClick={() => scrollToMobileSlide(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
