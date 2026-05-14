export interface Meal {
  id: string;
  name: string;
  description: string;
  detailedDescription?: string;
  tags: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  image: string;
  price: number;
}

export type MealTag = "calorie-smart" | "high-protein" | "gluten-free" | "healthy" | "low-carb" | "keto";

export type Goal = "improve-health" | "weight-loss" | "muscle-gain" | "save-time";

export type MealPreference = MealTag;

export type AvoidIngredient = "tuna" | "pork";

export type MealsPerDay = 1 | 2 | 3;

export type DaysPerWeek = 5 | 6 | 7;

export type PlanType = "standard" | "flexible";

export interface UserSelections {
  goals: Goal[];
  preferences: MealPreference[];
  avoid: AvoidIngredient[];
  mealsPerDay: MealsPerDay | null;
  daysPerWeek: DaysPerWeek | null;
  planType: PlanType | null;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "breakfast" | "snack";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface WeekMenu {
  weekLabel: string;
  startDate: string;
  meals: Meal[];
}
