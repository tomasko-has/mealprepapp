import type { SchemaTypeDefinition } from "sanity";
import { addOnType } from "./addOn";
import { mealType } from "./meal";
import { ctaType, faqItemType, featureItemType, heroType, linkType, statType } from "./objects";
import { aboutPageType, homePageType, howItWorksPageType } from "./pages";
import { planType } from "./plan";
import { preferenceType } from "./preference";
import { siteSettingsType } from "./siteSettings";
import { weekCollectionType } from "./weekCollection";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents
  mealType,
  preferenceType,
  weekCollectionType,
  planType,
  addOnType,
  // Singletons
  siteSettingsType,
  homePageType,
  aboutPageType,
  howItWorksPageType,
  // Objects
  linkType,
  heroType,
  ctaType,
  featureItemType,
  statType,
  faqItemType,
];

// Document types that exist exactly once, with _id equal to the type name.
export const SINGLETON_TYPES = new Set(["siteSettings", "homePage", "aboutPage", "howItWorksPage"]);
