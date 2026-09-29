"use client";

import React from "react";

export function Teaser3MeetIntro() {
  return (
    <section
      id="meet-3fig"
      className="teaser3-section teaser3-meet-section"
      aria-labelledby="meet-title"
    >
      <div className="teaser3-meet-container">
        {/* Header Block: Eyebrow, Heading, Description */}
        <div className="teaser3-meet-header">
          <p className="teaser3-eyebrow">MEET 3FIG</p>
          <h2 id="meet-title" className="teaser3-meet-title">
            Your Skin Balance. <br />
            <span className="teaser3-rose-accent">The data behind it.</span>
          </h2>
          <p className="teaser3-meet-desc">
            See your daily score alongside ring measurements and skin check-ins.
          </p>
        </div>

        {/* Visual Block: Approved Three-Phone + Ring Composition */}
        <div className="teaser3-meet-visual">
          <picture>
            <source srcSet="/images/threefig-phones-trio.webp" type="image/webp" />
            <img
              src="/images/threefig-phones-trio.png"
              alt="Three smartphones showing the 3fig app next to the 3fig smart ring"
              className="teaser3-meet-image"
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
