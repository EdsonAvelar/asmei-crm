import { prisma, tenantContext } from "@/lib/prisma";
import type { ClientStatus } from "@/types";

export async function recalculateClientStatus(clientId: string, tenantId: string): Promise<void> {
  const appointments = await tenantContext.run({ tenantId }, () =>
    prisma.appointment.findMany({
      where: { clientId },
      include: { service: true },
      orderBy: { date: "desc" },
    })
  );

  if (appointments.length === 0) return;

  const totalSpend = appointments.reduce((sum, a) => sum + Number(a.price), 0);
  const totalCount = appointments.length;

  if (totalSpend > 1000 || totalCount >= 20) {
    await tenantContext.run({ tenantId }, () =>
      prisma.client.update({ where: { id: clientId }, data: { status: "VIP" } })
    );
    return;
  }

  const lastDate = appointments[0].date;
  const daysSince = Math.floor((Date.now() - lastDate.getTime()) / 86_400_000);
  const cycleAvg =
    appointments.reduce((s, a) => s + a.service.returnDays, 0) / appointments.length;

  let status: ClientStatus;
  if (daysSince <= cycleAvg) status = "ACTIVE";
  else if (daysSince <= cycleAvg * 2) status = "AT_RISK";
  else status = "INACTIVE";

  await tenantContext.run({ tenantId }, () =>
    prisma.client.update({ where: { id: clientId }, data: { status } })
  );
}
