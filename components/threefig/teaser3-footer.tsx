"use client";

import React from "react";

interface Teaser3FooterProps {
  onOpenPrivacy?: () => void;
}

export function Teaser3Footer({ onOpenPrivacy }: Teaser3FooterProps = {}) {
  return (
    <footer className="teaser3-footer">
      <div className="teaser3-footer-inner">
        <span className="teaser3-footer-copyright">© 2026 3fig</span>
      </div>
    </footer>
  );
}
