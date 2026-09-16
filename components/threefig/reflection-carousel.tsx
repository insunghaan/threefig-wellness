"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { reflections } from "@/lib/threefig/reflections";

export function ReflectionCarousel() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sidePadding, setSidePadding] = useState<number | null>(null);

  const isPointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);

  // Compute left padding so that the first slide aligns with the left edge of .skin-shell
  useEffect(() => {
    const updatePadding = () => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const section = viewport.closest("section");
      const shell = section?.querySelector(".skin-shell") as HTMLElement | null;
      if (shell) {
        const shellRect = shell.getBoundingClientRect();
        const viewportRect = viewport.getBoundingClientRect();
        const leftOffset = Math.round(shellRect.left - viewportRect.left);
        if (leftOffset > 0) {
          setSidePadding(leftOffset);
        }
      }
    };

    updatePadding();
    window.addEventListener("resize", updatePadding);
    return () => window.removeEventListener("resize", updatePadding);
  }, []);

  // Scroll so that the selected slide aligns with the exact left offset
  const goToSlide = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const count = reflections.length;
      if (count === 0) return;
      const nextIndex = ((index % count) + count) % count;
      setCurrentIndex(nextIndex);

      const viewport = viewportRef.current;
      if (!viewport) return;

      const slides = viewport.querySelectorAll<HTMLElement>(".skin-reflection-slide");
      const slide = slides[nextIndex];
      const firstSlide = slides[0];
      if (!slide || !firstSlide) return;

      const targetLeft = slide.offsetLeft - firstSlide.offsetLeft;
      viewport.scrollTo({
        left: Math.max(0, targetLeft),
        behavior,
      });
    },
    []
  );

  // Ensure current slide is aligned when sidePadding changes
  useEffect(() => {
    if (sidePadding != null) {
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
        const firstSlide = slides[0];
        if (!slides.length || !firstSlide) return;

        const currentScroll = viewport.scrollLeft;
        let closestIndex = 0;
        let minDistance = Infinity;

        slides.forEach((slide, idx) => {
          const slideTarget = slide.offsetLeft - firstSlide.offsetLeft;
          const dist = Math.abs(currentScroll - slideTarget);
          if (dist < minDistance) {
            minDistance = dist;
            closestIndex = idx;
          }
        });

        setCurrentIndex(closestIndex);
      }, 60);
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
    if (Math.abs(deltaX) > 2) {
      viewport.scrollLeft = startScrollLeftRef.current - deltaX;
    }
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
      aria-label="Member reflections"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={viewportRef}
        className="skin-reflection-viewport"
        style={{
          scrollPaddingLeft: sidePadding != null ? `${sidePadding}px` : "var(--shell-gutter)",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="skin-reflection-track"
          style={{
            paddingLeft: sidePadding != null ? `${sidePadding}px` : "var(--shell-gutter)",
            paddingRight: sidePadding != null ? `${sidePadding}px` : "var(--shell-gutter)",
          }}
        >
          {reflections.map(({ name, age, city, quote }, index) => (
            <div
              key={name}
              className="skin-reflection-slide shrink-0 select-none cursor-grab active:cursor-grabbing touch-pan-y"
              style={{
                scrollSnapAlign: "start",
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
