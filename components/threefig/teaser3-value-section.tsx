"use client";

import React from "react";

/* ------------------------------------------------------------
   MAIN SECTION: WHAT YOU GET
   - Desktop: 3 vertically arranged alternating rows
   - Mobile: 1 horizontal carousel with peek and capsule pagination
   - Components: 3 standalone UI card components (no background images)
   - Mobile Titles: Natural 2-line wraps with unified heights
   ------------------------------------------------------------ */

interface BenefitItem {
  num: string;
  titleDesktop: string;
  titleMobile: React.ReactNode;
  desc: string;
  subDesc?: string;
  image: {
    webp: string;
    png: string;
    alt: string;
  };
}

const BENEFIT_ITEMS: BenefitItem[] = [
  {
    num: "01 / TODAY",
    titleDesktop: "Understand today’s Skin Balance.",
    titleMobile: (
      <>
        Understand today’s
        <br />
        Skin Balance.
      </>
    ),
    desc: "Every morning, 3fig pairs your sleep and recovery signals with how your skin feels to create your daily score.",
    subDesc: "One number. Clear context behind it.",
    image: {
      webp: "/images/teaser3/what-you-get-01.webp",
      png: "/images/teaser3/what-you-get-01.png",
      alt: "Skin Balance daily score 86 card component",
    },
  },
  {
    num: "02 / PATTERNS",
    titleDesktop: "See when your skin feels different.",
    titleMobile: (
      <>
        See when your skin
        <br />
        feels different.
      </>
    ),
    desc: "Track your Skin Balance alongside sleep consistency, late meals, and travel to see what might be affecting your skin.",
    subDesc: "Spot connections without second-guessing.",
    image: {
      webp: "/images/teaser3/what-you-get-02.webp",
      png: "/images/teaser3/what-you-get-02.png",
      alt: "Tonight wind-down 10:20 PM recommendation card component",
    },
  },
  {
    num: "03 / NEXT STEP",
    titleDesktop: "Choose a habit. Track your skin’s response.",
    titleMobile: (
      <>
        Choose a habit.
        <br />
        Track your skin’s response.
      </>
    ),
    desc: "When your score shifts, 3fig suggests a simple daily habit—like an earlier wind-down—and helps you track whether it makes a difference.",
    subDesc: "Small adjustments. Real feedback.",
    image: {
      webp: "/images/teaser3/what-you-get-03.webp",
      png: "/images/teaser3/what-you-get-03.png",
      alt: "7-day patterns skin comfort and sleep consistency chart component",
    },
  },
];

export function Teaser3ValueSection() {
  return (
    <section
      id="what-you-get"
      className="teaser3-section teaser3-value-section"
      aria-labelledby="value-title"
    >
      <div className="teaser3-section-container">
        {/* Section Header: Extracted to top and centered like Meet 3FIG */}
        <div className="teaser3-value-header">
          <p className="teaser3-eyebrow">WHAT YOU GET</p>
          <h2 id="value-title" className="teaser3-value-header-title">
            Your skin today. <br />
            <span className="teaser3-rose-accent">Your patterns over time.</span>
          </h2>
          <p className="teaser3-value-header-desc">
            See your Skin Balance, the signals behind it, and what to try next.
          </p>
        </div>

        {/* ============================================================
            DESKTOP LAYOUT (3 Alternating Rows in Document Flow)
            ============================================================ */}
        <div className="teaser3-value-desktop-flow">
          {/* Row 1: Left (01 Copy), Right (Card 01) */}
          <div className="teaser3-value-row teaser3-value-row-1">
            <div className="teaser3-value-col-left teaser3-value-copy-col">
              <div className="teaser3-value-copy-block">
                <span className="teaser3-value-num teaser3-rose-accent">{BENEFIT_ITEMS[0].num}</span>
                <h3 className="teaser3-value-title">{BENEFIT_ITEMS[0].titleDesktop}</h3>
                <p className="teaser3-value-desc">{BENEFIT_ITEMS[0].desc}</p>
                {BENEFIT_ITEMS[0].subDesc && (
                  <p className="teaser3-value-desc teaser3-value-subdesc">{BENEFIT_ITEMS[0].subDesc}</p>
                )}
              </div>
            </div>

            <div className="teaser3-value-col-right">
              <div className="teaser3-visual-panel teaser3-clean-component-panel">
                <picture className="teaser3-component-picture">
                  <source srcSet={BENEFIT_ITEMS[0].image.webp} type="image/webp" />
                  <img
                    src={BENEFIT_ITEMS[0].image.png}
                    alt={BENEFIT_ITEMS[0].image.alt}
                    className="teaser3-component-img"
                    width={1024}
                    height={1024}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </div>
            </div>
          </div>

          {/* Row 2: Left (Card 02), Right (02 Copy) */}
          <div className="teaser3-value-row teaser3-value-row-2">
            <div className="teaser3-value-col-left">
              <div className="teaser3-visual-panel teaser3-clean-component-panel">
                <picture className="teaser3-component-picture">
                  <source srcSet={BENEFIT_ITEMS[1].image.webp} type="image/webp" />
                  <img
                    src={BENEFIT_ITEMS[1].image.png}
                    alt={BENEFIT_ITEMS[1].image.alt}
                    className="teaser3-component-img"
                    width={1024}
                    height={1024}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </div>
            </div>

            <div className="teaser3-value-col-right teaser3-value-copy-col">
              <div className="teaser3-value-copy-block">
                <span className="teaser3-value-num teaser3-rose-accent">{BENEFIT_ITEMS[1].num}</span>
                <h3 className="teaser3-value-title">{BENEFIT_ITEMS[1].titleDesktop}</h3>
                <p className="teaser3-value-desc">{BENEFIT_ITEMS[1].desc}</p>
                {BENEFIT_ITEMS[1].subDesc && (
                  <p className="teaser3-value-desc teaser3-value-subdesc">{BENEFIT_ITEMS[1].subDesc}</p>
                )}
              </div>
            </div>
          </div>

          {/* Row 3: Left (03 Copy), Right (Card 03) */}
          <div className="teaser3-value-row teaser3-value-row-3">
            <div className="teaser3-value-col-left teaser3-value-copy-col">
              <div className="teaser3-value-copy-block">
                <span className="teaser3-value-num teaser3-rose-accent">{BENEFIT_ITEMS[2].num}</span>
                <h3 className="teaser3-value-title">{BENEFIT_ITEMS[2].titleDesktop}</h3>
                <p className="teaser3-value-desc">{BENEFIT_ITEMS[2].desc}</p>
                {BENEFIT_ITEMS[2].subDesc && (
                  <p className="teaser3-value-desc teaser3-value-subdesc">{BENEFIT_ITEMS[2].subDesc}</p>
                )}
              </div>
            </div>

            <div className="teaser3-value-col-right">
              <div className="teaser3-visual-panel teaser3-clean-component-panel">
                <picture className="teaser3-component-picture">
                  <source srcSet={BENEFIT_ITEMS[2].image.webp} type="image/webp" />
                  <img
                    src={BENEFIT_ITEMS[2].image.png}
                    alt={BENEFIT_ITEMS[2].image.alt}
                    className="teaser3-component-img"
                    width={1024}
                    height={1024}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            MOBILE LAYOUT (Vertical Stack in Document Flow)
            Scrollable list displaying copy and component sequentially
            ============================================================ */}
        <div className="teaser3-value-mobile-view">
          <div className="teaser3-value-mobile-list">
            {BENEFIT_ITEMS.map((item) => (
              <div key={item.num} className="teaser3-value-mobile-item">
                <div className="teaser3-value-mobile-copy">
                  <span className="teaser3-value-num teaser3-rose-accent">{item.num}</span>
                  <h3 className="teaser3-value-title teaser3-value-mobile-title">
                    {item.titleMobile}
                  </h3>
                  <p className="teaser3-value-desc">{item.desc}</p>
                  {item.subDesc && (
                    <p className="teaser3-value-desc teaser3-value-subdesc">{item.subDesc}</p>
                  )}
                </div>

                <div className="teaser3-visual-panel teaser3-clean-component-panel">
                  <picture className="teaser3-component-picture">
                    <source srcSet={item.image.webp} type="image/webp" />
                    <img
                      src={item.image.png}
                      alt={item.image.alt}
                      className="teaser3-component-img"
                      width={1024}
                      height={1024}
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
