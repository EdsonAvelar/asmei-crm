"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockTenant, mockUsers } from "@/lib/mock-data";

const TABS = ["Salão", "Minha conta", "Equipe", "Plano"] as const;
type Tab = (typeof TABS)[number];

const ROLE_LABEL: Record<string, string> = {
  OWNER: "Proprietária",
  PROFESSIONAL: "Profissional",
  RECEPTIONIST: "Recepcionista",
};

export function SettingsPageClient() {
  const [activeTab, setActiveTab] = useState<Tab>("Salão");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie seu salão e sua conta</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 self-start flex-wrap">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Salão */}
      {activeTab === "Salão" && (
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-4 max-w-lg">
          <p className="text-sm font-medium text-foreground">Dados do salão</p>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nome do salão</label>
              <Input defaultValue={mockTenant.name} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Slug (URL pública)</label>
              <Input defaultValue={mockTenant.slug} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground mt-1">O slug não pode ser alterado após criação.</p>
            </div>
          </div>
          <Button className="self-start">Salvar alterações</Button>
        </div>
      )}

      {/* Minha conta */}
      {activeTab === "Minha conta" && (
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-4 max-w-lg">
          <p className="text-sm font-medium text-foreground">Dados pessoais</p>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nome</label>
              <Input defaultValue={mockUsers[0].name} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">E-mail</label>
              <Input defaultValue={mockUsers[0].email} type="email" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nova senha</label>
              <Input placeholder="Deixe em branco para manter" type="password" />
            </div>
          </div>
          <Button className="self-start">Salvar</Button>
        </div>
      )}

      {/* Equipe */}
      {activeTab === "Equipe" && (
        <div className="flex flex-col gap-4 max-w-2xl">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">E-mail</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Função</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                          {user.name[0]}
                        </div>
                        <span className="font-medium text-foreground">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-muted rounded-full px-2 py-1 text-muted-foreground">
                        {ROLE_LABEL[user.role]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button variant="outline" className="self-start gap-2">
            + Convidar membro
          </Button>
        </div>
      )}

      {/* Plano */}
      {activeTab === "Plano" && (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
            {/* BASIC */}
            <div className="rounded-xl border-2 border-border bg-card p-5 flex flex-col gap-3">
              <div>
                <p className="text-lg font-bold text-foreground">BASIC</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  R$ 199<span className="text-base font-normal text-muted-foreground">/mês</span>
                </p>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Até 5 usuários</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Clientes ilimitados</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Dashboard de retenção</li>
                <li className="flex items-center gap-2"><span className="text-muted-foreground/40">✗</span> Cartão de visita</li>
                <li className="flex items-center gap-2"><span className="text-muted-foreground/40">✗</span> Exportação de dados</li>
              </ul>
              <Button variant="outline" className="w-full mt-2">Selecionar BASIC</Button>
            </div>

            {/* PRO */}
            <div className="rounded-xl border-2 border-primary bg-card p-5 flex flex-col gap-3 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                RECOMENDADO
              </span>
              <div>
                <p className="text-lg font-bold text-foreground">PRO</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  R$ 399<span className="text-base font-normal text-muted-foreground">/mês</span>
                </p>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Usuários ilimitados</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Clientes ilimitados</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Dashboard de retenção</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Cartão de visita digital</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Exportação de dados</li>
              </ul>
              <Button className="w-full mt-2">Assinar PRO</Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-4 max-w-2xl">
            <p className="text-sm text-muted-foreground">
              Plano atual: <span className="font-semibold text-foreground">{mockTenant.plan}</span>
              {" · "}Trial até {mockTenant.trialEndsAt?.toLocaleDateString("pt-BR") ?? "–"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
