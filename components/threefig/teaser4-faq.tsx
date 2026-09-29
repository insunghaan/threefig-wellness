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
      "You reserve early access and secure free lifetime 3fig membership before public launch.",
  },
  {
    id: "faq-membership",
    question: "What does lifetime membership include?",
    answer:
      "Full ongoing access to the 3fig companion app, Skin Balance insights, and pattern tracking with zero monthly subscription fees.",
  },
  {
    id: "faq-ring",
    question: "Is the ring included?",
    answer:
      "No. The 3fig smart ring is hardware and sold separately when reservations open. Membership is free for life for early members.",
  },
  {
    id: "faq-tracking",
    question: "What does 3fig actually track?",
    answer:
      "The ring continuously tracks sleep stages, resting heart rate, HRV, and relative skin temperature shifts. You log skin reflections in seconds.",
  },
  {
    id: "faq-availability",
    question: "When will 3fig be available?",
    answer:
      "Early reservation access opens later this year. Members on the early list will be invited first in batches.",
  },
];

export function Teaser4Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="teaser4-section teaser4-faq-section" aria-labelledby="faq-heading">
      <div className="teaser4-section-container">
        {/* Section Header */}
        <div className="teaser4-section-head">
          <p className="teaser4-eyebrow">FREQUENTLY ASKED</p>
          <h2 id="faq-heading" className="teaser4-section-title">
            Good questions. <br />
            <span className="teaser4-title-accent">Clear answers.</span>
          </h2>
        </div>

        {/* Accordion List */}
        <div className="teaser4-faq-list" role="region" aria-label="Frequently Asked Questions">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const contentId = `faq-content-${faq.id}`;
            const headerId = `faq-header-${faq.id}`;

            return (
              <div
                key={faq.id}
                className={`teaser4-faq-item ${isOpen ? "is-open" : ""}`}
              >
                <button
                  type="button"
                  id={headerId}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  className="teaser4-faq-trigger"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="teaser4-faq-question">{faq.question}</span>
                  <ChevronDown
                    size={18}
                    className={`teaser4-faq-arrow ${isOpen ? "is-rotated" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={headerId}
                    className="teaser4-faq-answer"
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
