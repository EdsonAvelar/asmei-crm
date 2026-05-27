import type { Metadata } from "next";
import { getDashboardMetrics } from "@/actions/dashboard";
import { DashboardClient } from "@/components/shared/DashboardClient";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();
  return <DashboardClient metrics={metrics} />;
}
