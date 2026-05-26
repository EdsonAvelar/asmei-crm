import type { Metadata } from "next";
import { SettingsPageClient } from "@/components/shared/SettingsPageClient";

export const metadata: Metadata = { title: "Configurações" };

export default function SettingsPage() {
  return <SettingsPageClient />;
}
