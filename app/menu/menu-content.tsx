"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MealCard from "@/components/meal-card";
import MealCounterSidebar from "@/components/meal-counter-sidebar";
import AddOns from "@/components/add-ons";
import { loadWizardSelections } from "@/lib/wizard-storage";
import { filterAndSortMeals, getTargetMeals } from "@/lib/meal-filters";
import { getSelectedMealsTotal } from "@/lib/pricing";
import type { Meal, AddOn, UserSelections } from "@/lib/types";

export default function MenuContent({ meals }: { meals: Meal[] }) {
  const searchParams = useSearchParams();
  const isSelectMode = searchParams.get("select") === "true";

  const [selections, setSelections] = useState<UserSelections | null>(null);
  const [selectedMeals, setSelectedMeals] = useState<Record<string, number>>({});

  useEffect(() => {
    setSelections(loadWizardSelections());
  }, []);

  const processedMeals = filterAndSortMeals(meals, selections);
  const targetMeals = getTargetMeals(selections);
  const totalSelected = Object.values(selectedMeals).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = getSelectedMealsTotal(processedMeals, selectedMeals);

  const addOns: AddOn[] = [];

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

  return (
    <div className="min-h-[80vh] bg-[#e8e8e4] py-12">
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
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {processedMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        )}

        {/* Add-ons Section */}
        <AddOns addOns={addOns} />
      </div>
    </div>
  );
}
