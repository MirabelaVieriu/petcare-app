import { prisma } from "../prisma";

const withOwner = { user: { omit: { passwordHash: true } } } as const;

export class PetAccessor {
    static getAll() {
        return prisma.pet.findMany({ include: withOwner });
    }

    static getById(id: number) {
        return prisma.pet.findUnique({ where: { id }, include: withOwner });
    }

    static getByUser(userId: number) {
        return prisma.pet.findMany({ where: { userId } });
    }

    static getByType(type: string) {
        return prisma.pet.findMany({
            where: { type: { equals: type, mode: "insensitive" } },
            include: withOwner,
        });
    }

    static create(data: { userId: number; name: string; type: string; age?: number; breed?: string }) {
        return prisma.pet.create({ data });
    }

    static getByBreed(breed: string) {
        return prisma.pet.findMany({
            where: { breed: { contains: breed, mode: "insensitive" } },
        });
    }
}