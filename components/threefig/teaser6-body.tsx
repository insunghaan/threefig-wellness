"use client";

import React, { forwardRef } from "react";
import { Teaser6MeetIntro } from "./teaser6-meet-intro";
import { Teaser6ValueSection } from "./teaser6-value-section";
import { Teaser6HowItWorks } from "./teaser6-how-it-works";
import { Teaser6BrandMoment } from "./teaser6-brand-moment";
import { Teaser6RingSection } from "./teaser6-ring-section";
import { Teaser6ScienceSection } from "./teaser6-science-section";
import { Teaser6Testimonials } from "./teaser6-testimonials";
import { Teaser6Faq } from "./teaser6-faq";
import { Teaser6FinalBenefits } from "./teaser6-final-benefits";
import { Teaser6Footer } from "./teaser6-footer";

interface Teaser6BodyProps {
  onOpenWaitlist: (e?: React.MouseEvent) => void;
  onOpenPrivacy: () => void;
}

export const Teaser6Body = forwardRef<HTMLDivElement, Teaser6BodyProps>(
  function Teaser6Body({ onOpenWaitlist, onOpenPrivacy }, ref) {
    return (
      <main id="teaser6-content" className="teaser6-main-body" tabIndex={-1}>
        {/* Section: Meet 3fig (Introduction) */}
        <Teaser6MeetIntro />

        {/* Section A: What You Get (Skin-specific) */}
        <Teaser6ValueSection />

        {/* Section B: How It Works */}
        <Teaser6HowItWorks />

        {/* Section C: Brand Reflection */}
        <Teaser6BrandMoment onOpenWaitlist={onOpenWaitlist} />

        {/* Section D: The Ring */}
        <Teaser6RingSection />

        {/* Section E: Skin Science */}
        <Teaser6ScienceSection />

        {/* Section F: Early Voices */}
        <Teaser6Testimonials />

        {/* Section G: FAQ */}
        <Teaser6Faq />

        {/* Section H: Final Benefits & Explicit Waitlist Offer */}
        <Teaser6FinalBenefits ref={ref} onOpenWaitlist={onOpenWaitlist} />

        {/* Section I: Footer */}
        <Teaser6Footer onOpenPrivacy={onOpenPrivacy} />
      </main>
    );
  }
);
