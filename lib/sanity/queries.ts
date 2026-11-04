// Typed GROQ queries for all Sanity content. Meals, add-ons and weekly menus come back in the
// shapes from lib/types.ts, so these functions can replace lib/shopify-queries.ts one by one.

import { defineQuery } from "next-sanity";
import type { PlanPricing } from "@/lib/pricing";
import type { AddOn, Meal, WeekMenu } from "@/lib/types";
import { sanityFetch } from "./client";
import type {
  AboutPage,
  HomePage,
  HowItWorksPage,
  Plan,
  PreferenceOption,
  SiteSettings,
  WeekCollectionSummary,
} from "./types";

// --- Reusable projections -------------------------------------------------------------------
// coalesce() turns missing fields into the defaults lib/types.ts expects (0, "", []).

const MEAL_FIELDS = /* groq */ `
  "id": slug.current,
  name,
  "description": coalesce(description, ""),
  "detailedDescription": coalesce(detailedDescription, ""),
  "tags": coalesce(tags[]->slug.current, []),
  "calories": coalesce(calories, 0),
  "protein": coalesce(protein, 0),
  "carbs": coalesce(carbs, 0),
  "fat": coalesce(fat, 0),
  "ingredients": coalesce(ingredients, []),
  "image": coalesce(image.asset->url, ""),
  "price": coalesce(price, 0)
`;

const ADD_ON_FIELDS = /* groq */ `
  "id": slug.current,
  name,
  "description": coalesce(description, ""),
  "price": coalesce(price, 0),
  category,
  "calories": coalesce(calories, 0),
  "protein": coalesce(protein, 0),
  "carbs": coalesce(carbs, 0),
  "fat": coalesce(fat, 0)
`;

const IMAGE = /* groq */ `{ "url": asset->url, "alt": coalesce(alt, "") }`;

const LINK = /* groq */ `{ label, href }`;

const HERO = /* groq */ `{
  badge,
  heading,
  highlight,
  "text": coalesce(text, ""),
  "image": select(defined(image.asset) => image${IMAGE}, null),
  "primaryCta": primaryCta${LINK},
  "secondaryCta": secondaryCta${LINK}
}`;

const CTA = /* groq */ `{ heading, "text": coalesce(text, ""), "button": button${LINK} }`;

const FEATURE_ITEMS = /* groq */ `{ title, "description": coalesce(description, ""), icon }`;

// --- Meals ----------------------------------------------------------------------------------

const MEALS_QUERY = defineQuery(`
  *[_type == "meal" && defined(slug.current)] | order(name asc) { ${MEAL_FIELDS} }
`);

const MEAL_BY_SLUG_QUERY = defineQuery(`
  *[_type == "meal" && slug.current == $slug][0] { ${MEAL_FIELDS} }
`);

/** All meals. Replaces `getProducts()`. */
export function getMeals(): Promise<Meal[]> {
  return sanityFetch<Meal[]>({ query: MEALS_QUERY, tags: ["meal"], fallback: [] });
}

/** One meal by slug. Replaces `getProductByHandle()`. */
export function getMealBySlug(slug: string): Promise<Meal | null> {
  return sanityFetch<Meal | null>({
    query: MEAL_BY_SLUG_QUERY,
    params: { slug },
    tags: ["meal"],
    fallback: null,
  });
}

// --- Weekly menus ---------------------------------------------------------------------------

const WEEK_COLLECTIONS_QUERY = defineQuery(`
  *[_type == "weekCollection" && defined(slug.current)] | order(weekStart asc) {
    "handle": slug.current,
    title,
    "startDate": weekStart
  }
`);

const WEEK_MENU_FIELDS = /* groq */ `
  "weekLabel": title,
  "startDate": weekStart,
  "meals": coalesce(meals[]->{ ${MEAL_FIELDS} }, [])
`;

const WEEK_MENU_BY_SLUG_QUERY = defineQuery(`
  *[_type == "weekCollection" && slug.current == $slug][0] { ${WEEK_MENU_FIELDS} }
`);

// The week that has started most recently; if none has started yet, the first upcoming one.
const CURRENT_WEEK_MENU_QUERY = defineQuery(`
  coalesce(
    *[_type == "weekCollection" && weekStart <= $today] | order(weekStart desc)[0],
    *[_type == "weekCollection"] | order(weekStart asc)[0]
  ) { ${WEEK_MENU_FIELDS} }
`);

/** All weekly menus, oldest first. Replaces `getWeekCollections()`. */
export function getWeekCollections(): Promise<WeekCollectionSummary[]> {
  return sanityFetch<WeekCollectionSummary[]>({
    query: WEEK_COLLECTIONS_QUERY,
    tags: ["weekCollection"],
    fallback: [],
  });
}

/** One weekly menu with its meals. `menu.meals` replaces `getProductsByCollection(handle)`. */
export function getWeekMenu(slug: string): Promise<WeekMenu | null> {
  return sanityFetch<WeekMenu | null>({
    query: WEEK_MENU_BY_SLUG_QUERY,
    params: { slug },
    tags: ["weekCollection", "meal"],
    fallback: null,
  });
}

/** The weekly menu for the current week. */
export function getCurrentWeekMenu(today: Date = new Date()): Promise<WeekMenu | null> {
  return sanityFetch<WeekMenu | null>({
    query: CURRENT_WEEK_MENU_QUERY,
    params: { today: today.toISOString().slice(0, 10) },
    tags: ["weekCollection", "meal"],
    fallback: null,
  });
}

// --- Add-ons --------------------------------------------------------------------------------

const ADD_ONS_QUERY = defineQuery(`
  *[_type == "addOn" && defined(slug.current)] | order(category asc, name asc) { ${ADD_ON_FIELDS} }
`);

/** All breakfast and snack add-ons. Filter by `category` for the old breakfast/snacks split. */
export function getAddOns(): Promise<AddOn[]> {
  return sanityFetch<AddOn[]>({ query: ADD_ONS_QUERY, tags: ["addOn"], fallback: [] });
}

// --- Plans ----------------------------------------------------------------------------------

const PLANS_QUERY = defineQuery(`
  *[_type == "plan"] | order(order asc, title asc) {
    "id": _id,
    title,
    planType,
    badge,
    "description": coalesce(description, ""),
    "features": coalesce(features, []),
    "variants": coalesce(variants[] { mealCount, price }, []) | order(mealCount asc)
  }
`);

/** Standard and Flexible plans with their price per meal count. Replaces `getPlanProducts()`. */
export function getPlans(): Promise<Plan[]> {
  return sanityFetch<Plan[]>({ query: PLANS_QUERY, tags: ["plan"], fallback: [] });
}

/**
 * Prices as `{ standard: { 10: 99.99, ... }, flexible: { ... } }`, the shape /api/plans returns.
 * Unlike the Shopify prices these are final: don't apply STANDARD_DISCOUNT on top.
 */
export async function getPlanPricing(): Promise<PlanPricing> {
  const plans = await getPlans();
  const pricing: PlanPricing = {};
  for (const plan of plans) {
    pricing[plan.planType] = Object.fromEntries(plan.variants.map((v) => [v.mealCount, v.price]));
  }
  return pricing;
}

// --- Dietary preferences --------------------------------------------------------------------

const PREFERENCES_QUERY = defineQuery(`
  *[_type == "preference" && defined(slug.current) && ($includeHidden || showInWizard != false)]
    | order(order asc, title asc) {
      "value": slug.current,
      "label": title,
      "description": coalesce(description, "")
    }
`);

/** Preference options for the wizard, same shape as PREFERENCE_OPTIONS in lib/data.ts. */
export function getPreferences({ includeHidden = false } = {}): Promise<PreferenceOption[]> {
  return sanityFetch<PreferenceOption[]>({
    query: PREFERENCES_QUERY,
    params: { includeHidden },
    tags: ["preference"],
    fallback: [],
  });
}

// --- Site settings and pages (singletons) ---------------------------------------------------

const SITE_SETTINGS_QUERY = defineQuery(`
  *[_id == "siteSettings"][0] {
    companyName,
    "tagline": coalesce(tagline, ""),
    "logo": select(defined(logo.asset) => logo${IMAGE}, null),
    "colors": {
      "primary": colors.primary,
      "primaryDark": colors.primaryDark,
      "primaryLight": colors.primaryLight
    },
    "contact": {
      "email": contact.email,
      "phone": contact.phone,
      "address": contact.address
    },
    "deliveryDays": coalesce(deliveryDays[] { day, "note": coalesce(note, "") }, [])
  }
`);

const HOME_PAGE_QUERY = defineQuery(`
  *[_id == "homePage"][0] {
    "hero": hero${HERO},
    howItWorksSection,
    "steps": coalesce(steps[]${FEATURE_ITEMS}, []),
    menuSection,
    plansSection,
    "cta": cta${CTA}
  }
`);

const ABOUT_PAGE_QUERY = defineQuery(`
  *[_id == "aboutPage"][0] {
    "hero": hero${HERO},
    "mission": mission {
      heading,
      "paragraphs": coalesce(paragraphs, []),
      "stats": coalesce(stats[] { value, label }, [])
    },
    valuesSection,
    "values": coalesce(values[]${FEATURE_ITEMS}, []),
    deliverySection,
    "cta": cta${CTA}
  }
`);

const HOW_IT_WORKS_PAGE_QUERY = defineQuery(`
  *[_id == "howItWorksPage"][0] {
    "hero": hero${HERO},
    "steps": coalesce(steps[]${FEATURE_ITEMS}, []),
    plansSection,
    faqSection,
    "faqs": coalesce(faqs[] { question, answer }, []),
    "cta": cta${CTA}
  }
`);

export function getSiteSettings(): Promise<SiteSettings | null> {
  return sanityFetch<SiteSettings | null>({
    query: SITE_SETTINGS_QUERY,
    tags: ["siteSettings"],
    fallback: null,
  });
}

export function getHomePage(): Promise<HomePage | null> {
  return sanityFetch<HomePage | null>({ query: HOME_PAGE_QUERY, tags: ["homePage"], fallback: null });
}

export function getAboutPage(): Promise<AboutPage | null> {
  return sanityFetch<AboutPage | null>({ query: ABOUT_PAGE_QUERY, tags: ["aboutPage"], fallback: null });
}

export function getHowItWorksPage(): Promise<HowItWorksPage | null> {
  return sanityFetch<HowItWorksPage | null>({
    query: HOW_IT_WORKS_PAGE_QUERY,
    tags: ["howItWorksPage"],
    fallback: null,
  });
}
