"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateAppointmentStatus } from "@/actions/appointments";
import type { AppointmentStatus } from "@/types";

interface ApptForCalendar {
  id: string;
  date: Date | string;
  price: number;
  notes: string | null;
  status: AppointmentStatus;
  client: { id: string; name: string };
  professional: { id: string; name: string };
  service: { id: string; name: string; price: number };
}

interface Props {
  appointments: ApptForCalendar[];
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; dot: string; active: string; idle: string }> = {
  SCHEDULED: {
    label: "Agendado",
    dot: "bg-blue-400",
    active: "bg-blue-100 text-blue-700 ring-1 ring-blue-400",
    idle: "text-muted-foreground hover:bg-muted",
  },
  COMPLETED: {
    label: "Concluído",
    dot: "bg-green-500",
    active: "bg-green-100 text-green-700 ring-1 ring-green-500",
    idle: "text-muted-foreground hover:bg-muted",
  },
  MISSED: {
    label: "Faltou",
    dot: "bg-red-500",
    active: "bg-red-100 text-red-700 ring-1 ring-red-500",
    idle: "text-muted-foreground hover:bg-muted",
  },
};

function dateKey(date: Date | string): string {
  return new Date(date).toISOString().slice(0, 10);
}

function buildGrid(year: number, month: number): (number | null)[] {
  const firstDow = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const grid: (number | null)[] = Array(firstDow).fill(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(d);
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

export function CalendarPageClient({ appointments: initial }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedKey, setSelectedKey] = useState<string>(() => dateKey(today));
  const [appointments, setAppointments] = useState<ApptForCalendar[]>(initial);

  const todayKey = dateKey(today);
  const grid = buildGrid(year, month);

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  }

  function appsForDay(day: number): ApptForCalendar[] {
    const key = new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
    return appointments.filter((a) => dateKey(a.date) === key);
  }

  function handleDayClick(day: number) {
    const key = new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
    setSelectedKey(key);
  }

  const selectedAppts = appointments.filter((a) => dateKey(a.date) === selectedKey);
  const selectedDate = new Date(selectedKey + "T12:00:00");

  async function handleStatusChange(id: string, status: AppointmentStatus) {
    const snapshot = appointments;
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    const result = await updateAppointmentStatus(id, status);
    if (result.error) {
      setAppointments(snapshot);
      toast.error("Erro ao atualizar status.");
    }
  }

  const monthLabel = new Date(Date.UTC(year, month, 1)).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Calendário</h1>
        <p className="text-muted-foreground text-sm mt-1">Visualize e atualize o status dos procedimentos</p>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-5 text-xs text-muted-foreground flex-wrap">
        {(["SCHEDULED", "COMPLETED", "MISSED"] as AppointmentStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${STATUS_CONFIG[s].dot}`} />
            {STATUS_CONFIG[s].label}
          </span>
        ))}
      </div>

      {/* Calendário */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Navegação do mês */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="text-sm font-semibold text-foreground capitalize">{monthLabel}</p>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-2 text-center text-xs font-medium text-muted-foreground">
              {w}
            </div>
          ))}
        </div>

        {/* Células dos dias */}
        <div className="grid grid-cols-7">
          {grid.map((day, i) => {
            if (!day) {
              return (
                <div
                  key={`pad-${i}`}
                  className={`min-h-[4.5rem] bg-muted/20 border-b border-border/40 ${(i + 1) % 7 !== 0 ? "border-r border-border/40" : ""}`}
                />
              );
            }
            const key = new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
            const dayAppts = appsForDay(day);
            const isToday = key === todayKey;
            const isSelected = key === selectedKey;

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`min-h-[4.5rem] p-1.5 text-left flex flex-col gap-1 transition-colors border-b border-border/40 hover:bg-muted/30 ${
                  (i + 1) % 7 !== 0 ? "border-r border-border/40" : ""
                } ${isSelected ? "bg-primary/8 ring-inset ring-1 ring-primary/30" : ""}`}
              >
                <span
                  className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full shrink-0 ${
                    isToday ? "bg-primary text-white" : "text-foreground"
                  }`}
                >
                  {day}
                </span>
                {dayAppts.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 px-0.5">
                    {dayAppts.slice(0, 4).map((a) => (
                      <span key={a.id} className={`w-2 h-2 rounded-full ${STATUS_CONFIG[a.status].dot}`} />
                    ))}
                    {dayAppts.length > 4 && (
                      <span className="text-[10px] leading-none text-muted-foreground">
                        +{dayAppts.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Painel do dia selecionado */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <p className="text-sm font-medium text-foreground capitalize">
            {selectedDate.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <span className="text-xs text-muted-foreground">
            {selectedAppts.length === 0
              ? "Nenhum procedimento"
              : `${selectedAppts.length} procedimento${selectedAppts.length > 1 ? "s" : ""}`}
          </span>
        </div>

        {selectedAppts.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhum procedimento agendado para este dia.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {selectedAppts.map((appt) => (
              <div key={appt.id} className="px-4 py-3 flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_CONFIG[appt.status].dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{appt.client.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {appt.service.name} · {appt.professional.name}
                  </p>
                </div>
                <p className="text-sm font-medium text-foreground shrink-0">
                  R$ {appt.price.toLocaleString("pt-BR")}
                </p>
                <div className="flex gap-1 shrink-0">
                  {(["SCHEDULED", "COMPLETED", "MISSED"] as AppointmentStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(appt.id, s)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        appt.status === s ? STATUS_CONFIG[s].active : STATUS_CONFIG[s].idle
                      }`}
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
