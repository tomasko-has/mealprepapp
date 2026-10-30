import type Stripe from "stripe";
import { getStripe } from "./stripe";
import { calculateOrderTotals, toCents, type OrderTotals } from "./pricing";
import type { CatalogItem } from "./catalog";
import type { PlanType } from "./types";

/** What the browser sends: only ids and quantities, never prices. */
export interface CheckoutRequest {
  planType: PlanType;
  mealsPerDay: number;
  daysPerWeek: number;
  meals: { id: string; quantity: number }[];
  addOns: { id: string; quantity: number }[];
}

/** A cart line with a trusted, server-side price. */
export interface CartLine {
  id: string;
  name: string;
  unitAmount: number; // cents
  quantity: number;
}

/** A fully priced cart — the only input `createCheckoutSession` needs. */
export interface Cart {
  planType: PlanType;
  mealsPerDay: number;
  daysPerWeek: number;
  meals: CartLine[];
  addOns: CartLine[];
  totals: OrderTotals;
}

export class CheckoutError extends Error {}

const MAX_QUANTITY = 50;

function parseLines(value: unknown, field: string): { id: string; quantity: number }[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new CheckoutError(`${field} must be an array`);

  // Merge duplicate ids so the same meal can't appear twice
  const merged = new Map<string, number>();
  for (const line of value) {
    const id = line?.id;
    const quantity = line?.quantity;
    if (typeof id !== "string" || id.length === 0) {
      throw new CheckoutError(`${field}: invalid id`);
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      throw new CheckoutError(`${field}: invalid quantity for ${id}`);
    }
    merged.set(id, (merged.get(id) ?? 0) + quantity);
  }
  return [...merged].map(([id, quantity]) => ({ id, quantity }));
}

/** Validates the raw JSON body from the browser. Throws CheckoutError on bad input. */
export function parseCheckoutRequest(body: unknown): CheckoutRequest {
  const data = (body ?? {}) as Record<string, unknown>;
  const { planType, mealsPerDay, daysPerWeek } = data;

  if (planType !== "standard" && planType !== "flexible") {
    throw new CheckoutError("Invalid plan type");
  }
  if (mealsPerDay !== 1 && mealsPerDay !== 2 && mealsPerDay !== 3) {
    throw new CheckoutError("Invalid meals per day");
  }
  if (daysPerWeek !== 5 && daysPerWeek !== 6 && daysPerWeek !== 7) {
    throw new CheckoutError("Invalid days per week");
  }

  const meals = parseLines(data.meals, "meals");
  const addOns = parseLines(data.addOns, "addOns");

  const mealCount = meals.reduce((sum, { quantity }) => sum + quantity, 0);
  if (mealCount !== mealsPerDay * daysPerWeek) {
    throw new CheckoutError(`Expected ${mealsPerDay * daysPerWeek} meals, got ${mealCount}`);
  }

  return { planType, mealsPerDay, daysPerWeek, meals, addOns };
}

/** Attaches trusted catalog prices to the request. Throws if an id is unknown or of the wrong kind. */
export function priceCart(request: CheckoutRequest, catalog: Map<string, CatalogItem>): Cart {
  function toCartLines(lines: CheckoutRequest["meals"], kind: CatalogItem["kind"]): CartLine[] {
    return lines.map(({ id, quantity }) => {
      const item = catalog.get(id);
      if (!item || item.kind !== kind) {
        throw new CheckoutError(`Unknown ${kind}: ${id}`);
      }
      return { id, name: item.name, unitAmount: toCents(item.price), quantity };
    });
  }

  const meals = toCartLines(request.meals, "meal");
  const addOns = toCartLines(request.addOns, "addon");

  return {
    planType: request.planType,
    mealsPerDay: request.mealsPerDay,
    daysPerWeek: request.daysPerWeek,
    meals,
    addOns,
    totals: calculateOrderTotals(request.planType, meals, addOns),
  };
}

/**
 * Stripe metadata values are limited to 500 characters, so long lists are split
 * across numbered keys: meals_0, meals_1, ...
 */
function encodeLines(prefix: string, lines: CartLine[]): Record<string, string> {
  const encoded = lines.map(({ id, quantity }) => `${id}:${quantity}`);
  const chunks: string[] = [];
  let current = "";
  for (const part of encoded) {
    const next = current ? `${current},${part}` : part;
    if (next.length > 500) {
      chunks.push(current);
      current = part;
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);
  return Object.fromEntries(chunks.map((chunk, i) => [`${prefix}_${i}`, chunk]));
}

function decodeLines(prefix: string, metadata: Record<string, string>): { id: string; quantity: number }[] {
  const chunks: string[] = [];
  for (let i = 0; metadata[`${prefix}_${i}`]; i++) chunks.push(metadata[`${prefix}_${i}`]);
  return chunks
    .flatMap((chunk) => chunk.split(","))
    .map((part) => {
      const [id, quantity] = part.split(":");
      return { id, quantity: Number(quantity) };
    });
}

/** Reads the order back from Checkout Session or Subscription metadata (used by the webhook). */
export function decodeOrderMetadata(metadata: Record<string, string>) {
  return {
    planType: metadata.planType,
    mealsPerDay: Number(metadata.mealsPerDay),
    daysPerWeek: Number(metadata.daysPerWeek),
    meals: decodeLines("meals", metadata),
    addOns: decodeLines("addOns", metadata),
  };
}

function buildMetadata(cart: Cart): Record<string, string> {
  return {
    planType: cart.planType,
    mealsPerDay: String(cart.mealsPerDay),
    daysPerWeek: String(cart.daysPerWeek),
    ...encodeLines("meals", cart.meals),
    ...encodeLines("addOns", cart.addOns),
  };
}

function buildLineItems(
  cart: Cart,
  mode: "payment" | "subscription"
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  // Weekly recurring prices for subscriptions, plain one-time prices otherwise
  const recurring = mode === "subscription" ? { recurring: { interval: "week" as const } } : {};
  const mealCount = cart.mealsPerDay * cart.daysPerWeek;
  const planName = cart.planType === "standard" ? "Standard Plan" : "Flexible Plan";
  const mealList = cart.meals.map(({ name, quantity }) => `${quantity}× ${name}`).join(", ");

  // The whole meal plan is one line, so the Standard discount is already included in its price
  const planLine: Stripe.Checkout.SessionCreateParams.LineItem = {
    quantity: 1,
    price_data: {
      currency: "eur",
      unit_amount: cart.totals.mealsTotal,
      product_data: {
        name: `${planName} – ${mealCount} meals`,
        description: mealList.length > 500 ? `${mealList.slice(0, 497)}...` : mealList,
      },
      ...recurring,
    },
  };

  const addOnLines = cart.addOns.map(
    ({ name, unitAmount, quantity }): Stripe.Checkout.SessionCreateParams.LineItem => ({
      quantity,
      price_data: {
        currency: "eur",
        unit_amount: unitAmount,
        product_data: { name: `Add-on: ${name}` },
        ...recurring,
      },
    })
  );

  return [planLine, ...addOnLines];
}

interface CheckoutSessionOptions {
  mode: "payment" | "subscription";
  successUrl: string;
  cancelUrl: string;
}

/** Creates a Stripe Checkout Session for an already priced cart. */
export async function createCheckoutSession(
  cart: Cart,
  { mode, successUrl, cancelUrl }: CheckoutSessionOptions
): Promise<Stripe.Checkout.Session> {
  const metadata = buildMetadata(cart);

  return getStripe().checkout.sessions.create({
    mode,
    line_items: buildLineItems(cart, mode),
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    // Copy the order onto the subscription too, so later subscription events know what was ordered
    ...(mode === "subscription" ? { subscription_data: { metadata } } : {}),
  });
}
