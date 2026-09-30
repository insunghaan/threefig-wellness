"use client";

import React from "react";

/* --------------------------------------------------------------------------
   HOW IT WORKS (Teaser 3)
   3-column grid layout on desktop matching Teaser 4 specification.
   Clean photographs with 01/RING, 02/YOU, 03/APP pill badges.
   No slider/carousel on both desktop and mobile.
   -------------------------------------------------------------------------- */

interface HowStep {
  id: string;
  badge: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

const HOW_STEPS: HowStep[] = [
  {
    id: "wear",
    badge: "01 / RING",
    title: "Track your body.",
    description:
      "Sleep, heart rate, HRV, temperature trends, and movement—measured quietly while you sleep and live.",
    imageSrc: "/images/teaser3/how-it-works-01-sleep.webp",
    imageAlt: "Sleeping with 3fig ring",
  },
  {
    id: "check-in",
    badge: "02 / YOU",
    title: "Log your skin.",
    description:
      "Note how your skin feels with a quick check-in. Add meal notes when you want more context.",
    imageSrc: "/images/teaser3/how-it-works-02-skin.webp",
    imageAlt: "Checking skin comfort in morning mirror",
  },
  {
    id: "connect",
    badge: "03 / APP",
    title: "See the connection.",
    description:
      "View your Skin Balance summary, compare trends, and choose a daily action to test.",
    imageSrc: "/images/teaser3/how-it-works-03-app.webp",
    imageAlt: "Checking insights on 3fig mobile app",
  },
];

export function Teaser3HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="teaser3-section teaser3-how-section"
      aria-labelledby="how-title"
    >
      <div className="teaser3-section-container">
        {/* Section Header - Centered */}
        <div className="teaser3-section-head teaser3-how-head">
          <p className="teaser3-eyebrow">HOW IT WORKS</p>
          <h2 id="how-title" className="teaser3-section-title">
            The ring measures.
            <br />
            You add context.
          </h2>
          <p className="teaser3-section-lead">
            3fig brings both together to help you understand your skin.
          </p>
        </div>

        {/* 3-Column Grid on Desktop / Vertical Stack on Mobile */}
        <div className="teaser3-how-grid">
          {HOW_STEPS.map((step) => (
            <article key={step.id} className="teaser3-how-card">
              <div
                className={`teaser3-how-image-wrap ${
                  step.id === "wear" ? "teaser3-how-image-ring" : ""
                }`}
              >
                <img
                  src={step.imageSrc}
                  alt={step.imageAlt}
                  loading="lazy"
                  width={380}
                  height={418}
                  className="teaser3-how-img"
                />
                <span className="teaser3-how-badge">{step.badge}</span>
              </div>
              <h3 className="teaser3-how-card-title">{step.title}</h3>
              <p className="teaser3-how-card-desc">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
