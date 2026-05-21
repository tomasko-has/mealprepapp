import { getPlanProducts } from "@/lib/shopify-queries";

export async function GET() {
  const products = await getPlanProducts();

  const pricing: Record<string, Record<number, number>> = {};

  for (const product of products) {
    const key = product.handle.includes("standard") ? "standard" : "flexible";
    pricing[key] = {};
    for (const variant of product.variants) {
      const mealCount = parseInt(variant.title, 10);
      if (!isNaN(mealCount)) {
        pricing[key][mealCount] = parseFloat(variant.price.amount);
      }
    }
  }

  return Response.json(pricing);
}
