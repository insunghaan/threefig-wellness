"use client";

import React, { forwardRef } from "react";
import { ArrowRight } from "lucide-react";

interface Teaser3FinalBenefitsProps {
  onOpenWaitlist: (e?: React.MouseEvent) => void;
}

export const Teaser3FinalBenefits = forwardRef<HTMLDivElement, Teaser3FinalBenefitsProps>(
  function Teaser3FinalBenefits({ onOpenWaitlist }, ref) {
    return (
      <section
        id="benefits"
        className="teaser3-section teaser3-benefits-section"
        aria-labelledby="benefits-heading"
      >
        <div className="teaser3-benefits-container">
          <p className="teaser3-benefits-eyebrow">WAITLIST BENEFITS</p>
          <h2 id="benefits-heading" className="teaser3-benefits-title">
            Your ring, 20% off. <br />
            <span className="teaser3-benefits-accent">Your app, free for life.</span>
          </h2>

          <div className="teaser3-benefits-actions" ref={ref}>
            <button
              type="button"
              className="teaser3-btn-pill-inverse teaser3-benefits-btn"
              onClick={onOpenWaitlist}
              aria-label="Get early access"
              data-benefits-cta="true"
            >
              <span>Get early access</span>
              <ArrowRight size={17} aria-hidden="true" />
            </button>
            <p className="teaser3-benefits-microcopy">Ring sold separately.</p>
          </div>
        </div>
      </section>
    );
  }
);
