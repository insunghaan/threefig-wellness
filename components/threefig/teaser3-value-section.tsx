"use client";

import React, { useRef, useState, useEffect, useId } from "react";
import { Moon } from "lucide-react";

/* Lightweight viewport observer for motion */
function useInView(options: IntersectionObserverInit = { threshold: 0.2, rootMargin: "60px" }) {
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
  }, [options]);

  return [ref, inView] as const;
}

/* ------------------------------------------------------------
   01. PREVIEW 01 — SKIN BALANCE
   Teaser3 Clean Aesthetic: Warm ivory/white surface, restrained border, warm-brown accent
   ------------------------------------------------------------ */
export function Teaser3SkinBalancePreview() {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      className={`teaser3-preview-card teaser3-preview-balance ${
        inView ? "is-animated" : ""
      }`}
    >
      <div className="teaser3-preview-header">
        <span className="teaser3-preview-kicker">SKIN BALANCE</span>
        <span className="teaser3-preview-badge">Illustrative preview</span>
      </div>

      <div className="teaser3-preview-score-row">
        <div className="teaser3-preview-score-group">
          <span className="teaser3-preview-score-number">82</span>
          <span className="teaser3-preview-score-total">/ 100</span>
        </div>
        <div className="teaser3-preview-status-tag">
          <span className="teaser3-preview-status-dot" aria-hidden="true" />
          <span>Balanced</span>
        </div>
      </div>

      <div
        className="teaser3-preview-meter-track"
        role="meter"
        aria-label="Illustrative Skin Balance score"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={82}
      >
        <div
          className="teaser3-preview-meter-fill"
          style={{ width: inView ? "82%" : "0%" }}
        />
      </div>

      <p className="teaser3-preview-caption">
        A simple view of the patterns across your supported signals and skin check-ins.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------
   02. PREVIEW 02 — 7-DAY PATTERNS
   Teaser3 Clean Line Chart: White surface, charcoal lines, warm-brown accent, legible labels
   ------------------------------------------------------------ */
export function Teaser3PatternsPreview() {
  const [ref, inView] = useInView();
  const rawClipId = useId();
  const clipId = `teaser3-patterns-clip-${rawClipId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

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

  return (
    <div
      ref={ref}
      className={`teaser3-preview-card teaser3-preview-patterns ${
        inView ? "is-animated" : ""
      }`}
    >
      <div className="teaser3-preview-header">
        <span className="teaser3-preview-kicker">7-DAY PATTERNS</span>
        <span className="teaser3-preview-badge">Illustrative preview</span>
      </div>

      <div className="teaser3-preview-legend">
        <div className="teaser3-legend-item">
          <svg width="26" height="10" viewBox="0 0 26 10" aria-hidden="true">
            <line x1="0" y1="5" x2="26" y2="5" stroke="#1e1e1e" strokeWidth="2" />
            <circle cx="13" cy="5" r="3.5" stroke="#1e1e1e" strokeWidth="2" fill="#ffffff" />
          </svg>
          <span>Sleep consistency</span>
        </div>
        <div className="teaser3-legend-item">
          <svg width="26" height="10" viewBox="0 0 26 10" aria-hidden="true">
            <line x1="0" y1="5" x2="26" y2="5" stroke="#633a29" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx="13" cy="5" r="3" fill="#633a29" />
          </svg>
          <span>Skin comfort</span>
        </div>
      </div>

      <div className="teaser3-chart-wrap">
        <svg
          className="teaser3-chart-svg"
          viewBox="0 0 320 132"
          role="img"
          aria-label="7-day sleep consistency and skin comfort correlation graph"
        >
          <defs>
            <clipPath id={clipId}>
              <rect
                x="0"
                y="0"
                width={inView ? "320" : "0"}
                height="132"
                style={{
                  transition: "width 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
                }}
              />
            </clipPath>
          </defs>

          {/* Reference guidelines */}
          <line x1="16" x2="304" y1="26" y2="26" className="teaser3-chart-grid" />
          <line x1="16" x2="304" y1="56" y2="56" className="teaser3-chart-grid" />
          <line x1="16" x2="304" y1="86" y2="86" className="teaser3-chart-grid" />

          {/* Sleep curve (solid charcoal) */}
          <path
            d={sleepPathD}
            className="teaser3-chart-path-sleep"
            clipPath={`url(#${clipId})`}
          />

          {/* Skin curve (dashed warm brown) */}
          <path
            d={skinPathD}
            className="teaser3-chart-path-skin"
            strokeDasharray="4 3"
            clipPath={`url(#${clipId})`}
          />

          {/* Sleep open nodes */}
          {sleepPoints.map(([cx, cy], i) => (
            <circle
              key={`sleep-${i}`}
              cx={cx}
              cy={cy}
              r="4"
              className="teaser3-chart-node-sleep"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "scale(1)" : "scale(0)",
                transformOrigin: `${cx}px ${cy}px`,
                transition: `all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.3 + i * 0.08}s`,
              }}
            />
          ))}

          {/* Skin solid nodes */}
          {skinPoints.map(([cx, cy], i) => (
            <circle
              key={`skin-${i}`}
              cx={cx}
              cy={cy}
              r="3.5"
              className="teaser3-chart-node-skin"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "scale(1)" : "scale(0)",
                transformOrigin: `${cx}px ${cy}px`,
                transition: `all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.4 + i * 0.08}s`,
              }}
            />
          ))}

          {/* Weekday axis */}
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <text
              key={i}
              x={24 + i * 45.3}
              y="118"
              textAnchor="middle"
              className="teaser3-chart-axis-label"
              style={{
                opacity: inView ? 1 : 0,
                transition: "opacity 0.4s ease 0.2s",
              }}
            >
              {d}
            </text>
          ))}
        </svg>
      </div>

      <p className="teaser3-preview-caption">
        When sleep holds steady, morning skin comfort stays resilient.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------
   03. PREVIEW 03 — TONIGHT’S MOVE
   Teaser3 Clean Recommendation Card: Warm ivory card, time badge, clean typography
   ------------------------------------------------------------ */
export function Teaser3NextMovePreview() {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      className={`teaser3-preview-card teaser3-preview-move ${
        inView ? "is-animated" : ""
      }`}
    >
      <div className="teaser3-preview-header">
        <span className="teaser3-preview-kicker">TONIGHT’S MOVE</span>
        <span className="teaser3-preview-badge">Personalized</span>
      </div>

      <div className="teaser3-preview-move-box">
        <div className="teaser3-preview-time-tag">
          <Moon size={14} className="teaser3-time-icon" aria-hidden="true" />
          <span className="teaser3-time-text">10:20 PM</span>
        </div>
        <h4 className="teaser3-preview-move-title">
          Shift wind-down 20 mins earlier tonight.
        </h4>
        <p className="teaser3-preview-move-rationale">
          Your recovery pattern may benefit from a steadier bedtime.
        </p>
      </div>

      <p className="teaser3-preview-caption">
        One realistic adjustment to support cellular recovery before bed.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------
   MAIN SECTION: WHAT YOU GET
   ------------------------------------------------------------ */
export function Teaser3ValueSection() {
  return (
    <section id="what-you-get" className="teaser3-section teaser3-value-section" aria-labelledby="value-title">
      <div className="teaser3-section-container">
        {/* Section Header */}
        <div className="teaser3-section-head">
          <p className="teaser3-eyebrow">WHAT YOU GET</p>
          <h2 id="value-title" className="teaser3-section-title">
            One clear view. <br className="teaser3-br-desktop" />
            <span className="teaser3-title-accent">One useful next move.</span>
          </h2>
        </div>

        {/* Editorial Rows */}
        <div className="teaser3-value-rows">
          {/* Row 01: Know where you are */}
          <div className="teaser3-value-row teaser3-row-text-left">
            <div className="teaser3-value-text">
              <span className="teaser3-value-step">01</span>
              <p className="teaser3-value-kicker">01 / KNOW WHERE YOU ARE</p>
              <h3 className="teaser3-value-heading">Know where you are.</h3>
              <p className="teaser3-value-subheading">Your Skin Balance, at a glance.</p>
              <p className="teaser3-value-desc">
                See a simple view of how your supported signals and skin check-ins are lining up.
              </p>
            </div>
            <div className="teaser3-value-media">
              <Teaser3SkinBalancePreview />
            </div>
          </div>

          {/* Row 02: See what changed (Alternating on desktop: Media Left, Text Right) */}
          <div className="teaser3-value-row teaser3-row-media-left">
            <div className="teaser3-value-text">
              <span className="teaser3-value-step">02</span>
              <p className="teaser3-value-kicker">02 / SEE WHAT CHANGED</p>
              <h3 className="teaser3-value-heading">See what changed.</h3>
              <p className="teaser3-value-subheading">Notice patterns across your days.</p>
              <p className="teaser3-value-desc">
                Spot small shifts over time and see what may be moving together.
              </p>
            </div>
            <div className="teaser3-value-media">
              <Teaser3PatternsPreview />
            </div>
          </div>

          {/* Row 03: Know what to try */}
          <div className="teaser3-value-row teaser3-row-text-left">
            <div className="teaser3-value-text">
              <span className="teaser3-value-step">03</span>
              <p className="teaser3-value-kicker">03 / KNOW WHAT TO TRY</p>
              <h3 className="teaser3-value-heading">Know what to try.</h3>
              <p className="teaser3-value-subheading">One small move. Not ten.</p>
              <p className="teaser3-value-desc">
                Get one useful suggestion based on the patterns 3FIG is helping you notice.
              </p>
            </div>
            <div className="teaser3-value-media">
              <Teaser3NextMovePreview />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
