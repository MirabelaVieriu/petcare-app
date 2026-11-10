
export interface PlanServiceViewModel {
    service: string;
    perMonth: number;
}

export interface PlanViewModel {
    id: number;
    name: string;
    price: number;
    discount: number;
    priority: boolean;
    adminId: number;
    adminName: string;
    activeSubscribers: number;
    services: PlanServiceViewModel[];
}

export interface PlanData {
    name: string;
    price: number;
    discount: number;
    priority: boolean;
    adminId: number;
}

export interface AdminOption {
    id: number;
    label: string;
}

export interface PlanFormValues {
    name: string;
    price: string;
    discount: string;
    adminId: string;
    priority: boolean;
}

export type PlanFormErrors = Partial<Record<keyof PlanFormValues | "form", string>>;

export interface PlanFormState {
    values: PlanFormValues;
    errors: PlanFormErrors;
}

export const emptyPlanForm: PlanFormValues = {
    name: "",
    price: "0",
    discount: "0",
    adminId: "",
    priority: false,
};


export function toFormValues(plan: PlanViewModel): PlanFormValues {
    return {
        name: plan.name,
        price: String(plan.price),
        discount: String(plan.discount),
        adminId: String(plan.adminId),
        priority: plan.priority,
    };
}

export function readPlanForm(formData: FormData): PlanFormValues {
    const text = (key: string) => String(formData.get(key) ?? "");
    return {
        name: text("name"),
        price: text("price"),
        discount: text("discount"),
        adminId: text("adminId"),
        priority: formData.get("priority") === "on",
    };
}

export function validatePlanForm(values: PlanFormValues): { errors: PlanFormErrors; data?: PlanData } {
    const errors: PlanFormErrors = {};
    const integer = /^\d+$/;

    const name = values.name.trim();
    if (!name) errors.name = "Numele planului este obligatoriu.";
    else if (name.length > 100) errors.name = "Numele poate avea cel mult 100 de caractere.";

    const priceText = values.price.trim();
    if (!integer.test(priceText)) errors.price = "Prețul trebuie să fie un număr întreg, cel puțin 0.";

    const discountText = values.discount.trim();
    if (!integer.test(discountText) || Number(discountText) > 100) {
        errors.discount = "Discountul trebuie să fie un număr întreg între 0 și 100.";
    }

    const adminText = values.adminId.trim();
    if (!integer.test(adminText) || Number(adminText) <= 0) errors.adminId = "Alege un veterinar din listă.";

    if (Object.keys(errors).length > 0) return { errors };

    return {
        errors,
        data: {
            name,
            price: Number(priceText),
            discount: Number(discountText),
            priority: values.priority,
            adminId: Number(adminText),
        },
    };
}