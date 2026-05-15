"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { loadOrderData, type OrderData } from "@/lib/order-storage";
import { loadWizardSelections } from "@/lib/wizard-storage";
import { formatPrice, STANDARD_DISCOUNT } from "@/lib/pricing";

export default function SummaryContent() {
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const data = loadOrderData();
    if (!data) {
      router.push("/menu");
      return;
    }
    setOrder(data);
  }, [router]);

  if (!order) {
    return <div className="min-h-[80vh] bg-[#e8e8e4]" />;
  }

  const mealsSubtotal = order.selectedMeals.reduce(
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
  const totalMeals = order.selectedMeals.reduce((sum, { quantity }) => sum + quantity, 0);
  const totalAddOns = order.selectedAddOns.reduce((sum, { quantity }) => sum + quantity, 0);

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
                  <span className="text-xs text-gray-500">x{quantity} · {formatPrice(meal.price * quantity)}</span>
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
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
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

        {/* Checkout Button */}
        <button
          className="w-full bg-primary text-white py-4 rounded-full text-base font-semibold hover:bg-primary-dark transition-colors"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
