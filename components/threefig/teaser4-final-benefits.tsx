"use client";

import React, { forwardRef } from "react";
import { ArrowRight } from "lucide-react";

interface Teaser4FinalBenefitsProps {
  onOpenWaitlist: (e?: React.MouseEvent) => void;
}

export const Teaser4FinalBenefits = forwardRef<HTMLDivElement, Teaser4FinalBenefitsProps>(
  function Teaser4FinalBenefits({ onOpenWaitlist }, ref) {
    return (
      <section
        id="benefits"
        className="teaser4-section teaser4-benefits-section"
        aria-labelledby="benefits-heading"
      >
        <div className="teaser4-benefits-container">
          <p className="teaser4-benefits-eyebrow">FOUNDING MEMBER ACCESS</p>
          <h2 id="benefits-heading" className="teaser4-benefits-title">
            Your membership. <br />
            <span className="teaser4-benefits-accent">Free for life.</span>
          </h2>
          <p className="teaser4-benefits-lead">
            Join early and keep your 3fig membership free for life.
          </p>

          <div className="teaser4-benefits-actions" ref={ref}>
            <button
              type="button"
              className="teaser4-btn-pill-inverse teaser4-benefits-btn"
              onClick={onOpenWaitlist}
              aria-label="Get early access"
              data-benefits-cta="true"
            >
              <span>Get early access</span>
              <ArrowRight size={17} aria-hidden="true" />
            </button>
            <p className="teaser4-benefits-microcopy">Ring sold separately.</p>
          </div>
        </div>
      </section>
    );
  }
);
