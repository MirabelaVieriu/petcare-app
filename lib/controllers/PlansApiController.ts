import { Prisma } from "@prisma/client";
import { PlanAccessor } from "@/lib/accessors/PlanAccessor";
import { readPlanJson, validatePlanForm } from "@/lib/models/PlanViewModel";
import { fail, validId, type ApiResponse } from "@/lib/api/http";

const notFound = () => fail(404, { id: "Planul nu există." });

function dbError(e: unknown): ApiResponse {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") return fail(409, { name: "Există deja un plan cu acest nume." });
        if (e.code === "P2003") return fail(400, { adminId: "Veterinarul selectat nu există." });
        if (e.code === "P2025") return notFound();
    }
    console.error("PlansApiController:", e);
    return fail(500, { form: "A apărut o eroare la salvare." });
}

export const PlansApiController = {
    async getAll(): Promise<ApiResponse> {
        return { status: 200, body: await PlanAccessor.getEntities() };
    },

    async getById(id: number): Promise<ApiResponse> {
        const plan = validId(id) ? await PlanAccessor.getEntityById(id) : null;
        return plan ? { status: 200, body: plan } : notFound();
    },

    async create(body: unknown): Promise<ApiResponse> {
        const { errors, data } = validatePlanForm(readPlanJson(body));
        if (!data) return { status: 400, body: { errors } };
        try {
            const id = await PlanAccessor.addEntity(data);
            return { status: 201, body: await PlanAccessor.getEntityById(id) };
        } catch (e) {
            return dbError(e);
        }
    },

    async update(id: number, body: unknown): Promise<ApiResponse> {
        if (!validId(id) || !(await PlanAccessor.getEntityById(id))) return notFound();
        const { errors, data } = validatePlanForm(readPlanJson(body));
        if (!data) return { status: 400, body: { errors } };
        try {
            await PlanAccessor.updateEntity(id, data);
            return { status: 200, body: await PlanAccessor.getEntityById(id) };
        } catch (e) {
            return dbError(e);
        }
    },

    async remove(id: number): Promise<ApiResponse> {
        if (!validId(id) || !(await PlanAccessor.getEntityById(id))) return notFound();
        try {
            await PlanAccessor.deleteEntity(id);
            return { status: 204, body: null };
        } catch (e) {
            if (e instanceof Error && e.message.includes("abonamente active")) {
                return fail(409, { form: e.message });
            }
            return dbError(e);
        }
    },
};