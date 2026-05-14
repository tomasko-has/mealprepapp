import Image from "next/image";
import Link from "next/link";
import { Meal } from "@/lib/types";
import { TAG_COLORS, formatTagLabel } from "@/lib/tag-utils";

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
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-bold text-gray-900 text-base">{meal.name}</h3>
          <span className="text-sm font-semibold text-primary shrink-0">
            €{meal.price.toFixed(2)}
          </span>
        </div>
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
