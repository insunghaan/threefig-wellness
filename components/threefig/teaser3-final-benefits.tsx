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
          <p className="teaser3-benefits-eyebrow">FOUNDING MEMBER ACCESS</p>
          <h2 id="benefits-heading" className="teaser3-benefits-title">
            Your membership. <br />
            <span className="teaser3-benefits-accent">Free for life.</span>
          </h2>
          <p className="teaser3-benefits-lead">
            Join early and keep your 3fig membership free for life.
          </p>

          <div className="teaser3-benefits-actions" ref={ref}>
            <button
              type="button"
              className="teaser3-btn-pill-inverse teaser3-benefits-btn"
              onClick={onOpenWaitlist}
              aria-label="Count me in"
            >
              <span>Count me in</span>
              <ArrowRight size={17} aria-hidden="true" />
            </button>
            <p className="teaser3-benefits-microcopy">
              Ring sold separately.
            </p>
          </div>
        </div>
      </section>
    );
  }
);
