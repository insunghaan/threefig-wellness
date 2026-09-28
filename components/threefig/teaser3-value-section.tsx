"use client";

import React, { useRef, useState, useEffect, useId } from "react";

/* Lightweight viewport observer for motion */
function useInView(options: IntersectionObserverInit = { threshold: 0.15, rootMargin: "60px" }) {
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
   Circular Score Component:
   - "SKIN BALANCE" kicker + "Illustrative preview" badge
   - Large circular gauge starting at 12 o'clock, filling clockwise 82%
   - Pale track for remaining 18% with rounded ends
   - Pink-to-coral gradient along progress
   - Prominent "82" with secondary "/ 100" and green "Balanced" pill
   - Soft rose-tinted explanatory box below
   ------------------------------------------------------------ */
export function Teaser3SkinBalancePreview({ isActive }: { isActive?: boolean }) {
  const [ref, inView] = useInView();
  const rawId = useId();
  const gradId = `teaser3-gauge-grad-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const animated = Boolean(inView || isActive);
  const [displayScore, setDisplayScore] = useState(0);

  // Gauge geometry: r=74, cx=90, cy=90
  const radius = 74;
  const circumference = 2 * Math.PI * radius; // ~464.955
  const targetPercent = 0.82;
  const targetOffset = circumference * (1 - targetPercent);

  useEffect(() => {
    if (!animated) {
      setDisplayScore(0);
      return;
    }
    let startTimestamp: number | null = null;
    const duration = 1100;
    const endVal = 82;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayScore(Math.round(endVal * ease));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    const reqId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(reqId);
  }, [animated]);

  return (
    <div
      ref={ref}
      className={`teaser3-preview-card teaser3-glass-card teaser3-preview-balance ${
        animated ? "is-animated" : ""
      }`}
    >
      <div className="teaser3-preview-header">
        <span className="teaser3-preview-kicker">SKIN BALANCE</span>
        <span className="teaser3-preview-badge">Illustrative preview</span>
      </div>

      {/* Large Circular Gauge Container */}
      <div className="teaser3-gauge-wrap">
        <svg
          className="teaser3-gauge-svg"
          viewBox="0 0 180 180"
          role="meter"
          aria-label="Skin Balance score 82 out of 100"
          aria-valuenow={82}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <defs>
            <linearGradient id={gradId} x1="50%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fa528a" />
              <stop offset="50%" stopColor="#f87488" />
              <stop offset="100%" stopColor="#f78d78" />
            </linearGradient>
          </defs>

          {/* Pale background track (remaining 18% visible through here) */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            className="teaser3-gauge-track"
            stroke="rgba(255, 230, 238, 0.45)"
            strokeWidth="13"
            fill="none"
          />

          {/* Animated progress arc: starts exactly at 12 o'clock, fills clockwise 82% */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            className="teaser3-gauge-fill"
            stroke={`url(#${gradId})`}
            strokeWidth="13"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animated ? targetOffset : circumference}
            transform="rotate(-90 90 90)"
            style={{
              transition: "stroke-dashoffset 1.15s cubic-bezier(0.16, 1, 0.3, 1) 0.15s",
            }}
          />
        </svg>

        {/* Center content inside the gauge */}
        <div className="teaser3-gauge-center">
          <div className="teaser3-gauge-score-row">
            <span className="teaser3-gauge-number">{displayScore}</span>
            <span className="teaser3-gauge-total">/ 100</span>
          </div>
          <div className="teaser3-preview-status-tag">
            <span className="teaser3-preview-status-dot" aria-hidden="true" />
            <span>Balanced</span>
          </div>
        </div>
      </div>

      {/* Soft rose-tinted explanatory area below */}
      <div className="teaser3-preview-explainer">
        <p>A simple view of the patterns across your supported signals and skin check-ins.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   02. PREVIEW 02 — 7-DAY PATTERNS
   Chart Component:
   - Heading + Illustrative preview badge
   - Two-series legend:
     * Sleep consistency (Green solid line with hollow circular marker)
     * Skin comfort (Pink dashed line with filled circular marker)
   - Restrained green area fill under Sleep line
   - Light dashed grid lines
   - 7 weekday labels (M, T, W, T, F, S, S)
   - Soft rose-tinted explanatory box below
   ------------------------------------------------------------ */
export function Teaser3PatternsPreview({ isActive }: { isActive?: boolean }) {
  const [ref, inView] = useInView();
  const rawId = useId();
  const cleanId = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const clipId = `teaser3-patterns-clip-${cleanId}`;
  const greenAreaId = `teaser3-green-area-${cleanId}`;
  const animated = Boolean(inView || isActive);

  // Plotted data matching reference:
  // Days: M (24), T (70), W (116), T (162), F (208), S (254), S (296)
  const sleepPoints: [number, number][] = [
    [24, 82],
    [70, 68],
    [116, 76],
    [162, 54],
    [208, 58],
    [254, 34],
    [296, 42],
  ];

  const skinPoints: [number, number][] = [
    [24, 94],
    [70, 80],
    [116, 78],
    [162, 66],
    [208, 64],
    [254, 46],
    [296, 52],
  ];

  const sleepPathD = "M 24,82 L 70,68 L 116,76 L 162,54 L 208,58 L 254,34 L 296,42";
  const skinPathD = "M 24,94 L 70,80 L 116,78 L 162,66 L 208,64 L 254,46 L 296,52";
  const sleepAreaD = "M 24,82 L 70,68 L 116,76 L 162,54 L 208,58 L 254,34 L 296,42 L 296,118 L 24,118 Z";

  return (
    <div
      ref={ref}
      className={`teaser3-preview-card teaser3-glass-card teaser3-preview-patterns ${
        animated ? "is-animated" : ""
      }`}
    >
      <div className="teaser3-preview-header">
        <span className="teaser3-preview-kicker">7-DAY PATTERNS</span>
        <span className="teaser3-preview-badge">Illustrative preview</span>
      </div>

      {/* Two-series Legend */}
      <div className="teaser3-preview-legend">
        <div className="teaser3-legend-item">
          <svg width="28" height="12" viewBox="0 0 28 12" aria-hidden="true">
            <line x1="0" y1="6" x2="28" y2="6" stroke="#2fb155" strokeWidth="2.2" />
            <circle cx="14" cy="6" r="3.8" stroke="#2fb155" strokeWidth="2.2" fill="#ffffff" />
          </svg>
          <span>Sleep consistency</span>
        </div>
        <div className="teaser3-legend-item">
          <svg width="28" height="12" viewBox="0 0 28 12" aria-hidden="true">
            <line x1="0" y1="6" x2="28" y2="6" stroke="#f7557d" strokeWidth="2.2" strokeDasharray="4 3" />
            <circle cx="14" cy="6" r="3.5" fill="#f7557d" />
          </svg>
          <span>Skin comfort</span>
        </div>
      </div>

      {/* SVG Line Chart */}
      <div className="teaser3-chart-wrap">
        <svg
          className="teaser3-chart-svg"
          viewBox="0 0 320 144"
          role="img"
          aria-label="7-day sleep consistency and skin comfort correlation graph"
        >
          <defs>
            <linearGradient id={greenAreaId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34c759" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#34c759" stopOpacity="0.01" />
            </linearGradient>
            <clipPath id={clipId}>
              <rect
                x="0"
                y="0"
                width={animated ? "320" : "0"}
                height="144"
                style={{
                  transition: "width 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.15s",
                }}
              />
            </clipPath>
          </defs>

          {/* Light dashed horizontal grid lines */}
          <line x1="16" x2="304" y1="22" y2="22" className="teaser3-chart-grid" />
          <line x1="16" x2="304" y1="52" y2="52" className="teaser3-chart-grid" />
          <line x1="16" x2="304" y1="82" y2="82" className="teaser3-chart-grid" />
          <line x1="16" x2="304" y1="112" y2="112" className="teaser3-chart-grid" />

          {/* Restrained green area fill under Sleep consistency */}
          <path
            d={sleepAreaD}
            fill={`url(#${greenAreaId})`}
            clipPath={`url(#${clipId})`}
          />

          {/* Sleep curve (solid green #2fb155) */}
          <path
            d={sleepPathD}
            className="teaser3-chart-path-sleep-green"
            clipPath={`url(#${clipId})`}
          />

          {/* Skin curve (dashed pink #f7557d) */}
          <path
            d={skinPathD}
            className="teaser3-chart-path-skin-pink"
            strokeDasharray="4 3"
            clipPath={`url(#${clipId})`}
          />

          {/* Sleep open nodes */}
          {sleepPoints.map(([cx, cy], i) => (
            <circle
              key={`sleep-${i}`}
              cx={cx}
              cy={cy}
              r="4.2"
              className="teaser3-chart-node-sleep-green"
              style={{
                opacity: animated ? 1 : 0,
                transform: animated ? "scale(1)" : "scale(0)",
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
              r="3.8"
              className="teaser3-chart-node-skin-pink"
              style={{
                opacity: animated ? 1 : 0,
                transform: animated ? "scale(1)" : "scale(0)",
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
              y="132"
              textAnchor="middle"
              className="teaser3-chart-axis-label"
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

      {/* Soft rose-tinted explanatory box below */}
      <div className="teaser3-preview-explainer">
        <p>When sleep holds steady, morning skin comfort stays resilient.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   03. PREVIEW 03 — TONIGHT’S MOVE
   Recommendation Component:
   - "TONIGHT’S MOVE" heading + "Personalized" badge
   - Inner recommendation panel (lavender-to-rose translucent gradient):
     * Purple moon icon + "10:20 PM"
     * Bold recommendation: "Shift wind-down 20 mins earlier tonight."
     * Secondary explanation: "Your recovery pattern may benefit from a steadier bedtime."
   - Separate soft rose-tinted supporting note below:
     * "One realistic adjustment to support cellular recovery before bed."
   ------------------------------------------------------------ */
export function Teaser3NextMovePreview({ isActive }: { isActive?: boolean }) {
  const [ref, inView] = useInView();
  const animated = Boolean(inView || isActive);

  return (
    <div
      ref={ref}
      className={`teaser3-preview-card teaser3-glass-card teaser3-preview-move ${
        animated ? "is-animated" : ""
      }`}
    >
      <div className="teaser3-preview-header">
        <span className="teaser3-preview-kicker">TONIGHT’S MOVE</span>
        <span className="teaser3-preview-badge">Personalized</span>
      </div>

      {/* Inner Lavender-to-Rose Translucent Recommendation Box */}
      <div className="teaser3-preview-move-box">
        <div className="teaser3-preview-time-tag">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7e57c2"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="teaser3-time-icon"
            aria-hidden="true"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
          <span className="teaser3-time-text">10:20 PM</span>
        </div>
        <h4 className="teaser3-preview-move-title">
          Shift wind-down 20 mins earlier tonight.
        </h4>
        <p className="teaser3-preview-move-rationale">
          Your recovery pattern may benefit from a steadier bedtime.
        </p>
      </div>

      {/* Separate soft rose-tinted supporting note below */}
      <div className="teaser3-preview-explainer">
        <p>One realistic adjustment to support cellular recovery before bed.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   MAIN SECTION: WHAT YOU GET
   - Desktop: 3 vertically arranged alternating rows
   - Mobile: 1 horizontal carousel with peek and capsule pagination
   ------------------------------------------------------------ */

interface BenefitItem {
  num: string;
  title: string;
  desc: string;
  bgImage: string;
  renderPreview: (isActive?: boolean) => React.ReactNode;
}

const BENEFIT_ITEMS: BenefitItem[] = [
  {
    num: "01",
    title: "Know where you are.",
    desc: "See how your daily signals and skin check-ins are coming together today.",
    bgImage: "/images/teaser3-panel-bg-01.webp",
    renderPreview: (isActive) => <Teaser3SkinBalancePreview isActive={isActive} />,
  },
  {
    num: "02",
    title: "See what changed.",
    desc: "Follow shifts in sleep, stress, nutrition, and your skin patterns over time.",
    bgImage: "/images/teaser3-panel-bg-02.webp",
    renderPreview: (isActive) => <Teaser3PatternsPreview isActive={isActive} />,
  },
  {
    num: "03",
    title: "Know what to try.",
    desc: "Get one useful suggestion based on the patterns 3fig is helping you notice.",
    bgImage: "/images/teaser3-panel-bg-03.webp",
    renderPreview: (isActive) => <Teaser3NextMovePreview isActive={isActive} />,
  },
];

export function Teaser3ValueSection() {
  const [activeMobileIdx, setActiveMobileIdx] = useState(0);
  const mobileTrackRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const isSwipingRef = useRef<boolean>(false);

  // Sync active mobile index on scroll
  const handleMobileScroll = () => {
    const el = mobileTrackRef.current;
    if (!el) return;
    const paddingLeft = parseFloat(window.getComputedStyle(el).paddingLeft || "24");
    const scrollLeft = el.scrollLeft;

    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i] as HTMLElement;
      const target = child.offsetLeft - paddingLeft;
      const diff = Math.abs(target - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    if (closestIdx !== activeMobileIdx) {
      setActiveMobileIdx(closestIdx);
    }
  };

  const scrollToSlide = (idx: number) => {
    const el = mobileTrackRef.current;
    if (!el) return;
    const slideEl = el.children[idx] as HTMLElement | undefined;
    if (slideEl) {
      const paddingLeft = parseFloat(window.getComputedStyle(el).paddingLeft || "24");
      const targetScroll = slideEl.offsetLeft - paddingLeft;
      el.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: "smooth",
      });
      setActiveMobileIdx(idx);
    }
  };

  // Touch swipe gestures for mobile slide interaction
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
      if (deltaX < 0 && activeMobileIdx < BENEFIT_ITEMS.length - 1) {
        scrollToSlide(activeMobileIdx + 1);
      } else if (deltaX > 0 && activeMobileIdx > 0) {
        scrollToSlide(activeMobileIdx - 1);
      }
    }
  };

  return (
    <section
      id="what-you-get"
      className="teaser3-section teaser3-value-section"
      aria-labelledby="value-title"
    >
      <div className="teaser3-section-container">
        {/* ============================================================
            DESKTOP LAYOUT (3 Alternating Rows in Document Flow)
            ============================================================ */}
        <div className="teaser3-value-desktop-flow">
          {/* Row 1: Left (Head + 01 Copy), Right (Panel 01) */}
          <div className="teaser3-value-row teaser3-value-row-1">
            <div className="teaser3-value-col-left teaser3-value-intro-col">
              <div className="teaser3-section-head">
                <p className="teaser3-eyebrow">WHAT YOU GET</p>
                <h2 id="value-title" className="teaser3-section-title">
                  One clear view. <br />
                  <span className="teaser3-rose-accent">One useful next move.</span>
                </h2>
              </div>

              <div className="teaser3-value-copy-block">
                <span className="teaser3-value-num teaser3-rose-accent">{BENEFIT_ITEMS[0].num}</span>
                <h3 className="teaser3-value-title">{BENEFIT_ITEMS[0].title}</h3>
                <p className="teaser3-value-desc">{BENEFIT_ITEMS[0].desc}</p>
              </div>
            </div>

            <div className="teaser3-value-col-right">
              <div className="teaser3-visual-panel">
                <img
                  src={BENEFIT_ITEMS[0].bgImage}
                  alt=""
                  className="teaser3-panel-bg"
                  loading="lazy"
                />
                <div className="teaser3-panel-content">
                  {BENEFIT_ITEMS[0].renderPreview()}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Left (Panel 02), Right (02 Copy) */}
          <div className="teaser3-value-row teaser3-value-row-2">
            <div className="teaser3-value-col-left">
              <div className="teaser3-visual-panel">
                <img
                  src={BENEFIT_ITEMS[1].bgImage}
                  alt=""
                  className="teaser3-panel-bg"
                  loading="lazy"
                />
                <div className="teaser3-panel-content">
                  {BENEFIT_ITEMS[1].renderPreview()}
                </div>
              </div>
            </div>

            <div className="teaser3-value-col-right teaser3-value-copy-col">
              <div className="teaser3-value-copy-block">
                <span className="teaser3-value-num teaser3-rose-accent">{BENEFIT_ITEMS[1].num}</span>
                <h3 className="teaser3-value-title">{BENEFIT_ITEMS[1].title}</h3>
                <p className="teaser3-value-desc">{BENEFIT_ITEMS[1].desc}</p>
              </div>
            </div>
          </div>

          {/* Row 3: Left (03 Copy), Right (Panel 03) */}
          <div className="teaser3-value-row teaser3-value-row-3">
            <div className="teaser3-value-col-left teaser3-value-copy-col">
              <div className="teaser3-value-copy-block">
                <span className="teaser3-value-num teaser3-rose-accent">{BENEFIT_ITEMS[2].num}</span>
                <h3 className="teaser3-value-title">{BENEFIT_ITEMS[2].title}</h3>
                <p className="teaser3-value-desc">{BENEFIT_ITEMS[2].desc}</p>
              </div>
            </div>

            <div className="teaser3-value-col-right">
              <div className="teaser3-visual-panel">
                <img
                  src={BENEFIT_ITEMS[2].bgImage}
                  alt=""
                  className="teaser3-panel-bg"
                  loading="lazy"
                />
                <div className="teaser3-panel-content">
                  {BENEFIT_ITEMS[2].renderPreview()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            MOBILE LAYOUT (1 Horizontal Carousel with Peek & Dots)
            ============================================================ */}
        <div className="teaser3-value-mobile-view">
          {/* Stationary Section Header outside carousel */}
          <div className="teaser3-section-head">
            <p className="teaser3-eyebrow">WHAT YOU GET</p>
            <h2 className="teaser3-section-title">
              One clear view. <br />
              <span className="teaser3-rose-accent">One useful next move.</span>
            </h2>
          </div>

          {/* Horizontal Carousel Track with Peek */}
          <div className="teaser3-value-mobile-carousel-wrap">
            <div
              ref={mobileTrackRef}
              className="teaser3-value-mobile-track"
              onScroll={handleMobileScroll}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              role="region"
              aria-label="What You Get product previews"
              aria-roledescription="carousel"
            >
              {BENEFIT_ITEMS.map((item, idx) => {
                const isActive = activeMobileIdx === idx;
                return (
                  <div
                    key={item.num}
                    className={`teaser3-value-mobile-slide ${
                      isActive ? "is-active" : ""
                    }`}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${idx + 1} of ${BENEFIT_ITEMS.length}: ${item.title}`}
                  >
                    <div className="teaser3-value-mobile-copy">
                      <span className="teaser3-value-num teaser3-rose-accent">{item.num}</span>
                      <h3 className="teaser3-value-title">{item.title}</h3>
                      <p className="teaser3-value-desc">{item.desc}</p>
                    </div>

                    <div className="teaser3-visual-panel">
                      <img
                        src={item.bgImage}
                        alt=""
                        className="teaser3-panel-bg"
                        loading="lazy"
                      />
                      <div className="teaser3-panel-content">
                        {item.renderPreview(isActive)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Pagination: Active Capsule + Inactive Dots */}
            <div
              className="teaser3-value-mobile-dots"
              role="tablist"
              aria-label="Slide navigation"
            >
              {BENEFIT_ITEMS.map((item, idx) => (
                <button
                  key={item.num}
                  type="button"
                  role="tab"
                  className={`teaser3-value-mobile-dot ${
                    activeMobileIdx === idx ? "is-active" : ""
                  }`}
                  aria-label={`Go to slide ${idx + 1}: ${item.title}`}
                  aria-selected={activeMobileIdx === idx}
                  onClick={() => scrollToSlide(idx)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
