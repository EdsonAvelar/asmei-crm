import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { DashboardShell } from "@/components/shared/DashboardShell";
import { prisma } from "@/lib/prisma";
import { isSubscriptionActive, getTrialDaysLeft } from "@/lib/tenant";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
  });

  const active = tenant ? isSubscriptionActive(tenant) : false;
  const isSettingsPath = pathname.startsWith("/settings");

  if (!active && !isSettingsPath) {
    redirect("/settings");
  }

  const trialDaysLeft = tenant ? getTrialDaysLeft(tenant) : null;
  const showTrialBanner =
    trialDaysLeft !== null && trialDaysLeft <= 7 && trialDaysLeft > 0;

  return (
    <DashboardShell
      userName={session.user.name ?? ""}
      tenantName={session.user.tenantName}
      userEmail={session.user.email ?? ""}
      trialDaysLeft={showTrialBanner ? trialDaysLeft : null}
    >
      {children}
    </DashboardShell>
  );
}
