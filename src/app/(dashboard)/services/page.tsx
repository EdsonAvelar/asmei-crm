import type { Metadata } from "next";
import { getServices } from "@/actions/services";
import { ServicesPageClient } from "@/components/shared/ServicesPageClient";

export const metadata: Metadata = { title: "Serviços" };

export default async function ServicesPage() {
  const services = await getServices();
  return <ServicesPageClient initialServices={services} />;
}
