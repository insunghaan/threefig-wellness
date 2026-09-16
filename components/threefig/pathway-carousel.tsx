"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  MoonStar,
  Plus,
  ShieldCheck,
  Sparkles,
  Utensils,
  Waves,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export interface PathwayItem {
  id: string;
  number: string;
  badge: string;
  icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  label: string;
  titleLine1: string;
  titleLine2: string;
  body: string;
  example: string;
  exampleLabel: string;
  image: string;
  imageAlt: string;
}

export const defaultPathways: PathwayItem[] = [
  {
    id: "sleep",
    number: "01",
    badge: "Sleep and Rest",
    icon: MoonStar,
    label: "Sleep",
    titleLine1: "Past the score.",
    titleLine2: "Toward better sleep.",
    body: "3FIG connects when you sleep, how steadily you sleep and how your skin feels the next day. Then it finds a wind-down window built around your rhythm — not everybody else’s.",
    example: "Tonight · Wind down at 10:20. Tomorrow starts here.",
    exampleLabel: "YOUR 3FIG",
    image: "/images/threefig-pathway-sleep-macro.jpg",
    imageAlt: "Macro close-up texture of serene organic washed linen fabric folds in soft ambient evening lamp glow",
  },
  {
    id: "food",
    number: "02",
    badge: "Food & Nourishment",
    icon: Utensils,
    label: "Food",
    titleLine1: "Less counting.",
    titleLine2: "More noticing.",
    body: "Log a meal. Skip the calorie math. 3FIG sorts what seems to work, what may not and what deserves another look — then serves up recipes that fit.",
    example: "This week · Oats, berries, walnuts. Your kind of bowl.",
    exampleLabel: "YOUR 3FIG",
    image: "/images/threefig-pathway-food-macro.jpg",
    imageAlt: "Macro close-up of dark fresh ripe berries with glistening water droplets on matte ceramic surface",
  },
  {
    id: "stress",
    number: "03",
    badge: "Stress & Recovery",
    icon: Waves,
    label: "Stress",
    titleLine1: "Spot the pressure.",
    titleLine2: "Soften the landing.",
    body: "3FIG compares stress and recovery signals with changes you notice in your skin. When tension leaves a trace, it suggests one realistic way to reset.",
    example: "Now · Walk for ten. Let the day loosen.",
    exampleLabel: "YOUR 3FIG",
    image: "/images/threefig-pathway-stress-macro.jpg",
    imageAlt: "Macro close-up of calm water ripples over smooth dark stone in serene zen atmosphere",
  },
  {
    id: "rhythm",
    number: "04",
    badge: "Movement & Rhythm",
    icon: Sparkles,
    label: "Rhythm",
    titleLine1: "Gentle momentum.",
    titleLine2: "Steady daily energy.",
    body: "Light, movement and recovery operate as one circadian system. 3FIG identifies optimal active windows and restorative breaks so energy stays consistent throughout your day.",
    example: "Morning · 15 minutes of outdoor sunlight sets circadian tone.",
    exampleLabel: "YOUR 3FIG",
    image: "/images/threefig-pathway-rhythm-macro.jpg",
    imageAlt: "Macro close-up of warm golden sunlight rays and soft diagonal shadow casting morning warmth",
  },
  {
    id: "balance",
    number: "05",
    badge: "Cellular Balance",
    icon: ShieldCheck,
    label: "Balance",
    titleLine1: "Inside body signals.",
    titleLine2: "Outside natural glow.",
    body: "Skin temperature and overnight barrier fluctuations reveal micro-shifts before they become visible. Subtle evening adjustments support deep overnight repair and radiance.",
    example: "Notice · Hydration and rest keep barrier resilience steady.",
    exampleLabel: "YOUR 3FIG",
    image: "/images/threefig-pathway-balance-macro.jpg",
    imageAlt: "Macro close-up of crystal-clear water droplet on silky organic petal reflecting gentle light",
  },
];

export function PathwayCarousel() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sidePadding, setSidePadding] = useState<number | null>(null);
  const [activePopupItem, setActivePopupItem] = useState<PathwayItem | null>(null);

  const isPointerDownRef = useRef(false);
  const hasMovedRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const animRef = useRef<number | null>(null);

  const totalSlides = defaultPathways.length;

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

  // Scroll so that the selected slide aligns with the exact offset
  const goToSlide = useCallback(
    (index: number, immediate = false) => {
      if (totalSlides === 0) return;
      const nextIndex = ((index % totalSlides) + totalSlides) % totalSlides;
      setCurrentIndex(nextIndex);

      const viewport = viewportRef.current;
      if (!viewport) return;

      const slides = viewport.querySelectorAll<HTMLElement>(".skin-pathway-slide");
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

  // Ensure current slide is aligned when sidePadding changes
  useEffect(() => {
    if (sidePadding != null) {
      goToSlide(currentIndex, true);
    }
  }, [sidePadding, currentIndex, goToSlide]);

  const goToPrev = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  const goToNext = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  // Keyboard navigation when carousel region is focused
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      }
    },
    [goToPrev, goToNext]
  );

  // Synchronize currentIndex when user scrolls or swipes manually
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const slides = viewport.querySelectorAll<HTMLElement>(".skin-pathway-slide");
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

  // Desktop horizontal mouse dragging
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
        goToNext();
      } else {
        goToPrev();
      }
    } else if (hasMovedRef.current) {
      goToSlide(currentIndex);
    }
  };

  return (
    <div
      className="skin-pathway-carousel-wrapper"
      role="region"
      aria-roledescription="carousel"
      aria-label="3FIG Wellness Pathways"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Scrollable peek carousel viewport */}
      <div
        ref={viewportRef}
        className="skin-pathway-carousel-viewport"
        style={{
          scrollPaddingLeft: sidePadding != null ? `${sidePadding}px` : "var(--shell-gutter)",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="skin-pathway-carousel-track"
          style={{
            paddingLeft: sidePadding != null ? `${sidePadding}px` : "var(--shell-gutter)",
            paddingRight: 0,
          }}
        >
          {defaultPathways.map((item, index) => {
            const Icon = item.icon;
            const isCurrent = currentIndex === index;
            const isLast = index === totalSlides - 1;

            return (
              <article
                key={item.id}
                className={`skin-pathway-slide ${isCurrent ? "is-active" : ""}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${item.label} (${index + 1} of ${totalSlides})`}
                style={{
                  marginRight: isLast
                    ? sidePadding != null
                      ? `${sidePadding}px`
                      : "var(--shell-gutter)"
                    : undefined,
                }}
              >
                <div className="skin-pathway-card">
                  {/* Ultra-minimalist macro background image (no people) */}
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    className="skin-pathway-bg"
                    loading={index === 0 ? "eager" : "lazy"}
                    referrerPolicy="no-referrer"
                  />

                  {/* Atmospheric gradient scrim overlays */}
                  <div className="skin-pathway-scrim-top" />
                  <div className="skin-pathway-scrim-bottom" />

                  {/* Card Header: Pill tag & + button */}
                  <div className="skin-pathway-card-header">
                    <div className="skin-pathway-tag-pill">
                      <Icon size={16} strokeWidth={2} className="shrink-0 text-white/90" />
                      <span>{item.badge}</span>
                    </div>

                    <button
                      type="button"
                      className="skin-pathway-expand-btn cursor-pointer"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActivePopupItem(item);
                      }}
                      aria-label={`Open ${item.label} details and YOUR 3FIG recommendation`}
                    >
                      <Plus size={20} strokeWidth={2.2} />
                    </button>
                  </div>

                  {/* Card Bottom: Display title strictly broken into 2 lines */}
                  <div className="skin-pathway-card-bottom">
                    <h3 className="skin-pathway-slide-title">
                      <span>{item.titleLine1}</span>
                      <br />
                      <span>{item.titleLine2}</span>
                    </h3>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Centered Navigation Arrows: left and right match in design */}
      <div className="skin-pathway-controls-bar">
        <div className="skin-pathway-nav-arrows">
          <button
            type="button"
            className="skin-pathway-nav-btn is-secondary"
            onClick={goToPrev}
            aria-label="Previous slide"
          >
            <ArrowLeft className="size-4 pointer-events-none" />
          </button>
          <button
            type="button"
            className="skin-pathway-nav-btn is-secondary"
            onClick={goToNext}
            aria-label="Next slide"
          >
            <ArrowRight className="size-4 pointer-events-none" />
          </button>
        </div>
      </div>

      {/* Overlay Popup Modal for "YOUR 3FIG" (Triggered by + button) */}
      <Dialog
        open={activePopupItem !== null}
        onOpenChange={(open) => {
          if (!open) setActivePopupItem(null);
        }}
      >
        <DialogContent
          className="skin-pathway-dialog-content sm:max-w-[540px]"
        >
          {activePopupItem && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/12">
                <div className="inline-flex items-center gap-2.5 text-[#d8c2e6] text-sm font-medium">
                  {React.createElement(activePopupItem.icon, { size: 18, strokeWidth: 2 })}
                  <span>{activePopupItem.number} · {activePopupItem.badge}</span>
                </div>
              </div>

              <div>
                <DialogTitle className="font-serif text-2xl sm:text-3xl text-white font-normal leading-snug">
                  {activePopupItem.titleLine1} {activePopupItem.titleLine2}
                </DialogTitle>
                <DialogDescription className="mt-3 text-[#d5cad9] text-base leading-relaxed">
                  {activePopupItem.body}
                </DialogDescription>
              </div>

              {/* Dedicated YOUR 3FIG Recommendation Box */}
              <aside className="p-4 sm:p-5 rounded-2xl bg-white/[0.08] border border-white/15 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold tracking-wider text-[#cdaee2] uppercase">
                    {activePopupItem.exampleLabel}
                  </span>
                </div>
                <p className="mt-1.5 text-sm sm:text-base text-white font-medium leading-relaxed">
                  {activePopupItem.example}
                </p>
              </aside>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-sm font-medium transition-colors cursor-pointer"
                  onClick={() => setActivePopupItem(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
