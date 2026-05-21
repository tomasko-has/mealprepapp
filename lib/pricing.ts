import type { Meal } from "./types";

export const STANDARD_DISCOUNT = 0.20;

export function getAveragePrice(meals: Meal[]): number {
  if (meals.length === 0) return 0;
  const total = meals.reduce((sum, meal) => sum + meal.price, 0);
  return total / meals.length;
}

export function getStandardWeeklyPrice(
  avgPrice: number,
  mealsPerDay: number,
  daysPerWeek: number
): number {
  const totalMeals = mealsPerDay * daysPerWeek;
  return avgPrice * totalMeals * (1 - STANDARD_DISCOUNT);
}

export function getFlexibleWeeklyPrice(
  avgPrice: number,
  mealsPerDay: number,
  daysPerWeek: number
): number {
  const totalMeals = mealsPerDay * daysPerWeek;
  return avgPrice * totalMeals;
}

export function getSelectedMealsTotal(
  meals: Meal[],
  selected: Record<string, number>
): number {
  return Object.entries(selected).reduce((sum, [mealId, qty]) => {
    const meal = meals.find((m) => m.id === mealId);
    return sum + (meal?.price ?? 0) * qty;
  }, 0);
}

export type PlanPricing = Record<string, Record<number, number>>;

export function getShopifyPlanPrice(
  pricing: PlanPricing,
  planType: "standard" | "flexible",
  totalMeals: number
): number | null {
  const plan = pricing[planType];
  if (!plan) return null;
  const basePrice = plan[totalMeals];
  if (basePrice === undefined) return null;
  return planType === "standard" ? basePrice * (1 - STANDARD_DISCOUNT) : basePrice;
}

export function formatPrice(amount: number): string {
  return `€${amount.toFixed(2)}`;
}
