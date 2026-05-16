import { getPlanProducts } from "@/lib/shopify-queries";
import { createCart } from "@/lib/cart";
import type { OrderData } from "@/lib/order-storage";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const { planType, selectedMeals, selectedAddOns, mealsPerDay, daysPerWeek } = body;
    if (!planType || !selectedMeals || !mealsPerDay || !daysPerWeek) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const order: OrderData & { goals?: string[]; avoid?: string[] } = {
      planType,
      selectedMeals,
      selectedAddOns: selectedAddOns ?? [],
      mealsPerDay,
      daysPerWeek,
      goals: body.goals,
      avoid: body.avoid,
    };

    // Fetch plan products from Shopify
    const planProducts = await getPlanProducts();
    if (planProducts.length === 0) {
      return Response.json(
        { error: "No plan products found in Shopify" },
        { status: 500 }
      );
    }

    // Create the cart
    const result = await createCart(order, planProducts);

    if (result.error) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json({ checkoutUrl: result.checkoutUrl });
  } catch (err) {
    console.error("Cart API error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
