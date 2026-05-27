"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma, tenantContext } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

async function getSession() {
  const session = await auth();
  if (!session?.user?.tenantId) throw new Error("Unauthorized");
  return session;
}

export async function getUsers() {
  const session = await getSession();
  return tenantContext.run({ tenantId: session.user.tenantId }, () =>
    prisma.user.findMany({ orderBy: { name: "asc" } })
  );
}

export async function getTenant() {
  const session = await getSession();
  return prisma.tenant.findUnique({ where: { id: session.user.tenantId } });
}

const inviteSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["PROFESSIONAL", "RECEPTIONIST"]),
  password: z.string().min(8),
});

export async function inviteUser(input: unknown) {
  const session = await getSession();
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) return { data: null, error: parsed.error.flatten() };

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
  });

  // Guard: BASIC plan max 5 users
  if (tenant?.plan === "BASIC") {
    const count = await tenantContext.run({ tenantId: session.user.tenantId }, () =>
      prisma.user.count()
    );
    if (count >= 5) {
      return { data: null, error: "Limite de 5 usuários no plano BASIC atingido. Faça upgrade para o plano PRO." };
    }
  }

  const exists = await tenantContext.run({ tenantId: session.user.tenantId }, () =>
    prisma.user.findFirst({ where: { email: parsed.data.email } })
  );
  if (exists) return { data: null, error: "E-mail já cadastrado neste salão." };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const tenantId = session.user.tenantId;
  const user = await tenantContext.run({ tenantId }, () =>
    prisma.user.create({
      data: {
        tenantId,
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        passwordHash,
      },
    })
  );

  revalidatePath("/settings");
  return { data: user, error: null };
}

export async function updateUserRole(userId: string, role: "PROFESSIONAL" | "RECEPTIONIST") {
  const session = await getSession();
  // OWNER cannot be changed
  if (session.user.id === userId) return { data: null, error: "Você não pode alterar sua própria função." };

  const user = await tenantContext.run({ tenantId: session.user.tenantId }, () =>
    prisma.user.update({ where: { id: userId }, data: { role } })
  );
  revalidatePath("/settings");
  return { data: user, error: null };
}

export async function removeUser(userId: string) {
  const session = await getSession();
  if (session.user.id === userId) return { data: null, error: "Você não pode remover a si mesmo." };

  await tenantContext.run({ tenantId: session.user.tenantId }, () =>
    prisma.user.delete({ where: { id: userId } })
  );
  revalidatePath("/settings");
  return { data: true, error: null };
}
