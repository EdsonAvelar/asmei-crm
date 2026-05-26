import type { Metadata } from "next";
import { ServicesPageClient } from "@/components/shared/ServicesPageClient";

export const metadata: Metadata = { title: "Serviços" };

export default function ServicesPage() {
  return <ServicesPageClient />;
}
