import { Suspense } from "react";
import { getProducts } from "@/lib/shopify-queries";
import MenuContent from "./menu-content";

export default async function MenuPage() {
  const meals = await getProducts();

  return (
    <Suspense fallback={<div className="min-h-[80vh] bg-gray-50" />}>
      <MenuContent meals={meals} />
    </Suspense>
  );
}
