import type Stripe from "stripe";
import { decodeOrderMetadata } from "./checkout";

/*
 * Webhook event handlers. There is no database yet, so for now they only log.
 * When orders get stored, this is the place to save them — keyed by session.id /
 * subscription.id, because Stripe may deliver the same event more than once.
 */

function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const order = decodeOrderMetadata(session.metadata ?? {});
  console.log("[stripe] checkout completed", {
    sessionId: session.id,
    mode: session.mode,
    paymentStatus: session.payment_status,
    customer: session.customer,
    subscription: session.subscription,
    email: session.customer_details?.email,
    amountTotal: session.amount_total,
    order,
  });
  // TODO: save the order and notify the kitchen
}

function handleSubscriptionChange(eventType: string, subscription: Stripe.Subscription) {
  console.log(`[stripe] ${eventType}`, {
    subscriptionId: subscription.id,
    customer: subscription.customer,
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });
  // TODO: update the stored subscription status
}

function handleInvoice(eventType: string, invoice: Stripe.Invoice) {
  console.log(`[stripe] ${eventType}`, {
    invoiceId: invoice.id,
    customer: invoice.customer,
    subscription: invoice.parent?.subscription_details?.subscription,
    billingReason: invoice.billing_reason,
    amountPaid: invoice.amount_paid,
    amountDue: invoice.amount_due,
  });
  // TODO: invoice.paid with billing_reason "subscription_cycle" = a new weekly order
  // TODO: invoice.payment_failed = tell the customer to update their card
}

export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
      handleCheckoutCompleted(event.data.object);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      handleSubscriptionChange(event.type, event.data.object);
      break;
    case "invoice.paid":
    case "invoice.payment_failed":
      handleInvoice(event.type, event.data.object);
      break;
    default:
      // Not interesting for us — still answer 200 so Stripe doesn't retry
      break;
  }
}
