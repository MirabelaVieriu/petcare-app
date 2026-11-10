import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/auth/session";

export interface AccountOption { id: number; label: string }
export interface LoginOptions { vets: AccountOption[]; clients: AccountOption[] }

export const AccountAccessor = {
    async getLoginOptions(): Promise<LoginOptions> {
        const [admins, users] = await Promise.all([
            prisma.admin.findMany({
                select: { id: true, firstName: true, lastName: true },
                orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
            }),
            prisma.user.findMany({
                select: { id: true, firstName: true, lastName: true },
                orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
            }),
        ]);
        return {
            vets: admins.map(a => ({ id: a.id, label: `Dr. ${a.firstName} ${a.lastName}` })),
            clients: users.map(u => ({ id: u.id, label: `${u.firstName} ${u.lastName}` })),
        };
    },

    async exists(role: Role, id: number): Promise<boolean> {
        if (role === "ADMIN") return (await prisma.admin.count({ where: { id } })) > 0;
        return (await prisma.user.count({ where: { id } })) > 0;
    },

    async getName(role: Role, id: number): Promise<string | null> {
        const row = role === "ADMIN"
            ? await prisma.admin.findUnique({ where: { id }, select: { firstName: true, lastName: true } })
            : await prisma.user.findUnique({ where: { id }, select: { firstName: true, lastName: true } });
        return row ? `${row.firstName} ${row.lastName}` : null;
    },
};