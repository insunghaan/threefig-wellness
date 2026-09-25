"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "What happens when I join?",
    answer:
      "You reserve early access and secure free lifetime 3FIG membership before public launch.",
  },
  {
    question: "What does lifetime membership include?",
    answer:
      "Full ongoing access to the 3FIG companion app, Skin Balance insights, and pattern tracking with zero monthly subscription fees.",
  },
  {
    question: "Is the ring included?",
    answer:
      "No. The 3FIG smart ring is hardware and sold separately when reservations open. Membership is free for life for early members.",
  },
  {
    question: "What does 3FIG actually track?",
    answer:
      "The ring continuously tracks sleep stages, resting heart rate, HRV, and relative skin temperature shifts. You log skin reflections in seconds.",
  },
  {
    question: "When will 3FIG be available?",
    answer:
      "Early reservation access opens later this year. Members on the early list will be invited first in batches.",
  },
];

export function Teaser2Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggleFaq(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index));
  }

  return (
    <section id="faq" className="teaser2-faq-section" aria-labelledby="faq-heading">
      <div className="teaser2-faq-container">
        <div className="teaser2-section-head">
          <p className="teaser2-eyebrow">FREQUENTLY ASKED</p>
          <h2 id="faq-heading" className="teaser2-section-title">
            Good questions.<br />
            <em>Clear answers.</em>
          </h2>
        </div>

        <div className="teaser2-faq-list" role="region" aria-label="Frequently Asked Questions">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className={`teaser2-faq-item ${isOpen ? "is-open" : ""}`}
              >
                <button
                  type="button"
                  className="teaser2-faq-trigger"
                  aria-expanded={isOpen}
                  onClick={() => toggleFaq(index)}
                >
                  <span className="teaser2-faq-question">{faq.question}</span>
                  <ChevronDown
                    size={18}
                    className={`teaser2-faq-arrow ${isOpen ? "is-rotated" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="teaser2-faq-answer">
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
