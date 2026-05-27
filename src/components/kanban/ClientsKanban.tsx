"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import type { Client, ClientStatus, Appointment } from "@/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { updateClientStatus } from "@/actions/clients";

const COLUMNS: { status: ClientStatus; color: string }[] = [
  { status: "ACTIVE", color: "border-t-green-500" },
  { status: "AT_RISK", color: "border-t-amber-500" },
  { status: "INACTIVE", color: "border-t-red-500" },
  { status: "VIP", color: "border-t-purple-500" },
];

function daysSince(date: Date) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

function CardContent({ client, lastApptDate }: { client: Client; lastApptDate: Date | null }) {
  const days = lastApptDate ? daysSince(lastApptDate) : null;
  return (
    <>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
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
    </>
  );
}

function SortableCard({ client, lastApptDate }: { client: Client; lastApptDate: Date | null }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: client.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={`bg-background rounded-lg border border-border p-3 cursor-grab active:cursor-grabbing select-none transition-opacity ${
        isDragging ? "opacity-40" : "opacity-100"
      }`}
    >
      <CardContent client={client} lastApptDate={lastApptDate} />
    </div>
  );
}

interface ColumnProps {
  status: ClientStatus;
  color: string;
  clients: Client[];
  getLastApptDate: (id: string) => Date | null;
  isOver: boolean;
}

function KanbanColumn({ status, color, clients, getLastApptDate, isOver }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div
      className={`rounded-xl border-t-2 border border-border bg-card p-3 flex flex-col gap-2 min-h-32 transition-colors ${color} ${
        isOver ? "bg-primary/5 border-primary/30" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <StatusBadge status={status} />
        <span className="text-xs text-muted-foreground">{clients.length}</span>
      </div>
      <SortableContext items={clients.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex flex-col gap-2 flex-1">
          {clients.map((client) => (
            <SortableCard key={client.id} client={client} lastApptDate={getLastApptDate(client.id)} />
          ))}
          {clients.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">Nenhuma cliente</p>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

interface ClientsKanbanProps {
  clients: Client[];
  appointments: Pick<Appointment, "clientId" | "date">[];
}

export function ClientsKanban({ clients, appointments }: ClientsKanbanProps) {
  const [items, setItems] = useState<Client[]>(clients);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<ClientStatus | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function getLastApptDate(clientId: string): Date | null {
    const appt = appointments
      .filter((a) => a.clientId === clientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    return appt ? new Date(appt.date) : null;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: { over: DragEndEvent["over"] }) {
    const { over } = event;
    if (!over) { setOverColumnId(null); return; }
    const isColumn = COLUMNS.some((col) => col.status === over.id);
    if (isColumn) {
      setOverColumnId(over.id as ClientStatus);
    } else {
      const overCard = items.find((c) => c.id === over.id);
      setOverColumnId(overCard?.status ?? null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setOverColumnId(null);
    if (!over) return;

    const draggedId = active.id as string;
    const snapshot = items;
    const draggedClient = snapshot.find((c) => c.id === draggedId);
    if (!draggedClient) return;

    const overIsColumn = COLUMNS.some((col) => col.status === over.id);
    const targetStatus: ClientStatus = overIsColumn
      ? (over.id as ClientStatus)
      : (snapshot.find((c) => c.id === over.id)?.status ?? draggedClient.status);

    if (draggedClient.status === targetStatus) return;

    setItems((prev) =>
      prev.map((c) => (c.id === draggedId ? { ...c, status: targetStatus } : c))
    );

    updateClientStatus(draggedId, targetStatus).then((result) => {
      if (result.error) {
        setItems(snapshot);
        toast.error("Erro ao mover cliente.");
      }
    });
  }

  const activeClient = activeId ? items.find((c) => c.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            color={col.color}
            clients={items.filter((c) => c.status === col.status)}
            getLastApptDate={getLastApptDate}
            isOver={overColumnId === col.status}
          />
        ))}
      </div>

      <DragOverlay>
        {activeClient && (
          <div className="bg-background rounded-lg border border-primary/50 p-3 shadow-2xl cursor-grabbing">
            <CardContent client={activeClient} lastApptDate={getLastApptDate(activeClient.id)} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
