import type { ClientStatus } from "@/types";
import { cn } from "@/lib/utils";

const config: Record<ClientStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Ativa", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  AT_RISK: { label: "Em risco", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  INACTIVE: { label: "Inativa", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  VIP: { label: "VIP", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
};

interface StatusBadgeProps {
  status: ClientStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, className: statusClass } = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        statusClass,
        className
      )}
    >
      {label}
    </span>
  );
}
