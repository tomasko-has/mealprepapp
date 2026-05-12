import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/shopify-queries";
import { TAG_COLORS, formatTagLabel } from "@/lib/tag-utils";
import ExpandableText from "@/components/expandable-text";

export default async function MealDetailPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const meal = await getProductByHandle(handle);

  if (!meal) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#e8e8e4] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Menu
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
              {meal.image ? (
                <div className="relative aspect-[16/10]">
                  <Image
                    src={meal.image}
                    alt={meal.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                    quality={90}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full aspect-[16/10] bg-gray-100 flex items-center justify-center text-gray-400">
                  <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12" />
                  </svg>
                </div>
              )}
            </div>

            {/* Title + Tags */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {meal.name}
              </h1>
              <p className="text-gray-500 mt-2 text-lg">{meal.description}</p>

              {meal.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {meal.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${TAG_COLORS[tag] || "bg-gray-100 text-gray-700"}`}
                    >
                      {formatTagLabel(tag)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Detailed Description */}
            {meal.detailedDescription && (
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About This Meal</h2>
                <ExpandableText text={meal.detailedDescription} />
              </div>
            )}

            {/* Ingredients */}
            {meal.ingredients.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Ingredients</h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  {meal.ingredients.map((ingredient) => (
                    <div key={ingredient} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-primary shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
                      </svg>
                      {ingredient}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column - Nutrition */}
          <div>
            <div className="bg-white rounded-3xl p-6 shadow-sm sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Nutrition Per Serving</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="font-bold text-gray-900">Calories</span>
                  <span className="text-gray-600">{meal.calories} kcal</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="font-bold text-gray-900">Protein</span>
                  <span className="text-gray-600">{meal.protein}g</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="font-bold text-gray-900">Carbohydrates</span>
                  <span className="text-gray-600">{meal.carbs}g</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Fat</span>
                  <span className="text-gray-600">{meal.fat}g</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
