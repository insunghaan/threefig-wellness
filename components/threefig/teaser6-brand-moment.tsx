"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface Teaser6BrandMomentProps {
  onOpenWaitlist: (e?: React.MouseEvent) => void;
}

export function Teaser6BrandMoment({ onOpenWaitlist }: Teaser6BrandMomentProps) {
  return (
    <section className="teaser6-section teaser6-brand-section" aria-label="Brand reflection">
      <div className="teaser6-brand-container">
        <h2 className="teaser6-brand-title">
          Inside body signals. <br />
          <span className="teaser6-brand-accent">Outside natural glow.</span>
        </h2>
        <p className="teaser6-brand-desc">
          Skin understood from within. Connect everyday habits to how your skin looks and feels.
        </p>

        <div className="teaser6-brand-action">
          <button
            type="button"
            className="teaser6-btn-pill teaser6-brand-btn"
            onClick={onOpenWaitlist}
            aria-label="Join the waitlist"
          >
            <span>Join the waitlist</span>
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
