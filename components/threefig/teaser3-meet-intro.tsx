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

        {/* Visual Block: Responsive Three-Phone + Ring Composition */}
        <div className="teaser3-meet-visual">
          <picture className="teaser3-meet-picture">
            {/* Mobile (<= 860px) */}
            <source
              media="(max-width: 860px)"
              srcSet="/images/teaser3/meet-phones-mobile.webp"
              type="image/webp"
            />
            <source
              media="(max-width: 860px)"
              srcSet="/images/teaser3/meet-phones-mobile.png"
              type="image/png"
            />
            {/* Desktop / Webview */}
            <source
              srcSet="/images/teaser3/meet-phones-desktop.webp"
              type="image/webp"
            />
            <img
              src="/images/teaser3/meet-phones-desktop.png"
              alt="Three smartphones showing the 3fig app next to the 3fig smart ring"
              className="teaser3-meet-image"
              width={1024}
              height={702}
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>
      </div>
    </section>
  );
}
