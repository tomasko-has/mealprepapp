// Shapes returned by lib/sanity/queries.ts for content that has no counterpart in lib/types.ts.
// Meals, add-ons and weekly menus reuse `Meal`, `AddOn` and `WeekMenu` from lib/types.ts.

import type { MealPreference, PlanType } from "@/lib/types";

export interface WeekCollectionSummary {
  /** Slug, used like the old Shopify collection handle. */
  handle: string;
  title: string;
  /** ISO date (YYYY-MM-DD) of the first day of the week. */
  startDate: string;
}

export interface PlanVariant {
  mealCount: number;
  /** Final weekly price in EUR; discounts are already included. */
  price: number;
}

export interface Plan {
  id: string;
  title: string;
  planType: PlanType;
  badge: string | null;
  description: string;
  features: string[];
  variants: PlanVariant[];
}

export interface PreferenceOption {
  value: MealPreference | (string & {});
  label: string;
  description: string;
}

export interface Link {
  label: string;
  href: string;
}

export interface Image {
  url: string;
  alt: string;
}

export interface SectionHeading {
  heading: string;
  subheading: string;
}

export interface HeroContent {
  badge: string | null;
  heading: string;
  highlight: string | null;
  text: string;
  image: Image | null;
  primaryCta: Link | null;
  secondaryCta: Link | null;
}

export interface CtaContent {
  heading: string;
  text: string;
  button: Link | null;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: string | null;
}

export interface SiteSettings {
  companyName: string;
  tagline: string;
  logo: Image | null;
  colors: { primary: string | null; primaryDark: string | null; primaryLight: string | null };
  contact: { email: string | null; phone: string | null; address: string | null };
  deliveryDays: { day: string; note: string }[];
}

export interface HomePage {
  hero: HeroContent | null;
  howItWorksSection: SectionHeading | null;
  steps: FeatureItem[];
  menuSection: SectionHeading | null;
  plansSection: SectionHeading | null;
  cta: CtaContent | null;
}

export interface AboutPage {
  hero: HeroContent | null;
  mission: { heading: string; paragraphs: string[]; stats: { value: string; label: string }[] } | null;
  valuesSection: SectionHeading | null;
  values: FeatureItem[];
  deliverySection: SectionHeading | null;
  cta: CtaContent | null;
}

export interface HowItWorksPage {
  hero: HeroContent | null;
  steps: FeatureItem[];
  plansSection: SectionHeading | null;
  faqSection: SectionHeading | null;
  faqs: { question: string; answer: string }[];
  cta: CtaContent | null;
}
