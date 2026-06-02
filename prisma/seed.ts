import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Tenant
  const devTrialEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  const tenant = await prisma.tenant.upsert({
    where: { slug: "bella-donna" },
    update: { trialEndsAt: devTrialEnd },
    create: {
      name: "Salão Bella Donna",
      slug: "bella-donna",
      plan: "PRO",
      trialEndsAt: devTrialEnd,
    },
  });

  // Users
  const passwordHash = await bcrypt.hash("senha123", 10);

  const owner = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "ana@belladonna.com" } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "ana@belladonna.com",
      name: "Ana Souza",
      role: "OWNER",
      passwordHash,
    },
  });

  const carla = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "carla@belladonna.com" } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "carla@belladonna.com",
      name: "Carla Mendes",
      role: "PROFESSIONAL",
      passwordHash,
    },
  });

  const julia = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "julia@belladonna.com" } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "julia@belladonna.com",
      name: "Júlia Ferreira",
      role: "PROFESSIONAL",
      passwordHash,
    },
  });

  // Services
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: "seed_s01" },
      update: {},
      create: { id: "seed_s01", tenantId: tenant.id, name: "Corte feminino", returnDays: 45, price: 80, durationMinutes: 60 },
    }),
    prisma.service.upsert({
      where: { id: "seed_s02" },
      update: {},
      create: { id: "seed_s02", tenantId: tenant.id, name: "Coloração", returnDays: 30, price: 180, durationMinutes: 120 },
    }),
    prisma.service.upsert({
      where: { id: "seed_s03" },
      update: {},
      create: { id: "seed_s03", tenantId: tenant.id, name: "Hidratação capilar", returnDays: 21, price: 90, durationMinutes: 60 },
    }),
    prisma.service.upsert({
      where: { id: "seed_s04" },
      update: {},
      create: { id: "seed_s04", tenantId: tenant.id, name: "Manicure", returnDays: 14, price: 45, durationMinutes: 45 },
    }),
    prisma.service.upsert({
      where: { id: "seed_s05" },
      update: {},
      create: { id: "seed_s05", tenantId: tenant.id, name: "Design de sobrancelha", returnDays: 30, price: 35, durationMinutes: 30 },
    }),
  ]);

  // Clients
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
  };

  const clients = await Promise.all([
    prisma.client.upsert({
      where: { id: "seed_c01" },
      update: {},
      create: { id: "seed_c01", tenantId: tenant.id, name: "Fernanda Lima", phone: "(11) 99876-5432", email: "fernanda@email.com", status: "ACTIVE", hairColor: "Loiro mel", skinTone: "Clara", notes: "Prefere horários pela manhã" },
    }),
    prisma.client.upsert({
      where: { id: "seed_c02" },
      update: {},
      create: { id: "seed_c02", tenantId: tenant.id, name: "Beatriz Oliveira", phone: "(11) 98765-4321", email: "bia@email.com", status: "VIP", hairColor: "Castanho escuro", allergies: "Amônia", notes: "Agenda com Carla sempre" },
    }),
    prisma.client.upsert({
      where: { id: "seed_c03" },
      update: {},
      create: { id: "seed_c03", tenantId: tenant.id, name: "Camila Rocha", phone: "(11) 97654-3210", status: "AT_RISK", hairColor: "Preto natural" },
    }),
    prisma.client.upsert({
      where: { id: "seed_c04" },
      update: {},
      create: { id: "seed_c04", tenantId: tenant.id, name: "Larissa Santos", phone: "(11) 96543-2109", status: "INACTIVE", hairColor: "Ruivo", allergies: "Peroxide" },
    }),
    prisma.client.upsert({
      where: { id: "seed_c05" },
      update: {},
      create: { id: "seed_c05", tenantId: tenant.id, name: "Juliana Costa", phone: "(11) 95432-1098", status: "ACTIVE", hairColor: "Loiro platinado" },
    }),
  ]);

  // Appointments (10 records)
  const apptData = [
    { id: "seed_a01", clientId: clients[0].id, professionalId: carla.id, serviceId: services[0].id, date: daysAgo(5), price: 80 },
    { id: "seed_a02", clientId: clients[1].id, professionalId: carla.id, serviceId: services[1].id, date: daysAgo(3), price: 180, notes: "Retoque nas raízes" },
    { id: "seed_a03", clientId: clients[1].id, professionalId: carla.id, serviceId: services[3].id, date: daysAgo(3), price: 45 },
    { id: "seed_a04", clientId: clients[4].id, professionalId: julia.id, serviceId: services[0].id, date: daysAgo(7), price: 80 },
    { id: "seed_a05", clientId: clients[0].id, professionalId: carla.id, serviceId: services[3].id, date: daysAgo(10), price: 45 },
    { id: "seed_a06", clientId: clients[1].id, professionalId: carla.id, serviceId: services[2].id, date: daysAgo(1), price: 90 },
    { id: "seed_a07", clientId: clients[4].id, professionalId: julia.id, serviceId: services[2].id, date: daysAgo(4), price: 90 },
    { id: "seed_a08", clientId: clients[2].id, professionalId: julia.id, serviceId: services[0].id, date: daysAgo(40), price: 80 },
    { id: "seed_a09", clientId: clients[3].id, professionalId: julia.id, serviceId: services[1].id, date: daysAgo(90), price: 180 },
    { id: "seed_a10", clientId: clients[1].id, professionalId: carla.id, serviceId: services[4].id, date: daysAgo(2), price: 35 },
  ];

  for (const a of apptData) {
    await prisma.appointment.upsert({
      where: { id: a.id },
      update: {},
      create: { ...a, tenantId: tenant.id },
    });
  }

  console.log(`✅ Seed concluído: tenant "${tenant.name}", 3 usuários, 5 clientes, 5 serviços, 10 atendimentos`);
  console.log(`\n🔑 Login: ana@belladonna.com | senha123`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
