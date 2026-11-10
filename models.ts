// Valorile trebuie să fie identice cu enum ServiceType din schema.prisma
export const serviceTypeValues = [
    "PETS",
    "CONSULT",
    "TELE",
    "GROOMING",
    "VACCINE",
    "HOME_VISIT",
] as const;
export type ServiceTypeValue = (typeof serviceTypeValues)[number];

// ─── User ────────────────────────────────────────────────
export interface CreateUserInput {
    email: string
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
}
export type UpdateUserInput = Partial<CreateUserInput>;
export interface ListUsersInput {
    email?: string;
    firstName?: string;
    lastName?: string;
}

// ─── Admin ───────────────────────────────────────────────
export type CreateAdminInput = CreateUserInput;
export type UpdateAdminInput = Partial<CreateAdminInput>;
export type ListAdminsInput = ListUsersInput;

// ─── Plan ────────────────────────────────────────────────
export interface PlanServiceInput {
    service: ServiceTypeValue;
    perMonth: number;
}
export interface CreatePlanInput {
    adminId: number;
    name: string;
    price: number;
    discount?: number;
    priority?: boolean;
    services?: PlanServiceInput[];
}
export type UpdatePlanInput = Partial<CreatePlanInput>; // dacă `services` e dat, înlocuiește lista existentă
export interface ListPlansInput {
    adminId?: number;
    name?: string;
    priority?: boolean;
    maxPrice?: number;
}

// ─── PlanService ─────────────────────────────────────────
export interface CreatePlanServiceInput {
    planId: number;
    service: ServiceTypeValue;
    perMonth: number;
}
export interface UpdatePlanServiceInput {
    service?: ServiceTypeValue;
    perMonth?: number;
}
export interface ListPlanServicesInput {
    planId?: number;
    service?: ServiceTypeValue;
}

// ─── Subscription ────────────────────────────────────────
export interface CreateSubscriptionInput {
    userId: number;
    planId: number;
    startDate?: string;
}
export interface UpdateSubscriptionInput {
    planId?: number;
    startDate?: string;
    active?: boolean;
}
export interface ListSubscriptionsInput {
    userId?: number;
    planId?: number;
    active?: boolean;
}

// ─── Pet ─────────────────────────────────────────────────
export interface CreatePetInput {
    userId: number;
    name: string;
    type: string;
    age?: number | null;
    breed?: string | null;
}
export type UpdatePetInput = Partial<CreatePetInput>;
export interface ListPetsInput {
    userId?: number;
    type?: string;
    name?: string;
}

// ─── Appointment ─────────────────────────────────────────
export interface CreateAppointmentInput {
    userId: number;
    petId?: number | null;
    adminId?: number | null;
    service: ServiceTypeValue;
    date: string; // ISO (ex: 2026-11-03T10:30:00)
}
export type UpdateAppointmentInput = Partial<CreateAppointmentInput>;
export interface ListAppointmentsInput {
    userId?: number;
    petId?: number;
    adminId?: number;
    service?: ServiceTypeValue;
    dateFrom?: string;
    dateTo?: string;
}