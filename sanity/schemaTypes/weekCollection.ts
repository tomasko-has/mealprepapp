import { CalendarIcon } from "@sanity/icons/Calendar";
import { defineArrayMember, defineField, defineType } from "sanity";

export const weekCollectionType = defineType({
  name: "weekCollection",
  title: "Weekly menu",
  type: "document",
  icon: CalendarIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: 'Label shown in the week selector, e.g. "Week 1".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "weekStart",
      title: "Week starts on",
      type: "date",
      description: "First day (Monday) of the delivery week.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "meals",
      title: "Meals",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "meal" }] })],
      validation: (rule) => rule.unique().min(1),
    }),
  ],
  orderings: [
    { title: "Week start, newest", name: "weekStartDesc", by: [{ field: "weekStart", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title", weekStart: "weekStart", meals: "meals" },
    prepare: ({ title, weekStart, meals }) => ({
      title,
      subtitle: [weekStart, `${meals?.length ?? 0} meals`].filter(Boolean).join(" · "),
    }),
  },
});
