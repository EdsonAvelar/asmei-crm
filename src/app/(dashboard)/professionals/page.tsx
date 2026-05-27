import type { Metadata } from "next";
import { getUsers } from "@/actions/users";
import { getAppointments } from "@/actions/appointments";
import { ProfessionalsPageClient } from "@/components/shared/ProfessionalsPageClient";

export const metadata: Metadata = { title: "Profissionais" };

export default async function ProfessionalsPage() {
  const [users, appointments] = await Promise.all([getUsers(), getAppointments()]);
  return <ProfessionalsPageClient users={users} appointments={appointments} />;
}
