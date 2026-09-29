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
    id: "faq-benefits",
    question: "What do I get for joining?",
    answer:
      "You lock in 20% off the ring at launch and a free lifetime app subscription. No subscription fees, ever.",
  },
  {
    id: "faq-ring-cost",
    question: "Is the ring free?",
    answer:
      "No. The ring is a separate hardware purchase. Joining the waitlist gives you 20% off the ring and makes your app subscription free for life.",
  },
  {
    id: "faq-skin-measurement",
    question: "Does the ring measure my skin directly?",
    answer:
      "The ring measures physiological signals—sleep, HRV, heart rate, and temperature trends. You log how your skin feels. 3fig correlates both into your daily Skin Balance.",
  },
  {
    id: "faq-meals",
    question: "Do I have to log every meal?",
    answer:
      "No. Meal notes are optional. Add them when you want to see if late eating or specific foods affect your morning Skin Balance.",
  },
  {
    id: "faq-after-register",
    question: "What happens after I register?",
    answer:
      "We’ll send an email confirming your waitlist spot and discounts. As launch approaches, you’ll get sizing kit access and first choice of ring finishes.",
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
          <p className="teaser3-eyebrow">FAQ</p>
          <h2 id="faq-heading" className="teaser3-section-title">
            Before you join.
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
