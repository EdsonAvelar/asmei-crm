import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SubscriptionSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-3xl">
        ✓
      </div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Assinatura ativada!</h1>
        <p className="text-muted-foreground mt-2 max-w-sm">
          Seu plano está ativo. Agora você tem acesso a todos os recursos do Asmei CRM.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/" className={cn(buttonVariants())}>
          Ir para o dashboard
        </Link>
        <Link href="/settings" className={cn(buttonVariants({ variant: "outline" }))}>
          Ver meu plano
        </Link>
      </div>
    </div>
  );
}
