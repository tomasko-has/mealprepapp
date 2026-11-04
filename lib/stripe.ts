import Stripe from "stripe";

let stripeClient: Stripe | null = null;

/**
 * Server-only Stripe client. Created lazily so that `next build` doesn't fail
 * when STRIPE_SECRET_KEY isn't present at build time.
 * Never import this file from a Client Component — the secret key must stay on the server.
 */
export function getStripe(): Stripe {
  if (stripeClient) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set. Add it to .env.local");
  }
  if (!secretKey.startsWith("sk_test_")) {
    // Safety net while the shop is in development: only test-mode keys are allowed.
    throw new Error("STRIPE_SECRET_KEY must be a test-mode key (sk_test_...)");
  }

  stripeClient = new Stripe(secretKey);
  return stripeClient;
}

/**
 * Creates a Stripe Customer Portal session where the customer can update their card
 * or cancel the subscription. Returns the URL to redirect to.
 *
 * Not wired to any page yet — the account page will call this once auth knows the
 * logged-in user's Stripe customer id. Never accept the customer id from the browser.
 * Requires the portal to be activated once in the Dashboard (Settings → Billing → Customer portal).
 */
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}
