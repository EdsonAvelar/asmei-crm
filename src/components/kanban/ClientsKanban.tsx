"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Client, ClientStatus } from "@/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { mockAppointments } from "@/lib/mock-data";

const COLUMNS: { status: ClientStatus; label: string; color: string }[] = [
  { status: "ACTIVE", label: "Ativa", color: "border-t-green-500" },
  { status: "AT_RISK", label: "Em Risco", color: "border-t-amber-500" },
  { status: "INACTIVE", label: "Inativa", color: "border-t-red-500" },
  { status: "VIP", label: "VIP", color: "border-t-purple-500" },
];

function daysSince(date: Date) {
  return Math.floor((Date.now() - date.getTime()) / 86400000);
}

function ClientCard({ client }: { client: Client }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: client.id });

  const lastAppt = mockAppointments
    .filter((a) => a.clientId === client.id)
    .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

  const days = lastAppt ? daysSince(lastAppt.date) : null;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={`bg-background rounded-lg border border-border p-3 cursor-grab active:cursor-grabbing select-none ${
        isDragging ? "opacity-50 shadow-lg" : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
          {client.name[0]}
        </div>
        <p className="text-sm font-medium text-foreground truncate">{client.name}</p>
      </div>
      {days !== null ? (
        <p className="text-xs text-muted-foreground pl-9">
          {days === 0 ? "Hoje" : `${days} dias sem visita`}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground pl-9">Sem atendimento</p>
      )}
    </div>
  );
}

interface ClientsKanbanProps {
  clients: Client[];
}

export function ClientsKanban({ clients }: ClientsKanbanProps) {
  const [items, setItems] = useState(clients);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    // Visual only — no status change in Phase 2
    const from = items.find((c) => c.id === active.id);
    const to = items.find((c) => c.id === over.id);
    if (!from || !to || from.status !== to.status) return;
    const fromIdx = items.indexOf(from);
    const toIdx = items.indexOf(to);
    const next = [...items];
    next.splice(fromIdx, 1);
    next.splice(toIdx, 0, from);
    setItems(next);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colClients = items.filter((c) => c.status === col.status);
          return (
            <div key={col.status} className={`rounded-xl border-t-2 border border-border bg-card p-3 flex flex-col gap-2 ${col.color}`}>
              <div className="flex items-center justify-between mb-1">
                <StatusBadge status={col.status} />
                <span className="text-xs text-muted-foreground">{colClients.length}</span>
              </div>
              <SortableContext items={colClients.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                {colClients.map((client) => (
                  <ClientCard key={client.id} client={client} />
                ))}
              </SortableContext>
              {colClients.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhuma cliente</p>
              )}
            </div>
          );
        })}
      </div>
    </DndContext>
  );
}
