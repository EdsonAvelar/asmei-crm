"use server";

import { auth } from "@/auth";
import { prisma, tenantContext } from "@/lib/prisma";

async function getSession() {
  const session = await auth();
  if (!session?.user?.tenantId) throw new Error("Unauthorized");
  return session;
}

export async function getDashboardMetrics() {
  const session = await getSession();
  const tenantId = session.user.tenantId;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [clients, monthAppointments, allAppointments] = await Promise.all([
    tenantContext.run({ tenantId }, () =>
      prisma.client.findMany({ select: { id: true, name: true, phone: true, status: true } })
    ),
    tenantContext.run({ tenantId }, () =>
      prisma.appointment.findMany({
        where: { date: { gte: monthStart } },
        select: { price: true, date: true, status: true },
      })
    ),
    tenantContext.run({ tenantId }, () =>
      prisma.appointment.findMany({
        where: { date: { gte: new Date(now.getTime() - 56 * 86_400_000) } },
        select: { date: true },
      })
    ),
  ]);

  const statusCounts = {
    ACTIVE: clients.filter((c) => c.status === "ACTIVE").length,
    AT_RISK: clients.filter((c) => c.status === "AT_RISK").length,
    INACTIVE: clients.filter((c) => c.status === "INACTIVE").length,
    VIP: clients.filter((c) => c.status === "VIP").length,
  };

  const monthRevenue = monthAppointments.reduce((sum, a) => sum + Number(a.price), 0);

  // Build 8-week buckets with real date labels
  const weeklyData = Array.from({ length: 8 }, (_, i) => {
    const weekEnd = new Date(now.getTime() - (7 - i) * 7 * 86_400_000);
    const weekStart = new Date(weekEnd.getTime() - 7 * 86_400_000);
    const label = `${String(weekStart.getDate()).padStart(2, "0")}/${String(weekStart.getMonth() + 1).padStart(2, "0")}`;
    const atendimentos = allAppointments.filter((a) => {
      const t = new Date(a.date).getTime();
      return t >= weekStart.getTime() && t < weekEnd.getTime();
    }).length;
    return { week: label, atendimentos };
  });

  // AT_RISK clients with last appointment date for urgency sorting
  const atRiskClientIds = clients.filter((c) => c.status === "AT_RISK").map((c) => c.id);
  const atRiskLastAppts = atRiskClientIds.length > 0
    ? await tenantContext.run({ tenantId }, () =>
        prisma.appointment.findMany({
          where: { clientId: { in: atRiskClientIds } },
          orderBy: { date: "desc" },
          select: { clientId: true, date: true },
        })
      )
    : [];

  const lastApptByClient: Record<string, Date> = {};
  for (const a of atRiskLastAppts) {
    if (!lastApptByClient[a.clientId]) lastApptByClient[a.clientId] = a.date;
  }

  const atRiskClients = clients
    .filter((c) => c.status === "AT_RISK")
    .map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      status: c.status as "AT_RISK",
      lastAppointmentDate: lastApptByClient[c.id] ?? null,
      daysSince: lastApptByClient[c.id]
        ? Math.floor((Date.now() - lastApptByClient[c.id].getTime()) / 86_400_000)
        : null,
    }))
    .sort((a, b) => (b.daysSince ?? 0) - (a.daysSince ?? 0))
    .slice(0, 5);

  return {
    statusCounts,
    monthRevenue,
    monthAppointments: monthAppointments.length,
    weeklyData,
    atRiskClients,
    totalClients: clients.length,
  };
}
