"use client";

import React from "react";

interface Teaser6FooterProps {
  onOpenPrivacy?: () => void;
}

export function Teaser6Footer({ onOpenPrivacy }: Teaser6FooterProps = {}) {
  return (
    <footer className="teaser6-footer">
      <div className="teaser6-footer-inner">
        <span className="teaser6-footer-copyright">© 2026 3FIG</span>
        <div className="teaser6-footer-links">
          {onOpenPrivacy && (
            <button
              type="button"
              className="teaser6-footer-link"
              onClick={onOpenPrivacy}
            >
              Privacy & Disclaimers
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
