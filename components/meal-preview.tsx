import Link from "next/link";
import MealCard from "./meal-card";
import type { Meal } from "@/lib/types";

export default function MealPreview({ meals }: { meals: Meal[] }) {
  const featured = meals.slice(0, 4);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            This Week&apos;s Menu
          </h2>
          <p className="mt-3 text-gray-500 text-lg">
            Chef-prepared meals, fresh every week
          </p>
        </div>
        {featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">No meals available yet.</p>
        )}
        <div className="text-center mt-10">
          <Link
            href="/menu"
            className="inline-block bg-primary text-white px-8 py-3.5 rounded-full text-base font-semibold hover:bg-primary-dark transition-colors"
          >
            View Full Menu
          </Link>
        </div>
      </div>
    </section>
  );
}
