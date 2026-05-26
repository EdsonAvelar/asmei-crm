"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { mockAppointments, mockUsers, mockServices } from "@/lib/mock-data";
import type { Client } from "@/types";

interface ClientDetailClientProps {
  client: Client;
}

export function ClientDetailClient({ client }: ClientDetailClientProps) {
  const [apptDialogOpen, setApptDialogOpen] = useState(false);

  const appointments = mockAppointments
    .filter((a) => a.clientId === client.id)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const getProfessional = (id: string) => mockUsers.find((u) => u.id === id);
  const getService = (id: string) => mockServices.find((s) => s.id === id);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/clients">
          <Button variant="ghost" size="icon" className="mt-0.5">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-foreground">{client.name}</h1>
            <StatusBadge status={client.status} />
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Cliente desde {client.createdAt.toLocaleDateString("pt-BR")}
          </p>
        </div>
        <Button onClick={() => setApptDialogOpen(true)} className="gap-2 hidden sm:flex">
          <CalendarPlus className="h-4 w-4" />
          Novo atendimento
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Personal data */}
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">Dados pessoais</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Telefone</p>
              <p className="text-foreground">{client.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">E-mail</p>
              <p className="text-foreground">{client.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Aniversário</p>
              <p className="text-foreground">
                {client.birthDate ? client.birthDate.toLocaleDateString("pt-BR") : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Technical sheet */}
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">Ficha técnica</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Cor do cabelo</p>
              <p className="text-foreground">{client.hairColor ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Tom de pele</p>
              <p className="text-foreground">{client.skinTone ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Esmalte favorito</p>
              <p className="text-foreground">{client.nailPolish ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Alergias</p>
              <p className="text-foreground">{client.allergies ?? "—"}</p>
            </div>
          </div>
          {client.notes && (
            <div>
              <p className="text-muted-foreground text-xs">Observações</p>
              <p className="text-foreground text-sm">{client.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Appointment history */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium text-foreground mb-4">
          Histórico de atendimentos ({appointments.length})
        </p>
        {appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum atendimento registrado.</p>
        ) : (
          <div className="relative flex flex-col gap-0">
            {appointments.map((appt, i) => {
              const service = getService(appt.serviceId);
              const professional = getProfessional(appt.professionalId);
              return (
                <div key={appt.id} className="flex gap-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary mt-1 flex-shrink-0" />
                    {i < appointments.length - 1 && (
                      <div className="w-0.5 bg-border flex-1 my-1" />
                    )}
                  </div>
                  {/* Content */}
                  <div className={`pb-4 flex-1 ${i === appointments.length - 1 ? "" : ""}`}>
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {service?.name ?? "Serviço"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {professional?.name ?? "—"} · {appt.date.toLocaleDateString("pt-BR")}
                        </p>
                        {appt.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5 italic">{appt.notes}</p>
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        R$ {appt.price.toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile button */}
      <div className="sm:hidden">
        <Button onClick={() => setApptDialogOpen(true)} className="w-full gap-2">
          <CalendarPlus className="h-4 w-4" />
          Novo atendimento
        </Button>
      </div>

      {/* Placeholder dialog notification */}
      {apptDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setApptDialogOpen(false)}>
          <div className="bg-card rounded-xl border border-border p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <p className="font-medium text-foreground mb-2">Novo atendimento</p>
            <p className="text-sm text-muted-foreground mb-4">Formulário completo disponível na Fase 3.</p>
            <Button onClick={() => setApptDialogOpen(false)} className="w-full">Fechar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
