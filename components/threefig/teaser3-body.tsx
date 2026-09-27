"use client";

import React, { forwardRef } from "react";
import { Teaser3ValueSection } from "./teaser3-value-section";
import { Teaser3HowItWorks } from "./teaser3-how-it-works";
import { Teaser3BrandMoment } from "./teaser3-brand-moment";
import { Teaser3RingSection } from "./teaser3-ring-section";
import { Teaser3ScienceSection } from "./teaser3-science-section";
import { Teaser3Testimonials } from "./teaser3-testimonials";
import { Teaser3Faq } from "./teaser3-faq";
import { Teaser3FinalBenefits } from "./teaser3-final-benefits";
import { Teaser3Footer } from "./teaser3-footer";

interface Teaser3BodyProps {
  onOpenWaitlist: (e?: React.MouseEvent) => void;
  onOpenPrivacy: () => void;
}

export const Teaser3Body = forwardRef<HTMLDivElement, Teaser3BodyProps>(
  function Teaser3Body({ onOpenWaitlist, onOpenPrivacy }, ref) {
    return (
      <main id="teaser3-content" className="teaser3-main-body" tabIndex={-1}>
        {/* Section A: What You Get */}
        <Teaser3ValueSection />

        {/* Section B: How It Works */}
        <Teaser3HowItWorks />

        {/* Section C: Brand Reflection */}
        <Teaser3BrandMoment onOpenWaitlist={onOpenWaitlist} />

        {/* Section D: The Ring */}
        <Teaser3RingSection />

        {/* Section E: Skin Science */}
        <Teaser3ScienceSection />

        {/* Section F: Early Voices */}
        <Teaser3Testimonials />

        {/* Section G: FAQ */}
        <Teaser3Faq />

        {/* Section H: Final Benefits & Mobile Handoff Target */}
        <Teaser3FinalBenefits ref={ref} onOpenWaitlist={onOpenWaitlist} />

        {/* Section I: Footer */}
        <Teaser3Footer onOpenPrivacy={onOpenPrivacy} />
      </main>
    );
  }
);
