import { NextResponse } from "next/server";

const APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function GET() {
  const response = NextResponse.redirect(`${APP_URL}/`);

  response.cookies.delete("shop_access_token");
  response.cookies.delete("shop_refresh_token");
  response.cookies.delete("shop_id_token");

  return response;
}
