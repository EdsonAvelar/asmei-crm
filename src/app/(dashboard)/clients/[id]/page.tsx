import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mockClients } from "@/lib/mock-data";
import { ClientDetailClient } from "@/components/shared/ClientDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const client = mockClients.find((c) => c.id === id);
  return { title: client?.name ?? "Cliente" };
}

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params;
  const client = mockClients.find((c) => c.id === id);
  if (!client) notFound();
  return <ClientDetailClient client={client} />;
}
