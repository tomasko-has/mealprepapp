"use client";

import { useState, useEffect } from "react";
import MealCard from "./meal-card";
import WeekSelector, { parseWeekCollection, type WeekCollection } from "./week-selector";
import type { Meal } from "@/lib/types";

export default function MealPreview() {
  const [weeks, setWeeks] = useState<WeekCollection[]>([]);
  const [activeWeek, setActiveWeek] = useState(0);
  const [weekMeals, setWeekMeals] = useState<Record<string, Meal[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/weeks")
      .then((res) => res.json())
      .then(async (data) => {
        const parsed = data.map(parseWeekCollection);
        setWeeks(parsed);

        const allMeals: Record<string, Meal[]> = {};
        await Promise.all(
          parsed.map(async (week: WeekCollection) => {
            const res = await fetch(`/api/collection/${week.handle}`);
            allMeals[week.handle] = await res.json();
          })
        );
        setWeekMeals(allMeals);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const currentHandle = weeks[activeWeek]?.handle ?? "";
  const displayMeals = weekMeals[currentHandle] ?? [];

  return (
    <section id="menu" className="py-20 bg-gray-50 scroll-mt-20 min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            This Week&apos;s Menu
          </h2>
          <p className="mt-3 text-gray-500 text-lg">
            Chef-prepared meals, fresh every week
          </p>
        </div>
        <WeekSelector weeks={weeks} activeIndex={activeWeek} onChange={setActiveWeek} />
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border-2 border-gray-100 animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : displayMeals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">No meals available for this week yet.</p>
        )}
      </div>
    </section>
  );
}
