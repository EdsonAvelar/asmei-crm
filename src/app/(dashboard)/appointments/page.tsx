import type { Metadata } from "next";
import { getAppointments } from "@/actions/appointments";
import { getUsers } from "@/actions/users";
import { getClients } from "@/actions/clients";
import { getServices } from "@/actions/services";
import { AppointmentsPageClient } from "@/components/shared/AppointmentsPageClient";

export const metadata: Metadata = { title: "Atendimentos" };

export default async function AppointmentsPage() {
  const [appointments, clients, users, services] = await Promise.all([
    getAppointments(),
    getClients(),
    getUsers(),
    getServices(),
  ]);
  return (
    <AppointmentsPageClient
      appointments={appointments}
      clients={clients}
      users={users}
      services={services}
    />
  );
}
