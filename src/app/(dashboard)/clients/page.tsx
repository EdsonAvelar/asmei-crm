import type { Metadata } from "next";
import { ClientsPageClient } from "@/components/shared/ClientsPageClient";

export const metadata: Metadata = { title: "Clientes" };

export default function ClientsPage() {
  return <ClientsPageClient />;
}
