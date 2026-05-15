import type { Meal } from "./types";

export interface OrderData {
  planType: "standard" | "flexible";
  selectedMeals: { meal: Meal; quantity: number }[];
  selectedAddOns: { meal: Meal; quantity: number }[];
  mealsPerDay: number;
  daysPerWeek: number;
}

const ORDER_KEY = "orderData";

export function saveOrderData(data: OrderData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ORDER_KEY, JSON.stringify(data));
}

export function loadOrderData(): OrderData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ORDER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OrderData;
  } catch {
    return null;
  }
}
