"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { NewAppointmentDialog } from "@/components/shared/NewAppointmentDialog";
import type { Client, User, Service, Appointment } from "@/types";

interface AppointmentWithRelations extends Omit<Appointment, "price"> {
  price: number | string | { toNumber(): number };
  professional: User;
  service: Service;
}

interface Props {
  client: Client;
  appointments: AppointmentWithRelations[];
  users: User[];
  services: Service[];
}

export function ClientDetailClient({ client, appointments, users, services }: Props) {
  const router = useRouter();
  const [apptDialogOpen, setApptDialogOpen] = useState(false);

  const clientAppointments = appointments
    .filter((a) => a.clientId === client.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const professionals = users.filter((u) => u.role !== "RECEPTIONIST");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <Link href="/clients">
          <Button variant="ghost" size="icon" className="mt-0.5"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-foreground">{client.name}</h1>
            <StatusBadge status={client.status} />
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Cliente desde {new Date(client.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <Button onClick={() => setApptDialogOpen(true)} className="gap-2 hidden sm:flex">
          <CalendarPlus className="h-4 w-4" /> Novo atendimento
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">Dados pessoais</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-muted-foreground text-xs">Telefone</p><p className="text-foreground">{client.phone ?? "—"}</p></div>
            <div><p className="text-muted-foreground text-xs">E-mail</p><p className="text-foreground">{client.email ?? "—"}</p></div>
            <div><p className="text-muted-foreground text-xs">Aniversário</p><p className="text-foreground">{client.birthDate ? new Date(client.birthDate).toLocaleDateString("pt-BR") : "—"}</p></div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">Ficha técnica</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-muted-foreground text-xs">Cor do cabelo</p><p className="text-foreground">{client.hairColor ?? "—"}</p></div>
            <div><p className="text-muted-foreground text-xs">Tom de pele</p><p className="text-foreground">{client.skinTone ?? "—"}</p></div>
            <div><p className="text-muted-foreground text-xs">Esmalte favorito</p><p className="text-foreground">{client.nailPolish ?? "—"}</p></div>
            <div><p className="text-muted-foreground text-xs">Alergias</p><p className="text-foreground">{client.allergies ?? "—"}</p></div>
          </div>
          {client.notes && <div><p className="text-muted-foreground text-xs">Observações</p><p className="text-foreground text-sm">{client.notes}</p></div>}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium text-foreground mb-4">Histórico de atendimentos ({clientAppointments.length})</p>
        {clientAppointments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum atendimento registrado.</p>
        ) : (
          <div className="flex flex-col">
            {clientAppointments.map((appt, i) => (
              <div key={appt.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-primary mt-1 shrink-0" />
                  {i < clientAppointments.length - 1 && <div className="w-0.5 bg-border flex-1 my-1" />}
                </div>
                <div className="pb-4 flex-1">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-medium text-foreground">{appt.service?.name ?? "Serviço"}</p>
                      <p className="text-xs text-muted-foreground">
                        {appt.professional?.name ?? "—"} · {new Date(appt.date).toLocaleDateString("pt-BR")}
                      </p>
                      {appt.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">{appt.notes}</p>}
                    </div>
                    <p className="text-sm font-medium text-foreground">R$ {Number(appt.price).toLocaleString("pt-BR")}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sm:hidden">
        <Button onClick={() => setApptDialogOpen(true)} className="w-full gap-2">
          <CalendarPlus className="h-4 w-4" /> Novo atendimento
        </Button>
      </div>

      <NewAppointmentDialog
        open={apptDialogOpen}
        onClose={() => setApptDialogOpen(false)}
        preselectedClientId={client.id}
        clients={[client]}
        professionals={professionals}
        services={services}
        onSuccess={() => { router.refresh(); toast.success("Atendimento registrado!"); }}
      />
    </div>
  );
}
