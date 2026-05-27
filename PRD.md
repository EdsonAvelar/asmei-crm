# PRD — Asmei CRM

## Problema

Donos de salão de beleza perdem clientes sem perceber. Não sabem quem está sumindo, quando a cliente deve retornar, qual profissional está perdendo clientes. Tudo fica no caderno, na cabeça ou espalhado no WhatsApp.

CRMs genéricos como HubSpot ou RD Station foram feitos para vendas B2B — não entendem ciclo de retorno de serviço, ficha técnica de cabelo, ou que o canal principal do salão é o WhatsApp.

## Solução

CRM focado em salões de beleza e estética que:

- Sabe quando cada cliente deve retornar (baseado no serviço que fez)
- Alerta automaticamente sobre clientes em risco de churn
- Mostra métricas simples: quem voltou, quem sumiu, quanto entrou
- ficha de clientes com dados pessoais como tinta de esmalte v

## Usuários

- **Dono do salão** — vê tudo, gerencia profissionais, acessa financeiro
- **Profissional** (cabeleireiro, manicure) — vê só seus clientes e sua agenda
- **Recepcionista** — cadastra clientes e registra atendimentos

## Funcionalidades

- Login com e-mail/senha e Google
- Multiusuário com perfis de acesso (dono, profissional, recepcionista)
- Multitenant (cada salão isolado, suporte a múltiplas unidades)
- Dashboard com métricas principais
- Cadastro de clientes com ficha técnica (tom de base, alergias, preferências)
- Histórico de atendimentos por cliente
- Status automático de cliente: ativa, em risco, inativa, VIP
- Kanban de clientes com drag-and-drop
- Cadastro de serviços com ciclo de retorno configurável
- Ranking de profissionais estilo podium
- Calendário de Procedimentos Agendados, Concluidos, faltosos.
- Assinatura recorrente com planos e trial de 14 dias
- Cartão de Visita para Profissionais divulgarem e coletar cadastro
- Planos 199 ( sem cartão de visita, sem dados, até 5 usuários) e 399

## Tecnologias

- **Framework**: Next.js 16
- **Estilo**: Tailwind CSS + shadcn/ui
- **Banco**: Supabase + Prisma ORM ( Com garantia de isolamento de tenant )
- **Auth**: NextAuth.js
- **Pagamento**: Stripe
- **E-mail**: Brevo
- **Gráficos**: Recharts
- **Drag-and-drop**: dnd-kit
- **Deploy**: Vercel + Supabase

## Identidade Visual

Nome **Asmei** — referência ao meme brasileiro, a sensação da cliente saindo do salão amando o resultado.

Paleta pink/magenta com toque de escuro sofisticado. Tom de voz descontraído e feminino. Interface mobile-first.


## Fora do escopo (v1)

Agendamento online para cliente, app mobile, integração com Instagram, nota fiscal, controle de estoque, financeiro completo, crm b2b.

## Critérios de sucesso

- Cadastrar cliente e registrar atendimento
- Sistema identifica clientes em risco sem ação manual
- Pagamento e assinatura funcionam end-to-end
- Dois salões distintos sem misturar dados

---

