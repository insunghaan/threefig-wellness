"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type Teaser6FontOption = "manrope" | "geist" | "sora";

interface Teaser6ReviewBarProps {
  currentVersion: "revision" | "concept";
  onFontChange?: (font: Teaser6FontOption) => void;
  isReviewMode?: boolean;
}

export function Teaser6ReviewBar({
  currentVersion,
  onFontChange,
  isReviewMode = true,
}: Teaser6ReviewBarProps) {
  const [activeFont, setActiveFont] = useState<Teaser6FontOption>("manrope");
  const pathname = usePathname();

  useEffect(() => {
    // Restore saved font or default to 'manrope'
    const saved = (typeof window !== "undefined" &&
      localStorage.getItem("3fig-teaser6-font")) as Teaser6FontOption | null;
    const initial =
      saved && ["manrope", "geist", "sora"].includes(saved) ? saved : "manrope";
    setActiveFont(initial);
    applyFontToDOM(initial);
    onFontChange?.(initial);
  }, []);

  const handleSelectFont = (font: Teaser6FontOption) => {
    setActiveFont(font);
    if (typeof window !== "undefined") {
      localStorage.setItem("3fig-teaser6-font", font);
    }
    applyFontToDOM(font);
    onFontChange?.(font);
  };

  const applyFontToDOM = (font: Teaser6FontOption) => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-t6-font", font);
      document.body.setAttribute("data-t6-font", font);
    }
  };

  if (!isReviewMode) return null;

  return (
    <div
      className="t6-review-bar"
      role="region"
      aria-label="3fig Teaser6 Internal Review Controls"
    >
      <div className="t6-review-bar-inner">
        {/* Version Switcher */}
        <div className="t6-review-group">
          <span className="t6-review-label">VERSION:</span>
          <div className="t6-review-pill-group">
            <Link
              href="/teaser6"
              className={`t6-review-pill ${currentVersion === "revision" ? "is-active" : ""}`}
              title="Teaser6 Refined Revision"
            >
              <span className="t6-review-pill-dot" />
              Ver A. Revision (/teaser6)
            </Link>
            <Link
              href="/teaser6/concept"
              className={`t6-review-pill ${currentVersion === "concept" ? "is-active" : ""}`}
              title="Teaser6 New Concept"
            >
              <span className="t6-review-pill-dot" />
              Ver B. New Concept (/teaser6/concept)
            </Link>
          </div>
        </div>

        {/* Font Switcher */}
        <div className="t6-review-group">
          <span className="t6-review-label">LIVE FONTS:</span>
          <div className="t6-review-pill-group">
            <button
              type="button"
              className={`t6-review-pill ${activeFont === "manrope" ? "is-active" : ""}`}
              onClick={() => handleSelectFont("manrope")}
              title="Manrope (Default) — Balanced modern sans with humanist clarity"
            >
              Manrope
            </button>
            <button
              type="button"
              className={`t6-review-pill ${activeFont === "geist" ? "is-active" : ""}`}
              onClick={() => handleSelectFont("geist")}
              title="Geist Sans — Precision tech typography for data & devices"
            >
              Geist Sans
            </button>
            <button
              type="button"
              className={`t6-review-pill ${activeFont === "sora" ? "is-active" : ""}`}
              onClick={() => handleSelectFont("sora")}
              title="Sora — Contemporary geometric clarity with rounded bio-tech rhythm"
            >
              Sora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
