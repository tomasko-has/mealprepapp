# Pricing Feature — Design Spec

## Goal

Display dynamic subscription pricing in the wizard and meal selection flow, calculated from Shopify product prices. Currency: EUR.

## How Pricing Works

- **Price per meal** comes from each Shopify product's `priceRange.minVariantPrice.amount`
- **Average price per meal** = sum of all meal prices / number of meals
- **Standard plan** = average price × mealsPerDay × daysPerWeek × 0.90 (10% discount)
- **Flexible plan** = average price × mealsPerDay × daysPerWeek (estimate in wizard); actual total from selected meals on menu page

## Changes

### 1. Meal type + mapper

- Add `price: number` to `Meal` interface in `lib/types.ts`
- Map `priceRange.minVariantPrice.amount` (string → number) in `shopifyProductToMeal()` in `lib/shopify-queries.ts`

### 2. Pricing utility

- New file `lib/pricing.ts`:
  - `getAveragePrice(meals: Meal[]): number` — average of all meal prices
  - `getStandardWeeklyPrice(avgPrice: number, mealsPerDay: number, daysPerWeek: number): number` — avg × count × 0.90
  - `getFlexibleWeeklyPrice(avgPrice: number, mealsPerDay: number, daysPerWeek: number): number` — avg × count
  - `getSelectedMealsTotal(meals: Meal[], selected: Record<string, number>): number` — sum of price × quantity for each selected meal
  - `STANDARD_DISCOUNT = 0.10`

### 3. Wizard Step 6 (get-started/page.tsx)

- Fetch meals (or just prices) to compute average price per meal
- Replace hardcoded `PRICING` object with computed values
- Display:
  - Standard: `€XX/week (€X.XX/meal) — Best Value, 10% off`
  - Flexible: `~€XX/week (€X.XX/meal avg) — final price based on your picks`
- Currency: EUR with € symbol

### 4. Menu page sidebar (Flexible select mode)

- Show running total of selected meals in `MealCounterSidebar`
- Display: `€XX.XX` based on actual selected meal prices
- Pass meals array and selectedMeals record to sidebar

### 5. Meal cards (optional)

- Show price per meal on each card: `€X.XX`

## Out of Scope

- Shopify selling plans / checkout integration
- Payment processing
- Discount codes
- Different currencies (EUR only for now)
