import { NextResponse } from "next/server";
import {
  generatePKCE,
  generateState,
  generateNonce,
  buildAuthorizeUrl,
} from "@/lib/shopify-auth";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const isSecure = APP_URL.startsWith("https");

export async function GET() {
  const { codeVerifier, codeChallenge } = await generatePKCE();
  const state = generateState();
  const nonce = generateNonce();

  const authorizeUrl = buildAuthorizeUrl(codeChallenge, state, nonce);

  const response = NextResponse.redirect(authorizeUrl);

  response.cookies.set("code_verifier", codeVerifier, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 300,
  });

  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 300,
  });

  response.cookies.set("oauth_nonce", nonce, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    maxAge: 300,
  });

  return response;
}
