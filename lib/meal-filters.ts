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
