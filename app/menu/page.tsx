import type { Metadata } from "next";
import { Suspense } from "react";
import { getWeekCollections, getProductsByCollection } from "@/lib/shopify-queries";
import MenuContent from "./menu-content";

export const metadata: Metadata = {
  title: "Weekly Menu",
  description: "Browse this week's chef-prepared meals with full nutrition info, and filter by your dietary preferences.",
};

export default async function MenuPage() {
  const weeks = await getWeekCollections();
  const currentWeek = weeks[0];
  const meals = currentWeek
    ? await getProductsByCollection(currentWeek.handle)
    : [];

  return (
    <Suspense fallback={<div className="min-h-[80vh] bg-[#e8e8e4]" />}>
      <MenuContent meals={meals} />
    </Suspense>
  );
}
