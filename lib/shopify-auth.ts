const SHOP_ID = process.env.SHOPIFY_SHOP_ID!;
const CLIENT_ID = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!;
const APP_URL = process.env.APP_URL || "http://localhost:3000";

const AUTH_URL = `https://shopify.com/authentication/${SHOP_ID}/oauth/authorize`;
const TOKEN_URL = `https://shopify.com/authentication/${SHOP_ID}/oauth/token`;
export const LOGOUT_URL = `https://shopify.com/authentication/${SHOP_ID}/logout`;

const REDIRECT_URI = `${APP_URL}/api/auth/callback`;
const SCOPES = "openid email customer-account-api:full";

function base64url(buffer: Uint8Array): string {
  let str = "";
  for (let i = 0; i < buffer.length; i++) {
    str += String.fromCharCode(buffer[i]);
  }
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function generatePKCE(): Promise<{
  codeVerifier: string;
  codeChallenge: string;
}> {
  const verifierBytes = crypto.getRandomValues(new Uint8Array(96));
  const codeVerifier = base64url(verifierBytes);

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const codeChallenge = base64url(new Uint8Array(hashBuffer));

  return { codeVerifier, codeChallenge };
}

export function generateState(): string {
  return base64url(crypto.getRandomValues(new Uint8Array(32)));
}

export function generateNonce(): string {
  return base64url(crypto.getRandomValues(new Uint8Array(32)));
}

export function buildAuthorizeUrl(
  codeChallenge: string,
  state: string,
  nonce: string
): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
    nonce,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      code,
      code_verifier: codeVerifier,
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: CLIENT_ID,
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${text}`);
  }

  return res.json();
}
