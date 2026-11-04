import { defineField, defineType } from "sanity";

// Reusable building blocks for the page singletons in pages.ts.

// Icons are drawn in code (components/*); editors pick one by name.
export const ICON_OPTIONS = [
  { title: "Person / goals", value: "user" },
  { title: "Clipboard / plan", value: "clipboard" },
  { title: "Flame / cooking", value: "flame" },
  { title: "Truck / delivery", value: "truck" },
  { title: "Leaf / fresh", value: "leaf" },
  { title: "Scale / balance", value: "scale" },
  { title: "Clock / time", value: "clock" },
  { title: "Sparkles", value: "sparkles" },
];

export const linkType = defineType({
  name: "link",
  title: "Button",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "href",
      title: "Link",
      type: "string",
      description: 'Internal path like "/get-started", an anchor like "#menu", or a full URL.',
      validation: (rule) => rule.required(),
    }),
  ],
});

export const heroType = defineType({
  name: "hero",
  title: "Hero",
  type: "object",
  fields: [
    defineField({ name: "badge", title: "Badge", type: "string", description: "Small label above the heading." }),
    defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "highlight",
      title: "Highlighted heading text",
      type: "string",
      description: "Optional second part of the heading, shown in the brand color.",
    }),
    defineField({ name: "text", title: "Text", type: "text", rows: 3 }),
    defineField({
      name: "image",
      title: "Background image",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alternative text", type: "string" })],
    }),
    defineField({ name: "primaryCta", title: "Primary button", type: "link" }),
    defineField({ name: "secondaryCta", title: "Secondary button", type: "link" }),
  ],
});

export const ctaType = defineType({
  name: "cta",
  title: "Call to action banner",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "text", title: "Text", type: "text", rows: 2 }),
    defineField({ name: "button", title: "Button", type: "link" }),
  ],
});

export const featureItemType = defineType({
  name: "featureItem",
  title: "Item",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({ name: "icon", title: "Icon", type: "string", options: { list: ICON_OPTIONS } }),
  ],
  preview: { select: { title: "title", subtitle: "description" } },
});

export const statType = defineType({
  name: "stat",
  title: "Stat",
  type: "object",
  fields: [
    defineField({ name: "value", title: "Value", type: "string", description: 'e.g. "14" or "3x"' }),
    defineField({ name: "label", title: "Label", type: "string" }),
  ],
  preview: { select: { title: "value", subtitle: "label" } },
});

export const faqItemType = defineType({
  name: "faqItem",
  title: "Question",
  type: "object",
  fields: [
    defineField({ name: "question", title: "Question", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "answer", title: "Answer", type: "text", rows: 4, validation: (rule) => rule.required() }),
  ],
  preview: { select: { title: "question", subtitle: "answer" } },
});
