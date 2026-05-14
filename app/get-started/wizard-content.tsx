"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/step-indicator";
import { saveWizardSelections, loadWizardSelections } from "@/lib/wizard-storage";
import {
  GOALS_OPTIONS,
  PREFERENCE_OPTIONS,
  AVOID_OPTIONS,
} from "@/lib/data";
import {
  STANDARD_DISCOUNT,
  getAveragePrice,
  getStandardWeeklyPrice,
  getFlexibleWeeklyPrice,
  formatPrice,
} from "@/lib/pricing";
import type {
  Goal,
  MealPreference,
  AvoidIngredient,
  MealsPerDay,
  DaysPerWeek,
  UserSelections,
  Meal,
} from "@/lib/types";

const STEP_LABELS = ["Goals", "Preferences", "Avoid", "Meals/Day", "Days/Week", "Plan"];

const initialSelections: UserSelections = {
  goals: [],
  preferences: [],
  avoid: [],
  mealsPerDay: null,
  daysPerWeek: null,
  planType: null,
};

export default function WizardContent({ meals }: { meals: Meal[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState<UserSelections>(initialSelections);
  const [loaded, setLoaded] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const goToStep = useCallback((newStep: number) => {
    setDirection(newStep > step ? "forward" : "back");
    setAnimKey((k) => k + 1);
    setStep(newStep);
    window.history.pushState(null, "", `/get-started?step=${newStep}`);
  }, [step]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = Number(params.get("step"));
    if (s >= 1 && s <= 6) setStep(s);

    const saved = loadWizardSelections();
    if (saved) setSelections(saved);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveWizardSelections(selections);
  }, [selections, loaded]);

  useEffect(() => {
    function onPopState() {
      const params = new URLSearchParams(window.location.search);
      const s = Number(params.get("step"));
      setStep(s >= 1 && s <= 6 ? s : 1);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const totalMeals =
    (selections.mealsPerDay ?? 0) * (selections.daysPerWeek ?? 0);

  const avgPrice = getAveragePrice(meals);
  const standardWeekly = getStandardWeeklyPrice(
    avgPrice,
    selections.mealsPerDay ?? 0,
    selections.daysPerWeek ?? 0
  );
  const flexibleWeekly = getFlexibleWeeklyPrice(
    avgPrice,
    selections.mealsPerDay ?? 0,
    selections.daysPerWeek ?? 0
  );
  const standardPerMeal = totalMeals > 0 ? standardWeekly / totalMeals : 0;

  function toggleGoal(goal: Goal) {
    setSelections((s) => ({
      ...s,
      goals: s.goals.includes(goal)
        ? s.goals.filter((g) => g !== goal)
        : [...s.goals, goal],
    }));
  }

  function togglePreference(pref: MealPreference) {
    setSelections((s) => ({
      ...s,
      preferences: s.preferences.includes(pref)
        ? s.preferences.filter((p) => p !== pref)
        : [...s.preferences, pref],
    }));
  }

  function toggleAvoid(item: AvoidIngredient) {
    setSelections((s) => ({
      ...s,
      avoid: s.avoid.includes(item)
        ? s.avoid.filter((a) => a !== item)
        : [...s.avoid, item],
    }));
  }

  function canAdvance(): boolean {
    switch (step) {
      case 1: return selections.goals.length > 0;
      case 2: return selections.preferences.length > 0;
      case 3: return true;
      case 4: return selections.mealsPerDay !== null;
      case 5: return selections.daysPerWeek !== null;
      case 6: return selections.planType !== null;
      default: return false;
    }
  }

  return (
    <div className="min-h-[80vh] bg-[#e8e8e4] py-12">
      <div className="max-w-3xl mx-auto px-4">
        <StepIndicator currentStep={step} totalSteps={6} labels={STEP_LABELS} />

        <div
          key={animKey}
          className="animate-step-transition"
          style={{
            ["--slide-from" as string]: direction === "forward" ? "30px" : "-30px",
          }}
        >

        {/* Step 1: Goals */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
              What are your goals?
            </h2>
            <p className="text-gray-500 text-center mb-8">Select all that apply</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              {GOALS_OPTIONS.map((opt) => {
                const active = selections.goals.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleGoal(opt.value)}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${
                      active
                        ? "border-primary bg-primary-light/50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className="text-base font-semibold text-gray-900">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Meal Preferences */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
              Meal preferences
            </h2>
            <p className="text-gray-500 text-center mb-8">What kind of meals do you prefer?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              {PREFERENCE_OPTIONS.map((opt) => {
                const active = selections.preferences.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => togglePreference(opt.value)}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${
                      active
                        ? "border-primary bg-primary-light/50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className="text-base font-semibold text-gray-900 block">
                      {opt.label}
                    </span>
                    <span className="text-sm text-gray-500">{opt.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Avoid */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
              Anything to avoid?
            </h2>
            <p className="text-gray-500 text-center mb-8">Optional — skip if none</p>
            <div className="flex gap-4 justify-center">
              {AVOID_OPTIONS.map((opt) => {
                const active = selections.avoid.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleAvoid(opt.value)}
                    className={`px-8 py-4 rounded-2xl border-2 font-semibold transition-all ${
                      active
                        ? "border-primary bg-primary-light/50 text-gray-900"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Meals Per Day */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
              Meals per day
            </h2>
            <p className="text-gray-500 text-center mb-8">How many meals do you need daily?</p>
            <div className="flex gap-4 justify-center">
              {([1, 2, 3] as MealsPerDay[]).map((n) => {
                const active = selections.mealsPerDay === n;
                const labels: Record<number, string> = {
                  1: "1 meal",
                  2: "2 meals",
                  3: "3 meals",
                };
                const sublabels: Record<number, string> = {
                  1: "Lunch or Dinner",
                  2: "Lunch & Dinner",
                  3: "Full Day",
                };
                return (
                  <button
                    key={n}
                    onClick={() => setSelections((s) => ({ ...s, mealsPerDay: n }))}
                    className={`px-6 py-5 rounded-2xl border-2 text-center transition-all min-w-[120px] ${
                      active
                        ? "border-primary bg-primary-light/50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className="block text-xl font-bold text-gray-900">{labels[n]}</span>
                    <span className="text-sm text-gray-500">{sublabels[n]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Days Per Week */}
        {step === 5 && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
              Days per week
            </h2>
            <p className="text-gray-500 text-center mb-8">How many days should we deliver?</p>
            <div className="flex gap-4 justify-center">
              {([5, 6, 7] as DaysPerWeek[]).map((n) => {
                const active = selections.daysPerWeek === n;
                const sublabels: Record<number, string> = {
                  5: "Weekdays",
                  6: "Mon - Sat",
                  7: "Everyday",
                };
                return (
                  <button
                    key={n}
                    onClick={() => setSelections((s) => ({ ...s, daysPerWeek: n }))}
                    className={`px-6 py-5 rounded-2xl border-2 text-center transition-all min-w-[120px] ${
                      active
                        ? "border-primary bg-primary-light/50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className="block text-xl font-bold text-gray-900">{n} days</span>
                    <span className="text-sm text-gray-500">{sublabels[n]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 6: Plan Type */}
        {step === 6 && (
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
              Choose your plan
            </h2>
            <p className="text-gray-500 text-center mb-8">
              {totalMeals} meals per week
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Standard */}
              <button
                onClick={() => setSelections((s) => ({ ...s, planType: "standard" }))}
                className={`relative p-8 rounded-2xl border-2 text-left transition-all ${
                  selections.planType === "standard"
                    ? "border-primary bg-primary-light/30 ring-2 ring-primary"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className="absolute -top-3 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  Recommended
                </span>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-2 mb-6">Standard Plan</h3>
                <p className="text-base text-gray-500 mt-3 mb-5">
                  Pre-selected meals optimized for your preferences. No decisions needed.
                </p>
                <div className="text-4xl font-bold text-gray-900">
                  {formatPrice(standardWeekly)}
                  <span className="text-lg font-normal text-gray-500">/week</span>
                </div>
                <p className="text-base text-primary font-semibold mt-2">
                  {formatPrice(standardPerMeal)} per meal — {Math.round(STANDARD_DISCOUNT * 100)}% off
                </p>
                <ul className="mt-6 space-y-3 text-base text-gray-600">
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    No decision fatigue
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    Auto-renewed weekly
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    Discounted price
                  </li>
                </ul>
              </button>

              {/* Flexible */}
              <button
                onClick={() => setSelections((s) => ({ ...s, planType: "flexible" }))}
                className={`p-8 rounded-2xl border-2 text-left transition-all ${
                  selections.planType === "flexible"
                    ? "border-primary bg-primary-light/30 ring-2 ring-primary"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <h3 className="text-3xl font-extrabold text-gray-900 mt-2 mb-6">Flexible Plan</h3>
                <p className="text-base text-gray-500 mt-3 mb-5">
                  Pick your own meals each week from our rotating menu of 14 options.
                </p>
                <div className="text-4xl font-bold text-gray-900">
                  ~{formatPrice(flexibleWeekly)}
                  <span className="text-lg font-normal text-gray-500">/week</span>
                </div>
                <p className="text-base text-gray-500 mt-2">
                  ~{formatPrice(avgPrice)} per meal avg — final price based on your picks
                </p>
                <ul className="mt-6 space-y-3 text-base text-gray-600">
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    Full meal control
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    Choose from 14 meals weekly
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    Pick duplicates allowed
                  </li>
                </ul>
              </button>
            </div>
          </div>
        )}

        </div>{/* end animate-step-transition */}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 max-w-2xl mx-auto">
          {step > 1 ? (
            <button
              onClick={() => goToStep(step - 1)}
              className="text-gray-500 font-semibold hover:text-gray-900 transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}
          {step < 6 ? (
            <button
              onClick={() => canAdvance() && goToStep(step + 1)}
              disabled={!canAdvance()}
              className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={() => {
                if (!canAdvance()) return;
                saveWizardSelections(selections);
                router.push(
                  selections.planType === "flexible" ? "/menu?select=true" : "/menu"
                );
              }}
              className={`bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors ${
                !canAdvance() ? "opacity-40 pointer-events-none" : ""
              }`}
            >
              {selections.planType === "flexible" ? "Choose Your Meals" : "View Your Menu"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
