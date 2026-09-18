"use client";
import { useId } from "react";
import { actual, suggested } from "@/lib/threefig/mock-data";
export function Brand({
  light = false,
  className = "",
}: {
  light?: boolean;
  className?: string;
}) {
  const src = light ? "/images/threefig-logo-white.png" : "/images/threefig-logo.png";
  const webpSrc = light ? "/images/threefig-logo-white.webp" : "/images/threefig-logo.webp";

  return (
    <span className={`brand ${light ? "light" : ""} ${className}`} aria-label="3fig">
      <picture>
        <source srcSet={webpSrc} type="image/webp" />
        <img
          src={src}
          alt="3fig"
          className="brand-logo-img"
          width="70"
          height="36"
        />
      </picture>
    </span>
  );
}
export function OrganicForm({
  progress = 0,
  className = "",
}: {
  progress?: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const level = Math.max(0, Math.min(3, progress));
  // Equal radii and uniform SVG scaling keep the silhouette perfectly circular.
  return (
    <div className={`organic-wrap progress-${level} ${className}`} aria-hidden="true">
      <div className="organic-halo" />
      <svg className="organic-sculpture" viewBox="0 0 320 240" preserveAspectRatio="xMidYMid meet" fill="none">
        <defs>
          <clipPath id={`${id}-lens`}><circle cx="160" cy="120" r="90" /></clipPath>
          <linearGradient id={`${id}-glass`} x1="102" y1="53" x2="210" y2="195" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" stopOpacity=".88" />
            <stop offset=".3" stopColor="#dddce7" stopOpacity=".48" />
            <stop offset=".62" stopColor="#c3bdce" stopOpacity=".25" />
            <stop offset=".84" stopColor="#8b819d" stopOpacity=".55" />
            <stop offset="1" stopColor="#edeaf2" stopOpacity=".9" />
          </linearGradient>
          <radialGradient id={`${id}-depth`} cx=".68" cy=".8" r=".78">
            <stop stopColor="#665873" stopOpacity=".34" />
            <stop offset=".62" stopColor="#b9acc9" stopOpacity=".1" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-rim`} x1="100" y1="56" x2="195" y2="185" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" /><stop offset=".34" stopColor="#eeeaf4" stopOpacity=".18" />
            <stop offset=".76" stopColor="#81728f" stopOpacity=".6" /><stop offset="1" stopColor="#ffffff" stopOpacity=".92" />
          </linearGradient>
          <linearGradient id={`${id}-light`} x1="71" y1="154" x2="250" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" stopOpacity="0" /><stop offset=".3" stopColor="#f9f7ff" stopOpacity=".85" />
            <stop offset=".58" stopColor="#ffffff" /><stop offset="1" stopColor="#d0c5df" stopOpacity="0" />
          </linearGradient>
          <filter id={`${id}-soft`} x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="9" /></filter>
        </defs>
        <ellipse cx="160" cy="218" rx="62" ry="5" fill="#7f708d" opacity=".12" filter={`url(#${id}-soft)`} />
        <circle cx="160" cy="120" r="90" fill={`url(#${id}-glass)`} />
        <g clipPath={`url(#${id}-lens)`}>
          <circle cx="160" cy="120" r="90" fill={`url(#${id}-depth)`} />
          <path d="M72 138 C112 186 200 190 248 136 C232 238 89 235 72 138Z" fill="#665574" opacity=".12" />
          <path d="M84 105 A80 80 0 0 1 213 60" stroke="#ffffff" strokeOpacity=".8" strokeWidth="3" filter={`url(#${id}-soft)`} />
          <g className="lens-refraction lens-refraction-back">
            <path d="M64 158 C103 151 187 117 254 78" stroke={`url(#${id}-light)`} strokeWidth="9" filter={`url(#${id}-soft)`} />
          </g>
          <g className="lens-refraction lens-refraction-front">
            <path d="M64 158 C116 144 193 111 254 78" stroke={`url(#${id}-light)`} strokeWidth="2" />
            <path d="M75 166 C124 154 199 122 249 91" stroke="#f7f4fc" strokeOpacity=".35" strokeWidth=".8" />
          </g>
          <path d="M82 150 A84 84 0 0 0 242 138" stroke={`url(#${id}-rim)`} strokeWidth="1.2" />
        </g>
        <circle cx="160" cy="120" r="90" stroke={`url(#${id}-rim)`} strokeWidth="1.1" />
        <path className="lens-final-edge" d="M82 76 A89 89 0 0 1 202 41" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function Ring({ finish = "silver" }: { finish?: string }) {
  return (
    <div className={`ring-art ring-photographic ${finish}`} role="img" aria-label={`${finish === "gold" ? "Warm gold" : "Polished silver"} slim ring`}>
      <div className="ring-photo-shadow" />
      <img src="/images/ring-onboarding-transparent-v2.png" alt="" width="1254" height="1254" className="ring-photo" />
    </div>
  );
}

function point(hour: number, r: number) {
  const a = (((hour / 24) * 360 - 90) * Math.PI) / 180;
  // Stable precision keeps Worker and WebKit SVG attributes identical at hydration.
  return {
    x: Number((180 + r * Math.cos(a)).toFixed(3)),
    y: Number((180 + r * Math.sin(a)).toFixed(3)),
  };
}
function arc(start: number, end: number, r: number) {
  const a = point(start, r),
    b = point(end, r);
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${end - start > 12 ? 1 : 0} 1 ${b.x} ${b.y}`;
}
export function RhythmDial({
  mode = "compare",
  compact = false,
}: {
  mode?: string;
  compact?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <div className={`rhythm-dial ${compact ? "compact" : ""}`}>
      <svg
        viewBox="0 0 360 360"
        key={mode}
        role="img"
        aria-label={
          mode === "actual"
            ? "Your actual day over 24 hours. Short rounded lines mark recorded moments, not durations."
            : mode === "suggested"
              ? "Your suggested 24-hour rhythm. Colored bands show time windows."
              : "24-hour rhythm. Outer bands show suggested times; inner rounded lines mark your actual day."
        }
      >
        <defs>
          <radialGradient id={id}>
            <stop stopColor="#f5e6dc" stopOpacity=".65" />
            <stop offset="1" stopColor="#ece8f2" stopOpacity=".2" />
          </radialGradient>
        </defs>
        <circle cx="180" cy="180" r="112" fill={`url(#${id})`} />
        <circle
          cx="180"
          cy="180"
          r="138"
          fill="none"
          stroke="#ecebe8"
          strokeWidth="1"
        />
        {Array.from({ length: 48 }, (_, i) => {
          const a = point(i / 2, 155),
            b = point(i / 2, i % 6 === 0 ? 161 : 158);
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={i % 6 === 0 ? "#95928f" : "#d4d0cc"}
            />
          );
        })}
        {mode !== "actual" &&
          suggested.map((s) => (
            <path
              key={s.label}
              d={arc(s.start, s.end, 138)}
              className={`time-arc rhythm-gauge ${s.tone}`}
              pathLength="1"
              fill="none"
              strokeWidth="19"
              strokeLinecap="round"
            />
          ))}
        {mode !== "suggested" && (
          <>
            <circle
              cx="180"
              cy="180"
              r="115"
              fill="none"
              stroke="#d8d0df"
              strokeOpacity=".35"
            />
            {actual.map((a) => (
              <path key={a.label} d={arc(a.hour - .38, a.hour + .38, 115)}
                className="actual-time-mark rhythm-gauge" pathLength="1" fill="none" stroke="#716479" strokeWidth="6" strokeLinecap="round">
                <title>{a.label}: {a.time}</title>
              </path>
            ))}
          </>
        )}
        <text x="180" y="11" textAnchor="middle" className="dial-time">
          12 AM
        </text>
        <text x="350" y="184" textAnchor="middle" className="dial-time">
          6
        </text>
        <text x="180" y="352" textAnchor="middle" className="dial-time">
          12 PM
        </text>
        <text x="10" y="184" textAnchor="middle" className="dial-time">
          6
        </text>
        <text x="180" y="167" textAnchor="middle" className="dial-caption">
          {mode === "actual" ? "YOUR DAY" : "YOUR TIME TO"}
        </text>
        <text x="180" y="199" textAnchor="middle" className="dial-title">
          {mode === "actual" ? "movement" : "move"}
        </text>
        <text x="180" y="225" textAnchor="middle" className="dial-detail">
          {mode === "actual" ? "5:20 PM" : "Late afternoon"}
        </text>
      </svg>
    </div>
  );
}
