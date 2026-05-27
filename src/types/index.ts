export type Role = "OWNER" | "PROFESSIONAL" | "RECEPTIONIST";
export type Plan = "BASIC" | "PRO";
export type ClientStatus = "ACTIVE" | "AT_RISK" | "INACTIVE" | "VIP";
export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "MISSED";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  trialEndsAt: Date | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeCurrentPeriodEnd: Date | null;
  createdAt: Date;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl: string | null;
  createdAt: Date;
}

export interface Client {
  id: string;
  tenantId: string;
  name: string;
  phone: string | null;
  email: string | null;
  birthDate: Date | null;
  status: ClientStatus;
  createdAt: Date;
  hairColor: string | null;
  skinTone: string | null;
  nailPolish: string | null;
  allergies: string | null;
  notes: string | null;
}

export interface Service {
  id: string;
  tenantId: string;
  name: string;
  returnDays: number;
  price: number | string | { toNumber(): number };
  durationMinutes: number;
  active: boolean;
}

export interface Appointment {
  id: string;
  tenantId: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  date: Date;
  price: number | string | { toNumber(): number };
  status: AppointmentStatus;
  notes: string | null;
  createdAt: Date;
}

export interface ProfessionalCard {
  id: string;
  tenantId: string;
  professionalId: string;
  slug: string;
  bio: string | null;
  whatsapp: string | null;
  instagram: string | null;
  photoUrl: string | null;
  active: boolean;
}
