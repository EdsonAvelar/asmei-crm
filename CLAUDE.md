# CLAUDE.md — Asmei CRM

CRM para salões de beleza e estética. Foco em retenção de clientes, alertas de churn e métricas simples. Público-alvo: donas de salão no Brasil.

---

## Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Estilo | Tailwind CSS + shadcn/ui |
| Banco | PostgreSQL via Supabase |
| ORM | Prisma (com tenant middleware) |
| Auth | NextAuth.js v5 (email/senha + Google) |
| Pagamento | Stripe (assinaturas recorrentes) |
| E-mail | Brevo (transacional) |
| Gráficos | Recharts |
| Drag-and-drop | dnd-kit |
| Deploy | Vercel (app) + Supabase (banco) |

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          ← guard de auth + tenant
│   │   ├── page.tsx            ← dashboard principal
│   │   ├── clients/
│   │   │   ├── page.tsx        ← lista + kanban
│   │   │   └── [id]/
│   │   │       └── page.tsx    ← ficha da cliente
│   │   ├── appointments/
│   │   │   └── page.tsx
│   │   ├── services/
│   │   │   └── page.tsx
│   │   ├── professionals/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── card/
│   │   └── [slug]/
│   │       └── page.tsx        ← cartão de visita público
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts
│       └── webhooks/
│           └── stripe/
│               └── route.ts
├── components/
│   ├── ui/                     ← componentes shadcn (não editar diretamente)
│   ├── charts/                 ← wrappers Recharts
│   ├── kanban/                 ← board dnd-kit
│   └── shared/                 ← componentes reutilizáveis do produto
├── lib/
│   ├── prisma.ts               ← singleton do client
│   ├── auth.ts                 ← config NextAuth
│   ├── stripe.ts               ← helpers Stripe
│   ├── brevo.ts                ← helpers e-mail
│   └── tenant.ts               ← helpers de contexto tenant
├── actions/                    ← Server Actions (mutations)
│   ├── clients.ts
│   ├── appointments.ts
│   ├── services.ts
│   └── subscriptions.ts
├── hooks/                      ← Client hooks (use client)
└── types/
    └── index.ts                ← tipos compartilhados
```

---

## Modelo de Dados (Prisma Schema)

```prisma
// Regra: todo modelo de negócio tem campo tenantId obrigatório.
// A injeção automática é feita via middleware — nunca omitir.

enum Role {
  OWNER
  PROFESSIONAL
  RECEPTIONIST
}

enum Plan {
  BASIC   // R$199 — até 5 usuários, sem cartão de visita
  PRO     // R$399 — ilimitado, cartão de visita, exportação
}

enum ClientStatus {
  ACTIVE    // retornou dentro do ciclo esperado
  AT_RISK   // entre 1x e 2x o ciclo sem retornar
  INACTIVE  // mais de 2x o ciclo sem retornar
  VIP       // gasto acumulado > threshold ou > N atendimentos
}

model Tenant {
  id                    String    @id @default(cuid())
  name                  String
  slug                  String    @unique
  plan                  Plan      @default(BASIC)
  trialEndsAt           DateTime?
  stripeCustomerId      String?   @unique
  stripeSubscriptionId  String?   @unique
  stripeCurrentPeriodEnd DateTime?
  createdAt             DateTime  @default(now())

  users         User[]
  clients       Client[]
  services      Service[]
  appointments  Appointment[]
  cards         ProfessionalCard[]
}

model User {
  id        String   @id @default(cuid())
  tenantId  String
  email     String
  name      String
  role      Role     @default(RECEPTIONIST)
  avatarUrl String?
  createdAt DateTime @default(now())

  tenant       Tenant        @relation(fields: [tenantId], references: [id])
  appointments Appointment[]
  card         ProfessionalCard?

  @@unique([tenantId, email])
}

model Client {
  id        String       @id @default(cuid())
  tenantId  String
  name      String
  phone     String?
  email     String?
  birthDate DateTime?
  status    ClientStatus @default(ACTIVE)
  createdAt DateTime     @default(now())

  // ficha técnica
  hairColor   String?
  skinTone    String?
  nailPolish  String?
  allergies   String?
  notes       String?

  tenant       Tenant        @relation(fields: [tenantId], references: [id])
  appointments Appointment[]

  @@index([tenantId, status])
}

model Service {
  id              String   @id @default(cuid())
  tenantId        String
  name            String
  returnDays      Int      // ciclo de retorno em dias
  price           Decimal  @db.Decimal(10, 2)
  durationMinutes Int      @default(60)
  active          Boolean  @default(true)

  tenant       Tenant        @relation(fields: [tenantId], references: [id])
  appointments Appointment[]

  @@index([tenantId])
}

model Appointment {
  id             String   @id @default(cuid())
  tenantId       String
  clientId       String
  professionalId String
  serviceId      String
  date           DateTime
  price          Decimal  @db.Decimal(10, 2)
  notes          String?
  createdAt      DateTime @default(now())

  tenant       Tenant  @relation(fields: [tenantId], references: [id])
  client       Client  @relation(fields: [clientId], references: [id])
  professional User    @relation(fields: [professionalId], references: [id])
  service      Service @relation(fields: [serviceId], references: [id])

  @@index([tenantId, date])
  @@index([tenantId, clientId])
  @@index([tenantId, professionalId])
}

model ProfessionalCard {
  id             String  @id @default(cuid())
  tenantId       String
  professionalId String  @unique
  slug           String  @unique
  bio            String?
  whatsapp       String?
  instagram      String?
  photoUrl       String?
  active         Boolean @default(true)

  tenant       Tenant @relation(fields: [tenantId], references: [id])
  professional User   @relation(fields: [professionalId], references: [id])
}
```

---

## Multitenant

### Estratégia
Row-Level via `tenantId` em todos os modelos + Prisma middleware que injeta e valida o tenant em cada query.

### Fluxo de contexto
1. NextAuth salva `tenantId`, `userId` e `role` no JWT.
2. O layout `(dashboard)/layout.tsx` chama `getServerSession()` e passa `tenantId` para o contexto React via Server Component.
3. Server Actions e Route Handlers obtêm o tenant via `getServerSession()` — nunca confiar no body/params da requisição para isso.
4. O Prisma middleware garante que toda query inclua `where: { tenantId }`.

### Implementação do middleware (`lib/prisma.ts`)

```typescript
import { PrismaClient } from '@prisma/client'
import { AsyncLocalStorage } from 'async_hooks'

export const tenantContext = new AsyncLocalStorage<{ tenantId: string }>()

const prismaBase = new PrismaClient()

prismaBase.$use(async (params, next) => {
  const ctx = tenantContext.getStore()
  if (!ctx) return next(params)

  const modelsWithTenant = [
    'Client', 'Service', 'Appointment', 'User', 'ProfessionalCard',
  ]
  if (!modelsWithTenant.includes(params.model ?? '')) return next(params)

  if (['findMany', 'findFirst', 'count', 'aggregate'].includes(params.action)) {
    params.args.where = { ...params.args.where, tenantId: ctx.tenantId }
  }
  if (['create'].includes(params.action)) {
    params.args.data = { ...params.args.data, tenantId: ctx.tenantId }
  }
  if (['update', 'delete', 'updateMany', 'deleteMany'].includes(params.action)) {
    params.args.where = { ...params.args.where, tenantId: ctx.tenantId }
  }

  return next(params)
})

export const prisma = prismaBase

// singleton para evitar múltiplas conexões em dev
declare global { var _prisma: typeof prismaBase }
if (process.env.NODE_ENV !== 'production') globalThis._prisma = prismaBase
```

### Como usar em Server Actions

```typescript
import { tenantContext, prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getClients() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Unauthorized')

  return tenantContext.run({ tenantId: session.user.tenantId }, () =>
    prisma.client.findMany({ orderBy: { name: 'asc' } })
  )
}
```

---

## Lógica de Status de Cliente

Calculado e persistido no campo `status` a cada atendimento registrado ou via job diário.

```
lastAppointmentDate = data do último atendimento da cliente
cycleAvg = média do returnDays dos serviços feitos

ACTIVE   → daysSince(lastAppointmentDate) <= cycleAvg
AT_RISK  → cycleAvg < daysSince <= cycleAvg * 2
INACTIVE → daysSince > cycleAvg * 2
VIP      → totalSpend > 1000 OR totalAppointments >= 20  (verifica antes dos outros)
```

A função `recalculateClientStatus(clientId, tenantId)` deve ser chamada:
- Ao criar ou editar um atendimento
- Via cron job diário (Vercel Cron) para atualizar AT_RISK e INACTIVE

---

## Auth (NextAuth v5)

### Configuração mínima (`lib/auth.ts`)
- Providers: `CredentialsProvider` (email/senha com bcrypt) + `GoogleProvider`
- Session strategy: `jwt`
- Callbacks `jwt` e `session` devem propagar `tenantId`, `userId` e `role`
- Ao criar conta nova (primeiro login Google): criar Tenant + User OWNER automaticamente

### Proteção de rotas
- `(dashboard)/layout.tsx` redireciona para `/login` se não houver sessão
- Verificação de `role` feita dentro de cada Server Action — nunca só no layout

---

## Planos e Assinatura (Stripe)

| | BASIC | PRO |
|--|-------|-----|
| Preço | R$199/mês | R$399/mês |
| Usuários | até 5 | ilimitado |
| Cartão de visita | não | sim |
| Exportação de dados | não | sim |
| Trial | 14 dias | 14 dias |

### Fluxo
1. Novo salão → cria Tenant com `plan: BASIC`, `trialEndsAt: now + 14d`
2. Após trial → redirect para página de planos → Stripe Checkout
3. Webhook `/api/webhooks/stripe` atualiza `stripeSubscriptionId`, `plan` e `stripeCurrentPeriodEnd`
4. Middleware de subscription verifica `trialEndsAt` e `stripeCurrentPeriodEnd` antes de servir o dashboard

### Validação de acesso a features PRO
```typescript
// lib/tenant.ts
export function canUseFeature(tenant: Tenant, feature: 'card' | 'export') {
  if (tenant.plan === 'PRO') return true
  const isInTrial = tenant.trialEndsAt && tenant.trialEndsAt > new Date()
  return isInTrial ?? false
}
```

---

## Identidade Visual

- **Paleta principal**: pink/magenta (`#E91E8C`) com fundo escuro (`#0F0F0F`) para modo escuro
- **Fonte**: Inter (padrão Tailwind)
- **Tom**: descontraído, feminino, direto — sem jargão corporativo
- **Mobile-first**: breakpoints `sm` primeiro, desktop como expansão
- **Componentes**: shadcn/ui como base, customizados via `cn()` e variáveis CSS

```css
/* globals.css — variáveis de marca */
:root {
  --brand: 322 85% 50%;        /* pink principal */
  --brand-foreground: 0 0% 100%;
}
```

---

## Convenções de Código

### TypeScript
- `strict: true` — sem `any` implícito
- Tipos de domínio em `types/index.ts`; tipos de componente inline no próprio arquivo
- Importações absolutas com `@/` (configurado em `tsconfig.json`)

### Componentes
- Server Components por padrão — só adicionar `"use client"` quando necessário (interatividade, hooks, browser APIs)
- Props tipadas inline com `interface`, nunca `type` para props de componente
- Nomes em PascalCase para componentes, camelCase para funções e variáveis

### Server Actions
- Todas as mutations passam por Server Actions em `actions/`
- Cada action valida a sessão, obtém `tenantId` e executa dentro de `tenantContext.run()`
- Retornam `{ data, error }` — nunca lançam exceção para o cliente
- Validação de input com Zod antes de tocar o banco

```typescript
// padrão de action
const schema = z.object({ name: z.string().min(1) })

export async function createClient(input: unknown) {
  const session = await getServerSession(authOptions)
  if (!session) return { data: null, error: 'Unauthorized' }

  const parsed = schema.safeParse(input)
  if (!parsed.success) return { data: null, error: parsed.error.flatten() }

  const client = await tenantContext.run({ tenantId: session.user.tenantId }, () =>
    prisma.client.create({ data: parsed.data })
  )
  return { data: client, error: null }
}
```

### Banco de dados
- Migrations com `prisma migrate dev` — nunca editar migration gerada manualmente
- Seeds em `prisma/seed.ts`
- Índices obrigatórios: `[tenantId]`, `[tenantId, <campo de filtro comum>]`

### Formulários
- React Hook Form + Zod resolver
- Feedback de loading com `useTransition` ou estado do Server Action

### Nomenclatura de arquivos
- `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` — convenção Next.js
- Componentes: `ClientCard.tsx`, `AppointmentForm.tsx`
- Actions: `clients.ts` (plural do domínio)
- Sem `index.ts` de reexportação desnecessário

---

## Variáveis de Ambiente

```env
# banco
DATABASE_URL=

# auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_BASIC_PRICE_ID=
STRIPE_PRO_PRICE_ID=

# brevo
BREVO_API_KEY=

# app
NEXT_PUBLIC_APP_URL=
```

---

## Regras de Negócio Críticas

1. **Isolamento de tenant é inviolável** — toda query ao banco passa pelo `tenantContext`. Nunca fazer `prisma.client.findMany()` sem contexto ativo.

2. **Status de cliente é recalculado, não editado manualmente** — o usuário não altera status diretamente; ele é derivado dos atendimentos.

3. **Limite de usuários no plano BASIC** — ao convidar um novo usuário, verificar `count(users where tenantId) < 5` antes de criar.

4. **Cartão de visita só no PRO** — verificar `canUseFeature(tenant, 'card')` antes de renderizar ou salvar.

5. **Slug do cartão é único globalmente** — gerado a partir do nome do profissional + sufixo aleatório, nunca editável após criação.

6. **Trial é contado a partir da criação do Tenant** — não reiniciar ao trocar de plano.

7. **Webhook Stripe é a fonte da verdade para plano ativo** — nunca atualizar `plan` diretamente na UI; sempre via evento do Stripe.
