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

/** Converts a euro price (e.g. 12.99) to integer cents (1299), which is what Stripe expects. */
export function toCents(price: number): number {
  return Math.round(price * 100);
}

export interface OrderLine {
  unitAmount: number; // cents
  quantity: number;
}

export interface OrderTotals {
  mealsSubtotal: number; // cents, before discount
  discount: number; // cents
  mealsTotal: number; // cents, after discount
  addOnsTotal: number; // cents, add-ons are never discounted
  total: number; // cents
}

function sumLines(lines: OrderLine[]): number {
  return lines.reduce((sum, { unitAmount, quantity }) => sum + unitAmount * quantity, 0);
}

/**
 * Single source of truth for order pricing. The Standard plan discount is applied
 * exactly once, to the meals subtotal only. Used by the server when creating the
 * Stripe Checkout Session and by the summary page for display.
 */
export function calculateOrderTotals(
  planType: "standard" | "flexible",
  meals: OrderLine[],
  addOns: OrderLine[]
): OrderTotals {
  const mealsSubtotal = sumLines(meals);
  const discount = planType === "standard" ? Math.round(mealsSubtotal * STANDARD_DISCOUNT) : 0;
  const mealsTotal = mealsSubtotal - discount;
  const addOnsTotal = sumLines(addOns);
  return { mealsSubtotal, discount, mealsTotal, addOnsTotal, total: mealsTotal + addOnsTotal };
}

export type PlanPricing = Record<string, Record<number, number>>;

/**
 * Shopify-era price lookup (wizard + menu estimates). Returns an already discounted
 * price — never discount its result again. Removed together with the Shopify code.
 */
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

export function formatCents(cents: number): string {
  return formatPrice(cents / 100);
}
