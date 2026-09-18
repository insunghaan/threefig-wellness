"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { reflections } from "@/lib/threefig/reflections";

export function ReflectionCarousel() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sidePadding, setSidePadding] = useState<number | null>(null);

  const isPointerDownRef = useRef(false);
  const hasMovedRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const animRef = useRef<number | null>(null);

  const totalSlides = reflections.length;

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

  // Smooth custom RAF scroll animation with cubic ease-out curve
  const smoothScrollTo = useCallback((targetLeft: number, duration = 540) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    if (animRef.current !== null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }

    const startLeft = viewport.scrollLeft;
    const distance = targetLeft - startLeft;
    if (Math.abs(distance) < 1) {
      viewport.scrollLeft = targetLeft;
      return;
    }

    const prevSnap = viewport.style.scrollSnapType;
    viewport.style.scrollSnapType = "none";

    const startTime = performance.now();
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      viewport.scrollLeft = startLeft + distance * easeOutCubic(progress);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        viewport.scrollLeft = targetLeft;
        viewport.style.scrollSnapType = prevSnap;
        animRef.current = null;
      }
    };

    animRef.current = requestAnimationFrame(step);
  }, []);

  // Scroll so that the selected slide aligns with the exact left offset
  const goToSlide = useCallback(
    (index: number, immediate = false) => {
      if (totalSlides === 0) return;
      const nextIndex = ((index % totalSlides) + totalSlides) % totalSlides;
      setCurrentIndex(nextIndex);

      const viewport = viewportRef.current;
      if (!viewport) return;

      const slides = viewport.querySelectorAll<HTMLElement>(".skin-reflection-slide");
      const slide = slides[nextIndex];
      const firstSlide = slides[0];
      if (!slide || !firstSlide) return;

      const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      let targetLeft = slide.offsetLeft - firstSlide.offsetLeft;

      // When navigating to the last slide, align right edge to shell boundary
      if (nextIndex === totalSlides - 1 || targetLeft > maxScroll) {
        targetLeft = maxScroll;
      } else if (nextIndex === 0) {
        targetLeft = 0;
      }

      if (immediate) {
        viewport.scrollLeft = targetLeft;
      } else {
        smoothScrollTo(targetLeft, 560);
      }
    },
    [totalSlides, smoothScrollTo]
  );

  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  // Ensure current slide is aligned when sidePadding changes (e.g. initial layout or window resize)
  useEffect(() => {
    if (sidePadding != null) {
      goToSlide(currentIndexRef.current, true);
    }
  }, [sidePadding, goToSlide]);

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
      if (animRef.current !== null) return;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (animRef.current !== null) return;
        const slides = viewport.querySelectorAll<HTMLElement>(".skin-reflection-slide");
        const firstSlide = slides[0];
        if (!slides.length || !firstSlide) return;

        const currentScroll = viewport.scrollLeft;
        const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);

        if (maxScroll > 0 && currentScroll >= maxScroll - 30) {
          setCurrentIndex(slides.length - 1);
          return;
        }

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
    if ((e.target as HTMLElement).closest("button, a, [role='button']")) {
      return;
    }
    if (e.pointerType === "mouse" && e.button === 0) {
      const viewport = viewportRef.current;
      if (!viewport) return;
      if (animRef.current !== null) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
      isPointerDownRef.current = true;
      hasMovedRef.current = false;
      startXRef.current = e.clientX;
      startScrollLeftRef.current = viewport.scrollLeft;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    const deltaX = e.clientX - startXRef.current;
    if (Math.abs(deltaX) > 4) {
      hasMovedRef.current = true;
      viewport.scrollLeft = startScrollLeftRef.current - deltaX;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    const deltaX = e.clientX - startXRef.current;
    if (hasMovedRef.current && Math.abs(deltaX) > 30) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    } else if (hasMovedRef.current) {
      goToSlide(currentIndex);
    }
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
            paddingRight: 0,
          }}
        >
          {reflections.map(({ name, age, city, quote }, index) => {
            const isLast = index === totalSlides - 1;
            return (
              <div
                key={name}
                className="skin-reflection-slide shrink-0 select-none cursor-grab active:cursor-grabbing"
                style={{
                  scrollSnapAlign: "start",
                  marginRight: isLast
                    ? sidePadding != null
                      ? `${sidePadding}px`
                      : "var(--shell-gutter)"
                    : undefined,
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${totalSlides}`}
              >
                <figure className="select-none">
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
            );
          })}
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
