"use client";

import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar } from "@/components/shared/Sidebar";
import { Topbar } from "@/components/shared/Topbar";

interface DashboardShellProps {
  children: React.ReactNode;
  userName: string;
  tenantName: string;
  userEmail: string;
  trialDaysLeft?: number | null;
}

export function DashboardShell({
  children,
  userName,
  tenantName,
  userEmail,
  trialDaysLeft,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden lg:flex w-60 shrink-0">
        <Sidebar />
      </aside>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-60">
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Topbar
          onMenuOpen={() => setSidebarOpen(true)}
          userName={userName}
          tenantName={tenantName}
          userEmail={userEmail}
        />
        {trialDaysLeft !== null && trialDaysLeft !== undefined && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between gap-2 text-sm">
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {trialDaysLeft === 1
                ? "Último dia de trial!"
                : `${trialDaysLeft} dias restantes de trial`}
            </span>
            <a
              href="/settings"
              className="text-amber-700 dark:text-amber-300 underline underline-offset-2 font-semibold shrink-0"
            >
              Assinar agora
            </a>
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
