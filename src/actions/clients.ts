"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma, tenantContext } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { recalculateClientStatus as recalculateClientStatusLib } from "@/lib/client-status";

async function getSession() {
  const session = await auth();
  if (!session?.user?.tenantId) throw new Error("Unauthorized");
  return session;
}

export async function getClients() {
  const session = await getSession();
  return tenantContext.run({ tenantId: session.user.tenantId }, () =>
    prisma.client.findMany({ orderBy: { name: "asc" } })
  );
}

export async function getClientById(id: string) {
  const session = await getSession();
  return tenantContext.run({ tenantId: session.user.tenantId }, () =>
    prisma.client.findFirst({ where: { id } })
  );
}

const clientSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  birthDate: z.string().optional(),
  hairColor: z.string().optional(),
  skinTone: z.string().optional(),
  nailPolish: z.string().optional(),
  allergies: z.string().optional(),
  notes: z.string().optional(),
});

export async function createClient(input: unknown) {
  const session = await getSession();
  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) return { data: null, error: parsed.error.flatten() };

  const { birthDate, email, ...rest } = parsed.data;
  const data = {
    ...rest,
    email: email || null,
    birthDate: birthDate ? new Date(birthDate) : null,
  };

  const tenantId = session.user.tenantId;
  const client = await tenantContext.run({ tenantId }, () =>
    prisma.client.create({ data: { ...data, tenantId } })
  );

  revalidatePath("/clients");
  return { data: client, error: null };
}

export async function updateClient(id: string, input: unknown) {
  const session = await getSession();
  const parsed = clientSchema.partial().safeParse(input);
  if (!parsed.success) return { data: null, error: parsed.error.flatten() };

  const { birthDate, email, ...rest } = parsed.data;
  const data = {
    ...rest,
    ...(email !== undefined ? { email: email || null } : {}),
    ...(birthDate !== undefined ? { birthDate: birthDate ? new Date(birthDate) : null } : {}),
  };

  const client = await tenantContext.run({ tenantId: session.user.tenantId }, () =>
    prisma.client.update({ where: { id }, data })
  );

  revalidatePath(`/clients/${id}`);
  revalidatePath("/clients");
  return { data: client, error: null };
}

const profileSchema = z.object({
  hairColor: z.string().optional(),
  skinTone: z.string().optional(),
  nailPolish: z.string().optional(),
  allergies: z.string().optional(),
  notes: z.string().optional(),
});

export async function updateClientProfile(id: string, input: unknown) {
  const session = await getSession();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { data: null, error: parsed.error.flatten() };

  const client = await tenantContext.run({ tenantId: session.user.tenantId }, () =>
    prisma.client.update({ where: { id }, data: parsed.data })
  );

  revalidatePath(`/clients/${id}`);
  return { data: client, error: null };
}

export async function updateClientStatus(id: string, status: "ACTIVE" | "AT_RISK" | "INACTIVE" | "VIP") {
  const session = await getSession();
  const client = await tenantContext.run({ tenantId: session.user.tenantId }, () =>
    prisma.client.update({ where: { id }, data: { status } })
  );
  revalidatePath("/clients");
  return { data: client, error: null };
}

export async function deleteClient(id: string) {
  const session = await getSession();
  await tenantContext.run({ tenantId: session.user.tenantId }, () =>
    prisma.client.delete({ where: { id } })
  );
  revalidatePath("/clients");
  return { data: true, error: null };
}

export async function recalculateClientStatus(clientId: string) {
  const session = await getSession();
  return recalculateClientStatusLib(clientId, session.user.tenantId);
}
