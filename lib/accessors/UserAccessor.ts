import { prisma } from "../prisma";

const omit = { passwordHash: true } as const;

export class UserAccessor {
    static getAll() {
        return prisma.user.findMany({ orderBy: { lastName: "asc" }, omit });
    }

    static getById(id: number) {
        return prisma.user.findUnique({ where: { id }, omit });
    }

    static getByEmail(email: string) {
        return prisma.user.findUnique({ where: { email }, omit });
    }

    /** Doar pentru login: singurul loc unde avem nevoie de hash. */
    static getForLogin(email: string) {
        return prisma.user.findUnique({ where: { email } });
    }

    static getWithPets(id: number) {
        return prisma.user.findUnique({ where: { id }, include: { pets: true }, omit });
    }

    static getWithActiveSubscription() {
        return prisma.user.findMany({
            where: { subscriptions: { some: { active: true } } },
            include: { subscriptions: { where: { active: true }, include: { plan: true } } },
            omit,
        });
    }

    static create(data: {
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        vetId?: number;
        passwordHash: string;
    }) {
        return prisma.user.create({ data, omit });
    }
    static getClientsOfVet(vetId: number, take?: number) {
        return prisma.user.findMany({
            where: { vetId},
            orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
            ...(take ? { take } : {}),
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
                    orderBy: { startDate: "desc" },
                    take: 1,
                    select: { plan: { select: { name: true, price: true, priority: true } } },
                },
            },
        });
    }
}