import { BasketIcon } from "@sanity/icons/Basket";
import { defineArrayMember, defineField, defineType } from "sanity";
import { imageWithAltField, nutritionFields, nutritionFieldset, priceField } from "./fields";

export const mealType = defineType({
  name: "meal",
  title: "Meal",
  type: "document",
  icon: BasketIcon,
  fieldsets: [nutritionFieldset],
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "Used in the meal URL (/menu/<slug>) and as the meal id in carts.",
      options: { source: "name" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Short description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "detailedDescription",
      title: "Detailed description",
      type: "text",
      rows: 6,
    }),
    imageWithAltField,
    priceField,
    ...nutritionFields,
    defineField({
      name: "tags",
      title: "Dietary tags",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "preference" }] })],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "ingredients",
      title: "Ingredients",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
  ],
  preview: {
    select: { title: "name", price: "price", calories: "calories", media: "image" },
    prepare: ({ title, price, calories, media }) => ({
      title,
      subtitle: [price != null && `€${price}`, calories != null && `${calories} kcal`]
        .filter(Boolean)
        .join(" · "),
      media,
    }),
  },
});
