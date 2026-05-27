import type { Metadata } from "next";
import { getTenant, getUsers } from "@/actions/users";
import { SettingsPageClient } from "@/components/shared/SettingsPageClient";

export const metadata: Metadata = { title: "Configurações" };

export default async function SettingsPage() {
  const [tenant, users] = await Promise.all([getTenant(), getUsers()]);
  return <SettingsPageClient tenant={tenant} users={users} />;
}
