"use client";

import React from "react";
import Image from "next/image";

export function Teaser6RingSection() {
  const benefits = [
    {
      title: "Sleep-friendly comfort",
      desc: "Smooth hypoallergenic interior with zero screens, alerts, or vibrations to interrupt deep rest.",
    },
    {
      title: "Water-resistant titanium",
      desc: "Durable aerospace titanium rated for showers, hand washing, swimming, and workouts.",
    },
    {
      title: "Multi-day battery",
      desc: "Continuous background sensor tracking for up to 6 days on a single 45-minute charge.",
    },
  ];

  return (
    <section id="ring" className="teaser6-section teaser6-ring-section" aria-labelledby="ring-heading">
      <div className="teaser6-section-container">
        <div className="teaser6-ring-split">
          {/* Media Column */}
          <div className="teaser6-ring-media">
            <div className="teaser6-ring-image-wrapper">
              <Image
                src="/images/teaser2-ring-still-life.webp"
                alt="Polished silver 3fig smart ring standing upright on sculptural stone"
                width={744}
                height={952}
                className="teaser6-ring-image"
                sizes="(max-width: 860px) 100vw, 520px"
                loading="lazy"
              />
            </div>
          </div>

          {/* Copy Column */}
          <div className="teaser6-ring-content">
            <p className="teaser6-eyebrow">THE SMART RING</p>
            <h2 id="ring-heading" className="teaser6-section-title">
              Always tracking. <br />
              <span className="teaser6-title-accent">Never in the way.</span>
            </h2>
            <p className="teaser6-section-lead">
              Precision titanium sensors capture vital recovery signals without screens or distractions.
            </p>

            <div className="teaser6-ring-benefits" role="list">
              {benefits.map((b) => (
                <div key={b.title} className="teaser6-ring-benefit-item" role="listitem">
                  <h3 className="teaser6-benefit-title">{b.title}</h3>
                  <p className="teaser6-benefit-desc">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
