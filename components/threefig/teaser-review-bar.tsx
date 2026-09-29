"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type FontOption = "tech" | "editorial" | "grotesk";

interface TeaserReviewBarProps {
  currentVersion: "v4" | "v5";
  onFontChange?: (font: FontOption) => void;
}

export function TeaserReviewBar({ currentVersion, onFontChange }: TeaserReviewBarProps) {
  const [activeFont, setActiveFont] = useState<FontOption>("tech");
  const pathname = usePathname();

  useEffect(() => {
    // Restore saved font or default to 'tech'
    const saved = (typeof window !== "undefined" && localStorage.getItem("tf_review_font")) as FontOption | null;
    const initial = saved && ["tech", "editorial", "grotesk"].includes(saved) ? saved : "tech";
    setActiveFont(initial);
    applyFontToDOM(initial);
    onFontChange?.(initial);
  }, []);

  const handleSelectFont = (font: FontOption) => {
    setActiveFont(font);
    if (typeof window !== "undefined") {
      localStorage.setItem("tf_review_font", font);
    }
    applyFontToDOM(font);
    onFontChange?.(font);
  };

  const applyFontToDOM = (font: FontOption) => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-tf-font", font);
      document.body.setAttribute("data-tf-font", font);
    }
  };

  return (
    <div className="tf-review-bar" role="region" aria-label="3fig Internal Review Controls">
      <div className="tf-review-bar-inner">
        {/* Version Switcher */}
        <div className="tf-review-group">
          <span className="tf-review-label">VERSION:</span>
          <div className="tf-review-pill-group">
            <Link
              href="/teaser4"
              className={`tf-review-pill ${currentVersion === "v4" ? "is-active" : ""}`}
              title="Enhanced Revision of Current Site"
            >
              <span className="tf-review-pill-dot" />
              Ver A. Revision
            </Link>
            <Link
              href="/teaser5"
              className={`tf-review-pill ${currentVersion === "v5" ? "is-active" : ""}`}
              title="Brand New Bio-Tech Luxury Concept"
            >
              <span className="tf-review-pill-dot" />
              Ver B. New Concept
            </Link>
          </div>
        </div>

        {/* Font Switcher */}
        <div className="tf-review-group">
          <span className="tf-review-label">FONTS (LIVE TEST):</span>
          <div className="tf-review-pill-group">
            <button
              type="button"
              className={`tf-review-pill ${activeFont === "tech" ? "is-active" : ""}`}
              onClick={() => handleSelectFont("tech")}
              title="Font 1: Tech Precision (Plus Jakarta Sans) — Sleek Silicon Valley Bio-Tech"
            >
              1. Tech Precision
            </button>
            <button
              type="button"
              className={`tf-review-pill ${activeFont === "editorial" ? "is-active" : ""}`}
              onClick={() => handleSelectFont("editorial")}
              title="Font 2: Editorial Luxury (Newsreader / Roman Serif) — Instagram 'NOT MORE DATA' Vibe"
            >
              2. Editorial Luxury
            </button>
            <button
              type="button"
              className={`tf-review-pill ${activeFont === "grotesk" ? "is-active" : ""}`}
              onClick={() => handleSelectFont("grotesk")}
              title="Font 3: Modern Bio-Grotesk (Space Grotesk) — Progressive Architectural Wearable"
            >
              3. Modern Grotesk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
