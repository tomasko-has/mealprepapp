"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import MealCard from "@/components/meal-card";
import AddOns from "@/components/add-ons";
import type { Meal, AddOn } from "@/lib/types";

export default function MenuContent({ meals }: { meals: Meal[] }) {
  const searchParams = useSearchParams();
  const isSelectMode = searchParams.get("select") === "true";

  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const targetMeals = 12;

  const addOns: AddOn[] = [];

  function toggleMeal(mealId: string) {
    setSelectedMeals((prev) => {
      if (prev.includes(mealId)) {
        return prev.filter((id) => id !== mealId);
      }
      if (prev.length >= targetMeals) return prev;
      return [...prev, mealId];
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

        {/* Selection Progress (Flexible mode) */}
        {isSelectMode && (
          <div className="bg-white rounded-2xl p-4 mb-8 flex items-center justify-between border border-gray-200 max-w-xl mx-auto">
            <div>
              <span className="text-sm text-gray-500">Meals selected</span>
              <div className="text-xl font-bold text-gray-900">
                {selectedMeals.length}{" "}
                <span className="text-gray-400 font-normal">/ {targetMeals}</span>
              </div>
            </div>
            <div className="flex-1 mx-6">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(selectedMeals.length / targetMeals) * 100}%` }}
                />
              </div>
            </div>
            <button
              disabled={selectedMeals.length < targetMeals}
              className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {/* Meal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              showSelect={isSelectMode}
              selected={selectedMeals.includes(meal.id)}
              onSelect={() => toggleMeal(meal.id)}
            />
          ))}
        </div>

        {/* Add-ons Section */}
        <AddOns addOns={addOns} />
      </div>
    </div>
  );
}
