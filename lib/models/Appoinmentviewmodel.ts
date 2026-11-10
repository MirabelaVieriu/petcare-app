import { ServiceType } from "@prisma/client";

export interface AppointmentViewModel {
    id: number;
    date: Date;
    service: string;
    clientName: string;
    petName: string | null;
    petType: string | null;
    vetName: string | null;
}

export interface AppointmentData {
    userId: number;
    petId: number | null;
    adminId: number | null;
    service: ServiceType;
    date: Date;
}

export interface SelectOption {
    id: number;
    label: string;
}

export interface PetOption extends SelectOption {
    userId: number;
}

export interface AppointmentFormOptions {
    clients: SelectOption[];
    pets: PetOption[];
    vets: SelectOption[];
}

export interface AppointmentFormValues {
    userId: string;
    petId: string;
    adminId: string;
    service: string;
    date: string;
}

export type AppointmentFormErrors = Partial<Record<keyof AppointmentFormValues | "form", string>>;

export interface AppointmentFormState {
    values: AppointmentFormValues;
    errors: AppointmentFormErrors;
}

export const emptyAppointmentForm: AppointmentFormValues = {
    userId: "",
    petId: "",
    adminId: "",
    service: "",
    date: "",
};

//export const serviceOptions = Object.values(ServiceType);

export const SERVICE_OPTIONS = [
    { value: "CONSULT", label: "Consult", icon: "🩺" },
    { value: "VACCINE", label: "Vaccinare", icon: "💉" },
    { value: "GROOMING", label: "Grooming", icon: "✂️" },
    { value: "TELE", label: "Teleconsult", icon: "💻" },
    { value: "HOME_VISIT", label: "Vizită la domiciliu", icon: "🏠" },
    { value: "PETS", label: "Pet care", icon: "🐾" },
] as const;

export type ServiceValue = (typeof SERVICE_OPTIONS)[number]["value"];

export const serviceLabel = (value: string) =>
    SERVICE_OPTIONS.find(s => s.value === value)?.label ?? value;

export const serviceIcon = (value: string) =>
    SERVICE_OPTIONS.find(s => s.value === value)?.icon ?? "🐾";

function isServiceType(value: string): value is ServiceType {
    return (Object.values(ServiceType) as string[]).includes(value);
}

export function readAppointmentForm(formData: FormData): AppointmentFormValues {
    const text = (key: string) => String(formData.get(key) ?? "");
    return {
        userId: text("userId"),
        petId: text("petId"),
        adminId: text("adminId"),
        service: text("service"),
        date: text("date"),
    };
}

export function validateAppointmentForm(
    values: AppointmentFormValues
): { errors: AppointmentFormErrors; data?: AppointmentData } {
    const errors: AppointmentFormErrors = {};
    const integer = /^\d+$/;

    const userText = values.userId.trim();
    if (!integer.test(userText) || Number(userText) <= 0) errors.userId = "Alege un client din listă.";

    const petText = values.petId.trim();
    if (petText && (!integer.test(petText) || Number(petText) <= 0)) errors.petId = "Animal invalid.";

    const adminText = values.adminId.trim();
    if (adminText && (!integer.test(adminText) || Number(adminText) <= 0)) errors.adminId = "Veterinar invalid.";

    const service = values.service.trim();
    if (!isServiceType(service)) errors.service = "Alege un serviciu din listă.";

    const date = new Date(values.date);
    if (!values.date || isNaN(date.getTime())) errors.date = "Data programării este invalidă.";

    if (Object.keys(errors).length > 0) return { errors };

    return {
        errors,
        data: {
            userId: Number(userText),
            petId: petText ? Number(petText) : null,
            adminId: adminText ? Number(adminText) : null,
            service: service as ServiceType,
            date,
        },
    };

}