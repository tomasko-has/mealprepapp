# Login System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement customer login using Shopify Customer Account API OAuth (PKCE flow), with session cookies, route protection, and an account page showing customer profile and subscription status.

**Architecture:** `/api/auth/login` initiates OAuth PKCE flow → Shopify hosted login → `/api/auth/callback` exchanges code for tokens → stores in HTTP-only cookies → `proxy.ts` protects `/account` route → account page fetches customer data via Customer Account API GraphQL.

**Tech Stack:** Next.js 16, Shopify Customer Account API (OAuth 2.0 PKCE + GraphQL), TypeScript, Tailwind CSS 4

**Key details:**
- Shop ID: `104034631944`
- Customer Account Client ID: from `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` env var
- Auth URL: `https://shopify.com/authentication/104034631944/oauth/authorize`
- Token URL: `https://shopify.com/authentication/104034631944/oauth/token`
- Logout URL: `https://shopify.com/authentication/104034631944/logout`
- Customer API endpoint: `https://oranutrition.myshopify.com/account/customer/api/2025-04/graphql`
- Scopes: `openid email customer-account-api:full`
- Next.js 16 uses `proxy.ts` (not `middleware.ts`) with `export function proxy()` (not `export default`)

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `lib/shopify-auth.ts` | OAuth helpers: PKCE generation, authorize URL, token exchange, token refresh |
| Create | `app/api/auth/login/route.ts` | GET — generates PKCE, stores verifier in cookie, redirects to Shopify |
| Create | `app/api/auth/callback/route.ts` | GET — validates state, exchanges code for tokens, sets session cookies, redirects to /account |
| Create | `app/api/auth/logout/route.ts` | GET — clears cookies, redirects to homepage |
| Create | `lib/shopify-customer.ts` | Customer Account API GraphQL queries (profile, orders) |
| Create | `app/account/page.tsx` | Server component wrapper with Suspense |
| Create | `app/account/account-content.tsx` | Client component — fetches and displays customer data |
| Create | `app/api/auth/customer/route.ts` | GET — server-side proxy to fetch customer data using cookie token |
| Create | `proxy.ts` | Route protection — redirects unauthenticated users from /account to login |
| Modify | `components/navbar.tsx` | Show Login/Logout based on auth state |

---

### Task 1: OAuth Helper Library — `lib/shopify-auth.ts`

**Files:**
- Create: `lib/shopify-auth.ts`

- [ ] **Step 1: Create the auth helper file with PKCE and OAuth functions**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add lib/shopify-auth.ts
git commit -m "feat: add Shopify Customer Account API OAuth helpers with PKCE"
```

---

### Task 2: Login Route — `app/api/auth/login/route.ts`

**Files:**
- Create: `app/api/auth/login/route.ts`

- [ ] **Step 1: Create the login route that initiates OAuth**

```typescript
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

  // Store PKCE verifier and state in cookies for the callback to use
  response.cookies.set("code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 300, // 5 minutes — enough for the OAuth flow
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
```

- [ ] **Step 2: Commit**

```bash
git add app/api/auth/login/route.ts
git commit -m "feat: add /api/auth/login route — initiates Shopify OAuth PKCE flow"
```

---

### Task 3: Callback Route — `app/api/auth/callback/route.ts`

**Files:**
- Create: `app/api/auth/callback/route.ts`

- [ ] **Step 1: Create the callback route that exchanges code for tokens**

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { exchangeCodeForTokens } from "@/lib/shopify-auth";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // Validate required params
  if (!code || !state) {
    return NextResponse.redirect(new URL("/login?error=missing_params", request.url));
  }

  // Validate state matches cookie (CSRF protection)
  const storedState = request.cookies.get("oauth_state")?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(new URL("/login?error=invalid_state", request.url));
  }

  // Get code verifier from cookie
  const codeVerifier = request.cookies.get("code_verifier")?.value;
  if (!codeVerifier) {
    return NextResponse.redirect(new URL("/login?error=missing_verifier", request.url));
  }

  try {
    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code, codeVerifier);

    const response = NextResponse.redirect(new URL("/account", request.url));

    // Store access token in HTTP-only cookie
    response.cookies.set("shop_access_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: tokens.expires_in, // ~7200 seconds (2 hours)
    });

    // Store refresh token (longer-lived)
    response.cookies.set("shop_refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Store ID token for logout
    response.cookies.set("shop_id_token", tokens.id_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: tokens.expires_in,
    });

    // Clean up OAuth flow cookies
    response.cookies.delete("code_verifier");
    response.cookies.delete("oauth_state");
    response.cookies.delete("oauth_nonce");

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(new URL("/login?error=token_exchange", request.url));
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/auth/callback/route.ts
git commit -m "feat: add /api/auth/callback route — exchanges code for tokens, sets session cookies"
```

---

### Task 4: Logout Route — `app/api/auth/logout/route.ts`

**Files:**
- Create: `app/api/auth/logout/route.ts`

- [ ] **Step 1: Create the logout route**

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOGOUT_URL } from "@/lib/shopify-auth";

export async function GET(request: NextRequest) {
  const idToken = request.cookies.get("shop_id_token")?.value;

  const response = NextResponse.redirect(new URL("/", request.url));

  // Clear all auth cookies
  response.cookies.delete("shop_access_token");
  response.cookies.delete("shop_refresh_token");
  response.cookies.delete("shop_id_token");

  return response;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/auth/logout/route.ts
git commit -m "feat: add /api/auth/logout route — clears session cookies"
```

---

### Task 5: Route Protection — `proxy.ts`

**Files:**
- Create: `proxy.ts` (project root)

- [ ] **Step 1: Create proxy.ts for route protection**

Note: Next.js 16 uses `proxy.ts` instead of `middleware.ts`. The exported function must be named `proxy` (not default export).

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /account routes
  if (pathname.startsWith("/account")) {
    const accessToken = request.cookies.get("shop_access_token")?.value;
    const refreshToken = request.cookies.get("shop_refresh_token")?.value;

    // No tokens at all — redirect to login
    if (!accessToken && !refreshToken) {
      return NextResponse.redirect(new URL("/api/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*"],
};
```

- [ ] **Step 2: Commit**

```bash
git add proxy.ts
git commit -m "feat: add proxy.ts route protection for /account"
```

---

### Task 6: Customer API Client — `lib/shopify-customer.ts`

**Files:**
- Create: `lib/shopify-customer.ts`

- [ ] **Step 1: Create Customer Account API query functions**

```typescript
const SHOP_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-04";
const CUSTOMER_API_URL = `https://${SHOP_DOMAIN}/account/customer/api/${API_VERSION}/graphql`;

const CUSTOMER_QUERY = `#graphql
  query GetCustomer {
    customer {
      id
      displayName
      firstName
      lastName
      emailAddress {
        emailAddress
      }
    }
  }
`;

const ORDERS_QUERY = `#graphql
  query GetOrders {
    customer {
      orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            name
            processedAt
            totalPrice {
              amount
              currencyCode
            }
            fulfillments(first: 1) {
              edges {
                node {
                  status
                }
              }
            }
          }
        }
      }
    }
  }
`;

export interface CustomerProfile {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface CustomerOrder {
  id: string;
  name: string;
  processedAt: string;
  totalPrice: { amount: string; currencyCode: string };
  fulfillmentStatus: string | null;
}

async function customerQuery<T>(
  accessToken: string,
  query: string
): Promise<T | null> {
  const res = await fetch(CUSTOMER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    console.error("Customer API error:", res.status, await res.text());
    return null;
  }

  const json = await res.json();
  if (json.errors) {
    console.error("Customer API GraphQL errors:", json.errors);
    return null;
  }

  return json.data;
}

export async function getCustomerProfile(
  accessToken: string
): Promise<CustomerProfile | null> {
  const data = await customerQuery<{
    customer: {
      id: string;
      displayName: string;
      firstName: string;
      lastName: string;
      emailAddress: { emailAddress: string };
    };
  }>(accessToken, CUSTOMER_QUERY);

  if (!data?.customer) return null;

  const c = data.customer;
  return {
    id: c.id,
    displayName: c.displayName,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.emailAddress.emailAddress,
  };
}

export async function getCustomerOrders(
  accessToken: string
): Promise<CustomerOrder[]> {
  const data = await customerQuery<{
    customer: {
      orders: {
        edges: {
          node: {
            id: string;
            name: string;
            processedAt: string;
            totalPrice: { amount: string; currencyCode: string };
            fulfillments: {
              edges: { node: { status: string } }[];
            };
          };
        }[];
      };
    };
  }>(accessToken, ORDERS_QUERY);

  if (!data?.customer?.orders) return [];

  return data.customer.orders.edges.map((edge) => ({
    id: edge.node.id,
    name: edge.node.name,
    processedAt: edge.node.processedAt,
    totalPrice: edge.node.totalPrice,
    fulfillmentStatus:
      edge.node.fulfillments.edges[0]?.node.status ?? null,
  }));
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/shopify-customer.ts
git commit -m "feat: add Customer Account API client with profile and orders queries"
```

---

### Task 7: Customer API Proxy Route — `app/api/auth/customer/route.ts`

**Files:**
- Create: `app/api/auth/customer/route.ts`

The account page is a client component. It needs to fetch customer data from the server because the access token is in an HTTP-only cookie (not accessible from client JS). This route acts as a proxy.

- [ ] **Step 1: Create the server-side proxy route for customer data**

```typescript
import { cookies } from "next/headers";
import { getCustomerProfile, getCustomerOrders } from "@/lib/shopify-customer";
import { refreshAccessToken } from "@/lib/shopify-auth";

export async function GET() {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("shop_access_token")?.value;
  const refreshToken = cookieStore.get("shop_refresh_token")?.value;

  // Try to refresh if access token is missing but refresh token exists
  if (!accessToken && refreshToken) {
    try {
      const tokens = await refreshAccessToken(refreshToken);
      accessToken = tokens.access_token;

      // We can't set cookies directly in a GET route handler response
      // that returns JSON. Instead, we'll use the new token for this request
      // and the next proxy check will trigger a proper refresh.
    } catch {
      return Response.json({ error: "Session expired" }, { status: 401 });
    }
  }

  if (!accessToken) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const [profile, orders] = await Promise.all([
    getCustomerProfile(accessToken),
    getCustomerOrders(accessToken),
  ]);

  if (!profile) {
    return Response.json({ error: "Failed to fetch customer data" }, { status: 500 });
  }

  return Response.json({ profile, orders });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/auth/customer/route.ts
git commit -m "feat: add /api/auth/customer proxy route for client-side customer data fetching"
```

---

### Task 8: Account Page — `app/account/page.tsx` and `app/account/account-content.tsx`

**Files:**
- Create: `app/account/page.tsx`
- Create: `app/account/account-content.tsx`

- [ ] **Step 1: Create the server component wrapper**

```tsx
import { Suspense } from "react";
import AccountContent from "./account-content";

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] bg-[#e8e8e4]" />}>
      <AccountContent />
    </Suspense>
  );
}
```

- [ ] **Step 2: Create the account content client component**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CustomerProfile, CustomerOrder } from "@/lib/shopify-customer";

export default function AccountContent() {
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCustomerData() {
      try {
        const res = await fetch("/api/auth/customer");

        if (res.status === 401) {
          router.push("/api/auth/login");
          return;
        }

        if (!res.ok) {
          setError("Failed to load account data");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setProfile(data.profile);
        setOrders(data.orders ?? []);
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchCustomerData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[80vh] bg-[#e8e8e4] py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-48" />
            <div className="h-32 bg-gray-300 rounded-2xl" />
            <div className="h-32 bg-gray-300 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-[80vh] bg-[#e8e8e4] py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Could not load your account"}
          </h1>
          <Link
            href="/api/auth/login"
            className="text-primary font-semibold hover:underline"
          >
            Try logging in again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-[#e8e8e4] py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <a
            href="/api/auth/logout"
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            Logout
          </a>
        </div>

        {/* Profile */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Profile</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="text-gray-900 font-medium">{profile.displayName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="text-gray-900 font-medium">{profile.email}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Your Plan</h2>
          <p className="text-sm text-gray-500 mb-4">
            Manage your meal plan subscription and select meals for next week.
          </p>
          <Link
            href="/menu"
            className="inline-block bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            Select Meals for Next Week
          </Link>
        </div>

        {/* Recent Orders */}
        {orders.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Recent Orders</h2>
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {order.name}
                    </span>
                    <p className="text-xs text-gray-500">
                      {new Date(order.processedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    &euro;{parseFloat(order.totalPrice.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/account/page.tsx app/account/account-content.tsx
git commit -m "feat: add account page with customer profile and orders"
```

---

### Task 9: Update Navbar — Login/Logout State

**Files:**
- Modify: `components/navbar.tsx`

- [ ] **Step 1: Update navbar to show Login or account link based on cookie**

The navbar is a server component. We can check for the auth cookie server-side using `cookies()` from `next/headers`.

```tsx
import Link from "next/link";
import { cookies } from "next/headers";

export default async function Navbar({ shopName = "ORA" }: { shopName?: string }) {
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get("shop_access_token")?.value ||
    !!cookieStore.get("shop_refresh_token")?.value;

  return (
    <nav className="sticky top-0 z-50 bg-white border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="text-2xl font-bold text-gray-900 shrink-0">
            ORA<span className="text-primary">N</span>utrition<span className="text-primary">.</span>
          </Link>
          <div className="hidden md:flex items-center gap-0 h-full">
            <a href="/#menu" className="h-full flex items-center px-5 text-sm font-medium text-gray-600 hover:bg-primary-light hover:text-gray-900 border-b-2 border-transparent hover:border-primary transition-all">
              Weekly Menu
            </a>
            <Link href="/get-started" className="h-full flex items-center px-5 text-sm font-medium text-gray-600 hover:bg-primary-light hover:text-gray-900 border-b-2 border-transparent hover:border-primary transition-all">
              Our Plans
            </Link>
            <Link href="/how-it-works" className="h-full flex items-center px-5 text-sm font-medium text-gray-600 hover:bg-primary-light hover:text-gray-900 border-b-2 border-transparent hover:border-primary transition-all">
              How It Works
            </Link>
            <Link href="/about" className="h-full flex items-center px-5 text-sm font-medium text-gray-600 hover:bg-primary-light hover:text-gray-900 border-b-2 border-transparent hover:border-primary transition-all">
              About Us
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {isLoggedIn ? (
              <>
                <Link
                  href="/account"
                  className="border border-gray-300 text-gray-700 px-5 py-2 rounded-full text-sm font-semibold hover:border-gray-400 transition-colors"
                >
                  My Account
                </Link>
                <a
                  href="/api/auth/logout"
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  Logout
                </a>
              </>
            ) : (
              <>
                <Link
                  href="/api/auth/login"
                  className="border border-gray-300 text-gray-700 px-5 py-2 rounded-full text-sm font-semibold hover:border-gray-400 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/get-started"
                  className="bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
          <Link
            href="/get-started"
            className="md:hidden bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/navbar.tsx
git commit -m "feat: update navbar to show Login/My Account based on auth state"
```

---

### Task 10: Add APP_URL Environment Variable

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Add APP_URL to .env.local**

Add at the end of `.env.local`:

```
# App URL (used for OAuth redirect URI)
APP_URL=http://localhost:3000
```

- [ ] **Step 2: Add redirect URI in Shopify admin**

In Shopify admin → Settings → Customer accounts → (or via the Customer Account API settings):
- Add `http://localhost:3000/api/auth/callback` as an allowed redirect URI
- For production, also add `https://yourdomain.com/api/auth/callback`

- [ ] **Step 3: Commit**

```bash
git add .env.local
git commit -m "feat: add APP_URL env var for OAuth redirect URI"
```

---

### Task 11: Update Login Page — Redirect to OAuth

**Files:**
- Modify: `app/login/page.tsx`

- [ ] **Step 1: Update the login page to redirect or show a login button**

```tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get("shop_access_token")?.value ||
    !!cookieStore.get("shop_refresh_token")?.value;

  if (isLoggedIn) {
    redirect("/account");
  }

  return (
    <div className="min-h-[80vh] bg-[#e8e8e4] flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-sm text-gray-500 mb-6">
          Log in to manage your meal plan subscription.
        </p>
        <a
          href="/api/auth/login"
          className="block w-full bg-primary text-white py-3 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          Log In with Shopify
        </a>
        <p className="mt-4 text-xs text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/get-started" className="text-primary hover:underline">
            Get Started
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/login/page.tsx
git commit -m "feat: update login page with Shopify OAuth button"
```

---

### Task 12: End-to-End Verification

- [ ] **Step 1: Build check**

```bash
npx tsc --noEmit
npm run build
```

Verify no type errors and all routes compile.

- [ ] **Step 2: Test the login flow**

1. Start dev server: `npm run dev`
2. Visit `localhost:3000`
3. Click "Login" in navbar → should redirect to Shopify login page
4. Log in with a test customer account (must have been created via checkout first)
5. After login → should redirect to `/account` with profile info
6. Click "Logout" → should redirect to homepage, navbar shows "Login" again

- [ ] **Step 3: Test route protection**

1. Clear cookies (or use incognito)
2. Visit `localhost:3000/account` directly
3. Should redirect to Shopify login page (via proxy.ts → /api/auth/login)

- [ ] **Step 4: Final commit with any fixes**

```bash
git add -A
git commit -m "feat: complete login system — OAuth, session, route protection, account page"
```
