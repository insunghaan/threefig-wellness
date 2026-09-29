"use client";

import React from "react";
import Image from "next/image";

export function Teaser3RingSection() {
  const benefits = [
    {
      title: "Sleep",
      desc: "Duration and sleep patterns",
    },
    {
      title: "Heart rate & HRV",
      desc: "Signals for stress and recovery trends",
    },
    {
      title: "Temperature & movement",
      desc: "Changes from your personal baseline",
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
            <p className="teaser3-eyebrow">THE RING</p>
            <h2 id="ring-heading" className="teaser3-section-title">
              Body data. <br />
              <span className="teaser3-title-accent">Skin insight.</span>
            </h2>
            <p className="teaser3-section-lead">
              Wear 3fig through sleep and daily life. See your signals in the app.
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
