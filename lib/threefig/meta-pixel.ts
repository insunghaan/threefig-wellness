export const META_PIXEL_ID = "2935955493422843";

type Pixel = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push?: Pixel;
  loaded: boolean;
  version: string;
};
type PixelWindow = Window & {
  fbq?: Pixel;
  _fbq?: Pixel;
  threefigMetaPixelReady?: boolean;
};

// Keep tracking on the public landing page, never the health prototype or previews.
function landingWindow(): PixelWindow | null {
  if (typeof window === "undefined" || window.location.hostname !== "3fig.io" || window.location.pathname !== "/") return null;
  return window as PixelWindow;
}

export function initializeMetaPixel(): void {
  const target = landingWindow();
  if (!target || target.threefigMetaPixelReady) return;
  if (!target.fbq) {
    const pixel = function (...args: unknown[]) {
      if (pixel.callMethod) pixel.callMethod(...args);
      else pixel.queue.push(args);
    } as Pixel;
    pixel.queue = [];
    pixel.push = pixel;
    pixel.loaded = true;
    pixel.version = "2.0";
    target.fbq = pixel;
    target._fbq ||= pixel;
  }
  // Explicit events only: don't infer events or collect form fields automatically.
  target.fbq("set", "autoConfig", false, META_PIXEL_ID);
  target.fbq("init", META_PIXEL_ID);
  target.fbq("trackSingle", META_PIXEL_ID, "PageView");
  target.threefigMetaPixelReady = true;
}

export function trackMetaWaitlistLead(): void {
  // A blocked/failed analytics SDK must not change a successful signup into an error.
  try {
    initializeMetaPixel();
    landingWindow()?.fbq?.("trackSingle", META_PIXEL_ID, "Lead", {
      content_name: "3FIG waitlist",
    });
  } catch {
    // Registration is already saved; tracking is best effort.
  }
}
