import { PrismaClient } from "@prisma/client";
import { AsyncLocalStorage } from "async_hooks";

export const tenantContext = new AsyncLocalStorage<{ tenantId: string }>();

const MODELS_WITH_TENANT = new Set([
  "Client",
  "Service",
  "Appointment",
  "User",
  "ProfessionalCard",
]);

function makePrisma() {
  const base = new PrismaClient();

  return base.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }: {
          model: string;
          operation: string;
          args: Record<string, unknown>;
          query: (args: Record<string, unknown>) => Promise<unknown>;
        }) {
          const ctx = tenantContext.getStore();
          if (!ctx || !MODELS_WITH_TENANT.has(model)) {
            return query(args);
          }
          const tid = ctx.tenantId;

          if (["findMany", "findFirst", "findFirstOrThrow", "count", "aggregate", "groupBy"].includes(operation)) {
            args = { ...args, where: { ...(args.where as object ?? {}), tenantId: tid } };
          } else if (["create"].includes(operation)) {
            args = { ...args, data: { ...(args.data as object ?? {}), tenantId: tid } };
          } else if (["createMany", "createManyAndReturn"].includes(operation)) {
            const data = args.data;
            args = {
              ...args,
              data: Array.isArray(data)
                ? data.map((d) => ({ ...(d as object), tenantId: tid }))
                : { ...(data as object ?? {}), tenantId: tid },
            };
          } else if (["update", "delete", "updateMany", "deleteMany", "upsert"].includes(operation)) {
            args = { ...args, where: { ...(args.where as object ?? {}), tenantId: tid } };
          }

          return query(args);
        },
      },
    },
  });
}

type ExtendedPrisma = ReturnType<typeof makePrisma>;

const globalForPrisma = globalThis as unknown as { _prisma: ExtendedPrisma };

export const prisma: ExtendedPrisma =
  globalForPrisma._prisma ?? makePrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma._prisma = prisma;
}
