import type { Metadata } from "next";
import { ProfessionalsPageClient } from "@/components/shared/ProfessionalsPageClient";

export const metadata: Metadata = { title: "Profissionais" };

export default function ProfessionalsPage() {
  return <ProfessionalsPageClient />;
}
