import Link from "next/link";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { formatCents } from "@/lib/pricing";
import ClearOrderData from "./clear-order-data";

async function getSession(sessionId: string | undefined): Promise<Stripe.Checkout.Session | null> {
  if (!sessionId?.startsWith("cs_")) return null;
  try {
    return await getStripe().checkout.sessions.retrieve(sessionId);
  } catch {
    return null;
  }
}

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  // Ask Stripe directly — the URL alone doesn't prove anything was paid
  const session = await getSession(session_id);
  const isPaid = session?.status === "complete";

  if (!isPaid) {
    return (
      <div className="min-h-[80vh] bg-[#e8e8e4] py-20">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">We couldn&apos;t confirm your order</h1>
          <p className="text-gray-600 mb-8">
            The payment wasn&apos;t completed or the link is invalid. Nothing was charged.
          </p>
          <Link
            href="/menu/summary"
            className="inline-block bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors"
          >
            Back to your order
          </Link>
        </div>
      </div>
    );
  }

  const isSubscription = session.mode === "subscription";

  return (
    <div className="min-h-[80vh] bg-[#e8e8e4] py-20">
      <ClearOrderData />
      <div className="max-w-xl mx-auto px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
          <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-primary-light flex items-center justify-center">
            <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Thank you for your order!</h1>
          <p className="text-gray-600 mb-6">
            {session.customer_details?.email
              ? <>A confirmation was sent to <span className="font-semibold text-gray-900">{session.customer_details.email}</span>.</>
              : "Your payment was successful."}
          </p>
          {session.amount_total != null && (
            <div className="py-4 mb-6 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-500">{isSubscription ? "Weekly total" : "Total paid"}</span>
              <div className="text-2xl font-bold text-gray-900">{formatCents(session.amount_total)}</div>
            </div>
          )}
          {isSubscription && (
            <p className="text-sm text-gray-500 mb-6">
              Your meal plan renews automatically every week. You can manage or cancel it anytime.
            </p>
          )}
          <Link
            href="/"
            className="inline-block bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-dark transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
