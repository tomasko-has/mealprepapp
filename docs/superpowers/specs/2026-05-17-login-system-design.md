# Login System Design Spec

## Overview

Implement customer login for ORA Nutrition using Shopify Customer Account API (OAuth). Customers are created automatically during Shopify checkout. Login is only for existing customers to access their account page and manage their subscription.

## User Flow

### New Customer (no account yet)
1. Visits site → clicks "Get Started" → wizard → menu → checkout
2. Shopify creates customer account during checkout
3. Customer receives activation email from Shopify → sets password
4. Can now log in

### Existing Customer
1. Clicks "Login" in navbar
2. Redirected to Shopify Customer Account login page
3. Enters email + password
4. Shopify redirects back to app with authorization code
5. App exchanges code for access token, stores in HTTP-only cookie
6. Customer redirected to `/account`

### Logout
1. Clicks "Logout" on account page
2. Cookie deleted, redirected to homepage

## Auth Architecture

### OAuth Flow (Shopify Customer Account API)

```
User clicks "Login"
    ↓
GET /api/auth/login
    - Generates random state + nonce
    - Stores state in cookie for CSRF protection
    - Redirects to Shopify authorize URL with:
      - client_id (SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID)
      - redirect_uri (/api/auth/callback)
      - scope (openid email customer-account-api:full)
      - state, nonce
    ↓
Shopify login page (hosted by Shopify)
    - Customer enters email + password
    - Shopify validates credentials
    ↓
Redirect to GET /api/auth/callback?code=xxx&state=yyy
    - Validates state matches cookie (CSRF check)
    - Exchanges authorization code for access token via POST to Shopify token endpoint
    - Sets HTTP-only cookie with access token
    - Redirects to /account
    ↓
/account page loads
    - Middleware checks cookie exists
    - Page fetches customer data using access token via Customer Account API
```

### Session Management

- Access token stored in HTTP-only, Secure, SameSite=Lax cookie
- No database or session store needed
- Token validated by Shopify API on each request to /account
- Cookie expires when token expires (Shopify tokens last ~1 hour)
- Refresh token stored alongside access token for silent renewal

### Protected Routes

Next.js middleware checks for auth cookie on `/account` routes:
- Cookie present → allow request
- Cookie missing → redirect to `/api/auth/login`

## Account Page (`/account`)

Displays after successful login:

- **Customer info** — name, email (from Shopify customer data)
- **Current plan** — Standard or Flexible, meals per day, days per week
- **Subscription status** — active / paused / cancelled
- **"Select meals for next week"** button — only for flexible plan, links to `/menu`
- **"Pause subscription"** / **"Cancel subscription"** buttons
- **"Logout"** button

Plan details and subscription status are read from customer metafields and subscription data via Customer Account API.

## Files to Create

- `lib/shopify-auth.ts` — OAuth helper functions (authorize URL builder, token exchange, token refresh)
- `lib/shopify-customer.ts` — Customer Account API queries (profile, subscriptions)
- `app/api/auth/login/route.ts` — Initiates OAuth flow, redirects to Shopify
- `app/api/auth/callback/route.ts` — Handles OAuth callback, sets cookie
- `app/api/auth/logout/route.ts` — Clears cookie, redirects to homepage
- `app/account/page.tsx` — Account page (server component wrapper)
- `app/account/account-content.tsx` — Account page client content
- `middleware.ts` — Route protection for /account

## Files to Modify

- Navbar component — add Login/Logout button based on auth state

## Environment Variables (Existing)

```
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID=xxx  # Already in .env.local
```

## Environment Variables (New)

```
SHOPIFY_CUSTOMER_ACCOUNT_AUTH_URL=https://shopify.com/authentication/{shop_id}/oauth/authorize
SHOPIFY_CUSTOMER_ACCOUNT_TOKEN_URL=https://shopify.com/authentication/{shop_id}/oauth/token
APP_URL=http://localhost:3000  # Production: https://yourdomain.com
```

## Out of Scope

- Custom login UI (using Shopify hosted login page)
- Registration flow (handled by Shopify checkout)
- Password reset (handled by Shopify)
- Subscription modification logic (separate spec — account management)
- Admin dashboard

## Dependencies

- Shopify Customer Account API must be enabled in Shopify admin
- Customer Account API client ID already configured in .env.local
- Customers must be created via checkout before they can log in
