import { CreditCardIcon } from "@sanity/icons/CreditCard";
import { defineArrayMember, defineField, defineType } from "sanity";

export const PLAN_TYPES = [
  { title: "Standard (we pick the meals)", value: "standard" },
  { title: "Flexible (customer picks the meals)", value: "flexible" },
];

export const planType = defineType({
  name: "plan",
  title: "Plan",
  type: "document",
  icon: CreditCardIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "planType",
      title: "Plan type",
      type: "string",
      options: { list: PLAN_TYPES, layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "badge",
      title: "Badge",
      type: "string",
      description: 'Optional highlight label, e.g. "Recommended".',
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "features",
      title: "Features",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "variants",
      title: "Prices per variant",
      description:
        "Final weekly price the customer pays for each number of meals per week (discounts already included).",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "planVariant",
          fields: [
            defineField({
              name: "mealCount",
              title: "Meals per week",
              type: "number",
              validation: (rule) => rule.required().integer().min(1),
            }),
            defineField({
              name: "price",
              title: "Weekly price (€)",
              type: "number",
              validation: (rule) => rule.required().min(0).precision(2),
            }),
          ],
          preview: {
            select: { mealCount: "mealCount", price: "price" },
            prepare: ({ mealCount, price }) => ({
              title: `${mealCount} meals`,
              subtitle: price != null ? `€${price}` : undefined,
            }),
          },
        }),
      ],
      validation: (rule) =>
        rule.custom((variants: { mealCount?: number }[] | undefined) => {
          const counts = (variants ?? []).map((v) => v.mealCount);
          return new Set(counts).size === counts.length || "Each meal count can only appear once";
        }),
    }),
    defineField({
      name: "order",
      title: "Sort order",
      type: "number",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "planType" },
  },
});
