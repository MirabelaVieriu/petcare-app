import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AdminOption, PlanData, PlanViewModel } from "@/lib/models/PlanViewModel";

const planSelect = {
    id: true,
    name: true,
    price: true,
    discount: true,
    priority: true,
    adminId: true,
    admin: { select: { firstName: true, lastName: true } },
    services: { select: { service: true, perMonth: true } },
    _count: { select: { subscriptions: { where: { active: true } } } },
} satisfies Prisma.PlanSelect;

type PlanRow = Prisma.PlanGetPayload<{ select: typeof planSelect }>;

function toViewModel(row: PlanRow): PlanViewModel {
    return {
        id: row.id,
        name: row.name,
        price: row.price,
        discount: row.discount,
        priority: row.priority,
        adminId: row.adminId,
        adminName: `Dr. ${row.admin.firstName} ${row.admin.lastName}`,
        activeSubscribers: row._count.subscriptions,
        services: row.services.map(s => ({ service: s.service, perMonth: s.perMonth })),
    };
}

export const PlanAccessor = {
    async getEntities(): Promise<PlanViewModel[]> {
        const rows = await prisma.plan.findMany({
            select: planSelect,
            orderBy: { name: "asc" },
        });
        return rows.map(toViewModel);
    },

    async getEntityById(id: number): Promise<PlanViewModel | null> {
        const row = await prisma.plan.findUnique({ where: { id }, select: planSelect });
        return row ? toViewModel(row) : null;
    },

    async getAdminOptions(): Promise<AdminOption[]> {
        const admins = await prisma.admin.findMany({
            select: { id: true, firstName: true, lastName: true },
            orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        });
        return admins.map(a => ({ id: a.id, label: `Dr. ${a.firstName} ${a.lastName}` }));
    },

    async addEntity(data: PlanData): Promise<number> {
        const created = await prisma.plan.create({
            data: {
                name: data.name,
                price: data.price,
                discount: data.discount,
                priority: data.priority,
                adminId: data.adminId,
            },
            select: { id: true },
        });
        return created.id;
    },

    async updateEntity(id: number, data: PlanData): Promise<void> {
        await prisma.plan.update({
            where: { id },
            data: {
                name: data.name,
                price: data.price,
                discount: data.discount,
                priority: data.priority,
                adminId: data.adminId,
            },
        });
    },

    async deleteEntity(id: number): Promise<void> {
        const activeSubscriptions = await prisma.subscription.count({ where: { planId: id, active: true } });
        if (activeSubscriptions > 0) {
            throw new Error("Planul are abonamente active și nu poate fi șters.");
        }

        await prisma.plan.delete({ where: { id } });
    },
};