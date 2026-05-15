"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { Meal } from "@/lib/types";

export interface AddOnSelection {
  meal: Meal;
  quantity: number;
}

interface AddOnsPopupProps {
  open: boolean;
  mealsTotal: number;
  onContinue: (selectedAddOns: AddOnSelection[]) => void;
  onSkip: () => void;
}

export default function AddOnsPopup({ open, mealsTotal, onContinue, onSkip }: AddOnsPopupProps) {
  const [activeTab, setActiveTab] = useState<"breakfast" | "snacks">("breakfast");
  const [breakfast, setBreakfast] = useState<Meal[]>([]);
  const [snacks, setSnacks] = useState<Meal[]>([]);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/addons")
      .then((res) => res.json())
      .then((data) => {
        setBreakfast(data.breakfast ?? []);
        setSnacks(data.snacks ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  const displayItems = activeTab === "breakfast" ? breakfast : snacks;

  function increment(id: string) {
    setSelected((s) => ({ ...s, [id]: (s[id] || 0) + 1 }));
  }

  function decrement(id: string) {
    setSelected((s) => {
      const count = (s[id] || 0) - 1;
      if (count <= 0) {
        const { [id]: _, ...rest } = s;
        return rest;
      }
      return { ...s, [id]: count };
    });
  }

  const totalSelected = Object.values(selected).reduce((sum, qty) => sum + qty, 0);
  const allItems = [...breakfast, ...snacks];
  const totalPrice = Object.entries(selected).reduce((sum, [id, qty]) => {
    const item = allItems.find((m) => m.id === id);
    return sum + (item?.price ?? 0) * qty;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onSkip} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col animate-step-transition">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Add extras to your plan</h2>
          <p className="text-gray-500 text-sm mt-1">Boost your week with breakfast or snacks</p>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab("breakfast")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === "breakfast"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Breakfast
            </button>
            <button
              onClick={() => setActiveTab("snacks")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === "snacks"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Snacks
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-4 animate-pulse">
                  <div className="aspect-[3/2] bg-gray-200 rounded-xl mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {displayItems.map((item) => {
                const qty = selected[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl overflow-hidden border-2 transition-all ${
                      qty > 0 ? "border-primary" : "border-gray-100"
                    }`}
                  >
                    <div className="aspect-[3/2] bg-gray-100 relative overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 50vw, 280px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12" />
                          </svg>
                        </div>
                      )}
                      {qty > 0 && (
                        <div className="absolute top-2 right-2 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                          {qty}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex items-baseline justify-between gap-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                        <span className="text-sm font-semibold text-primary shrink-0">
                          €{item.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                      <div className="mt-2">
                        {qty === 0 ? (
                          <button
                            onClick={() => increment(item.id)}
                            className="w-full py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                          >
                            + Add
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => decrement(item.id)}
                              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                            >
                              -
                            </button>
                            <span className="text-sm font-bold w-4 text-center">{qty}</span>
                            <button
                              onClick={() => increment(item.id)}
                              className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Meals</span>
            <span className="text-sm font-semibold text-gray-900">€{mealsTotal.toFixed(2)}</span>
          </div>
          {totalSelected > 0 && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Add-ons ({totalSelected})</span>
              <span className="text-sm font-semibold text-primary">+ €{totalPrice.toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-center justify-between mb-4 pt-3 border-t border-gray-100">
            <span className="text-sm font-bold text-gray-900">Total</span>
            <span className="text-base font-bold text-gray-900">€{(mealsTotal + totalPrice).toFixed(2)}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onSkip}
              className="flex-1 py-3 rounded-full text-sm font-semibold border border-gray-300 text-gray-700 hover:border-gray-400 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={() => {
                const selections = Object.entries(selected).map(([id, quantity]) => {
                  const meal = allItems.find((m) => m.id === id)!;
                  return { meal, quantity };
                });
                onContinue(selections);
              }}
              className="flex-1 py-3 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors"
            >
              {totalSelected > 0 ? "Add & Continue" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
