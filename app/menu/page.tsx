import { Suspense } from "react";
import { getProducts } from "@/lib/shopify-queries";
import MenuContent from "./menu-content";

export default async function MenuPage() {
  const meals = await getProducts();

  return (
    <Suspense fallback={<div className="min-h-[80vh] bg-[#e8e8e4]" />}>
      <MenuContent meals={meals} />
    </Suspense>
  );
}
