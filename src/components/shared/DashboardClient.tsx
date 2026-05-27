"use client";

import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Users, AlertTriangle, TrendingUp, CalendarCheck } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Client, Appointment } from "@/types";

interface AppointmentWithRelations extends Omit<Appointment, "price"> {
  price: number | string | { toNumber(): number };
  client: Client;
  professional: { name: string };
  service: { name: string };
}

interface Props {
  clients: Client[];
  appointments: AppointmentWithRelations[];
}

function buildWeeklyData(appointments: AppointmentWithRelations[]) {
  const now = Date.now();
  const weeks = [
    { week: "Sem 1", start: now - 28 * 86400000, end: now - 21 * 86400000 },
    { week: "Sem 2", start: now - 21 * 86400000, end: now - 14 * 86400000 },
    { week: "Sem 3", start: now - 14 * 86400000, end: now - 7 * 86400000 },
    { week: "Sem 4", start: now - 7 * 86400000, end: now },
  ];
  return weeks.map((w) => ({
    week: w.week,
    atendimentos: appointments.filter((a) => {
      const t = new Date(a.date).getTime();
      return t >= w.start && t < w.end;
    }).length,
  }));
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#22c55e", AT_RISK: "#f59e0b", INACTIVE: "#ef4444", VIP: "#a855f7",
};
const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Ativas", AT_RISK: "Em risco", INACTIVE: "Inativas", VIP: "VIP",
};

export function DashboardClient({ clients, appointments }: Props) {
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const monthAppts = appointments.filter((a) => new Date(a.date) >= thisMonth);
  const monthRevenue = monthAppts.reduce((sum, a) => sum + Number(a.price), 0);
  const atRisk = clients.filter((c) => c.status === "AT_RISK");

  const metrics = [
    { label: "Clientes ativas", value: clients.filter((c) => c.status === "ACTIVE" || c.status === "VIP").length, icon: Users, color: "text-green-500" },
    { label: "Em risco", value: atRisk.length, icon: AlertTriangle, color: "text-amber-500" },
    { label: "Receita do mês", value: `R$ ${monthRevenue.toLocaleString("pt-BR")}`, icon: TrendingUp, color: "text-primary" },
    { label: "Atendimentos", value: monthAppts.length, icon: CalendarCheck, color: "text-blue-500" },
  ];

  const weeklyData = buildWeeklyData(appointments);
  const statusCounts = ["ACTIVE", "AT_RISK", "INACTIVE", "VIP"].map((s) => ({
    name: STATUS_LABELS[s],
    value: clients.filter((c) => c.status === s).length,
    color: STATUS_COLORS[s],
  })).filter((s) => s.value > 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Bem-vinda de volta! Aqui está um resumo do seu salão.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{m.label}</p>
              <m.icon className={`h-4 w-4 ${m.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground mb-4">Atendimentos por semana</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: 12 }} />
              <Line type="monotone" dataKey="atendimentos" stroke="oklch(0.620 0.241 355)" strokeWidth={2} dot={{ r: 4, fill: "oklch(0.620 0.241 355)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground mb-4">Clientes por status</p>
          {statusCounts.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {statusCounts.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum cliente ainda.</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium text-foreground mb-3">Clientes em risco</p>
        {atRisk.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma cliente em risco no momento.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {atRisk.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.phone ?? "Sem telefone"}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
