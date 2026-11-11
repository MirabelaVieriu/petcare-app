import { prisma } from "@/lib/prisma";
import type { OwnerViewModel, OwnerDetailViewModel } from "@/lib/models/OwnerViewModel";
export const OwnerAccessor = {
    /** Clienții veterinarului dat, cu animalele și abonamentele active */
    async getByVet(vetId: number): Promise<OwnerViewModel[]> {
        const rows = await prisma.user.findMany({
            where: { vetId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                pets: {
                    select: { id: true, name: true, type: true, breed: true, age: true },
                    orderBy: { name: "asc" },
                },
                subscriptions: {
                    where: { active: true },
                    select: { id: true, startDate: true, plan: { select: { name: true } } },
                    orderBy: { startDate: "desc" },
                },
            },
            orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        });

        return rows.map(u => ({
            id: u.id,
            fullName: `${u.lastName} ${u.firstName}`,
            email: u.email,
            phone: u.phone,
            pets: u.pets,
            plans: u.subscriptions.map(s => ({
                subscriptionId: s.id,
                planName: s.plan.name,
                since: s.startDate,
            })),
        }));
    },
    async getDetail(vetId: number, userId: number): Promise<OwnerDetailViewModel | null> {
        const u = await prisma.user.findFirst({
            where: { id: userId, vetId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                pets: {
                    select: { id: true, name: true, type: true, breed: true, age: true },
                    orderBy: { name: "asc" },
                },
                subscriptions: {
                    select: { id: true, startDate: true, active: true, plan: { select: { name: true } } },
                    orderBy: { startDate: "desc" },
                },
                appointments: {
                    select: { id: true, service: true, date: true, pet: { select: { name: true } } },
                    orderBy: { date: "desc" },
                    take: 20,
                },
            },
        });
        if (!u) return null;

        return {
            id: u.id,
            fullName: `${u.lastName} ${u.firstName}`,
            email: u.email,
            phone: u.phone,
            pets: u.pets,
            subscriptions: u.subscriptions.map(s => ({
                id: s.id,
                planName: s.plan.name,
                since: s.startDate,
                active: s.active,
            })),
            appointments: u.appointments.map(a => ({
                id: a.id,
                service: a.service,
                date: a.date,
                petName: a.pet?.name ?? null,
            })),
        };
    },
};