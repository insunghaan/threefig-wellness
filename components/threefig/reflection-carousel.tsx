"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AutoScroll from "embla-carousel-auto-scroll";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from "@/components/ui/carousel";
import { reflections } from "@/lib/threefig/reflections";

export function ReflectionCarousel() {
  const root = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const autoScroll = useMemo(() => AutoScroll({ speed: 0.35, startDelay: 1000, playOnInit: false, stopOnInteraction: true, stopOnMouseEnter: false, stopOnFocusIn: false }), []);
  const plugins = useMemo(() => [autoScroll], [autoScroll]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setReducedMotion(media.matches);
    const visibility = () => setTabVisible(!document.hidden);
    motion();
    visibility();
    media.addEventListener("change", motion);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.1 });
    if (root.current) observer.observe(root.current);
    return () => {
      media.removeEventListener("change", motion);
      document.removeEventListener("visibilitychange", visibility);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!api) return;
    const sync = () => {
      const activePlugin = api.plugins().autoScroll;
      if (!activePlugin) return;
      if (!hovered && !focused && visible && tabVisible && !reducedMotion) activePlugin.play(1000);
      else activePlugin.stop();
    };
    sync();
    api.on("pointerUp", sync).on("reInit", sync);
    return () => {
      api.off("pointerUp", sync).off("reInit", sync);
      api.plugins().autoScroll?.stop();
    };
  }, [api, autoScroll, hovered, focused, visible, tabVisible, reducedMotion]);

  return (
    <div ref={root} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <Carousel className="skin-reflection-carousel" setApi={setApi} plugins={plugins}
        opts={{ align: "center", loop: true, dragFree: true }} aria-label="Fictional reflections">
        <CarouselContent className="skin-reflection-track">
          {reflections.map(({ name, age, city, quote }, index) => (
            <CarouselItem className="skin-reflection-slide" key={name} aria-label={`${index + 1} of ${reflections.length}`}>
              <figure tabIndex={0}>
                <span className="skin-reflection-number" aria-hidden="true">0{index + 1}</span>
                <blockquote>“{quote}”</blockquote>
                <figcaption><strong>{name}</strong><span aria-label={`Age ${age}, ${city}`}>{age} / {city}</span></figcaption>
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="skin-reflection-controls">
          <CarouselPrevious className="skin-reflection-control" />
          <CarouselNext className="skin-reflection-control" />
        </div>
      </Carousel>
    </div>
  );
}
