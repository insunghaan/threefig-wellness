"use client";

import React from "react";
import Image from "next/image";

interface TestimonialItem {
  id: string;
  quote: string;
  fullQuote: string;
  author: string;
  descriptor: string;
  avatarSrc: string;
}

const testimonials: TestimonialItem[] = [
  {
    id: "elena",
    quote:
      "Connecting sleep baselines to how my skin actually behaves in the morning is the first time health tracking felt genuinely relevant.",
    fullQuote:
      "Most wearables give you a hundred recovery scores that mean nothing for your skin. Connecting sleep baselines to how my skin actually behaves in the morning is the first time health tracking felt genuinely relevant.",
    author: "Elena R.",
    descriptor: "Beta participant & design director, London",
    avatarSrc: "/images/teaser3-avatar-elena.webp",
  },
  {
    id: "marcus",
    quote:
      "Having overnight heart rate variability and temperature shifts alongside my daily check-ins showed me patterns I'd never linked on my own.",
    fullQuote:
      "I used to guess why my skin felt sensitized some weeks and calm others. Having overnight heart rate variability and temperature shifts alongside my daily check-ins showed me patterns I'd never linked on my own.",
    author: "Marcus C.",
    descriptor: "Beta participant & runner with reactive skin, Austin",
    avatarSrc: "/images/teaser3-avatar-marcus.webp",
  },
  {
    id: "sophie",
    quote:
      "It doesn't push five new products on you. It just helps you notice what your skin is responding to, one day at a time.",
    fullQuote:
      "It doesn't push five new products on you. It just helps you notice what your skin is responding to, one day at a time. The calmness of the whole experience is what won me over.",
    author: "Sophie L.",
    descriptor: "Beta participant & creative director, New York",
    avatarSrc: "/images/teaser3-avatar-sophie.webp",
  },
  {
    id: "julian",
    quote:
      "Finally, an approach that respects how interconnected skin barrier function is with rest and autonomic recovery—without over-promising.",
    fullQuote:
      "Finally, an approach that respects how interconnected skin barrier function is with rest and autonomic recovery—without over-promising or turning into an aggressive medical dashboard.",
    author: "Dr. Julian K.",
    descriptor: "Cutaneous physiology researcher & beta advisor, Boston",
    avatarSrc: "/images/teaser3-avatar-julian.webp",
  },
];

export function Teaser4Testimonials() {
  return (
    <section
      id="early-voices"
      className="teaser4-section teaser4-testimonials-section"
      aria-labelledby="testimonials-heading"
    >
      <div className="teaser4-section-container">
        {/* Section Header */}
        <div className="teaser4-section-head">
          <p className="teaser4-eyebrow">EARLY VOICES</p>
          <h2 id="testimonials-heading" className="teaser4-section-title">
            A few early reactions.
          </h2>
          <p className="teaser4-section-lead">
            How early beta members describe their experience with 3fig.
          </p>
        </div>

        {/* 2-Column Grid on Desktop, 1-Column on Mobile */}
        <div className="teaser4-testimonials-grid">
          {testimonials.map((item) => (
            <article key={item.id} className="teaser4-testimonial-card" title={item.fullQuote}>
              <blockquote className="teaser4-testimonial-quote">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <div className="teaser4-testimonial-meta">
                <Image
                  src={item.avatarSrc}
                  alt=""
                  width={48}
                  height={48}
                  loading="lazy"
                  className="teaser4-testimonial-avatar"
                />
                <div className="teaser4-testimonial-author-group">
                  <cite className="teaser4-testimonial-author">{item.author}</cite>
                  <span className="teaser4-testimonial-descriptor">
                    {item.descriptor}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
