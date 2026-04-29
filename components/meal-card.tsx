import { Meal } from "@/lib/types";

interface MealCardProps {
  meal: Meal;
  onSelect?: () => void;
  selected?: boolean;
  showSelect?: boolean;
}

export default function MealCard({ meal, onSelect, selected, showSelect }: MealCardProps) {
  const categoryColors: Record<string, string> = {
    "calorie-smart": "bg-blue-100 text-blue-700",
    "high-protein": "bg-orange-100 text-orange-700",
    "gluten-free": "bg-purple-100 text-purple-700",
    healthy: "bg-green-100 text-green-700",
  };

  const categoryLabel = meal.category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden border-2 transition-all hover:shadow-lg ${
        selected ? "border-primary shadow-lg" : "border-gray-100"
      }`}
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative">
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12" />
          </svg>
        </div>
        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[meal.category] || "bg-gray-100 text-gray-700"}`}>
          {categoryLabel}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base mb-1">{meal.name}</h3>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{meal.description}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="font-semibold text-gray-900">{meal.calories} cal</span>
          <span>P: {meal.protein}g</span>
          <span>C: {meal.carbs}g</span>
          <span>F: {meal.fat}g</span>
        </div>
        {showSelect && (
          <button
            onClick={onSelect}
            className={`mt-3 w-full py-2 rounded-full text-sm font-semibold transition-colors ${
              selected
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {selected ? "Selected" : "Add to Plan"}
          </button>
        )}
      </div>
    </div>
  );
}
