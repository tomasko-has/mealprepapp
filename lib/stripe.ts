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
