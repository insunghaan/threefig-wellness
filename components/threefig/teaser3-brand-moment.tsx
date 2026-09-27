"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface Teaser3BrandMomentProps {
  onOpenWaitlist: (e?: React.MouseEvent) => void;
}

export function Teaser3BrandMoment({ onOpenWaitlist }: Teaser3BrandMomentProps) {
  return (
    <section className="teaser3-section teaser3-brand-section" aria-label="Brand reflection">
      <div className="teaser3-brand-container">
        <h2 className="teaser3-brand-title">
          Life happens. <br />
          <span className="teaser3-title-accent">Skin notices.</span>
        </h2>
        <p className="teaser3-brand-desc">
          3FIG helps you notice what tends to come with it.
        </p>

        <div className="teaser3-brand-action">
          <button
            type="button"
            className="teaser3-btn-pill teaser3-brand-btn"
            onClick={onOpenWaitlist}
            aria-label="Claim free lifetime access to 3FIG"
          >
            <span>Claim Free Lifetime Access</span>
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
