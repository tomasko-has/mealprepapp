import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/account")) {
    const accessToken = request.cookies.get("shop_access_token")?.value;
    const refreshToken = request.cookies.get("shop_refresh_token")?.value;

    if (!accessToken && !refreshToken) {
      return NextResponse.redirect(new URL("/api/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*"],
};
