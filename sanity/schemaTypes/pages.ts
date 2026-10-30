import { HelpCircleIcon } from "@sanity/icons/HelpCircle";
import { HomeIcon } from "@sanity/icons/Home";
import { InfoOutlineIcon } from "@sanity/icons/InfoOutline";
import { defineArrayMember, defineField, defineType } from "sanity";

// One singleton document per page (see sanity/structure.ts). The fields mirror the
// sections the pages render today, so the frontend can swap hardcoded text for these values.

const sectionHeading = (name: string, title: string, group?: string) =>
  defineField({
    name,
    title,
    type: "object",
    group,
    fields: [
      defineField({ name: "heading", title: "Heading", type: "string" }),
      defineField({ name: "subheading", title: "Subheading", type: "string" }),
    ],
  });

export const homePageType = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  icon: HomeIcon,
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "howItWorks", title: "How it works" },
    { name: "sections", title: "Other sections" },
  ],
  fields: [
    defineField({ name: "hero", title: "Hero", type: "hero", group: "hero" }),
    sectionHeading("howItWorksSection", "How it works heading", "howItWorks"),
    defineField({
      name: "steps",
      title: "Steps",
      type: "array",
      group: "howItWorks",
      of: [defineArrayMember({ type: "featureItem" })],
    }),
    sectionHeading("menuSection", "Menu preview heading", "sections"),
    sectionHeading("plansSection", "Plans heading", "sections"),
    defineField({ name: "cta", title: "Bottom banner", type: "cta", group: "sections" }),
  ],
  preview: { prepare: () => ({ title: "Home page" }) },
});

export const aboutPageType = defineType({
  name: "aboutPage",
  title: "About page",
  type: "document",
  icon: InfoOutlineIcon,
  fields: [
    defineField({ name: "hero", title: "Hero", type: "hero" }),
    defineField({
      name: "mission",
      title: "Mission",
      type: "object",
      fields: [
        defineField({ name: "heading", title: "Heading", type: "string" }),
        defineField({
          name: "paragraphs",
          title: "Paragraphs",
          type: "array",
          of: [defineArrayMember({ type: "text", rows: 4 })],
        }),
        defineField({
          name: "stats",
          title: "Stats",
          type: "array",
          of: [defineArrayMember({ type: "stat" })],
        }),
      ],
    }),
    sectionHeading("valuesSection", "Values heading"),
    defineField({
      name: "values",
      title: "Values",
      type: "array",
      of: [defineArrayMember({ type: "featureItem" })],
    }),
    sectionHeading("deliverySection", "Delivery heading"),
    defineField({ name: "cta", title: "Bottom banner", type: "cta" }),
  ],
  preview: { prepare: () => ({ title: "About page" }) },
});

export const howItWorksPageType = defineType({
  name: "howItWorksPage",
  title: "How it works page",
  type: "document",
  icon: HelpCircleIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "faq", title: "FAQ" },
  ],
  fields: [
    defineField({ name: "hero", title: "Hero", type: "hero", group: "content" }),
    defineField({
      name: "steps",
      title: "Steps",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "featureItem" })],
    }),
    sectionHeading("plansSection", "Plan comparison heading", "content"),
    sectionHeading("faqSection", "FAQ heading", "faq"),
    defineField({
      name: "faqs",
      title: "Questions",
      type: "array",
      group: "faq",
      of: [defineArrayMember({ type: "faqItem" })],
    }),
    defineField({ name: "cta", title: "Bottom banner", type: "cta", group: "content" }),
  ],
  preview: { prepare: () => ({ title: "How it works page" }) },
});
