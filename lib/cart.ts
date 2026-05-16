import { shopifyClient } from "./shopify";
import type { PlanProduct } from "./shopify-queries";
import type { OrderData } from "./order-storage";

const CART_CREATE_MUTATION = `#graphql
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export interface CartResult {
  checkoutUrl: string | null;
  error: string | null;
}

/**
 * Find the plan product matching the order's planType.
 * "ORA Standard Plan" for standard, "ORA Flexible Plan" for flexible.
 */
export function findPlanProduct(
  planProducts: PlanProduct[],
  planType: "standard" | "flexible"
): PlanProduct | undefined {
  const keyword = planType === "standard" ? "standard" : "flexible";
  return planProducts.find((p) =>
    p.title.toLowerCase().includes(keyword)
  );
}

/**
 * Find the variant whose title contains the meal count number.
 * Variant titles are like "5 Meals", "10 Meals", "15 Meals", etc.
 */
export function findVariant(
  product: PlanProduct,
  mealCount: number
): PlanProduct["variants"][number] | undefined {
  return product.variants.find((v) => {
    const match = v.title.match(/(\d+)/);
    return match && parseInt(match[1], 10) === mealCount;
  });
}

/**
 * Get the first selling plan from the product.
 * Each plan product has exactly one selling plan group with one plan.
 */
export function findSellingPlan(
  product: PlanProduct
): PlanProduct["sellingPlans"][number] | undefined {
  return product.sellingPlans[0];
}

/**
 * Build cart attributes from wizard selections.
 */
function buildCartAttributes(order: OrderData & { goals?: string[]; avoid?: string[] }) {
  const attrs: { key: string; value: string }[] = [
    { key: "planType", value: order.planType },
    { key: "mealsPerDay", value: String(order.mealsPerDay) },
    { key: "daysPerWeek", value: String(order.daysPerWeek) },
  ];
  if (order.goals) {
    attrs.push({ key: "goals", value: JSON.stringify(order.goals) });
  }
  if (order.avoid) {
    attrs.push({ key: "avoid", value: JSON.stringify(order.avoid) });
  }
  return attrs;
}

/**
 * Build the cart note containing selected meal IDs + quantities.
 */
function buildCartNote(order: OrderData): string {
  const meals = order.selectedMeals.map((m) => ({
    id: m.meal.id,
    name: m.meal.name,
    qty: m.quantity,
  }));
  return JSON.stringify(meals);
}

export async function createCart(
  order: OrderData & { goals?: string[]; avoid?: string[] },
  planProducts: PlanProduct[]
): Promise<CartResult> {
  // 1. Find plan product
  const planProduct = findPlanProduct(planProducts, order.planType);
  if (!planProduct) {
    return { checkoutUrl: null, error: `Plan product not found for type: ${order.planType}` };
  }

  // 2. Find variant for meal count
  const mealCount = order.mealsPerDay * order.daysPerWeek;
  const variant = findVariant(planProduct, mealCount);
  if (!variant) {
    return { checkoutUrl: null, error: `No variant found for ${mealCount} meals` };
  }

  // 3. Find selling plan
  const sellingPlan = findSellingPlan(planProduct);
  if (!sellingPlan) {
    return { checkoutUrl: null, error: "No selling plan found" };
  }

  // 4. Build cart lines
  const lines: Array<{
    merchandiseId: string;
    quantity: number;
    sellingPlanId?: string;
  }> = [];

  // Plan subscription line
  lines.push({
    merchandiseId: variant.id,
    quantity: 1,
    sellingPlanId: sellingPlan.id,
  });

  // 5. Create cart
  const { data, errors } = await shopifyClient.request(CART_CREATE_MUTATION, {
    variables: {
      input: {
        lines,
        attributes: buildCartAttributes(order),
        note: buildCartNote(order),
      },
    },
  });

  if (errors) {
    console.error("Cart creation errors:", errors);
    return { checkoutUrl: null, error: "Failed to create cart" };
  }

  const userErrors = data?.cartCreate?.userErrors ?? [];
  if (userErrors.length > 0) {
    console.error("Cart user errors:", userErrors);
    return {
      checkoutUrl: null,
      error: userErrors.map((e: { message: string }) => e.message).join(", "),
    };
  }

  const checkoutUrl = data?.cartCreate?.cart?.checkoutUrl;
  if (!checkoutUrl) {
    return { checkoutUrl: null, error: "No checkout URL returned" };
  }

  return { checkoutUrl, error: null };
}
