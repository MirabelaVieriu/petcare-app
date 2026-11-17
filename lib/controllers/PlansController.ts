import { notFound } from "next/navigation";
import { PlanAccessor } from "@/lib/accessors/PlanAccessor";
import {emptyPlanForm, toFormValues} from "@/lib/models/PlanViewModel";

function assertValidId(id: number) {
    if (!Number.isInteger(id) || id <= 0) notFound();
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



    async editGet(id: number) {
        assertValidId(id);
        const [plan, admins] = await Promise.all([
            PlanAccessor.getEntityById(id),
            PlanAccessor.getAdminOptions(),
        ]);
        if (!plan) notFound();
        return { plan, admins, values: toFormValues(plan) };
    },

};