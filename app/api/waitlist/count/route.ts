import { NextResponse } from "next/server";
import {
  getSimulatedWaitlistCount,
  CAMPAIGN_END_MS,
  CAMPAIGN_START_MS,
} from "@/lib/threefig/waitlist-counter";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = getSimulatedWaitlistCount();

  return NextResponse.json(
    {
      ...data,
      timestamp: Date.now(),
      startTime: new Date(CAMPAIGN_START_MS).toISOString(),
      targetTime: new Date(CAMPAIGN_END_MS).toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    }
  );
}
