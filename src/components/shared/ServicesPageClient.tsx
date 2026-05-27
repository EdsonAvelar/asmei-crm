"use client";

import { useState } from "react";
import { Plus, Clock, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleServiceActive } from "@/actions/services";
import type { Service } from "@/types";

interface Props {
  initialServices: Service[];
}

export function ServicesPageClient({ initialServices }: Props) {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>(initialServices);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleToggle(id: string) {
    setServices((prev) => prev.map((s) => s.id === id ? { ...s, active: !s.active } : s));
    const result = await toggleServiceActive(id);
    if (result.error) {
      setServices(initialServices);
      toast.error("Erro ao atualizar serviço.");
    } else {
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Serviços</h1>
          <p className="text-muted-foreground text-sm mt-1">{services.filter((s) => s.active).length} serviços ativos</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Novo serviço
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.id}
            className={`rounded-xl border bg-card p-4 flex flex-col gap-3 transition-opacity ${service.active ? "border-border opacity-100" : "border-border opacity-50"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-foreground">{service.name}</p>
                <p className="text-xl font-bold text-primary mt-1">
                  R$ {Number(service.price).toLocaleString("pt-BR")}
                </p>
              </div>
              <button
                onClick={() => handleToggle(service.id)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${service.active ? "bg-primary" : "bg-muted"}`}
                aria-label={service.active ? "Desativar" : "Ativar"}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${service.active ? "translate-x-4" : "translate-x-1"}`} />
              </button>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{service.durationMinutes} min</span>
              <span className="flex items-center gap-1"><RotateCcw className="h-3 w-3" />Retorno a cada {service.returnDays} dias</span>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-3 py-8 text-center">Nenhum serviço cadastrado.</p>
        )}
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDialogOpen(false)}>
          <div className="bg-card rounded-xl border border-border p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <p className="font-medium text-foreground mb-2">Novo serviço</p>
            <p className="text-sm text-muted-foreground mb-4">Formulário completo disponível em breve.</p>
            <Button onClick={() => setDialogOpen(false)} className="w-full">Fechar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
