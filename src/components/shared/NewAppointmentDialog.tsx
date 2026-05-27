"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createAppointment } from "@/actions/appointments";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Client, User, Service } from "@/types";

const schema = z.object({
  clientId: z.string().min(1, "Selecione uma cliente"),
  professionalId: z.string().min(1, "Selecione uma profissional"),
  serviceId: z.string().min(1, "Selecione um serviço"),
  date: z.string().min(1, "Informe a data"),
  price: z.number().positive("Valor deve ser positivo"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedClientId?: string;
  clients: Client[];
  professionals: User[];
  services: Service[];
}

export function NewAppointmentDialog({
  open, onClose, onSuccess, preselectedClientId, clients, professionals, services,
}: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientId: preselectedClientId ?? "",
      professionalId: "",
      serviceId: "",
      date: new Date().toISOString().slice(0, 10),
      price: 0,
      notes: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: FormValues) {
    const result = await createAppointment(data);
    if (result.error) {
      toast.error("Erro ao registrar atendimento.");
      return;
    }
    toast.success("Atendimento registrado!");
    form.reset();
    onClose();
    onSuccess?.();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar atendimento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
            {!preselectedClientId && (
              <FormField control={form.control} name="clientId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <FormControl>
                    <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...field}>
                      <option value="">Selecione...</option>
                      {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}
            <FormField control={form.control} name="professionalId" render={({ field }) => (
              <FormItem>
                <FormLabel>Profissional</FormLabel>
                <FormControl>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...field}>
                    <option value="">Selecione...</option>
                    {professionals.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="serviceId" render={({ field }) => (
              <FormItem>
                <FormLabel>Serviço</FormLabel>
                <FormControl>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      const svc = services.find((s) => s.id === e.target.value);
                      if (svc) form.setValue("price", Number(svc.price));
                    }}
                  >
                    <option value="">Selecione...</option>
                    {services.filter((s) => s.active).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl><Input placeholder="Opcional..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
