"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewAppointmentDialog } from "@/components/shared/NewAppointmentDialog";
import type { Client, User, Service, Appointment } from "@/types";

interface AppointmentWithRelations extends Omit<Appointment, "price"> {
  price: number | string | { toNumber(): number };
  client: Client;
  professional: User;
  service: Service;
}

interface Props {
  appointments: AppointmentWithRelations[];
  clients: Client[];
  users: User[];
  services: Service[];
}

export function AppointmentsPageClient({ appointments, clients, users, services }: Props) {
  const router = useRouter();
  const [selectedProfId, setSelectedProfId] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);

  const professionals = users.filter((u) => u.role !== "RECEPTIONIST");

  const filtered = useMemo(() => {
    if (selectedProfId === "ALL") return appointments;
    return appointments.filter((a) => a.professionalId === selectedProfId);
  }, [appointments, selectedProfId]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Atendimentos</h1>
          <p className="text-muted-foreground text-sm mt-1">{appointments.length} atendimentos registrados</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Registrar atendimento
        </Button>
      </div>

      <div className="flex gap-1 bg-muted rounded-lg p-1 self-start flex-wrap">
        <button
          onClick={() => setSelectedProfId("ALL")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedProfId === "ALL" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          Todas
        </button>
        {professionals.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProfId(p.id)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedProfId === p.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            {p.name.split(" ")[0]}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Serviço</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Profissional</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Valor</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((appt) => (
                <tr key={appt.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {new Date(appt.date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{appt.client?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{appt.service?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{appt.professional?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">
                    R$ {Number(appt.price).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhum atendimento encontrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewAppointmentDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        clients={clients}
        professionals={professionals}
        services={services}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
