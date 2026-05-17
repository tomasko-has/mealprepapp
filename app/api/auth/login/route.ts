import { NextResponse } from "next/server";
import {
  generatePKCE,
  generateState,
  generateNonce,
  buildAuthorizeUrl,
} from "@/lib/shopify-auth";

export async function GET() {
  const { codeVerifier, codeChallenge } = await generatePKCE();
  const state = generateState();
  const nonce = generateNonce();

  const authorizeUrl = buildAuthorizeUrl(codeChallenge, state, nonce);

  const response = NextResponse.redirect(authorizeUrl);

  response.cookies.set("code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 300,
  });

  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 300,
  });

  response.cookies.set("oauth_nonce", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 300,
  });

  return response;
}
