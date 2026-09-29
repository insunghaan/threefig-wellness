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
   01. PREVIEW 01 — SKIN BALANCE SCORE
   Circular Score Component:
   - "SKIN BALANCE SCORE" kicker + Sample data indicator
   - Refined circular gauge with 86 score, "Good", and clear sub-metrics
   - 3 sub-signal cards: Sleep (78 Good), Nutrition (82 Good), Stress (70 Fair)
   ------------------------------------------------------------ */
export function Teaser6SkinBalancePreview({ isActive }: { isActive?: boolean }) {
  const [ref, inView] = useInView();
  const rawId = useId();
  const gradId = `teaser6-gauge-grad-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const animated = Boolean(inView || isActive);
  const [displayScore, setDisplayScore] = useState(0);

  const radius = 74;
  const circumference = 2 * Math.PI * radius; // ~464.955
  const targetPercent = 0.86;
  const targetOffset = circumference * (1 - targetPercent);

  useEffect(() => {
    if (!animated) {
      setDisplayScore(0);
      return;
    }
    let startTimestamp: number | null = null;
    const duration = 1100;
    const endVal = 86;

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
      className={`teaser6-preview-card teaser6-glass-card teaser6-preview-balance ${
        animated ? "is-animated" : ""
      }`}
    >
      <div className="teaser6-preview-header">
        <span className="teaser6-preview-kicker">SKIN BALANCE SCORE</span>
        <span className="teaser6-preview-badge">Sample Data</span>
      </div>

      <div className="teaser6-gauge-wrap">
        <svg
          className="teaser6-gauge-svg"
          viewBox="0 0 180 180"
          role="meter"
          aria-label="Skin Balance score 86 out of 100"
          aria-valuenow={86}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff7a59" />
              <stop offset="50%" stopColor="#ff5c38" />
              <stop offset="100%" stopColor="#e04b28" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            className="teaser6-gauge-track"
            stroke="rgba(255, 92, 56, 0.12)"
            strokeWidth="10"
            fill="none"
          />

          {/* Animated progress arc */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            className="teaser6-gauge-fill"
            stroke={`url(#${gradId})`}
            strokeWidth="10"
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

        {/* Center content */}
        <div className="teaser6-gauge-center t6-gauge-app-style">
          <span className="t6-gauge-app-score">{displayScore}</span>
          <span className="t6-gauge-app-status">Good Balance</span>
          <span className="t6-gauge-app-sub">Optimal recovery</span>
        </div>
      </div>

      {/* 3 Contributing signal cards */}
      <div className="t6-app-subcards-row">
        <div className="t6-app-subcard">
          <span className="t6-app-subcard-title">Sleep Quality</span>
          <strong className="t6-app-subcard-score">78</strong>
          <span className="t6-app-subcard-status">8.2 hrs</span>
        </div>
        <div className="t6-app-subcard">
          <span className="t6-app-subcard-title">Stress Recovery</span>
          <strong className="t6-app-subcard-score">82</strong>
          <span className="t6-app-subcard-status">Optimal</span>
        </div>
        <div className="t6-app-subcard">
          <span className="t6-app-subcard-title">Skin Check-in</span>
          <strong className="t6-app-subcard-score">Calm</strong>
          <span className="t6-app-subcard-status">Hydrated</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   02. PREVIEW 02 — PATTERNS IN SKIN & HABITS
   Restrained 1.5–2px line chart:
   - Sleep consistency & Skin comfort trends over 7 days
   - Readable units, subtle grid lines, discrete sample data tag
   ------------------------------------------------------------ */
export function Teaser6PatternsPreview({ isActive }: { isActive?: boolean }) {
  const [ref, inView] = useInView();
  const rawId = useId();
  const cleanId = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const clipId = `teaser6-patterns-clip-${cleanId}`;
  const coralAreaId = `teaser6-coral-area-${cleanId}`;
  const animated = Boolean(inView || isActive);

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
      className={`teaser6-preview-card teaser6-glass-card teaser6-preview-patterns ${
        animated ? "is-animated" : ""
      }`}
    >
      <div className="teaser6-preview-header">
        <span className="teaser6-preview-kicker">7-DAY HABIT PATTERNS</span>
        <span className="teaser6-preview-badge">Sample Data</span>
      </div>

      <div className="teaser6-preview-legend">
        <div className="teaser6-legend-item">
          <svg width="24" height="12" viewBox="0 0 24 12" aria-hidden="true">
            <line x1="0" y1="6" x2="24" y2="6" stroke="#ff5c38" strokeWidth="2" />
            <circle cx="12" cy="6" r="3.2" stroke="#ff5c38" strokeWidth="2" fill="#ffffff" />
          </svg>
          <span>Sleep consistency</span>
        </div>
        <div className="teaser6-legend-item">
          <svg width="24" height="12" viewBox="0 0 24 12" aria-hidden="true">
            <line x1="0" y1="6" x2="24" y2="6" stroke="#10b981" strokeWidth="1.8" strokeDasharray="3 3" />
            <circle cx="12" cy="6" r="3" fill="#10b981" />
          </svg>
          <span>Skin barrier comfort</span>
        </div>
      </div>

      <div className="teaser6-chart-wrap">
        <svg
          className="teaser6-chart-svg"
          viewBox="0 0 320 144"
          role="img"
          aria-label="7-day sleep consistency and skin comfort correlation graph"
        >
          <defs>
            <linearGradient id={coralAreaId} x1="0%" y1="0%" x2="0%" y2="1">
              <stop offset="0%" stopColor="#ff5c38" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#ff5c38" stopOpacity="0.01" />
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

          {/* Neutral gridlines */}
          <line x1="16" x2="304" y1="22" y2="22" stroke="rgba(17, 19, 23, 0.08)" strokeDasharray="2 4" strokeWidth="1" />
          <line x1="16" x2="304" y1="52" y2="52" stroke="rgba(17, 19, 23, 0.08)" strokeDasharray="2 4" strokeWidth="1" />
          <line x1="16" x2="304" y1="82" y2="82" stroke="rgba(17, 19, 23, 0.08)" strokeDasharray="2 4" strokeWidth="1" />
          <line x1="16" x2="304" y1="112" y2="112" stroke="rgba(17, 19, 23, 0.08)" strokeDasharray="2 4" strokeWidth="1" />

          {/* Area fill */}
          <path
            d={sleepAreaD}
            fill={`url(#${coralAreaId})`}
            clipPath={`url(#${clipId})`}
          />

          {/* Sleep curve (coral) */}
          <path
            d={sleepPathD}
            stroke="#ff5c38"
            strokeWidth="2"
            fill="none"
            clipPath={`url(#${clipId})`}
          />

          {/* Skin curve (emerald dashed) */}
          <path
            d={skinPathD}
            stroke="#10b981"
            strokeWidth="1.8"
            strokeDasharray="3 3"
            fill="none"
            clipPath={`url(#${clipId})`}
          />

          {/* Data nodes */}
          {sleepPoints.map(([cx, cy], i) => (
            <circle
              key={`sleep-${i}`}
              cx={cx}
              cy={cy}
              r="3.5"
              fill="#ffffff"
              stroke="#ff5c38"
              strokeWidth="2"
              style={{
                opacity: animated ? 1 : 0,
                transform: animated ? "scale(1)" : "scale(0)",
                transformOrigin: `${cx}px ${cy}px`,
                transition: `all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.3 + i * 0.08}s`,
              }}
            />
          ))}

          {skinPoints.map(([cx, cy], i) => (
            <circle
              key={`skin-${i}`}
              cx={cx}
              cy={cy}
              r="3"
              fill="#10b981"
              style={{
                opacity: animated ? 1 : 0,
                transform: animated ? "scale(1)" : "scale(0)",
                transformOrigin: `${cx}px ${cy}px`,
                transition: `all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.4 + i * 0.08}s`,
              }}
            />
          ))}

          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
            <text
              key={i}
              x={24 + i * 45.3}
              y="132"
              textAnchor="middle"
              className="teaser6-chart-axis-label"
              style={{
                fontSize: "11px",
                fill: "#5b606d",
                opacity: animated ? 1 : 0,
                transition: "opacity 0.4s ease 0.2s",
              }}
            >
              {d}
            </text>
          ))}
        </svg>
      </div>

      <div className="teaser6-preview-explainer">
        <p>Consistent sleep recovery correlates with steady skin barrier comfort over 7 days.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   03. PREVIEW 03 — ONE DAILY ACTION
   Specific daily action for skin wellness:
   - When to try it (Timing)
   - One specific action
   - Clear rationale connecting to today's score
   ------------------------------------------------------------ */
export function Teaser6NextMovePreview({ isActive }: { isActive?: boolean }) {
  const [ref, inView] = useInView();
  const animated = Boolean(inView || isActive);

  return (
    <div
      ref={ref}
      className={`teaser6-preview-card teaser6-glass-card teaser6-preview-move ${
        animated ? "is-animated" : ""
      }`}
    >
      <div className="teaser6-preview-header">
        <span className="teaser6-preview-kicker">DAILY ACTION</span>
        <span className="teaser6-preview-badge">Personalized</span>
      </div>

      <div className="teaser6-preview-move-box">
        <div className="teaser6-preview-time-tag">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="teaser6-time-icon"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="teaser6-time-text">Tonight at 8:30 PM</span>
        </div>
        <h4 className="teaser6-preview-move-title">
          Focus on barrier recovery hydration.
        </h4>
        <p className="teaser6-preview-move-rationale">
          Your daytime HRV and temperature trends indicate mild physiological fatigue. Prioritizing gentle barrier hydration helps offset overnight moisture loss.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   MAIN SECTION: WHAT YOU GET
   - Section heading: "Understand your skin. Know what to do next."
   - Feature 01: "See your Skin Balance Score."
   - Feature 02: "Find patterns in your skin and habits."
   - Feature 03: "Get one daily action for skin wellness."
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
    title: "See your Skin Balance Score.",
    desc: "A daily composite of physiological recovery, sleep quality, and your skin check-in. Know where your skin stands before choosing your routine.",
    bgImage: "/images/teaser3-panel-bg-01.webp",
    renderPreview: (isActive) => <Teaser6SkinBalancePreview isActive={isActive} />,
  },
  {
    num: "02",
    title: "Find patterns in your skin and habits.",
    desc: "Compare 7-day sleep recovery and daytime strain against your recorded skin sensations. Spot relationships without guesswork.",
    bgImage: "/images/teaser3-panel-bg-02.webp",
    renderPreview: (isActive) => <Teaser6PatternsPreview isActive={isActive} />,
  },
  {
    num: "03",
    title: "Get one daily action for skin wellness.",
    desc: "Receive one clear, achievable recommendation based on today’s signals—such as shifting sleep 30 minutes earlier or opting for barrier-support hydration.",
    bgImage: "/images/teaser3-panel-bg-03.webp",
    renderPreview: (isActive) => <Teaser6NextMovePreview isActive={isActive} />,
  },
];

export function Teaser6ValueSection() {
  const [activeMobileIdx, setActiveMobileIdx] = useState(0);
  const mobileTrackRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const isSwipingRef = useRef<boolean>(false);

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
      className="teaser6-section teaser6-value-section"
      aria-labelledby="value-title"
    >
      <div className="teaser6-section-container">
        {/* Desktop 3 Alternating Rows */}
        <div className="teaser6-value-desktop-flow">
          {/* Row 1 */}
          <div className="teaser6-value-row teaser6-value-row-1">
            <div className="teaser6-value-col-left teaser6-value-intro-col">
              <div className="teaser6-section-head">
                <p className="teaser6-eyebrow">WHAT YOU GET</p>
                <h2 id="value-title" className="teaser6-section-title">
                  Understand your skin. <br />
                  <span className="teaser6-rose-accent">Know what to do next.</span>
                </h2>
              </div>

              <div className="teaser6-value-copy-block">
                <span className="teaser6-value-num teaser6-rose-accent">{BENEFIT_ITEMS[0].num}</span>
                <h3 className="teaser6-value-title">{BENEFIT_ITEMS[0].title}</h3>
                <p className="teaser6-value-desc">{BENEFIT_ITEMS[0].desc}</p>
              </div>
            </div>

            <div className="teaser6-value-col-right">
              <div className="teaser6-visual-panel">
                <img
                  src={BENEFIT_ITEMS[0].bgImage}
                  alt=""
                  className="teaser6-panel-bg"
                  loading="lazy"
                />
                <div className="teaser6-panel-content">
                  {BENEFIT_ITEMS[0].renderPreview()}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="teaser6-value-row teaser6-value-row-2">
            <div className="teaser6-value-col-left">
              <div className="teaser6-visual-panel">
                <img
                  src={BENEFIT_ITEMS[1].bgImage}
                  alt=""
                  className="teaser6-panel-bg"
                  loading="lazy"
                />
                <div className="teaser6-panel-content">
                  {BENEFIT_ITEMS[1].renderPreview()}
                </div>
              </div>
            </div>

            <div className="teaser6-value-col-right">
              <div className="teaser6-value-copy-block">
                <span className="teaser6-value-num teaser6-rose-accent">{BENEFIT_ITEMS[1].num}</span>
                <h3 className="teaser6-value-title">{BENEFIT_ITEMS[1].title}</h3>
                <p className="teaser6-value-desc">{BENEFIT_ITEMS[1].desc}</p>
              </div>
            </div>
          </div>

          {/* Row 3 */}
          <div className="teaser6-value-row teaser6-value-row-3">
            <div className="teaser6-value-col-left">
              <div className="teaser6-value-copy-block">
                <span className="teaser6-value-num teaser6-rose-accent">{BENEFIT_ITEMS[2].num}</span>
                <h3 className="teaser6-value-title">{BENEFIT_ITEMS[2].title}</h3>
                <p className="teaser6-value-desc">{BENEFIT_ITEMS[2].desc}</p>
              </div>
            </div>

            <div className="teaser6-value-col-right">
              <div className="teaser6-visual-panel">
                <img
                  src={BENEFIT_ITEMS[2].bgImage}
                  alt=""
                  className="teaser6-panel-bg"
                  loading="lazy"
                />
                <div className="teaser6-panel-content">
                  {BENEFIT_ITEMS[2].renderPreview()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Carousel */}
        <div className="teaser6-value-mobile-carousel">
          <div className="teaser6-mobile-carousel-header">
            <p className="teaser6-eyebrow">WHAT YOU GET</p>
            <h2 className="teaser6-section-title">
              Understand your skin. <br />
              <span className="teaser6-rose-accent">Know what to do next.</span>
            </h2>
          </div>

          <div
            ref={mobileTrackRef}
            className="teaser6-carousel-track"
            onScroll={handleMobileScroll}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {BENEFIT_ITEMS.map((item, idx) => (
              <div
                key={item.num}
                className={`teaser6-carousel-card ${activeMobileIdx === idx ? "is-active" : ""}`}
                onClick={() => scrollToSlide(idx)}
              >
                <div className="teaser6-carousel-visual-panel">
                  <img
                    src={item.bgImage}
                    alt=""
                    className="teaser6-panel-bg"
                    loading="lazy"
                  />
                  <div className="teaser6-panel-content">
                    {item.renderPreview(activeMobileIdx === idx)}
                  </div>
                </div>

                <div className="teaser6-carousel-card-copy">
                  <span className="teaser6-value-num teaser6-rose-accent">{item.num}</span>
                  <h3 className="teaser6-value-title">{item.title}</h3>
                  <p className="teaser6-value-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Capsule Pagination */}
          <div className="teaser6-carousel-pagination" role="tablist">
            {BENEFIT_ITEMS.map((item, idx) => (
              <button
                key={item.num}
                type="button"
                role="tab"
                aria-selected={activeMobileIdx === idx}
                className={`teaser6-pagination-capsule ${activeMobileIdx === idx ? "is-active" : ""}`}
                onClick={() => scrollToSlide(idx)}
                aria-label={`Go to slide ${item.num}`}
              >
                <span className="teaser6-capsule-num">{item.num}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
