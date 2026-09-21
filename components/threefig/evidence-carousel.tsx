"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";

export interface StudyItem {
  number: string;
  category: string;
  title: string;
  citation: string;
  url: string;
}

export const defaultStudies: StudyItem[] = [
  {
    number: "01",
    category: "SLEEP",
    title: "A 2026 review maps sleep and circadian rhythm to skin barrier, immune activity and repair.",
    citation: "Biegański et al. · Sleep Medicine Reviews · 2026",
    url: "https://pubmed.ncbi.nlm.nih.gov/42641586/",
  },
  {
    number: "02",
    category: "NUTRITION",
    title: "A 2026 review finds nutrition can influence glycation, oxidative stress and pathways involved in skin aging.",
    citation: "Piquero-Casals et al. · Frontiers in Aging · 2026",
    url: "https://pubmed.ncbi.nlm.nih.gov/42389732/",
  },
  {
    number: "03",
    category: "STRESS",
    title: "A 2026 review links chronic stress pathways with oxidative stress, matrix breakdown and impaired barrier function.",
    citation: "Ahmed et al. · Wiadomości Lekarskie · 2026",
    url: "https://pubmed.ncbi.nlm.nih.gov/41962101/",
  },
];

export function EvidenceMobileCarousel({ studies = defaultStudies }: { studies?: StudyItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = el.querySelector(".skin-evidence-slide")?.clientWidth || 1;
    const newIndex = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(Math.max(0, Math.min(newIndex, studies.length - 1)));
  }, [studies.length]);

  const scrollToIndex = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const slides = el.querySelectorAll<HTMLElement>(".skin-evidence-slide");
    if (slides[index]) {
      slides[index].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      setActiveIndex(index);
    }
  };

  return (
    <div className="skin-evidence-carousel-wrapper">
      <div
        ref={trackRef}
        className="skin-evidence-carousel-track"
        onScroll={handleScroll}
      >
        {studies.map((study, idx) => (
          <a
            key={study.number}
            href={study.url}
            target="_blank"
            rel="noreferrer"
            className={`skin-evidence-slide ${activeIndex === idx ? "is-active" : ""}`}
            aria-label={`Read study ${study.number}: ${study.category}`}
          >
            <div className="skin-evidence-slide-top">
              <span className="skin-evidence-slide-tag">
                {study.number} · {study.category}
              </span>
              <span className="skin-evidence-slide-arrow">
                <ArrowRight size={18} />
              </span>
            </div>
            <h3 className="skin-evidence-slide-title">{study.title}</h3>
            <p className="skin-evidence-slide-citation">{study.citation}</p>
          </a>
        ))}
      </div>

      <div className="skin-evidence-carousel-nav">
        <button
          type="button"
          className="skin-evidence-nav-btn"
          aria-label="Previous study"
          disabled={activeIndex === 0}
          onClick={() => scrollToIndex(activeIndex - 1)}
        >
          <ArrowLeft size={16} />
        </button>
        <button
          type="button"
          className="skin-evidence-nav-btn"
          aria-label="Next study"
          disabled={activeIndex === studies.length - 1}
          onClick={() => scrollToIndex(activeIndex + 1)}
        >
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
