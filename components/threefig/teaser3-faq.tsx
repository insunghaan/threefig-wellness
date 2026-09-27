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
    question: "What happens when I join?",
    answer:
      "You reserve early access and secure free lifetime 3FIG membership before public launch.",
  },
  {
    id: "faq-membership",
    question: "What does lifetime membership include?",
    answer:
      "Full ongoing access to the 3FIG companion app, Skin Balance insights, and pattern tracking with zero monthly subscription fees.",
  },
  {
    id: "faq-ring",
    question: "Is the ring included?",
    answer:
      "No. The 3FIG smart ring is hardware and sold separately when reservations open. Membership is free for life for early members.",
  },
  {
    id: "faq-tracking",
    question: "What does 3FIG actually track?",
    answer:
      "The ring continuously tracks sleep stages, resting heart rate, HRV, and relative skin temperature shifts. You log skin reflections in seconds.",
  },
  {
    id: "faq-availability",
    question: "When will 3FIG be available?",
    answer:
      "Early reservation access opens later this year. Members on the early list will be invited first in batches.",
  },
];

export function Teaser3Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="teaser3-section teaser3-faq-section" aria-labelledby="faq-heading">
      <div className="teaser3-section-container">
        {/* Section Header */}
        <div className="teaser3-section-head">
          <p className="teaser3-eyebrow">FREQUENTLY ASKED</p>
          <h2 id="faq-heading" className="teaser3-section-title">
            Good questions. <br />
            <span className="teaser3-title-accent">Clear answers.</span>
          </h2>
        </div>

        {/* Accordion List */}
        <div className="teaser3-faq-list" role="region" aria-label="Frequently Asked Questions">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const contentId = `faq-content-${faq.id}`;
            const headerId = `faq-header-${faq.id}`;

            return (
              <div
                key={faq.id}
                className={`teaser3-faq-item ${isOpen ? "is-open" : ""}`}
              >
                <button
                  type="button"
                  id={headerId}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  className="teaser3-faq-trigger"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="teaser3-faq-question">{faq.question}</span>
                  <ChevronDown
                    size={18}
                    className={`teaser3-faq-arrow ${isOpen ? "is-rotated" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={headerId}
                    className="teaser3-faq-answer"
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
