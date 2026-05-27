"use client";

import type { User, Appointment } from "@/types";

interface AppointmentWithPrice extends Omit<Appointment, "price"> {
  price: number | string | { toNumber(): number };
}

interface Props {
  users: User[];
  appointments: AppointmentWithPrice[];
}

const ROLE_LABEL: Record<string, string> = {
  OWNER: "Proprietária",
  PROFESSIONAL: "Profissional",
  RECEPTIONIST: "Recepcionista",
};

export function ProfessionalsPageClient({ users, appointments }: Props) {
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const stats = users.map((user) => {
    const allAppts = appointments.filter((a) => a.professionalId === user.id);
    const monthAppts = allAppts.filter((a) => new Date(a.date) >= thisMonth);
    const clientIds = new Set(allAppts.map((a) => a.clientId));
    const monthRevenue = monthAppts.reduce((sum, a) => sum + Number(a.price), 0);
    return { user, totalAppointments: allAppts.length, monthAppointments: monthAppts.length, uniqueClients: clientIds.size, monthRevenue };
  });

  const sorted = [...stats].sort((a, b) => b.monthAppointments - a.monthAppointments);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profissionais</h1>
        <p className="text-muted-foreground text-sm mt-1">{users.length} membros da equipe</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium text-foreground mb-3">Ranking do mês</p>
        <div className="flex flex-col divide-y divide-border">
          {sorted.map((s, i) => (
            <div key={s.user.id} className="flex items-center gap-3 py-3">
              <div className="w-6 text-center">
                {i === 0 && <span className="text-sm">🥇</span>}
                {i === 1 && <span className="text-sm">🥈</span>}
                {i === 2 && <span className="text-sm">🥉</span>}
                {i > 2 && <span className="text-sm text-muted-foreground">{i + 1}</span>}
              </div>
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                {s.user.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{s.user.name}</p>
                <p className="text-xs text-muted-foreground">{ROLE_LABEL[s.user.role]}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{s.monthAppointments} atend.</p>
                <p className="text-xs text-muted-foreground">esse mês</p>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-primary">R$ {s.monthRevenue.toLocaleString("pt-BR")}</p>
                <p className="text-xs text-muted-foreground">receita</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.user.id} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                {s.user.name[0]}
              </div>
              <div>
                <p className="font-medium text-foreground">{s.user.name}</p>
                <p className="text-xs text-muted-foreground">{ROLE_LABEL[s.user.role]}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">{s.totalAppointments}</p>
                <p className="text-xs text-muted-foreground">Atendimentos</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">{s.uniqueClients}</p>
                <p className="text-xs text-muted-foreground">Clientes</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">{s.monthAppointments}</p>
                <p className="text-xs text-muted-foreground">Este mês</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
