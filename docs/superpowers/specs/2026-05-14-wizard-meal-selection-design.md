# Wizard → Meal Selection Design

**Date:** 2026-05-14

## Overview

Connect the get-started wizard to the menu page so that user preferences affect which meals are shown and how they are ordered. Flexible plan users select their own meals; Standard plan users see a preview of curated meals.

## Data Storage

Wizard selections are saved to **localStorage** under key `wizardSelections`:

```json
{
  "goals": ["weight-loss", "muscle-gain"],
  "preferences": ["high-protein", "low-carb"],
  "avoid": ["pork"],
  "mealsPerDay": 3,
  "daysPerWeek": 7,
  "planType": "flexible"
}
```

This will be migrated to a database once auth/customer accounts are implemented. The filtering/sorting logic stays the same — only the data source changes.

## Filtering & Sorting

### Hard filter (avoid)

Meals with a matching **tag** (e.g., "Pork") are completely removed from the list. Tags in Shopify use title case (e.g., "Pork", "Tuna") and are normalized to lowercase via `normalizeTag()` before comparison.

### Soft sort (preferences)

Meals whose tags match the user's preferences appear first. Meals matching more preference tags rank higher. Non-matching meals still appear, just lower in the list.

## Flexible Plan

- User selects meals from the filtered/sorted grid
- `targetMeals = mealsPerDay × daysPerWeek` (e.g., 3 × 7 = 21)
- **Duplicates allowed** — same meal can be selected multiple times
- **Sticky counter panel** on the right side of the page (outside the meal grid), moves with scroll
- Counter shows: selected / target, progress bar, "Continue" button
- Meal grid stays 3 columns as current

## Standard Plan

- User sees the menu as a preview — no selection mode
- Meals are filtered (avoid) and sorted (preferences) the same way
- No counter, no selection UI
- Business sets the actual meals via Shopify (collections/tags for weekly menu)

## Avoid Tags in Shopify

Avoid ingredients are represented as **product tags** in Shopify (e.g., "Pork", "Tuna"). This is simpler and more reliable than searching ingredient text. Business adds these tags to relevant products.

## Components Affected

- `app/get-started/page.tsx` — save to localStorage before redirect
- `app/menu/menu-content.tsx` — read localStorage, apply filter/sort, dynamic counter
- `components/meal-card.tsx` — support duplicate selection (quantity)
- New: sticky counter sidebar component for Flexible plan
- `lib/types.ts` — no changes needed (UserSelections already matches)
