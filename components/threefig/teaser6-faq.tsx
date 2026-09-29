"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    id: "faq-join",
    question: "What do I get by joining the waitlist?",
    answer:
      "You lock in free lifetime 3FIG app access (no monthly subscription fees) and 20% off your smart ring at launch. Joining is completely free with no payment required.",
  },
  {
    id: "faq-ring",
    question: "Is the smart ring included for free?",
    answer:
      "No. The ring is precision titanium hardware and sold separately. Waitlist members receive guaranteed 20% off launch pricing and free lifetime app access.",
  },
  {
    id: "faq-tracking",
    question: "What does the ring track vs what I record?",
    answer:
      "The ring continuously tracks sleep architecture, resting heart rate, HRV, and finger temperature trends. You take 10 seconds each morning to log skin observations. The app correlates these data streams into your Skin Balance Score.",
  },
  {
    id: "faq-membership",
    question: "What does free lifetime app access include?",
    answer:
      "Full ongoing access to the 3FIG companion app, daily Skin Balance scores, 7-day habit correlation trends, and actionable daily recommendations with zero recurring fees.",
  },
  {
    id: "faq-availability",
    question: "When will 3FIG become available?",
    answer:
      "Pre-orders and ring sizing kits roll out later this year. Waitlist members receive priority invitation batches before the public release.",
  },
];

export function Teaser6Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="teaser6-section teaser6-faq-section" aria-labelledby="faq-heading">
      <div className="teaser6-section-container">
        {/* Section Header */}
        <div className="teaser6-section-head">
          <p className="teaser6-eyebrow">FREQUENTLY ASKED</p>
          <h2 id="faq-heading" className="teaser6-section-title">
            Questions & <br />
            <span className="teaser6-title-accent">honest answers.</span>
          </h2>
        </div>

        {/* Accordion List */}
        <div className="teaser6-faq-list" role="region" aria-label="Frequently Asked Questions">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const contentId = `faq-content-${faq.id}`;
            const headerId = `faq-header-${faq.id}`;

            return (
              <div
                key={faq.id}
                className={`teaser6-faq-item ${isOpen ? "is-open" : ""}`}
              >
                <button
                  type="button"
                  id={headerId}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  className="teaser6-faq-trigger"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="teaser6-faq-question">{faq.question}</span>
                  <ChevronDown
                    size={18}
                    className={`teaser6-faq-arrow ${isOpen ? "is-rotated" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={headerId}
                    className="teaser6-faq-answer"
                  >
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
