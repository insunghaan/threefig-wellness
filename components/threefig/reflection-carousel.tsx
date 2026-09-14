"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { reflections } from "@/lib/threefig/reflections";

export function ReflectionCarousel() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sidePadding, setSidePadding] = useState(0);

  const isPointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);

  // Compute side padding so that the active card is centered in the viewport
  useEffect(() => {
    const updatePadding = () => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const firstSlide = viewport.querySelector<HTMLElement>(".skin-reflection-slide");
      if (!firstSlide) return;
      const pad = Math.max(0, (viewport.clientWidth - firstSlide.clientWidth) / 2);
      setSidePadding(pad);
    };

    updatePadding();
    window.addEventListener("resize", updatePadding);
    return () => window.removeEventListener("resize", updatePadding);
  }, []);

  // Center the selected slide using its offsetLeft and width
  const goToSlide = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const count = reflections.length;
    if (count === 0) return;
    const nextIndex = ((index % count) + count) % count;
    setCurrentIndex(nextIndex);

    const viewport = viewportRef.current;
    if (!viewport) return;

    const slides = viewport.querySelectorAll<HTMLElement>(".skin-reflection-slide");
    const slide = slides[nextIndex];
    if (!slide) return;

    const targetLeft = slide.offsetLeft - (viewport.clientWidth - slide.clientWidth) / 2;
    viewport.scrollTo({
      left: targetLeft,
      behavior,
    });
  }, []);

  // Ensure current slide is centered when sidePadding changes (e.g. after layout measurement)
  useEffect(() => {
    if (sidePadding > 0) {
      goToSlide(currentIndex, "instant");
    }
  }, [sidePadding, currentIndex, goToSlide]);

  const handlePrev = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  const handleNext = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  // Keyboard navigation when carousel region is focused
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNext();
      }
    },
    [handlePrev, handleNext]
  );

  // Synchronize currentIndex when user scrolls or swipes manually
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const slides = viewport.querySelectorAll<HTMLElement>(".skin-reflection-slide");
        if (!slides.length) return;
        const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
        let closestIndex = 0;
        let minDistance = Infinity;

        slides.forEach((slide, idx) => {
          const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
          const dist = Math.abs(viewportCenter - slideCenter);
          if (dist < minDistance) {
            minDistance = dist;
            closestIndex = idx;
          }
        });

        setCurrentIndex(closestIndex);
      }, 100);
    };

    viewport.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      viewport.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Desktop mouse horizontal dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button === 0) {
      const viewport = viewportRef.current;
      if (!viewport) return;
      isPointerDownRef.current = true;
      startXRef.current = e.clientX;
      startScrollLeftRef.current = viewport.scrollLeft;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    const deltaX = e.clientX - startXRef.current;
    viewport.scrollLeft = startScrollLeftRef.current - deltaX;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
  };

  return (
    <div
      className="skin-reflection-carousel relative outline-none"
      role="region"
      aria-roledescription="carousel"
      aria-label="Fictional reflections"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={viewportRef}
        className="overflow-x-auto relative w-full select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="skin-reflection-track flex"
          style={{
            width: "max-content",
            paddingLeft: sidePadding > 0 ? `${sidePadding}px` : "calc(50% - 250px)",
            paddingRight: sidePadding > 0 ? `${sidePadding}px` : "calc(50% - 250px)",
            marginLeft: 0,
          }}
        >
          {reflections.map(({ name, age, city, quote }, index) => (
            <div
              key={name}
              className="skin-reflection-slide shrink-0 select-none cursor-grab active:cursor-grabbing touch-pan-y"
              style={{
                scrollSnapAlign: "center",
              }}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${reflections.length}`}
            >
              <figure tabIndex={0} className="select-none">
                <span className="skin-reflection-number" aria-hidden="true">
                  0{index + 1}
                </span>
                <blockquote>“{quote}”</blockquote>
                <figcaption>
                  <strong>{name}</strong>
                  <span aria-label={`Age ${age}, ${city}`}>
                    {age} / {city}
                  </span>
                </figcaption>
              </figure>
            </div>
          ))}
        </div>
      </div>
      <div className="skin-reflection-controls">
        <button
          type="button"
          className="skin-reflection-control cursor-pointer select-none"
          onClick={handlePrev}
          aria-label="Previous slide"
        >
          <ArrowLeft className="size-4 pointer-events-none" />
          <span className="sr-only">Previous slide</span>
        </button>
        <button
          type="button"
          className="skin-reflection-control cursor-pointer select-none"
          onClick={handleNext}
          aria-label="Next slide"
        >
          <ArrowRight className="size-4 pointer-events-none" />
          <span className="sr-only">Next slide</span>
        </button>
      </div>
    </div>
  );
}
