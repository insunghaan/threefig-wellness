export const OPENAI_PIXEL_ID = "R4AXx2xC3cKDDpCqHMqkE8";

type PixelQueue = ((...args: unknown[]) => void) & { q?: unknown[][] };
type PixelWindow = Window & { oaiq?: PixelQueue; _oaiqInitialized?: boolean };

export function initializeOpenAIPixel() {
  if (typeof window === "undefined" || window.location.hostname !== "3fig.io" || window.location.pathname !== "/") return;
  const target = window as PixelWindow;
  if (!target.oaiq) {
    const queue: PixelQueue = (...args) => { queue.q!.push(args); };
    queue.q = [];
    target.oaiq = queue;
  }
  if (!target._oaiqInitialized) {
    target.oaiq("init", { pixelId: OPENAI_PIXEL_ID });
    target._oaiqInitialized = true;
  }
  return target.oaiq;
}

// Called only by generate_lead after the API confirms a newly saved signup.
export function trackOpenAIWaitlistLead() {
  try {
    initializeOpenAIPixel()?.("measure", "lead_created", { type: "customer_action" });
  } catch {
    // Measurement must never interrupt a saved registration or other analytics.
  }
}
