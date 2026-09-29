"use client";

import React, { forwardRef } from "react";
import { ArrowRight } from "lucide-react";

interface Teaser6FinalBenefitsProps {
  onOpenWaitlist: (e?: React.MouseEvent) => void;
}

export const Teaser6FinalBenefits = forwardRef<HTMLDivElement, Teaser6FinalBenefitsProps>(
  function Teaser6FinalBenefits({ onOpenWaitlist }, ref) {
    return (
      <section
        id="benefits"
        className="teaser6-section teaser6-benefits-section"
        aria-labelledby="benefits-heading"
      >
        <div className="teaser6-benefits-container">
          <p className="teaser6-benefits-eyebrow">FOUNDING MEMBER ACCESS</p>
          <h2 id="benefits-heading" className="teaser6-benefits-title">
            Join the waitlist. <br />
            <span className="teaser6-benefits-accent">Get the app free for life.</span>
          </h2>
          <p className="teaser6-benefits-lead">
            Get 20% off the ring at launch. Lock in lifetime app access with zero recurring fees.
          </p>

          <div className="teaser6-benefits-actions" ref={ref}>
            <button
              type="button"
              className="teaser6-btn-pill-inverse teaser6-benefits-btn"
              onClick={onOpenWaitlist}
              aria-label="Join the waitlist"
              data-benefits-cta="true"
            >
              <span>Join the waitlist</span>
              <ArrowRight size={17} aria-hidden="true" />
            </button>
            <div className="teaser6-benefits-conditions">
              <span>No payment required to join.</span>
              <span className="teaser6-benefits-condition-dot">•</span>
              <span>Ring sold separately.</span>
            </div>
          </div>
        </div>
      </section>
    );
  }
);
