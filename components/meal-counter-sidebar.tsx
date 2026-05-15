"use client";

import { formatPrice } from "@/lib/pricing";

interface MealCounterSidebarProps {
  selected: number;
  target: number;
  totalPrice: number;
  onContinue?: () => void;
}

export default function MealCounterSidebar({
  selected,
  target,
  totalPrice,
  onContinue,
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

        <p className="text-sm text-gray-500 text-center mb-4">
          {isComplete
            ? "All meals selected!"
            : `${target - selected} more to go`}
        </p>

        {selected > 0 && (
          <div className="text-center mb-4 py-3 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-500">Weekly total</span>
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(totalPrice)}
            </div>
          </div>
        )}

        <button
          disabled={!isComplete}
          onClick={onContinue}
          className="w-full bg-primary text-white py-3 rounded-full text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
