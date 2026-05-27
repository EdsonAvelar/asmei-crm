import type { Metadata } from "next";
import { getClients } from "@/actions/clients";
import { getAppointments } from "@/actions/appointments";
import { DashboardClient } from "@/components/shared/DashboardClient";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [clients, appointments] = await Promise.all([
    getClients(),
    getAppointments(),
  ]);

  return <DashboardClient clients={clients} appointments={appointments} />;
}
