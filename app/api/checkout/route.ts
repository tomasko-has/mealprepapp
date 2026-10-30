import { getCatalogItems } from "@/lib/catalog";
import {
  CheckoutError,
  createCheckoutSession,
  parseCheckoutRequest,
  priceCart,
} from "@/lib/checkout";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const checkoutRequest = parseCheckoutRequest(body);

    // Prices come from the server-side catalog, never from the browser
    const ids = [...checkoutRequest.meals, ...checkoutRequest.addOns].map(({ id }) => id);
    const cart = priceCart(checkoutRequest, await getCatalogItems(ids));

    const origin = new URL(request.url).origin;
    const session = await createCheckoutSession(cart, {
      mode: "payment",
      // Stripe replaces {CHECKOUT_SESSION_ID} with the real session id
      successUrl: `${origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/menu/summary?canceled=1`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    if (err instanceof CheckoutError) {
      return Response.json({ error: err.message }, { status: 400 });
    }
    console.error("Checkout API error:", err);
    return Response.json({ error: "Could not start checkout" }, { status: 500 });
  }
}
