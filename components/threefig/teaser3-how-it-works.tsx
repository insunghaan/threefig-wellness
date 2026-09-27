"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface StorySlide {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

const STORY_SLIDES: StorySlide[] = [
  {
    id: "wear",
    title: "Wear it.",
    description: "Wear it through sleep and everyday life.",
    imageSrc: "/images/threefig-pathway-01-sleep.webp",
    imageAlt: "Resting calmly during sleep wearing the 3FIG smart ring.",
  },
  {
    id: "check-in",
    title: "Check in.",
    description: "A few taps to log how your skin feels.",
    imageSrc: "/images/threefig-pathway-04-rhythm.webp",
    imageAlt: "Gentle morning reflection touching clean skin while wearing the 3FIG ring.",
  },
  {
    id: "connect",
    title: "Connect it.",
    description: "See your body signals and skin check-ins together.",
    imageSrc: "/images/threefig-balance-now-knit.webp",
    imageAlt: "Relaxing at home in soft knitwear with the 3FIG ring naturally visible.",
  },
];

export function Teaser3HowItWorks() {
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const prevSlide = useCallback(() => {
    setActiveSlide((curr) => Math.max(0, curr - 1));
  }, []);

  const nextSlide = useCallback(() => {
    setActiveSlide((curr) => Math.min(STORY_SLIDES.length - 1, curr + 1));
  }, []);

  const goToSlide = (idx: number) => {
    setActiveSlide(idx);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    // Only swipe if horizontal movement is dominant to keep vertical page scrolling natural
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSlide();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSlide();
    }
  };

  const current = STORY_SLIDES[activeSlide];

  return (
    <section
      id="how-it-works"
      className="teaser3-section teaser3-how-section"
      aria-labelledby="how-title"
    >
      <div className="teaser3-section-container">
        {/* Section Header */}
        <div className="teaser3-section-head">
          <p className="teaser3-eyebrow">HOW IT WORKS</p>
          <h2 id="how-title" className="teaser3-section-title">
            Wear. Check in. <span className="teaser3-title-accent">Connect.</span>
          </h2>
          <p className="teaser3-section-lead">
            Ring data and your skin check-ins, brought together.
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className="teaser3-how-carousel"
          role="region"
          aria-roledescription="carousel"
          aria-label="How it works sequence"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Photograph first */}
          <div className="teaser3-how-photo-wrap">
            <Image
              src={current.imageSrc}
              alt={current.imageAlt}
              fill
              className="teaser3-how-clean-photo"
              sizes="(max-width: 860px) 100vw, 840px"
              priority={activeSlide === 0}
            />
          </div>

          {/* Title and description below photograph */}
          <div className="teaser3-how-caption-row" aria-live="polite">
            <div className="teaser3-how-text-block">
              <h3 className="teaser3-how-slide-title">{current.title}</h3>
              <p className="teaser3-how-slide-desc">{current.description}</p>
            </div>

            {/* Desktop Controls */}
            <div className="teaser3-how-nav-controls" aria-label="Slide navigation">
              <button
                type="button"
                className="teaser3-how-arrow-btn"
                onClick={prevSlide}
                disabled={activeSlide === 0}
                aria-label="Previous slide"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="teaser3-how-dots" role="tablist" aria-label="Slides">
                {STORY_SLIDES.map((slide, i) => (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={i === activeSlide}
                    aria-label={`Slide ${i + 1}: ${slide.title}`}
                    className={`teaser3-how-dot-btn ${i === activeSlide ? "is-active" : ""}`}
                    onClick={() => goToSlide(i)}
                  />
                ))}
              </div>

              <button
                type="button"
                className="teaser3-how-arrow-btn"
                onClick={nextSlide}
                disabled={activeSlide === STORY_SLIDES.length - 1}
                aria-label="Next slide"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Mobile Pagination Dots (Centrally placed below caption) */}
          <div className="teaser3-how-mobile-dots" role="tablist" aria-label="Slides">
            {STORY_SLIDES.map((slide, i) => (
              <button
                key={`mob-${slide.id}`}
                type="button"
                role="tab"
                aria-selected={i === activeSlide}
                aria-label={`Slide ${i + 1}: ${slide.title}`}
                className={`teaser3-how-dot-btn ${i === activeSlide ? "is-active" : ""}`}
                onClick={() => goToSlide(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
