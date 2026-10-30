import { PackageIcon } from "@sanity/icons/Package";
import { defineField, defineType } from "sanity";
import { imageWithAltField, nutritionFields, nutritionFieldset, priceField } from "./fields";

export const addOnType = defineType({
  name: "addOn",
  title: "Add-on",
  type: "document",
  icon: PackageIcon,
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
      description: "Used as the add-on id in carts.",
      options: { source: "name" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Breakfast", value: "breakfast" },
          { title: "Snack", value: "snack" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    imageWithAltField,
    priceField,
    ...nutritionFields,
    defineField({
      name: "sku",
      title: "SKU",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "name", category: "category", price: "price", media: "image" },
    prepare: ({ title, category, price, media }) => ({
      title,
      subtitle: [category, price != null && `€${price}`].filter(Boolean).join(" · "),
      media,
    }),
  },
});
