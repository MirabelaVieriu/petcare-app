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
        passwordHash: string;
    }) {
        return prisma.user.create({ data, omit });
    }
}