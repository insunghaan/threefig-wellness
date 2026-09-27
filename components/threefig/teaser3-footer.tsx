"use client";

import React from "react";

interface Teaser3FooterProps {
  onOpenPrivacy: () => void;
}

export function Teaser3Footer({ onOpenPrivacy }: Teaser3FooterProps) {
  return (
    <footer className="teaser3-footer">
      <div className="teaser3-footer-inner">
        <button
          type="button"
          className="teaser3-footer-privacy-btn"
          onClick={onOpenPrivacy}
        >
          Privacy &amp; Analytics
        </button>
        <span className="teaser3-footer-copyright">© 2026 3FIG</span>
      </div>
    </footer>
  );
}
