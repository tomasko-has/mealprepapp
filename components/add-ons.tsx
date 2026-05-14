"use client";

import { useState } from "react";
import type { AddOn } from "@/lib/types";

export default function AddOns({ addOns }: { addOns: AddOn[] }) {
  const [selected, setSelected] = useState<Record<string, number>>({});

  const breakfasts = addOns.filter((a) => a.category === "breakfast");
  const snacks = addOns.filter((a) => a.category === "snack");

  function increment(id: string) {
    setSelected((s) => ({ ...s, [id]: (s[id] || 0) + 1 }));
  }

  function decrement(id: string) {
    setSelected((s) => {
      const count = (s[id] || 0) - 1;
      if (count <= 0) {
        const next = { ...s };
        delete next[id];
        return next;
      }
      return { ...s, [id]: count };
    });
  }

  const totalAddOnPrice = Object.entries(selected).reduce((sum, [id, qty]) => {
    const addon = addOns.find((a) => a.id === id);
    return sum + (addon ? addon.price * qty : 0);
  }, 0);

  function renderAddOnCard(addon: AddOn) {
    const qty = selected[addon.id] || 0;
    return (
      <div
        key={addon.id}
        className={`bg-white rounded-2xl p-4 border-2 transition-all ${
          qty > 0 ? "border-primary" : "border-gray-100"
        }`}
      >
        <div className="aspect-[3/2] bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl mb-3 flex items-center justify-center text-orange-300">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12" />
          </svg>
        </div>
        <h4 className="font-semibold text-gray-900 text-sm">{addon.name}</h4>
        <p className="text-xs text-gray-500 mt-0.5 mb-2">{addon.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-900">
            €{addon.price.toFixed(2)}
          </span>
          {qty === 0 ? (
            <button
              onClick={() => increment(addon.id)}
              className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-gray-200 transition-colors"
            >
              + Add
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => decrement(addon.id)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
              >
                -
              </button>
              <span className="text-sm font-bold w-4 text-center">{qty}</span>
              <button
                onClick={() => increment(addon.id)}
                className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (addOns.length === 0) {
    return null;
  }

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add-Ons</h2>
          <p className="text-gray-500 text-sm mt-1">
            Boost your plan with breakfast and snacks
          </p>
        </div>
        {totalAddOnPrice > 0 && (
          <span className="text-sm font-semibold text-primary">
            + €{totalAddOnPrice.toFixed(2)}
          </span>
        )}
      </div>

      {breakfasts.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Breakfast</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {breakfasts.map(renderAddOnCard)}
          </div>
        </>
      )}

      {snacks.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Snacks</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {snacks.map(renderAddOnCard)}
          </div>
        </>
      )}
    </section>
  );
}
