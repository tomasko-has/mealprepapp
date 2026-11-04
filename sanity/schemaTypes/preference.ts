import { TagIcon } from "@sanity/icons/Tag";
import { defineField, defineType } from "sanity";

// Dietary tags such as "High Protein" or "Keto". Meals reference them, and the
// get-started wizard lists them as preferences, so the client can add new ones in the Studio.
export const preferenceType = defineType({
  name: "preference",
  title: "Dietary preference",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      title: "Label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Value",
      type: "slug",
      description: 'Stable key used in code and URLs, e.g. "high-protein".',
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Short description",
      type: "string",
      description: 'Shown in the wizard, e.g. "30g+ protein per meal".',
    }),
    defineField({
      name: "showInWizard",
      title: "Show in get-started wizard",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "order",
      title: "Sort order",
      type: "number",
    }),
  ],
  orderings: [
    { title: "Sort order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
  },
});
