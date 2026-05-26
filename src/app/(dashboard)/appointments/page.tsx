import type { Metadata } from "next";
import { AppointmentsPageClient } from "@/components/shared/AppointmentsPageClient";

export const metadata: Metadata = { title: "Atendimentos" };

export default function AppointmentsPage() {
  return <AppointmentsPageClient />;
}
