# Wizard → Meal Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the get-started wizard to the menu page so user preferences filter, sort, and determine meal selection count.

**Architecture:** Wizard saves selections to localStorage. Menu page reads them on mount, applies hard filter (avoid tags) and soft sort (preference tags), and renders a sticky sidebar counter for Flexible plan with duplicate support.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, localStorage

---

### Task 1: localStorage helper — save & load wizard selections

**Files:**
- Create: `lib/wizard-storage.ts`

- [ ] **Step 1: Create the helper module**

```typescript
// lib/wizard-storage.ts
import type { UserSelections } from "./types";

const STORAGE_KEY = "wizardSelections";

export function saveWizardSelections(selections: UserSelections): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(selections));
}

export function loadWizardSelections(): UserSelections | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserSelections;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/wizard-storage.ts
git commit -m "feat: add localStorage helper for wizard selections"
```

---

### Task 2: Save wizard selections before redirect

**Files:**
- Modify: `app/get-started/page.tsx`

- [ ] **Step 1: Import the helper**

Add at top of file:

```typescript
import { saveWizardSelections } from "@/lib/wizard-storage";
```

- [ ] **Step 2: Replace the Link with a button that saves + navigates**

Replace the final navigation Link (lines 359-366) with:

```typescript
<button
  onClick={() => {
    if (!canAdvance()) return;
    saveWizardSelections(selections);
    window.location.href =
      selections.planType === "flexible" ? "/menu?select=true" : "/menu";
  }}
  className={`bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors ${
    !canAdvance() ? "opacity-40 pointer-events-none" : ""
  }`}
>
  {selections.planType === "flexible" ? "Choose Your Meals" : "View Your Menu"}
</button>
```

- [ ] **Step 3: Remove unused Link import if no longer needed elsewhere**

Check if `Link` from `next/link` is still used in the file. If the Back button or other elements use it, keep it. Otherwise remove the import.

- [ ] **Step 4: Commit**

```bash
git add app/get-started/page.tsx
git commit -m "feat: save wizard selections to localStorage before redirect"
```

---

### Task 3: Meal filtering and sorting logic

**Files:**
- Create: `lib/meal-filters.ts`

- [ ] **Step 1: Create filtering/sorting module**

```typescript
// lib/meal-filters.ts
import type { Meal, UserSelections } from "./types";

export function filterAndSortMeals(
  meals: Meal[],
  selections: UserSelections | null
): Meal[] {
  if (!selections) return meals;

  // Hard filter: remove meals with avoid tags
  const filtered = meals.filter((meal) => {
    return !selections.avoid.some((avoidItem) =>
      meal.tags.includes(avoidItem)
    );
  });

  // Soft sort: meals matching more preference tags rank higher
  const sorted = [...filtered].sort((a, b) => {
    const aScore = selections.preferences.filter((pref) =>
      a.tags.includes(pref)
    ).length;
    const bScore = selections.preferences.filter((pref) =>
      b.tags.includes(pref)
    ).length;
    return bScore - aScore;
  });

  return sorted;
}

export function getTargetMeals(selections: UserSelections | null): number {
  if (!selections?.mealsPerDay || !selections?.daysPerWeek) return 12;
  return selections.mealsPerDay * selections.daysPerWeek;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/meal-filters.ts
git commit -m "feat: add meal filtering (avoid) and sorting (preferences) logic"
```

---

### Task 4: Sticky counter sidebar component

**Files:**
- Create: `components/meal-counter-sidebar.tsx`

- [ ] **Step 1: Create the sticky sidebar component**

```typescript
// components/meal-counter-sidebar.tsx
"use client";

interface MealCounterSidebarProps {
  selected: number;
  target: number;
}

export default function MealCounterSidebar({
  selected,
  target,
}: MealCounterSidebarProps) {
  const progress = Math.min((selected / target) * 100, 100);
  const isComplete = selected >= target;

  return (
    <div className="sticky top-24">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Your Meals</h3>

        <div className="text-center mb-4">
          <span className="text-4xl font-bold text-gray-900">{selected}</span>
          <span className="text-lg text-gray-400 font-normal"> / {target}</span>
        </div>

        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-sm text-gray-500 text-center mb-6">
          {isComplete
            ? "All meals selected!"
            : `${target - selected} more to go`}
        </p>

        <button
          disabled={!isComplete}
          className="w-full bg-primary text-white py-3 rounded-full text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/meal-counter-sidebar.tsx
git commit -m "feat: add sticky meal counter sidebar for flexible plan"
```

---

### Task 5: Update meal card for duplicate selection

**Files:**
- Modify: `components/meal-card.tsx`

- [ ] **Step 1: Update MealCardProps to support quantity**

Replace the interface and component:

```typescript
interface MealCardProps {
  meal: Meal;
  onAdd?: () => void;
  onRemove?: () => void;
  quantity?: number;
  showSelect?: boolean;
}

export default function MealCard({
  meal,
  onAdd,
  onRemove,
  quantity = 0,
  showSelect,
}: MealCardProps) {
  const card = (
    <div
      className={`bg-white rounded-2xl overflow-hidden border-2 transition-all hover:shadow-lg cursor-pointer ${
        quantity > 0 ? "border-primary shadow-lg" : "border-gray-100"
      }`}
    >
      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
        {meal.image ? (
          <Image
            src={meal.image}
            alt={meal.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            quality={90}
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12" />
            </svg>
          </div>
        )}
        {quantity > 0 && (
          <div className="absolute top-3 right-3 bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
            {quantity}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-base">{meal.name}</h3>
        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{meal.description}</p>
        {meal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {meal.tags.map((tag) => (
              <span
                key={tag}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${TAG_COLORS[tag] || "bg-gray-100 text-gray-700"}`}
              >
                {formatTagLabel(tag)}
              </span>
            ))}
          </div>
        )}
        {showSelect && (
          <div className="flex items-center gap-2 mt-3">
            {quantity > 0 ? (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onRemove?.();
                  }}
                  className="flex-1 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  -
                </button>
                <span className="text-sm font-bold text-gray-900 w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onAdd?.();
                  }}
                  className="flex-1 py-2 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors"
                >
                  +
                </button>
              </>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onAdd?.();
                }}
                className="w-full py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Add to Plan
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (showSelect) {
    return card;
  }

  return (
    <Link href={`/menu/${meal.id}`}>
      {card}
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/meal-card.tsx
git commit -m "feat: update meal card with quantity selector for duplicate support"
```

---

### Task 6: Rewrite menu-content with filtering, sorting, sidebar layout

**Files:**
- Modify: `app/menu/menu-content.tsx`

- [ ] **Step 1: Rewrite the full component**

```typescript
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MealCard from "@/components/meal-card";
import MealCounterSidebar from "@/components/meal-counter-sidebar";
import AddOns from "@/components/add-ons";
import { loadWizardSelections } from "@/lib/wizard-storage";
import { filterAndSortMeals, getTargetMeals } from "@/lib/meal-filters";
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
```

- [ ] **Step 2: Commit**

```bash
git add app/menu/menu-content.tsx
git commit -m "feat: menu page reads wizard selections, filters/sorts meals, sticky sidebar"
```

---

### Task 7: Verify end-to-end flow

- [ ] **Step 1: Run build**

```bash
npx next build
```

Expected: Build passes with no errors.

- [ ] **Step 2: Manual test — Flexible plan flow**

1. Go to `/get-started`
2. Select goals, preferences (e.g., High Protein), avoid Pork, 3 meals/day, 7 days, Flexible
3. Click "Choose Your Meals"
4. Verify: meals with "pork" tag are hidden
5. Verify: high-protein meals appear first
6. Verify: counter shows 0 / 21
7. Verify: can add same meal multiple times
8. Verify: sticky sidebar scrolls with page

- [ ] **Step 3: Manual test — Standard plan flow**

1. Go through wizard, select Standard
2. Click "View Your Menu"
3. Verify: no selection UI, just filtered/sorted meal preview

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: wizard to meal selection flow complete"
```
