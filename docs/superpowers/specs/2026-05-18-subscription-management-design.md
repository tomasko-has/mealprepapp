# Subscription Management on Account Page — Design Spec

## Goal

Show the logged-in customer their active subscription on the account page and allow them to cancel it. Based on the ORA Nutrition business structure PDF.

## What the Customer Sees

### Account Page (`/account`)

The existing account page gets a new **"Your Subscription"** section between Profile and Recent Orders. It shows:

**When customer has an active subscription:**
- Plan name (e.g., "ORA Standard Plan")
- Number of meals (from subscription line item name, e.g., "12 meals")
- Price per week (e.g., "€129.98 / week")
- Discount if applicable (e.g., "20% off")
- Status badge (Active / Paused / Cancelled)
- Next billing date (e.g., "Next renewal: May 25, 2026")
- "Select Meals for Next Week" button (links to `/menu`) — already exists
- "Cancel Subscription" button (red, with confirmation dialog)

**When customer has no subscription:**
- Message: "You don't have an active subscription yet."
- "Get Started" button linking to `/get-started`

**Cancel flow:**
1. Customer clicks "Cancel Subscription"
2. Confirmation dialog: "Are you sure? Your subscription will be cancelled and no further deliveries will be made."
3. On confirm → call cancel mutation → show success message → update status to "Cancelled"

## Technical Architecture

### Data Source

Shopify Customer Account API (GraphQL) — the same API we already use for profile and orders. Subscription contract fields are available since API version 2024-10.

**Endpoint:** `https://shopify.com/{shop_id}/account/customer/api/2025-04/graphql`
**Auth:** Access token directly in Authorization header (no Bearer prefix)

### GraphQL Queries

**Fetch subscriptions:**
```graphql
query GetSubscriptions {
  customer {
    subscriptionContracts(first: 10) {
      nodes {
        id
        status
        createdAt
        nextBillingDate
        deliveryPrice {
          amount
          currencyCode
        }
        billingPolicy {
          interval
          intervalCount {
            count
            precision
          }
        }
        lines(first: 10) {
          nodes {
            id
            name
            quantity
            currentPrice {
              amount
              currencyCode
            }
          }
        }
        discounts(first: 5) {
          nodes {
            title
            value {
              __typename
              ... on SubscriptionDiscountPercentageValue {
                percentage
              }
              ... on SubscriptionDiscountFixedAmountValue {
                amount {
                  amount
                  currencyCode
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

**Cancel subscription:**
```graphql
mutation CancelSubscription($subscriptionContractId: ID!) {
  subscriptionContractCancel(subscriptionContractId: $subscriptionContractId) {
    contract {
      id
      status
    }
    userErrors {
      field
      message
    }
  }
}
```

### Files to Create/Modify

**Modify:**
- `lib/shopify-customer.ts` — add `getCustomerSubscriptions()` and `cancelSubscription()` functions
- `app/api/auth/customer/route.ts` — include subscription data in the response
- `app/account/account-content.tsx` — add subscription section UI

**Create:**
- `app/api/auth/subscription/cancel/route.ts` — POST endpoint to cancel a subscription

### API Endpoints

**GET `/api/auth/customer`** (existing, extended):
- Returns `{ profile, orders, subscriptions }` instead of `{ profile, orders }`
- `subscriptions` is an array of subscription contract objects

**POST `/api/auth/subscription/cancel`**:
- Body: `{ subscriptionContractId: string }`
- Reads access token from cookie
- Calls `subscriptionContractCancel` mutation
- Returns `{ success: true }` or `{ error: string }`

### Data Types

```typescript
interface Subscription {
  id: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED" | "EXPIRED" | "FAILED";
  createdAt: string;
  nextBillingDate: string | null;
  planName: string;       // from lines[0].name
  quantity: number;       // from lines[0].quantity
  pricePerPeriod: string; // from lines[0].currentPrice.amount
  currencyCode: string;
  billingInterval: string;  // e.g., "WEEK"
  billingIntervalCount: number;
  discount: {
    title: string;
    percentage?: number;
    fixedAmount?: string;
  } | null;
}
```

## What This Does NOT Include

- Changing plan type (Standard ↔ Flexible) — future feature
- Changing meal count — future feature
- Pausing subscription — future feature
- Weekly meal selection time window logic — `/menu` already handles meal selection
- Email notifications — handled by Shopify or external email service
