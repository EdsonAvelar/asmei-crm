import type { Metadata } from "next";
import { getAppointments } from "@/actions/appointments";
import { CalendarPageClient } from "@/components/shared/CalendarPageClient";

export const metadata: Metadata = { title: "Calendário" };

export default async function CalendarPage() {
  const appointments = await getAppointments();
  return <CalendarPageClient appointments={appointments} />;
}
