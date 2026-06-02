import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// In Stripe v22 (2026-05-27.dahlia):
// - subscription.current_period_end moved to subscription.items.data[0].current_period_end
// - invoice.subscription moved to invoice.parent.subscription_details.subscription

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const firstItem = subscription.items.data[0];
  if (!firstItem?.current_period_end) return null;
  return new Date(firstItem.current_period_end * 1000);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) break;

        const tenantId = session.metadata?.tenantId;
        const plan = session.metadata?.plan as "BASIC" | "PRO" | undefined;
        if (!tenantId || !plan) break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const periodEnd = getSubscriptionPeriodEnd(subscription);

        await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            plan,
            stripeSubscriptionId: subscription.id,
            stripeCurrentPeriodEnd: periodEnd,
          },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionRef = invoice.parent?.subscription_details?.subscription;
        if (!subscriptionRef) break;

        const subscriptionId =
          typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef.id;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const tenantId = subscription.metadata?.tenantId;
        if (!tenantId) break;

        const plan = subscription.metadata?.plan as "BASIC" | "PRO" | undefined;
        const periodEnd = getSubscriptionPeriodEnd(subscription);

        await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            ...(plan ? { plan } : {}),
            stripeCurrentPeriodEnd: periodEnd,
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const tenantId = subscription.metadata?.tenantId;
        if (!tenantId) break;

        const plan = subscription.metadata?.plan as "BASIC" | "PRO" | undefined;
        const periodEnd = getSubscriptionPeriodEnd(subscription);

        await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            ...(plan ? { plan } : {}),
            stripeCurrentPeriodEnd: periodEnd,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const tenantId = subscription.metadata?.tenantId;
        if (!tenantId) break;

        await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            plan: "BASIC",
            stripeSubscriptionId: null,
            stripeCurrentPeriodEnd: null,
          },
        });
        break;
      }
    }
  } catch (err) {
    console.error("[stripe-webhook] processing error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
