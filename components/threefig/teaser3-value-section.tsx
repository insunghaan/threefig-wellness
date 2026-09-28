"use client";

import React, { useRef, useState, useEffect, useId } from "react";
import { Moon, ArrowLeft, ArrowRight } from "lucide-react";

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
export function Teaser3SkinBalancePreview({ isActive }: { isActive?: boolean }) {
  const [ref, inView] = useInView();
  const animated = Boolean(inView || isActive);
  const [displayScore, setDisplayScore] = useState(0);

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
      className={`teaser3-preview-card teaser3-preview-balance ${
        animated ? "is-animated" : ""
      }`}
    >
      <div className="teaser3-preview-header">
        <span className="teaser3-preview-kicker">SKIN BALANCE</span>
        <span className="teaser3-preview-badge">Illustrative preview</span>
      </div>

      <div className="teaser3-preview-score-row">
        <div className="teaser3-preview-score-group">
          <span className="teaser3-preview-score-number">{displayScore}</span>
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
          style={{ width: animated ? "82%" : "0%" }}
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
export function Teaser3PatternsPreview({ isActive }: { isActive?: boolean }) {
  const [ref, inView] = useInView();
  const rawClipId = useId();
  const clipId = `teaser3-patterns-clip-${rawClipId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
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

  return (
    <div
      ref={ref}
      className={`teaser3-preview-card teaser3-preview-patterns ${
        animated ? "is-animated" : ""
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
                width={animated ? "320" : "0"}
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
              r="3.5"
              className="teaser3-chart-node-skin"
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
              y="118"
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
export function Teaser3NextMovePreview({ isActive }: { isActive?: boolean }) {
  const [ref, inView] = useInView();
  const animated = Boolean(inView || isActive);

  return (
    <div
      ref={ref}
      className={`teaser3-preview-card teaser3-preview-move ${
        animated ? "is-animated" : ""
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
   - Desktop: 3 vertically arranged alternating rows (Row 1: Head+01 / Panel 1, Row 2: Panel 2 / 02, Row 3: 03 / Panel 3)
   - Mobile: 1 horizontal carousel with 24-40px peek and capsule pagination
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
    desc: "See a simple view of how your supported signals and skin check-ins are lining up.",
    bgImage: "/images/teaser3-panel-bg-01.webp",
    renderPreview: (isActive) => <Teaser3SkinBalancePreview isActive={isActive} />,
  },
  {
    num: "02",
    title: "See what changed.",
    desc: "Spot small shifts over time and see what may be moving together.",
    bgImage: "/images/teaser3-panel-bg-02.webp",
    renderPreview: (isActive) => <Teaser3PatternsPreview isActive={isActive} />,
  },
  {
    num: "03",
    title: "Know what to try.",
    desc: "Get one useful suggestion based on the patterns 3FIG is helping you notice.",
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

    // Detect horizontal swipe if deltaX is dominant and >= 35px
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 35) {
      if (deltaX < 0 && activeMobileIdx < BENEFIT_ITEMS.length - 1) {
        // Swipe left -> Next slide
        scrollToSlide(activeMobileIdx + 1);
      } else if (deltaX > 0 && activeMobileIdx > 0) {
        // Swipe right -> Prev slide
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
                  <span className="teaser3-title-accent">One useful next move.</span>
                </h2>
              </div>

              <div className="teaser3-value-copy-block">
                <span className="teaser3-value-num">{BENEFIT_ITEMS[0].num}</span>
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
                <span className="teaser3-value-num">{BENEFIT_ITEMS[1].num}</span>
                <h3 className="teaser3-value-title">{BENEFIT_ITEMS[1].title}</h3>
                <p className="teaser3-value-desc">{BENEFIT_ITEMS[1].desc}</p>
              </div>
            </div>
          </div>

          {/* Row 3: Left (03 Copy), Right (Panel 03) */}
          <div className="teaser3-value-row teaser3-value-row-3">
            <div className="teaser3-value-col-left teaser3-value-copy-col">
              <div className="teaser3-value-copy-block">
                <span className="teaser3-value-num">{BENEFIT_ITEMS[2].num}</span>
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
              <span className="teaser3-title-accent">One useful next move.</span>
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
                      <span className="teaser3-value-num">{item.num}</span>
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
