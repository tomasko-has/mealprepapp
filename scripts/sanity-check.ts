// Smoke test for lib/sanity/queries.ts: calls every query and prints a short summary.
//
//   npm run sanity:check

import { existsSync } from "node:fs";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

async function main() {
  // Imported after loading .env.local so sanity/env.ts sees the variables.
  const q = await import("../lib/sanity/queries");

  const [meals, weeks, current, addOns, plans, pricing, preferences, settings, home, about, howItWorks] =
    await Promise.all([
      q.getMeals(),
      q.getWeekCollections(),
      q.getCurrentWeekMenu(),
      q.getAddOns(),
      q.getPlans(),
      q.getPlanPricing(),
      q.getPreferences(),
      q.getSiteSettings(),
      q.getHomePage(),
      q.getAboutPage(),
      q.getHowItWorksPage(),
    ]);

  const firstWeek = weeks[0] ? await q.getWeekMenu(weeks[0].handle) : null;
  const firstMeal = meals[0] ? await q.getMealBySlug(meals[0].id) : null;

  console.log("meals:", meals.length, "| first:", firstMeal);
  console.log("weeks:", weeks);
  console.log("week menu", weeks[0]?.handle, "->", firstWeek?.meals.length, "meals");
  console.log("current week:", current?.weekLabel, current?.startDate, current?.meals.length, "meals");
  console.log("add-ons:", addOns.map((a) => `${a.category}: ${a.name} €${a.price}`));
  console.log("plans:", plans.map((p) => `${p.planType} (${p.variants.length} variants)`));
  console.log("pricing:", pricing);
  console.log("preferences:", preferences);
  console.log("site settings:", settings);
  console.log("home hero:", home?.hero, "| steps:", home?.steps.length);
  console.log("about values:", about?.values.map((v) => v.title));
  console.log("faqs:", howItWorks?.faqs.length);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
