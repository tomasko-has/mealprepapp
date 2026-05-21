"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { loadOrderData, type OrderData } from "@/lib/order-storage";
import { loadWizardSelections, clearWizardSelections } from "@/lib/wizard-storage";
import { formatPrice, STANDARD_DISCOUNT, type PlanPricing } from "@/lib/pricing";

export default function SummaryContent() {
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planPricing, setPlanPricing] = useState<PlanPricing>({});

  useEffect(() => {
    const data = loadOrderData();
    if (!data) {
      router.push("/menu");
      return;
    }
    setOrder(data);
    fetch("/api/plans")
      .then((res) => res.json())
      .then(setPlanPricing)
      .catch(() => {});
  }, [router]);

  if (!order) {
    return <div className="min-h-[80vh] bg-[#e8e8e4]" />;
  }

  const totalMeals = order.selectedMeals.reduce((sum, { quantity }) => sum + quantity, 0);

  // Use Shopify fixed variant price when available, fall back to calculated
  const planType = order.planType as "standard" | "flexible";
  const shopifyBase = planPricing[planType]?.[totalMeals];
  const mealsSubtotal = shopifyBase ?? order.selectedMeals.reduce(
    (sum, { meal, quantity }) => sum + meal.price * quantity,
    0
  );
  const discount = order.planType === "standard" ? mealsSubtotal * STANDARD_DISCOUNT : 0;
  const mealsTotal = mealsSubtotal - discount;

  const addOnsTotal = order.selectedAddOns.reduce(
    (sum, { meal, quantity }) => sum + meal.price * quantity,
    0
  );

  const orderTotal = mealsTotal + addOnsTotal;
  const totalAddOns = order.selectedAddOns.reduce((sum, { quantity }) => sum + quantity, 0);

  async function handleCheckout() {
    if (!disclaimerChecked || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const wizard = loadWizardSelections();

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...order,
          goals: wizard?.goals,
          avoid: wizard?.avoid,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.checkoutUrl) {
        setError(data.error || "Failed to create cart. Please try again.");
        setIsLoading(false);
        return;
      }

      clearWizardSelections();
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] bg-[#e8e8e4] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Order Summary
          </h1>
          <p className="mt-2 text-gray-500 text-lg">
            Review your weekly plan before checkout
          </p>
        </div>

        {/* Plan Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 capitalize">
                {order.planType} Plan
              </h2>
              <p className="text-sm text-gray-500">
                {order.mealsPerDay} meals/day, {order.daysPerWeek} days/week
              </p>
            </div>
            <span className="text-sm font-semibold text-primary">
              {totalMeals} meals
            </span>
          </div>
        </div>

        {/* Selected Meals */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4 overflow-hidden">
          <div className="p-6 pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Your Meals</h3>
              {order.planType === "flexible" && (
                <button
                  onClick={() => router.back()}
                  className="text-sm text-primary font-semibold hover:underline"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {order.selectedMeals.map(({ meal, quantity }, i) => (
              <div
                key={meal.id}
                className={`flex items-center gap-3 p-4 border-b border-gray-50 ${
                  i % 2 === 0 ? "sm:border-r" : ""
                }`}
              >
                <div className="w-12 h-12 rounded-lg bg-gray-100 relative overflow-hidden shrink-0">
                  {meal.image && (
                    <Image
                      src={meal.image}
                      alt={meal.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm truncate">{meal.name}</h4>
                  <span className="text-xs text-gray-500">x{quantity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add-ons */}
        {totalAddOns > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4 overflow-hidden">
            <div className="p-6 pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Add-ons</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {order.selectedAddOns.map(({ meal, quantity }, i) => (
                <div
                  key={meal.id}
                  className={`flex items-center gap-3 p-4 border-b border-gray-50 ${
                    i % 2 === 0 ? "sm:border-r" : ""
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-100 relative overflow-hidden shrink-0">
                    {meal.image && (
                      <Image
                        src={meal.image}
                        alt={meal.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">{meal.name}</h4>
                    <span className="text-xs text-gray-500">x{quantity} · {formatPrice(meal.price * quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Meals subtotal ({totalMeals} items)</span>
              <span className="text-gray-900">{formatPrice(mealsSubtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-primary font-medium">Standard discount ({Math.round(STANDARD_DISCOUNT * 100)}%)</span>
                <span className="text-primary font-medium">-{formatPrice(discount)}</span>
              </div>
            )}
            {addOnsTotal > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Add-ons ({totalAddOns} items)</span>
                <span className="text-gray-900">{formatPrice(addOnsTotal)}</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
              <span className="text-base font-bold text-gray-900">Weekly total</span>
              <span className="text-xl font-bold text-gray-900">{formatPrice(orderTotal)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">Delivered every Sunday, Tuesday, Thursday</span>
            </p>
          </div>
        </div>

        {/* Subscription Disclaimer */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={disclaimerChecked}
              onChange={(e) => setDisclaimerChecked(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary shrink-0"
            />
            <span className="text-xs text-gray-500 leading-relaxed">
              I understand that I am subscribing to a meal plan subscription. Active
              subscriptions are auto-generated every Thursday. Standard plans are
              automatically renewed weekly. For the flexible plan, meals must be
              selected each week, otherwise the standard plan will be delivered.
            </span>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={!disclaimerChecked || isLoading}
          className={`w-full py-4 rounded-full text-base font-semibold transition-colors ${
            disclaimerChecked && !isLoading
              ? "bg-primary text-white hover:bg-primary-dark"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating checkout...
            </span>
          ) : (
            "Proceed to Checkout"
          )}
        </button>
      </div>
    </div>
  );
}
