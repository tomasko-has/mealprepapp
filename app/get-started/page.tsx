import { Suspense } from "react";
import { getProducts } from "@/lib/shopify-queries";
import WizardContent from "./wizard-content";

export default async function GetStartedPage() {
  const meals = await getProducts();

  return (
    <Suspense fallback={<div className="min-h-[80vh] bg-[#e8e8e4]" />}>
      <WizardContent meals={meals} />
    </Suspense>
  );
}
