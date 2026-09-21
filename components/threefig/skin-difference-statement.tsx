'use client';

import React from 'react';

/**
 * Apple-style minimalist statement & differentiation
 * - Perfectly centered typography
 * - Ultra-concise, punchy copy
 * - Subtle centered divider and disclaimer
 */
export function SkinDifferenceStatement() {
  return (
    <section className="skin-statement-section" aria-label="The 3FIG Difference">
      <div className="skin-statement-motion" aria-hidden="true" />
      <div className="skin-shell skin-statement-inner">
        <p className="skin-kicker">THE 3FIG DIFFERENCE</p>
        <h2 className="skin-statement-hero-title">
          <span className="skin-statement-line-plain">Not another score.</span>
          <span className="skin-statement-line-emphasis">A clearer next step.</span>
        </h2>
        <p className="skin-statement-hero-copy">
          Most wearables count your data. 3FIG translates it into what your skin needs next.
        </p>
        <div className="skin-statement-hairline" aria-hidden="true" />
        <p className="skin-statement-disclaimer">
          The Skin Balance Index is a wellness interpretation designed to identify personal patterns.
          It is not a medical diagnosis.
        </p>
      </div>
    </section>
  );
}
