export interface OwnerPetViewModel {
    id: number;
    name: string;
    type: string;
    breed: string | null;
    age: number | null;
}

export interface OwnerPlanViewModel {
    subscriptionId: number;
    planName: string;
    since: Date;
}

/** Un client care are animale: date din User + Pet + Subscription + Plan */
export interface OwnerViewModel {
    id: number;
    fullName: string;
    email: string;
    phone: string | null;
    pets: OwnerPetViewModel[];
    plans: OwnerPlanViewModel[];
}

export function petEmoji(type: string): string {
    const t = type.trim().toLowerCase();
    if (["dog", "caine", "câine", "catel", "cățel"].includes(t)) return "🐶";
    if (["cat", "pisica", "pisică"].includes(t)) return "🐱";
    if (["rabbit", "iepure"].includes(t)) return "🐰";
    if (["hamster"].includes(t)) return "🐹";
    if (["bird", "pasare", "pasăre", "papagal"].includes(t)) return "🐦";
    return "🐾";
}
export interface OwnerAppointmentViewModel {
    id: number;
    service: string;
    date: Date;
    petName: string | null;
}

export interface OwnerSubscriptionViewModel {
    id: number;
    planName: string;
    since: Date;
    active: boolean;
}

export interface OwnerDetailViewModel {
    id: number;
    fullName: string;
    email: string;
    phone: string | null;
    pets: OwnerPetViewModel[];
    subscriptions: OwnerSubscriptionViewModel[];
    appointments: OwnerAppointmentViewModel[];
}