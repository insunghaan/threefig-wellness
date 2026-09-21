"use client";

import React, { useId } from "react";

/** An editorial flow diagram: three daily signals meet, continue as one.
 *  - Desktop: Horizontal convergence from left to right.
 *  - Mobile: Rotated 90° clockwise so inputs are situated at the top,
 *    curving downward to converge into a single direction at the bottom,
 *    with upright labels.
 */
export function PatternPreview() {
  const uid = useId();

  return (
    <figure className="skin-pattern-concept">
      {/* -------------------------------------------------------------
          DESKTOP VIEW: Horizontal flow (Left -> Right)
          ------------------------------------------------------------- */}
      <div className="skin-pattern-desktop">
        <svg
          className="skin-pattern-drawing"
          viewBox="0 0 560 480"
          role="img"
          aria-labelledby={`pattern-title-desk-${uid} pattern-desc-desk-${uid}`}
        >
          <title id={`pattern-title-desk-${uid}`}>Three signals, one clearer direction</title>
          <desc id={`pattern-desc-desk-${uid}`}>
            Sleep, food and stress follow separate paths that merge into one straight line that ends at a bright white circle.
          </desc>
          <defs>
            <linearGradient id={`pattern-sleep-${uid}`} x1="120" y1="110" x2="350" y2="240" gradientUnits="userSpaceOnUse">
              <stop stopColor="#baacd0" stopOpacity=".35" />
              <stop offset="1" stopColor="#9b83b5" />
            </linearGradient>
            <linearGradient id={`pattern-food-${uid}`} x1="120" y1="240" x2="350" y2="240" gradientUnits="userSpaceOnUse">
              <stop stopColor="#d9b3be" stopOpacity=".4" />
              <stop offset="1" stopColor="#b997bf" />
            </linearGradient>
            <linearGradient id={`pattern-stress-${uid}`} x1="120" y1="370" x2="350" y2="240" gradientUnits="userSpaceOnUse">
              <stop stopColor="#adb9d5" stopOpacity=".35" />
              <stop offset="1" stopColor="#9b83b5" />
            </linearGradient>
            <linearGradient id={`pattern-direction-${uid}`} x1="350" y1="240" x2="510" y2="240" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9b83b5" />
              <stop offset="1" stopColor="#695076" />
            </linearGradient>
            <radialGradient id={`pattern-light-${uid}`}>
              <stop stopColor="#fefaff" />
              <stop offset=".3" stopColor="#dfcfe9" stopOpacity=".5" />
              <stop offset="1" stopColor="#dbcce7" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`pattern-light-edge-${uid}`} x1="460" y1="0" x2="560" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="white" />
              <stop offset="1" stopColor="black" />
            </linearGradient>
            <mask id={`pattern-light-mask-${uid}`} x="0" y="0" width="560" height="480" maskUnits="userSpaceOnUse">
              <rect width="560" height="480" fill={`url(#pattern-light-edge-${uid})`} />
            </mask>
            <filter id={`pattern-soft-light-${uid}`} x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>
          <ellipse cx="510" cy="240" rx="180" ry="170" fill={`url(#pattern-light-${uid})`} mask={`url(#pattern-light-mask-${uid})`} />
          <g fill="none" strokeWidth="1.7" strokeLinecap="round">
            <path d="M120 110 Q230 240 350 240" stroke={`url(#pattern-sleep-${uid})`} />
            <path d="M120 240 H350" stroke={`url(#pattern-food-${uid})`} />
            <path d="M120 370 Q230 240 350 240" stroke={`url(#pattern-stress-${uid})`} />
            <path d="M350 240 H510" stroke={`url(#pattern-direction-${uid})`} />
          </g>
          <g fill="#f8f7f8" strokeWidth="1.5">
            <circle cx="120" cy="110" r="6" stroke="#b5a3c9" />
            <circle cx="120" cy="240" r="6" stroke="#c49eae" />
            <circle cx="120" cy="370" r="6" stroke="#a8b2ce" />
          </g>
          <circle cx="510" cy="240" r="19" fill="#fefcff" filter={`url(#pattern-soft-light-${uid})`} />
          <circle cx="510" cy="240" r="8" fill="#fff" stroke="#b49bc5" strokeWidth="1.5" />
        </svg>
        <span className="skin-pattern-label skin-pattern-label-sleep">Sleep</span>
        <span className="skin-pattern-label skin-pattern-label-food">Food</span>
        <span className="skin-pattern-label skin-pattern-label-stress">Stress</span>
        <figcaption>Three signals.<br /><em>A clearer direction.</em></figcaption>
      </div>

      {/* -------------------------------------------------------------
          MOBILE VIEW: 90° Clockwise Rotated (Top -> Bottom Convergence)
          Keywords at the top in normal horizontal reading direction
          ------------------------------------------------------------- */}
      <div className="skin-pattern-mobile">
        {/* Upright Keyword Labels situated horizontally along the top */}
        <div className="skin-pattern-mobile-labels" aria-hidden="true">
          <span className="skin-pattern-mob-label" style={{ left: '16.6%' }}>Sleep</span>
          <span className="skin-pattern-mob-label" style={{ left: '50%' }}>Food</span>
          <span className="skin-pattern-mob-label" style={{ left: '83.3%' }}>Stress</span>
        </div>

        <svg
          className="skin-pattern-drawing-mobile"
          viewBox="0 0 480 440"
          role="img"
          aria-labelledby={`pattern-title-mob-${uid}`}
        >
          <title id={`pattern-title-mob-${uid}`}>Three signals converging downward into one clearer direction</title>
          <defs>
            <linearGradient id={`pattern-mob-sleep-${uid}`} x1="80" y1="50" x2="240" y2="220" gradientUnits="userSpaceOnUse">
              <stop stopColor="#baacd0" stopOpacity=".35" />
              <stop offset="1" stopColor="#9b83b5" />
            </linearGradient>
            <linearGradient id={`pattern-mob-food-${uid}`} x1="240" y1="50" x2="240" y2="220" gradientUnits="userSpaceOnUse">
              <stop stopColor="#d9b3be" stopOpacity=".4" />
              <stop offset="1" stopColor="#b997bf" />
            </linearGradient>
            <linearGradient id={`pattern-mob-stress-${uid}`} x1="400" y1="50" x2="240" y2="220" gradientUnits="userSpaceOnUse">
              <stop stopColor="#adb9d5" stopOpacity=".35" />
              <stop offset="1" stopColor="#9b83b5" />
            </linearGradient>
            <linearGradient id={`pattern-mob-direction-${uid}`} x1="240" y1="220" x2="240" y2="350" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9b83b5" />
              <stop offset="1" stopColor="#695076" />
            </linearGradient>
            <radialGradient id={`pattern-mob-light-${uid}`} cx="240" cy="350" r="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fefaff" stopOpacity="0.95" />
              <stop offset=".35" stopColor="#dfcfe9" stopOpacity=".5" />
              <stop offset="1" stopColor="#dbcce7" stopOpacity="0" />
            </radialGradient>
            <filter id={`pattern-mob-soft-light-${uid}`} x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {/* Ambient light glow behind the bottom focal point */}
          <ellipse cx="240" cy="350" rx="160" ry="110" fill={`url(#pattern-mob-light-${uid})`} />

          {/* Converging 3 downward lines (inverted arch convergence) */}
          <g fill="none" strokeWidth="2.2" strokeLinecap="round">
            <path d="M 80 50 Q 240 120 240 220" stroke={`url(#pattern-mob-sleep-${uid})`} />
            <path d="M 240 50 L 240 220" stroke={`url(#pattern-mob-food-${uid})`} />
            <path d="M 400 50 Q 240 120 240 220" stroke={`url(#pattern-mob-stress-${uid})`} />
            <path d="M 240 220 L 240 350" stroke={`url(#pattern-mob-direction-${uid})`} />
          </g>

          {/* Origin circles at top */}
          <g fill="#f8f7f8" strokeWidth="1.8">
            <circle cx="80" cy="50" r="6.5" stroke="#b5a3c9" />
            <circle cx="240" cy="50" r="6.5" stroke="#c49eae" />
            <circle cx="400" cy="50" r="6.5" stroke="#a8b2ce" />
          </g>

          {/* Converged Glowing focal point at bottom */}
          <circle cx="240" cy="350" r="22" fill="#fefcff" filter={`url(#pattern-mob-soft-light-${uid})`} />
          <circle cx="240" cy="350" r="8.5" fill="#fff" stroke="#b49bc5" strokeWidth="2" />
        </svg>

        <figcaption className="skin-pattern-mobile-caption">
          Three signals.<br /><em>A clearer direction.</em>
        </figcaption>
      </div>
    </figure>
  );
}
