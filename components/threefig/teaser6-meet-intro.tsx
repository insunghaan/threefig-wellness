"use client";

import React from "react";

export function Teaser6MeetIntro() {
  return (
    <section
      id="meet-3fig"
      className="teaser6-section teaser6-meet-section"
      aria-labelledby="meet-title"
    >
      <div className="teaser6-meet-container">
        {/* Header Block */}
        <div className="teaser6-meet-header">
          <p className="teaser6-eyebrow">MEET 3FIG</p>
          <h2 id="meet-title" className="teaser6-meet-title">
            Your Skin Balance, <br />
            <span className="teaser6-rose-accent">made clear.</span>
          </h2>
          <p className="teaser6-meet-desc">
            3FIG pairs smart ring bio-telemetry with quick daily check-ins to turn complex signals into one clear Skin Balance insight.
          </p>
        </div>

        {/* Visual Block: Approved Three-Phone + Ring Composition */}
        <div className="teaser6-meet-visual">
          <picture>
            <source srcSet="/images/threefig-phones-trio.webp" type="image/webp" />
            <img
              src="/images/threefig-phones-trio.png"
              alt="Three smartphones showing the 3fig app next to the 3fig smart ring"
              className="teaser6-meet-image"
              width={1024}
              height={808}
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>
      </div>
    </section>
  );
}
