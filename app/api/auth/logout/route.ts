import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));

  response.cookies.delete("shop_access_token");
  response.cookies.delete("shop_refresh_token");
  response.cookies.delete("shop_id_token");

  return response;
}
