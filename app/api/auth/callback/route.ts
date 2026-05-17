import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { exchangeCodeForTokens } from "@/lib/shopify-auth";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const isSecure = APP_URL.startsWith("https");

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(`${APP_URL}/login?error=missing_params`);
  }

  const storedState = request.cookies.get("oauth_state")?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${APP_URL}/login?error=invalid_state`);
  }

  const codeVerifier = request.cookies.get("code_verifier")?.value;
  if (!codeVerifier) {
    return NextResponse.redirect(`${APP_URL}/login?error=missing_verifier`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code, codeVerifier);

    const response = NextResponse.redirect(`${APP_URL}/account`);

    response.cookies.set("shop_access_token", tokens.access_token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: tokens.expires_in,
    });

    response.cookies.set("shop_refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    response.cookies.set("shop_id_token", tokens.id_token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: tokens.expires_in,
    });

    response.cookies.delete("code_verifier");
    response.cookies.delete("oauth_state");
    response.cookies.delete("oauth_nonce");

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(`${APP_URL}/login?error=token_exchange`);
  }
}
