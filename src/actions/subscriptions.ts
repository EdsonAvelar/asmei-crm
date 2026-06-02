"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function createCheckoutSession(plan: "BASIC" | "PRO") {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized", url: null };

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
  });
  if (!tenant) return { error: "Tenant não encontrado", url: null };

  const priceId =
    plan === "PRO"
      ? process.env.STRIPE_PRO_PRICE_ID
      : process.env.STRIPE_BASIC_PRICE_ID;

  if (!priceId) return { error: `STRIPE_${plan}_PRICE_ID não configurado no .env.local`, url: null };

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  if (!appUrl.startsWith("http")) {
    return { error: "NEXT_PUBLIC_APP_URL não configurado com esquema https://", url: null };
  }

  let customerId = tenant.stripeCustomerId;

  // Verify the saved customer still exists in this Stripe account (handles key rotation)
  if (customerId) {
    try {
      await stripe.customers.retrieve(customerId);
    } catch {
      // Customer not found in current Stripe account — reset and create a fresh one
      customerId = null;
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: { stripeCustomerId: null },
      });
    }
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email ?? undefined,
      name: tenant.name,
      metadata: { tenantId: tenant.id },
    });
    customerId = customer.id;
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/settings/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/settings`,
    metadata: { tenantId: tenant.id, plan },
    subscription_data: {
      metadata: { tenantId: tenant.id, plan },
    },
  });

  if (!checkoutSession.url) return { error: "Erro ao criar sessão de pagamento", url: null };

  return { error: null, url: checkoutSession.url };
}

export async function createPortalSession() {
  const session = await auth();
  if (!session?.user?.tenantId) return { error: "Unauthorized", url: null };

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
  });
  if (!tenant?.stripeCustomerId) return { error: "Sem assinatura ativa", url: null };

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  if (!appUrl.startsWith("http")) {
    return { error: "NEXT_PUBLIC_APP_URL não configurado com esquema https://", url: null };
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: tenant.stripeCustomerId,
    return_url: `${appUrl}/settings`,
  });

  return { error: null, url: portalSession.url };
}
