'use client';

import React from 'react';
import { Moon, Activity, Utensils } from 'lucide-react';

/**
 * The 3FIG Difference: Static, Immediately Visible Triad
 * - Scroll interaction completely removed as requested.
 * - Central Titanium Ring and all 3 Keywords (01 Sleep, 02 Stress, 03 Nutrition)
 *   are rendered immediately and fully visible on both web and mobile.
 * - Perfectly balanced symmetrical radial layout on desktop.
 * - Generous vertical flow with 30px icons on mobile.
 */
export function SkinDifferenceSection() {
  return (
    <section
      id="rhythm"
      className="skin-diff-section"
      aria-labelledby="diff-heading"
    >
      <div className="skin-diff-inner">
        {/* Soft atmospheric background glow */}
        <div className="skin-diff-ambient-glow" aria-hidden="true" />

        {/* Section Header: Visible immediately at top */}
        <header className="skin-diff-header">
          <p className="skin-diff-eyebrow">THE 3FIG DIFFERENCE</p>
          <h2 id="diff-heading" className="skin-diff-headline">
            THREE SIGNALS.<br />
            <em>ONE SKIN BALANCE.</em>
          </h2>
          <p className="skin-diff-opening-body">
            Skin doesn’t change in isolation. 3FIG brings sleep, stress, and nutrition together into one clear view.
          </p>
        </header>

        {/* Main Composition: Center Ring + Always-Visible Symmetrical Triad */}
        <div className="skin-diff-composition">
          {/* Central Brushed Titanium Ring Anchor */}
          <div className="skin-diff-ring-anchor">
            <div className="skin-diff-ring-core-glow" aria-hidden="true" />
            <img
              src="/images/threefig-ring-front-product.webp"
              alt="3FIG Smart Ring in brushed titanium front view"
              className="skin-diff-ring-img"
              width={480}
              height={480}
              loading="eager"
              draggable={false}
            />
          </div>

          {/* Keyword 01: SLEEP (Top-Left on desktop / 1st on mobile) */}
          <div className="skin-diff-editorial-keyword skin-diff-keyword-sleep">
            <span className="skin-diff-keyword-num">01</span>
            <div className="skin-diff-keyword-icon">
              <Moon size={28} strokeWidth={1.8} />
            </div>
            <h3 className="skin-diff-keyword-title">Sleep</h3>
            <p className="skin-diff-keyword-sub">How well your body restores overnight.</p>
          </div>

          {/* Keyword 02: STRESS (Top-Right on desktop / 2nd on mobile) */}
          <div className="skin-diff-editorial-keyword skin-diff-keyword-stress">
            <span className="skin-diff-keyword-num">02</span>
            <div className="skin-diff-keyword-icon">
              <Activity size={28} strokeWidth={1.8} />
            </div>
            <h3 className="skin-diff-keyword-title">Stress</h3>
            <p className="skin-diff-keyword-sub">How daily load shows up beneath the surface.</p>
          </div>

          {/* Keyword 03: NUTRITION (Bottom-Center on desktop / 3rd on mobile) */}
          <div className="skin-diff-editorial-keyword skin-diff-keyword-nutrition">
            <span className="skin-diff-keyword-num">03</span>
            <div className="skin-diff-keyword-icon">
              <Utensils size={28} strokeWidth={1.8} />
            </div>
            <h3 className="skin-diff-keyword-title">Nutrition</h3>
            <p className="skin-diff-keyword-sub">How daily nourishment aligns with your skin baseline.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
