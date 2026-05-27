import type { Metadata } from "next";
import { getClients } from "@/actions/clients";
import { getUsers } from "@/actions/users";
import { getAppointments } from "@/actions/appointments";
import { ClientsPageClient } from "@/components/shared/ClientsPageClient";

export const metadata: Metadata = { title: "Clientes" };

export default async function ClientsPage() {
  const [clients, users, appointments] = await Promise.all([
    getClients(),
    getUsers(),
    getAppointments(),
  ]);
  return <ClientsPageClient clients={clients} users={users} appointments={appointments} />;
}
