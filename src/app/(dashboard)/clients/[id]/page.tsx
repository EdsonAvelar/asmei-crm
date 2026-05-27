import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getClientById } from "@/actions/clients";
import { getAppointments } from "@/actions/appointments";
import { getUsers } from "@/actions/users";
import { getServices } from "@/actions/services";
import { ClientDetailClient } from "@/components/shared/ClientDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const client = await getClientById(id);
  return { title: client?.name ?? "Cliente" };
}

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params;
  const [client, appointments, users, services] = await Promise.all([
    getClientById(id),
    getAppointments(),
    getUsers(),
    getServices(),
  ]);
  if (!client) notFound();
  return (
    <ClientDetailClient
      client={client}
      appointments={appointments}
      users={users}
      services={services}
    />
  );
}
