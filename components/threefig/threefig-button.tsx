"use client";

import React, { forwardRef } from "react";

export interface ThreeFigButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "overlay";
  size?: "sm" | "md" | "lg" | "fluid";
  ringAccessory?: React.ReactNode;
  showArrow?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const ThreeFigButton = forwardRef<HTMLButtonElement, ThreeFigButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      ringAccessory,
      showArrow = true,
      isLoading = false,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const variantClass = variant === "overlay" ? "tf-btn-overlay" : "tf-btn-primary";
    const sizeClass = `tf-btn-${size}`;
    const loadingClass = isLoading ? "is-loading" : "";

    return (
      <button
        ref={ref}
        type={props.type || "button"}
        className={`tf-btn ${variantClass} ${sizeClass} ${loadingClass} ${className}`.trim()}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        {...props}
      >
        {ringAccessory && (
          <span className="tf-btn-accessory-slot" aria-hidden="true">
            {ringAccessory}
          </span>
        )}

        <span className="tf-role-button-label">
          {children}
        </span>

        {showArrow && (
          <span className="tf-btn-arrow" aria-hidden="true">
            &rarr;
          </span>
        )}
      </button>
    );
  }
);

ThreeFigButton.displayName = "ThreeFigButton";
