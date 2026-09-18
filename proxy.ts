import { NextRequest, NextResponse } from "next/server";
import { SITE_URL } from "@/lib/threefig/site";
const aliases = new Set(["www.3fig.io", "threefig-wellness-jn3fn5lewq-uc.a.run.app", "threefig-wellness-459230602183.us-central1.run.app"]);
export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();
  if (["GET", "HEAD"].includes(request.method) && aliases.has(host)) {
    const destination = new URL(SITE_URL);
    destination.pathname = request.nextUrl.pathname;
    destination.search = request.nextUrl.search;
    return NextResponse.redirect(destination, 308);
  }
  return NextResponse.next();
}
export const config = { matcher: ["/((?!api(?:/|$)|_next(?:/|$)).*)"] };
