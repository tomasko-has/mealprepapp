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
