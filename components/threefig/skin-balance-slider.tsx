'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Sparkles,
  Waves,
  ShieldCheck,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

interface BalanceSlide {
  id: string;
  step: string;
  tag: string;
  badge: string;
  icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  titleLine1: string;
  titleLine2: string;
  essence: string;
  detailHeadline: string;
  detailBody: string;
  metricLabel: string;
  metricValue: string;
  image: string;
  imageAlt: string;
  objectPosition?: string;
  objectPositionMobile?: string;
}

const balanceSlides: BalanceSlide[] = [
  {
    id: 'now',
    step: '01',
    tag: 'NOW',
    badge: '01 · NOW',
    icon: Sparkles,
    titleLine1: 'Steady baseline.',
    titleLine2: 'Calm recovery.',
    essence: 'Circadian recovery held steady overnight.',
    detailHeadline: 'Steady baseline recovery with mild surface sensitivity.',
    detailBody:
      'Your sleep rhythm held steady overnight. The skin barrier is in a responsive state with slight reactivity to temperature shifts.',
    metricLabel: 'Skin Barrier Status',
    metricValue: 'Responsive · Recovery Steady',
    image: '/images/threefig-balance-now-knit.webp',
    imageAlt: 'Hand wearing titanium smart ring resting gently on knit fabric',
    objectPosition: '50% 50%',
    objectPositionMobile: '50% 50%',
  },
  {
    id: 'why',
    step: '02',
    tag: 'WHY',
    badge: '02 · WHY',
    icon: Waves,
    titleLine1: 'Sleep is steady.',
    titleLine2: 'Stress is rising.',
    essence: 'Late load triggers surface reactivity.',
    detailHeadline: 'Sleep rhythm is steady, but rising stress is pulling balance down.',
    detailBody:
      'Late-evening HRV dips correlate with increased barrier reactivity. Your skin is reflecting daytime cumulative strain.',
    metricLabel: 'Primary Driver',
    metricValue: 'Evening Strain · Elevated HRV dips',
    image: '/images/threefig-balance-why-blazer.webp',
    imageAlt: 'Hand wearing titanium smart ring touching chin with elegant posture',
    objectPosition: '64% 35%',
    objectPositionMobile: '67% 30%',
  },
  {
    id: 'next',
    step: '03',
    tag: 'NEXT',
    badge: '03 · NEXT',
    icon: ShieldCheck,
    titleLine1: 'Support the barrier.',
    titleLine2: 'Reset tonight.',
    essence: 'Hydrate and wind down 20 minutes earlier.',
    detailHeadline: 'Tonight, give recovery a head start with an earlier wind-down.',
    detailBody:
      'Shifting wind-down 30 minutes earlier creates sufficient circadian runway for cellular repair pathways to complete before morning.',
    metricLabel: 'Target Window',
    metricValue: 'Wind-down 10:20 PM · Rest Focus',
    image: '/images/threefig-balance-next-marble.webp',
    imageAlt: '3FIG Smart Ring resting on bright marble surface in warm morning sunlight',
    objectPosition: '55% 50%',
    objectPositionMobile: '56% 50%',
  },
];

export function SkinBalanceSlider() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sidePadding, setSidePadding] = useState<number | null>(null);
  const [activePopupItem, setActivePopupItem] = useState<BalanceSlide | null>(null);

  const totalSlides = balanceSlides.length;
  const isPointerDownRef = useRef(false);
  const pointerStartXRef = useRef(0);
  const pointerStartScrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  // Compute sidePadding so first card aligns with .skin-shell container
  const updateSidePadding = useCallback(() => {
    if (typeof window === 'undefined') return;
    const viewportWidth = window.innerWidth;
    const shellMaxWidth = 1320;
    const shellGutter = viewportWidth < 768 ? 20 : 40;

    if (viewportWidth > shellMaxWidth) {
      const gutter = (viewportWidth - shellMaxWidth) / 2 + shellGutter;
      setSidePadding(gutter);
    } else {
      setSidePadding(shellGutter);
    }
  }, []);

  useEffect(() => {
    updateSidePadding();
    window.addEventListener('resize', updateSidePadding, { passive: true });
    return () => window.removeEventListener('resize', updateSidePadding);
  }, [updateSidePadding]);

  // Navigate to slide index
  const goToSlide = useCallback((index: number) => {
    const nextIndex = Math.max(0, Math.min(totalSlides - 1, index));
    setCurrentIndex(nextIndex);

    const viewport = viewportRef.current;
    if (!viewport) return;

    const slides = viewport.querySelectorAll<HTMLElement>('.skin-pathway-slide');
    const targetSlide = slides[nextIndex];
    if (targetSlide) {
      targetSlide.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
    }
  }, [totalSlides]);

  const goToPrev = () => goToSlide(currentIndex - 1);
  const goToNext = () => goToSlide(currentIndex + 1);

  // Sync index on scroll/drag
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const slides = viewport.querySelectorAll<HTMLElement>('.skin-pathway-slide');
        if (!slides.length) return;

        const viewportLeft = viewport.getBoundingClientRect().left;
        let closestIdx = 0;
        let minDiff = Infinity;

        slides.forEach((slide, idx) => {
          const diff = Math.abs(slide.getBoundingClientRect().left - viewportLeft);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = idx;
          }
        });

        setCurrentIndex(closestIdx);
      }, 50);
    };

    viewport.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      viewport.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Pointer drag interactions (Desktop mouse-only, touch uses native smooth scroll-snap)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button, a, [role='button']")) return;
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    isPointerDownRef.current = true;
    hasMovedRef.current = false;
    pointerStartXRef.current = e.clientX;
    pointerStartScrollLeftRef.current = viewport.scrollLeft;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    const deltaX = e.clientX - pointerStartXRef.current;
    if (Math.abs(deltaX) > 10) {
      hasMovedRef.current = true;
    }
    viewport.scrollLeft = pointerStartScrollLeftRef.current - deltaX;
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    setTimeout(() => {
      hasMovedRef.current = false;
    }, 80);
  };

  return (
    <section id="balance-index" className="skin-balance-section" aria-labelledby="balance-index-title">
      <div className="skin-shell">
        <div className="skin-section-heading">
          <p className="skin-kicker">SKIN BALANCE INDEX</p>
          <h2 id="balance-index-title">
            Your daily signals,<br />
            <em>interpreted for your skin.</em>
          </h2>
          <p>
            Most wearables collect data and stop at a score. 3FIG continuously translates
            your overnight recovery, daily strain, and nutrition patterns into what your skin needs next.
          </p>
        </div>
      </div>

      {/* Horizontal Peek Carousel (Reusing Pathway Carousel Format) */}
      <div
        className="skin-pathway-carousel-viewport"
        ref={viewportRef}
        style={{
          scrollPaddingLeft: sidePadding != null ? `${sidePadding}px` : 'var(--shell-gutter)',
          marginTop: '40px',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="skin-pathway-carousel-track"
          style={{
            paddingLeft: sidePadding != null ? `${sidePadding}px` : 'var(--shell-gutter)',
            paddingRight: 0,
          }}
        >
          {balanceSlides.map((slide, index) => {
            const Icon = slide.icon;
            const isCurrent = currentIndex === index;
            const isLast = index === totalSlides - 1;

            return (
              <article
                key={slide.id}
                className={`skin-pathway-slide ${isCurrent ? 'is-active' : ''}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${slide.badge} (${index + 1} of ${totalSlides})`}
                data-balance-id={slide.id}
                style={{
                  marginRight: isLast
                    ? sidePadding != null
                      ? `${sidePadding}px`
                      : 'var(--shell-gutter)'
                    : undefined,
                }}
              >
                <div
                  className="skin-pathway-card skin-balance-card cursor-pointer"
                  data-balance-card={slide.id}
                  onClick={() => {
                    if (hasMovedRef.current) return;
                    setActivePopupItem(slide);
                  }}
                >
                  {/* Atmospheric background image */}
                  <img
                    src={slide.image}
                    alt={slide.imageAlt}
                    className="skin-pathway-bg"
                    style={
                      {
                        '--pathway-obj-pos': slide.objectPosition || 'center center',
                        '--pathway-obj-pos-mobile':
                          slide.objectPositionMobile || slide.objectPosition || 'center center',
                      } as React.CSSProperties
                    }
                    loading={index === 0 ? 'eager' : 'lazy'}
                    referrerPolicy="no-referrer"
                  />

                  {/* Gradient scrims for high-contrast typography */}
                  <div className="skin-pathway-scrim-top" />
                  <div className="skin-pathway-scrim-bottom" />

                  {/* Card Header: Pill tag & + button */}
                  <div className="skin-pathway-card-header">
                    <div className="skin-pathway-tag-pill">
                      <Icon size={16} strokeWidth={2} className="shrink-0 text-white/90" />
                      <span>{slide.badge}</span>
                    </div>

                    <button
                      type="button"
                      className="skin-pathway-expand-btn cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActivePopupItem(slide);
                      }}
                      aria-label={`Open ${slide.badge} details`}
                    >
                      <Plus size={20} strokeWidth={2.2} />
                    </button>
                  </div>

                  {/* Card Bottom: 2-line Serif Title + minimal essence */}
                  <div className="skin-pathway-card-bottom">
                    <h3 className="skin-pathway-slide-title">
                      <span>{slide.titleLine1}</span>
                      <br />
                      <span>{slide.titleLine2}</span>
                    </h3>
                    <p
                      style={{
                        margin: '6px 0 0',
                        fontSize: '0.875rem',
                        lineHeight: 1.4,
                        color: 'rgba(255, 255, 255, 0.78)',
                        letterSpacing: '0.01em',
                      }}
                    >
                      {slide.essence}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Centered Left/Right Navigation Arrows Only (No pagination dots) */}
      <div className="skin-pathway-controls-bar" style={{ marginTop: '28px' }}>
        <div className="skin-pathway-nav-arrows">
          <button
            type="button"
            className="skin-pathway-nav-btn is-secondary"
            disabled={currentIndex === 0}
            onClick={goToPrev}
            aria-label="Previous slide"
          >
            <ArrowLeft className="size-4 pointer-events-none" />
          </button>
          <button
            type="button"
            className="skin-pathway-nav-btn is-secondary"
            disabled={currentIndex === totalSlides - 1}
            onClick={goToNext}
            aria-label="Next slide"
          >
            <ArrowRight className="size-4 pointer-events-none" />
          </button>
        </div>
      </div>

      {/* Detail Dialog for deep context */}
      <Dialog
        open={activePopupItem !== null}
        onOpenChange={(open) => {
          if (!open) setActivePopupItem(null);
        }}
      >
        <DialogContent
          className="skin-pathway-modal-content border-none p-0 overflow-hidden text-white"
          style={{
            maxWidth: '560px',
            borderRadius: '28px',
            backgroundColor: '#1b1220',
            boxShadow: '0 24px 64px rgba(15, 8, 22, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          {activePopupItem && (
            <div className="relative flex flex-col">
              {/* Modal banner image */}
              <div className="relative w-full h-[220px] overflow-hidden">
                <img
                  src={activePopupItem.image}
                  alt={activePopupItem.imageAlt}
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition: activePopupItem.objectPosition || 'center center',
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(27, 18, 32, 0.1) 0%, rgba(27, 18, 32, 0.95) 100%)',
                  }}
                />
                <div className="absolute top-5 left-5">
                  <div className="skin-pathway-tag-pill">
                    {React.createElement(activePopupItem.icon, {
                      size: 16,
                      strokeWidth: 2,
                      className: 'shrink-0 text-white/90',
                    })}
                    <span>{activePopupItem.badge}</span>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 flex flex-col gap-5">
                <div>
                  <DialogTitle
                    className="font-serif text-2xl md:text-3xl font-normal tracking-tight text-white"
                    style={{ fontFamily: 'var(--font-display), Georgia, serif', lineHeight: 1.25 }}
                  >
                    {activePopupItem.detailHeadline}
                  </DialogTitle>
                </div>

                <DialogDescription
                  className="text-white/80 text-base leading-relaxed"
                  style={{ color: 'rgba(255, 255, 255, 0.82)', lineHeight: 1.6 }}
                >
                  {activePopupItem.detailBody}
                </DialogDescription>

                {/* Status / Metric highlight */}
                <div
                  className="rounded-2xl p-4 flex items-center gap-3.5"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                  }}
                >
                  {React.createElement(activePopupItem.icon, {
                    size: 20,
                    strokeWidth: 2,
                    className: 'shrink-0 text-[#e6bbf0]',
                  })}
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold tracking-wider uppercase text-white/60">
                      {activePopupItem.metricLabel}
                    </span>
                    <strong className="text-sm font-medium text-white/95">
                      {activePopupItem.metricValue}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
