import type { Tenant } from "@/types";

export function canUseFeature(tenant: Tenant, feature: "card" | "export"): boolean {
  if (tenant.plan === "PRO") return true;
  const isInTrial = tenant.trialEndsAt && tenant.trialEndsAt > new Date();
  return isInTrial ?? false;
}

export function isSubscriptionActive(tenant: Tenant): boolean {
  if (tenant.trialEndsAt && tenant.trialEndsAt > new Date()) return true;
  if (tenant.stripeCurrentPeriodEnd && tenant.stripeCurrentPeriodEnd > new Date()) return true;
  return false;
}

export function getTrialDaysLeft(tenant: Tenant): number | null {
  if (!tenant.trialEndsAt) return null;
  const now = new Date();
  if (tenant.trialEndsAt <= now) return 0;
  const diff = tenant.trialEndsAt.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
