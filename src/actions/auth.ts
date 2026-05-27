"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  salonName: z.string().min(2),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function registerSalon(input: unknown) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { data: null, error: parsed.error.flatten() };

  const { salonName, name, email, password } = parsed.data;

  const existing = await prisma.user.findFirst({ where: { email } });
  if (existing) return { data: null, error: "E-mail já cadastrado." };

  const slug = salonName
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .concat("-" + Math.random().toString(36).slice(2, 6));

  const passwordHash = await bcrypt.hash(password, 10);

  const tenant = await prisma.tenant.create({
    data: {
      name: salonName,
      slug,
      plan: "BASIC",
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email,
      name,
      role: "OWNER",
      passwordHash,
    },
  });

  return { data: { email }, error: null };
}
