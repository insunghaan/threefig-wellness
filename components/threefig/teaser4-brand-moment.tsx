"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface Teaser4BrandMomentProps {
  onOpenWaitlist: (e?: React.MouseEvent) => void;
}

export function Teaser4BrandMoment({ onOpenWaitlist }: Teaser4BrandMomentProps) {
  return (
    <section className="teaser4-section teaser4-brand-section" aria-label="Brand reflection">
      <div className="teaser4-brand-container">
        <h2 className="teaser4-brand-title">
          Life happens. <br />
          <span className="teaser4-brand-accent">Skin notices.</span>
        </h2>
        <p className="teaser4-brand-desc">
          3fig helps you notice what tends to come with it.
        </p>

        <div className="teaser4-brand-action">
          <button
            type="button"
            className="teaser4-btn-pill teaser4-brand-btn"
            onClick={onOpenWaitlist}
            aria-label="Get early access"
          >
            <span>Get early access</span>
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
