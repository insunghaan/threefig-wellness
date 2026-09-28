"use client";

import React from "react";
import Image from "next/image";

export function Teaser3RingSection() {
  const benefits = [
    {
      title: "Sleep-friendly",
      desc: "Discreet sensors with zero screen or vibration to disturb your rest.",
    },
    {
      title: "Everyday-ready",
      desc: "Water-resistant titanium built for daily showers and workouts.",
    },
    {
      title: "Quiet by design",
      desc: "Continuous background sensing with multi-day battery life.",
    },
  ];

  return (
    <section id="ring" className="teaser3-section teaser3-ring-section" aria-labelledby="ring-heading">
      <div className="teaser3-section-container">
        <div className="teaser3-ring-split">
          {/* Media Column */}
          <div className="teaser3-ring-media">
            <div className="teaser3-ring-image-wrapper">
              <Image
                src="/images/teaser2-ring-still-life.webp"
                alt="Polished silver 3fig smart ring standing upright on sculptural dark charcoal stone"
                width={744}
                height={952}
                className="teaser3-ring-image"
                sizes="(max-width: 860px) 100vw, 520px"
                loading="lazy"
              />
            </div>
          </div>

          {/* Copy Column */}
          <div className="teaser3-ring-content">
            <p className="teaser3-eyebrow">THE SENSING FOUNDATION</p>
            <h2 id="ring-heading" className="teaser3-section-title">
              Always on. <br />
              <span className="teaser3-title-accent">Never in the way.</span>
            </h2>
            <p className="teaser3-section-lead">
              Featherlight titanium engineered for effortless 24/7 wear.
            </p>

            <div className="teaser3-ring-benefits" role="list">
              {benefits.map((b) => (
                <div key={b.title} className="teaser3-ring-benefit-item" role="listitem">
                  <h3 className="teaser3-benefit-title">{b.title}</h3>
                  <p className="teaser3-benefit-desc">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
