import { NextRequest, NextResponse } from "next/server";
import { prisma, tenantContext } from "@/lib/prisma";
import { recalculateClientStatus } from "@/lib/client-status";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    const query = req.nextUrl.searchParams.get("secret");
    if (auth !== `Bearer ${secret}` && query !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const tenants = await prisma.tenant.findMany({ select: { id: true } });
  let updated = 0;
  const errors: string[] = [];

  for (const tenant of tenants) {
    const clients = await tenantContext.run({ tenantId: tenant.id }, () =>
      prisma.client.findMany({ select: { id: true } })
    );
    for (const client of clients) {
      try {
        await recalculateClientStatus(client.id, tenant.id);
        updated++;
      } catch (err) {
        errors.push(`client ${client.id}: ${String(err)}`);
      }
    }
  }

  return NextResponse.json({ ok: true, updated, errors });
}
