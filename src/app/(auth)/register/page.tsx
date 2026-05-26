"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z
  .object({
    salonName: z.string().min(2, "Nome do salão deve ter pelo menos 2 caracteres"),
    name: z.string().min(2, "Seu nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(8, "Mínimo de 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      salonName: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(_data: FormValues) {
    // Fase 1: simulação — substituído por lógica real na Fase 3
    await new Promise((r) => setTimeout(r, 1000));
    router.push("/");
  }

  function handleGoogle() {
    setIsGoogleLoading(true);
    // Fase 1: simulação — substituído por signIn("google") na Fase 3
    setTimeout(() => {
      router.push("/");
    }, 800);
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900 shadow-xl">
      <CardContent className="pt-6">
        <h1 className="text-xl font-semibold text-white mb-1 text-center">
          Criar conta grátis
        </h1>
        <p className="text-zinc-400 text-sm text-center mb-6">
          14 dias grátis, sem cartão de crédito
        </p>

        <Button
          type="button"
          variant="outline"
          className="w-full border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white"
          onClick={handleGoogle}
          disabled={isGoogleLoading || isSubmitting}
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon className="mr-2 h-4 w-4" />
          )}
          Continuar com Google
        </Button>

        <div className="relative my-5">
          <Separator className="bg-zinc-700" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 px-2 text-xs text-zinc-500">
            ou
          </span>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="salonName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Nome do salão</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Studio Bella, Espaço Hair..."
                      className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Seu nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Como prefere ser chamada"
                      autoComplete="name"
                      className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">E-mail</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="seu@email.com"
                      type="email"
                      autoComplete="email"
                      className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Senha</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Mínimo 8 caracteres"
                      type="password"
                      autoComplete="new-password"
                      className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">Confirmar senha</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Repita a senha"
                      type="password"
                      autoComplete="new-password"
                      className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-primary text-white hover:bg-primary/90"
              disabled={isSubmitting || isGoogleLoading}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Criar minha conta
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="justify-center pb-6">
        <p className="text-sm text-zinc-400">
          Já tem conta?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
