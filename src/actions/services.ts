"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma, tenantContext } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function getSession() {
  const session = await auth();
  if (!session?.user?.tenantId) throw new Error("Unauthorized");
  return session;
}

export async function getServices() {
  const session = await getSession();
  const raw = await tenantContext.run({ tenantId: session.user.tenantId }, () =>
    prisma.service.findMany({ orderBy: { name: "asc" } })
  );
  return raw.map((s) => ({ ...s, price: Number(s.price) }));
}

const serviceSchema = z.object({
  name: z.string().min(2),
  returnDays: z.coerce.number().int().positive(),
  price: z.coerce.number().positive(),
  durationMinutes: z.coerce.number().int().positive().default(60),
});

export async function createService(input: unknown) {
  const session = await getSession();
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) return { data: null, error: parsed.error.flatten() };

  const tenantId = session.user.tenantId;
  const service = await tenantContext.run({ tenantId }, () =>
    prisma.service.create({ data: { ...parsed.data, tenantId } })
  );
  revalidatePath("/services");
  return { data: { ...service, price: Number(service.price) }, error: null };
}

export async function updateService(id: string, input: unknown) {
  const session = await getSession();
  const parsed = serviceSchema.partial().safeParse(input);
  if (!parsed.success) return { data: null, error: parsed.error.flatten() };

  const service = await tenantContext.run({ tenantId: session.user.tenantId }, () =>
    prisma.service.update({ where: { id }, data: parsed.data })
  );
  revalidatePath("/services");
  return { data: { ...service, price: Number(service.price) }, error: null };
}

export async function toggleServiceActive(id: string) {
  const session = await getSession();
  const current = await tenantContext.run({ tenantId: session.user.tenantId }, () =>
    prisma.service.findFirst({ where: { id } })
  );
  if (!current) return { data: null, error: "Serviço não encontrado." };

  const service = await tenantContext.run({ tenantId: session.user.tenantId }, () =>
    prisma.service.update({ where: { id }, data: { active: !current.active } })
  );
  revalidatePath("/services");
  return { data: { ...service, price: Number(service.price) }, error: null };
}
