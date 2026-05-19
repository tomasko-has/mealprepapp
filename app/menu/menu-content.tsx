"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MealCard from "@/components/meal-card";
import MealCounterSidebar from "@/components/meal-counter-sidebar";
import AddOnsPopup, { type AddOnSelection } from "@/components/addons-popup";
import { loadWizardSelections } from "@/lib/wizard-storage";
import { saveOrderData, loadOrderData } from "@/lib/order-storage";
import { filterAndSortMeals, getTargetMeals } from "@/lib/meal-filters";
import { getAveragePrice, getStandardWeeklyPrice, formatPrice, STANDARD_DISCOUNT, getSelectedMealsTotal } from "@/lib/pricing";
import type { Meal, UserSelections } from "@/lib/types";

export default function MenuContent({ meals }: { meals: Meal[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSelectMode = searchParams.get("select") === "true";

  const [selections, setSelections] = useState<UserSelections | null>(null);
  const [selectedMeals, setSelectedMeals] = useState<Record<string, number>>({});
  const [showAddOns, setShowAddOns] = useState(false);

  useEffect(() => {
    setSelections(loadWizardSelections());
    const existingOrder = loadOrderData();
    if (existingOrder && existingOrder.planType === "flexible") {
      const restored: Record<string, number> = {};
      for (const { meal, quantity } of existingOrder.selectedMeals) {
        restored[meal.id] = quantity;
      }
      setSelectedMeals(restored);
    }
  }, []);

  const processedMeals = filterAndSortMeals(meals, selections);
  const targetMeals = getTargetMeals(selections);
  const totalSelected = Object.values(selectedMeals).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = getSelectedMealsTotal(processedMeals, selectedMeals);
  const avgPrice = getAveragePrice(meals);
  const standardWeekly = getStandardWeeklyPrice(avgPrice, selections?.mealsPerDay ?? 0, selections?.daysPerWeek ?? 0);

  function addMeal(mealId: string) {
    if (totalSelected >= targetMeals) return;
    setSelectedMeals((prev) => ({
      ...prev,
      [mealId]: (prev[mealId] || 0) + 1,
    }));
  }

  function removeMeal(mealId: string) {
    setSelectedMeals((prev) => {
      const current = prev[mealId] || 0;
      if (current <= 1) {
        const { [mealId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [mealId]: current - 1 };
    });
  }

  function handleContinue() {
    setShowAddOns(true);
  }

  function buildMealsList() {
    if (isSelectMode) {
      // Flexible: user-selected meals
      return Object.entries(selectedMeals).map(([mealId, quantity]) => {
        const meal = processedMeals.find((m) => m.id === mealId)!;
        return { meal, quantity };
      });
    }
    // Standard: all processed meals, evenly distributed
    const perMeal = Math.floor(targetMeals / processedMeals.length);
    const remainder = targetMeals % processedMeals.length;
    return processedMeals.map((meal, i) => ({
      meal,
      quantity: perMeal + (i < remainder ? 1 : 0),
    }));
  }

  function navigateToSummary(addOnSelections: AddOnSelection[]) {
    saveOrderData({
      planType: selections?.planType ?? "flexible",
      selectedMeals: buildMealsList(),
      selectedAddOns: addOnSelections,
      mealsPerDay: selections?.mealsPerDay ?? 0,
      daysPerWeek: selections?.daysPerWeek ?? 0,
    });
    router.push("/menu/summary");
  }

  function handleAddOnsContinue(addOnSelections: AddOnSelection[]) {
    navigateToSummary(addOnSelections);
  }

  function handleAddOnsSkip() {
    navigateToSummary([]);
  }

  return (
    <div className="min-h-[80vh] bg-[#e8e8e4] py-12 pb-24 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Weekly Menu
          </h1>
          <p className="mt-2 text-gray-500 text-lg">
            14 chef-prepared meals, fresh every week
          </p>
        </div>

        {isSelectMode ? (
          <div className="flex gap-8">
            {/* Meal Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {processedMeals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    showSelect
                    quantity={selectedMeals[meal.id] || 0}
                    onAdd={() => addMeal(meal.id)}
                    onRemove={() => removeMeal(meal.id)}
                  />
                ))}
              </div>
            </div>

            {/* Sticky Counter Sidebar */}
            <div className="hidden lg:block w-64 shrink-0">
              <MealCounterSidebar
                selected={totalSelected}
                target={targetMeals}
                totalPrice={totalPrice}
                onContinue={handleContinue}
              />
            </div>
          </div>
        ) : selections?.planType === "standard" ? (
          <div className="flex gap-8">
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {processedMeals.map((meal) => (
                  <MealCard key={meal.id} meal={meal} />
                ))}
              </div>
            </div>
            <div className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Standard Plan</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {targetMeals} meals per week, selected for your preferences.
                  </p>
                  <div className="text-center mb-4 py-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-500">Weekly total</span>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(standardWeekly)}
                    </div>
                    <span className="text-xs text-primary font-semibold">{Math.round(STANDARD_DISCOUNT * 100)}% off</span>
                  </div>
                  <button
                    onClick={handleContinue}
                    className="w-full bg-primary text-white py-3 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {processedMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile sticky bottom bar — flexible */}
      {isSelectMode && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-900">
                {totalSelected} / {targetMeals} meals
              </span>
              <span className="text-sm text-gray-500">
                {totalSelected >= targetMeals
                  ? "All meals selected!"
                  : `${targetMeals - totalSelected} more to go`}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${Math.min((totalSelected / targetMeals) * 100, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-gray-900">{formatPrice(totalPrice)}</div>
              <button
                onClick={handleContinue}
                disabled={totalSelected < targetMeals}
                className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {selections?.planType === "standard" && !isSelectMode && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div>
              <span className="text-sm text-gray-500">Standard Plan · {targetMeals} meals</span>
              <div className="text-lg font-bold text-gray-900">
                {formatPrice(standardWeekly)}
                <span className="text-xs text-primary font-semibold ml-1">{Math.round(STANDARD_DISCOUNT * 100)}% off</span>
              </div>
            </div>
            <button
              onClick={handleContinue}
              className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Add-ons Popup */}
      <AddOnsPopup
        open={showAddOns}
        mealsTotal={isSelectMode ? totalPrice : standardWeekly}
        onContinue={handleAddOnsContinue}
        onSkip={handleAddOnsSkip}
      />
    </div>
  );
}
