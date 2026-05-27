"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, LayoutList, Columns3, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ClientsKanban } from "@/components/kanban/ClientsKanban";
import { NewClientDialog } from "@/components/shared/NewClientDialog";
import type { Client, User, Appointment, ClientStatus } from "@/types";

interface Props {
  clients: Client[];
  users: User[];
  appointments: (Appointment & { [key: string]: unknown })[];
}

const TABS: { label: string; value: ClientStatus | "ALL" }[] = [
  { label: "Todos", value: "ALL" },
  { label: "Em risco", value: "AT_RISK" },
  { label: "Inativos", value: "INACTIVE" },
  { label: "VIP", value: "VIP" },
];

export function ClientsPageClient({ clients, users, appointments }: Props) {
  const [view, setView] = useState<"list" | "kanban">("kanban");
  const [tab, setTab] = useState<ClientStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...clients];
    if (tab !== "ALL") list = list.filter((c) => c.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    return list;
  }, [clients, tab, search]);

  const getProfessional = (id: string) => users.find((u) => u.id === id);
  const getLastAppointment = (clientId: string) => {
    return appointments
      .filter((a) => a.clientId === clientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] ?? null;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Clientes</h1>
          <p className="text-muted-foreground text-sm mt-1">{clients.length} clientes cadastradas</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Nova cliente
        </Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === t.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1 border border-border rounded-lg p-1">
          <button onClick={() => setView("list")} className={`p-1.5 rounded transition-colors ${view === "list" ? "bg-muted" : "hover:bg-muted/50"}`} title="Lista">
            <LayoutList className="h-4 w-4" />
          </button>
          <button onClick={() => setView("kanban")} className={`p-1.5 rounded transition-colors ${view === "kanban" ? "bg-muted" : "hover:bg-muted/50"}`} title="Kanban">
            <Columns3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {view === "list" ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Telefone</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Último atend.</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Profissional</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => {
                  const lastAppt = getLastAppointment(client.id);
                  const prof = lastAppt ? getProfessional(lastAppt.professionalId) : null;
                  return (
                    <tr key={client.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/clients/${client.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                          {client.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{client.phone ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {lastAppt ? new Date(lastAppt.date).toLocaleDateString("pt-BR") : "Nunca"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{prof?.name ?? "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={client.status} /></td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nenhuma cliente encontrada</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <ClientsKanban clients={clients} appointments={appointments} />
      )}

      <NewClientDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
