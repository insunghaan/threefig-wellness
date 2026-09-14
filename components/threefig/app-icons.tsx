"use client";
import { useId, type SVGProps } from "react";

type SymbolProps = SVGProps<SVGSVGElement> & { size?: number | string };

// Apple system artwork, used only in this iOS-only internal UI prototype.
// Alpha masks retain currentColor and the native optical proportions at every size.
function symbol(name: string, selectedName = name) {
  function SystemSymbol({ size = 24, className = "", ...props }: SymbolProps) {
    const id = useId().replace(/:/g, "");
    return (
      <svg width={size} height={size} viewBox="0 0 28 28" fill="none"
        aria-hidden="true" focusable="false" {...props}
        className={`app-symbol ${className}`} data-symbol={name}>
        <defs>
          <mask id={`${id}-regular`} x="0" y="0" width="28" height="28" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }}>
            <image href={`/icons/sf-symbols/${name}.png`} width="28" height="28" />
          </mask>
          {selectedName !== name && (
            <mask id={`${id}-selected`} x="0" y="0" width="28" height="28" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }}>
              <image href={`/icons/sf-symbols/${selectedName}.png`} width="28" height="28" />
            </mask>
          )}
        </defs>
        <rect className={selectedName !== name ? "symbol-regular" : undefined} width="28" height="28" fill="currentColor" mask={`url(#${id}-regular)`} />
        {selectedName !== name && <rect className="symbol-selected" width="28" height="28" fill="currentColor" mask={`url(#${id}-selected)`} />}
      </svg>
    );
  }
  SystemSymbol.displayName = `SystemSymbol(${name})`;
  return SystemSymbol;
}
export const ArrowLeft = symbol("arrow.left");
export const ArrowRight = symbol("arrow.right");
export const ArrowUpRight = symbol("arrow.up.right");
export const Check = symbol("checkmark");
export const ChevronRight = symbol("chevron.right");
export const Circle = symbol("circle.circle", "circle.circle.fill");
export const Sun = symbol("sun.max", "sun.max.fill");
export const Activity = symbol("waveform.path", "waveform");
export const UserRound = symbol("person.crop.circle", "person.crop.circle.fill");
export const Plus = symbol("plus");
export const BatteryFull = symbol("battery.100percent");
export const Bluetooth = symbol("antenna.radiowaves.left.and.right");
export const Moon = symbol("moon");
export const Camera = symbol("camera");
export const ImagePlus = symbol("photo.badge.plus");
export const ScanLine = symbol("viewfinder");
export const Trash2 = symbol("trash");
export const X = symbol("xmark");
