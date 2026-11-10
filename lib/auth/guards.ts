import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { destroySession, getSession } from "./session";

export const requireAdmin = cache(async () => {
    const s = await getSession();
    if (!s || s.role !== "ADMIN") redirect("/login/admin");

    const admin = await prisma.admin.findUnique({
        where: { id: s.id },
        omit: { passwordHash: true },
    });
    if (!admin) redirect("/login/admin");
    return admin;
});

export const requireUser = cache(async () => {
    const s = await getSession();
    if (!s || s.role !== "USER") redirect("/login/user");

    const user = await prisma.user.findUnique({
        where: { id: s.id },
        omit: { passwordHash: true },
    });
    if (!user) redirect("/login/user");
    return user;
});

/** Pentru paginile de login/register: dacă ești deja conectat (și contul există), te duce în zona ta. */
export async function redirectIfLoggedIn() {
    const s = await getSession();
    if (!s) return;

    const exists =
        s.role === "ADMIN"
            ? await prisma.admin.findUnique({ where: { id: s.id }, select: { id: true } })
            : await prisma.user.findUnique({ where: { id: s.id }, select: { id: true } });

    if (!exists) {
        await destroySession();
        return;
    }

    redirect(s.role === "ADMIN" ? "/admin" : "/user");
}