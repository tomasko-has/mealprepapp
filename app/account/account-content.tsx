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
  const cancelled = subscriptions.find((s) => s.status === "CANCELLED");

  if (!active && cancelled) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Your Subscription</h2>
          <StatusBadge status="CANCELLED" />
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Your subscription has been cancelled. No further deliveries will be made.
        </p>
        <Link
          href="/get-started"
          className="inline-block bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          Start a New Plan
        </Link>
      </div>
    );
  }

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
