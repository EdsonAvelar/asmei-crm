"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma, tenantContext } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { recalculateClientStatus } from "@/actions/clients";

async function getSession() {
  const session = await auth();
  if (!session?.user?.tenantId) throw new Error("Unauthorized");
  return session;
}

export async function getAppointments() {
  const session = await getSession();
  const raw = await tenantContext.run({ tenantId: session.user.tenantId }, () =>
    prisma.appointment.findMany({
      orderBy: { date: "desc" },
      include: { client: true, professional: true, service: true },
    })
  );
  return raw.map((a) => ({
    ...a,
    price: Number(a.price),
    service: { ...a.service, price: Number(a.service.price) },
  }));
}

const appointmentSchema = z.object({
  clientId: z.string().min(1),
  professionalId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().min(1),
  price: z.coerce.number().positive(),
  notes: z.string().optional(),
});

export async function createAppointment(input: unknown) {
  const session = await getSession();
  const parsed = appointmentSchema.safeParse(input);
  if (!parsed.success) return { data: null, error: parsed.error.flatten() };

  const { date, ...rest } = parsed.data;
  const tenantId = session.user.tenantId;
  const appointment = await tenantContext.run({ tenantId }, () =>
    prisma.appointment.create({
      data: { ...rest, date: new Date(date), tenantId },
    })
  );

  await recalculateClientStatus(parsed.data.clientId);
  revalidatePath("/appointments");
  revalidatePath(`/clients/${parsed.data.clientId}`);
  revalidatePath("/");
  return { data: { ...appointment, price: Number(appointment.price) }, error: null };
}

export async function updateAppointment(id: string, input: unknown) {
  const session = await getSession();
  const parsed = appointmentSchema.partial().safeParse(input);
  if (!parsed.success) return { data: null, error: parsed.error.flatten() };

  const { date, ...rest } = parsed.data;
  const appointment = await tenantContext.run({ tenantId: session.user.tenantId }, () =>
    prisma.appointment.update({
      where: { id },
      data: { ...rest, ...(date ? { date: new Date(date) } : {}) },
    })
  );

  if (parsed.data.clientId) await recalculateClientStatus(parsed.data.clientId);
  revalidatePath("/appointments");
  return { data: { ...appointment, price: Number(appointment.price) }, error: null };
}

export async function updateAppointmentStatus(id: string, status: "SCHEDULED" | "COMPLETED" | "MISSED") {
  const session = await getSession();
  const appointment = await tenantContext.run({ tenantId: session.user.tenantId }, () =>
    prisma.appointment.update({ where: { id }, data: { status } })
  );
  revalidatePath("/calendar");
  return { data: { ...appointment, price: Number(appointment.price) }, error: null };
}

export async function deleteAppointment(id: string) {
  const session = await getSession();
  const appt = await tenantContext.run({ tenantId: session.user.tenantId }, () =>
    prisma.appointment.findFirst({ where: { id } })
  );
  await tenantContext.run({ tenantId: session.user.tenantId }, () =>
    prisma.appointment.delete({ where: { id } })
  );
  if (appt?.clientId) await recalculateClientStatus(appt.clientId);
  revalidatePath("/appointments");
  return { data: true, error: null };
}
