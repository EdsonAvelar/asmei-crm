"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockAppointments, mockClients, mockUsers, mockServices } from "@/lib/mock-data";

export function AppointmentsPageClient() {
  const [selectedProfId, setSelectedProfId] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);

  const professionals = mockUsers.filter((u) => u.role === "PROFESSIONAL" || u.role === "OWNER");

  const filtered = useMemo(() => {
    let list = [...mockAppointments].sort((a, b) => b.date.getTime() - a.date.getTime());
    if (selectedProfId !== "ALL") list = list.filter((a) => a.professionalId === selectedProfId);
    return list;
  }, [selectedProfId]);

  const getClient = (id: string) => mockClients.find((c) => c.id === id);
  const getProfessional = (id: string) => mockUsers.find((u) => u.id === id);
  const getService = (id: string) => mockServices.find((s) => s.id === id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Atendimentos</h1>
          <p className="text-muted-foreground text-sm mt-1">{mockAppointments.length} atendimentos registrados</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Registrar atendimento
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setSelectedProfId("ALL")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              selectedProfId === "ALL" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Todas
          </button>
          {professionals.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProfId(p.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedProfId === p.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
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
              {filtered.map((appt) => {
                const client = getClient(appt.clientId);
                const professional = getProfessional(appt.professionalId);
                const service = getService(appt.serviceId);
                return (
                  <tr key={appt.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {appt.date.toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{client?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{service?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{professional?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      R$ {appt.price.toLocaleString("pt-BR")}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum atendimento encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Placeholder dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDialogOpen(false)}>
          <div className="bg-card rounded-xl border border-border p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <p className="font-medium text-foreground mb-2">Registrar atendimento</p>
            <p className="text-sm text-muted-foreground mb-4">Formulário completo disponível na Fase 3.</p>
            <Button onClick={() => setDialogOpen(false)} className="w-full">Fechar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
