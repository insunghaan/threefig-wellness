"use client";

import React, { forwardRef } from "react";
import { Teaser4MeetIntro } from "./teaser4-meet-intro";
import { Teaser4ValueSection } from "./teaser4-value-section";
import { Teaser4HowItWorks } from "./teaser4-how-it-works";
import { Teaser4BrandMoment } from "./teaser4-brand-moment";
import { Teaser4RingSection } from "./teaser4-ring-section";
import { Teaser4ScienceSection } from "./teaser4-science-section";
import { Teaser4Testimonials } from "./teaser4-testimonials";
import { Teaser4Faq } from "./teaser4-faq";
import { Teaser4FinalBenefits } from "./teaser4-final-benefits";
import { Teaser4Footer } from "./teaser4-footer";

interface Teaser4BodyProps {
  onOpenWaitlist: (e?: React.MouseEvent) => void;
  onOpenPrivacy: () => void;
}

export const Teaser4Body = forwardRef<HTMLDivElement, Teaser4BodyProps>(
  function Teaser4Body({ onOpenWaitlist, onOpenPrivacy }, ref) {
    return (
      <main id="teaser4-content" className="teaser4-main-body" tabIndex={-1}>
        {/* Section: Meet 3fig (Introduction) */}
        <Teaser4MeetIntro />

        {/* Section A: What You Get */}
        <Teaser4ValueSection />

        {/* Section B: How It Works */}
        <Teaser4HowItWorks />

        {/* Section C: Brand Reflection */}
        <Teaser4BrandMoment onOpenWaitlist={onOpenWaitlist} />

        {/* Section D: The Ring */}
        <Teaser4RingSection />

        {/* Section E: Skin Science */}
        <Teaser4ScienceSection />

        {/* Section F: Early Voices */}
        <Teaser4Testimonials />

        {/* Section G: FAQ */}
        <Teaser4Faq />

        {/* Section H: Final Benefits & Mobile Handoff Target */}
        <Teaser4FinalBenefits ref={ref} onOpenWaitlist={onOpenWaitlist} />

        {/* Section I: Footer */}
        <Teaser4Footer onOpenPrivacy={onOpenPrivacy} />
      </main>
    );
  }
);
