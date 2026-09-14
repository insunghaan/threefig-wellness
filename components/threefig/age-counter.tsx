"use client";
import { useEffect, useState } from "react";

export function AgeCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let started: number | undefined;
    const finish = () => {
      cancelAnimationFrame(frame);
      setDisplay(value);
    };
    const tick = (time: number) => {
      started ??= time;
      const progress = Math.min((time - started) / 1800, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(progress === 1 ? value : value * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    const onPreferenceChange = () => {
      if (preference.matches) finish();
    };
    if (preference.matches) finish();
    else {
      setDisplay(0);
      frame = requestAnimationFrame(tick);
    }
    preference.addEventListener("change", onPreferenceChange);
    return () => {
      cancelAnimationFrame(frame);
      preference.removeEventListener("change", onPreferenceChange);
    };
  }, [value]);

  return (
    <span className="age-counter">
      <span className="sr-only">{value.toFixed(1)}</span>
      <span aria-hidden="true">{display.toFixed(1)}</span>
    </span>
  );
}
