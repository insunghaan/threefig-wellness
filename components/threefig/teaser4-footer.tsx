"use client";

import React from "react";

interface Teaser4FooterProps {
  onOpenPrivacy?: () => void;
}

export function Teaser4Footer({ onOpenPrivacy }: Teaser4FooterProps = {}) {
  return (
    <footer className="teaser4-footer">
      <div className="teaser4-footer-inner">
        <span className="teaser4-footer-copyright">© 2026 3fig</span>
      </div>
    </footer>
  );
}
