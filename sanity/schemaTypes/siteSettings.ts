import { CogIcon } from "@sanity/icons/Cog";
import { defineArrayMember, defineField, defineType } from "sanity";

const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const colorField = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    type: "string",
    description,
    validation: (rule) =>
      rule.regex(HEX_COLOR, { name: "hex color", invert: false }).error("Use a hex color like #059669"),
  });

export const WEEKDAYS = [
  { title: "Monday", value: "monday" },
  { title: "Tuesday", value: "tuesday" },
  { title: "Wednesday", value: "wednesday" },
  { title: "Thursday", value: "thursday" },
  { title: "Friday", value: "friday" },
  { title: "Saturday", value: "saturday" },
  { title: "Sunday", value: "sunday" },
];

// Singleton: there is exactly one document with _id "siteSettings" (see sanity/structure.ts).
export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "brand", title: "Brand", default: true },
    { name: "contact", title: "Contact" },
    { name: "delivery", title: "Delivery" },
  ],
  fields: [
    defineField({
      name: "companyName",
      title: "Company name",
      type: "string",
      group: "brand",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "text",
      rows: 2,
      group: "brand",
      description: "Short text shown in the footer.",
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      group: "brand",
      fields: [defineField({ name: "alt", title: "Alternative text", type: "string" })],
    }),
    defineField({
      name: "colors",
      title: "Brand colors",
      type: "object",
      group: "brand",
      options: { columns: 3 },
      fields: [
        colorField("primary", "Primary", "Buttons, links and highlights"),
        colorField("primaryDark", "Primary dark", "Hover states"),
        colorField("primaryLight", "Primary light", "Soft backgrounds"),
      ],
    }),
    defineField({
      name: "contact",
      title: "Contact",
      type: "object",
      group: "contact",
      fields: [
        defineField({ name: "email", title: "Email", type: "string", validation: (rule) => rule.email() }),
        defineField({ name: "phone", title: "Phone", type: "string" }),
        defineField({ name: "address", title: "Address", type: "text", rows: 3 }),
      ],
    }),
    defineField({
      name: "deliveryDays",
      title: "Delivery days",
      type: "array",
      group: "delivery",
      of: [
        defineArrayMember({
          type: "object",
          name: "deliveryDay",
          fields: [
            defineField({
              name: "day",
              title: "Day",
              type: "string",
              options: { list: WEEKDAYS },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "note",
              title: "What's delivered",
              type: "string",
              description: 'e.g. "Mon & Tue meals"',
            }),
          ],
          preview: {
            select: { title: "day", subtitle: "note" },
            prepare: ({ title, subtitle }) => ({
              title: title ? title.charAt(0).toUpperCase() + title.slice(1) : "Day",
              subtitle,
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site settings" }),
  },
});
