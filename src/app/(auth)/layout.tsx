import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Asmei
            </span>
          </div>
          <p className="text-zinc-400 text-sm text-center">
            CRM para salões de beleza
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
