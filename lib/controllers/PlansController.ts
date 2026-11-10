import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { PlanAccessor } from "@/lib/accessors/PlanAccessor";
import {
    emptyPlanForm,
    readPlanForm,
    toFormValues,
    validatePlanForm,
    type PlanFormErrors,
    type PlanFormState,
} from "@/lib/models/PlanViewModel";

function assertValidId(id: number) {
    if (!Number.isInteger(id) || id <= 0) notFound();
}

function mapDbError(error: unknown): PlanFormErrors {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") return { name: "Există deja un plan cu acest nume." };
        if (error.code === "P2003") return { adminId: "Veterinarul selectat nu există." };
        if (error.code === "P2025") return { form: "Planul nu mai există." };
    }
    console.error("PlansController error:", error);
    return { form: "A apărut o eroare la salvare. Încearcă din nou." };
}

export const PlansController = {
    async index() {
        return { plans: await PlanAccessor.getEntities() };
    },

    async details(id: number) {
        assertValidId(id);
        const plan = await PlanAccessor.getEntityById(id);
        if (!plan) notFound();
        return { plan };
    },

    async createGet() {
        return {
            admins: await PlanAccessor.getAdminOptions(),
            values: emptyPlanForm,
        };
    },

    async createPost(_prev: PlanFormState, formData: FormData): Promise<PlanFormState> {
        const values = readPlanForm(formData);
        const { errors, data } = validatePlanForm(values);
        if (!data) return { values, errors };

        let createdId: number;
        try {
            createdId = await PlanAccessor.addEntity(data);
        } catch (error) {
            return { values, errors: mapDbError(error) };
        }

        revalidatePath("/admin/plans");
        redirect(`/admin/plans/${createdId}`);
    },

    async editGet(id: number) {
        assertValidId(id);
        const [plan, admins] = await Promise.all([
            PlanAccessor.getEntityById(id),
            PlanAccessor.getAdminOptions(),
        ]);
        if (!plan) notFound();
        return { plan, admins, values: toFormValues(plan) };
    },

    async editPost(id: number, _prev: PlanFormState, formData: FormData): Promise<PlanFormState> {
        assertValidId(id);
        const values = readPlanForm(formData);
        const { errors, data } = validatePlanForm(values);
        if (!data) return { values, errors };

        try {
            await PlanAccessor.updateEntity(id, data);
        } catch (error) {
            return { values, errors: mapDbError(error) };
        }

        revalidatePath("/admin/plans");
        revalidatePath(`/admin/plans/${id}`);
        redirect(`/admin/plans/${id}`);
    },

    async deletePlan(id: number) {
        assertValidId(id);

        try {
            await PlanAccessor.deleteEntity(id);
        } catch (error) {
            if (error instanceof Error && error.message.includes("abonamente active")) {
                throw new Error("Planul are abonamente active și nu poate fi șters.");
            }
            throw error;
        }

        revalidatePath("/admin/plans");
        redirect("/admin/plans");
    },
};