# Subscription Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the customer their active subscription on the account page and let them cancel it.

**Architecture:** Extend the existing Shopify Customer Account API integration (`lib/shopify-customer.ts`) with a subscriptions query and cancel mutation. The existing `/api/auth/customer` route returns subscription data alongside profile/orders. A new `/api/auth/subscription/cancel` route handles cancellation. The account page UI (`account-content.tsx`) renders the subscription section.

**Tech Stack:** Next.js 16, React 19, TypeScript, Shopify Customer Account API (GraphQL), Tailwind CSS 4

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/shopify-customer.ts` | Modify | Add `customerMutation` helper, `getCustomerSubscriptions()`, `cancelSubscription()`, `Subscription` type |
| `app/api/auth/customer/route.ts` | Modify | Include subscriptions in the response |
| `app/api/auth/subscription/cancel/route.ts` | Create | POST endpoint to cancel a subscription |
| `app/account/account-content.tsx` | Modify | Replace static "Your Plan" with dynamic subscription section + cancel flow |

---

### Task 1: Add subscription query and types to shopify-customer.ts

**Files:**
- Modify: `lib/shopify-customer.ts`

- [ ] **Step 1: Add the Subscription interface and GraphQL query**

Add the following after the `CustomerOrder` interface (after line 59) in `lib/shopify-customer.ts`:

```typescript
export interface Subscription {
  id: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED" | "EXPIRED" | "FAILED";
  createdAt: string;
  nextBillingDate: string | null;
  planName: string;
  quantity: number;
  pricePerPeriod: string;
  currencyCode: string;
  billingInterval: string;
  billingIntervalCount: number;
  discount: {
    title: string;
    percentage?: number;
    fixedAmount?: string;
  } | null;
}
```

Add the GraphQL query after the existing `ORDERS_QUERY` constant (after line 43):

```typescript
const SUBSCRIPTIONS_QUERY = `#graphql
  query GetSubscriptions {
    customer {
      subscriptionContracts(first: 10) {
        nodes {
          id
          status
          createdAt
          nextBillingDate
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
`;
```

- [ ] **Step 2: Add a customerMutation helper that supports variables**

The existing `customerQuery` function doesn't accept `variables`. Add a new helper after the `customerQuery` function (after line 92):

```typescript
async function customerMutation<T>(
  accessToken: string,
  query: string,
  variables: Record<string, unknown>
): Promise<T | null> {
  const res = await fetch(CUSTOMER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  const text = await res.text();

  if (!res.ok) {
    console.error("Customer API mutation error:", res.status, text.substring(0, 500));
    return null;
  }

  try {
    const json = JSON.parse(text);
    if (json.errors) {
      console.error("Customer API mutation errors:", json.errors);
      return null;
    }
    return json.data;
  } catch {
    console.error("Customer API mutation returned non-JSON:", text.substring(0, 500));
    return null;
  }
}
```

- [ ] **Step 3: Add the getCustomerSubscriptions function**

Add after the `getCustomerOrders` function (at the end of the file):

```typescript
export async function getCustomerSubscriptions(
  accessToken: string
): Promise<Subscription[]> {
  const data = await customerQuery<{
    customer: {
      subscriptionContracts: {
        nodes: {
          id: string;
          status: string;
          createdAt: string;
          nextBillingDate: string | null;
          billingPolicy: {
            interval: string;
            intervalCount: { count: number; precision: string };
          };
          lines: {
            nodes: {
              id: string;
              name: string;
              quantity: number;
              currentPrice: { amount: string; currencyCode: string };
            }[];
          };
          discounts: {
            nodes: {
              title: string;
              value:
                | { __typename: "SubscriptionDiscountPercentageValue"; percentage: number }
                | { __typename: "SubscriptionDiscountFixedAmountValue"; amount: { amount: string; currencyCode: string } };
            }[];
          };
        }[];
      };
    };
  }>(accessToken, SUBSCRIPTIONS_QUERY);

  if (!data?.customer?.subscriptionContracts) return [];

  return data.customer.subscriptionContracts.nodes.map((node) => {
    const line = node.lines.nodes[0];
    const discountNode = node.discounts.nodes[0] ?? null;

    let discount: Subscription["discount"] = null;
    if (discountNode) {
      discount = {
        title: discountNode.title,
        ...(discountNode.value.__typename === "SubscriptionDiscountPercentageValue"
          ? { percentage: discountNode.value.percentage }
          : { fixedAmount: discountNode.value.amount.amount }),
      };
    }

    return {
      id: node.id,
      status: node.status as Subscription["status"],
      createdAt: node.createdAt,
      nextBillingDate: node.nextBillingDate,
      planName: line?.name ?? "Subscription",
      quantity: line?.quantity ?? 0,
      pricePerPeriod: line?.currentPrice.amount ?? "0",
      currencyCode: line?.currentPrice.currencyCode ?? "EUR",
      billingInterval: node.billingPolicy.interval,
      billingIntervalCount: node.billingPolicy.intervalCount.count,
      discount,
    };
  });
}
```

- [ ] **Step 4: Add the cancelSubscription function**

Add after `getCustomerSubscriptions`:

```typescript
const CANCEL_SUBSCRIPTION_MUTATION = `#graphql
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
`;

export async function cancelSubscription(
  accessToken: string,
  subscriptionContractId: string
): Promise<{ success: boolean; error?: string }> {
  const data = await customerMutation<{
    subscriptionContractCancel: {
      contract: { id: string; status: string } | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(accessToken, CANCEL_SUBSCRIPTION_MUTATION, { subscriptionContractId });

  if (!data) {
    return { success: false, error: "Failed to cancel subscription" };
  }

  const { userErrors } = data.subscriptionContractCancel;
  if (userErrors.length > 0) {
    return { success: false, error: userErrors[0].message };
  }

  return { success: true };
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/shopify-customer.ts
git commit -m "feat: add subscription query and cancel mutation to Customer API"
```

---

### Task 2: Extend customer API route to include subscriptions

**Files:**
- Modify: `app/api/auth/customer/route.ts`

- [ ] **Step 1: Add subscriptions to the customer API response**

Replace the entire contents of `app/api/auth/customer/route.ts` with:

```typescript
import { cookies } from "next/headers";
import {
  getCustomerProfile,
  getCustomerOrders,
  getCustomerSubscriptions,
} from "@/lib/shopify-customer";
import { refreshAccessToken } from "@/lib/shopify-auth";

export async function GET() {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("shop_access_token")?.value;
  const refreshToken = cookieStore.get("shop_refresh_token")?.value;

  if (!accessToken && refreshToken) {
    try {
      const tokens = await refreshAccessToken(refreshToken);
      accessToken = tokens.access_token;
    } catch {
      return Response.json({ error: "Session expired" }, { status: 401 });
    }
  }

  if (!accessToken) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const [profile, orders, subscriptions] = await Promise.all([
    getCustomerProfile(accessToken),
    getCustomerOrders(accessToken),
    getCustomerSubscriptions(accessToken),
  ]);

  if (!profile) {
    return Response.json(
      { error: "Failed to fetch customer data" },
      { status: 500 }
    );
  }

  return Response.json({ profile, orders, subscriptions });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/auth/customer/route.ts
git commit -m "feat: include subscriptions in customer API response"
```

---

### Task 3: Create the cancel subscription API route

**Files:**
- Create: `app/api/auth/subscription/cancel/route.ts`

- [ ] **Step 1: Create the cancel endpoint**

Create `app/api/auth/subscription/cancel/route.ts`:

```typescript
import { cookies } from "next/headers";
import { cancelSubscription } from "@/lib/shopify-customer";
import { refreshAccessToken } from "@/lib/shopify-auth";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("shop_access_token")?.value;
  const refreshToken = cookieStore.get("shop_refresh_token")?.value;

  if (!accessToken && refreshToken) {
    try {
      const tokens = await refreshAccessToken(refreshToken);
      accessToken = tokens.access_token;
    } catch {
      return Response.json({ error: "Session expired" }, { status: 401 });
    }
  }

  if (!accessToken) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { subscriptionContractId } = body;

  if (!subscriptionContractId || typeof subscriptionContractId !== "string") {
    return Response.json(
      { error: "Missing subscriptionContractId" },
      { status: 400 }
    );
  }

  const result = await cancelSubscription(accessToken, subscriptionContractId);

  if (!result.success) {
    return Response.json(
      { error: result.error },
      { status: 500 }
    );
  }

  return Response.json({ success: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/auth/subscription/cancel/route.ts
git commit -m "feat: add subscription cancel API endpoint"
```

---

### Task 4: Update account page UI with subscription section

**Files:**
- Modify: `app/account/account-content.tsx`

- [ ] **Step 1: Replace the entire account-content.tsx**

Replace the contents of `app/account/account-content.tsx` with:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type {
  CustomerProfile,
  CustomerOrder,
  Subscription,
} from "@/lib/shopify-customer";

function StatusBadge({ status }: { status: Subscription["status"] }) {
  const colors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    PAUSED: "bg-yellow-100 text-yellow-700",
    CANCELLED: "bg-red-100 text-red-700",
    EXPIRED: "bg-gray-100 text-gray-500",
    FAILED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[status] ?? "bg-gray-100 text-gray-500"}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function SubscriptionSection({
  subscriptions,
  onCancel,
}: {
  subscriptions: Subscription[];
  onCancel: (id: string) => void;
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const active = subscriptions.find((s) => s.status === "ACTIVE" || s.status === "PAUSED");

  if (!active) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          Your Subscription
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          You don&apos;t have an active subscription yet.
        </p>
        <Link
          href="/get-started"
          className="inline-block bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          Get Started
        </Link>
      </div>
    );
  }

  const intervalLabel =
    active.billingIntervalCount === 1
      ? active.billingInterval.toLowerCase()
      : `${active.billingIntervalCount} ${active.billingInterval.toLowerCase()}s`;

  async function handleCancel() {
    setCancelling(true);
    onCancel(active!.id);
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-900">Your Subscription</h2>
        <StatusBadge status={active.status} />
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-gray-500">Plan</span>
          <span className="text-gray-900 font-medium">{active.planName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Price</span>
          <span className="text-gray-900 font-medium">
            &euro;{parseFloat(active.pricePerPeriod).toFixed(2)} / {intervalLabel}
          </span>
        </div>
        {active.discount && (
          <div className="flex justify-between">
            <span className="text-gray-500">Discount</span>
            <span className="text-green-600 font-medium">
              {active.discount.percentage
                ? `${active.discount.percentage}% off`
                : `€${parseFloat(active.discount.fixedAmount ?? "0").toFixed(2)} off`}
            </span>
          </div>
        )}
        {active.nextBillingDate && (
          <div className="flex justify-between">
            <span className="text-gray-500">Next renewal</span>
            <span className="text-gray-900 font-medium">
              {new Date(active.nextBillingDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/menu"
          className="inline-block bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          Select Meals for Next Week
        </Link>

        {active.status === "ACTIVE" && confirmId !== active.id && (
          <button
            onClick={() => setConfirmId(active.id)}
            className="border border-red-300 text-red-600 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            Cancel Subscription
          </button>
        )}
      </div>

      {confirmId === active.id && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700 mb-3">
            Are you sure? Your subscription will be cancelled and no further
            deliveries will be made.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-red-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {cancelling ? "Cancelling..." : "Yes, Cancel"}
            </button>
            <button
              onClick={() => setConfirmId(null)}
              disabled={cancelling}
              className="border border-gray-300 text-gray-700 px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Keep Subscription
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AccountContent() {
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
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
        setSubscriptions(data.subscriptions ?? []);
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchCustomerData();
  }, [router]);

  async function handleCancelSubscription(subscriptionContractId: string) {
    try {
      const res = await fetch("/api/auth/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionContractId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to cancel subscription");
        return;
      }

      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === subscriptionContractId ? { ...s, status: "CANCELLED" as const } : s
        )
      );
    } catch {
      setError("Failed to cancel subscription");
    }
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] bg-[#e8e8e4] py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-48" />
            <div className="h-32 bg-gray-300 rounded-2xl" />
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
              <span className="text-gray-900 font-medium">
                {profile.displayName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="text-gray-900 font-medium">{profile.email}</span>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <SubscriptionSection
          subscriptions={subscriptions}
          onCancel={handleCancelSubscription}
        />

        {/* Recent Orders */}
        {orders.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Recent Orders
            </h2>
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

- [ ] **Step 2: Commit**

```bash
git add app/account/account-content.tsx
git commit -m "feat: add subscription section to account page with cancel flow"
```

---

### Task 5: Verify build and push

- [ ] **Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Run build**

```bash
npx next build
```

Expected: build succeeds with no errors.

- [ ] **Step 3: Push to remote**

```bash
git push origin master
```
