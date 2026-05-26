import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Bem-vinda de volta! Aqui está um resumo do seu salão.
        </p>
      </div>

      {/* Placeholder cards — dados reais na Fase 4 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Clientes ativas", value: "—" },
          { label: "Em risco", value: "—" },
          { label: "Receita do mês", value: "—" },
          { label: "Atendimentos", value: "—" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 flex items-center justify-center min-h-48">
        <p className="text-muted-foreground text-sm">
          Gráficos e métricas chegam na Fase 4 🚀
        </p>
      </div>
    </div>
  );
}
