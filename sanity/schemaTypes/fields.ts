import { defineField } from "sanity";

// Nutrition values shared by meals and add-ons. They stay flat on the document
// (calories, protein, ...) so GROQ results map 1:1 onto `Meal` and `AddOn` in lib/types.ts.
// They're not hard-required because the Shopify export didn't contain them;
// the Studio shows a warning until someone fills them in.
export const nutritionFieldset = {
  name: "nutrition",
  title: "Nutrition (per serving)",
  options: { columns: 2 },
};

export const nutritionFields = [
  defineField({
    name: "calories",
    title: "Calories (kcal)",
    type: "number",
    fieldset: "nutrition",
    validation: (rule) => [rule.min(0).integer(), rule.required().warning("Missing calories")],
  }),
  defineField({
    name: "protein",
    title: "Protein (g)",
    type: "number",
    fieldset: "nutrition",
    validation: (rule) => [rule.min(0), rule.required().warning("Missing protein")],
  }),
  defineField({
    name: "carbs",
    title: "Carbs (g)",
    type: "number",
    fieldset: "nutrition",
    validation: (rule) => [rule.min(0), rule.required().warning("Missing carbs")],
  }),
  defineField({
    name: "fat",
    title: "Fat (g)",
    type: "number",
    fieldset: "nutrition",
    validation: (rule) => [rule.min(0), rule.required().warning("Missing fat")],
  }),
];

export const priceField = defineField({
  name: "price",
  title: "Price (€)",
  type: "number",
  validation: (rule) => rule.required().min(0).precision(2),
});

export const imageWithAltField = defineField({
  name: "image",
  title: "Photo",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Alternative text",
      type: "string",
      description: "Short description of the photo for screen readers and SEO.",
    }),
  ],
});
