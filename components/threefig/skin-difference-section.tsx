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
      id="difference"
      className="skin-diff-section"
      aria-labelledby="diff-heading"
    >
      <div className="skin-diff-inner">
        {/* Soft atmospheric background glow */}
        <div className="skin-diff-ambient-glow" aria-hidden="true" />

        {/* Section Header: Visible immediately at top */}
        <header className="skin-diff-header skin-section-heading">
          <p className="skin-kicker skin-diff-eyebrow">THE 3FIG DIFFERENCE</p>
          <h2 id="diff-heading" className="skin-diff-headline">
            Three signals.<br />
            <em>One skin balance.</em>
          </h2>
          <p className="skin-diff-opening-body">
            Skin doesn’t change in isolation. 3FIG brings sleep, stress, and nutrition together into one clear view.
          </p>
        </header>

        {/* Main Composition: Centered Ring + Centered Vertical Information Flow */}
        <div className="skin-diff-composition">
          {/* Central High-Resolution 3FIG Ring Anchor */}
          <div className="skin-diff-ring-anchor">
            <img
              src="/images/threefig-ring-isolated.png"
              alt="3FIG Smart Ring in brushed titanium showing sensor array"
              className="skin-diff-ring-img"
              width={1024}
              height={1024}
              loading="eager"
              draggable={false}
            />
          </div>

          {/* Centered Information Flow: One clean center axis for all 3 items */}
          <div className="skin-diff-info-area">
            {/* Item 1: Sleep */}
            <div className="skin-diff-item">
              <div className="skin-diff-item-header">
                <Moon className="skin-diff-item-icon" size={20} strokeWidth={1.8} aria-hidden="true" />
                <span className="skin-diff-item-title">Sleep</span>
              </div>
              <p className="skin-diff-item-desc">
                How well your body
                <br />
                restores overnight.
              </p>
            </div>

            {/* Item 2: Stress */}
            <div className="skin-diff-item">
              <div className="skin-diff-item-header">
                <Activity className="skin-diff-item-icon" size={20} strokeWidth={1.8} aria-hidden="true" />
                <span className="skin-diff-item-title">Stress</span>
              </div>
              <p className="skin-diff-item-desc">
                How daily load shows up
                <br />
                beneath the surface.
              </p>
            </div>

            {/* Item 3: Nutrition */}
            <div className="skin-diff-item">
              <div className="skin-diff-item-header">
                <Utensils className="skin-diff-item-icon" size={20} strokeWidth={1.8} aria-hidden="true" />
                <span className="skin-diff-item-title">Nutrition</span>
              </div>
              <p className="skin-diff-item-desc">
                How daily nourishment aligns
                <br />
                with your skin baseline.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
