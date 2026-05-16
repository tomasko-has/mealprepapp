# Checkout System Design Spec

## Overview

Implement the checkout flow for ORA Nutrition: create a Shopify cart with the selected plan (as a subscription via selling plans), meals, add-ons, and user preferences, then redirect to Shopify hosted checkout. After purchase, a webhook syncs preferences to the customer profile.

## Current State

- Wizard collects preferences and stores in localStorage (`wizardSelections`)
- `/menu` page allows meal selection (flexible) or shows pre-assigned meals (standard)
- Add-ons popup lets user pick breakfast/snacks
- `/menu/summary` shows order review with "Proceed to Checkout" button (currently non-functional)
- Order data stored in localStorage (`orderData`)
- Storefront API client exists (`lib/shopify.ts`)

## Shopify Setup Required (Manual)

### 1. Create Plan Products

Two products on Shopify with selling plans:

- **"ORA Standard Plan"** — requires selling plan, weekly subscription, price = discounted weekly total (e.g. €162.00 for 15 meals with 20% off)
- **"ORA Flexible Plan"** — requires selling plan, weekly subscription, price = full weekly total

Each product needs multiple variants for different meal counts (e.g. 5 meals, 10 meals, 12 meals, 14 meals, 15 meals, 18 meals, 21 meals) to match mealsPerDay × daysPerWeek combinations.

### 2. Create Selling Plan Group

Via Shopify admin or Shopify Subscriptions app:
- Name: "Weekly Subscription"
- Billing policy: recurring, every 1 week
- Delivery policy: recurring, every 1 week
- Assign to both plan products

### 3. Enable Webhook

In Shopify admin → Notifications → Webhooks:
- Event: `orders/create`
- URL: `https://yourdomain.com/api/webhooks/order-created`
- Format: JSON

## Architecture

```
Summary Page ("Proceed to Checkout" click)
    ↓
API Route: POST /api/cart
    - Reads order data from request body
    - Creates Shopify cart via Storefront API cartCreate mutation
    - Cart line: plan product variant + sellingPlanId
    - Cart line(s): individual add-on products (no selling plan)
    - Cart attributes: wizard preferences (goals, avoid, mealsPerDay, daysPerWeek)
    - Cart note: selected meal IDs + quantities (JSON)
    - Returns checkoutUrl
    ↓
Redirect to Shopify Checkout
    - Customer enters name, email, address, payment
    - Promo code field available natively
    ↓
Shopify processes payment, creates order + subscription
    ↓
Webhook: POST /api/webhooks/order-created
    - Reads cart attributes from order
    - Saves preferences to customer metafields (via Admin API)
    - Saves selected meals to order metafields (via Admin API)
```

## Implementation Details

### 1. Shopify Queries — `lib/shopify-queries.ts`

New query to fetch plan products with selling plans and variants:

```graphql
query GetPlanProducts {
  products(first: 10, query: "product_type:plan") {
    edges {
      node {
        id
        title
        handle
        variants(first: 30) {
          edges {
            node {
              id
              title
              price { amount currencyCode }
            }
          }
        }
        sellingPlanGroups(first: 5) {
          edges {
            node {
              sellingPlans(first: 5) {
                edges {
                  node {
                    id
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

New mutation for cart creation:

```graphql
mutation cartCreate($input: CartInput!) {
  cartCreate(input: $input) {
    cart {
      id
      checkoutUrl
    }
    userErrors {
      field
      message
    }
  }
}
```

### 2. Cart API Route — `app/api/cart/route.ts`

POST endpoint that:
- Receives order data (plan type, selected meals, add-ons, preferences)
- Finds correct plan product variant based on planType + meal count
- Finds the selling plan ID for weekly subscription
- Calls `cartCreate` with:
  - `lines`: plan variant (with `sellingPlanId`) + add-on product variants (without selling plan)
  - `attributes`: serialized preferences (goals, avoid, mealsPerDay, daysPerWeek, planType)
  - `note`: JSON of selected meal IDs + quantities
- Returns `{ checkoutUrl }` to the client

### 3. Summary Page Update — `app/menu/summary/summary-content.tsx`

Update "Proceed to Checkout" button to:
1. Show subscription disclaimer checkbox (mandatory before proceeding):
   > "I understand that I am subscribing to a meal plan subscription. Active subscriptions are auto-generated every Thursday. Standard plans are automatically renewed weekly. For the flexible plan, meals must be selected each week, otherwise the standard plan will be delivered."
2. On click (with checkbox checked):
   - Show loading state
   - POST to `/api/cart` with order data + preferences from localStorage
   - Redirect to returned `checkoutUrl`

### 4. Webhook Route — `app/api/webhooks/order-created/route.ts`

POST endpoint that:
- Validates Shopify webhook signature (HMAC)
- Parses order payload
- Extracts cart attributes (preferences) and note (meal selections)
- Uses **Admin API** to save:
  - Customer metafields: `custom.goals`, `custom.avoid`, `custom.meals_per_day`, `custom.days_per_week`, `custom.plan_type`
  - Order metafields: `custom.selected_meals` (JSON array of meal IDs + quantities)

### 5. Admin API Client — `lib/shopify-admin.ts`

New client for Admin API (separate from Storefront API):
- Uses Admin API access token (from custom app in Shopify admin)
- Required permissions: `write_customers`, `write_orders`, `read_orders`
- Used by webhook route

### 6. Environment Variables (New)

```
SHOPIFY_ADMIN_API_TOKEN=shpat_xxxxx
SHOPIFY_WEBHOOK_SECRET=whsec_xxxxx
```

## Summary Page Changes

Before checkout button, add:

1. **Delivery info section** — "Delivered every Sunday, Tuesday, Thursday"
2. **Subscription disclaimer** — checkbox + legal text from PDF
3. **Loading state** on button during cart creation

## Files to Create

- `app/api/cart/route.ts` — cart creation endpoint
- `app/api/webhooks/order-created/route.ts` — post-purchase webhook
- `lib/shopify-admin.ts` — Admin API client
- `lib/cart.ts` — cart creation logic (GraphQL mutations, variant matching)

## Files to Modify

- `lib/shopify-queries.ts` — add plan product + selling plan queries
- `app/menu/summary/summary-content.tsx` — disclaimer, checkout button logic, delivery info
- `.env.local` — new env vars

## Out of Scope

- Custom checkout UI (using Shopify hosted checkout)
- Login/auth system (separate spec)
- Account management page (separate spec)
- Email notifications for flexible plan (separate spec)
- Multiple delivery addresses (v2)

## Dependencies

- Shopify admin: plan products with variants and selling plans must be created manually
- Shopify admin: custom app with Admin API token must be created for webhook
- Shopify admin: webhook must be registered
