# PLAN.md — Asmei CRM

MVP produtivo do zero ao deploy em 6 fases. Frontend primeiro, backend depois. Cada fase termina com o sistema rodando e testável no Vercel.

---

## Visão geral das fases

| Fase | Branch | Foco | Entregável testável |
|------|--------|------|---------------------|
| 1 | `phase/1-foundation` | Setup + Auth UI | Telas de login/registro rodando no Vercel |
| 2 | `phase/2-core-ui` | UI completa com dados mock | Todas as telas navegáveis com dados fictícios |
| 3 | `phase/3-backend` | Banco + Auth real + CRUD | Sistema com dados reais, multitenancy funcionando |
| 4 | `phase/4-business-logic` | Regras de negócio + Dashboard | Status de cliente, métricas e rankings reais |
| 5 | `phase/5-monetization` | Stripe + Cartão de visita + E-mail | Assinatura end-to-end, trial, cartão público |
| 6 | `phase/6-audit` | Segurança + Performance + QA | Sistema aprovado para produção |

---

## Fase 1 — Foundation + Auth UI

**Branch:** `phase/1-foundation`

**Objetivo:** Projeto configurado, CI/CD no ar, telas de auth navegáveis com layout de marca.

### Setup do projeto
- [x] `npx create-next-app@latest asmei-crm --typescript --tailwind --app --src-dir`
- [x] Instalar e configurar shadcn/ui (`npx shadcn@latest init`)
- [x] Configurar `tsconfig.json` com `paths: { "@/*": ["./src/*"] }`
- [x] Configurar `tailwind.config.ts` com variável `--brand` (pink #E91E8C) e fonte Inter
- [x] Adicionar `globals.css` com variáveis de cor da marca
- [x] Criar `.env.local` e `.env.example` com todas as variáveis do CLAUDE.md
- [x] Configurar ESLint + Prettier
- [x] Criar repositório no GitHub e conectar ao Vercel (deploy automático no push)

### Telas de Auth (frontend only — sem lógica real)
- [x] Página `/login` — formulário email/senha + botão "Entrar com Google" + link para registro
- [x] Página `/register` — formulário nome do salão, nome, email, senha + botão Google
- [x] Componente `AuthLayout` com logo Asmei, fundo dark, card centralizado
- [x] Feedback visual de loading nos botões (spinner)
- [x] Mensagens de erro inline nos campos (validação client-side com Zod)
- [x] Redirecionamento simulado: submit → `/` (placeholder do dashboard)

### Layout base do Dashboard (shell vazio)
- [x] `(dashboard)/layout.tsx` com sidebar fixa + topbar
- [x] Sidebar com itens: Dashboard, Clientes, Atendimentos, Serviços, Profissionais, Configurações
- [x] Topbar com nome do salão (placeholder) + avatar do usuário + botão logout
- [x] Responsividade: sidebar colapsável em mobile (sheet do shadcn)
- [x] Página `(dashboard)/page.tsx` com placeholder "Dashboard em construção"

### Critério de aceite da Fase 1
- [x] Deploy funcionando no Vercel
- [x] Navegar para `/login`, preencher formulário, clicar em submit → vai para `/`
- [x] Layout do dashboard visível e responsivo em mobile e desktop
- [x] Sem erros no console

---

## Fase 2 — Core UI com dados mock

**Branch:** `phase/2-core-ui`

**Objetivo:** Todas as telas do produto navegáveis com dados fictícios hardcoded. Nenhuma chamada real ao banco.

### Dados mock
- [x] Criar `src/lib/mock-data.ts` com arrays de clientes, atendimentos, serviços e profissionais (10–15 registros cada)
- [x] Tipos TypeScript completos em `src/types/index.ts` (Client, Appointment, Service, User, Tenant)

### Dashboard
- [x] Cards de métricas: Total de clientes, Clientes em risco, Receita do mês, Atendimentos do mês
- [x] Gráfico de linha (Recharts): atendimentos por semana nos últimos 30 dias
- [x] Gráfico de pizza (Recharts): distribuição de clientes por status (ACTIVE, AT_RISK, INACTIVE, VIP)
- [x] Lista de "Clientes em risco" (top 5) com botão de ação

### Clientes — Lista
- [x] Tabela de clientes com colunas: nome, telefone, último atendimento, status (badge colorido), profissional
- [x] Badge de status: verde (ACTIVE), amarelo (AT_RISK), vermelho (INACTIVE), roxo (VIP)
- [x] Filtro por status (tabs: Todos, Em risco, Inativos, VIP)
- [x] Busca por nome em tempo real (client-side)
- [x] Botão "Nova cliente" abre Sheet/Dialog com formulário (sem submit real)

### Clientes — Kanban
- [x] Toggle Lista / Kanban na página de clientes
- [x] Board com 4 colunas: Ativa, Em Risco, Inativa, VIP
- [x] Cards de cliente com nome, foto placeholder e dias sem visita
- [x] Drag-and-drop visual com dnd-kit (sem persistência ainda)

### Clientes — Ficha individual
- [x] Página `/clients/[id]` com dados pessoais + ficha técnica (tom de base, cor de cabelo, esmalte, alergias, notas)
- [x] Histórico de atendimentos da cliente em linha do tempo
- [x] Botão "Novo atendimento" (modal sem submit real)

### Atendimentos
- [x] Lista de atendimentos com data, cliente, profissional, serviço, valor
- [x] Filtro por profissional e por período (date picker)
- [x] Botão "Registrar atendimento" abre form modal (sem submit real)

### Serviços
- [x] Lista de serviços com nome, ciclo de retorno (ex: "a cada 30 dias"), preço, duração
- [x] Toggle ativo/inativo visual
- [x] Form modal de cadastro/edição (sem submit real)

### Profissionais
- [x] Cards de profissionais com foto, nome, role, métricas resumidas (N clientes, N atendimentos)
- [x] Ranking por número de atendimentos no mês

### Configurações
- [x] Tabs: Salão, Minha conta, Equipe, Plano
- [x] Campos de formulário mockados (sem submit)
- [x] Aba Plano mostra cards dos planos BASIC e PRO com comparativo

### Critério de aceite da Fase 2
- Todas as rotas navegáveis sem erro 404 ou crash
- Dados mock aparecem em todas as telas
- Kanban com drag-and-drop visual funcionando
- Gráficos renderizando corretamente
- Mobile-first: todas as telas usáveis em 375px de largura

---

## Fase 3 — Backend + Auth real + CRUD

**Branch:** `phase/3-backend`

**Objetivo:** Substituir todos os dados mock por dados reais. Multitenancy funcionando. Cadastro e login reais.

### Banco de dados
- [ ] Criar projeto no Supabase e obter `DATABASE_URL`
- [ ] Instalar Prisma (`npm install prisma @prisma/client`)
- [ ] Criar `prisma/schema.prisma` com todos os modelos do CLAUDE.md (Tenant, User, Client, Service, Appointment, ProfessionalCard)
- [ ] Rodar `prisma migrate dev --name init`
- [ ] Criar `prisma/seed.ts` com 1 tenant, 2 usuários, 5 clientes, 3 serviços e 10 atendimentos de exemplo
- [ ] Implementar `src/lib/prisma.ts` com singleton + middleware de tenant (código do CLAUDE.md)

### Auth
- [ ] Instalar NextAuth v5 (`npm install next-auth@beta`)
- [ ] Implementar `src/lib/auth.ts` com `CredentialsProvider` (bcrypt) + `GoogleProvider`
- [ ] Callbacks `jwt` e `session` propagando `tenantId`, `userId`, `role`
- [ ] Criar `src/app/api/auth/[...nextauth]/route.ts`
- [ ] Ao primeiro login com Google: criar Tenant + User OWNER automaticamente
- [ ] Proteger `(dashboard)/layout.tsx` com redirect para `/login` se sem sessão
- [ ] Conectar formulários de `/login` e `/register` ao NextAuth real
- [ ] Instalar `bcryptjs` e hashear senhas no registro

### Server Actions — Clientes
- [ ] `actions/clients.ts`: `getClients`, `getClientById`, `createClient`, `updateClient`, `deleteClient`
- [ ] `recalculateClientStatus(clientId)` — calcula e persiste status baseado no último atendimento
- [ ] Substituir mock data nos componentes de Clientes pelas actions reais

### Server Actions — Atendimentos
- [ ] `actions/appointments.ts`: `getAppointments`, `createAppointment`, `updateAppointment`, `deleteAppointment`
- [ ] `createAppointment` chama `recalculateClientStatus` após criar
- [ ] Substituir mock data nos componentes de Atendimentos

### Server Actions — Serviços
- [ ] `actions/services.ts`: `getServices`, `createService`, `updateService`, `toggleServiceActive`
- [ ] Substituir mock data nos componentes de Serviços

### Server Actions — Usuários / Profissionais
- [ ] `actions/users.ts`: `getUsers`, `inviteUser`, `updateUserRole`, `removeUser`
- [ ] Guard em `inviteUser`: verificar limite de 5 usuários no plano BASIC
- [ ] Substituir mock data nos componentes de Profissionais e Configurações > Equipe

### Variáveis de ambiente no Vercel
- [ ] Configurar todas as env vars no painel do Vercel (DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_*)
- [ ] Rodar `prisma migrate deploy` via script de build

### Critério de aceite da Fase 3
- Criar conta nova → Tenant e User criados no banco
- Login com Google funciona
- Dois tenants diferentes não veem dados um do outro (testar em aba anônima)
- CRUD completo de clientes, atendimentos e serviços persistindo no Supabase
- Deploy no Vercel com dados reais funcionando

---

## Fase 4 — Regras de negócio + Dashboard real

**Branch:** `phase/4-business-logic`

**Objetivo:** Lógica de retenção funcionando automaticamente. Dashboard com métricas reais.

### Status de cliente automatizado
- [ ] Implementar `lib/client-status.ts` com função `recalculateClientStatus` (lógica completa do CLAUDE.md: VIP > INACTIVE > AT_RISK > ACTIVE)
- [ ] Criar `src/app/api/cron/update-statuses/route.ts` — endpoint que roda `recalculateClientStatus` para todos os clientes do tenant
- [ ] Configurar Vercel Cron em `vercel.json`: executar `/api/cron/update-statuses` diariamente às 3h
- [ ] Proteger endpoint cron com `CRON_SECRET` no header

### Dashboard com dados reais
- [ ] `actions/dashboard.ts`: `getDashboardMetrics(tenantId)` retornando contagens por status, receita do mês, atendimentos por semana
- [ ] Substituir dados mock dos gráficos Recharts pelos dados reais
- [ ] Lista "Clientes em risco" com clientes reais ordenados por dias sem visita
- [ ] Skeleton loading nos cards e gráficos enquanto carrega (Suspense + loading.tsx)

### Ranking de profissionais
- [ ] Query agregada: atendimentos, receita e clientes por profissional no mês atual
- [ ] Componente de ranking na página Profissionais com dados reais

### Kanban com persistência
- [ ] Drag-and-drop no Kanban não altera status diretamente — exibe modal de confirmação de "Registrar atendimento" ao arrastar para coluna mais avançada
- [ ] Arrastar para INACTIVE mostra confirmação "Marcar como inativa manualmente?" (único caso de edição manual permitida)

### Ficha técnica real
- [ ] Formulário de ficha técnica (hairColor, skinTone, nailPolish, allergies, notes) com submit real
- [ ] Histórico de atendimentos da ficha carregado do banco

### Critério de aceite da Fase 4
- Criar atendimento → status da cliente atualiza automaticamente
- Cron testável manualmente via `GET /api/cron/update-statuses?secret=xxx`
- Dashboard mostra métricas reais do tenant logado
- Ranking de profissionais correto

---

## Fase 5 — Monetização + Cartão de visita + E-mail

**Branch:** `phase/5-monetization`

**Objetivo:** Pagamento e assinatura end-to-end. Cartão de visita público. Alertas por e-mail.

### Stripe — Assinatura
- [ ] Instalar `stripe` e `@stripe/stripe-js`
- [ ] Criar produtos e preços no Stripe Dashboard (BASIC R$199, PRO R$399)
- [ ] `actions/subscriptions.ts`: `createCheckoutSession(plan)` → redireciona para Stripe Checkout
- [ ] Página de planos em `/settings` com botões "Assinar BASIC" e "Assinar PRO"
- [ ] Página de sucesso `/settings/success` e cancelamento `/settings/cancel` pós-checkout
- [ ] Implementar `src/app/api/webhooks/stripe/route.ts` — processar eventos:
  - `checkout.session.completed` → atualizar `plan`, `stripeSubscriptionId`, `stripeCurrentPeriodEnd`
  - `invoice.payment_succeeded` → renovar `stripeCurrentPeriodEnd`
  - `customer.subscription.deleted` → rebaixar para BASIC
- [ ] Middleware `src/middleware.ts` — verificar trial/assinatura ativa antes de servir dashboard; redirecionar para `/settings` se expirado

### Trial
- [ ] Banner de trial no topbar: "X dias restantes de trial — Assine agora" (quando `trialEndsAt` < 7 dias)
- [ ] Tenant criado com `trialEndsAt = now + 14d` e `plan = BASIC`

### Cartão de visita (PRO)
- [ ] Guard: `canUseFeature(tenant, 'card')` bloqueia criação se não for PRO (mostra upsell)
- [ ] `actions/cards.ts`: `createCard`, `updateCard`, `getCardBySlug`
- [ ] Slug gerado como `nome-profissional-xxxx` (nanoid de 4 chars), imutável após criação
- [ ] Formulário de cartão na página do profissional: bio, WhatsApp, Instagram, foto (upload via Supabase Storage)
- [ ] Página pública `/card/[slug]` — sem auth, exibe foto, bio, links e botão WhatsApp
- [ ] Formulário de captação de cadastro na página do cartão: nome, telefone, e-mail → cria Client no tenant do profissional

### E-mail com Brevo
- [ ] Instalar `@getbrevo/brevo`
- [ ] `lib/brevo.ts` com função `sendEmail(to, templateId, params)`
- [ ] Template 1: boas-vindas ao novo salão (disparo no registro)
- [ ] Template 2: alerta semanal ao OWNER — "Você tem N clientes em risco"
- [ ] Cron semanal (segunda-feira 8h) dispara alerta de clientes em risco para cada tenant ativo

### Critério de aceite da Fase 5
- Fluxo completo: trial expira → tela de planos → Stripe Checkout → webhook → plano ativo → dashboard liberado
- Cartão de visita acessível publicamente em `/card/[slug]` sem login
- Cadastro via cartão cria cliente no banco do profissional
- E-mail de boas-vindas chega ao registrar novo salão
- Tentativa de criar cartão no plano BASIC mostra modal de upsell

---

## Fase 6 — Auditoria de Segurança, Performance e QA

**Branch:** `phase/6-audit`

**Objetivo:** Sistema aprovado para produção. Zero vulnerabilidades conhecidas, performance aceitável, sem erros silenciosos.

### Segurança
- [ ] **Tenant isolation audit** — revisar todas as Server Actions e garantir que nenhuma faz query sem `tenantContext.run()`; criar teste manual com dois tenants e verificar que dados não vazam
- [ ] **Auth hardening** — verificar que todas as rotas do dashboard exigem sessão válida; testar acesso direto às URLs sem login
- [ ] **Role enforcement** — testar que PROFESSIONAL não acessa financeiro/configurações; RECEPTIONIST não altera serviços
- [ ] **Input sanitization** — revisar todos os schemas Zod; garantir que campos de texto não aceitam HTML/scripts
- [ ] **Webhook Stripe** — verificar assinatura do webhook com `stripe.webhooks.constructEvent`; rejeitar requisições sem assinatura válida
- [ ] **Cron endpoint** — verificar que `/api/cron/*` exige header `Authorization: Bearer CRON_SECRET`; sem ele retorna 401
- [ ] **Variáveis de ambiente** — confirmar que nenhuma chave secreta está em código ou em variáveis `NEXT_PUBLIC_*`
- [ ] **Rate limiting** — adicionar rate limit nas rotas `/api/auth` para prevenir brute force (Vercel Edge Middleware)
- [ ] **CORS** — confirmar que apenas o domínio do app pode chamar as APIs internas

### Performance
- [ ] **Queries N+1** — revisar queries Prisma com `include` e verificar se há N+1 ocultos; usar `select` para limitar campos retornados
- [ ] **Índices** — confirmar que todos os índices do schema estão criados (`tenantId`, `[tenantId, date]`, etc.)
- [ ] **Paginação** — implementar paginação (cursor-based) nas listagens de clientes e atendimentos (evitar `findMany` sem `take`)
- [ ] **Server Components** — verificar que componentes com dados pesados são Server Components; mover `"use client"` apenas para folhas da árvore
- [ ] **Image optimization** — usar `next/image` para fotos de profissionais e cartões de visita
- [ ] **Bundle size** — rodar `next build` e analisar com `@next/bundle-analyzer`; extrair Recharts e dnd-kit para dynamic imports
- [ ] **Vercel Analytics** — ativar Web Vitals no Vercel Dashboard; checar LCP, CLS e INP nas páginas principais

### Qualidade e erros
- [ ] **Error boundaries** — adicionar `error.tsx` em todas as rotas do dashboard com mensagem amigável e botão "Tentar novamente"
- [ ] **Loading states** — adicionar `loading.tsx` e Skeletons em todas as rotas com fetch de dados
- [ ] **Empty states** — telas de lista com zero registros devem ter ilustração e CTA (ex: "Nenhuma cliente ainda — Cadastre a primeira")
- [ ] **Toast de feedback** — todas as mutations (criar, editar, deletar) exibem toast de sucesso ou erro (shadcn Sonner)
- [ ] **Testes de fluxo crítico** — testar manualmente (ou com Playwright) os 4 fluxos do critério de sucesso do PRD:
  - [ ] Cadastrar cliente + registrar atendimento
  - [ ] Sistema identifica cliente em risco sem ação manual
  - [ ] Pagamento e assinatura end-to-end
  - [ ] Dois salões distintos sem misturar dados
- [ ] **Logs de erro** — configurar Sentry ou Vercel Log Drain para capturar erros de produção
- [ ] **Revisão de dependências** — rodar `npm audit`; corrigir vulnerabilidades high/critical
- [ ] **Checklist final de deploy**:
  - [ ] `prisma migrate deploy` rodou sem erros
  - [ ] Todas as env vars configuradas no Vercel
  - [ ] Webhook Stripe apontando para URL de produção
  - [ ] Cron jobs ativos no Vercel
  - [ ] Domínio customizado configurado (se houver)

### Critério de aceite da Fase 6
- Os 4 critérios de sucesso do PRD verificados e funcionando em produção
- `npm audit` sem vulnerabilidades high ou critical
- Nenhum vazamento de dados entre tenants (testado com dois salões reais)
- LCP < 2.5s nas páginas principais (Vercel Analytics)
- Sem erros não tratados no console de produção

---

## Resumo de dependências entre fases

```
Fase 1 → Fase 2 (UI sobre o shell)
Fase 2 → Fase 3 (backend substitui mocks)
Fase 3 → Fase 4 (regras sobre dados reais)
Fase 3 → Fase 5 (monetização sobre auth real)
Fase 4 + Fase 5 → Fase 6 (auditoria do sistema completo)
```

Fases 4 e 5 podem rodar em paralelo por pessoas diferentes — dependem apenas da Fase 3.
